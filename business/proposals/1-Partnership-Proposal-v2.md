# Partnership Proposal v2

## Sportsphere Platform — Revised Equity & Operating Agreement

**March 14, 2026 — Prepared by TitanAI LLC**

**TitanAI LLC** (Developer / Back of House) x **Andrew Collazo** (Contributor / Front of House)

---

## SECTION 01 — Executive Summary

This revised proposal outlines updated terms of engagement between TitanAI LLC ("Developer") and Andrew Collazo ("Contributor") regarding the Sportsphere sports community platform.

Since the original proposal (March 13, 2026), TitanAI LLC has continued development, adding a full mobile/PWA layer with push notifications, touch gestures, installable home screen experience, and responsive optimization across all 69 pages. The platform's verified replacement cost and market valuation have increased accordingly.

This document reflects the updated product scope, corrected market valuation based on verified data from Carta, Crunchbase, and industry sources, and revised equity terms that accurately reflect each party's contribution.

**Key Principle:** TitanAI LLC retains 100% ownership of all intellectual property, code, and infrastructure. Andrew Collazo receives 5% equity upon signing, reflecting his initial concept and network access. He can earn an additional 10% (to 15% maximum) through measurable business milestones with defined deadlines. TitanAI's equity is protected from dilution — any investor equity comes from Andrew's pool first.

---

## SECTION 02 — What Has Been Built

Sportsphere is a full-featured sports community and streaming platform — the only all-in-one solution combining social networking, live streaming, creator monetization, athlete scouting, coaching tools, and AI-powered features in a single platform. **The platform is now fully mobile-optimized as a Progressive Web App (PWA).**

| Metric | Count |
|--------|-------|
| Pages | 69 (all mobile-responsive) |
| Components | 208 |
| Database Entities | 71 |
| Edge Functions | 23 (11 AI-powered) |
| Automated Tests | 159 (98.1% pass rate) |
| Custom Hooks | 6 |
| Production Dependencies | 64 |
| Total Source Files | 299 |

### Mobile/PWA Features (NEW since v1)

- PWA installable to home screen (iOS + Android) with standalone mode
- Push notifications via service worker
- Safe-area insets for notched phones (iPhone Dynamic Island, etc.)
- 44px touch targets on all interactive elements
- Bottom tab navigation with slide-up More drawer
- Vertical swipe gestures for Reels navigation
- Pull-to-refresh framework
- Responsive dialogs (modal on desktop, bottom sheet on mobile)
- Fluid typography (6 scales, viewport-aware)
- GPU optimization (backdrop-blur disabled on mobile)
- Mobile-optimized media sizing (280px mobile / 480px desktop)

### Core Feature Suite

| Category | Features |
|----------|----------|
| Social Network | Posts, comments, follows, stories, messaging, notifications, DMs |
| Live Streaming | HLS streaming, real-time chat, polls, Q&A, sentiment analysis, VOD |
| Short-Form Video | TikTok-style reels with AI assistant, effects, discovery feed |
| Creator Monetization | Stripe subscriptions, tipping, merchandise shop, earnings dashboard |
| AI Features | AI Coach, content moderation, feed ranking, recommendations, Scout Card narratives |
| Athlete Development | ProPath suite, Scout Card, training streaks, stat tracking, video telestration |
| Recruiting & Scouting | GetNoticed marketplace, ScoutCard search, coach scouting hub |
| Live Sports | GameDay real-time scoring (4 sports), box scores, game recaps, news ticker |
| Gamification | Points, badges, challenges, leaderboards, achievements, streaks |
| Community | Groups, forums, events, Q&A, maps integration |
| Admin & Moderation | Admin dashboard, content moderation queue, user management, analytics |
| Premium | Subscription tiers, paywall gates, feature access control |

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 6, Tailwind CSS, Radix UI (26 primitives), Framer Motion |
| Mobile | PWA (manifest.json, service worker, safe-area insets, touch gestures) |
| Backend | Supabase (PostgreSQL, Edge Functions, Auth, Realtime, Storage) |
| Payments | Stripe (live keys — subscriptions, tips, purchases) |
| AI | Anthropic Claude (moderation, coaching, recommendations, content generation) |
| Video | Mux + HLS.js (processing, streaming, playback) |
| Hosting | Vercel (production deployed, custom domain, global edge CDN) |
| Testing | Playwright (159 tests, 14 phases, 98.1% pass rate) |

