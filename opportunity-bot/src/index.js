/**
 * 主入口文件 - 启动所有定时任务
 */

const cron = require('node-cron');
const logger = require('./utils/logger');
const { loadEnv } = require('./utils/config');

// 加载环境变量
loadEnv();

// 导入各个模块
const trendsModule = require('./modules/trends');
const pricingModule = require('./modules/pricing');
const redditModule = require('./modules/reddit');
const reportModule = require('./modules/report');

// 任务状态跟踪
const taskStatus = new Map();

/**
 * 安全执行任务
 */
async function safeExecute(taskName, taskFn) {
  const startTime = Date.now();
  logger.info(`[${taskName}] 任务开始执行`);
  
  try {
    taskStatus.set(taskName, { status: 'running', startTime });
    await taskFn();
    const duration = Date.now() - startTime;
    taskStatus.set(taskName, { status: 'success', lastRun: new Date(), duration });
    logger.info(`[${taskName}] 任务执行成功，耗时 ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    taskStatus.set(taskName, { status: 'error', lastRun: new Date(), duration, error: error.message });
    logger.error(`[${taskName}] 任务执行失败: ${error.message}`);
  }
}

/**
 * 显示任务状态
 */
function showStatus() {
  logger.info('========== 任务状态 ==========');
  taskStatus.forEach((status, name) => {
    logger.info(`${name}: ${status.status} (上次运行: ${status.lastRun || '从未'})`);
  });
  logger.info('==============================');
}

/**
 * 初始化并启动所有定时任务
 */
function init() {
  logger.info('🚀 商机发现机器人启动中...');

  // 每日 9:00 执行趋势搜索
  cron.schedule('0 9 * * *', () => {
    safeExecute('趋势监控', trendsModule.run);
  });
  logger.info('✅ 趋势监控任务已设置 (每天 9:00)');

  // 每 4 小时执行价格监控
  cron.schedule('0 */4 * * *', () => {
    safeExecute('价格监控', pricingModule.run);
  });
  logger.info('✅ 价格监控任务已设置 (每 4 小时)');

  // 每小时执行 Reddit 监听
  cron.schedule('0 * * * *', () => {
    safeExecute('Reddit监听', redditModule.run);
  });
  logger.info('✅ Reddit监听任务已设置 (每小时)');

  // 每周一 10:00 生成周报
  cron.schedule('0 10 * * 1', () => {
    safeExecute('周报生成', reportModule.run);
  });
  logger.info('✅ 周报生成任务已设置 (每周一 10:00)');

  // 每 30 分钟显示一次状态
  cron.schedule('*/30 * * * *', showStatus);

  logger.info('\n🤖 所有任务已启动，机器人运行中...\n');

  // 立即执行一次各模块检查（用于测试）
  if (process.argv.includes('--run-now')) {
    logger.info('⚡ 立即执行模式开启');
    setTimeout(() => {
      safeExecute('趋势监控', trendsModule.run);
      safeExecute('价格监控', pricingModule.run);
      safeExecute('Reddit监听', redditModule.run);
    }, 2000);
  }
}

// 处理进程信号
process.on('SIGINT', () => {
  logger.info('\n👋 收到中断信号，正在关闭...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝:', reason);
});

// 启动
init();
