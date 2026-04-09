const axios = require('axios');

class SecurityContentFactory {
  constructor(claudeApiKey) {
    this.claudeApiKey = claudeApiKey;
    this.nvdApiUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
  }

  async fetchLatestCVEs() {
    const response = await axios.get(this.nvdApiUrl, {
      params: { resultsPerPage: 10, startIndex: 0 }
    });
    return response.data.vulnerabilities || [];
  }

  async generateArticle(cve) {
    const prompt = `Write a technical security article about ${cve.cve.id}.

Title: Should include the CVE ID and vulnerability type
Content: 1000-1500 words
Style: Professional, educational, for developers

Include:
1. What is this vulnerability
2. How it works
3. Impact and severity
4. How to detect it
5. How to fix/patch it
6. Prevention best practices`;

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'x-api-key': this.claudeApiKey,
        'Content-Type': 'application/json'
      }
    });

    return response.data.content[0].text;
  }

  async run() {
    console.log('🔍 Fetching latest CVEs...');
    const cves = await this.fetchLatestCVEs();
    
    for (const cve of cves.slice(0, 3)) {
      console.log(`📝 Generating article for ${cve.cve.id}...`);
      const article = await this.generateArticle(cve);
      console.log('✅ Article generated');
    }
  }
}

module.exports = SecurityContentFactory;

if (require.main === module) {
  const factory = new SecurityContentFactory(process.env.CLAUDE_API_KEY);
  factory.run().catch(console.error);
}