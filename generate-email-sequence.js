const fs = require('fs');
const path = require('path');

// 生成7封邮件的 nurture sequence
const emailSequence = [
  {
    day: 1,
    subject: "Welcome! Your security journey starts now 🛡️",
    type: "Welcome",
    content: {
      greeting: "Hi there,",
      body: "Welcome to AI Security Monitor! I'm excited to help you protect your infrastructure without the complexity.",
      value: "Over the next week, I'll share proven strategies to:",
      bullets: [
        "Reduce security alerts by 80%",
        "Achieve SOC 2 compliance faster",
        "Automate vulnerability detection"
      ],
      cta: "Get Started",
      ctaLink: "#onboarding"
    }
  },
  {
    day: 2,
    subject: "The $4.88M mistake most companies make",
    type: "Education",
    content: {
      hook: "Did you know the average data breach costs $4.88 million?",
      body: "Most companies think they're secure until it's too late. Here's what I learned from analyzing 500+ security incidents...",
      keyInsight: "78% of breaches could have been prevented with basic monitoring.",
      action: "Tomorrow, I'll show you the 5-minute security audit anyone can do.",
      cta: "Read the Full Report",
      ctaLink: "#report"
    }
  },
  {
    day: 3,
    subject: "5-Minute Security Audit (Template Inside)",
    type: "Value",
    content: {
      greeting: "Quick question:",
      body: "When was your last security audit? If you're like most teams, it's been too long.",
      offer: "Here's a simple 5-minute audit you can do today:",
      checklist: [
        "☐ Check for exposed API keys",
        "☐ Review recent access logs",
        "☐ Verify backup integrity",
        "☐ Update dependencies",
        "☐ Test incident response"
      ],
      cta: "Get the Automated Version",
      ctaLink: "#audit-tool"
    }
  },
  {
    day: 4,
    subject: "How [Company] reduced incidents by 80%",
    type: "Case Study",
    content: {
      headline: "Real results from real companies",
      story: "TechFlow was drowning in 500+ alerts per day. Their team was burning out.",
      solution: "They implemented AI-powered alert triage and automated response.",
      results: [
        "Alert fatigue: -80%",
        "Response time: -60%",
        "Team satisfaction: +45%"
      ],
      quote: "\"We went from reactive to proactive. Best investment we made.\" - CTO, TechFlow",
      cta: "See How They Did It",
      ctaLink: "#case-study"
    }
  },
  {
    day: 5,
    subject: "SOC 2 doesn't have to be painful",
    type: "Problem-Solution",
    content: {
      hook: "SOC 2 compliance typically takes 6-12 months.",
      pain: "Most companies struggle with:",
      painPoints: [
        "Collecting evidence manually",
        "Chasing down documentation",
        "Expensive consultant fees",
        "Audit surprises"
      ],
      solution: "What if you could automate 90% of the work?",
      benefits: [
        "Auto-collect compliance evidence",
        "Real-time policy enforcement",
        "Pre-built auditor reports",
        "Cut timeline in half"
      ],
      cta: "Start Your SOC 2 Journey",
      ctaLink: "#soc2"
    }
  },
  {
    day: 6,
    subject: "Last chance: Your free scan expires tomorrow",
    type: "Urgency",
    content: {
      urgency: "Your complimentary security scan expires in 24 hours.",
      reminder: "This includes:",
      features: [
        "Full vulnerability assessment",
        "Priority risk ranking",
        "Remediation roadmap",
        "Compliance gap analysis"
      ],
      scarcity: "Only 3 spots left this week.",
      guarantee: "100% free. No credit card required.",
      cta: "Claim Your Free Scan",
      ctaLink: "#free-scan"
    }
  },
  {
    day: 7,
    subject: "What happens next?",
    type: "Next Steps",
    content: {
      greeting: "Thanks for joining me this week!",
      recap: "Here's what we covered:",
      summary: [
        "Day 1: Your welcome guide",
        "Day 2: The true cost of breaches",
        "Day 3: 5-minute security audit",
        "Day 4: Real customer success story",
        "Day 5: SOC 2 made simple",
        "Day 6: Your free security scan"
      ],
      next: "Ready to get serious about security?",
      options: [
        "Start free trial (no credit card)",
        "Book a demo with our team",
        "Continue with free tier"
      ],
      cta: "Choose Your Path",
      ctaLink: "#pricing"
    }
  }
];

// 生成邮件模板
function generateEmail(email) {
  return `Subject: ${email.subject}
Type: ${email.type}
Day: ${email.day}

---

${email.content.greeting || email.content.hook || ''}

${email.content.body || email.content.headline || ''}

${email.content.value || email.content.offer || email.content.solution || email.content.reminder || email.content.recap || ''}

${email.content.bullets ? email.content.bullets.map(b => `• ${b}`).join('\n') : ''}
${email.content.checklist ? email.content.checklist.join('\n') : ''}
${email.content.painPoints ? email.content.painPoints.map(p => `• ${p}`).join('\n') : ''}
${email.content.results ? email.content.results.join('\n') : ''}
${email.content.benefits ? email.content.benefits.map(b => `✓ ${b}`).join('\n') : ''}
${email.content.features ? email.content.features.map(f => `• ${f}`).join('\n') : ''}
${email.content.summary ? email.content.summary.join('\n') : ''}

${email.content.keyInsight ? `💡 ${email.content.keyInsight}\n` : ''}
${email.content.action ? `${email.content.action}\n` : ''}
${email.content.quote ? `\n${email.content.quote}\n` : ''}
${email.content.scarcity ? `\n⏰ ${email.content.scarcity}\n` : ''}
${email.content.guarantee ? `${email.content.guarantee}\n` : ''}
${email.content.next ? `\n${email.content.next}\n` : ''}
${email.content.options ? email.content.options.map((o, i) => `${i + 1}. ${o}`).join('\n') : ''}

[${email.content.cta}]: ${email.content.ctaLink}

---
Best regards,
The AI Security Monitor Team
`;
}

// 保存邮件
const emailDir = path.join(__dirname, 'ai-agent-projects', 'email-sequence');
if (!fs.existsSync(emailDir)) {
  fs.mkdirSync(emailDir, { recursive: true });
}

emailSequence.forEach(email => {
  const content = generateEmail(email);
  const filename = `day-${email.day}-${email.type.toLowerCase()}.txt`;
  fs.writeFileSync(path.join(emailDir, filename), content);
  console.log(`✅ Generated: ${filename} - "${email.subject}"`);
});

// 生成邮件统计
const stats = {
  sequenceLength: emailSequence.length,
  totalDays: 7,
  emailTypes: emailSequence.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {}),
  averageSubjectLength: Math.round(emailSequence.reduce((sum, e) => sum + e.subject.length, 0) / emailSequence.length),
  recommendedSendTime: "10:00 AM recipient timezone"
};

fs.writeFileSync(
  path.join(emailDir, 'sequence-stats.json'),
  JSON.stringify(stats, null, 2)
);

console.log(`✅ Generated: sequence-stats.json`);
console.log(`\n🎉 Created ${emailSequence.length}-day email nurture sequence!`);
console.log(`📧 Average subject line: ${stats.averageSubjectLength} characters`);
