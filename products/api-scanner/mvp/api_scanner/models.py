"""
Data models for the API Security Scanner.
"""

from enum import Enum
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime


class Severity(Enum):
    """Vulnerability severity levels."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class HTTPMethod(Enum):
    """HTTP methods."""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"


@dataclass
class Parameter:
    """API endpoint parameter."""
    name: str
    location: str  # query, path, header, body
    param_type: str = "string"
    required: bool = False
    description: str = ""


@dataclass
class Endpoint:
    """API endpoint representation."""
    path: str
    method: HTTPMethod
    summary: str = ""
    description: str = ""
    parameters: List[Parameter] = field(default_factory=list)
    request_body: Optional[Dict[str, Any]] = None
    responses: Dict[int, Any] = field(default_factory=dict)
    security: List[Dict[str, List[str]]] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)


@dataclass
class Vulnerability:
    """Vulnerability finding."""
    id: str
    name: str
    description: str
    severity: Severity
    endpoint: Endpoint
    parameter: Optional[str] = None
    evidence: str = ""
    remediation: str = ""
    cwe_id: Optional[str] = None
    owasp_category: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class ScanResult:
    """Complete scan result."""
    target_url: str
    scan_duration: float
    endpoints_scanned: int
    vulnerabilities: List[Vulnerability] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)
    
    def get_by_severity(self, severity: Severity) -> List[Vulnerability]:
        """Get vulnerabilities by severity."""
        return [v for v in self.vulnerabilities if v.severity == severity]
    
    @property
    def critical_count(self) -> int:
        return len(self.get_by_severity(Severity.CRITICAL))
    
    @property
    def high_count(self) -> int:
        return len(self.get_by_severity(Severity.HIGH))
    
    @property
    def medium_count(self) -> int:
        return len(self.get_by_severity(Severity.MEDIUM))
    
    @property
    def low_count(self) -> int:
        return len(self.get_by_severity(Severity.LOW))
    
    @property
    def total_count(self) -> int:
        return len(self.vulnerabilities)
