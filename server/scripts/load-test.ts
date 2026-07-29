/**
 * @module scripts/load-test
 * Production Load Testing & Automated Performance Benchmarking Script.
 * Simulates concurrent load against Auth, Scans, Notifications, AI, and Admin APIs.
 */

import http from 'node:http';
import { app } from '../src/app.js';

interface RequestMetrics {
  endpoint: string;
  statusCode: number;
  durationMs: number;
}

async function runSingleRequest(
  endpoint: string,
  options: { method?: string; headers?: Record<string, string>; body?: string } = {},
): Promise<RequestMetrics> {
  const startTime = Date.now();
  return new Promise((resolve) => {
    const req = http.request(
      'http://127.0.0.1:3999' + endpoint,
      {
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          const durationMs = Date.now() - startTime;
          resolve({
            endpoint,
            statusCode: res.statusCode || 500,
            durationMs,
          });
        });
      },
    );

    req.on('error', () => {
      resolve({
        endpoint,
        statusCode: 500,
        durationMs: Date.now() - startTime,
      });
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function executeLoadSuite() {
  console.log('===========================================================');
  console.log('  MilkBoy Monorepo — Production Load Test & Benchmark     ');
  console.log('===========================================================');

  // Start HTTP server instance on port 3999
  const server = app.listen(3999);
  await new Promise((r) => setTimeout(r, 500));

  const targetEndpoints = [
    '/health',
    '/api/v1/auth/login',
    '/api/v1/scans',
    '/api/v1/notifications',
    '/api/v1/admin/analytics',
    '/api/v1/ai/models',
  ];

  const totalConcurrent = 100;
  const metrics: RequestMetrics[] = [];
  const suiteStart = Date.now();

  console.log(`🚀 Executing ${totalConcurrent} concurrent requests across 6 API endpoints...\n`);

  const promises = [];
  for (let i = 0; i < totalConcurrent; i++) {
    const endpoint = targetEndpoints[i % targetEndpoints.length];
    promises.push(runSingleRequest(endpoint));
  }

  const results = await Promise.all(promises);
  metrics.push(...results);

  const totalTimeSec = (Date.now() - suiteStart) / 1000;
  server.close();

  // Compute Latency Percentiles
  const durations = metrics.map((m) => m.durationMs).sort((a, b) => a - b);
  const minLatency = durations[0] || 0;
  const maxLatency = durations[durations.length - 1] || 0;
  const avgLatency = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  const p95Index = Math.floor(durations.length * 0.95);
  const p95Latency = durations[p95Index] || 0;

  const successfulRequests = metrics.filter((m) => m.statusCode < 500).length;
  const failedRequests = metrics.length - successfulRequests;
  const errorRate = ((failedRequests / metrics.length) * 100).toFixed(2);
  const rps = (metrics.length / totalTimeSec).toFixed(2);

  console.log('===========================================================');
  console.log('  LOAD TEST RESULTS SUMMARY                                ');
  console.log('===========================================================');
  console.log(`Total Requests Processed : ${metrics.length}`);
  console.log(`Total Elapsed Time       : ${totalTimeSec.toFixed(2)}s`);
  console.log(`Throughput (RPS)         : ${rps} req/sec`);
  console.log(`Average Latency          : ${avgLatency} ms`);
  console.log(`95th Percentile (p95)    : ${p95Latency} ms`);
  console.log(`Min Latency              : ${minLatency} ms`);
  console.log(`Max Latency              : ${maxLatency} ms`);
  console.log(`Error Rate               : ${errorRate}%`);
  console.log('===========================================================\n');
}

executeLoadSuite().catch((err) => {
  console.error('Load test failed:', err);
  process.exit(1);
});
