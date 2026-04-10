# 🚀 Deployment Registry

## Active Deployments

### 1. Code Review Service ✅
| Field | Value |
|-------|-------|
| URL | https://code-review-service.yhongwb.workers.dev |
| Type | Cloudflare Worker |
| Deployed | 2026-04-10 02:10 GMT+8 |
| Status | Online |
| Source | /output/code-review-service-mvp/ |

**API Endpoints:**
- Health: `GET /health`
- Review: `POST /api/review`
- Batch: `POST /api/review/batch`
- Demo: `GET /demo`

### 2. Content Website ✅
| Field | Value |
|-------|-------|
| URL | https://fabio2026-ui.github.io/ai-agent-passive-income |
| Type | GitHub Pages |
| Status | Online |
| Content | 360+ files, 4 flagship guides |

---

## Pending Deployments

### 3. Breathing AI 🟡
| Field | Value |
|-------|-------|
| Status | Dependencies installed, build issues |
| Blocker | Stripe configuration needed |
| Location | /breath-ai-complete/ |

**Required for deployment:**
- [ ] Stripe API keys (pk_live, sk_live)
- [ ] Stripe Webhook secret
- [ ] Cloudflare KV namespaces
- [ ] Domain configuration

---

Last Updated: 2026-04-10
