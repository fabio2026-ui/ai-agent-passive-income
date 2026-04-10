# Landing Page Templates for Conversions

## Overview
High-converting landing page templates optimized for lead generation and sales.

---

## Template 1: Lead Generation Landing Page

### Best For: Lead Magnets, Webinar Signups, Free Trials

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Benefit-Driven Headline] | [Brand]</title>
    <meta name="description" content="[Compelling meta description with CTA]">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        /* Hero */
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 80px 0; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; }
        .hero .subheadline { font-size: 1.3rem; opacity: 0.9; margin-bottom: 30px; max-width: 600px; margin-left: auto; margin-right: auto; }
        
        /* Form */
        .optin-form { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
        .optin-form input { width: 100%; padding: 15px; margin-bottom: 15px; border: 2px solid #e0e0e0; border-radius: 5px; font-size: 16px; }
        .optin-form input:focus { outline: none; border-color: #667eea; }
        .optin-form button { width: 100%; padding: 18px; background: #ff6b6b; color: white; border: none; border-radius: 5px; font-size: 18px; font-weight: bold; cursor: pointer; transition: transform 0.2s; }
        .optin-form button:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(255,107,107,0.3); }
        
        /* Social Proof */
        .social-proof { padding: 60px 0; background: #f8f9fa; text-align: center; }
        .social-proof h2 { margin-bottom: 40px; }
        .logos { display: flex; justify-content: center; align-items: center; gap: 40px; flex-wrap: wrap; opacity: 0.5; }
        
        /* Benefits */
        .benefits { padding: 80px 0; }
        .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; margin-top: 40px; }
        .benefit-card { text-align: center; padding: 30px; }
        .benefit-icon { font-size: 3rem; margin-bottom: 20px; }
        
        /* Testimonial */
        .testimonial { padding: 80px 0; background: #667eea; color: white; text-align: center; }
        .testimonial blockquote { font-size: 1.5rem; font-style: italic; max-width: 800px; margin: 0 auto 30px; }
        
        /* FAQ */
        .faq { padding: 80px 0; }
        .faq-item { max-width: 800px; margin: 0 auto 20px; border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; }
        .faq-item h3 { margin-bottom: 10px; }
        
        /* CTA Section */
        .cta-section { padding: 80px 0; background: #f8f9fa; text-align: center; }
        
        /* Footer */
        footer { padding: 40px 0; text-align: center; color: #666; font-size: 0.9rem; }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .hero { padding: 50px 0; }
        }
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <h1>[Headline: Main Benefit]</h1>
            <p class="subheadline">[Subheadline: Specific outcome + time frame + objection handling]</p>
            
            <form class="optin-form">
                <input type="text" placeholder="Enter your first name" required>
                <input type="email" placeholder="Enter your email address" required>
                <button type="submit">[CTA Button: Get Instant Access] →</button>
                <p style="margin-top: 15px; color: #666; font-size: 0.9rem;">🔒 We respect your privacy. Unsubscribe anytime.</p>
            </form>
        </div>
    </section>

    <!-- Social Proof -->
    <section class="social-proof">
        <div class="container">
            <h2>Trusted by [X]+ [target audience] from leading companies</h2>
            <div class="logos">
                <!-- Company logos here -->
                <span>Company 1</span>
                <span>Company 2</span>
                <span>Company 3</span>
                <span>Company 4</span>
            </div>
        </div>
    </section>

    <!-- Benefits -->
    <section class="benefits">
        <div class="container">
            <h2 style="text-align: center;">Here's what you'll get...</h2>
            
            <div class="benefits-grid">
                <div class="benefit-card">
                    <div class="benefit-icon">🎯</div>
                    <h3>[Benefit 1]</h3>
                    <p>[Description of benefit with specific outcome]</p>
                </div>
                
                <div class="benefit-card">
                    <div class="benefit-icon">⚡</div>
                    <h3>[Benefit 2]</h3>
                    <p>[Description of benefit with specific outcome]</p>
                </div>
                
                <div class="benefit-card">
                    <div class="benefit-icon">🔒</div>
                    <h3>[Benefit 3]</h3>
                    <p>[Description of benefit with specific outcome]</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonial -->
    <section class="testimonial">
        <div class="container">
            <blockquote>
                "[Compelling testimonial that speaks to transformation and specific results]"
            </blockquote>
            <p>— [Name], [Title] at [Company]</p>
        </div>
    </section>

    <!-- FAQ -->
    <section class="faq">
        <div class="container">
            <h2 style="text-align: center; margin-bottom: 40px;">Frequently Asked Questions</h2>
            
            <div class="faq-item">
                <h3>[Question 1: Address common objection]</h3>
                <p>[Clear, honest answer that builds trust]</p>
            </div>
            
            <div class="faq-item">
                <h3>[Question 2: Time/implementation concern]</h3>
                <p>[Answer that reduces perceived effort]</p>
            </div>
            
            <div class="faq-item">
                <h3>[Question 3: Results/timeline question]</h3>
                <p>[Answer with realistic expectations]</p>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="cta-section">
        <div class="container">
            <h2>Ready to [achieve desired outcome]?</h2>
            <p style="margin: 20px 0;">Join [X]+ [target audience] who are already [benefit]</p>
            
            <a href="#" class="button" style="display: inline-block; padding: 18px 40px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px;">[CTA: Get Started Now] →</a>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>© [Year] [Company Name]. All rights reserved. | <a href="#">Privacy</a> | <a href="#">Terms</a></p>
        </div>
    </footer>
</body>
</html>
```

---

## Template 2: Sales Page

### Best For: Products, Courses, Services

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Product Name] - [Main Benefit]</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
        
        .hero { padding: 80px 0; text-align: center; }
        .hero h1 { font-size: 2.5rem; margin-bottom: 20px; }
        .price { font-size: 3rem; color: #ff6b6b; font-weight: bold; margin: 30px 0; }
        .btn { display: inline-block; padding: 20px 50px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 5px; font-size: 1.2rem; font-weight: bold; }
        
        .section { padding: 60px 0; }
        .section-alt { background: #f8f9fa; }
        
        .problem { background: #333; color: white; padding: 60px 0; }
        .solution { padding: 60px 0; }
        
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-top: 40px; }
        .feature { padding: 30px; background: white; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        
        .guarantee { background: #4ecdc4; color: white; padding: 60px 0; text-align: center; }
        
        .bonuses { background: #f8f9fa; padding: 60px 0; }
        .bonus { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding: 20px; background: white; border-radius: 10px; }
        .bonus-value { font-size: 1.5rem; color: #ff6b6b; font-weight: bold; }
        
        .urgency { background: #ff6b6b; color: white; padding: 40px 0; text-align: center; }
        .countdown { font-size: 2rem; font-weight: bold; margin: 20px 0; }
        
        .testimonials { padding: 60px 0; }
        .testimonial-card { background: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        
        .faq-item { border-bottom: 1px solid #e0e0e0; padding: 20px 0; }
        .faq-item h3 { cursor: pointer; }
        
        .final-cta { padding: 80px 0; text-align: center; }
    </style>
</head>
<body>

<!-- Hero -->
<section class="hero">
    <div class="container">
        <p style="color: #ff6b6b; font-weight: bold; margin-bottom: 20px;">[Urgency or social proof headline]</p>
        <h1>[Product Name]: [Main Benefit]</h1>
        <p style="font-size: 1.2rem; color: #666; max-width: 600px; margin: 20px auto;">[Subheadline: Specific transformation + time frame]</p>
        
        <div class="price">$[Price]</div>
        
        <a href="#checkout" class="btn">Get Instant Access →</a>
        <p style="margin-top: 20px; color: #666;">✓ 30-Day Money Back Guarantee ✓ Instant Delivery</p>
    </div>
</section>

<!-- Problem/Solution -->
<section class="problem">
    <div class="container">
        <h2 style="text-align: center; margin-bottom: 40px;">Does this sound familiar?</h2>
        
        <ul style="max-width: 600px; margin: 0 auto; font-size: 1.1rem;">
            <li style="margin-bottom: 15px;">[Common pain point 1]</li>
            <li style="margin-bottom: 15px;">[Common pain point 2]</li>
            <li style="margin-bottom: 15px;">[Common pain point 3]</li>
            <li>[Common pain point 4]</li>
        </ul>
    </div>
</section>

<!-- Solution -->
<section class="solution">
    <div class="container">
        <h2 style="text-align: center;">What if you could [desired outcome]?</h2>
        
        <p style="text-align: center; max-width: 600px; margin: 20px auto; font-size: 1.1rem;">[Introduce solution - what it is and why it works]</p>
    </div>
</section>

<!-- Features -->
<section class="section-alt">
    <div class="container">
        <h2 style="text-align: center; margin-bottom: 20px;">Here's everything you get...</h2>
        
        <div class="features">
            <div class="feature">
                <h3>📦 [Module/Feature 1]</h3>
                <p>[Detailed description of what's included and the benefit]</p>
                <p style="color: #666; margin-top: 10px;">Value: $[X]</p>
            </div>
            
            <div class="feature">
                <h3>📦 [Module/Feature 2]</h3>
                <p>[Detailed description of what's included and the benefit]</p>
                <p style="color: #666; margin-top: 10px;">Value: $[X]</p>
            </div>
            
            <div class="feature">
                <h3>📦 [Module/Feature 3]</h3>
                <p>[Detailed description of what's included and the benefit]</p>
                <p style="color: #666; margin-top: 10px;">Value: $[X]</p>
            </div>
        </div>
    </div>
</section>

<!-- Bonuses -->
<section class="bonuses">
    <div class="container">
        <h2 style="text-align: center; margin-bottom: 40px;">Plus These Exclusive Bonuses...</h2>
        
        <div class="bonus">
            <div>🎁</div>
            <div>
                <h3>Bonus #1: [Bonus Name]</h3>
                <p>[Description and benefit]</p>
                <span class="bonus-value">Value: $[X]</span>
            </div>
        </div>
        
        <div class="bonus">
            <div>🎁</div>
            <div>
                <h3>Bonus #2: [Bonus Name]</h3>
                <p>[Description and benefit]</p>
                <span class="bonus-value">Value: $[X]</span>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding: 30px; background: #333; color: white; border-radius: 10px;">
            <h3>Total Value: $[Total]</h3>
            <p style="font-size: 2rem; font-weight: bold; color: #4ecdc4;">Your Price: $[Price]</p>
            <p>(Save $[Amount]!)</p>
        </div>
    </div>
</section>

<!-- Guarantee -->
<section class="guarantee">
    <div class="container">
        <h2 style="font-size: 2.5rem; margin-bottom: 20px;">🛡️ 30-Day Money Back Guarantee</h2>
        
        <p style="font-size: 1.2rem; max-width: 600px; margin: 0 auto;">Try [Product Name] risk-free. If you're not completely satisfied, email us within 30 days for a full refund. No questions asked.</p>
    </div>
</section>

<!-- Testimonials -->
<section class="testimonials">
    <div class="container">
        <h2 style="text-align: center; margin-bottom: 40px;">What Our Customers Say</h2>
        
        <div class="testimonial-card">
            <p style="font-size: 1.2rem; font-style: italic; margin-bottom: 20px;">"[Detailed testimonial with specific results]" — [Name], [Title]</p>
        </div>
    </div>
</section>

<!-- FAQ -->
<section class="section-alt">
    <div class="container">
        <h2 style="text-align: center; margin-bottom: 40px;">Frequently Asked Questions</h2>
        
        <div class="faq-item">
            <h3>[Question 1]</h3>
            <p>[Answer]</p>
        </div>
        
        <div class="faq-item">
            <h3>[Question 2]</h3>
            <p>[Answer]</p>
        </div>
    </div>
</section>

<!-- Final CTA -->
<section class="final-cta" id="checkout">
    <div class="container">
        <h2>Ready to Get Started?</h2>
        
        <div class="price">$[Price]</div>
        
        <a href="[Checkout URL]" class="btn">Buy Now →</a>
        
        <p style="margin-top: 30px; color: #666;">🔒 Secure Checkout | Instant Access | 30-Day Guarantee</p>
    </div>
</section>

</body>
</html>
```

---

## Template 3: Webinar Registration Page

### Best For: Webinars, Live Events, Workshops

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Free Workshop: [Topic] | [Date]</title>
    <style>
        body { font-family: sans-serif; margin: 0; line-height: 1.6; }
        .hero { background: #1a1a2e; color: white; padding: 60px 0; text-align: center; }
        .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
        .badge { display: inline-block; background: #e94560; padding: 8px 16px; border-radius: 20px; font-size: 0.9rem; margin-bottom: 20px; }
        h1 { font-size: 2.5rem; margin-bottom: 20px; }
        .datetime { font-size: 1.3rem; color: #e94560; font-weight: bold; margin: 20px 0; }
        .form-box { background: white; color: #333; padding: 40px; border-radius: 10px; max-width: 500px; margin: 30px auto; }
        input, select { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px; }
        button { width: 100%; padding: 15px; background: #e94560; color: white; border: none; border-radius: 5px; font-size: 1.1rem; font-weight: bold; cursor: pointer; }
        .benefits { padding: 60px 0; background: #f8f9fa; }
        .benefit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; margin-top: 40px; }
        .host { padding: 60px 0; text-align: center; }
        .host img { width: 150px; height: 150px; border-radius: 50%; margin-bottom: 20px; }
        .urgency { background: #e94560; color: white; padding: 40px 0; text-align: center; }
    </style>
</head>
<body>

<section class="hero">
    <div class="container">
        <span class="badge">FREE LIVE WORKSHOP</span>
        
        <h1>[Webinar Title]: [Specific Benefit]</h1>
        
        <p style="font-size: 1.2rem; opacity: 0.9;">[Subheadline describing transformation]</p>
        
        <div class="datetime">📅 [Day], [Date] at [Time] [Timezone]</div>
        
        <div class="form-box">
            <h3>Save Your Seat (Limited Spots)</h3>
            
            <form>
                <input type="text" placeholder="First Name" required>
                <input type="email" placeholder="Email Address" required>
                <button type="submit">Register Now For FREE →</button>
            </form>
            
            <p style="font-size: 0.9rem; color: #666; margin-top: 15px;">Can't make it live? Register anyway - we'll send the replay.</p>
        </div>
    </div>
</section>

<section class="benefits">
    <div class="container">
        <h2 style="text-align: center;">Here's What You'll Learn...</h2>
        
        <div class="benefit-grid">
            <div>
                <h3>🎯 [Learning Point 1]</h3>
                <p>[Description]</p>
            </div>
            
            <div>
                <h3>🎯 [Learning Point 2]</h3>
                <p>[Description]</p>
            </div>
            
            <div>
                <h3>🎯 [Learning Point 3]</h3>
                <p>[Description]</p>
            </div>
        </div>
    </div>
</section>

<section class="host">
    <div class="container">
        <img src="[host-photo]" alt="[Host Name]">
        
        <h2>Meet Your Host</h2>
        
        <h3>[Host Name], [Title]</h3>
        
        <p style="max-width: 600px; margin: 20px auto;">[Brief bio and credentials]</p>
    </div>
</section>

<section class="urgency">
    <div class="container">
        <h2>⏰ Only [X] Seats Remaining</h2>
        
        <p>This workshop is limited to [X] attendees for Q&A time.</p>
    </div>
</section>

</body>
</html>
```

---

## Conversion Optimization Checklist

### Headline
- [ ] Includes specific benefit or outcome
- [ ] Speaks directly to target audience
- [ ] Creates curiosity or urgency
- [ ] Under 20 words ideally

### Above the Fold
- [ ] Clear headline + subheadline
- [ ] Visual element (image/video)
- [ ] Single CTA (no competing buttons)
- [ ] Mobile-optimized

### Social Proof
- [ ] Testimonials with photos/names
- [ ] Trust badges/logos
- [ ] Download/subscriber count
- [ ] Media mentions

### Form Optimization
- [ ] Minimum fields (2-3 max for leads)
- [ ] Clear field labels
- [ ] Inline validation
- [ ] Privacy reassurance
- [ ] Submit button contrast/color

### CTA Buttons
- [ ] Action-oriented text (not "Submit")
- [ ] Contrasting color
- [ ] Large enough to click (min 44px height)
- [ ] Repeated throughout long pages

### Page Speed
- [ ] Loads under 3 seconds
- [ ] Images optimized
- [ ] Mobile responsive
- [ ] No broken links

### Trust Elements
- [ ] SSL certificate
- [ ] Privacy policy link
- [ ] Guarantee visible
- [ ] Contact information

---

## Tools & Platforms

| Platform | Best For | Pricing |
|----------|----------|---------|
| Carrd | Simple landing pages | $19/year |
| Webflow | Custom designs | $14+/mo |
| Unbounce | A/B testing focus | $99+/mo |
| Leadpages | Conversion templates | $37+/mo |
| Instapage | Enterprise | $199+/mo |
| ClickFunnels | Full funnels | $97+/mo |
| WordPress + Elementor | Flexibility | Free + hosting |

---

## Additional Templates

- **Template 4:** Thank You Page → `./templates/thank-you.html`
- **Template 5:** Upsell Page → `./templates/upsell.html`
- **Template 6:** Checkout Page → `./templates/checkout.html`
- **Template 7:** Coming Soon Page → `./templates/coming-soon.html`
