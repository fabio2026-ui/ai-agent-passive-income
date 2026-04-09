/**
 * 测试入口
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');

describe('商机机器人测试套件', () => {
  test('配置文件加载', () => {
    const targets = require('./src/config/targets');
    assert.ok(targets.trends, '趋势配置存在');
    assert.ok(targets.competitors, '竞品配置存在');
    assert.ok(targets.reddit, 'Reddit配置存在');
  });
  
  test('存储工具', async () => {
    const storage = require('./src/utils/storage');
    
    // 测试保存和加载
    await storage.saveData('test', 'test.json', { test: true });
    const data = await storage.loadData('test', 'test.json');
    
    assert.strictEqual(data.test, true);
  });
  
  test('价格提取', () => {
    const { extractPrice } = require('./src/services/priceTracker');
    
    assert.deepStrictEqual(extractPrice('$99.99'), {
      value: 99.99,
      formatted: '$99.99',
      currency: 'USD'
    });
    
    assert.deepStrictEqual(extractPrice('€49.50/month'), {
      value: 49.50,
      formatted: '€49.50',
      currency: 'EUR'
    });
  });
  
  test('商机评分', () => {
    const { calculateOpportunityScore } = require('./src/modules/reddit');
    
    const mockPost = {
      score: 50,
      numComments: 20,
      title: 'Looking for an alternative to',
      selftext: '',
      isSelf: true,
      created: new Date().toISOString()
    };
    
    const score = calculateOpportunityScore(mockPost);
    assert.ok(score > 0, '评分应大于0');
    assert.ok(score <= 100, '评分应小于等于100');
  });
});
