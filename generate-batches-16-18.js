const fs = require('fs');
const path = require('path');

// 批量16：入职邮件序列（客户成功）
const onboardingEmails = [
  { day: 0, subject: "Welcome! Let's get you secured 🛡️", focus: "Account setup" },
  { day: 1, subject: "Your first security scan is ready", focus: "First scan results" },
  { day: 3, subject: "3 quick wins for better security", focus: "Quick tips" },
  { day: 7, subject: "How's your first week?", focus: "Check-in" },
  { day: 14, subject: "Unlock advanced features", focus: "Upsell" }
];

const onboardDir = path.join(__dirname, 'ai-agent-projects', 'email-sequence', 'onboarding');
fs.mkdirSync(onboardDir, { recursive: true });

onboardingEmails.forEach((email, i) => {
  let content = `Subject: ${email.subject}\nDay: ${email.day}\nFocus: ${email.focus}\n\n[Email content placeholder]\n`;
  fs.writeFileSync(path.join(onboardDir, `onboard-day-${email.day}.md`), content);
});

// 批量17：功能更新日志（12个月）
const changelog = [
  { month: "Jan", feature: "GitHub Actions integration", type: "Integration" },
  { month: "Feb", feature: "Slack notifications", type: "Notification" },
  { month: "Mar", feature: "Custom rules engine", type: "Feature" },
  { month: "Apr", feature: "API v2 release", type: "API" },
  { month: "May", feature: "Team collaboration", type: "Feature" },
  { month: "Jun", feature: "Advanced reporting", type: "Reporting" }
];

const clDir = path.join(__dirname, 'ai-agent-projects', 'content', 'changelog');
fs.mkdirSync(clDir, { recursive: true });

let clContent = `# Product Changelog\n\n`;
changelog.forEach(item => {
  clContent += `## ${item.month} 2025\n- **${item.feature}** (${item.type})\n\n`;
});
fs.writeFileSync(path.join(clDir, 'changelog-2025.md'), clContent);

// 批量18：帮助文档模板
const helpDocs = [
  { title: "Getting Started", sections: ["Installation", "First Scan", "Understanding Results"] },
  { title: "Integrations", sections: ["GitHub", "Slack", "Jira", "CI/CD"] },
  { title: "Troubleshooting", sections: ["Common Issues", "Error Messages", "Contact Support"] }
];

const helpDir = path.join(__dirname, 'ai-agent-projects', 'content', 'help-docs');
fs.mkdirSync(helpDir, { recursive: true });

helpDocs.forEach((doc, i) => {
  let content = `# ${doc.title}\n\n`;
  doc.sections.forEach(s => content += `## ${s}\n[Content...]\n\n`);
  fs.writeFileSync(path.join(helpDir, `help-${String(i+1).padStart(2,'0')}-${doc.title.toLowerCase().replace(/\s+/g, '-')}.md`), content);
});

console.log('✅ Batch 16: 5 onboarding emails');
console.log('✅ Batch 17: 6-month changelog');
console.log('✅ Batch 18: 3 help documentation templates');