---

## SECTION 03 — Contribution Analysis

### TitanAI LLC (Developer)

- Deep competitive research (GameChanger, Hudl, NCSA, FloSports, TeamSnap, Overtime, WHOOP, Strava, StatusPRO, Pixellot)
- Product vision and design direction (Instagram/ESPN mashup concept evolved into full super-app)
- Authored the complete product architecture
- Built 100% of production codebase from scratch
- 69 pages, 208 components, 71 database entities
- Full Supabase backend architecture (auth, RLS on all tables, realtime)
- Stripe payment integration (live, processing-ready)
- AI feature suite (11 Claude-powered Edge Functions)
- Complete mobile/PWA layer (service worker, touch gestures, responsive system)
- 159 automated tests across 14 phases
- Production deployment, CI/CD, monitoring
- Security hardening (RLS on all tables, rate limiting, error boundaries)
- Performance optimization (N+1 fixes, code splitting, chunk strategy)
- 15 seeded bot accounts + 157 posts for launch readiness
- All hosting, API, and infrastructure costs paid ($0 from Andrew)
- TitanAI branding and chatbot integration
- Iron Edge UI design system (Monza Red, Chakra Petch, stadium palette)
- Market valuation analysis with 50 verified sources

### Andrew Collazo (Contributor)

- Original idea for a sports community app
- Attempted Base44 no-code build (incomplete, not production-grade, zero code in production)
- Domain experience in youth sports (baseball, softball)
- Access to coaching network and league contacts (unproven — no users delivered to date)
- Texas A&M alumni network and affiliation
- Facility access for pilot site
- Girls softball team (pilot group, ~15-20 players/parents)
- 8u boys baseball team (pilot group, ~15-20 players/parents)
- Zero lines of production code
- Zero capital invested
- Zero design, architecture, or research contributions
- No formal agreement to date

**Summary:** Andrew Collazo contributed the initial idea for a sports app and attempted to build it using the Base44 no-code platform but was unable to complete it. TitanAI LLC conducted all competitive research, defined the product vision and design direction, authored the complete product architecture, built the entire platform from scratch including a full mobile/PWA layer — 208 custom components, 13 third-party integrations, 23 Edge Functions, and comprehensive testing, security, and deployment infrastructure. All design, development, and operational costs have been borne exclusively by TitanAI LLC.

---

## SECTION 04 — Market Valuation (Updated & Verified)

### Why The Valuation Changed

The original proposal used a replacement cost of $330K-$620K and a valuation range of $1M-$3M. These numbers were preliminary estimates. TitanAI LLC has since conducted a comprehensive market analysis using verified data from Carta, Crunchbase, Tracxn, and 50 independent sources. The corrected figures are significantly higher.

### Development Replacement Cost (Corrected)

| Feature Set | Original Estimate | Corrected Estimate |
|-------------|------------------|-------------------|
| Social network (feed, profiles, follows, messaging) | $50K-$100K | $70K-$130K |
| Live streaming infrastructure | $100K-$200K | $100K-$200K |
| AI features (11 Edge Functions, moderation, coaching) | $50K-$100K | $60K-$104K |
| Coaching tools + video telestration | $30K-$50K | $30K-$50K |
| Payment / monetization (Stripe checkout + webhooks) | $20K-$40K | $24K-$49K |
| Athlete development suite (ProPath) | $30K-$50K | $30K-$50K |
| GameDay real-time scoring (4 sports) | $20K-$30K | $20K-$30K |
| Maps, analytics, admin, community | $30K-$50K | $30K-$50K |
| **Mobile/PWA layer (NEW)** | **Not included** | **$49K-$87K** |
| Testing suite (159 tests, 14 phases) | Not included | $24K-$48K |
| DevOps, security, architecture | Not included | $46K-$90K |
| **Total Rebuild Cost** | **$330K-$620K** | **$452K-$851K** |

