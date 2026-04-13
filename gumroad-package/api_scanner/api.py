"""
FastAPI backend for the API Security Scanner.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional
import tempfile
import os
import uuid
from pathlib import Path

from api_scanner.parser import OpenAPIParser
from api_scanner.scanner import VulnerabilityScanner
from api_scanner.report import ReportGenerator
from api_scanner.models import ScanResult, Vulnerability, Severity, Endpoint


app = FastAPI(
    title="API Security Scanner",
    description="Scan your APIs for security vulnerabilities",
    version="0.1.0"
)

# Storage for scan jobs (in production, use Redis or database)
scan_jobs = {}


# Pydantic models for API
class ScanRequest(BaseModel):
    """Request model for scanning."""
    spec_content: Optional[str] = Field(None, description="OpenAPI spec as string")
    base_url: Optional[str] = Field(None, description="Base URL for active scanning")
    active_scan: bool = Field(False, description="Enable active scanning")


class ScanResponse(BaseModel):
    """Response model for scan job creation."""
    job_id: str
    status: str
    message: str


class ScanStatus(BaseModel):
    """Scan job status."""
    job_id: str
    status: str  # pending, running, completed, failed
    progress: int  # 0-100
    result: Optional[dict] = None


class VulnerabilityResult(BaseModel):
    """Vulnerability finding result."""
    id: str
    name: str
    description: str
    severity: str
    endpoint_path: str
    endpoint_method: str
    parameter: Optional[str]
    evidence: str
    remediation: str
    cwe_id: Optional[str]
    owasp_category: Optional[str]


class ScanResultResponse(BaseModel):
    """Complete scan result."""
    job_id: str
    target_url: str
    scan_duration: float
    endpoints_scanned: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    total_count: int
    vulnerabilities: List[VulnerabilityResult]


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "API Security Scanner",
        "version": "0.1.0",
        "docs": "/docs",
        "endpoints": {
            "upload": "POST /scan/upload",
            "scan": "POST /scan",
            "status": "GET /scan/{job_id}/status",
            "result": "GET /scan/{job_id}/result",
            "report": "GET /scan/{job_id}/report"
        }
    }


@app.post("/scan/upload", response_model=ScanResponse)
async def upload_and_scan(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    base_url: Optional[str] = None,
    active_scan: bool = False
):
    """
    Upload an OpenAPI spec file and start a scan.
    
    - **file**: OpenAPI specification file (YAML or JSON)
    - **base_url**: Optional base URL for active scanning
    - **active_scan**: Enable active scanning (makes HTTP requests)
    """
    # Validate file extension
    allowed_extensions = {'.yaml', '.yml', '.json'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {allowed_extensions}"
        )
    
    # Save uploaded file
    job_id = str(uuid.uuid4())
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, f"spec{file_ext}")
    
    content = await file.read()
    with open(file_path, 'wb') as f:
        f.write(content)
    
    # Create scan job
    scan_jobs[job_id] = {
        'status': 'pending',
        'progress': 0,
        'file_path': file_path,
        'base_url': base_url,
        'active_scan': active_scan,
        'result': None
    }
    
    # Start scan in background
    background_tasks.add_task(run_scan, job_id)
    
    return ScanResponse(
        job_id=job_id,
        status="pending",
        message="Scan job created successfully"
    )


@app.post("/scan", response_model=ScanResponse)
async def scan_spec(
    background_tasks: BackgroundTasks,
    request: ScanRequest
):
    """
    Scan an OpenAPI specification provided as content.
    
    - **spec_content**: OpenAPI spec as YAML/JSON string
    - **base_url**: Optional base URL for active scanning
    - **active_scan**: Enable active scanning
    """
    if not request.spec_content:
        raise HTTPException(status_code=400, detail="spec_content is required")
    
    # Save content to temp file
    job_id = str(uuid.uuid4())
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, "spec.yaml")
    
    with open(file_path, 'w') as f:
        f.write(request.spec_content)
    
    # Create scan job
    scan_jobs[job_id] = {
        'status': 'pending',
        'progress': 0,
        'file_path': file_path,
        'base_url': request.base_url,
        'active_scan': request.active_scan,
        'result': None
    }
    
    # Start scan in background
    background_tasks.add_task(run_scan, job_id)
    
    return ScanResponse(
        job_id=job_id,
        status="pending",
        message="Scan job created successfully"
    )


@app.get("/scan/{job_id}/status", response_model=ScanStatus)
async def get_scan_status(job_id: str):
    """Get the status of a scan job."""
    if job_id not in scan_jobs:
        raise HTTPException(status_code=404, detail="Scan job not found")
    
    job = scan_jobs[job_id]
    response = ScanStatus(
        job_id=job_id,
        status=job['status'],
        progress=job['progress']
    )
    
    if job['result']:
        response.result = {
            'total_vulnerabilities': job['result'].total_count,
            'critical': job['result'].critical_count,
            'high': job['result'].high_count,
            'medium': job['result'].medium_count,
            'low': job['result'].low_count
        }
    
    return response


@app.get("/scan/{job_id}/result", response_model=ScanResultResponse)
async def get_scan_result(job_id: str):
    """Get the detailed results of a completed scan."""
    if job_id not in scan_jobs:
        raise HTTPException(status_code=404, detail="Scan job not found")
    
    job = scan_jobs[job_id]
    
    if job['status'] != 'completed':
        raise HTTPException(
            status_code=400,
            detail=f"Scan is not completed. Current status: {job['status']}"
        )
    
    result = job['result']
    
    # Convert vulnerabilities to response model
    vuln_results = []
    for v in result.vulnerabilities:
        vuln_results.append(VulnerabilityResult(
            id=v.id,
            name=v.name,
            description=v.description,
            severity=v.severity.value,
            endpoint_path=v.endpoint.path,
            endpoint_method=v.endpoint.method.value,
            parameter=v.parameter,
            evidence=v.evidence,
            remediation=v.remediation,
            cwe_id=v.cwe_id,
            owasp_category=v.owasp_category
        ))
    
    return ScanResultResponse(
        job_id=job_id,
        target_url=result.target_url,
        scan_duration=result.scan_duration,
        endpoints_scanned=result.endpoints_scanned,
        critical_count=result.critical_count,
        high_count=result.high_count,
        medium_count=result.medium_count,
        low_count=result.low_count,
        total_count=result.total_count,
        vulnerabilities=vuln_results
    )


@app.get("/scan/{job_id}/report")
async def get_scan_report(job_id: str):
    """Download the HTML report for a completed scan."""
    if job_id not in scan_jobs:
        raise HTTPException(status_code=404, detail="Scan job not found")
    
    job = scan_jobs[job_id]
    
    if job['status'] != 'completed':
        raise HTTPException(
            status_code=400,
            detail=f"Scan is not completed. Current status: {job['status']}"
        )
    
    # Generate report
    temp_dir = tempfile.mkdtemp()
    report_path = os.path.join(temp_dir, f"report_{job_id}.html")
    
    generator = ReportGenerator()
    generator.generate(job['result'], report_path)
    
    return FileResponse(
        report_path,
        media_type='text/html',
        filename=f'security_report_{job_id}.html'
    )


@app.get("/detectors")
async def list_detectors():
    """List all available vulnerability detectors."""
    from api_scanner.vulnerabilities import (
        SQLInjectionDetector,
        XSSDetector,
        AuthBypassDetector
    )
    
    detectors = [
        SQLInjectionDetector(),
        XSSDetector(),
        AuthBypassDetector()
    ]
    
    return [
        {
            "name": d.get_name(),
            "description": d.get_description(),
            "cwe_id": d.get_cwe_id(),
            "owasp_category": d.get_owasp_category(),
            "remediation": d.get_remediation()
        }
        for d in detectors
    ]


def run_scan(job_id: str):
    """Background task to run the scan."""
    job = scan_jobs[job_id]
    
    try:
        # Update status
        job['status'] = 'running'
        job['progress'] = 10
        
        # Parse spec
        parser = OpenAPIParser(job['file_path'])
        endpoints = parser.parse()
        
        job['progress'] = 30
        
        # Run scan
        scanner = VulnerabilityScanner(
            base_url=job['base_url'],
            timeout=30
        )
        
        job['progress'] = 50
        
        result = scanner.scan_all(endpoints, active_scan=job['active_scan'])
        
        job['progress'] = 90
        
        # Store result
        job['result'] = result
        job['status'] = 'completed'
        job['progress'] = 100
        
    except Exception as e:
        job['status'] = 'failed'
        job['error'] = str(e)
        job['progress'] = 0


# Run with: uvicorn api_scanner.api:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
