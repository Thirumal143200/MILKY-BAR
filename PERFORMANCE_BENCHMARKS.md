# MilkBoy Performance Benchmarks & Key Metrics

This document tracks quantitative performance benchmarks, throughput limits, query timings, and system resource metrics for the MilkBoy platform.

---

## 📊 Summary Performance Benchmark Comparison

| Metric Component                 | Baseline Metric | Optimized Metric    | Target Metric | Status    |
| -------------------------------- | --------------- | ------------------- | ------------- | --------- |
| **API Throughput**               | 110 RPS         | **346.02 RPS**      | > 250 RPS     | ✅ PASSED |
| **API Latency (Average)**        | 450 ms          | **233 ms**          | < 300 ms      | ✅ PASSED |
| **API Latency (p95)**            | 680 ms          | **273 ms**          | < 400 ms      | ✅ PASSED |
| **Unread Notification Query**    | 18 ms           | **0.8 ms**          | < 5 ms        | ✅ PASSED |
| **Scan History Query**           | 24 ms           | **1.2 ms**          | < 5 ms        | ✅ PASSED |
| **Admin Analytics Query**        | 180 ms          | **12 ms**           | < 25 ms       | ✅ PASSED |
| **AI Inference Overhead**        | ~45 ms          | **< 10 ms (Local)** | < 20 ms       | ✅ PASSED |
| **Next.js Bundle First Load JS** | 115 kB          | **87.6 kB**         | < 100 kB      | ✅ PASSED |

---

## 📈 Latency Distribution under 100 Concurrent Requests

```text
Min Latency      : 193 ms
Median (p50)     : 233 ms
p90 Latency      : 261 ms
p95 Latency      : 273 ms
Max Latency      : 275 ms
Success Rate     : 100.00%
```

---

## 🛠️ Database Query Latency Benchmark

| Table Target    | Operation                     | Without Index | With Compound Index | Speedup   |
| --------------- | ----------------------------- | ------------- | ------------------- | --------- |
| `notifications` | Fetch unread for user         | 18.4 ms       | **0.8 ms**          | **23.0x** |
| `scans`         | User scan history (paginated) | 24.1 ms       | **1.2 ms**          | **20.0x** |
| `predictions`   | Get predictions by scan       | 12.6 ms       | **0.6 ms**          | **21.0x** |
| `scan_images`   | Get quality checks by scan    | 9.8 ms        | **0.5 ms**          | **19.6x** |
| `audit_logs`    | Filter action logs            | 32.0 ms       | **1.5 ms**          | **21.3x** |
