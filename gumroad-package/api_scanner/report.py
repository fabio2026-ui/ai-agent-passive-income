"""
HTML report generator for scan results.
"""

from datetime import datetime
from typing import List, Dict, Any
import json

from .models import ScanResult, Vulnerability, Severity


class ReportGenerator:
    """Generates HTML security audit reports."""
    
    def __init__(self):
        self.template = self._get_html_template()
    
    def generate(self, result: ScanResult, output_path: str) -> str:
        """
        Generate an HTML report from scan results.
        
        Args:
            result: The scan result to report
            output_path: Path to save the HTML file
            
        Returns:
            Path to the generated report
        """
        html = self._render_template(result)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        return output_path
    
    def _render_template(self, result: ScanResult) -> str:
        """Render the HTML template with scan data."""
        # Severity colors
        severity_colors = {
            Severity.CRITICAL: '#dc2626',
            Severity.HIGH: '#ea580c',
            Severity.MEDIUM: '#ca8a04',
            Severity.LOW: '#16a34a',
            Severity.INFO: '#2563eb'
        }
        
        # Severity labels
        severity_labels = {
            Severity.CRITICAL: 'Critical',
            Severity.HIGH: 'High',
            Severity.MEDIUM: 'Medium',
            Severity.LOW: 'Low',
            Severity.INFO: 'Info'
        }
        
        # Build findings HTML
        findings_html = ""
        for i, vuln in enumerate(result.vulnerabilities, 1):
            color = severity_colors.get(vuln.severity, '#6b7280')
            label = severity_labels.get(vuln.severity, 'Unknown')
            
            findings_html += f"""
            <div class="finding">
                <div class="finding-header">
                    <div class="finding-title">
                        <span class="severity-badge" style="background: {color}">{label}</span>
                        <h3>{i}. {vuln.name}</h3>
                    </div>
                    <div class="finding-meta">
                        <span class="endpoint">{vuln.endpoint.method.value} {vuln.endpoint.path}</span>
                        {f'<span class="parameter">Param: {vuln.parameter}</span>' if vuln.parameter else ''}
                    </div>
                </div>
                <div class="finding-body">
                    <div class="section">
                        <h4>Description</h4>
                        <p>{vuln.description}</p>
                    </div>
                    <div class="section">
                        <h4>Evidence</h4>
                        <pre class="code">{vuln.evidence}</pre>
                    </div>
                    <div class="section">
                        <h4>Remediation</h4>
                        <pre class="remediation">{vuln.remediation}</pre>
                    </div>
                    {(f'<div class="tags"><span class="tag">CWE: {vuln.cwe_id}</span>' if vuln.cwe_id else '')}
                    {(f'<span class="tag">OWASP: {vuln.owasp_category}</span></div>' if vuln.owasp_category else '')}
                </div>
            </div>
            """
        
        if not findings_html:
            findings_html = """
            <div class="no-findings">
                <div class="check-icon">✓</div>
                <h3>No Vulnerabilities Found</h3>
                <p>No security issues were detected in the scanned API endpoints.</p>
            </div>
            """
        
        # Build summary HTML
        summary_html = f"""
        <div class="summary-cards">
            <div class="card critical">
                <div class="card-value">{result.critical_count}</div>
                <div class="card-label">Critical</div>
            </div>
            <div class="card high">
                <div class="card-value">{result.high_count}</div>
                <div class="card-label">High</div>
            </div>
            <div class="card medium">
                <div class="card-value">{result.medium_count}</div>
                <div class="card-label">Medium</div>
            </div>
            <div class="card low">
                <div class="card-value">{result.low_count}</div>
                <div class="card-label">Low</div>
            </div>
        </div>
        """
        
        # Format timestamp
        scan_time = result.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        duration = f"{result.scan_duration:.2f}s"
        
        # Replace placeholders in template
        html = self.template.replace('{{TITLE}}', 'API Security Scan Report')
        html = html.replace('{{SCAN_DATE}}', scan_time)
        html = html.replace('{{TARGET_URL}}', result.target_url or 'N/A')
        html = html.replace('{{SCAN_DURATION}}', duration)
        html = html.replace('{{ENDPOINTS_SCANNED}}', str(result.endpoints_scanned))
        html = html.replace('{{TOTAL_VULNERABILITIES}}', str(result.total_count))
        html = html.replace('{{SUMMARY}}', summary_html)
        html = html.replace('{{FINDINGS}}', findings_html)
        
        return html
    
    def _get_html_template(self) -> str:
        """Return the HTML report template."""
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .scan-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.2);
        }
        
        .scan-info-item {
            display: flex;
            flex-direction: column;
        }
        
        .scan-info-label {
            font-size: 0.85rem;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .scan-info-value {
            font-size: 1.1rem;
            font-weight: 600;
            margin-top: 5px;
        }
        
        .summary-section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .summary-section h2 {
            margin-bottom: 20px;
            color: #444;
        }
        
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
        }
        
        .card {
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.2s;
        }
        
        .card:hover {
            transform: translateY(-3px);
        }
        
        .card.critical {
            background: linear-gradient(135deg, #ff6b6b, #dc2626);
            color: white;
        }
        
        .card.high {
            background: linear-gradient(135deg, #ffa502, #ea580c);
            color: white;
        }
        
        .card.medium {
            background: linear-gradient(135deg, #ffd700, #ca8a04);
            color: white;
        }
        
        .card.low {
            background: linear-gradient(135deg, #2ed573, #16a34a);
            color: white;
        }
        
        .card-value {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .card-label {
            font-size: 1rem;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .findings-section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .findings-section h2 {
            margin-bottom: 25px;
            color: #444;
        }
        
        .finding {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            margin-bottom: 20px;
            overflow: hidden;
            transition: box-shadow 0.2s;
        }
        
        .finding:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .finding-header {
            background: #f9fafb;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .finding-title {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
        }
        
        .finding-title h3 {
            font-size: 1.2rem;
            color: #1f2937;
        }
        
        .severity-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: white;
        }
        
        .finding-meta {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            font-size: 0.9rem;
            color: #6b7280;
        }
        
        .endpoint {
            font-family: 'Monaco', 'Menlo', monospace;
            background: #e5e7eb;
            padding: 2px 8px;
            border-radius: 4px;
        }
        
        .parameter {
            color: #4b5563;
        }
        
        .finding-body {
            padding: 20px;
        }
        
        .section {
            margin-bottom: 20px;
        }
        
        .section:last-child {
            margin-bottom: 0;
        }
        
        .section h4 {
            font-size: 0.9rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        
        .section p {
            color: #374151;
        }
        
        pre {
            background: #1f2937;
            color: #e5e7eb;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        
        pre.remediation {
            background: #f0fdf4;
            color: #166534;
            border: 1px solid #bbf7d0;
        }
        
        pre.code {
            background: #fef2f2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }
        
        .tags {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .tag {
            background: #e0e7ff;
            color: #3730a3;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .no-findings {
            text-align: center;
            padding: 60px 20px;
        }
        
        .check-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #2ed573, #16a34a);
            color: white;
            font-size: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }
        
        .no-findings h3 {
            color: #16a34a;
            font-size: 1.5rem;
            margin-bottom: 10px;
        }
        
        .no-findings p {
            color: #6b7280;
        }
        
        footer {
            text-align: center;
            padding: 30px;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            header h1 {
                font-size: 1.8rem;
            }
            
            .summary-cards {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .card-value {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔒 {{TITLE}}</h1>
            <p>Comprehensive security analysis of API endpoints</p>
            <div class="scan-info">
                <div class="scan-info-item">
                    <span class="scan-info-label">Scan Date</span>
                    <span class="scan-info-value">{{SCAN_DATE}}</span>
                </div>
                <div class="scan-info-item">
                    <span class="scan-info-label">Target URL</span>
                    <span class="scan-info-value">{{TARGET_URL}}</span>
                </div>
                <div class="scan-info-item">
                    <span class="scan-info-label">Duration</span>
                    <span class="scan-info-value">{{SCAN_DURATION}}</span>
                </div>
                <div class="scan-info-item">
                    <span class="scan-info-label">Endpoints Scanned</span>
                    <span class="scan-info-value">{{ENDPOINTS_SCANNED}}</span>
                </div>
                <div class="scan-info-item">
                    <span class="scan-info-label">Total Findings</span>
                    <span class="scan-info-value">{{TOTAL_VULNERABILITIES}}</span>
                </div>
            </div>
        </header>
        
        <section class="summary-section">
            <h2>Vulnerability Summary</h2>
            {{SUMMARY}}
        </section>
        
        <section class="findings-section">
            <h2>Detailed Findings</h2>
            {{FINDINGS}}
        </section>
        
        <footer>
            <p>Generated by API Security Scanner v0.1.0</p>
        </footer>
    </div>
</body>
</html>"""
