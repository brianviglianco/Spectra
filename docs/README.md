# SPECTRAL - Automated Privacy Decision Verification Platform

🔍 **Automatically verifies if websites respect user privacy decisions with forensic evidence**

[![Development Status](https://img.shields.io/badge/Status-MVP%20Development-yellow)](https://github.com/brianviglianco/Spectral)
[![Demo Ready](https://img.shields.io/badge/Demo-3%20Weeks-green)](https://brianviglianco.github.io/Spectral/)

## What is SPECTRAL?

SPECTRAL simulates real users navigating websites, tests different privacy states (accept/reject/none), and captures forensic evidence of GDPR/CCPA violations through automated browser interactions with 8+ CMP providers.

**Unique Value:** Runtime verification vs. static compliance tools + multi-CMP automation + forensic evidence capture.

## 🚀 Live Demo

**Sales Deck:** [https://brianviglianco.github.io/Spectral/](https://brianviglianco.github.io/Spectral/)
- 21 comprehensive slides
- Interactive tech presentation
- Complete business case

## 🎯 Core Features

- **Multi-CMP Detection** - OneTrust, Didomi, TrustArc, Cookiebot + 4 more
- **Forensic Evidence** - Screenshots PRE/POST + HAR files + violation reports  
- **Global Regulations** - GDPR, CCPA, LGPD, PIPEDA coverage (MVP: GDPR only)
- **Runtime Verification** - 24/7 monitoring vs point-in-time audits
- **Client↔Server Correlation** - Ensures legal state consistency

## 📊 Market Opportunity

- **Market:** $21.17B Privacy Management Software (28.2% CAGR)
- **Target:** $80M ARR by Year 5, 1,000+ enterprise customers  
- **Competitive Advantage:** Runtime verification vs OneTrust/TrustArc static assessments

## 💼 Business Model

```
Freemium: 1 domain, weekly scans (SMB adoption)
Starter:  $1,500/month (3 domains, weekly scans)
Pro:      $5,000/month (15 domains, daily scans)
Enterprise: $15,000/month (unlimited, real-time)
Platform: $50,000+/month (white-label)
```

## 🏗️ Technical Architecture

### Current Stack (Working)
- **Backend:** Node.js v22.18.0 + Express + PostgreSQL + Prisma ✅
- **Auth:** JWT + bcrypt authentication ✅
- **API:** User management + domain CRUD ✅
- **Database:** User/Domain/CrawlSession/Violation models ✅

### Next Implementation
- **Crawler:** Puppeteer + multi-CMP automation
- **Evidence:** Screenshots + HAR analysis + reports
- **Frontend:** Next.js + Tailwind dashboard

## 📋 Development Progress
## ðŸ"‹ Development Progress

### âœ… Completed (August 21, 2025)
- [x] Development environment setup
- [x] PostgreSQL + Prisma configuration  
- [x] JWT authentication system
- [x] Domain management CRUD
- [x] **OneTrust CMP Detection & Interaction**
- [x] **Complete Evidence Capture System**
  - Scripts executed (before/after interactions)
  - Network requests monitoring
  - localStorage/sessionStorage tracking
  - Tracking pixels detection (1x1 images)
- [x] **Multi-state Privacy Testing**
  - Baseline (no interaction)
  - Reject cookies flow
  - Accept cookies flow
- [x] **European Geolocation Simulation**
- [x] **Forensic Screenshot Capture**
- [x] **Session Isolation & Validation**
- [x] GitHub repository structure
- [x] Sales deck deployment

### ðŸ"„ Current Capabilities
**OneTrust Violation Detection:**
- Baseline: 35 scripts → 35 scripts (9 cookies)
- Reject: 35 scripts → 37 scripts (+2 violations, 15 cookies)
- Accept: 35 scripts → 91 scripts (+56 violations, 40 cookies)

**Evidence Collection:**
- Complete script execution monitoring
- Network request tracking (84→212 requests on accept)
- Browser storage analysis
- Tracking pixel identification
- Forensic screenshots (before/after)

### ðŸ"… Roadmap
**Week 1 (Current):** Multi-CMP crawler + violation detection âœ… 75% Complete  
**Week 2:** Frontend dashboard + evidence viewer  
**Week 3:** Demo preparation + deployment

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/brianviglianco/Spectral.git
cd Spectral/backend

# Install dependencies  
npm install
npm install puppeteer  # Next session

# Start development server
npm run dev
# Server: http://localhost:3001
# API: /health, /api/auth, /api/domains
```

## 🔧 Environment Setup

**Requirements:**
- Node.js v22.18.0+
- PostgreSQL 
- macOS/Linux terminal

**Current Status:**
- Database: `spectral_dev` running locally
- Test user: brian@spectral.com registered
- API endpoints functional

## 🎯 MVP Scope (3 Weeks)

**Geography:** Europe/GDPR only (expand globally post-MVP)  
**Surface:** Web desktop only  
**CMPs:** 8+ providers automated (OneTrust, Didomi, TrustArc, etc.)  
**Demo Target:** Live privacy violation detection for investors

## 🌍 Full Product Vision

**Global:** GDPR + CCPA + LGPD + PIPEDA coverage  
**Surfaces:** Web + mobile apps + Connected TV  
**Enterprise:** Continuous monitoring + compliance dashboards  

## 💰 Funding Status

**Primary Target:** Direcly Partners ($200K-350K for 25-35% equity)  
**Secondary:** Argentine ecosystem (NXTP Labs, Wayra) + international VCs  
**Timeline:** Seed round target Q4 2025

## 📁 Repository Structure

```
spectral/
├── 🎨 sales-deck/     # Live presentation (deployed)
├── 🔧 backend/        # Node.js API (current focus)  
├── 🎯 frontend/       # React dashboard (Week 2)
├── 📊 docs/          # Business documentation
└── 🚀 deployment/    # Production configs
```

## 🧩 Key Insights

Based on Python prototype analysis:
- Complex OneTrust reject flows required
- Multi-region header simulation needed
- Evidence capture patterns proven  
- GDPR violation rules validated

## 📞 Contact

**Founder:** Brian Viglianco  
**Location:** Buenos Aires, Argentina  
**Status:** Seeking technical co-founder + funding  
**Demo Ready:** September 10, 2025

---

⭐ **Star this repo if you're interested in automated privacy compliance!**
