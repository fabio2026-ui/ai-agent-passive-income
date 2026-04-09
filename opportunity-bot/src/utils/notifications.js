/**
 * 通知服务 - 支持邮件、钉钉、飞书、Slack
 */

const nodemailer = require('nodemailer');
const axios = require('axios');
const logger = require('./logger');

/**
 * 发送邮件通知
 */
async function sendEmail(subject, content, options = {}) {
  if (process.env.EMAIL_ENABLED !== 'true') {
    logger.debug('邮件通知已禁用');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"商机机器人" <${process.env.EMAIL_USER}>`,
    to: options.to || process.env.EMAIL_TO,
    subject,
    text: content,
    html: options.html || `<pre>${content}</pre>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`邮件发送成功: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('邮件发送失败:', error.message);
    return false;
  }
}

/**
 * 发送钉钉消息
 */
async function sendDingTalk(message, options = {}) {
  const webhook = options.webhook || process.env.DINGTALK_WEBHOOK;
  if (!webhook) {
    logger.debug('钉钉 webhook 未配置');
    return false;
  }

  const payload = {
    msgtype: 'markdown',
    markdown: {
      title: options.title || '商机机器人通知',
      text: message
    }
  };

  try {
    await axios.post(webhook, payload);
    logger.info('钉钉消息发送成功');
    return true;
  } catch (error) {
    logger.error('钉钉消息发送失败:', error.message);
    return false;
  }
}

/**
 * 发送飞书消息
 */
async function sendFeishu(message, options = {}) {
  const webhook = options.webhook || process.env.FEISHU_WEBHOOK;
  if (!webhook) {
    logger.debug('飞书 webhook 未配置');
    return false;
  }

  const payload = {
    msg_type: 'interactive',
    card: {
      header: {
        title: {
          tag: 'plain_text',
          content: options.title || '商机机器人通知'
        }
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: message
          }
        }
      ]
    }
  };

  try {
    await axios.post(webhook, payload);
    logger.info('飞书消息发送成功');
    return true;
  } catch (error) {
    logger.error('飞书消息发送失败:', error.message);
    return false;
  }
}

/**
 * 发送 Slack 消息
 */
async function sendSlack(message, options = {}) {
  const webhook = options.webhook || process.env.SLACK_WEBHOOK;
  if (!webhook) {
    logger.debug('Slack webhook 未配置');
    return false;
  }

  const payload = {
    text: options.title || '商机机器人通知',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: options.title || '商机机器人通知'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ]
  };

  try {
    await axios.post(webhook, payload);
    logger.info('Slack 消息发送成功');
    return true;
  } catch (error) {
    logger.error('Slack 消息发送失败:', error.message);
    return false;
  }
}

/**
 * 发送通知到所有配置的渠道
 */
async function notifyAll(message, options = {}) {
  const results = await Promise.allSettled([
    sendEmail(options.title || '商机机器人通知', message, options),
    sendDingTalk(message, options),
    sendFeishu(message, options),
    sendSlack(message, options)
  ]);

  return results.map((result, index) => ({
    channel: ['email', 'dingtalk', 'feishu', 'slack'][index],
    success: result.status === 'fulfilled' && result.value
  }));
}

/**
 * 发送重要告警
 */
async function sendAlert(title, message, options = {}) {
  const alertMessage = `🚨 **${title}**\n\n${message}`;
  return notifyAll(alertMessage, { ...options, title: `🚨 ${title}` });
}

module.exports = {
  sendEmail,
  sendDingTalk,
  sendFeishu,
  sendSlack,
  notifyAll,
  sendAlert
};