**With IP/architecture premium (1.4x): $632K - $1.19M**

### Startup Valuation Benchmarks (Verified Sources)

| Benchmark | Value | Source |
|-----------|-------|--------|
| Pre-seed median SAFE cap (all startups) | $7.7M | Carta Q3 2025 |
| Pre-seed SAFE cap ($250K-$1M raise) | $10M median | Carta Q3 2025 |
| SaaS pre-seed average valuation cap | $17M | Metal.so / Carta |
| AI startup valuation premium | +42% over non-AI | Carta / VC Cafe |
| Seed median pre-money | $16M (all-time high) | Carta Q3 2025 |

### Comparable Company Analysis (Verified)

| Company | Stage | What They Had | Raised | Implied Valuation |
|---------|-------|---------------|--------|-------------------|
| Overtime | Seed (2017) | Instagram clips, no app | $2.5M | ~$10-12M |
| GameChanger | Series A (2011) | Scoring app, 1 feature | $1.05M | ~$5-8M |
| WHOOP | Seed (2013) | Hardware prototype | $3.39M | ~$12-15M |
| StatusPRO | Seed (2021) | VR tool for NFL teams | $5.2M | ~$20M+ |
| Strava | Series A (2011) | GPS cycling tracker | $3.5M | ~$15M |
| FloSports | Series A (2014) | Niche wrestling streaming | $8M | ~$30M+ |

Every one of these companies had **less built** than Sportsphere and raised at **higher implied valuations**.

### Weighted Valuation (4 Methods)

| Method | Low | Mid | High | Weight |
|--------|-----|-----|------|--------|
| Replacement cost (w/ IP premium) | $632K | $910K | $1.19M | 15% |
| Market comparables | $5.5M | $7.5M | $10M | 35% |
| Revenue potential (discounted) | $3.5M | $5.5M | $9.5M | 25% |
| AI-enabled SaaS benchmarks | $5.5M | $7.5M | $10M | 25% |
| **Weighted valuation** | **$4.3M** | **$6.3M** | **$8.5M** |

**Fair market valuation: $6M pre-money**

### What This Means For Equity

At $6M valuation:

