# A/B Testing Framework

## Overview
Systematic approach to testing and optimizing every element of your sales funnel.

---

## Testing Philosophy

### The CORE Method
1. **C**ollect data - Identify problem areas
2. **O**bserve - Form hypothesis
3. **R**un test - A/B test variations
4. **E**valuate - Measure results, implement winner

### Testing Hierarchy (Test in Order)
1. **Offer** - Product, pricing, bonuses
2. **Targeting** - Audience, traffic source
3. **Funnel Flow** - Page sequence, form length
4. **Headlines** - Value proposition
5. **Social Proof** - Testimonials, logos, counts
6. **CTAs** - Button text, color, placement
7. **Design** - Images, layout, colors
8. **Copy** - Body text, bullet points

---

## Test Priority Matrix

| Element | Impact | Ease | Priority | Expected Lift |
|---------|--------|------|----------|---------------|
| Headline | High | Easy | **P0** | 20-50% |
| Offer | High | Hard | **P0** | 30-100% |
| CTA Button | High | Easy | **P1** | 10-30% |
| Social Proof | Medium | Easy | **P1** | 15-25% |
| Form Fields | High | Easy | **P1** | 20-40% |
| Hero Image | Medium | Easy | **P2** | 5-15% |
| Pricing Display | High | Medium | **P2** | 15-30% |
| Page Length | Medium | Hard | **P3** | 10-20% |
| Color Scheme | Low | Easy | **P4** | 2-5% |

---

## Testing Tools

### Recommended Platforms

| Tool | Best For | Pricing | Traffic Required |
|------|----------|---------|------------------|
| **Google Optimize** | Free testing | Free | 100+ daily visitors |
| **Optimizely** | Enterprise | $$ | 10,000+ monthly |
| **VWO** | Mid-market | $ | 5,000+ monthly |
| **Unbounce** | Landing pages | $$ | Any |
| **Split.io** | Developer-focused | $$ | High volume |
| **AB Tasty** | Personalization | $$ | Medium |

### Quick Setup: Google Optimize
```javascript
// Add to page head
<script src="https://www.googleoptimize.com/optimize.js?id=OPT-XXXXXX"></script>

// Anti-flicker snippet (prevents original from showing)
<style>.async-hide { opacity: 0 !important } </style>
<script>
(function(a,s,y,n,c,h,i,d,e){
  s.className+=' '+y;
  h.start=1*new Date;
  h.end=i=function(){
    s.className=s.className.replace(RegExp(' ?'+y),'')
  };
  (a[n]=a[n]||[]).hide=h;
  setTimeout(function(){i();h.end=null},c);
  h.timeout=c;
})(window,document.documentElement,'async-hide','dataLayer',4000,{'GTM-XXXXXX':true});
</script>
```

---

## Test Templates

### Test 1: Headline Optimization

**Current (Control):**
```
"Get More Customers with Email Marketing"
```

**Variation A (Benefit-focused):**
```
"Increase Revenue by 40% with Automated Emails"
```

**Variation B (Question):**
```
"Still Doing Email Marketing Manually?"
```

**Variation C (How-to):**
```
"How to 3x Your Email Revenue in 30 Days"
```

**Hypothesis:** Specific outcomes with numbers will outperform generic benefits.

**Success Metric:** Form conversion rate

---

### Test 2: CTA Button Text

**Current:**
```
"Submit"
```

**Variations:**
- "Get Instant Access →"
- "Send Me the Free Guide"
- "Download Now (Free)"
- "Yes! I Want [Benefit]"
- "Get Started"

**Hypothesis:** Action-oriented, benefit-focused CTAs will increase clicks.

---

### Test 3: Form Length

**Current:**
- First Name
- Last Name
- Email
- Phone
- Company
- Job Title

**Variation:**
- Email only

**Hypothesis:** Reducing form fields from 6 to 1 will increase conversions by 50%+.

**Trade-off:** Lower lead quality vs. higher volume

---

### Test 4: Social Proof Placement

**Test A (Above fold):**
```
"Join 10,000+ marketers who get our weekly insights"
[Form]
```

**Test B (Below form):**
```
[Form]
"Join 10,000+ marketers..."
```

**Test C (Logo strip):**
```
[Form]
[As seen in: Forbes, Inc, Entrepreneur]
```

**Hypothesis:** Social proof near the CTA increases trust and conversions.

---

### Test 5: Pricing Display

**Test A (Price first):**
```
Only $97
Get lifetime access to...
```

**Test B (Value first):**
```
Get $2,000+ worth of templates
Yours today for just $97
```

**Test C (Monthly breakdown):**
```
$97 one-time
(That's just $8/month if you use it for 1 year)
```

**Hypothesis:** Anchoring with high value before revealing price increases conversions.

---

### Test 6: Exit Intent Popup

**Control:** No popup

**Variation A:**
```
Wait! Before you go...

Get 10% off your first order
[Email field] [Get My Discount]
```

**Variation B:**
```
Want to save this for later?

Enter your email and we'll send you:
→ The complete guide
→ Exclusive bonus tips
→ Future updates

[Email field] [Send It To Me]
```

---

## Statistical Significance Guide

