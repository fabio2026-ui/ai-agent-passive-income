const fs = require('fs');
const path = require('path');

// 批量13：案例研究（5个）
const caseStudies = [
  { company: "TechFlow", industry: "SaaS", result: "80% reduction in security incidents", quote: "We went from reactive to proactive" },
  { company: "DataSync", industry: "Fintech", result: "SOC 2 Type II in 4 months", quote: "Passed audit on first try" },
  { company: "CloudBase", industry: "DevOps", result: "$50K saved on security tools", quote: "Enterprise features at startup prices" },
  { company: "SecureApps", industry: "Healthcare", result: "HIPAA compliance achieved", quote: "Finally, security we can afford" },
  { company: "CodeCraft", industry: "Agency", result: "3x faster client onboarding", quote: "Security as a competitive advantage" }
];

const csDir = path.join(__dirname, 'ai-agent-projects', 'content', 'case-studies');
fs.mkdirSync(csDir, { recursive: true });

caseStudies.forEach((cs, i) => {
  let content = `# Case Study: ${cs.company}\n\n`;
  content += `**Industry:** ${cs.industry}  \n`;
  content += `**Result:** ${cs.result}\n\n`;
  content += `## Challenge\n[Problem description]\n\n`;
  content += `## Solution\n[How they used the product]\n\n`;
  content += `## Results\n${cs.result}\n\n`;
  content += `## Testimonial\n"${cs.quote}"\n`;
  fs.writeFileSync(path.join(csDir, `case-study-${String(i+1).padStart(2,'0')}-${cs.company.toLowerCase()}.md`), content);
});

// 批量14：竞品对比文档
const comparisons = [
  { us: "AI Security Monitor", competitor: "Snyk", ourWin: "Price", theirWin: "Enterprise features" },
  { us: "AI Security Monitor", competitor: "Veracode", ourWin: "Speed", theirWin: "Compliance depth" },
  { us: "AI Security Monitor", competitor: "Checkmarx", ourWin: "UX", theirWin: "Language support" }
];

const compDir = path.join(__dirname, 'ai-agent-projects', 'content', 'comparisons');
fs.mkdirSync(compDir, { recursive: true });

comparisons.forEach((comp, i) => {
  let content = `# ${comp.us} vs ${comp.competitor}\n\n`;
  content += `## Where We Win\n- ${comp.ourWin}\n\n`;
  content += `## Where They Win\n- ${comp.theirWin}\n\n`;
  content += `## Bottom Line\n[Recommendation]\n`;
  fs.writeFileSync(path.join(compDir, `comparison-${i+1}.md`), content);
});

// 批量15：销售话术
const salesScripts = {
  discovery: ["What's your biggest security concern?", "How are you handling compliance?", "What's your current security budget?"],
  objectionHandling: { price: "Let's talk about ROI...", features: "Let me show you our roadmap...", timing: "Here's why starting now matters..." },
  closing: ["Ready to get started?", "Shall we set up your account?", "Would you like a trial?" ]
};

const salesDir = path.join(__dirname, 'ai-agent-projects', 'sales');
fs.mkdirSync(salesDir, { recursive: true });

let salesContent = `# Sales Scripts\n\n## Discovery Questions\n`;
salesScripts.discovery.forEach(q => salesContent += `- ${q}\n`);
salesContent += `\n## Objection Handling\n`;
Object.entries(salesScripts.objectionHandling).forEach(([k, v]) => salesContent += `- ${k}: ${v}\n`);
salesContent += `\n## Closing\n`;
salesScripts.closing.forEach(c => salesContent += `- ${c}\n`);
fs.writeFileSync(path.join(salesDir, 'sales-scripts.md'), salesContent);

console.log('✅ Batch 13: 5 case studies');
console.log('✅ Batch 14: 3 competitor comparisons');
console.log('✅ Batch 15: Sales scripts');
