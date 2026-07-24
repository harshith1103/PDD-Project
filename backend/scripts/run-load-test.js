const http = require('http');

// Configuration: 100 Virtual Users running continuously for 1 Minute (60,000ms)
const TARGET_URL = process.env.BACKEND_URL || 'http://localhost:5000/api/health';
const CONCURRENT_USERS = parseInt(process.env.VUS || '100', 10);
const DURATION_MS = parseInt(process.env.DURATION_SEC || '60', 10) * 1000;

console.log(`=======================================================`);
console.log(`🚀 Starting Annadaan Connect API Baseline Load Test`);
console.log(`=======================================================`);
console.log(`• Target Endpoint : ${TARGET_URL}`);
console.log(`• Virtual Users   : ${CONCURRENT_USERS}`);
console.log(`• Test Duration   : ${DURATION_MS / 1000} seconds`);
console.log(`• Starting benchmark run... Please wait.\n`);

const responseTimes = [];
let totalRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;

const startTime = Date.now();
const endTime = startTime + DURATION_MS;

function makeRequest(userIndex) {
  if (Date.now() >= endTime) return;

  const reqStart = Date.now();
  const req = http.get(TARGET_URL, (res) => {
    const reqDuration = Date.now() - reqStart;
    responseTimes.push(reqDuration);
    totalRequests++;

    if (res.statusCode >= 200 && res.statusCode < 400) {
      successfulRequests++;
    } else {
      failedRequests++;
    }

    // Immediately trigger next request for this virtual user to maintain continuous load
    if (Date.now() < endTime) {
      setImmediate(() => makeRequest(userIndex));
    }
  });

  req.on('error', (err) => {
    const reqDuration = Date.now() - reqStart;
    responseTimes.push(reqDuration);
    totalRequests++;
    failedRequests++;

    if (Date.now() < endTime) {
      setTimeout(() => makeRequest(userIndex), 50);
    }
  });

  req.setTimeout(5000, () => {
    req.destroy();
  });
}

// Launch 100 concurrent Virtual User workers
for (let i = 0; i < CONCURRENT_USERS; i++) {
  makeRequest(i);
}

// Print results after duration completes
setTimeout(() => {
  const actualDurationSec = (Date.now() - startTime) / 1000;
  const rps = (totalRequests / actualDurationSec).toFixed(2);

  if (responseTimes.length === 0) {
    console.error('❌ Load test failed to record any responses. Is the server running?');
    process.exit(1);
  }

  responseTimes.sort((a, b) => a - b);
  const min = responseTimes[0];
  const max = responseTimes[responseTimes.length - 1];
  const sum = responseTimes.reduce((acc, v) => acc + v, 0);
  const avg = (sum / responseTimes.length).toFixed(2);
  const p95Index = Math.floor(responseTimes.length * 0.95);
  const p95 = responseTimes[p95Index] || max;
  const failRate = ((failedRequests / totalRequests) * 100).toFixed(2);

  console.log(`\n=======================================================`);
  console.log(`📊 LOAD TEST RESULTS (Annadaan Connect API)`);
  console.log(`=======================================================`);
  console.log(`• Total Requests Sent : ${totalRequests}`);
  console.log(`• Requests Per Second : ${rps} req/sec`);
  console.log(`• Success Rate        : ${((successfulRequests / totalRequests) * 100).toFixed(2)}%`);
  console.log(`• Failure Rate        : ${failRate}%`);
  console.log(`-------------------------------------------------------`);
  console.log(`⏱️ RESPONSE TIME STATS:`);
  console.log(`• Min Latency         : ${min} ms`);
  console.log(`• Avg Latency         : ${avg} ms`);
  console.log(`• Max Latency         : ${max} ms`);
  console.log(`• P95 Latency         : ${p95} ms`);
  console.log(`=======================================================\n`);
}, DURATION_MS + 1000);
