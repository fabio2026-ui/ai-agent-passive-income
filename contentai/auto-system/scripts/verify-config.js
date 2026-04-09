#!/usr/bin/env node
/**
 * ContentAI 配置验证脚本
 * 检查所有必需配置是否正确
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 ContentAI 配置验证\n');
console.log('=' .repeat(50));

let errors = [];
let warnings = [];

// 检查.env文件
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  errors.push('❌ .env 文件不存在，请复制 .env.example 创建');
} else {
  console.log('✅ .env 文件存在');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // 检查必需配置
  const required = [
    { key: 'MOONSHOT_API_KEY', name: 'Moonshot AI API密钥' },
    { key: 'RESEND_API_KEY', name: 'Resend 邮件API密钥' }
  ];
  
  for (const { key, name } of required) {
    const regex = new RegExp(`${key}=([^\s#]+)`);
    const match = envContent.match(regex);
    
    if (!match || match[1].includes('your') || match[1].includes('...')) {
      errors.push(`❌ ${name} (${key}) 未配置或仍为默认值`);
    } else {
      console.log(`✅ ${name} 已配置`);
    }
  }
  
  // 检查可选配置
  const optional = [
    { key: 'STRIPE_SECRET_KEY', name: 'Stripe API密钥' }
  ];
  
  for (const { key, name } of optional) {
    const regex = new RegExp(`${key}=([^\s#]+)`);
    const match = envContent.match(regex);
    
    if (!match || match[1].includes('your') || match[1].includes('...')) {
      warnings.push(`⚠️ ${name} 未配置（可选，可后续添加）`);
    } else {
      console.log(`✅ ${name} 已配置`);
    }
  }
}

// 检查wrangler.toml
const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
if (!fs.existsSync(wranglerPath)) {
  errors.push('❌ wrangler.toml 不存在');
} else {
  console.log('✅ wrangler.toml 存在');
}

// 检查node_modules
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  warnings.push('⚠️ node_modules 不存在，运行 npm install');
} else {
  console.log('✅ 依赖已安装');
}

// 输出结果
console.log('\n' + '='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('🎉 所有配置检查通过！可以开始部署。');
  console.log('\n下一步：运行 ./deploy-mvp.sh');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log('\n❌ 错误（必须修复）：');
    errors.forEach(e => console.log('  ' + e));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ 警告（可选修复）：');
    warnings.forEach(w => console.log('  ' + w));
  }
  
  console.log('\n📖 查看 API 申请指南：docs/API_SETUP_GUIDE.md');
  process.exit(1);
}
