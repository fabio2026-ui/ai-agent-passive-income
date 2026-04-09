// Parse markdown post with front matter
const fs = require('fs');
const path = require('path');

const postPath = process.argv[2] || 'content/post.md';

function parseFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    console.error('No front matter found in post.md');
    process.exit(1);
  }
  
  const frontMatterText = match[1];
  const body = match[2].trim();
  
  // Parse YAML-like front matter
  const frontMatter = {};
  const lines = frontMatterText.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Parse arrays (tags)
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
      }
      
      frontMatter[key] = value;
    }
  }
  
  return { frontMatter, body };
}

function setOutput(key, value) {
  // GitHub Actions output
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    fs.appendFileSync(outputPath, `${key}=${value}\n`);
  }
  console.log(`${key}: ${value.substring ? value.substring(0, 100) + '...' : value}`);
}

function escapeShellArg(arg) {
  return arg.replace(/'/g, "'\"'\"'");
}

try {
  if (!fs.existsSync(postPath)) {
    console.error(`Post file not found: ${postPath}`);
    setOutput('title', '');
    process.exit(0);
  }
  
  const content = fs.readFileSync(postPath, 'utf8');
  const { frontMatter, body } = parseFrontMatter(content);
  
  // Validate required fields
  if (!frontMatter.title) {
    console.error('Missing required field: title');
    process.exit(1);
  }
  
  // Set outputs
  setOutput('title', frontMatter.title);
  setOutput('description', frontMatter.description || '');
  setOutput('canonical_url', frontMatter.canonical_url || '');
  setOutput('cover_image', frontMatter.cover_image || '');
  
  // Handle tags - convert to JSON string for env var
  const tags = Array.isArray(frontMatter.tags) 
    ? frontMatter.tags 
    : (frontMatter.tags ? [frontMatter.tags] : []);
  setOutput('tags', JSON.stringify(tags));
  
  // Body needs to be escaped for shell
  const bodyEscaped = Buffer.from(body).toString('base64');
  setOutput('body', bodyEscaped);
  
  console.log('✅ Post parsed successfully');
  console.log(`   Title: ${frontMatter.title}`);
  console.log(`   Tags: ${tags.join(', ')}`);
  
} catch (error) {
  console.error('Error parsing post:', error.message);
  process.exit(1);
}
