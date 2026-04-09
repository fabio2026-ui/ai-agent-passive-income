// Publish to Medium
const https = require('https');

const API_KEY = process.env.MEDIUM_API_KEY;
const AUTHOR_ID = process.env.MEDIUM_AUTHOR_ID;
const TITLE = process.env.POST_TITLE;
const BODY_BASE64 = process.env.POST_BODY;
const TAGS_JSON = process.env.POST_TAGS;
const CANONICAL_URL = process.env.POST_CANONICAL_URL;
const STATUS_JSON = process.env.PUBLISH_STATUS || '{}';

const BODY = Buffer.from(BODY_BASE64, 'base64').toString('utf8');
const TAGS = JSON.parse(TAGS_JSON || '[]');
const STATUS = JSON.parse(STATUS_JSON);

function setOutput(key, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    fs.appendFileSync(outputPath, `${key}=${value}\n`);
  }
}

// Check if already published
const postKey = TITLE.toLowerCase().replace(/[^a-z0-9]+/g, '-');
if (STATUS[postKey]?.medium?.id && process.env.FORCE_PUBLISH !== 'true') {
  console.log('ℹ️ Already published to Medium, skipping...');
  setOutput('result', JSON.stringify({ skipped: true, reason: 'already_published' }));
  process.exit(0);
}

const postData = JSON.stringify({
  title: TITLE,
  contentFormat: 'markdown',
  content: BODY,
  tags: TAGS.slice(0, 5), // Medium allows max 5 tags
  publishStatus: 'public',
  ...(CANONICAL_URL && { canonicalUrl: CANONICAL_URL })
});

const options = {
  hostname: 'api.medium.com',
  path: `/v1/users/${AUTHOR_ID}/posts`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (res.statusCode >= 200 && res.statusCode < 300 && result.data) {
        const post = result.data;
        console.log('✅ Published to Medium successfully!');
        console.log(`   URL: ${post.url}`);
        console.log(`   ID: ${post.id}`);
        
        setOutput('result', JSON.stringify({
          success: true,
          id: post.id,
          url: post.url,
          publishedAt: new Date().toISOString()
        }));
      } else if (result.errors) {
        // Medium API may return errors for various reasons
        const errorMsg = result.errors[0]?.message || 'Medium API error';
        console.error('❌ Medium API error:', errorMsg);
        
        // Check if it's an authorization issue (common with Medium API)
        if (res.statusCode === 401 || res.statusCode === 403) {
          console.log('⚠️ Medium API authorization failed. Consider using manual import:');
          console.log(`   1. Go to https://medium.com/p/import`);
          console.log(`   2. Paste your canonical URL: ${CANONICAL_URL || 'YOUR_URL'}`);
          console.log(`   3. Medium will import the content`);
        }
        
        setOutput('result', JSON.stringify({
          success: false,
          error: errorMsg,
          statusCode: res.statusCode,
          suggestion: 'Use Medium import tool manually'
        }));
        
        // Don't fail the workflow for Medium - it's often problematic
        process.exit(0);
      } else {
        console.error('❌ Unexpected response:', result);
        setOutput('result', JSON.stringify({ 
          success: false, 
          error: 'Unexpected response',
          statusCode: res.statusCode
        }));
        process.exit(0); // Don't fail workflow
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      setOutput('result', JSON.stringify({ success: false, error: e.message }));
      process.exit(0); // Don't fail workflow
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
  setOutput('result', JSON.stringify({ success: false, error: error.message }));
  process.exit(0); // Don't fail workflow for Medium
});

req.write(postData);
req.end();
