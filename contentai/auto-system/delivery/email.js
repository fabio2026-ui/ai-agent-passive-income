/**
 * ContentAI 自动化系统 - 邮件交付模块
 * 集成 Resend API 自动发送生成的内容
 */

import { CONFIG } from '../shared/config.js';
import { log } from '../shared/utils.js';

/**
 * 生成邮件模板
 */
export function generateEmailTemplate(order, content) {
  const { id, topic, content_type } = order;
  
  const contentTypeNames = {
    blog_post: '博客文章',
    product_desc: '产品描述',
    social_post: '社交媒体帖子',
    email_copy: '邮件文案',
    ad_copy: '广告文案',
    seo_article: 'SEO文章',
    video_script: '视频脚本',
    whitepaper: '白皮书'
  };
  
  const contentTypeName = contentTypeNames[content_type] || '内容';
  
  return {
    subject: `✅ 您的 ${contentTypeName} 已生成完成 - Order #${id}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .content-box { background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 内容生成完成！</h1>
    <p>您的 ${contentTypeName} 已准备就绪</p>
  </div>
  
  <div class="content">
    <p>您好，</p>
    
    <p>感谢您使用 ContentAI！您订购的以下内容已成功生成：</p>
    
    <ul>
      <li><strong>订单编号：</strong> #${id}</li>
      <li><strong>内容类型：</strong> ${contentTypeName}</li>
      <li><strong>主题：</strong> ${topic}</li>
      <li><strong>字数：</strong> ${content.length} 字符</li>
    </ul>
    
    <div class="content-box">
      <h3>📄 生成的内容：</h3>
      <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
    
    <p><strong>💡 使用提示：</strong></p>
    <ul>
      <li>以上内容已根据您的要求定制生成</li>
      <li>您可以直接复制使用，或根据需要进行微调</li>
      <li>建议检查是否符合您的品牌调性</li>
    </ul>
    
    <div class="footer">
      <p>如有任何问题，请回复此邮件联系我们。</p>
      <p>© ${new Date().getFullYear()} ContentAI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
ContentAI - 内容生成完成

您好，

感谢您使用 ContentAI！您订购的以下内容已成功生成：

订单编号：#${id}
内容类型：${contentTypeName}
主题：${topic}
字数：${content.length} 字符

=== 生成的内容 ===

${content}

==================

使用提示：
- 以上内容已根据您的要求定制生成
- 您可以直接复制使用，或根据需要进行微调
- 建议检查是否符合您的品牌调性

如有任何问题，请联系我们。

© ${new Date().getFullYear()} ContentAI. All rights reserved.
    `.trim()
  };
}

/**
 * 发送邮件
 */
export async function sendEmail(to, template, apiKey = CONFIG.RESEND_API_KEY) {
  if (!apiKey) {
    throw new Error('Resend API key not configured');
  }
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: CONFIG.EMAIL_FROM,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    log('info', 'Email sent successfully', {
      to,
      messageId: data.id,
      subject: template.subject
    });
    
    return {
      success: true,
      messageId: data.id
    };
    
  } catch (error) {
    log('error', 'Failed to send email', {
      to,
      error: error.message
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 发送内容交付邮件
 */
export async function deliverContent(order, db, apiKey = CONFIG.RESEND_API_KEY) {
  const { id, email, generated_content } = order;
  
  if (!generated_content) {
    log('error', 'No content to deliver', { orderId: id });
    return { success: false, error: 'No content available' };
  }
  
  // 生成邮件模板
  const template = generateEmailTemplate(order, generated_content);
  
  // 记录邮件发送
  const emailId = `EMAIL-${Date.now()}`;
  await db.createEmailDelivery({
    id: emailId,
    order_id: id,
    email,
    subject: template.subject,
    created_at: new Date().toISOString()
  });
  
  try {
    // 发送邮件
    const result = await sendEmail(email, template, apiKey);
    
    if (result.success) {
      // 更新邮件记录
      await db.updateEmailStatus(emailId, 'sent', {
        sent_at: new Date().toISOString(),
        provider_response: { messageId: result.messageId }
      });
      
      // 更新订单状态为已交付
      await db.updateOrderStatus(id, 'delivered', {
        delivered_at: new Date().toISOString()
      });
      
      log('info', 'Content delivered successfully', {
        orderId: id,
        emailId,
        messageId: result.messageId
      });
      
      return {
        success: true,
        orderId: id,
        emailId,
        messageId: result.messageId
      };
    } else {
      throw new Error(result.error);
    }
    
  } catch (error) {
    // 更新邮件记录为失败
    await db.updateEmailStatus(emailId, 'failed', {
      provider_response: { error: error.message }
    });
    
    log('error', 'Content delivery failed', {
      orderId: id,
      error: error.message
    });
    
    return {
      success: false,
      orderId: id,
      error: error.message
    };
  }
}

/**
 * 批量处理待交付订单
 */
export async function processPendingDeliveries(db, limit = 10) {
  // 获取已完成但未交付的订单
  const { results } = await db.d1.prepare(
    'SELECT * FROM orders WHERE status = ? ORDER BY completed_at ASC LIMIT ?'
  ).bind('completed', limit).all();
  
  const orders = results || [];
  const results2 = [];
  
  for (const order of orders) {
    const result = await deliverContent(order, db);
    results2.push(result);
    
    // 避免触发 API 限流
    if (orders.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results2;
}

/**
 * 发送订单确认邮件（支付前）
 */
export async function sendOrderConfirmation(order, paymentUrl, apiKey = CONFIG.RESEND_API_KEY) {
  const { id, email, topic, content_type, price } = order;
  
  const contentTypeNames = {
    blog_post: '博客文章',
    product_desc: '产品描述',
    social_post: '社交媒体帖子',
    email_copy: '邮件文案',
    ad_copy: '广告文案',
    seo_article: 'SEO文章',
    video_script: '视频脚本',
    whitepaper: '白皮书'
  };
  
  const contentTypeName = contentTypeNames[content_type] || '内容';
  
  const template = {
    subject: `📝 订单已创建 - Order #${id}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📝 订单已创建！</h1>
    <p>请完成支付以开始生成您的内容</p>
  </div>
  
  <div class="content">
    <p>您好，</p>
    
    <p>感谢您使用 ContentAI！您的订单已创建成功：</p>
    
    <ul>
      <li><strong>订单编号：</strong> #${id}</li>
      <li><strong>内容类型：</strong> ${contentTypeName}</li>
      <li><strong>主题：</strong> ${topic}</li>
      <li><strong>金额：</strong> $${price} USD</li>
    </ul>
    
    <p>请点击下方按钮完成支付：</p>
    
    <a href="${paymentUrl}" class="button">立即支付</a>
    
    <p>支付完成后，我们的 AI 将立即开始为您生成内容，并在完成后通过邮件发送给您。</p>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} ContentAI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
ContentAI - 订单已创建

您好，

感谢您使用 ContentAI！您的订单已创建成功：

订单编号：#${id}
内容类型：${contentTypeName}
主题：${topic}
金额：$${price} USD

请点击以下链接完成支付：
${paymentUrl}

支付完成后，我们的 AI 将立即开始为您生成内容，并在完成后通过邮件发送给您。

© ${new Date().getFullYear()} ContentAI. All rights reserved.
    `.trim()
  };
  
  return await sendEmail(email, template, apiKey);
}

export default {
  generateEmailTemplate,
  sendEmail,
  deliverContent,
  processPendingDeliveries,
  sendOrderConfirmation
};
