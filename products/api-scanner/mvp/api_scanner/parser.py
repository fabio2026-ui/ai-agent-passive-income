"""
OpenAPI specification parser.
"""

import json
import yaml
from typing import List, Dict, Any, Optional
from pathlib import Path

from .models import Endpoint, Parameter, HTTPMethod


class OpenAPIParser:
    """Parser for OpenAPI 3.0 specifications."""
    
    def __init__(self, spec_path: str):
        self.spec_path = Path(spec_path)
        self.spec: Dict[str, Any] = {}
        self.base_url: str = ""
        
    def parse(self) -> List[Endpoint]:
        """
        Parse the OpenAPI specification file.
        
        Returns:
            List of Endpoint objects extracted from the spec.
        """
        self._load_spec()
        self._extract_base_url()
        return self._extract_endpoints()
    
    def _load_spec(self) -> None:
        """Load the spec file (YAML or JSON)."""
        with open(self.spec_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if self.spec_path.suffix in ['.yaml', '.yml']:
            self.spec = yaml.safe_load(content)
        else:
            self.spec = json.loads(content)
    
    def _extract_base_url(self) -> None:
        """Extract the base URL from the spec."""
        if 'servers' in self.spec and self.spec['servers']:
            self.base_url = self.spec['servers'][0].get('url', '')
        else:
            self.base_url = '/'
            
        # Handle variables in server URL
        if 'servers' in self.spec and self.spec['servers']:
            server = self.spec['servers'][0]
            if 'variables' in server:
                for var_name, var_config in server['variables'].items():
                    default_value = var_config.get('default', '')
                    self.base_url = self.base_url.replace(f'{{{var_name}}}', default_value)
    
    def _extract_endpoints(self) -> List[Endpoint]:
        """Extract all endpoints from the spec."""
        endpoints = []
        
        paths = self.spec.get('paths', {})
        for path, path_item in paths.items():
            for method_name in ['get', 'post', 'put', 'delete', 'patch', 'head', 'options']:
                if method_name in path_item:
                    operation = path_item[method_name]
                    endpoint = self._create_endpoint(
                        path=path,
                        method=getattr(HTTPMethod, method_name.upper()),
                        operation=operation,
                        path_params=path_item.get('parameters', [])
                    )
                    endpoints.append(endpoint)
        
        return endpoints
    
    def _create_endpoint(
        self,
        path: str,
        method: HTTPMethod,
        operation: Dict[str, Any],
        path_params: List[Dict[str, Any]]
    ) -> Endpoint:
        """Create an Endpoint from operation data."""
        # Merge path-level and operation-level parameters
        all_params = path_params + operation.get('parameters', [])
        parameters = self._parse_parameters(all_params)
        
        # Extract request body
        request_body = None
        if 'requestBody' in operation:
            request_body = self._parse_request_body(operation['requestBody'])
        
        # Extract security requirements
        security = operation.get('security', self.spec.get('security', []))
        
        return Endpoint(
            path=path,
            method=method,
            summary=operation.get('summary', ''),
            description=operation.get('description', ''),
            parameters=parameters,
            request_body=request_body,
            responses=operation.get('responses', {}),
            security=security,
            tags=operation.get('tags', [])
        )
    
    def _parse_parameters(self, params: List[Dict[str, Any]]) -> List[Parameter]:
        """Parse parameter definitions."""
        parameters = []
        
        for param in params:
            if '$ref' in param:
                # Handle references (simplified - in production, resolve refs)
                param = self._resolve_ref(param['$ref'])
            
            if param:
                parameters.append(Parameter(
                    name=param.get('name', ''),
                    location=param.get('in', 'query'),
                    param_type=param.get('schema', {}).get('type', 'string'),
                    required=param.get('required', False),
                    description=param.get('description', '')
                ))
        
        return parameters
    
    def _parse_request_body(self, request_body: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse request body definition."""
        if 'content' in request_body:
            # Prioritize JSON content
            if 'application/json' in request_body['content']:
                return request_body['content']['application/json']
            # Fall back to first available content type
            return list(request_body['content'].values())[0]
        return None
    
    def _resolve_ref(self, ref: str) -> Optional[Dict[str, Any]]:
        """Resolve a reference (simplified implementation)."""
        if not ref.startswith('#/'):
            return None
        
        parts = ref[2:].split('/')
        current = self.spec
        
        for part in parts:
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return None
        
        return current
    
    def get_security_schemes(self) -> Dict[str, Any]:
        """Get security schemes defined in the spec."""
        components = self.spec.get('components', {})
        return components.get('securitySchemes', {})
