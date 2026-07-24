const fs = require('fs');

function getMetricValue(metricObj, key) {
  if (!metricObj) return '0';
  if (metricObj.values && metricObj.values[key] !== undefined) {
    return metricObj.values[key];
  }
  if (metricObj[key] !== undefined) {
    return metricObj[key];
  }
  return '0';
}

try {
  const rawData = fs.readFileSync('summary.json', 'utf8');
  const data = JSON.parse(rawData);
  const metrics = data.metrics || {};

  const httpReqs = metrics.http_reqs || {};
  const httpDuration = metrics.http_req_duration || {};
  const httpFailed = metrics.http_req_failed || {};

  const totalReqs = getMetricValue(httpReqs, 'count');
  const rps = getMetricValue(httpReqs, 'rate');
  const avgDuration = parseFloat(getMetricValue(httpDuration, 'avg')).toFixed(2);
  const minDuration = parseFloat(getMetricValue(httpDuration, 'min')).toFixed(2);
  const maxDuration = parseFloat(getMetricValue(httpDuration, 'max')).toFixed(2);
  const p95Duration = parseFloat(getMetricValue(httpDuration, 'p(95)')).toFixed(2);
  const failRate = (parseFloat(getMetricValue(httpFailed, 'rate')) * 100).toFixed(2);

  const summaryMarkdown = `
### 📊 k6 API Load Test Executive Summary (Annadaan Connect)
- **Concurrent Virtual Users**: 100 VUs
- **Duration**: 1 minute
- **Total Requests**: ${totalReqs}
- **Requests Per Second (RPS)**: ${parseFloat(rps).toFixed(2)} req/sec
- **Failure Rate**: ${failRate}%

#### ⏱️ Latency Metrics:
- **Min Response Time**: ${minDuration} ms
- **Average Response Time**: ${avgDuration} ms
- **Max Response Time**: ${maxDuration} ms
- **p(95) Response Time**: ${p95Duration} ms
`;

  console.log(summaryMarkdown);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMarkdown);
  }
} catch (err) {
  console.error('Error parsing k6 summary.json:', err.message);
  process.exit(1);
}
