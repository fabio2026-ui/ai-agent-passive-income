"""
Authentication Bypass vulnerability detector.
"""

from typing import List, Optional, Dict, Any

from ..models import Endpoint, Vulnerability, Severity, Parameter
from .base import BaseVulnerability, VulnerabilityTest


class AuthBypassDetector(BaseVulnerability):
    """Detects Authentication and Authorization bypass vulnerabilities."""
    
    SENSITIVE_PATH_PATTERNS = [
        '/admin', '/administrator', '/manage', '/management',
        '/dashboard', '/control', '/panel', '/config',
        '/settings', '/system', '/internal', '/private',
        '/api/users', '/api/accounts', '/auth', '/login',
        '/password', '/reset', '/backup', '/export', '/import'
    ]
    
    SENSITIVE_METHODS = ['DELETE', 'PUT', 'PATCH', 'POST']
    
    BYPASS_TECHNIQUES = [
        {"name": "Parameter Pollution", "payload": "?admin=true&admin=false"},
        {"name": "Header Spoofing", "payload": "X-Original-URL: /admin"},
        {"name": "Method Override", "payload": "X-HTTP-Method-Override: DELETE"},
        {"name": "JWT None Algorithm", "payload": "alg: none"},
        {"name": "Path Traversal", "payload": "../../admin"},
        {"name": "IDOR Pattern", "payload": "user_id=other_user_id"},
    ]
    
    def __init__(self):
        super().__init__()
        self._init_tests()
    
    def _init_tests(self):
        """Initialize auth bypass test cases."""
        self.tests = [
            VulnerabilityTest(
                name="Missing Authentication",
                payloads=[],
                indicators=["200 OK", "unauthorized access", "bypass successful"],
                severity=Severity.CRITICAL
            ),
            VulnerabilityTest(
                name="Broken Object Level Authorization (BOLA/IDOR)",
                payloads=["?id=1", "?user_id=123", "?account=other"],
                indicators=["access other user's data", "cross-account"],
                severity=Severity.HIGH
            ),
            VulnerabilityTest(
                name="JWT Weakness",
                payloads=["eyJhbGciOiJub25lIn0", "alg=none"],
                indicators=["token accepted", "weak verification"],
                severity=Severity.CRITICAL
            ),
            VulnerabilityTest(
                name="Mass Assignment",
                payloads=['{"role": "admin", "is_admin": true}'],
                indicators=["privilege escalation", "role changed"],
                severity=Severity.HIGH
            ),
        ]
    
    def get_name(self) -> str:
        return "Authentication/Authorization Bypass"
    
    def get_description(self) -> str:
        return (
            "Authentication and Authorization bypass vulnerabilities allow attackers "
            "to access resources or perform actions without proper authentication "
            "or beyond their authorized privileges. This includes IDOR (Insecure "
            "Direct Object References), JWT weaknesses, and missing access controls."
        )
    
    def get_remediation(self) -> str:
        return (
            "1. Implement proper authentication on all endpoints\n"
            "2. Use role-based access control (RBAC) with deny-by-default\n"
            "3. Validate user permissions for every resource access\n"
            "4. Use cryptographically secure JWT implementations\n"
            "5. Implement proper CORS policies\n"
            "6. Use anti-CSRF tokens for state-changing operations\n"
            "7. Log and monitor authentication failures\n"
            "8. Implement rate limiting on authentication endpoints"
        )
    
    def get_cwe_id(self) -> Optional[str]:
        return "CWE-287"
    
    def get_owasp_category(self) -> Optional[str]:
        return "A01:2021 - Broken Access Control"
    
    def _static_analysis(self, endpoint: Endpoint) -> List[Vulnerability]:
        """Analyze endpoint for authentication bypass vulnerabilities."""
        vulnerabilities = []
        
        # Check if sensitive endpoint lacks security
        is_sensitive = self._is_sensitive_endpoint(endpoint)
        has_security = len(endpoint.security) > 0
        
        if is_sensitive and not has_security:
            test = VulnerabilityTest(
                name="Sensitive Endpoint Without Authentication",
                payloads=[],
                indicators=[],
                severity=Severity.CRITICAL
            )
            
            vuln = self._create_vulnerability(
                endpoint=endpoint,
                test=test,
                evidence=f"Sensitive endpoint {endpoint.path} ({endpoint.method.value}) "
                        "has no security requirements defined in OpenAPI spec."
            )
            vulnerabilities.append(vuln)
        
        # Check for IDOR-prone parameter patterns
        idor_params = self._find_idor_params(endpoint)
        for param in idor_params:
            test = VulnerabilityTest(
                name="Potential IDOR/BOLA",
                payloads=[],
                indicators=[],
                severity=Severity.HIGH
            )
            
            vuln = self._create_vulnerability(
                endpoint=endpoint,
                test=test,
                parameter=param.name,
                evidence=f"Parameter '{param.name}' may be vulnerable to IDOR attacks. "
                        "Direct object references without proper authorization checks "
                        "can allow access to other users' resources."
            )
            vulnerabilities.append(vuln)
        
        # Check DELETE/PUT on sensitive paths without explicit auth
        if endpoint.method.value in self.SENSITIVE_METHODS and not has_security:
            test = VulnerabilityTest(
                name="State-Changing Operation Without Auth",
                payloads=[],
                indicators=[],
                severity=Severity.CRITICAL
            )
            
            vuln = self._create_vulnerability(
                endpoint=endpoint,
                test=test,
                evidence=f"{endpoint.method.value} operation on {endpoint.path} lacks authentication. "
                        "State-changing operations must require authentication."
            )
            vulnerabilities.append(vuln)
        
        # Check for potential mass assignment
        if endpoint.method.value in ['POST', 'PUT', 'PATCH'] and endpoint.request_body:
            sensitive_fields = self._find_sensitive_fields(endpoint.request_body)
            if sensitive_fields:
                test = VulnerabilityTest(
                    name="Potential Mass Assignment",
                    payloads=[],
                    indicators=[],
                    severity=Severity.HIGH
                )
                
                vuln = self._create_vulnerability(
                    endpoint=endpoint,
                    test=test,
                    evidence=f"Request body contains sensitive fields ({sensitive_fields}) "
                            "that may be vulnerable to mass assignment attacks. "
                            "Clients might be able to modify privileged fields like 'role' or 'is_admin'."
                )
                vulnerabilities.append(vuln)
        
        # Check for weak security schemes
        if has_security:
            weak_auth = self._check_weak_security(endpoint)
            if weak_auth:
                test = VulnerabilityTest(
                    name="Weak Authentication Mechanism",
                    payloads=[],
                    indicators=[],
                    severity=Severity.MEDIUM
                )
                
                vuln = self._create_vulnerability(
                    endpoint=endpoint,
                    test=test,
                    evidence=f"Endpoint uses potentially weak authentication: {weak_auth}. "
                            "Consider using OAuth 2.0 or JWT with strong signing algorithms."
                )
                vulnerabilities.append(vuln)
        
        return vulnerabilities
    
    def _is_sensitive_endpoint(self, endpoint: Endpoint) -> bool:
        """Check if endpoint path is sensitive."""
        path_lower = endpoint.path.lower()
        return any(pattern in path_lower for pattern in self.SENSITIVE_PATH_PATTERNS)
    
    def _find_idor_params(self, endpoint: Endpoint) -> List[Parameter]:
        """Find parameters that may be vulnerable to IDOR."""
        idor_params = []
        
        idor_patterns = ['id', 'user_id', 'account_id', 'order_id', 'file_id', 
                        'doc_id', 'resource_id', 'uuid', 'guid']
        
        for param in endpoint.parameters:
            param_name_lower = param.name.lower()
            if any(pattern in param_name_lower for pattern in idor_patterns):
                # Check if it's in path or query (higher risk)
                if param.location in ['path', 'query']:
                    idor_params.append(param)
        
        return idor_params
    
    def _find_sensitive_fields(self, request_body: Dict[str, Any]) -> List[str]:
        """Find sensitive fields in request body that might be mass-assignable."""
        sensitive_fields = []
        sensitive_names = ['role', 'is_admin', 'is_staff', 'permissions', 
                          'privileges', 'password', 'secret', 'api_key']
        
        schema = request_body.get('schema', {})
        properties = schema.get('properties', {})
        
        for field_name in properties.keys():
            if any(sensitive in field_name.lower() for sensitive in sensitive_names):
                sensitive_fields.append(field_name)
        
        return sensitive_fields
    
    def _check_weak_security(self, endpoint: Endpoint) -> Optional[str]:
        """Check for weak security schemes."""
        # Simplified check - in real implementation, would analyze security schemes
        for sec in endpoint.security:
            if 'api_key' in sec and 'query' in str(sec):
                return "API key in query parameter"
            if 'basic' in str(sec).lower():
                return "Basic authentication without HTTPS enforcement"
        return None
