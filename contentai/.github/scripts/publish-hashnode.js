// Publish to Hashnode
const https = require('https');

const PAT = process.env.HASHNODE_PAT;
const PUBLICATION_ID = process.env.HASHNODE_PUBLICATION_ID;
const TITLE = process.env.POST_TITLE;
const BODY_BASE64 = process.env.POST_BODY;
const TAGS_JSON = process.env.POST_TAGS;
const DESCRIPTION = process.env.POST_DESCRIPTION;
const CANONICAL_URL = process.env.POST_CANONICAL_URL;
const COVER_IMAGE = process.env.POST_COVER_IMAGE;
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
if (STATUS[postKey]?.hashnode?.id && process.env.FORCE_PUBLISH !== 'true') {
  console.log('ℹ️ Already published to Hashnode, skipping...');
  setOutput('result', JSON.stringify({ skipped: true, reason: 'already_published' }));
  process.exit(0);
}

// Hashnode GraphQL mutation
const mutation = `
mutation PublishPost($input: PublishPostInput!) {
  publishPost(input: $input) {
    post {
      id
      slug
      url
      title
    }
  }
}
`;

// Convert tags to Hashnode tag format (needs slugs)
const tagSlugs = TAGS.map(tag => ({
  slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name: tag
}));

const variables = {
  input: {
    title: TITLE,
    publicationId: PUBLICATION_ID,
    contentMarkdown: BODY,
    tags: tagSlugs,
    subtitle: DESCRIPTION,
    ...(CANONICAL_URL && { originalArticleURL: CANONICAL_URL }),
    ...(COVER_IMAGE && { coverImageOptions: { coverImage: COVER_IMAGE } })
  }
};

const options = {
  hostname: 'gql.hashnode.com',
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': PAT
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.data?.publishPost?.post) {
        const post = result.data.publishPost.post;
        console.log('✅ Published to Hashnode successfully!');
        console.log(`   URL: ${post.url}`);
        console.log(`   ID: ${post.id}`);
        
        setOutput('result', JSON.stringify({
          success: true,
          id: post.id,
          url: post.url,
          slug: post.slug,
          publishedAt: new Date().toISOString()
        }));
      } else if (result.errors) {
        console.error('❌ Hashnode GraphQL errors:', result.errors);
        setOutput('result', JSON.stringify({
          success: false,
          error: result.errors[0]?.message || 'GraphQL error'
        }));
        process.exit(1);
      } else {
        console.error('❌ Unexpected response:', result);
        setOutput('result', JSON.stringify({ success: false, error: 'Unexpected response' }));
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

req.write(JSON.stringify({ query: mutation, variables }));
req.end();
