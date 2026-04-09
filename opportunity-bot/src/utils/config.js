/**
 * 配置工具
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

/**
 * 加载环境变量
 */
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    const result = dotenv.config();
    if (result.error) {
      console.error('加载 .env 文件失败:', result.error);
    }
  }
  
  // 确保必要目录存在
  const dirs = [
    process.env.DATA_DIR || './data',
    process.env.REPORTS_DIR || './reports',
    process.env.LOGS_DIR || './logs'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

module.exports = {
  loadEnv
};
