"""
Base vulnerability detection class.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import re

from ..models import Endpoint, Vulnerability, Severity, Parameter


class VulnerabilityTest:
    """A single vulnerability test case."""
    
    def __init__(
        self,
        name: str,
        payloads: List[str],
        indicators: List[str],
        severity: Severity
    ):
        self.name = name
        self.payloads = payloads
        self.indicators = indicators  # Response indicators of vulnerability
        self.severity = severity


class BaseVulnerability(ABC):
    """Base class for vulnerability detectors."""
    
    def __init__(self):
        self.vulnerabilities: List[Vulnerability] = []
        self.tests: List[VulnerabilityTest] = []
    
    @abstractmethod
    def get_name(self) -> str:
        """Return the vulnerability name."""
        pass
    
    @abstractmethod
    def get_description(self) -> str:
        """Return the vulnerability description."""
        pass
    
    @abstractmethod
    def get_remediation(self) -> str:
        """Return remediation advice."""
        pass
    
    @abstractmethod
    def get_cwe_id(self) -> Optional[str]:
        """Return CWE ID if applicable."""
        pass
    
    @abstractmethod
    def get_owasp_category(self) -> Optional[str]:
        """Return OWASP category if applicable."""
        pass
    
    def detect(
        self,
        endpoint: Endpoint,
        response: Optional[Dict[str, Any]] = None
    ) -> List[Vulnerability]:
        """
        Detect vulnerabilities in an endpoint.
        
        Args:
            endpoint: The API endpoint to analyze
            response: Optional actual HTTP response for analysis
            
        Returns:
            List of detected vulnerabilities
        """
        vulnerabilities = []
        
        # Static analysis of endpoint definition
        static_findings = self._static_analysis(endpoint)
        vulnerabilities.extend(static_findings)
        
        # Dynamic analysis if response provided
        if response:
            dynamic_findings = self._dynamic_analysis(endpoint, response)
            vulnerabilities.extend(dynamic_findings)
        
        return vulnerabilities
    
    @abstractmethod
    def _static_analysis(self, endpoint: Endpoint) -> List[Vulnerability]:
        """Perform static analysis on endpoint definition."""
        pass
    
    def _dynamic_analysis(
        self,
        endpoint: Endpoint,
        response: Dict[str, Any]
    ) -> List[Vulnerability]:
        """Perform dynamic analysis on response (optional)."""
        return []
    
    def _create_vulnerability(
        self,
        endpoint: Endpoint,
        test: VulnerabilityTest,
        parameter: Optional[str] = None,
        evidence: str = ""
    ) -> Vulnerability:
        """Create a vulnerability finding."""
        return Vulnerability(
            id=f"{self.get_name().lower().replace(' ', '-')}-{hash(endpoint.path + str(parameter)) % 10000:04d}",
            name=self.get_name(),
            description=self.get_description(),
            severity=test.severity,
            endpoint=endpoint,
            parameter=parameter,
            evidence=evidence or f"Detected using test: {test.name}",
            remediation=self.get_remediation(),
            cwe_id=self.get_cwe_id(),
            owasp_category=self.get_owasp_category()
        )
    
    def _check_indicators(self, content: str, indicators: List[str]) -> List[str]:
        """Check if any indicators are present in content."""
        found = []
        content_lower = content.lower()
        for indicator in indicators:
            if indicator.lower() in content_lower:
                found.append(indicator)
        return found
