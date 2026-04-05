// Quick test script for all AI Agent projects

const SecurityContentFactory = require('./project1-content-factory/src/generator.js');
const SecurityScanService = require('./project2-scan-service/src/scan-service.js');
const SocialMediaBot = require('./project3-social-automation/src/social-bot.js');
const AffiliateBot = require('./project4-affiliate-auto/src/affiliate-bot.js');

async function testAll() {
  console.log('🧪 Testing AI Agent Projects\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Content Factory
  try {
    console.log('Test 1: Content Factory');
    const factory = new SecurityContentFactory('test-key');
    console.log('  ✅ Instantiated successfully');
    results.passed++;
    results.tests.push({ name: 'Content Factory', status: 'passed' });
  } catch (error) {
    console.log('  ❌ Failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Content Factory', status: 'failed', error: error.message });
  }

  // Test 2: Scan Service
  try {
    console.log('\nTest 2: Scan Service');
    const scanner = new SecurityScanService('https://test.com');
    console.log('  ✅ Instantiated successfully');
    results.passed++;
    results.tests.push({ name: 'Scan Service', status: 'passed' });
  } catch (error) {
    console.log('  ❌ Failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Scan Service', status: 'failed', error: error.message });
  }

  // Test 3: Social Bot
  try {
    console.log('\nTest 3: Social Bot');
    const bot = new SocialMediaBot({ claudeApiKey: 'test' });
    console.log('  ✅ Instantiated successfully');
    results.passed++;
    results.tests.push({ name: 'Social Bot', status: 'passed' });
  } catch (error) {
    console.log('  ❌ Failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Social Bot', status: 'failed', error: error.message });
  }

  // Test 4: Affiliate Bot
  try {
    console.log('\nTest 4: Affiliate Bot');
    const bot = new AffiliateBot({ claudeApiKey: 'test' });
    console.log('  ✅ Instantiated successfully');
    results.passed++;
    results.tests.push({ name: 'Affiliate Bot', status: 'passed' });
  } catch (error) {
    console.log('  ❌ Failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Affiliate Bot', status: 'failed', error: error.message });
  }

  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Total:  ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed');
  }

  return results;
}

if (require.main === module) {
  testAll().then(() => process.exit(0));
}

module.exports = testAll;