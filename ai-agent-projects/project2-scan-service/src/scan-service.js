// AI Security Scan Service
const axios = require('axios');

class SecurityScanService {
  constructor(codeguardUrl) {
    this.codeguardUrl = codeguardUrl;
  }

  async handleWebhook(payload) {
    console.log('🔍 Scanning repository:', payload.repository.full_name);
    
    const files = payload.commits.flatMap(c => [...c.added, ...c.modified]);
    const uniqueFiles = [...new Set(files)];
    
    const results = [];
    for (const file of uniqueFiles) {
      const result = await this.scanFile(file);
      results.push(result);
    }

    const report = this.generateReport(results, payload);
    await this.sendNotification(report);
    
    return report;
  }

  async scanFile(filePath) {
    const response = await axios.post(`${this.codeguardUrl}/api/scan`, {
      file: filePath,
      options: { checkVulnerabilities: true, checkSecrets: true }
    });
    return { file: filePath, ...response.data };
  }

  generateReport(results, payload) {
    const totalIssues = results.reduce((sum, r) => sum + (r.issues?.length || 0), 0);
    const avgScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length;

    return {
      repository: payload.repository.full_name,
      timestamp: new Date().toISOString(),
      summary: {
        filesScanned: results.length,
        totalIssues,
        averageScore: Math.round(avgScore)
      },
      details: results
    };
  }

  async sendNotification(report) {
    console.log('📧 Sending report:', report.summary);
  }
}

module.exports = SecurityScanService;