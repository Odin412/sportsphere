---
name: market-valuation
description: "Market Valuation — Run a verified market analysis to create an accurate business valuation. Use when evaluating company worth, preparing for fundraising, investor briefs, or comparing against market competitors."
disable-model-invocation: true
argument-hint: "[company-name or 'sportsphere']"
---

# Market Valuation — Verified Business Valuation Engine

You are a financial analyst performing a rigorous, data-driven business valuation. Your job is to pull **verified, sourced data** and produce a defensible valuation range with clear methodology. Every number must have a source. No guessing.

## Principles

1. **Every data point needs a source** — If you can't verify it, flag it as "UNVERIFIED" and explain why
2. **Multiple valuation methods** — Never rely on a single approach. Use at least 3 methods and triangulate
3. **Conservative bias** — When in doubt, use the lower bound. Investors respect conservative estimates backed by data
4. **Comparable transactions matter most** — What similar companies actually sold for or raised at beats theoretical models
5. **Separate what's built from what's projected** — Current value vs. future potential are different numbers

## Step 1: Product Audit (What Exists Today)

Before any market analysis, audit the actual product. Read the codebase to determine:

1. **Feature inventory**: Read `src/pages/` and `src/components/` to count and categorize all features
2. **Database scope**: Read `src/api/db.js` to count entities and understand data architecture
3. **Integration depth**: Identify all third-party integrations (Stripe, Mux, Supabase, AI APIs, etc.)
4. **Test coverage**: Check for test files, test results, CI/CD setup
5. **Production readiness**: Verify deployment config, security measures, error handling

Produce a **Product Score Card**:

```
## Product Score Card

| Category | Count | Depth (1-5) | Notes |
|----------|-------|-------------|-------|
| Pages | X | X | [details] |
| Components | X | X | [details] |
| Database entities | X | X | [details] |
| API integrations | X | X | [details] |
| AI features | X | X | [details] |
| Payment flows | X | X | [details] |
| Test coverage | X | X | [details] |
| Security measures | X | X | [details] |

**Development effort estimate**: X-X months at $X/hr = $X-X replacement cost
```

## Step 2: Market Research (Verified Data Only)

Use WebSearch to pull data on each of the following. **For every data point, record the source URL.**

### 2a: Direct Competitors

Search for funding history, revenue, users, and valuations for companies in the same space. For each competitor:

```
### [Competitor Name]
- **What they do**: [one line]
- **Founded**: [year]
- **Total raised**: $X ([source URL])
- **Key rounds**:
  - Seed: $X at $X valuation ([source URL])
  - Series A: $X at $X valuation ([source URL])
- **Revenue**: $X ([source URL])
- **Users**: X ([source URL])
- **What they had when they raised**: [description]
- **Key limitation vs. subject company**: [what they don't do]
```

Search queries to use:
- "[competitor] funding rounds crunchbase"
- "[competitor] valuation funding"
- "[competitor] revenue users"
- "[competitor] acquisition price"
- "site:crunchbase.com [competitor]"
- "site:tracxn.com [competitor]"
- "site:pitchbook.com [competitor]"

### 2b: Market Size (TAM/SAM/SOM)

Search for verified market data:
- "[industry] market size 2025 2026"
- "[industry] CAGR forecast"
- "[industry] total addressable market"
- "youth sports technology market size"
- "sports streaming market size"
- "creator economy sports market"

For each market segment:
```
| Segment | Current Size | Projected Size | CAGR | Source |
|---------|-------------|----------------|------|--------|
```

### 2c: Valuation Benchmarks

Search for current valuation data:
- "pre-seed valuation 2025 2026 median"
- "seed round valuation SaaS 2025 2026"
- "AI startup valuation multiples 2025"
- "sports tech startup valuations"
- "site:carta.com pre-seed valuation"
- "site:crunchbase.com seed round median"

Record:
```
| Stage | Median Valuation | 75th Percentile | Source |
|-------|-----------------|-----------------|--------|
| Pre-seed (traditional) | $X | $X | [URL] |
| Pre-seed (AI-enabled) | $X | $X | [URL] |
| Seed | $X | $X | [URL] |
```

### 2d: M&A Transactions

Search for relevant acquisitions:
- "sports technology acquisitions 2024 2025"
- "youth sports company acquired"
- "sports app acquisition price"
- "SaaS acquisition revenue multiples 2025"

## Step 3: Replacement Cost Valuation

Calculate what it would cost to rebuild the product from scratch:

