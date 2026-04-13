"""
Stripe Payment Integration for API Security Scanner SaaS
Handles subscriptions, billing, and webhooks
"""

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
STRIPE_PRICE_PRO = os.getenv("STRIPE_PRICE_PRO")
STRIPE_PRICE_TEAM = os.getenv("STRIPE_PRICE_TEAM")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

router = APIRouter(prefix="/api/billing", tags=["billing"])


# =============================================================================
# Pydantic Models
# =============================================================================

class CreateCheckoutRequest(BaseModel):
    price_id: str
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class CustomerPortalRequest(BaseModel):
    return_url: Optional[str] = None


class SubscriptionResponse(BaseModel):
    id: str
    status: str
    price_id: Optional[str]
    current_period_end: Optional[int]
    cancel_at_period_end: bool


# =============================================================================
# Price Configuration
# =============================================================================

PRICING_TIERS = {
    "free": {
        "name": "Free",
        "price": 0,
        "scans_per_month": 3,
        "features": [
            "3 scans per month",
            "Basic vulnerability detection",
            "HTML report export",
            "Email support"
        ]
    },
    "pro": {
        "name": "Pro",
        "price_id": STRIPE_PRICE_PRO,
        "price": 29,
        "scans_per_month": "unlimited",
        "features": [
            "Unlimited scans",
            "Advanced vulnerability detection",
            "PDF & HTML reports",
            "CI/CD integration",
            "Webhook notifications",
            "Priority support"
        ]
    },
    "team": {
        "name": "Team",
        "price_id": STRIPE_PRICE_TEAM,
        "price": 99,
        "scans_per_month": "unlimited",
        "users": 10,
        "features": [
            "Everything in Pro",
            "Up to 10 team members",
            "Team dashboard",
            "SSO/SAML",
            "Custom integrations",
            "Dedicated support"
        ]
    }
}


# =============================================================================
# Helper Functions
# =============================================================================

def get_or_create_customer(user_id: str, email: str) -> stripe.Customer:
    """Get existing Stripe customer or create new one."""
    # In production, query your database for existing customer_id
    # For now, we'll create a new one each time (replace with DB lookup)
    
    try:
        customer = stripe.Customer.create(
            email=email,
            metadata={"user_id": user_id}
        )
        return customer
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating customer: {e}")
        raise HTTPException(status_code=400, detail=str(e))


def get_subscription_tier(price_id: str) -> Optional[str]:
    """Map Stripe price ID to tier name."""
    if price_id == STRIPE_PRICE_PRO:
        return "pro"
    elif price_id == STRIPE_PRICE_TEAM:
        return "team"
    return None


# =============================================================================
# API Endpoints
# =============================================================================

@router.get("/pricing")
async def get_pricing():
    """Get all pricing tiers and features."""
    return {
        "currency": "usd",
        "tiers": PRICING_TIERS,
        "publishable_key": os.getenv("STRIPE_PUBLISHABLE_KEY", "pk_test_...")
    }