| Equity % | Dollar Value |
|----------|-------------|
| 5% (Andrew's starting) | $300,000 |
| 15% (Andrew's maximum) | $900,000 |
| 25% (original proposal) | $1,500,000 |
| 45% (original maximum) | $2,700,000 |

The original proposal offered $1.5M in equity on day one for an idea, a contact list, and two pilot teams. The revised terms offer $300K in equity on day one — still generous — with a path to $900K through verified performance.

---

## SECTION 05 — Intellectual Property

All intellectual property associated with the Sportsphere platform is owned exclusively by TitanAI LLC. This includes but is not limited to:

- All source code, components, and application architecture
- Database schemas, API integrations, and serverless functions
- AI models, prompts, and inference pipelines
- UI/UX design, branding assets, and visual identity (Iron Edge design system)
- Mobile/PWA infrastructure (service worker, manifest, responsive system)
- Test suites, deployment configurations, and CI/CD pipelines
- User data, analytics, and platform metrics
- The TitanAI brand, trademarks, and associated assets

**Non-Negotiable:** Under standard work-for-hire and independent development doctrine, all rights belong to TitanAI LLC as the creator of the software. No IP is transferred or shared under this agreement. "Powered by TitanAI" branding remains on the platform regardless of equity structure.

---

## SECTION 06 — Revised Equity Structure

### Why The Terms Changed

The original proposal (75/25 starting, 55/45 maximum) was drafted before a comprehensive market valuation was completed. After conducting a verified valuation using Carta benchmarks, Crunchbase competitor data, and independent analysis from 50 sources:

1. **The platform's fair market value is $6M**, not $1-3M — making each percentage point worth significantly more
2. **Andrew's contributions have not changed** — still an idea, a contact list, and two pilot teams
3. **The platform has grown** — mobile/PWA layer added, increasing replacement cost by $49-87K
4. **Industry standard for advisory/GTM roles is 1-3% equity** — 25% is not market-rate for this contribution level
5. **Investors prefer concentrated founder ownership** — a 75/25 split with a non-builder raises questions

### Starting Position: 95 / 5

| TitanAI 95% | Andrew 5% |
|---|---|
| $632K-$1.19M development + all IP + design + research + mobile/PWA + ongoing ops | Idea + network access + Front of House commitment |

Andrew receives **5%** upon execution of this agreement, reflecting his initial idea, youth sports network, facility access, and commitment to Front of House operations. TitanAI retains **95%**, reflecting the verified replacement cost of $632K-$1.19M, all intellectual property, product design, research, mobile development, and ongoing Back of House operations and infrastructure costs.

**At $6M valuation, 5% = $300,000** — a generous starting position for zero code, zero capital, and zero design contributions.

### Path to 15%: Milestone-Based Vesting

Andrew can earn an additional **10 percentage points** of equity (from 5% to 15%) by hitting the following business milestones. Each milestone has a defined deadline and is verified using data from Supabase and Stripe — platforms owned and controlled by TitanAI LLC. No milestone vests until independently verified at the quarterly review.

**Milestone 1: 500 Users From Network** (+2%, total: 7%)
- Drive 500 registered, active users to the platform through personal network, league contacts, and coaching connections
- Verified by: Supabase auth.users table — registered accounts with activity
- Deadline: 6 months from signing

**Milestone 2: 2,000 Users + 5 Leagues Onboarded** (+2%, total: 9%)
- Scale to 2,000 active users and onboard 5 organized leagues or tournaments onto the platform
- Verified by: Supabase user count + Organization entity records
- Deadline: 12 months from signing

**Milestone 3: 10,000 Users + Tournament Partnerships** (+2%, total: 11%)
- Scale to 10,000 active users with tournament partnerships generating organic growth through seasonal play
- Verified by: Supabase user count + signed partnership documentation
- Deadline: 18 months from signing

**Milestone 4: $50K Annual Recurring Revenue** (+2%, total: 13%)
- Generate $50,000+ in annual recurring revenue (~$4,167/month) through platform subscriptions, premium tiers, and monetization features via Stripe
- Verified by: Stripe revenue dashboard — trailing 12-month or annualized MRR
- Deadline: 24 months from signing

**Milestone 5: $250K Capital Raise** (+2%, total: 15%)
- Close a fundraise of $250,000+ into the company from outside investors
- This milestone is separate from the revenue milestone — both are required to reach 15%
- Verified by: Signed investment agreement + funds deposited in company account
- Deadline: 24 months from signing

**Forfeiture:** If any individual milestone is not met within 12 months past its deadline, that milestone's equity is permanently forfeited and returns to TitanAI LLC. Milestones do not need to be completed in order, but each has its own expiration.

### Equity at Each Stage

| Stage | TitanAI LLC | Andrew Collazo | Trigger | Deadline |
|-------|-------------|----------------|---------|----------|
| Starting (upon signing) | 95% | 5% | Agreement executed + facility pilot launched | Day 1 |
| After 500 users | 93% | 7% | 500 active users from his network | Month 6 |
| After 2K users | 91% | 9% | 2,000 users + 5 leagues onboarded | Month 12 |
| After 10K users | 89% | 11% | 10,000 users + tournament partnerships | Month 18 |
| After $50K ARR | 87% | 13% | $50K+ annual recurring revenue | Month 24 |
| Full 85/15 | 85% | 15% | $250K fundraise closed | Month 24 |

### Final Position: 85 / 15

| TitanAI 85% | Andrew 15% |
|---|---|
| Back of House / Product / AI / Infrastructure / Majority Control | Front of House / Users / Revenue / Partnerships |

### Comparison: Original vs. Revised Terms

| | Original (v1) | Revised (v2) | Change |
|---|---|---|---|
| Starting equity | 25% | 5% | -20 points |
| Maximum equity | 45% | 15% | -30 points |
| Starting dollar value ($6M) | $1,500,000 | $300,000 | -$1.2M |
| Maximum dollar value ($6M) | $2,700,000 | $900,000 | -$1.8M |
| Per-milestone vest | 4% | 2% | -2 points |
| TitanAI minimum ownership | 55% | 85% | +30 points |

**Justification for reduction:**
1. Verified market valuation ($6M) is 2.4x higher than the original estimate ($2.5M) — each percentage point is worth more
2. Andrew's actual contributions (idea + contacts) are valued at $300K (5%), not $1.5M (25%)
3. Industry standard for advisory/GTM roles is 1-3% — even 5% starting is above market
4. Investor feedback strongly favors concentrated founder ownership
5. The platform has grown since v1 (mobile/PWA layer) with zero contribution from Andrew

---

## SECTION 07 — Roles & Responsibilities

### TitanAI LLC (Back of House)

- Product development and engineering
- AI infrastructure and feature development
- Mobile/PWA development and optimization
- Database, hosting, and deployment
- Security, performance, and reliability
- Technical architecture decisions (veto power)
- API integrations and third-party services
- Automated testing and quality assurance
- Data analytics and platform metrics
- All infrastructure and API costs

### Andrew Collazo (Front of House)

- User acquisition and community growth
- League, team, and tournament partnerships
- Fundraising and investor relations
- Public-facing representation and pitches
- Coach and parent onboarding
- Sports content strategy and curation
- Customer support and feedback collection
- Marketing, social media, and outreach
- Pilot programs at his facility and leagues

---

## SECTION 08 — Andrew's Network & Distribution Value

Andrew Collazo's primary value beyond the initial concept is his embedded position in the youth sports ecosystem. These are potential distribution channels — their value depends on execution.

| Asset | Value to Sportsphere | Status |
|-------|---------------------|--------|
| Girls softball team | Pilot group (~15-20 players/parents) | Available |
| 8u boys baseball team | Second pilot, different sport | Available |
| League connections | Path to bulk user acquisition | Unproven |
| Tournament connections | Competitive distribution channel | Unproven |
| Coach network | Coaches drive parent adoption | Unproven |
| Texas A&M affiliation | Credibility, collegiate access | Passive |
| Facility access | Physical pilot site | Available |
| GameChanger familiarity | End-user competitor insight | Passive |

**Important distinction:** These assets are *available* but *unproven*. No users have been delivered. No leagues have been onboarded. No partnerships have been signed. The milestone-based vesting structure ensures equity is earned only when these assets convert to measurable results.

---

## SECTION 09 — Protections & Governance

### Key Protections

| Clause | Detail |
|--------|--------|
| IP Ownership | TitanAI LLC retains 100% of all IP regardless of equity split |
| Technical Veto | TitanAI has final say on all technical and architectural decisions |
| TitanAI Branding | "Powered by TitanAI" branding remains on platform permanently |
| Forfeiture | If any milestone is not met within 12 months past its deadline, that milestone's equity is permanently forfeited to TitanAI |
| Non-Compete | Andrew agrees not to develop or fund a competing platform for 2 years |
| TitanAI Equity Protection | TitanAI's equity is locked and does not dilute from any fundraise. TitanAI maintains a floor of 85% — majority control is never relinquished |
| Investor Dilution Source | All investor equity comes from Andrew's vested and unvested pool first. New shares may only be created with TitanAI's written consent |
| Milestone Vesting Order | Milestone equity vests immediately prior to the closing of any fundraise that triggers it — vest first, then dilute |
| Acquisition Acceleration | If company is acquired, all milestones accelerate — Andrew receives full earned equity at time of sale |
| Drag-Along / Tag-Along | Both parties must agree to any acquisition (mutual consent) |
| No Equity Until Signed | Zero equity vests until this agreement is fully executed by both parties |
| Data Source Control | TitanAI owns every data source used to verify milestones (Supabase + Stripe) |

### Capital Allocation Priority

Upon any capital raise, funds are allocated in the following priority order:

| Priority | Allocation | Amount |
|----------|-----------|--------|
| 1st | TitanAI founder reimbursement (documented pre-investment development costs, hosting, APIs, infrastructure) | $35,000 |
| 2nd | 12-month operating runway (Supabase, Vercel, Anthropic API, Mux, CDN, domain, tools) | $10,000-$20,000 |
| 3rd | CTO compensation (TitanAI LLC) — 6 months | $48,000 |
| 4th | Front of House compensation (Andrew Collazo) — 6 months | $15,000 |
| 5th | Growth budget (marketing, tournament sponsorships) — jointly approved | $30,000 |
| 6th | Legal & compliance (operating agreement, COPPA, terms of service) | $15,000 |
| 7th | Reserve — held in company account, allocated by mutual agreement | Remainder |

### Compensation Structure

| Role | Monthly | Annualized | Market Rate | Discount |
|------|---------|-----------|------------|----------|
| CTO / Back of House (TitanAI LLC) | $8,000 | $96,000 | $120K-$180K | 20-47% below market |
| Front of House (Andrew Collazo) | $2,500 | $30,000 | $50K-$80K | 40-63% below market |

**Justification:** The CTO role commands higher compensation because (a) it reflects a higher market rate for senior full-stack engineering, AI, and infrastructure expertise, (b) TitanAI has already contributed months of unpaid development work valued at $632K-$1.19M, (c) the CTO is the single point of failure for the platform, and (d) Andrew's compensation is lower because his role is part-time until milestones demonstrate full commitment.

**Performance bonuses for Andrew:**
- $500 per team onboarded (verified by Organization entity)
- $1,000 per league partnership signed
- $2,500 per tournament partnership signed

These bonuses align compensation with results and supplement the below-market base.

**Pre-Capitalization:** Until a fundraise closes, TitanAI LLC continues to bear all operational costs. No compensation is owed to either party prior to capitalization. TitanAI's documented pre-investment costs are reimbursed first from any capital raised.

---

## SECTION 10 — Go-to-Market Timeline

**Week 1-2:** Legal & Foundation — Sign this agreement. Engage startup attorney. Document sweat equity. COPPA compliance review.

**Week 3-4:** Pilot Launch — Deploy Sportsphere at Andrew's facility. Onboard softball + baseball teams. Andrew begins coach outreach.

**Month 2:** Network Activation — Andrew onboards league contacts. Target 500 users. Launch on Product Hunt. Activate Stripe subscriptions.

**Month 3-4:** Revenue & Growth — Hit 2,000 users. Onboard 5 leagues. Begin pre-seed fundraise ($750K at $6M SAFE cap).

**Month 5-6:** Scale — Target 10,000 users. Tournament partnerships. Hire growth lead. Continue platform development.

---

## SECTION 11 — If Andrew Declines

TitanAI LLC is prepared to proceed independently if these terms are not accepted.

**Alternative paths:**
1. **Solo launch** — TitanAI raises at $6M with 100% ownership, hires a growth lead ($80-100K/yr) to fill the distribution role
2. **Alternative advisor** — TitanAI engages a different youth sports professional at 1-2% advisory equity
3. **Digital-first GTM** — Product Hunt, sports creator partnerships, social media outreach to coaches, public tournament directories

The platform exists independently of any distribution partner. Andrew's network accelerates launch but is not required for it.

---

## SECTION 12 — Next Steps

- **Review:** Andrew Collazo to review this revised proposal and confirm acceptance of terms
- **Legal review:** Both parties engage counsel to draft binding agreement
- **Execution:** Sign formal agreement within 30 days
- **Pilot:** Deploy Sportsphere at Andrew's facility for upcoming season
- **Commencement:** Begin collaborative go-to-market execution per timeline above

**Notice:** TitanAI LLC will continue developing the Sportsphere platform regardless of whether this agreement is executed. The platform is a TitanAI product, not a joint venture. This proposal offers Andrew an opportunity to participate in its growth, not a claim on its existence.

---

**TitanAI LLC**
OWNER / MANAGING MEMBER
BACK OF HOUSE / CTO

Date: _______________

**Andrew Collazo**
CONTRIBUTOR / FRONT OF HOUSE
BUSINESS DEVELOPMENT / COMMUNITY

Date: _______________

---

*POWERED BY TITANAI — COMPLIANCE-FIRST AI INFRASTRUCTURE*

*This document is confidential and intended solely for the named parties. Distribution, reproduction, or disclosure without written consent from TitanAI LLC is prohibited.*
