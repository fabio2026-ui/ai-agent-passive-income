"""
SQL Injection vulnerability detector.
"""

from typing import List, Optional
import re

from ..models import Endpoint, Vulnerability, Severity, Parameter
from .base import BaseVulnerability, VulnerabilityTest


class SQLInjectionDetector(BaseVulnerability):
    """Detects SQL Injection vulnerabilities."""
    
    SQL_KEYWORDS = [
        'select', 'insert', 'update', 'delete', 'drop', 'union',
        'where', 'from', 'table', 'database', 'exec', 'execute'
    ]
    
    SQL_PATTERNS = [
        r"(\%27)|(\')|(\-\-)|(\%23)|(#)",
        r"((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))",
        r"\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))",
        r"((\%27)|(\'))union",
        r"exec(\s|\+)+(s|x)p\w+",
        r"UNION\s+SELECT",
        r"INSERT\s+INTO",
        r"DELETE\s+FROM",
        r"DROP\s+TABLE"
    ]
    
    SUSPICIOUS_PARAM_NAMES = [
        'id', 'user_id', 'product_id', 'order_id', 'item_id',
        'search', 'query', 'filter', 'sort', 'where', 'sql'
    ]
    
    def __init__(self):
        super().__init__()
        self._init_tests()
    
    def _init_tests(self):
        """Initialize SQL injection test cases."""
        self.tests = [
            VulnerabilityTest(
                name="Classic SQL Injection",
                payloads=["' OR '1'='1", "' OR 1=1--", "'; DROP TABLE users--"],
                indicators=["sql error", "syntax error", "mysql", "postgresql", "oracle"],
                severity=Severity.CRITICAL
            ),
            VulnerabilityTest(
                name="Union-based SQL Injection",
                payloads=["' UNION SELECT * FROM users--", "' UNION SELECT null,null--"],
                indicators=["union", "select", "from"],
                severity=Severity.HIGH
            ),
            VulnerabilityTest(
                name="Time-based Blind SQL Injection",
                payloads=["'; WAITFOR DELAY '0:0:5'--", "' OR SLEEP(5)--"],
                indicators=["timeout", "delay"],
                severity=Severity.HIGH
            ),
        ]
    
    def get_name(self) -> str:
        return "SQL Injection"
    
    def get_description(self) -> str:
        return (
            "SQL Injection allows attackers to execute arbitrary SQL commands "
            "by injecting malicious SQL code through user inputs. This can lead "
            "to unauthorized data access, data modification, or complete database compromise."
        )
    
    def get_remediation(self) -> str:
        return (
            "1. Use parameterized queries (prepared statements) exclusively\n"
            "2. Use ORM frameworks that handle parameterization automatically\n"
            "3. Validate and sanitize all user inputs\n"
            "4. Apply principle of least privilege to database accounts\n"
            "5. Use WAF rules to detect SQL injection patterns\n"
            "6. Implement proper error handling without exposing SQL details"
        )
    
    def get_cwe_id(self) -> Optional[str]:
        return "CWE-89"
    
    def get_owasp_category(self) -> Optional[str]:
        return "A03:2021 - Injection"
    
    def _static_analysis(self, endpoint: Endpoint) -> List[Vulnerability]:
        """Analyze endpoint for potential SQL injection vulnerabilities."""
        vulnerabilities = []
        
        # Check parameters for suspicious patterns
        for param in endpoint.parameters:
            risk_score = self._calculate_param_risk(param)
            
            if risk_score >= 3:
                test = VulnerabilityTest(
                    name="High-Risk Parameter for SQLi",
                    payloads=[],
                    indicators=[],
                    severity=Severity.HIGH if risk_score >= 4 else Severity.MEDIUM
                )
                
                vuln = self._create_vulnerability(
                    endpoint=endpoint,
                    test=test,
                    parameter=param.name,
                    evidence=f"Parameter '{param.name}' in {param.location} has high SQL injection risk "
                            f"(score: {risk_score}/5) due to sensitive naming pattern"
                )
                vulnerabilities.append(vuln)
        
        # Check if GET requests have body parameters (unusual pattern)
        if endpoint.method.value == "GET" and endpoint.request_body:
            body_params = []
            if endpoint.request_body and 'schema' in endpoint.request_body:
                schema = endpoint.request_body['schema']
                if 'properties' in schema:
                    body_params = list(schema['properties'].keys())
            
            if body_params:
                test = self.tests[0]
                vuln = self._create_vulnerability(
                    endpoint=endpoint,
                    test=test,
                    evidence=f"GET request with body parameters detected: {body_params}. "
                            "This unusual pattern may indicate query parameter manipulation."
                )
                vulnerabilities.append(vuln)
        
        return vulnerabilities
    
    def _calculate_param_risk(self, param: Parameter) -> int:
        """Calculate risk score for a parameter."""
        risk = 0
        
        # Check parameter name against suspicious patterns
        param_name_lower = param.name.lower()
        for suspicious in self.SUSPICIOUS_PARAM_NAMES:
            if suspicious in param_name_lower:
                risk += 2
                break
        
        # String type parameters in query/path are higher risk
        if param.param_type == 'string' and param.location in ['query', 'path']:
            risk += 1
        
        # Required parameters are higher risk
        if param.required:
            risk += 1
        
        # Parameters without validation hints are higher risk
        if not any(keyword in param.description.lower() for keyword in ['validate', 'format', 'pattern']):
            risk += 1
        
        return min(risk, 5)  # Cap at 5
