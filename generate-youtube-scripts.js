const fs = require('fs');
const path = require('path');

// 生成YouTube视频脚本
const youtubeScripts = [
  {
    title: "How to Build a Security Monitoring System (Complete Tutorial)",
    duration: "15:00",
    type: "Tutorial",
    target: "Developers",
    sections: [
      { time: "0:00", content: "Intro: Hook with data breach statistics" },
      { time: "1:30", content: "What we're building: Overview of the system" },
      { time: "3:00", content: "Architecture: Components and data flow" },
      { time: "5:00", content: "Setting up the project" },
      { time: "7:00", content: "Implementing vulnerability scanner" },
      { time: "10:00", content: "Building the dashboard" },
      { time: "12:30", content: "Adding alerts and notifications" },
      { time: "14:00", content: "Deployment and testing" },
      { time: "14:45", content: "Outro and next steps" }
    ],
    cta: "Download the source code from GitHub"
  },
  {
    title: "I Automated My Security Monitoring (Here's What Happened)",
    duration: "12:00",
    type: "Story",
    target: "General Tech",
    sections: [
      { time: "0:00", content: "Hook: The $4.88M mistake I almost made" },
      { time: "2:00", content: "My manual security process (painful)" },
      { time: "4:00", content: "Building the automation" },
      { time: "7:00", content: "Results after 3 months" },
      { time: "9:00", content: "Lessons learned" },
      { time: "10:30", content: "Is automation worth it?" },
      { time: "11:30", content: "Call to action" }
    ],
    cta: "Try the tool free for 14 days"
  },
  {
    title: "SOC 2 Compliance Explained (For Startups)",
    duration: "18:00",
    type: "Educational",
    target: "Startup Founders",
    sections: [
      { time: "0:00", content: "What is SOC 2 and why you need it" },
      { time: "3:00", content: "Type I vs Type II explained" },
      { time: "5:00", content: "The 5 Trust Service Criteria" },
      { time: "8:00", content: "Step-by-step preparation guide" },
      { time: "12:00", content: "Common mistakes to avoid" },
      { time: "15:00", content: "Cost breakdown and timeline" },
      { time: "17:00", content: "Resources and next steps" }
    ],
    cta: "Download our free SOC 2 checklist"
  },
  {
    title: "Zero Trust Architecture in 10 Minutes",
    duration: "10:00",
    type: "Explainer",
    target: "DevOps Engineers",
    sections: [
      { time: "0:00", content: "What is Zero Trust?" },
      { time: "2:00", content: "Why traditional security fails" },
      { time: "4:00", content: "Core principles of Zero Trust" },
      { time: "6:00", content: "Implementation steps" },
      { time: "8:00", content: "Tools and technologies" },
      { time: "9:00", content: "Quick summary" }
    ],
    cta: "Learn more on our blog"
  },
  {
    title: "React App Security: Common Vulnerabilities and How to Fix Them",
    duration: "20:00",
    type: "Technical",
    target: "React Developers",
    sections: [
      { time: "0:00", content: "Introduction to React security" },
      { time: "2:00", content: "XSS vulnerabilities in React" },
      { time: "5:00", content: "Insecure dependencies" },
      { time: "8:00", content: "Authentication mistakes" },
      { time: "12:00", content: "Environment variable leaks" },
      { time: "15:00", content: "CORS misconfigurations" },
      { time: "18:00", content: "Security testing tools" },
      { time: "19:30", content: "Outro" }
    ],
    cta: "Get our React security checklist"
  }
];

// 生成脚本
const outputDir = path.join(__dirname, 'ai-agent-projects', 'marketing', 'youtube-scripts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

youtubeScripts.forEach((video, index) => {
  let script = `# ${video.title}\n\n`;
  script += `**Duration:** ${video.duration}  \n`;
  script += `**Type:** ${video.type}  \n`;
  script += `**Target Audience:** ${video.target}  \n`;
  script += `**CTA:** ${video.cta}\n\n`;
  script += `---\n\n`;
  script += `## Script\n\n`;
  
  video.sections.forEach(section => {
    script += `### [${section.time}] ${section.content}\n\n`;
    script += `[SCRIPT PLACEHOLDER]\n\n`;
    script += `**Visual:** [Describe what viewers see]\n`;
    script += `**Audio:** [Describe audio/music]\n\n`;
  });
  
  script += `---\n\n`;
  script += `## Production Notes\n\n`;
  script += `- **Equipment needed:** [Camera, mic, lighting]\n`;
  script += `- **Screen recording:** Yes/No\n`;
  script += `- **Graphics/Animations:** [List needed]\n`;
  script += `- **B-roll footage:** [List needed]\n\n`;
  script += `## SEO\n\n`;
  script += `- **Keywords:** [List 5-10]\n`;
  script += `- **Tags:** [List 15]\n`;
  script += `- **Thumbnail text:** [Hook text]\n\n`;
  
  const filename = `youtube-${String(index + 1).padStart(2, '0')}-${video.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40)}.md`;
  fs.writeFileSync(path.join(outputDir, filename), script);
  console.log(`✅ Generated: ${filename}`);
});

// 生成YouTube内容日历
const calendar = {
  strategy: "Weekly uploads, Tuesday 10AM EST",
  videos: youtubeScripts.map((v, i) => ({
    week: i + 1,
    title: v.title,
    type: v.type,
    target: v.target,
    prepTime: "3-4 hours",
    editTime: "4-6 hours"
  }))
};

fs.writeFileSync(
  path.join(outputDir, 'content-calendar.json'),
  JSON.stringify(calendar, null, 2)
);

console.log(`\n🎉 Generated ${youtubeScripts.length} YouTube video scripts!`);
console.log(`📁 Location: ${outputDir}`);
console.log(`📅 Publishing schedule: ${calendar.strategy}`);
