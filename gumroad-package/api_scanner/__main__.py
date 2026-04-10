"""
CLI interface for the API Security Scanner.
"""

import click
import sys
from pathlib import Path

from . import __version__
from .parser import OpenAPIParser
from .scanner import VulnerabilityScanner
from .report import ReportGenerator


@click.group()
@click.version_option(version=__version__, prog_name="api-scanner")
def cli():
    """API Security Scanner - Scan your APIs for vulnerabilities."""
    pass


@cli.command()
@click.argument('spec_file', type=click.Path(exists=True, path_type=Path))
@click.option('--base-url', '-b', help='Base URL for active scanning')
@click.option('--output', '-o', type=click.Path(path_type=Path), 
              default='security_report.html',
              help='Output report file path (default: security_report.html)')
@click.option('--active/--no-active', default=False,
              help='Enable active scanning (makes actual HTTP requests)')
@click.option('--timeout', '-t', default=30, help='Request timeout in seconds')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def scan(spec_file: Path, base_url: str, output: Path, active: bool, 
         timeout: int, verbose: bool):
    """
    Scan an OpenAPI specification for security vulnerabilities.
    
    SPEC_FILE: Path to the OpenAPI specification file (YAML or JSON)
    
    Examples:
    
        # Basic scan with static analysis only
        api-scanner scan spec.yaml
        
        # Scan with active testing
        api-scanner scan spec.yaml --base-url https://api.example.com --active
        
        # Custom output path
        api-scanner scan spec.yaml -o my_report.html
    """
    if verbose:
        click.echo(f"🔍 API Security Scanner v{__version__}")
        click.echo(f"📄 Spec file: {spec_file}")
        if base_url:
            click.echo(f"🌐 Base URL: {base_url}")
        click.echo(f"📊 Output: {output}")
        click.echo("-" * 50)
    
    try:
        # Parse OpenAPI spec
        click.echo("📖 Parsing OpenAPI specification...")
        parser = OpenAPIParser(str(spec_file))
        endpoints = parser.parse()
        click.echo(f"✅ Found {len(endpoints)} endpoints")
        
        if verbose:
            for ep in endpoints:
                click.echo(f"   {ep.method.value} {ep.path}")
        
        # Run vulnerability scan
        click.echo("🔍 Scanning for vulnerabilities...")
        scanner = VulnerabilityScanner(
            base_url=base_url,
            timeout=timeout,
            verify_ssl=True
        )
        
        result = scanner.scan_all(endpoints, active_scan=active)
        
        click.echo("-" * 50)
        click.echo("📊 Scan Results:")
        click.echo(f"   Critical: {result.critical_count}")
        click.echo(f"   High:     {result.high_count}")
        click.echo(f"   Medium:   {result.medium_count}")
        click.echo(f"   Low:      {result.low_count}")
        click.echo(f"   Total:    {result.total_count}")
        click.echo(f"   Duration: {result.scan_duration:.2f}s")
        
        # Generate report
        click.echo(f"📝 Generating report...")
        generator = ReportGenerator()
        generator.generate(result, str(output))
        click.echo(f"✅ Report saved to: {output}")
        
        # Exit with error code if critical/high vulnerabilities found
        if result.critical_count > 0 or result.high_count > 0:
            click.echo("\n⚠️  Critical or High severity vulnerabilities found!")
            sys.exit(1)
        
        sys.exit(0)
        
    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        if verbose:
            import traceback
            traceback.print_exc()
        sys.exit(2)


@cli.command()
@click.argument('spec_file', type=click.Path(exists=True, path_type=Path))
def info(spec_file: Path):
    """Display information about an OpenAPI specification."""
    try:
        parser = OpenAPIParser(str(spec_file))
        endpoints = parser.parse()
        
        click.echo(f"📄 Specification: {spec_file}")
        click.echo(f"🌐 Base URL: {parser.base_url}")
        click.echo(f"📊 Total Endpoints: {len(endpoints)}")
        click.echo("")
        
        # Group by method
        methods = {}
        for ep in endpoints:
            method = ep.method.value
            methods[method] = methods.get(method, 0) + 1
        
        click.echo("📈 Methods:")
        for method, count in sorted(methods.items()):
            click.echo(f"   {method}: {count}")
        
        click.echo("")
        click.echo("📋 Endpoints:")
        for ep in endpoints:
            secured = "🔒" if ep.security else "🔓"
            click.echo(f"   {secured} {ep.method.value:6} {ep.path}")
            if ep.summary:
                click.echo(f"           └─ {ep.summary}")
                
    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        sys.exit(1)


@cli.command()
def detectors():
    """List available vulnerability detectors."""
    from .vulnerabilities import (
        SQLInjectionDetector,
        XSSDetector,
        AuthBypassDetector
    )
    
    detectors_list = [
        SQLInjectionDetector(),
        XSSDetector(),
        AuthBypassDetector()
    ]
    
    click.echo("🔍 Available Vulnerability Detectors")
    click.echo("=" * 50)
    
    for det in detectors_list:
        click.echo(f"\n📌 {det.get_name()}")
        click.echo(f"   CWE: {det.get_cwe_id() or 'N/A'}")
        click.echo(f"   OWASP: {det.get_owasp_category() or 'N/A'}")
        click.echo(f"   {det.get_description()[:100]}...")


def main():
    """Entry point for the CLI."""
    cli()


if __name__ == '__main__':
    main()
