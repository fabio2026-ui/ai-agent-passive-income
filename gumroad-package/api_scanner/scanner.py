"""
Main vulnerability scanner orchestrator.
"""

import time
from typing import List, Optional, Dict, Any
import requests
import urllib.parse

from .models import Endpoint, ScanResult, Vulnerability, HTTPMethod
from .parser import OpenAPIParser
from .vulnerabilities import (
    SQLInjectionDetector,
    XSSDetector,
    AuthBypassDetector
)


class VulnerabilityScanner:
    """Main scanner that orchestrates vulnerability detection."""
    
    def __init__(
        self,
        base_url: Optional[str] = None,
        timeout: int = 30,
        verify_ssl: bool = True
    ):
        self.base_url = base_url or ""
        self.timeout = timeout
        self.verify_ssl = verify_ssl
        self.session = requests.Session()
        self.session.timeout = timeout
        self.session.verify = verify_ssl
        
        # Initialize detectors
        self.detectors = [
            SQLInjectionDetector(),
            XSSDetector(),
            AuthBypassDetector()
        ]
    
    def scan_all(
        self,
        endpoints: List[Endpoint],
        active_scan: bool = False
    ) -> ScanResult:
        """
        Scan all endpoints for vulnerabilities.
        
        Args:
            endpoints: List of endpoints to scan
            active_scan: If True, perform active scanning with actual requests
            
        Returns:
            ScanResult containing all findings
        """
        start_time = time.time()
        all_vulnerabilities: List[Vulnerability] = []
        
        for endpoint in endpoints:
            # Static analysis (always performed)
            static_findings = self._analyze_endpoint_static(endpoint)
            all_vulnerabilities.extend(static_findings)
            
            # Active scanning (optional, requires base_url)
            if active_scan and self.base_url:
                active_findings = self._analyze_endpoint_active(endpoint)
                all_vulnerabilities.extend(active_findings)
        
        scan_duration = time.time() - start_time
        
        return ScanResult(
            target_url=self.base_url,
            scan_duration=scan_duration,
            endpoints_scanned=len(endpoints),
            vulnerabilities=all_vulnerabilities
        )
    
    def _analyze_endpoint_static(self, endpoint: Endpoint) -> List[Vulnerability]:
        """Perform static analysis on an endpoint."""
        findings = []
        
        for detector in self.detectors:
            try:
                vulns = detector.detect(endpoint)
                findings.extend(vulns)
            except Exception as e:
                # Log error but continue scanning
                print(f"Warning: Detector {detector.get_name()} failed for {endpoint.path}: {e}")
        
        return findings
    
    def _analyze_endpoint_active(self, endpoint: Endpoint) -> List[Vulnerability]:
        """Perform active scanning by making actual requests."""
        findings = []
        
        try:
            # Build URL
            url = self._build_url(endpoint)
            
            # Prepare request
            method = endpoint.method.value
            headers = self._prepare_headers(endpoint)
            params = self._prepare_params(endpoint)
            data = self._prepare_body(endpoint)
            
            # Make request (safely)
            response = self._safe_request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                data=data
            )
            
            if response:
                # Analyze response with detectors
                response_data = {
                    'status_code': response.status_code,
                    'headers': dict(response.headers),
                    'body': response.text[:5000],  # Limit body size
                    'time': response.elapsed.total_seconds()
                }
                
                for detector in self.detectors:
                    try:
                        vulns = detector.detect(endpoint, response_data)
                        findings.extend(vulns)
                    except Exception as e:
                        print(f"Warning: Dynamic detection failed: {e}")
        
        except Exception as e:
            print(f"Warning: Active scanning failed for {endpoint.path}: {e}")
        
        return findings
    
    def _build_url(self, endpoint: Endpoint) -> str:
        """Build full URL from endpoint."""
        base = self.base_url.rstrip('/')
        path = endpoint.path
        
        # Replace path parameters with test values
        for param in endpoint.parameters:
            if param.location == 'path':
                placeholder = f'{{{param.name}}}'
                # Use test value based on parameter type
                test_value = self._get_test_value(param)
                path = path.replace(placeholder, str(test_value))
        
        return f"{base}{path}"
    
    def _prepare_headers(self, endpoint: Endpoint) -> Dict[str, str]:
        """Prepare request headers."""
        headers = {
            'Accept': 'application/json',
            'User-Agent': 'APISecurityScanner/0.1.0'
        }
        
        # Add any header parameters
        for param in endpoint.parameters:
            if param.location == 'header':
                headers[param.name] = self._get_test_value(param)
        
        return headers
    
    def _prepare_params(self, endpoint: Endpoint) -> Dict[str, str]:
        """Prepare query parameters."""
        params = {}
        
        for param in endpoint.parameters:
            if param.location == 'query':
                params[param.name] = self._get_test_value(param)
        
        return params
    
    def _prepare_body(self, endpoint: Endpoint) -> Optional[Dict[str, Any]]:
        """Prepare request body."""
        if not endpoint.request_body:
            return None
        
        body = {}
        schema = endpoint.request_body.get('schema', {})
        properties = schema.get('properties', {})
        
        for prop_name, prop_schema in properties.items():
            prop_type = prop_schema.get('type', 'string')
            body[prop_name] = self._get_test_value_by_type(prop_type, prop_name)
        
        return body
    
    def _get_test_value(self, param) -> str:
        """Get appropriate test value for a parameter."""
        return self._get_test_value_by_type(param.param_type, param.name)
    
    def _get_test_value_by_type(self, param_type: str, param_name: str) -> str:
        """Generate test value based on parameter type and name."""
        param_name_lower = param_name.lower()
        
        # Check for specific parameter names
        if 'id' in param_name_lower:
            return '12345'
        if 'email' in param_name_lower:
            return 'test@example.com'
        if 'name' in param_name_lower or 'user' in param_name_lower:
            return 'testuser'
        if 'date' in param_name_lower:
            return '2024-01-01'
        if 'password' in param_name_lower:
            return 'TestPass123!'
        
        # Based on type
        type_defaults = {
            'string': 'test_string',
            'integer': '42',
            'number': '3.14',
            'boolean': 'true',
            'array': '[]',
            'object': '{}'
        }
        
        return type_defaults.get(param_type, 'test_value')
    
    def _safe_request(
        self,
        method: str,
        url: str,
        headers: Dict[str, str],
        params: Dict[str, str],
        data: Optional[Dict[str, Any]]
    ) -> Optional[requests.Response]:
        """Make HTTP request with safety checks."""
        try:
            # Skip destructive operations in active scanning
            if method in ['DELETE']:
                return None
            
            # Make request
            if method == 'GET':
                return self.session.get(url, headers=headers, params=params)
            elif method == 'POST':
                return self.session.post(url, headers=headers, params=params, json=data)
            elif method == 'PUT':
                return self.session.put(url, headers=headers, params=params, json=data)
            elif method == 'PATCH':
                return self.session.patch(url, headers=headers, params=params, json=data)
            else:
                return None
                
        except requests.RequestException:
            return None
