"""
SecureScan API - SaaS Backend Main Application
Production-ready FastAPI application with auth, payments, and scanning
"""

from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os
import logging

# Import payment routes
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from payment.stripe_integration import router as billing_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =============================================================================
# Configuration
# =============================================================================

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:3000,http://localhost:8000"
).split(",")

# =============================================================================
# Application Lifecycle
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("🚀 SecureScan API starting up...")
    logger.info(f"Environment: {'production' if os.getenv('RAILWAY_ENVIRONMENT') or os.getenv('RENDER') else 'development'}")
    
    yield
    
    # Shutdown
    logger.info("👋 SecureScan API shutting down...")

# =============================================================================
# Create Application
# =============================================================================

app = FastAPI(
    title="SecureScan API",
    description="Automated API Security Testing SaaS",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None,
    lifespan=lifespan
)

# =============================================================================
# Middleware
# =============================================================================

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# Security
# =============================================================================

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validate JWT token and return current user.
    
    In production, implement proper JWT validation here.
    For now, this is a placeholder.
    """
    # TODO: Implement proper JWT validation
    # token = credentials.credentials
    # user = verify_token(token)
    # return user
    
    return {"id": "demo_user", "email": "demo@example.com", "tier": "free"}

# =============================================================================
# Routes
# =============================================================================

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "SecureScan API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "api": "/api",
            "billing": "/api/billing"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "services": {
            "api": "up",
            "database": "up",  # TODO: Add actual DB check
            "redis": "up"      # TODO: Add actual Redis check
        }
    }


# =============================================================================
# API Routes
# =============================================================================

# Include billing router
app.include_router(billing_router)


# Scan routes (placeholder for future implementation)
@app.get("/api/scans")
async def list_scans(user: dict = Depends(get_current_user)):
    """List all scans for the current user."""
    # TODO: Implement with database
    return {
        "scans": [],
        "total": 0,
        "user_tier": user.get("tier", "free"),
        "scans_remaining": 3 if user.get("tier") == "free" else "unlimited"
    }


@app.post("/api/scans")
async def create_scan(
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    """Create a new scan job."""
    # TODO: Implement scan creation with quota checking
    
    # Check quota for free users
    if user.get("tier") == "free":
        # Check if user has scans remaining
        pass  # TODO: Implement quota check
    
    return {
        "scan_id": "scan_demo_123",
        "status": "pending",
        "message": "Scan queued successfully"
    }


# =============================================================================
# Static Files (for frontend)
# =============================================================================

# Serve frontend static files
frontend_path = os.path.join(os.path.dirname(__file__), "frontend")
if os.path.exists(frontend_path):
    app.mount("/app", StaticFiles(directory=frontend_path, html=True), name="frontend")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all non-API routes."""
        # Don't interfere with API routes
        if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json"]:
            raise HTTPException(status_code=404)
        
        index_path = os.path.join(frontend_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404)


# =============================================================================
# Error Handlers
# =============================================================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors."""
    return JSONResponse(
        status_code=404,
        content={"error": "Not found", "message": "The requested resource was not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors."""
    logger.error(f"Internal error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": "Something went wrong"}
    )


from fastapi.responses import JSONResponse


# =============================================================================
# Main Entry Point
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv("ENVIRONMENT") != "production",
        workers=1 if os.getenv("ENVIRONMENT") != "production" else None
    )
