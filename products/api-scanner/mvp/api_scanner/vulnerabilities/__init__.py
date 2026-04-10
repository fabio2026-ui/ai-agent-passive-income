"""
Vulnerability detection modules.
"""

from .base import BaseVulnerability, VulnerabilityTest
from .sqli import SQLInjectionDetector
from .xss import XSSDetector
from .auth_bypass import AuthBypassDetector

__all__ = [
    'BaseVulnerability',
    'VulnerabilityTest',
    'SQLInjectionDetector',
    'XSSDetector',
    'AuthBypassDetector',
]
