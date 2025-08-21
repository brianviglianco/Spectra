# SPECTRAL - Complete Context Handoff

## 🎯 PROJECT OVERVIEW
**SPECTRAL** = Automated Privacy Decision Verification Platform
- **Value Prop:** "Automatically verifies if websites respect user privacy decisions with forensic evidence"
- **Status:** MVP Development Phase (3 weeks to demo)
- **Confidence:** 85% - PROCEED

## 🚀 WHAT SPECTRAL DOES
Simulates real users navigating websites, testing different privacy states (accept/reject/none), and captures forensic evidence of GDPR/CCPA violations through automated browser interactions.

**Unique Advantage:** Runtime verification vs. static compliance tools + multi-CMP automation + forensic evidence capture.

## 📊 MARKET & BUSINESS
- **TAM:** $21.17B Privacy Management market by 2032 (28.2% CAGR)
- **Target:** $80M ARR by Year 5, 1,000+ enterprise customers
- **Pricing:** $1,500-$50,000/month + freemium tier
- **Competitors:** OneTrust, TrustArc (static assessment vs. our runtime verification)

## 💰 FUNDING STRATEGY
**Primary:** Direcly Partners (Brian's agency) - $200K-350K for 25-35% equity
**Secondary:** Argentine ecosystem (NXTP Labs, Wayra) + international VCs
**Revenue model:** SaaS + freemium for SMB adoption

## 🏗️ TECHNICAL ARCHITECTURE
### Current Stack (Working)
- **Backend:** Node.js v22.18.0 + Express + PostgreSQL + Prisma ✅
- **Auth:** JWT + bcrypt ✅
- **API:** User management + domain CRUD ✅
- **Database:** spectral_dev with User/Domain/CrawlSession/Violation models ✅

### Next Implementation (Session 3)
- **Crawler:** Puppeteer + multi-CMP detection (OneTrust, Didomi, TrustArc, etc.)
- **Evidence:** Screenshots PRE/POST + HAR files + violation reports
- **Frontend:** Next.js + Tailwind dashboard

## 🎯 MVP SCOPE (3 Weeks)
**Week 1:** Multi-CMP crawler + GDPR violation detection ✅ Backend done
**Week 2:** Frontend dashboard + evidence viewer
**Week 3:** Demo preparation + deployment

**Geographic:** Europe/GDPR only (expand post-MVP)
**Surface:** Web desktop only
**CMPs:** 8+ providers automated
**Demo:** Live privacy violation detection for investors

## 🌍 FULL PRODUCT VISION
**Global:** GDPR + CCPA + LGPD + PIPEDA coverage
**Surfaces:** Web + mobile apps + Connected TV
**Enterprise:** Continuous monitoring + compliance dashboards + API integration

## 📋 CURRENT STATUS
### ✅ COMPLETED (August 20, 2025)
- Node.js development environment
- PostgreSQL + Prisma + Auth system
- Domain management CRUD
- User registered: brian@spectral.com
- GitHub synchronized
- Sales deck live: https://brianviglianco.github.io/Spectral/

### 🔄 NEXT SESSION PRIORITY
- Puppeteer installation
- Multi-CMP detection patterns (inspired by Python prototype)
- Screenshot capture PRE/POST consent
- Basic GDPR violation rules

## 🧩 LEARNED FROM PYTHON PROTOTYPE
Brian shared blacklight_crawl_addon.py with valuable patterns:
- **CMP Detection:** OneTrust complex flows, Usercentrics, Didomi selectors
- **Region Simulation:** Headers + timezone + locale per region
- **Evidence Capture:** Screenshots + HAR + vendor categorization
- **Violation Rules:** EU-C-001 (pre-consent tracking), EU-C-002 (first-party cookies)

**Key Insight:** Need robust OneTrust reject flows + CPRA fallbacks + iframe handling.

## 💻 ENVIRONMENT DETAILS
- **Location:** ~/Desktop/Spectral/backend
- **Server:** http://localhost:3001
- **Database:** spectral_dev (PostgreSQL)
- **API:** /health, /api/auth, /api/domains
- **macOS:** zsh terminal

## 🎪 DEMO REQUIREMENTS
**Audience:** Direcly partners, Argentine investors, international VCs
**Must show:** Real website crawled → privacy violations detected → professional evidence report
**Timeline:** 3 weeks to investor-grade demo

## 🚨 SUCCESS CRITERIA
- Functional multi-CMP detection
- Evidence generation (screenshots + reports)
- <30s scan time, <5% false positives
- Professional UI for demos
- Live deployment ready

---

**DEVELOPMENT APPROACH:** Step-by-step guidance for business background founder. Next session: Puppeteer + CMP automation implementation.
