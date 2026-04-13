# Analytics Tracking Setup Guide

## Overview
Complete tracking implementation for monitoring sales funnel performance and optimizing conversions.

---

## 1. Google Analytics 4 (GA4) Setup

### Step 1: Create Property
1. Go to [analytics.google.com](https://analytics.google.com)
2. Click "Create Property"
3. Select "GA4" (recommended)
4. Enter property name, timezone, currency
5. Accept terms of service

### Step 2: Install Tracking Code

**Method A: Direct Installation**
```html
<!-- Add to <head> of every page -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Method B: Google Tag Manager (Recommended)**
```html
<!-- GTM Container Code in <head> -->
<script>
(function(w,d,s,l,i){
  w[l]=w[l]||[];
  w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
  var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),
      dl=l!='dataLayer'?'&l='+l:'';
  j.async=true;
  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
  f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');
</script>

<!-- GTM NoScript in <body> -->
<noscript>
<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
        height="0" width="0" 
        style="display:none;visibility:hidden"></iframe>
</noscript>
```

---

## 2. Key Events to Track

### Lead Generation Funnel
```javascript
// Event: Lead Magnet Download
gtag('event', 'generate_lead', {
  'event_category': 'Lead Magnet',
  'event_label': '[Magnet Name]',
  'value': 1
});

// Event: Form Submission
gtag('event', 'form_submit', {
  'event_category': 'Lead Form',
  'event_label': '[Form Name]',
  'value': 1
});

// Event: Email Confirmation
gtag('event', 'email_confirmed', {
  'event_category': 'Email',
  'event_label': 'Double Opt-in'
});
```

### Sales Funnel
```javascript
// Event: View Product
gtag('event', 'view_item', {
  'currency': 'USD',
  'value': [price],
  'items': [{
    'item_id': '[SKU]',
    'item_name': '[Product Name]',
    'item_category': '[Category]'
  }]
});

// Event: Add to Cart
gtag('event', 'add_to_cart', {
  'currency': 'USD',
  'value': [price],
  'items': [{...}]
});

// Event: Begin Checkout
gtag('event', 'begin_checkout', {
  'currency': 'USD',
  'value': [cart_value]
});

// Event: Purchase (CRITICAL)
gtag('event', 'purchase', {
  'transaction_id': '[ORDER_ID]',
  'value': [total],
  'currency': 'USD',
  'items': [{
    'item_id': '[SKU]',
    'item_name': '[Product Name]',
    'quantity': 1,
    'price': [price]
  }]
});
```

### Engagement Events
```javascript
// Event: Video Play
gtag('event', 'video_start', {
  'event_category': 'Video',
  'event_label': '[Video Title]'
});

// Event: Scroll Depth (25%, 50%, 75%, 90%)
gtag('event', 'scroll', {
  'event_category': 'Engagement',
  'event_label': '90%',
  'value': 90
});

// Event: Button Click
gtag('event', 'click', {
  'event_category': 'CTA',
  'event_label': '[Button Text]'
});

// Event: Outbound Link
gtag('event', 'outbound_click', {
  'event_category': 'Link',
  'event_label': '[URL]'
});
```

---

## 3. UTM Parameter Strategy

### Campaign URL Builder
```
https://yoursite.com/landing-page/?utm_source=facebook&utm_medium=paid_social&utm_campaign=lead_magnet_march&utm_content=carousel_ad_1
```

### Parameter Guide
| Parameter | Values | Purpose |
|-----------|--------|---------|
| `utm_source` | google, facebook, email, organic | Where traffic comes from |
| `utm_medium` | cpc, social, email, organic | Marketing medium |
| `utm_campaign` | spring_sale, lead_magnet | Campaign name |
| `utm_content` | banner_a, video_ad | Specific ad/content |
| `utm_term` | keyword_here | Paid search keywords |

### Standard UTM Setup
```
// Facebook Ads
?utm_source=facebook&utm_medium=paid_social&utm_campaign=[campaign_name]

// Google Ads  
?utm_source=google&utm_medium=cpc&utm_campaign=[campaign_name]&utm_term={keyword}

// Email Campaign
?utm_source=newsletter&utm_medium=email&utm_campaign=[campaign_name]

// Organic Social
?utm_source=instagram&utm_medium=social&utm_campaign=organic
```

---

## 4. Conversion Tracking Setup

### Meta Pixel (Facebook/Instagram)
```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s){
  if(f.fbq)return;
  n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>

<noscript>
<img height="1" width="1" 
     style="display:none" 
     src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
/>
</noscript>
```

### Meta Standard Events
```javascript
// Lead Event
fbq('track', 'Lead', {
  content_name: '[Lead Magnet Name]',
  content_category: '[Category]',
  value: 0.00,
  currency: 'USD'
});

// Complete Registration
fbq('track', 'CompleteRegistration', {
  content_name: '[Form Name]',
  status: true
});

// Purchase Event
fbq('track', 'Purchase', {
  content_ids: ['SKU1', 'SKU2'],
  content_type: 'product',
  value: 99.00,
  currency: 'USD'
});
```

### LinkedIn Insight Tag
```html
<script type="text/javascript">
_linkedin_partner_id = "YOUR_PARTNER_ID";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script>

<script type="text/javascript">
(function(l) {
  if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
  window.lintrk.q=[]}
  var s = document.getElementsByTagName("script")[0];
  var b = document.createElement("script");
  b.type = "text/javascript";b.async = true;
  b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
  s.parentNode.insertBefore(b, s);
})(window.lintrk);
</script>

<noscript>
<img height="1" width="1" style="display:none;" alt="" 
     src="https://px.ads.linkedin.com/collect/?pid=YOUR_PARTNER_ID&fmt=gif" />
</noscript>
```

---

## 5. Dashboard Setup

### GA4 Custom Reports

#### Report 1: Funnel Overview
| Dimension | Metric |
|-----------|--------|
| Session source/medium | Sessions |
| Landing page | Conversions (form_submit) |
| Device category | Conversion rate |

#### Report 2: Traffic Quality
| Dimension | Metric |
|-----------|--------|
| Campaign | Users |
| Ad content | Engagement rate |
| First user source | Revenue |

#### Report 3: Landing Page Performance
| Dimension | Metric |
|-----------|--------|
| Landing page | Sessions |
| | Bounce rate |
| | Avg engagement time |
| | Conversions |
| | Conversion rate |

### Google Looker Studio Dashboard
Connect data sources:
- GA4
- Google Ads
- Facebook Ads
- Email platform (via CSV export)

---

## 6. Key Metrics Dashboard

### Funnel Metrics
```
┌─────────────────────────────────────────────────────┐
│ SALES FUNNEL METRICS                                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│ AWARENESS                                            │
│ ├─ Total Sessions:      [X,XXX]                     │
│ ├─ Unique Visitors:     [X,XXX]                     │
│ └─ Traffic Sources:     Organic [X]%, Paid [Y]%    │
│                                                      │
│ INTEREST                                             │
│ ├─ Landing Page Views:  [X,XXX]                     │
│ ├─ Time on Page:        [X.X] sec avg               │
│ └─ Scroll Depth:        50% [X]%, 90% [Y]%         │
│                                                      │
│ CONSIDERATION                                        │
│ ├─ Form Starts:         [XXX]                       │
│ ├─ Form Submissions:    [XXX]                       │
│ └─ Opt-in Rate:         [X.X]%                      │
│                                                      │
│ CONVERSION                                           │
│ ├─ Purchases:           [XX]                        │
│ ├─ Revenue:             $[X,XXX]                    │
│ ├─ Conversion Rate:     [X.X]%                      │
│ └─ AOV:                 $[XXX]                      │
│                                                      │
│ KEY RATIOS                                           │
│ ├─ Cost per Lead:       $[XX]                       │
│ ├─ Cost per Purchase:   $[XXX]                      │
│ └─ ROAS:                [X.X]x                      │
└─────────────────────────────────────────────────────┘
```

---

## 7. Event Tracking Implementation

### Scroll Depth Tracking
```javascript
// Track scroll depth at 25%, 50%, 75%, 90%, 100%
(function() {
  var scrollDepths = [25, 50, 75, 90, 100];
  var tracked = {};
  
  window.addEventListener('scroll', function() {
    var scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
    
    scrollDepths.forEach(function(depth) {
      if (scrollPercent >= depth && !tracked[depth]) {
        tracked[depth] = true;
        gtag('event', 'scroll_depth', {
          'event_category': 'Engagement',
          'event_label': depth + '%'
        });
      }
    });
  });
})();
```

### Form Interaction Tracking
```javascript
// Track form field interactions
document.querySelectorAll('form input, form select').forEach(function(field) {
  field.addEventListener('focus', function() {
    gtag('event', 'form_field_focus', {
      'event_category': 'Form',
      'event_label': field.name
    });
  });
});

// Track form abandonment
var formStarted = false;
document.querySelector('form').addEventListener('input', function() {
  if (!formStarted) {
    formStarted = true;
    gtag('event', 'form_start', {
      'event_category': 'Form',
      'event_label': 'Checkout'
    });
  }
});

window.addEventListener('beforeunload', function() {
  if (formStarted && !formSubmitted) {
    gtag('event', 'form_abandon', {
      'event_category': 'Form',
      'event_label': 'Checkout'
    });
  }
});
```

### Video Tracking
```javascript
// Track YouTube video engagement
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    gtag('event', 'video_start', {
      'event_category': 'Video',
      'event_label': event.target.getVideoData().title
    });
  }
  if (event.data == YT.PlayerState.ENDED) {
    gtag('event', 'video_complete', {
      'event_category': 'Video',
      'event_label': event.target.getVideoData().title
    });
  }
}
```

---

## 8. Weekly Review Checklist

### Analytics Health Check
- [ ] Verify tracking code firing on all pages
- [ ] Check for 404 errors in Behavior > Site Speed
- [ ] Review traffic sources for anomalies
- [ ] Verify conversion goals recording
- [ ] Check UTM parameter consistency

### Performance Review
- [ ] Week-over-week traffic comparison
- [ ] Landing page conversion rates
- [ ] Cost per lead by source
- [ ] Email sequence performance
- [ ] Revenue attribution

### Action Items
- [ ] Pause underperforming ads
- [ ] Scale winning creatives
- [ ] Update landing pages with low conversion
- [ ] Fix tracking issues
- [ ] Document insights

---

## Resources

- GA4 Migration Guide: https://support.google.com/analytics/answer/10759417
- GTM Tutorial: https://analytics.google.com/analytics/academy/course/5
- Facebook Pixel Helper: Chrome extension
- Google Tag Assistant: Chrome extension
