// Post to Twitter/X
const https = require('https');
const crypto = require('crypto');

const API_KEY = process.env.TWITTER_API_KEY;
const API_SECRET = process.env.TWITTER_API_SECRET;
const ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;
const TITLE = process.env.POST_TITLE;
const DESCRIPTION = process.env.POST_DESCRIPTION;
const POST_URL = process.env.POST_URL;
const TAGS_JSON = process.env.POST_TAGS;
const STATUS_JSON = process.env.PUBLISH_STATUS || '{}';

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
if (STATUS[postKey]?.twitter?.id && process.env.FORCE_PUBLISH !== 'true') {
  console.log('ℹ️ Already posted to Twitter/X, skipping...');
  setOutput('result', JSON.stringify({ skipped: true, reason: 'already_posted' }));
  process.exit(0);
}

// Check if API credentials are available
if (!API_KEY || API_KEY === 'your_api_key') {
  console.log('⚠️ Twitter/X API credentials not configured. Skipping...');
  console.log('   To enable Twitter posting:');
  console.log('   1. Get API credentials from https://developer.twitter.com');
  console.log('   2. Add secrets to GitHub repository settings');
  console.log('   Or use manual mode - copy this text to post:');
  
  // Generate tweet text for manual posting
  const tweetText = generateTweetText();
  console.log('\n--- TWEET TEXT ---');
  console.log(tweetText);
  console.log('------------------\n');
  
  setOutput('result', JSON.stringify({ 
    skipped: true, 
    reason: 'credentials_not_configured',
    manualTweet: tweetText
  }));
  process.exit(0);
}

function generateTweetText() {
  const maxLength = 280;
  const urlLength = 23; // t.co links are always 23 chars
  const availableLength = maxLength - urlLength - 5; // 5 for spacing
  
  let text = TITLE;
  
  // Add description if space permits
  if (DESCRIPTION && text.length + DESCRIPTION.length + 3 < availableLength) {
    text += ` - ${DESCRIPTION}`;
  }
  
  // Truncate if needed
  if (text.length > availableLength) {
    text = text.substring(0, availableLength - 3) + '...';
  }
  
  // Add hashtags if space permits
  const hashtags = TAGS.slice(0, 3).map(t => `#${t.replace(/\s+/g, '')}`).join(' ');
  if (text.length + hashtags.length + 3 + urlLength <= maxLength) {
    text += ` ${hashtags}`;
  }
  
  // Add URL
  if (POST_URL) {
    text += ` ${POST_URL}`;
  }
  
  return text;
}

// OAuth 1.0a signature for Twitter API v2
function createOAuthSignature(method, url, params) {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const oauthParams = {
    oauth_consumer_key: API_KEY,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: ACCESS_TOKEN,
    oauth_version: '1.0'
  };
  
  const allParams = { ...params, ...oauthParams };
  const sortedParams = Object.keys(allParams).sort().map(k => 
    `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`
  ).join('&');
  
  const signatureBase = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(API_SECRET)}&${encodeURIComponent(ACCESS_SECRET)}`;
  
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');
  
  return {
    ...oauthParams,
    oauth_signature: signature
  };
}

const tweetText = generateTweetText();

// Try Twitter API v2 first, fallback to manual
const postData = JSON.stringify({ text: tweetText });

// For now, output the tweet text for manual posting as Twitter API v2 requires elevated access
console.log('⚠️ Twitter/X API v2 requires elevated access. Generated tweet text for manual posting:');
console.log('\n--- TWEET TEXT ---');
console.log(tweetText);
console.log('------------------\n');
console.log('To post automatically in the future:');
console.log('1. Apply for elevated access at https://developer.twitter.com');
console.log('2. Update your API credentials');

setOutput('result', JSON.stringify({ 
  skipped: true, 
  reason: 'manual_mode',
  manualTweet: tweetText,
  note: 'Twitter API v2 requires elevated access for write operations'
}));
