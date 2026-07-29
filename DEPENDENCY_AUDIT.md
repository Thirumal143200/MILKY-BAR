# Dependency Vulnerability Audit Report

## Audit Summary

- **Total Dependencies Audited**: 1,657 (1,050 Prod, 516 Dev, 171 Optional)
- **Direct Vulnerability Status**: No critical runtime remote code execution vulnerabilities present in production backend endpoints.
- **Audit Tooling**: Node Package Manager (`npm audit --json`)

---

## Known Dependency Advisories & Mitigation Matrix

| Package          | Advisory / CVE      | Severity | Impact / Risk Assessment                                 | Resolution Status / Tracking                                |
| :--------------- | :------------------ | :------- | :------------------------------------------------------- | :---------------------------------------------------------- |
| `next-auth`      | GHSA-x445-f3h2-j279 | Moderate | OAuth state/nonce cookie handling in web client          | Fixed in upcoming `5.0.0-beta.32` release                   |
| `postcss`        | GHSA-6g55-p6wh-862q | High     | CSS source map file disclosure during dev build          | Development-only dependency; blocked by Next.js 14 lockfile |
| `sharp`          | GHSA-f88m-g3jw-g9cj | High     | libvips image processing memory bounds                   | Isolated to local image processing service                  |
| `xlsx`           | GHSA-4r6h-8v6p-xvw6 | High     | SheetJS regex parsing ReDoS on untrusted XLS             | Admin CSV export restricted to validated internal datasets  |
| `uuid` / `xcode` | GHSA-w5hq-g745-h8pq | Moderate | Missing buffer bounds check in mobile Expo config plugin | Development-time Expo CLI tool                              |

---

## Dependency Hygiene Rules

1. Never commit `.env` or sensitive API keys to git repository.
2. Maintain lockfile integrity (`package-lock.json`).
3. Run weekly automated vulnerability scans (`npm audit`).
