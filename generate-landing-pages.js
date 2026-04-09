const fs = require('fs');
const path = require('path');

// 生成3个落地页变体用于A/B测试
const landingPages = [
  {
    name: "Variant-A-Authority",
    headline: "Trusted by 500+ Companies to Secure Their Infrastructure",
    subheadline: "AI-powered security monitoring that finds vulnerabilities before hackers do",
    cta: "Start Free Security Scan",
    socialProof: "Fortune 500 companies trust our platform",
    colorScheme: "Blue/Professional",
    focus: "Authority and Trust"
  },
  {
    name: "Variant-B-Urgency",
    headline: "Your Next Security Breach Could Cost $4.88M",
    subheadline: "Detect threats in real-time. Fix vulnerabilities automatically. Sleep better tonight.",
    cta: "Protect My Business Now",
    socialProof: "Reduce security incidents by 80% in 30 days",
    colorScheme: "Red/Urgency",
    focus: "Fear and Urgency"
  },
  {
    name: "Variant-C-Simplicity",
    headline: "Security Monitoring in 5 Minutes, Not 5 Months",
    subheadline: "No complex setup. No expensive consultants. Just better security.",
    cta: "Get Started Free",
    socialProof: "Set up in 5 minutes, see results in 24 hours",
    colorScheme: "Green/Growth",
    focus: "Ease and Speed"
  }
];

// 生成完整HTML落地页
function generateLandingPage(variant) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${variant.headline}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .hero { background: ${variant.colorScheme.includes('Blue') ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : variant.colorScheme.includes('Red') ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}; color: white; padding: 100px 0; text-align: center; }
    .hero h1 { font-size: 3rem; margin-bottom: 20px; font-weight: 700; }
    .hero p { font-size: 1.5rem; margin-bottom: 40px; opacity: 0.95; }
    .cta-button { display: inline-block; background: #fff; color: #333; padding: 18px 48px; font-size: 1.2rem; font-weight: 600; border-radius: 50px; text-decoration: none; transition: transform 0.3s, box-shadow 0.3s; }
    .cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .social-proof { background: #f8f9fa; padding: 60px 0; text-align: center; }
    .social-proof p { font-size: 1.3rem; color: #666; }
    .features { padding: 80px 0; }
    .features h2 { text-align: center; font-size: 2.5rem; margin-bottom: 60px; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
    .feature { text-align: center; padding: 30px; }
    .feature h3 { font-size: 1.5rem; margin-bottom: 15px; }
    .feature p { color: #666; }
    .footer { background: #2d3748; color: #a0aec0; padding: 40px 0; text-align: center; }
  </style>
</head>
<body>
  <section class="hero">
    <div class="container">
      <h1>${variant.headline}</h1>
      <p>${variant.subheadline}</p>
      <a href="#signup" class="cta-button">${variant.cta}</a>
    </div>
  </section>
  
  <section class="social-proof">
    <div class="container">
      <p>✅ ${variant.socialProof}</p>
    </div>
  </section>
  
  <section class="features">
    <div class="container">
      <h2>Everything You Need for Security</h2>
      <div class="feature-grid">
        <div class="feature">
          <h3>🔍 Automated Scanning</h3>
          <p>Continuous vulnerability detection across your entire stack</p>
        </div>
        <div class="feature">
          <h3>🤖 AI-Powered Insights</h3>
          <p>Smart prioritization of threats that actually matter</p>
        </div>
        <div class="feature">
          <h3>📊 Compliance Ready</h3>
          <p>SOC 2, GDPR, HIPAA compliance reporting built-in</p>
        </div>
      </div>
    </div>
  </section>
  
  <footer class="footer">
    <div class="container">
      <p>© 2025 AI Security Monitor. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
}

// 生成变体
const landingDir = path.join(__dirname, 'ai-agent-projects', 'landing-pages');
if (!fs.existsSync(landingDir)) {
  fs.mkdirSync(landingDir, { recursive: true });
}

landingPages.forEach(variant => {
  const html = generateLandingPage(variant);
  const filepath = path.join(landingDir, `${variant.name}.html`);
  fs.writeFileSync(filepath, html);
  console.log(`✅ Generated: ${variant.name}.html (${variant.focus})`);
});

// 生成A/B测试配置
const abTestConfig = {
  testName: "Landing Page Conversion Optimization",
  variants: landingPages.map((v, i) => ({
    id: `variant-${String.fromCharCode(97 + i)}`,
    name: v.name,
    focus: v.focus,
    trafficSplit: 33.33
  })),
  metrics: ["conversion_rate", "bounce_rate", "time_on_page"],
  duration: "14_days",
  successCriteria: "conversion_rate > 5%"
};

fs.writeFileSync(
  path.join(landingDir, 'ab-test-config.json'),
  JSON.stringify(abTestConfig, null, 2)
);

console.log(`✅ Generated: ab-test-config.json`);
console.log(`\n🎉 Created ${landingPages.length} landing page variants for A/B testing!`);
