#!/usr/bin/env python3
"""
Example usage of the API Security Scanner.
"""

from api_scanner import OpenAPIParser, VulnerabilityScanner, ReportGenerator


def main():
    """Run a sample scan."""
    print("=" * 60)
    print("API Security Scanner - Example Usage")
    print("=" * 60)
    
    # Parse the sample OpenAPI spec
    spec_path = "examples/sample_spec.yaml"
    print(f"\n📖 Parsing OpenAPI spec: {spec_path}")
    
    parser = OpenAPIParser(spec_path)
    endpoints = parser.parse()
    
    print(f"✅ Found {len(endpoints)} endpoints:")
    for ep in endpoints:
        secured = "🔒" if ep.security else "🔓"
        print(f"   {secured} {ep.method.value:6} {ep.path}")
    
    # Run vulnerability scan
    print("\n🔍 Running vulnerability scan...")
    scanner = VulnerabilityScanner()
    result = scanner.scan_all(endpoints)
    
    # Display results
    print("\n" + "=" * 60)
    print("SCAN RESULTS")
    print("=" * 60)
    
    print(f"\n📊 Summary:")
    print(f"   Critical: {result.critical_count}")
    print(f"   High:     {result.high_count}")
    print(f"   Medium:   {result.medium_count}")
    print(f"   Low:      {result.low_count}")
    print(f"   Total:    {result.total_count}")
    print(f"\n⏱️  Duration: {result.scan_duration:.2f}s")
    
    # Display vulnerabilities
    if result.vulnerabilities:
        print("\n🚨 Vulnerabilities Found:")
        print("-" * 60)
        
        for i, vuln in enumerate(result.vulnerabilities, 1):
            severity_emoji = {
                'critical': '🔴',
                'high': '🟠',
                'medium': '🟡',
                'low': '🟢',
                'info': '🔵'
            }.get(vuln.severity.value, '⚪')
            
            print(f"\n{i}. {severity_emoji} [{vuln.severity.value.upper()}] {vuln.name}")
            print(f"   Endpoint: {vuln.endpoint.method.value} {vuln.endpoint.path}")
            if vuln.parameter:
                print(f"   Parameter: {vuln.parameter}")
            print(f"   {vuln.description[:80]}...")
            if vuln.cwe_id:
                print(f"   CWE: {vuln.cwe_id}")
    else:
        print("\n✅ No vulnerabilities found!")
    
    # Generate report
    report_path = "example_report.html"
    print(f"\n📝 Generating report: {report_path}")
    
    generator = ReportGenerator()
    generator.generate(result, report_path)
    
    print(f"✅ Report saved!")
    print("\n" + "=" * 60)
    print("Done! Open example_report.html to view the full report.")
    print("=" * 60)


if __name__ == "__main__":
    main()
