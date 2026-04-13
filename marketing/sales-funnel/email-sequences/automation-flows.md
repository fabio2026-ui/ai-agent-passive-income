# Automation Flow Diagrams

## Lead Magnet Funnel Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LEAD MAGNET FUNNEL FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

TRAFFIC SOURCES
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Facebook │  │ Google   │  │ Email    │  │ Organic  │
│   Ads    │  │   Ads    │  │   List   │  │  Search  │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │             │
     └─────────────┴─────────────┴─────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  LANDING PAGE                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Headline: Get [Lead Magnet Name]               │   │
│  │  Subhead: [Specific benefit in time frame]      │   │
│  │                                                 │   │
│  │  [Benefit 1]  [Benefit 2]  [Benefit 3]         │   │
│  │                                                 │   │
│  │  ┌─────────────────────────┐                   │   │
│  │  │ Name: [____________]    │                   │   │
│  │  │ Email: [____________]   │                   │   │
│  │  │ [   GET INSTANT ACCESS → ]                │   │
│  │  └─────────────────────────┘                   │   │
│  │                                                 │   │
│  │  "Join 10,000+ [audience] who..."             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                   │
              [SUBMITS FORM]
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              CONFIRMATION EMAIL (if double opt-in)      │
│  Subject: "Confirm: Get your [Lead Magnet]"            │
│  [CONFIRM BUTTON]                                       │
└─────────────────────────────────────────────────────────┘
                   │
              [CLICKS CONFIRM]
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              THANK YOU PAGE                             │
│  "Check your email for your download!"                  │
│                                                         │
│  [Optional: Tripwire Offer / Upsell]                   │
│  "While you wait, get [Product] for 50% off"           │
└─────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              DELIVERY EMAIL                             │
│  Subject: "Here's your [Lead Magnet] 🎁"               │
│                                                         │
│  "Thanks! Here's your download: [LINK]"                │
│  "P.S. Watch for more tips tomorrow..."                │
└─────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              WELCOME SEQUENCE TRIGGERED                 │
│  Day 0: Welcome + Value                                 │
│  Day 1: Education + Story                               │
│  Day 2: Social Proof + Soft Pitch                       │
│  Day 3: Direct Pitch                                    │
└─────────────────────────────────────────────────────────┘

