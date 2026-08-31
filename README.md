# SIM Scout

Web app MVP for searching, analyzing, and ranking Vietnamese phone SIM listings.

## Current scope

- No login required.
- Search and filtering UI with configurable criteria weights.
- Default preset: Viettel, 09x, budget up to 1,000,000 VND, exclude 4 and 7, prioritize 39-related patterns.
- Sample listings structured for the planned multi-source adapters.
- Outbound source links only; no checkout or payment.

## Planned source adapters

1. Sim Thăng Long
2. Tổng Kho Sim
3. Siêu Thị Sim Thẻ

The live adapter layer must verify public endpoints, robots.txt, terms of use, rate limits, availability fields, and last-checked timestamps before production use.

## Run locally

```bash
npm install
npm run dev
```