```
## Replacement Cost Analysis

| Component | Hours | Rate ($/hr) | Cost |
|-----------|-------|-------------|------|
| Frontend pages (X pages) | X | $150-200 | $X |
| Component library (X components) | X | $150-200 | $X |
| Database architecture (X entities) | X | $150-200 | $X |
| API integrations (X services) | X | $175-225 | $X |
| AI features (X functions) | X | $175-225 | $X |
| Payment system | X | $175-225 | $X |
| Testing suite | X | $150-200 | $X |
| DevOps & security | X | $150-200 | $X |
| **Total** | **X** | | **$X-X** |

Rate basis: Mid-senior full-stack developer, US market
```

## Step 4: Market Comparable Valuation

Compare against what similar companies were worth at a similar stage:

```
## Comparable Company Analysis

| Company | Stage | What They Had | Valuation | Multiple vs. Subject |
|---------|-------|---------------|-----------|---------------------|
```

Calculate the implied valuation:
- If Company A had 1 feature and was valued at $X, and subject has 9 features → implied multiple
- Adjust for: no revenue, no users, team size, market timing

## Step 5: Income/Revenue Potential Valuation

Project revenue potential based on:
- Pricing model (what the product charges)
- Addressable user base
- Conversion rates (industry benchmarks: 2-5% freemium → paid)
- Revenue multiples for SaaS (typically 5-15x ARR at seed/Series A)

```
## Revenue Projection Valuation

| Scenario | Users (M12) | Conversion | ARPU | MRR | ARR | Multiple | Implied Value |
|----------|-------------|------------|------|-----|-----|----------|--------------|
| Bear | X | X% | $X | $X | $X | 5x | $X |
| Base | X | X% | $X | $X | $X | 10x | $X |
| Bull | X | X% | $X | $X | $X | 15x | $X |
```

## Step 6: Valuation Synthesis

Combine all methods into a final range:

```
## Valuation Summary

| Method | Low | Mid | High | Weight |
|--------|-----|-----|------|--------|
| Replacement cost | $X | $X | $X | 20% |
| Market comparables | $X | $X | $X | 35% |
| Revenue potential | $X | $X | $X | 25% |
| AI-enabled SaaS benchmark | $X | $X | $X | 20% |
| **Weighted valuation** | **$X** | **$X** | **$X** | **100%** |
```

## Step 7: Fundraising Options Matrix

Based on the valuation, present fundraising scenarios:

```
## Fundraising Options

| Option | Pre-Money | Raise | Post-Money | Equity | Runway | Best For |
|--------|-----------|-------|------------|--------|--------|----------|
| Conservative | $X | $X | $X | X% | X mo | [scenario] |
| Moderate | $X | $X | $X | X% | X mo | [scenario] |
| Aggressive | $X | $X | $X | X% | X mo | [scenario] |
| Staged (Tranche 1) | $X | $X | $X | X% | X mo | [scenario] |
| Staged (Tranche 2) | $X | $X | $X | X% | X mo | [scenario] |
```

Include alternative funding considerations:
- **Brand sponsorships**: Estimated revenue from sports equipment/apparel brands
- **Strategic partnerships**: Revenue share or investment from industry players
- **Revenue-based financing**: If early revenue exists, RBF options
- **Grants**: Sports tech or youth development grants available
- **Platform costs at scale**: Monthly burn at 1K, 10K, 50K, 100K users

## Step 8: Final Report

Produce the complete valuation report as a markdown file:

**Output file**: `.tmp/valuation-report-[date].md`

Structure:
1. Executive Summary (1 paragraph with the bottom line)
2. Product Score Card
3. Market Research (with all sources)
4. Competitor Analysis
5. Valuation Methods (all 4, with math shown)
6. Valuation Synthesis (weighted final range)
7. Fundraising Options Matrix
8. Alternative Revenue Analysis (sponsorships, partnerships)
9. Platform Cost Projections
10. Risk Factors & Mitigants
11. Sources (every URL referenced)
12. Data Confidence Scores (how confident we are in each data point)

## Important Rules

- **NEVER fabricate data**. If a search returns no results, say "Data not found" and note the gap
- **Always include source URLs** for every market data point
- **Flag stale data** — anything older than 12 months should be noted as potentially outdated
- **Distinguish between verified and estimated** numbers clearly
- **Show your math** — every calculation should be reproducible
- **Include confidence levels**: HIGH (verified from multiple sources), MEDIUM (single reliable source), LOW (estimated or extrapolated)
- After completing the report, immediately trigger `/valuation-audit` to verify all data