CONVERSION METRICS
┌─────────────────────────────────────────────────────────┐
│ Landing Page Views:    X,XXX                            │
│ Opt-in Rate:           XX%  (Target: 30%+)             │
│ Confirmation Rate:     XX%  (Target: 80%+)             │
│ Email Open Rate:       XX%  (Target: 25%+)             │
│ Lead-to-Customer:      X%   (Target: 2-5%)             │
└─────────────────────────────────────────────────────────┘
```

---

## Webinar Funnel Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WEBINAR FUNNEL FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

PRE-LAUNCH (Days -7 to -1)
┌─────────────────────────────────────────────────────────────────────────┐
│  Ad Campaign → Registration Page → Reminder Sequence                     │
│                                                                         │
│  Traffic ───→  Sign Up  ──────→  Email Reminders                        │
│                for Webinar                │                             │
│                                           │                             │
│                                           ▼                             │
│                              ┌──────────────────────────┐              │
│                              │ Day -3: "Coming up..."   │              │
│                              │ Day -1: "Tomorrow!"      │              │
│                              │ Day 0: "Starting in 1hr" │              │
│                              └──────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         WEBINAR EVENT                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │  [LIVE WEBINAR]                                                  │  │
│  │                                                                  │  │
│  │  0-5 min:  Introduction & Hook                                   │  │
│  │  5-15 min: Problem Agitation                                     │  │
│  │  15-35 min: Content/Training                                     │  │
│  │  35-45 min: Solution Introduction                                │  │
│  │  45-50 min: Offer & Bonuses                                      │  │
│  │  50-60 min: Q&A + Urgency                                        │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│              ┌─────────────────────┼─────────────────────┐             │
│              ▼                     ▼                     ▼             │
│        [ATTENDED]            [REGISTERED               [NO SHOW]       │
│              │                BUT NO SHOW]                    │             │
│              ▼                     │                     │             │
│    ┌─────────────────┐            ▼                     ▼             │
│    │ Replay + Offer  │    ┌──────────────┐    ┌──────────────┐       │
│    │ (24-48hrs)      │    │ Replay Email │    │ "We missed   │       │
│    │                 │    │ + Offer      │    │ you" + Next  │       │
│    │ [BUY BUTTON]    │    │              │    │ Webinar      │       │
│    └─────────────────┘    └──────────────┘    └──────────────┘       │
│              │                     │                     │             │
│              └─────────────────────┴─────────────────────┘             │
│                                    │                                   │
│                                    ▼                                   │
│                           ┌─────────────────┐                          │
│                           │  PURCHASED?     │                          │
│                           └────────┬────────┘                          │
│                       YES /        │        \ NO                      │
│                          /         │         \                        │
│                         ▼          ▼          ▼                        │
│              ┌──────────────┐ ┌──────────┐ ┌──────────────┐           │
│              │ Onboarding   │ │ Cart     │ │ Nurture      │           │
│              │ Sequence     │ │ Abandon  │ │ Sequence     │           │
│              │              │ │ (1hr,24h)│ │              │           │
│              └──────────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────────────────────┘

CONVERSION METRICS
┌─────────────────────────────────────────────────────────────────────────┐
│ Registrations:          X,XXX                                           │
│ Show-up Rate:           XX%  (Target: 30-50%)                          │
│ Attended Live:          XXX                                           │
│ Replay Views:           XXX                                           │
│ Conversion Rate:        X%   (Target: 5-15%)                           │
│ Revenue per Registrant: $XX                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## E-commerce Sales Funnel

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    E-COMMERCE SALES FUNNEL                              │
└─────────────────────────────────────────────────────────────────────────┘

AWARENESS STAGE
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│   Social   │  │   Google   │  │  Influencer │  │    SEO     │
│    Ads     │  │    Ads     │  │   Marketing │  │   Content  │
└─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
      │               │               │               │
      └───────────────┴───────────────┴───────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PRODUCT/COLLECTION PAGE                              │
│  [Product Images] [Description] [Price] [Add to Cart] [Reviews]        │
└─────────────────────────────────────────────────────────────────────────┘
                      │
              [ADD TO CART]
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       CART PAGE                                         │
│  [Product] [Qty] [Price]                    │                         │
│  [Product] [Qty] [Price] → [Checkout] OR →  │ → [Exit Intent Popup]   │
│  [Product] [Qty] [Price]   [Continue Shop]  │   "Wait! 10% off"       │
│                              │              │                         │
└──────────────────────────────┼──────────────┘                         │
                               │                                        │
                      [ABANDONED?] ─────────────────────────────────────┘
                               │
                        [PROCEEDS]
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       CHECKOUT PAGE                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Shipping Info → Payment Info → Order Review → Confirmation     │   │
│  │                                                                 │   │
│  │  Progress: [====>    ] Step 2 of 4                              │   │
│  │                                                                 │   │
│  │  Trust Badges: 🔒 Secure   ✓ Money Back   🚚 Free Shipping     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                      [ABANDONED?]
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
    ┌─────────────────────┐        ┌─────────────────────┐
    │  ABANDONED CART     │        │  ORDER CONFIRMED    │
    │  SEQUENCE           │        │  ─────────────────  │
    │                     │        │                     │
    │  1hr: "Forgot       │        │  Thank You Email    │
    │       something?"   │        │  Order Details      │
    │                     │        │  Delivery Tracking  │
    │  24hr: "10% off     │        │                     │
    │        expires"     │        │  → Post-Purchase    │
    │                     │        │    Sequence         │
    │  48hr: "Last chance"│        │                     │
    └─────────────────────┘        └─────────────────────┘
                                              │
                                              ▼
                                ┌─────────────────────────┐
                                │  POST-PURCHASE SEQUENCE │
                                │                         │
                                │  Day 1: Shipping info   │
                                │  Day 3: How to use      │
                                │  Day 7: Review request  │
                                │  Day 14: Cross-sell     │
                                │  Day 30: Replenish      │
                                └─────────────────────────┘

KEY METRICS
┌─────────────────────────────────────────────────────────────────────────┐
│ Add to Cart Rate:       X%   (Target: 5-10%)                           │
│ Cart Abandonment Rate:  XX%  (Target: <70%)                            │
│ Checkout Completion:    XX%  (Target: 50%+)                            │
│ Recovery Email Open:    XX%  (Target: 40%+)                            │
│ Recovery Conversion:    X%   (Target: 10%+)                            │
│ Repeat Purchase Rate:   X%   (Target: 25%+)                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## SaaS Trial Funnel

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SaaS FREE TRIAL FUNNEL                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────────┐     ┌──────────────┐
│ Content  │────▶│ Landing Page │────▶│  Sign Up     │
│  Marketing     │  (Demo video) │     │  (Free Trial)│
└──────────┘     └──────────────┘     └──────┬───────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     ONBOARDING SEQUENCE (Day 0-14)                      │
│                                                                         │
│  Day 0: Welcome + Quick Win Setup                                       │
│  Day 1: Feature Highlight #1                                            │
│  Day 2: Tips from Power Users                                           │
│  Day 3: Feature Highlight #2                                            │
│  Day 4: Case Study                                                      │
│  Day 5: Feature Highlight #3                                            │
│  Day 7: Check-in: "How's it going?"                                     │
│  Day 10: Advanced Tips                                                  │
│  Day 12: Upgrade Prompt (soft)                                          │
│  Day 14: Trial Expires Soon (urgent)                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
            ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
            │   ENGAGED    │        │   MODERATE   │        │   INACTIVE   │
            │   (High use) │        │   (Low use)  │        │   (No login) │
            └──────┬───────┘        └──────┬───────┘        └──────┬───────┘
                   │                       │                       │
                   ▼                       ▼                       ▼
           ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
           │ Sales Call   │        │ Re-engagement│        │ Win-back     │
           │ Offer        │        │ Sequence     │        │ + Extension  │
           └──────────────┘        └──────────────┘        └──────────────┘
                   │                       │                       │
                   └───────────────────────┼───────────────────────┘
                                           │
                                           ▼
                          ┌─────────────────────────────────┐
                          │        CONVERSION PATH          │
                          │                                 │
                          │   ┌─────────────────────┐      │
                          │   │   Upgrade Page      │      │
                          │   │   - Plan Options    │      │
                          │   │   - Testimonials    │      │
                          │   │   - FAQ             │      │
                          │   └─────────────────────┘      │
                          │              │                  │
                          │              ▼                  │
                          │   ┌─────────────────────┐      │
                          │   │   Checkout/Success  │      │
                          │   └─────────────────────┘      │
                          │                                 │
                          └─────────────────────────────────┘

METRICS
┌─────────────────────────────────────────────────────────────────────────┐
│ Landing → Signup:       XX%  (Target: 15-30%)                          │
│ Activation (Core Action): X% (Target: 40%+)                            │
│ Day 7 Retention:        XX%  (Target: 60%+)                            │
│ Trial → Paid:           X%   (Target: 15-25%)                          │
│ Time to Upgrade:        X days (Target: <10)                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Funnel Health Check

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FUNNEL HEALTH DASHBOARD                              │
└─────────────────────────────────────────────────────────────────────────┘

TRAFFIC QUALITY
┌─────────────────────────────────────────────────────────────────────────┐
│ Source          │ Sessions │ Bounce │ Time on Site │ Conversion │ Status│
├─────────────────┼──────────┼────────┼──────────────┼────────────┼───────┤
│ Organic Search  │  X,XXX   │  XX%   │    X:XX      │   X.X%     │  🟢   │
│ Paid Social     │  X,XXX   │  XX%   │    X:XX      │   X.X%     │  🟡   │
│ Email           │   XXX    │  XX%   │    X:XX      │   X.X%     │  🟢   │
│ Direct          │   XXX    │  XX%   │    X:XX      │   X.X%     │  🟢   │
│ Referral        │   XXX    │  XX%   │    X:XX      │   X.X%     │  🔴   │
└─────────────────────────────────────────────────────────────────────────┘

CONVERSION RATES BY STEP
┌─────────────────────────────────────────────────────────────────────────┐
│ Step                    │ Visitors  │ Conversions │ Rate    │ Target   │
├─────────────────────────┼───────────┼─────────────┼─────────┼──────────┤
│ Landing Page → Lead     │   X,XXX   │     XXX     │  XX.X%  │   30%+   │
│ Lead → Email Open       │    XXX    │     XXX     │  XX.X%  │   25%+   │
│ Open → Click            │    XXX    │      XX     │   X.X%  │    5%+   │
│ Click → Purchase        │     XX    │       X     │   X.X%  │    3%+   │
└─────────────────────────────────────────────────────────────────────────┘

EMAIL SEQUENCE PERFORMANCE
┌─────────────────────────────────────────────────────────────────────────┐
│ Email              │ Open Rate │ Click Rate │ Revenue │ Status         │
├────────────────────┼───────────┼────────────┼─────────┼────────────────┤
│ Welcome            │   XX.X%   │    X.X%    │   $XXX  │ 🟢 Performing  │
│ Education Day 1    │   XX.X%   │    X.X%    │    $XX  │ 🟢 Performing  │
│ Case Study         │   XX.X%   │    X.X%    │   $XXX  │ 🟡 Average     │
│ Direct Pitch       │   XX.X%   │    X.X%    │  $XXXX  │ 🟢 Top Performer│
└─────────────────────────────────────────────────────────────────────────┘

LEGEND: 🟢 On Target  🟡 Below Target  🔴 Critical Issue
```
