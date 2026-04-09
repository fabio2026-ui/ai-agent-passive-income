// Publish to Dev.to
const https = require('https');

const API_KEY = process.env.DEVTO_API_KEY;
const TITLE = process.env.POST_TITLE;
const BODY_BASE64 = process.env.POST_BODY;
const TAGS_JSON = process.env.POST_TAGS;
const DESCRIPTION = process.env.POST_DESCRIPTION;
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
if (STATUS[postKey]?.devto?.id && process.env.FORCE_PUBLISH !== 'true') {
  console.log('ℹ️ Already published to Dev.to, skipping...');
  setOutput('result', JSON.stringify({ skipped: true, reason: 'already_published' }));
  process.exit(0);
}

const article = {
  article: {
    title: TITLE,
    body_markdown: BODY,
    tags: TAGS.slice(0, 4), // Dev.to allows max 4 tags
    description: DESCRIPTION,
    canonical_url: CANONICAL_URL,
    published: true
  }
};

const options = {
  hostname: 'dev.to',
  path: '/api/articles',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api-key': API_KEY
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✅ Published to Dev.to successfully!');
        console.log(`   URL: ${result.url}`);
        console.log(`   ID: ${result.id}`);
        
        setOutput('result', JSON.stringify({
          success: true,
          id: result.id,
          url: result.url,
          publishedAt: new Date().toISOString()
        }));
      } else {
        console.error('❌ Failed to publish to Dev.to:', result.error || result);
        setOutput('result', JSON.stringify({
          success: false,
          error: result.error || `HTTP ${res.statusCode}`
        }));
        process.exit(1);
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      setOutput('result', JSON.stringify({ success: false, error: e.message }));
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
  setOutput('result', JSON.stringify({ success: false, error: error.message }));
  process.exit(1);
});

req.write(JSON.stringify(article));
req.end();
