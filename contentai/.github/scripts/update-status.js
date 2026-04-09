// Update publish status JSON
const fs = require('fs');
const path = require('path');

const POST_TITLE = process.env.POST_TITLE;
const DEVTO_RESULT = process.env.DEVTO_RESULT;
const HASHNODE_RESULT = process.env.HASHNODE_RESULT;
const MEDIUM_RESULT = process.env.MEDIUM_RESULT;
const TWITTER_RESULT = process.env.TWITTER_RESULT;

const STATUS_FILE = '.github/publish-status.json';

// Generate post key from title
const postKey = POST_TITLE.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Load existing status
let status = {};
if (fs.existsSync(STATUS_FILE)) {
  try {
    status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
  } catch (e) {
    console.log('Warning: Could not parse existing status file, starting fresh');
  }
}

// Initialize post entry if not exists
if (!status[postKey]) {
  status[postKey] = {
    title: POST_TITLE,
    firstPublishedAt: new Date().toISOString(),
    platforms: {}
  };
}

// Update each platform result
if (DEVTO_RESULT) {
  try {
    const result = JSON.parse(DEVTO_RESULT);
    if (result.success) {
      status[postKey].platforms.devto = {
        id: result.id,
        url: result.url,
        publishedAt: result.publishedAt
      };
    } else if (!result.skipped) {
      status[postKey].platforms.devto = {
        error: result.error,
        failedAt: new Date().toISOString()
      };
    }
  } catch (e) {
    console.error('Error parsing Dev.to result:', e);
  }
}

if (HASHNODE_RESULT) {
  try {
    const result = JSON.parse(HASHNODE_RESULT);
    if (result.success) {
      status[postKey].platforms.hashnode = {
        id: result.id,
        url: result.url,
        slug: result.slug,
        publishedAt: result.publishedAt
      };
    } else if (!result.skipped) {
      status[postKey].platforms.hashnode = {
        error: result.error,
        failedAt: new Date().toISOString()
      };
    }
  } catch (e) {
    console.error('Error parsing Hashnode result:', e);
  }
}

if (MEDIUM_RESULT) {
  try {
    const result = JSON.parse(MEDIUM_RESULT);
    if (result.success) {
      status[postKey].platforms.medium = {
        id: result.id,
        url: result.url,
        publishedAt: result.publishedAt
      };
    } else if (!result.skipped) {
      status[postKey].platforms.medium = {
        error: result.error,
        suggestion: result.suggestion,
        failedAt: new Date().toISOString()
      };
    }
  } catch (e) {
    console.error('Error parsing Medium result:', e);
  }
}

if (TWITTER_RESULT) {
  try {
    const result = JSON.parse(TWITTER_RESULT);
    if (result.skipped && result.manualTweet) {
      status[postKey].platforms.twitter = {
        manualMode: true,
        tweetText: result.manualTweet,
        note: result.note || 'Manual posting required'
      };
    } else if (result.success) {
      status[postKey].platforms.twitter = {
        id: result.id,
        url: result.url,
        publishedAt: result.publishedAt
      };
    }
  } catch (e) {
    console.error('Error parsing Twitter result:', e);
  }
}

// Update last published time
status[postKey].lastUpdatedAt = new Date().toISOString();

// Save status file
fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));

console.log('✅ Publish status updated');
console.log(`   Post: ${POST_TITLE}`);
console.log(`   Key: ${postKey}`);
console.log(`   Platforms: ${Object.keys(status[postKey].platforms).join(', ')}`);
