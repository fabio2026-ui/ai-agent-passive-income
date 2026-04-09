/**
 * 数据存储工具 - 简单的 JSON 文件存储
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

const DATA_DIR = process.env.DATA_DIR || './data';

/**
 * 确保目录存在
 */
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * 保存数据到文件
 */
async function saveData(category, filename, data) {
  const dirPath = path.join(DATA_DIR, category);
  await ensureDir(dirPath);
  
  const filePath = path.join(dirPath, filename);
  const content = JSON.stringify(data, null, 2);
  
  await fs.writeFile(filePath, content, 'utf8');
  logger.debug(`数据已保存: ${filePath}`);
  return filePath;
}

/**
 * 从文件读取数据
 */
async function loadData(category, filename) {
  const filePath = path.join(DATA_DIR, category, filename);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * 列出目录中的所有文件
 */
async function listFiles(category) {
  const dirPath = path.join(DATA_DIR, category);
  
  try {
    await ensureDir(dirPath);
    const files = await fs.readdir(dirPath);
    return files.filter(f => f.endsWith('.json'));
  } catch (error) {
    return [];
  }
}

/**
 * 读取多个数据文件
 */
async function loadMultiple(category, filenames) {
  const results = [];
  
  for (const filename of filenames) {
    const data = await loadData(category, filename);
    if (data) {
      results.push({ filename, data });
    }
  }
  
  return results;
}

/**
 * 读取最近 N 天的数据
 */
async function loadRecent(category, days = 7) {
  const files = await listFiles(category);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentFiles = files.filter(filename => {
    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      const fileDate = new Date(dateMatch[1]);
      return fileDate >= cutoffDate;
    }
    return false;
  });
  
  return loadMultiple(category, recentFiles);
}

/**
 * 追加数据到日志文件
 */
async function appendLog(category, data) {
  const date = new Date().toISOString().split('T')[0];
  const filename = `${date}.log.json`;
  const dirPath = path.join(DATA_DIR, category);
  
  await ensureDir(dirPath);
  const filePath = path.join(dirPath, filename);
  
  let existing = [];
  try {
    const content = await fs.readFile(filePath, 'utf8');
    existing = JSON.parse(content);
  } catch {
    // 文件不存在或为空
  }
  
  existing.push({
    timestamp: new Date().toISOString(),
    ...data
  });
  
  await fs.writeFile(filePath, JSON.stringify(existing, null, 2), 'utf8');
}

module.exports = {
  saveData,
  loadData,
  listFiles,
  loadMultiple,
  loadRecent,
  appendLog
};