@router.post("/checkout")
async def create_checkout_session(request: CreateCheckoutRequest):
    """
    Create a Stripe Checkout session for subscription.
    
    In production, get user_id from authenticated session/JWT
    """
    try:
        # Get or create customer (replace with actual user lookup)
        # customer = get_or_create_customer(user_id, user_email)
        
        checkout_session = stripe.checkout.Session.create(
            # customer=customer.id,  # Uncomment when auth is implemented
            line_items=[
                {
                    "price": request.price_id,
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=request.success_url or f"{FRONTEND_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=request.cancel_url or f"{FRONTEND_URL}/billing/cancel",
            metadata={
                # "user_id": user_id  # Add when auth is implemented
            }
        )
        
        return {"checkout_url": checkout_session.url}
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/portal")
async def create_customer_portal(request: CustomerPortalRequest):
    """
    Create Stripe Customer Portal session for managing subscription.
    
    Requires authenticated user with active subscription.
    """
    try:
        # In production, get customer_id from your database
        # customer_id = get_customer_id_from_db(user_id)
        
        # For demo purposes, return error
        # Remove this when auth is implemented
        raise HTTPException(
            status_code=400, 
            detail="Customer portal requires authenticated user with subscription"
        )
        
        # Uncomment when auth is implemented:
        # portal_session = stripe.billing_portal.Session.create(
        #     customer=customer_id,
        #     return_url=request.return_url or f"{FRONTEND_URL}/billing"
        # )
        # return {"portal_url": portal_session.url}
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe portal error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/subscription")
async def get_subscription_status():
    """
    Get current user's subscription status.
    
    In production, get user_id from authenticated session
    """
    # Placeholder - implement with actual auth
    return {
        "tier": "free",
        "status": "active",
        "scans_used_this_month": 0,
        "scans_limit": 3
    }


@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature")
):
    """
    Handle Stripe webhook events.
    
    Critical for:
    - Processing successful payments
    - Handling subscription changes
    - Updating user tiers
    """
    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle events
    event_type = event["type"]
    data_object = event["data"]["object"]
    
    logger.info(f"Stripe webhook received: {event_type}")
    
    if event_type == "checkout.session.completed":
        await handle_checkout_completed(data_object)
    
    elif event_type == "invoice.paid":
        await handle_invoice_paid(data_object)
    
    elif event_type == "invoice.payment_failed":
        await handle_payment_failed(data_object)
    
    elif event_type == "customer.subscription.deleted":
        await handle_subscription_cancelled(data_object)
    
    elif event_type == "customer.subscription.updated":
        await handle_subscription_updated(data_object)
    
    return JSONResponse(content={"status": "success"})


# =============================================================================
# Webhook Handlers
# =============================================================================

async def handle_checkout_completed(session: Dict[str, Any]):
    """Handle successful checkout completion."""
    customer_id = session.get("customer")
    subscription_id = session.get("subscription")
    # user_id = session.get("metadata", {}).get("user_id")
    
    logger.info(f"Checkout completed for customer {customer_id}")
    
    # TODO: Update user in database:
    # - Set subscription_id
    # - Set customer_id
    # - Update tier based on price_id
    # - Activate account
    
    # Example:
    # await db.users.update_one(
    #     {"_id": user_id},
    #     {
    #         "$set": {
    #             "stripe_customer_id": customer_id,
    #             "stripe_subscription_id": subscription_id,
    #             "tier": "pro",  # or "team"
    #             "subscription_status": "active"
    #         }
    #     }
    # )


async def handle_invoice_paid(invoice: Dict[str, Any]):
    """Handle successful invoice payment."""
    customer_id = invoice.get("customer")
    subscription_id = invoice.get("subscription")
    
    logger.info(f"Invoice paid for customer {customer_id}")
    
    # Update subscription status, extend access


async def handle_payment_failed(invoice: Dict[str, Any]):
    """Handle failed payment."""
    customer_id = invoice.get("customer")
    
    logger.warning(f"Payment failed for customer {customer_id}")
    
    # TODO:
    # - Send email notification
    # - Update subscription status to "past_due"
    # - Grace period handling


async def handle_subscription_cancelled(subscription: Dict[str, Any]):
    """Handle subscription cancellation."""
    customer_id = subscription.get("customer")
    
    logger.info(f"Subscription cancelled for customer {customer_id}")
    
    # TODO:
    # - Downgrade user to free tier
    # - Keep access until period end
    # - Send cancellation email


async def handle_subscription_updated(subscription: Dict[str, Any]):
    """Handle subscription updates (plan changes, etc)."""
    customer_id = subscription.get("customer")
    status = subscription.get("status")
    
    logger.info(f"Subscription updated for customer {customer_id}: {status}")
    
    # TODO: Update user tier based on new price_id


# =============================================================================
# Usage Quota Management
# =============================================================================

async def check_scan_quota(user_id: str) -> Dict[str, Any]:
    """
    Check if user can perform a scan based on their tier.
    
    Returns:
        {"allowed": bool, "remaining": int, "reset_date": str}
    """
    # In production, query database for user's tier and usage
    # For now, return free tier limits
    
    return {
        "allowed": True,  # Placeholder
        "remaining": 3,   # Placeholder
        "reset_date": "2024-02-01",
        "tier": "free"
    }


async def increment_scan_usage(user_id: str):
    """Increment user's scan count for the current month."""
    # TODO: Update database with new scan count
    pass


# =============================================================================
# Admin Endpoints
# =============================================================================

@router.get("/admin/stats")
async def get_billing_stats():
    """
    Get billing statistics (admin only).
    
    Returns MRR, churn, active subscriptions, etc.
    """
    try:
        # Get all subscriptions
        subscriptions = stripe.Subscription.list(limit=100)
        
        total_mrr = 0
        active_subscriptions = 0
        
        for sub in subscriptions.auto_paging_iter():
            if sub.status == "active":
                active_subscriptions += 1
                for item in sub.items.data:
                    # Calculate MRR (Monthly Recurring Revenue)
                    if item.price.recurring.interval == "month":
                        total_mrr += item.price.unit_amount * item.quantity / 100
                    elif item.price.recurring.interval == "year":
                        total_mrr += item.price.unit_amount * item.quantity / 100 / 12
        
        return {
            "mrr_usd": round(total_mrr, 2),
            "active_subscriptions": active_subscriptions,
            "currency": "usd"
        }
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe stats error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
