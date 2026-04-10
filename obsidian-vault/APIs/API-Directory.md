# 🌐 API Directory

## Code Review Service
**Base URL:** `https://code-review-service.yhongwb.workers.dev`

### Endpoints

#### Health Check
```http
GET /health
```

#### Single File Review
```http
POST /api/review
Content-Type: application/json

{
  "code": "def hello():\n    print('world')",
  "language": "python"
}
```

#### Batch Review
```http
POST /api/review/batch
Content-Type: application/json

{
  "files": [
    {"filename": "app.py", "code": "..."},
    {"filename": "utils.py", "code": "..."}
  ]
}
```

#### Demo Page
```http
GET /demo
```

### Response Format
```json
{
  "summary": {
    "totalIssues": 5,
    "critical": 1,
    "warnings": 3,
    "suggestions": 1
  },
  "categories": {
    "security": [...],
    "performance": [...],
    "style": [...]
  }
}
```

---

## Breathing AI (When Deployed)
**Base URL:** TBD

### Planned Endpoints
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Stripe webhook handler
- `GET /api/health` - Health check
- `WS /api/duo/sync` - WebRTC signaling

---
Last Updated: 2026-04-10