### Sample Size Calculator
```
Minimum sample size per variation = 
  16 × (Standard Deviation²) / (Desired Lift²)

Simple rule of thumb:
- High traffic (>10k/day): 100 conversions per variation
- Medium traffic (1-10k/day): 200 conversions per variation  
- Low traffic (<1k/day): 300+ conversions per variation
```

### Test Duration Guidelines
| Traffic Level | Min Test Duration | Max Test Duration |
|--------------|-------------------|-------------------|
| High (10k+/day) | 3-7 days | 14 days |
| Medium (1-10k/day) | 7-14 days | 30 days |
| Low (<1k/day) | 14-30 days | 60 days |

### When to Stop a Test
✅ **Stop when:**
- 95%+ statistical confidence reached
- Minimum sample size achieved
- Test ran for at least 1 full business cycle
- Results are consistent (not fluctuating)

❌ **Don't stop when:**
- One variation is "trending" ahead
- You hit an arbitrary date
- Sample size is too small
- Results are still volatile

---

## Test Documentation Template

```markdown
# Test #[Number]: [Element Being Tested]

## Hypothesis
[If we change X, then Y will happen because of Z]

## Test Details
- **Page:** [URL]
- **Element:** [What we're changing]
- **Start Date:** [Date]
- **End Date:** [Date or duration]
- **Traffic Split:** 50/50 (or other)

## Variations

### Control (A)
[Description or screenshot]

### Variation (B)  
[Description or screenshot]

## Success Metrics
Primary: [Main metric - e.g., form conversion]
Secondary: [Supporting metrics - e.g., revenue, AOV]
Guardrail: [Metrics to monitor for negative impact]

## Results

| Metric | Control | Variation | Lift | Confidence |
|--------|---------|-----------|------|------------|
| Conversion Rate | X% | Y% | +Z% | 99% |
| Revenue | $X | $Y | +Z% | 95% |

## Conclusion
[Winner + reasoning]

## Action Items
- [ ] Implement winning variation
- [ ] Document learnings
- [ ] Plan follow-up test

## Learnings
[Insights for future tests]
```

---

## Common Testing Mistakes

### ❌ Mistake 1: Testing Too Many Things
**Wrong:** Change headline, CTA, image, and form all at once
**Right:** Test headline first, then implement winner, then test CTA

### ❌ Mistake 2: Stopping Tests Too Early
**Wrong:** "Variation B is up 50% after 100 visitors!"
**Right:** Wait for 95% confidence with adequate sample size

### ❌ Mistake 3: Ignoring Statistical Significance
**Wrong:** "Version A had 12 conversions, B had 15, B wins!"
**Right:** "With our traffic, we need 400 conversions per variation"

### ❌ Mistake 4: Not Segmenting Results
**Wrong:** Overall winner works for all traffic
**Right:** Check mobile vs desktop, traffic sources, new vs returning

### ❌ Mistake 5: Testing Without Hypothesis
**Wrong:** "Let's try green instead of blue"
**Right:** "Blue conveys trust for financial products, expecting +10%"

---

## Testing Roadmap

### Month 1: Quick Wins
- [ ] Test headline (3 variations)
- [ ] Test CTA button text (5 variations)
- [ ] Test form length
- [ ] Test hero image

### Month 2: Deeper Optimization
- [ ] Test social proof placement
- [ ] Test pricing presentation
- [ ] Test page length (short vs long)
- [ ] Test video vs text

### Month 3: Advanced Tests
- [ ] Test multi-step form
- [ ] Test personalized content
- [ ] Test offer variations
- [ ] Test exit intent

### Ongoing
- [ ] Document all tests
- [ ] Build testing playbook
- [ ] Share learnings with team
- [ ] Plan next quarter's tests

---

## A/B Test Results Library

### Winning Tests (Document Here)

| Test | Element | Winner | Lift | Date |
|------|---------|--------|------|------|
| #1 | Headline | "How to 3x..." | +34% | 2024-01 |
| #2 | CTA | "Get Instant Access" | +18% | 2024-01 |
| #3 | Form | 2 fields vs 6 | +42% | 2024-02 |

### Losing Tests (Also Important!)

| Test | Element | Hypothesis | Actual | Learning |
|------|---------|------------|--------|----------|
| #4 | Video | Video wins | -5% | Audience prefers reading |
| #5 | Price | $97 vs $197 | No diff | Price insensitive segment |

---

## Tools Integration

### Heatmap Tools (Qualitative Data)
- **Hotjar** - Heatmaps, recordings, surveys
- **Crazy Egg** - Scroll maps, confetti
- **Microsoft Clarity** - Free heatmaps, recordings

### Session Recording
Watch real users interact with your pages to find:
- Where they get stuck
- What they ignore
- Rage clicks (frustration)
- Form field issues

### User Surveys
```
Quick question: What's the #1 thing holding you back from [action]?
[Text field]

Or choose:
○ Too expensive
○ Don't understand the value
○ Not ready yet
○ Prefer competitors
```

---

## Resources
- AB Test Calculator: https://abtestguide.com/calc/
- Sample Size Calculator: https://www.evanmiller.org/ab-testing/sample-size.html
- Statistical Significance: https://www.optimizely.com/resources/sample-size-calculator/
