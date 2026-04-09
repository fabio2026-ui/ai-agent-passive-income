#!/usr/bin/env node
/**
 * 邮件营销内容生成器 - 自动化邮件营销内容创建
 */

const fs = require('fs');
const path = require('path');

class EmailMarketingGenerator {
    constructor(options = {}) {
        this.outputDir = options.outputDir || './email-marketing';
        this.senderName = options.senderName || 'AI Agent团队';
        this.senderEmail = options.senderEmail || 'team@ai-agent-income.com';
        this.ensureOutputDir();
    }
    
    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        ['sequences', 'newsletters', 'promotions', 'templates'].forEach(subdir => {
            const dir = path.join(this.outputDir, subdir);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });
    }
    
    /**
     * 欢迎邮件序列
     */
    generateWelcomeSequence() {
        const sequence = [
            {
                id: 'welcome-1',
                subject: '欢迎加入AI Agent被动收入社区！🎉',
                sendDelay: 'immediate',
                content: {
                    html: this.wrapEmailTemplate(`
                        <h1>欢迎加入！</h1>
                        <p>你好，{{firstName}}！</p>
                        <p>感谢你订阅AI Agent被动收入导航。我是小七，将帮助你探索AI变现的无限可能。</p>
                        
                        <h2>🚀 从这里开始</h2>
                        <ul>
                            <li><a href="{{siteUrl}}/getting-started">新手指南</a> - 30分钟了解全貌</li>
                            <li><a href="{{siteUrl}}/tools">必备工具箱</a> - 精选AI工具推荐</li>
                            <li><a href="{{siteUrl}}/cases">成功案例</a> - 看别人如何月入过万</li>
                        </ul>
                        
                        <h2>💡 本周推荐</h2>
                        <p>刚入门？从这篇开始：<a href="{{siteUrl}}/ai-agent-intro">AI Agent完全入门指南</a></p>
                        
                        <p>有任何问题直接回复这封邮件，我会亲自解答。</p>
                        
                        <p>祝好，<br>小七</p>
                    `),
                    text: `欢迎加入AI Agent被动收入社区！

你好，{{firstName}}！

感谢你订阅。我是小七，将帮助你探索AI变现的无限可能。

从这里开始：
- 新手指南: {{siteUrl}}/getting-started
- 必备工具: {{siteUrl}}/tools  
- 成功案例: {{siteUrl}}/cases

刚入门？推荐阅读：AI Agent完全入门指南

任何问题请回复邮件。

祝好，
小七`
                }
            },
            {
                id: 'welcome-2',
                subject: 'AI变现的5种模式（附收入预测）',
                sendDelay: '2 days',
                content: {
                    html: this.wrapEmailTemplate(`
                        <h1>5种经过验证的AI变现模式</h1>
                        
                        <p>你好 {{firstName}}，</p>
                        
                        <p>昨天我们聊了入门，今天来看看具体的变现路径。</p>
                        
                        <h2>💰 模式一：AI内容业务</h2>
                        <p>用AI规模化生产内容，通过广告和联盟变现。</p>
                        <p><strong>收入潜力：</strong>$2,000-$10,000/月</p>
                        <p><strong>启动成本：</strong>$100-$500</p>
                        <p><a href="{{siteUrl}}/ai-content-business">查看完整指南 →</a></p>
                        
                        <h2>🤖 模式二：AI SaaS工具</h2>
                        <p>开发解决特定问题的AI工具，按月订阅收费。</p>
                        <p><strong>收入潜力：</strong>$5,000-$50,000/月</p>
                        <p><strong>启动成本：</strong>$500-$2,000</p>
                        
                        <h2>⚡ 模式三：自动化服务</h2>
                        <p>为企业搭建AI自动化工作流。</p>
                        <p><strong>收入潜力：</strong>$3,000-$20,000/项目</p>
                        
                        <h2>📚 模式四：数字产品</h2>
                        <p>销售AI提示词包、模板、课程。</p>
                        <p><strong>收入潜力：</strong>$1,000-$5,000/月</p>
                        
                        <h2>🎯 模式五：咨询和培训</h2>
                        <p>为个人和企业提供AI实施咨询。</p>
                        <p><strong>收入潜力：</strong>$100-$500/小时</p>
                        
                        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>🎁 专属福利</h3>
                            <p>回复这封邮件告诉我你最感兴趣的模式，我会发送对应的深度指南。</p>
                        </div>
                        
                        <p>明天我会分享第一个案例研究。</p>
                        
                        <p>小七</p>
                    `),
                    text: `5种AI变现模式

你好 {{firstName}}，

今天分享经过验证的变现路径：

1. AI内容业务
   收入潜力：$2,000-$10,000/月
   指南：{{siteUrl}}/ai-content-business

2. AI SaaS工具
   收入潜力：$5,000-$50,000/月

3. 自动化服务
   收入潜力：$3,000-$20,000/项目

4. 数字产品
   收入潜力：$1,000-$5,000/月

5. 咨询培训
   收入潜力：$100-$500/小时

专属福利：回复邮件告诉我你最感兴趣的模式，发送深度指南。

明天分享案例研究。

小七`
                }
            },
            {
                id: 'welcome-3',
                subject: '案例研究：他如何用AI月入$8,000',
                sendDelay: '4 days',
                content: {
                    html: this.wrapEmailTemplate(`
                        <h1>真实案例：从0到$8,000/月</h1>
                        
                        <p>今天分享一个社区成员的真实故事。</p>
                        
                        <h2>👤 主角背景</h2>
                        <p>张明，前端开发，2023年9月开始尝试AI变现。</p>
                        
                        <h2>🛠️ 他的做法</h2>
                        
                        <h3>第一阶段（月1-2）：验证想法</h3>
                        <ul>
                            <li>在Twitter分享AI自动化技巧</li>
                            <li>收集100个关注者的痛点</li>
                            <li>发现"自动化报告生成"需求强烈</li>
                        </ul>
                        
                        <h3>第二阶段（月3-4）：MVP开发</h3>
                        <ul>
                            <li>用n8n + GPT-4搭建原型</li>
                            <li>找5个beta用户免费试用</li>
                            <li>根据反馈迭代3个版本</li>
                        </ul>
                        
                        <h3>第三阶段（月5-6）：正式推出</h3>
                        <ul>
                            <li>Product Hunt发布，当天100+注册</li>
                            <li>定价$29/月，转化率8%</li>
                            <li>现在稳定收入$8,000/月</li>
                        </ul>
                        
                        <h2>💡 关键成功因素</h2>
                        <ol>
                            <li><strong>从痛点出发</strong> - 不是先造产品再找用户</li>
                            <li><strong>快速验证</strong> - 2周内做出可演示原型</li>
                            <li><strong>持续迭代</strong> - 每周发布新版本</li>
                            <li><strong>社区运营</strong> - 建立用户微信群</li>
                        </ol>
                        
                        <div style="background: #eff6ff; padding: 20px; border-radius: 8px;">
                            <p><strong>你想复制这个成功吗？</strong></p>
                            <p>我整理了一份详细的执行手册，包含：</p>
                            <ul>
                                <li>完整技术栈</li>
                                <li>代码模板</li>
                                <li>营销文案</li>
                            </ul>
                            <p><a href="{{siteUrl}}/case-study-details" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">获取完整案例 →</a></p>
                        </div>
                        
                        <p>下周开始，我会分享具体的技术实现。</p>
                        
                        <p>小七</p>
                    `)
                }
            }
        ];
        
        this.saveSequence('welcome-sequence', sequence);
        return sequence;
    }
    
    /**
     * 每周通讯模板
     */
    generateNewsletterTemplate(weekNum) {
        const topics = [
            {
                week: 1,
                theme: 'AI Agent工具更新',
                highlight: 'OpenAI发布Assistants v2',
                tips: [
                    '新的文件检索功能提升50%准确率',
                    '支持更大上下文窗口',
                    '定价降低30%'
                ]
            },
            {
                week: 2,
                theme: '被动收入机会',
                highlight: 'AI视频生成工具需求爆发',
                tips: [
                    'Sora竞品涌现',
                    '企业培训视频制作需求增长',
                    '入门门槛比想象低'
                ]
            },
            {
                week: 3,
                theme: '自动化工作流',
                highlight: 'n8n发布重大更新',
                tips: [
                    '新增AI节点',
                    '工作流执行速度提升3倍',
                    '更好的错误处理'
                ]
            }
        ];
        
        const topic = topics[(weekNum - 1) % topics.length];
        
        return {
            id: `newsletter-week-${weekNum}`,
            subject: `AI周刊 #${weekNum}: ${topic.highlight}`,
            content: {
                html: this.wrapEmailTemplate(`
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #6366f1, #ec4899); color: white; border-radius: 8px; margin-bottom: 30px;">
                        <h1>AI Agent 周刊 #${weekNum}</h1>
                        <p>${topic.theme}</p>
                    </div>
                    
                    <h2>🔥 本周热点</h2>
                    <h3>${topic.highlight}</h3>
                    <p>详细解读本周最重要的AI行业动态...</p>
                    
                    <h2>💡 3个实用技巧</h2>
                    ${topic.tips.map(tip => `<p>• ${tip}</p>`).join('')}
                    
                    <h2>📊 社区数据</h2>
                    <ul>
                        <li>新增成员：+${150 + weekNum * 10}人</li>
                        <li>本周最热门话题：${topic.theme}</li>
                        <li>收入分享总额：$${8000 + weekNum * 500}</li>
                    </ul>
                    
                    <h2>🎯 本周行动建议</h2>
                    <p>选一个技巧，本周内实践。记住：<strong>行动 > 完美</strong></p>
                    
                    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 30px;">
                        <h3>💬 加入讨论</h3>
                        <p>对本周内容有疑问？<a href="{{communityUrl}}">来社区讨论</a></p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                        收到这封邮件是因为你订阅了AI Agent被动收入周刊。<br>
                        <a href="{{unsubscribeUrl}}">取消订阅</a>
                    </p>
                `)
            }
        };
    }
    
    /**
     * 促销活动邮件
     */
    generatePromotionalEmails() {
        const promotions = [
            {
                id: 'promo-course-launch',
                subject: '🚀 新课上线：《AI Agent实战营》早鸟价开启',
                type: 'launch',
                urgency: 'high',
                content: {
                    html: this.wrapEmailTemplate(`
                        <div style="background: #fef3c7; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
                            <strong>⏰ 早鸟优惠仅剩48小时</strong>
                        </div>
                        
                        <h1>《AI Agent实战营》正式上线</h1>
                        
                        <p>经过3个月打磨，我们的首个系统课程终于来了。</p>
                        
                        <h2>📚 课程内容</h2>
                        <ul>
                            <li>模块1：AI Agent基础架构（4课时）</li>
                            <li>模块2：LangChain深度实践（6课时）</li>
                            <li>模块3：生产环境部署（4课时）</li>
                            <li>模块4：商业模式与变现（3课时）</li>
                            <li> bonus：5个完整项目源码</li>
                        </ul>
                        
                        <h2>💰 投资与回报</h2>
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr style="background: #f3f4f6;">
                                <td style="padding: 12px; border: 1px solid #e5e7eb;">课程价格</td>
                                <td style="padding: 12px; border: 1px solid #e5e7eb;"><s>$299</s> <strong style="color: #dc2626;">$149</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border: 1px solid #e5e7eb;">预期回报</td>
                                <td style="padding: 12px; border: 1px solid #e5e7eb;">$2,000+/月（3个月内）</td>
                            </tr>
                        </table>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{courseUrl}}?utm_source=email&utm_campaign=launch" style="background: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; display: inline-block;">
                                立即抢购 →
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px;">
                            30天无条件退款保证。如果课程对你没有帮助，全额退款，无需解释。
                        </p>
                    `)
                }
            },
            {
                id: 'promo-affiliate-push',
                subject: '邀请好友，赚取$50/人',
                type: 'affiliate',
                content: {
                    html: this.wrapEmailTemplate(`
                        <h1>💰 推荐有奖计划</h1>
                        
                        <p>你好 {{firstName}}，</p>
                        
                        <p>喜欢我们的内容？邀请朋友一起加入，赚取奖励。</p>
                        
                        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
                            <h2 style="margin: 0; font-size: 48px;">$50</h2>
                            <p style="margin: 10px 0 0 0;">每成功推荐1人</p>
                        </div>
                        
                        <h2>如何参与</h2>
                        <ol>
                            <li>获取你的专属链接：{{affiliateLink}}</li>
                            <li>分享给朋友或在社交媒体发布</li>
                            <li>好友通过链接订阅并付费</li>
                            <li>你获得$50奖励</li>
                        </ol>
                        
                        <h2>推广素材</h2>
                        <p>我们已经为你准备好了：</p>
                        <ul>
                            <li>社交媒体文案模板</li>
                            <li>宣传海报</li>
                            <li>邮件模板</li>
                        </ul>
                        <p><a href="{{affiliateResources}}">下载推广素材 →</a></p>
                        
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                            <h3>💡 推广小贴士</h3>
                            <p>最成功的推广者这样做：</p>
                            <ul>
                                <li>分享真实的个人体验</li>
                                <li>针对特定人群推荐（如"适合开发者的AI变现指南"）</li>
                                <li>持续分享价值，不只发推广</li>
                            </ul>
                        </div>
                        
                        <p><a href="{{affiliateDashboard}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">查看我的推广数据 →</a></p>
                    `)
                }
            }
        ];
        
        promotions.forEach(promo => {
            fs.writeFileSync(
                path.join(this.outputDir, 'promotions', `${promo.id}.json`),
                JSON.stringify(promo, null, 2)
            );
        });
        
        return promotions;
    }
    
    /**
     * 邮件模板包装器
     */
    wrapEmailTemplate(body) {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #1f2937; }
        h2 { color: #374151; margin-top: 30px; }
        a { color: #3b82f6; }
        ul, ol { padding-left: 20px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    ${body}
    <div class="footer">
        <p><strong>{{senderName}}</strong></p>
        <p>用AI创造被动收入</p>
        <p>
            <a href="{{siteUrl}}">网站</a> | 
            <a href="{{twitterUrl}}">Twitter</a> | 
            <a href="{{unsubscribeUrl}}">取消订阅</a>
        </p>
    </div>
</body>
</html>`;
    }
    
    /**
     * 保存邮件序列
     */
    saveSequence(name, sequence) {
        const filePath = path.join(this.outputDir, 'sequences', `${name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(sequence, null, 2));
        console.log(`✅ Saved sequence: ${filePath}`);
    }
    
    /**
     * 生成所有邮件内容
     */
    generateAll() {
        console.log('📧 Generating email marketing content...\n');
        
        // 1. 欢迎序列
        const welcomeSequence = this.generateWelcomeSequence();
        console.log(`✅ Welcome sequence: ${welcomeSequence.length} emails`);
        
        // 2. 每周通讯（生成4周）
        for (let i = 1; i <= 4; i++) {
            const newsletter = this.generateNewsletterTemplate(i);
            fs.writeFileSync(
                path.join(this.outputDir, 'newsletters', `week-${i}.json`),
                JSON.stringify(newsletter, null, 2)
            );
        }
        console.log('✅ Newsletters: 4 weeks');
        
        // 3. 促销邮件
        const promotions = this.generatePromotionalEmails();
        console.log(`✅ Promotions: ${promotions.length} campaigns`);
        
        // 4. 生成邮件配置
        const config = {
            sender: {
                name: this.senderName,
                email: this.senderEmail
            },
            sequences: [
                { name: 'welcome', emails: 3, trigger: 'subscription' }
            ],
            newsletters: {
                frequency: 'weekly',
                day: 'tuesday',
                time: '09:00'
            },
            generatedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(
            path.join(this.outputDir, 'email-config.json'),
            JSON.stringify(config, null, 2)
        );
        
        console.log('\n✅ Email marketing content generation complete!');
        console.log(`📁 Output: ${this.outputDir}/`);
        
        return {
            sequences: welcomeSequence.length,
            newsletters: 4,
            promotions: promotions.length,
            outputDir: this.outputDir
        };
    }
}

// CLI
if (require.main === module) {
    const generator = new EmailMarketingGenerator();
    generator.generateAll();
}

module.exports = EmailMarketingGenerator;
