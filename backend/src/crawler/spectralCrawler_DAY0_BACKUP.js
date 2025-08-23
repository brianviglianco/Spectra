// spectralCrawler.js - Enhanced with GDPR Violation Engine
// SPECTRAL MVP - Professional Privacy Compliance Verification
// Business Impact: Audit-ready reports with specific GDPR violation codes

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const GDPRViolationEngine = require('./violationEngine');

class SpectralCrawler {
    constructor() {
        this.browser = null;
        this.page = null;
        this.violationEngine = new GDPRViolationEngine();
    }

    async init() {
        console.log('🚀 Initializing SPECTRAL Privacy Compliance Scanner...');
        console.log('📊 Professional GDPR Violation Detection Engine Loading...');
        
        this.browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
        
        this.page = await this.browser.newPage();
        
        // Set European geolocation (Germany) - CRITICAL for GDPR banners
        await this.page.setGeolocation({ latitude: 52.5200, longitude: 13.4050 });
        
        // Set User-Agent for European region
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Set language preferences for European languages
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'en-GB,en;q=0.9,de;q=0.8,da;q=0.7'
        });
        
        console.log('✅ Browser initialized with European geolocation (Germany)');
        console.log('✅ GDPR Violation Engine ready - 15 violation codes loaded');
    }

    async captureEvidence(stage, url) {
        console.log(`📸 Capturing forensic evidence for stage: ${stage}`);
        
        const evidence = {
            stage,
            timestamp: new Date().toISOString(),
            url: url,
            screenshot: null,
            cookies: [],
            localStorage: {},
            sessionStorage: {},
            scripts: [],
            networkRequests: [],
            bannerAnalysis: null
        };

        try {
            // Capture screenshot
            const screenshotPath = path.join(__dirname, '../../public/screenshots', `${stage}-${Date.now()}.png`);
            await this.page.screenshot({ 
                path: screenshotPath, 
                fullPage: true 
            });
            evidence.screenshot = screenshotPath;
            console.log(`📸 Screenshot saved: ${screenshotPath}`);

            // Capture cookies
            evidence.cookies = await this.page.cookies();
            console.log(`🍪 Captured ${evidence.cookies.length} cookies`);

            // Capture localStorage and sessionStorage
            evidence.localStorage = await this.page.evaluate(() => {
                const ls = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    ls[key] = localStorage.getItem(key);
                }
                return ls;
            });

            evidence.sessionStorage = await this.page.evaluate(() => {
                const ss = {};
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    ss[key] = sessionStorage.getItem(key);
                }
                return ss;
            });

            // Capture loaded scripts
            evidence.scripts = await this.page.evaluate(() => {
                return Array.from(document.scripts).map(script => ({
                    src: script.src,
                    type: script.type,
                    async: script.async,
                    defer: script.defer,
                    innerHTML: script.innerHTML ? script.innerHTML.substring(0, 500) : ''
                }));
            });
            console.log(`📜 Captured ${evidence.scripts.length} scripts`);

            // Capture banner analysis for pre-consent stage
            if (stage === 'pre-consent') {
                evidence.bannerAnalysis = await this.analyzeBanner();
                console.log(`🎯 Banner analysis completed:`, evidence.bannerAnalysis);
            }

        } catch (error) {
            console.error(`❌ Error capturing evidence for ${stage}:`, error.message);
        }

        return evidence;
    }

    async analyzeBanner() {
        console.log('🔍 Analyzing consent banner...');
        
        const analysis = {
            detected: false,
            cmpType: 'unknown',
            hasAcceptButton: false,
            hasRejectButton: false,
            hasSettingsButton: false,
            hasRejectOption: false,
            hasAcceptOnly: false,
            isUSStyle: false,
            hasDetailedInfo: false,
            hasControllerInfo: false,
            language: 'unknown',
            buttons: []
        };

        try {
            // Check for OneTrust
            const oneTrustBanner = await this.page.$('#onetrust-banner-sdk');
            if (oneTrustBanner) {
                console.log('🎯 OneTrust CMP detected');
                analysis.detected = true;
                analysis.cmpType = 'OneTrust';
                
                // Analyze OneTrust buttons
                const acceptBtn = await this.page.$('#onetrust-accept-btn-handler');
                const rejectBtn = await this.page.$('#onetrust-reject-all-handler');
                const settingsBtn = await this.page.$('#onetrust-pc-btn-handler');
                
                analysis.hasAcceptButton = !!acceptBtn;
                analysis.hasRejectButton = !!rejectBtn;
                analysis.hasSettingsButton = !!settingsBtn;
                analysis.hasRejectOption = !!rejectBtn || !!settingsBtn;
                
                if (acceptBtn && !rejectBtn) {
                    analysis.hasAcceptOnly = true;
                    analysis.isUSStyle = true;
                }

                // Capture button texts
                if (acceptBtn) {
                    const btnText = await acceptBtn.evaluate(el => el.textContent);
                    analysis.buttons.push({ type: 'accept', text: btnText });
                }
                if (rejectBtn) {
                    const btnText = await rejectBtn.evaluate(el => el.textContent);
                    analysis.buttons.push({ type: 'reject', text: btnText });
                }
                if (settingsBtn) {
                    const btnText = await settingsBtn.evaluate(el => el.textContent);
                    analysis.buttons.push({ type: 'settings', text: btnText });
                }
            }

            // Check for Cookiebot
            const cookiebotBanner = await this.page.$('#CybotCookiebotDialog');
            if (cookiebotBanner) {
                console.log('🎯 Cookiebot CMP detected');
                analysis.detected = true;
                analysis.cmpType = 'Cookiebot';
                
                // Analyze Cookiebot buttons
                const acceptBtn = await this.page.$('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll, #CybotCookiebotDialogBodyButtonAccept');
                const rejectBtn = await this.page.$('#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll, #CybotCookiebotDialogBodyButtonDecline');
                const settingsBtn = await this.page.$('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection, #CybotCookiebotDialogBodyButtonSettings');
                
                analysis.hasAcceptButton = !!acceptBtn;
                analysis.hasRejectButton = !!rejectBtn;
                analysis.hasSettingsButton = !!settingsBtn;
                analysis.hasRejectOption = !!rejectBtn || !!settingsBtn;

                // Capture button texts for Cookiebot
                if (acceptBtn) {
                    const btnText = await acceptBtn.evaluate(el => el.textContent);
                    analysis.buttons.push({ type: 'accept', text: btnText });
                }
                if (rejectBtn) {
                    const btnText = await rejectBtn.evaluate(el => el.textContent);
                    analysis.buttons.push({ type: 'reject', text: btnText });
                }
                if (settingsBtn) {
                    const btnText = await settingsBtn.evaluate(el => el.textContent);
                    analysis.buttons.push({ type: 'settings', text: btnText });
                }
            }

            // Check for generic consent banners (fallback)
            if (!analysis.detected) {
                const genericBanner = await this.page.$('div[class*="cookie"], div[class*="consent"], div[class*="privacy"], div[id*="cookie"], div[id*="consent"]');
                if (genericBanner) {
                    console.log('🎯 Generic consent banner detected');
                    analysis.detected = true;
                    analysis.cmpType = 'Generic';
                    
                    // Try to find accept/reject buttons
                    const acceptBtn = await this.page.$('button[class*="accept"], a[class*="accept"], input[class*="accept"]');
                    const rejectBtn = await this.page.$('button[class*="reject"], button[class*="decline"], a[class*="reject"], a[class*="decline"]');
                    
                    analysis.hasAcceptButton = !!acceptBtn;
                    analysis.hasRejectButton = !!rejectBtn;
                    analysis.hasRejectOption = !!rejectBtn;
                    
                    if (acceptBtn && !rejectBtn) {
                        analysis.hasAcceptOnly = true;
                        analysis.isUSStyle = true;
                    }
                }
            }

            // Detect language (simplified)
            const pageText = await this.page.evaluate(() => document.body.textContent);
            if (pageText.includes('cookies') || pageText.includes('Cookie')) {
                analysis.language = 'English';
            } else if (pageText.includes('Cookies') && pageText.includes('Datenschutz')) {
                analysis.language = 'German';
            } else if (pageText.includes('cookies') && pageText.includes('privatlivspolitik')) {
                analysis.language = 'Danish';
            }

            // Check for detailed information
            analysis.hasDetailedInfo = pageText.includes('purpose') || pageText.includes('processing') || pageText.includes('legitimate interest');
            analysis.hasControllerInfo = pageText.includes('controller') || pageText.includes('processor') || pageText.includes('company');

        } catch (error) {
            console.error('❌ Error analyzing banner:', error.message);
        }

        return analysis;
    }

    async clickCMPButton(action) {
        console.log(`🖱️ Attempting to click ${action} button...`);
        
        try {
            // OneTrust selectors
            if (action === 'accept') {
                const oneTrustAccept = await this.page.$('#onetrust-accept-btn-handler');
                if (oneTrustAccept) {
                    await oneTrustAccept.click();
                    console.log('✅ Clicked OneTrust Accept button');
                    await this.page.waitForTimeout(2000);
                    return true;
                }

                const cookiebotAccept = await this.page.$('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll, #CybotCookiebotDialogBodyButtonAccept');
                if (cookiebotAccept) {
                    await cookiebotAccept.click();
                    console.log('✅ Clicked Cookiebot Accept button');
                    await this.page.waitForTimeout(2000);
                    return true;
                }
            }

            if (action === 'reject') {
                const oneTrustReject = await this.page.$('#onetrust-reject-all-handler');
                if (oneTrustReject) {
                    await oneTrustReject.click();
                    console.log('✅ Clicked OneTrust Reject button');
                    await this.page.waitForTimeout(2000);
                    return true;
                }

                const cookiebotReject = await this.page.$('#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll, #CybotCookiebotDialogBodyButtonDecline');
                if (cookiebotReject) {
                    await cookiebotReject.click();
                    console.log('✅ Clicked Cookiebot Reject button');
                    await this.page.waitForTimeout(2000);
                    return true;
                }
            }

            // Fallback text-based clicking
            const fallbackSuccess = await this.clickByText(action);
            if (fallbackSuccess) return true;

            console.log(`⚠️ No ${action} button found`);
            return false;

        } catch (error) {
            console.error(`❌ Error clicking ${action} button:`, error.message);
            return false;
        }
    }

    async clickByText(action) {
        const textMap = {
            'accept': ['Accept', 'Accept All', 'Akzeptieren', 'Alle akzeptieren', 'Acceptér', 'Acceptér alle'],
            'reject': ['Reject', 'Reject All', 'Decline', 'Ablehnen', 'Alle ablehnen', 'Afvis', 'Afvis alle']
        };

        const searchTexts = textMap[action] || [];
        
        for (const text of searchTexts) {
            try {
                const element = await this.page.evaluateHandle((searchText) => {
                    const xpath = `//button[contains(text(), '${searchText}')] | //a[contains(text(), '${searchText}')] | //input[@value='${searchText}']`;
                    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                    return result.singleNodeValue;
                }, text);

                if (element.asElement()) {
                    await element.asElement().click();
                    console.log(`✅ Clicked ${action} button by text: ${text}`);
                    await this.page.waitForTimeout(2000);
                    return true;
                }
            } catch (error) {
                // Continue to next text option
            }
        }
        
        return false;
    }

    async crawlSite(url) {
        console.log(`\n🎯 Starting SPECTRAL compliance scan for: ${url}`);
        console.log('📊 Professional GDPR Violation Detection Engine Active');
        console.log('⚖️ 15 violation codes ready | EU-C-001 through EU-C-015');
        
        const startTime = Date.now();
        const evidencePackage = {
            domain: url,
            scanId: `scan_${Date.now()}`,
            timestamp: new Date().toISOString(),
            stages: []
        };

        try {
            // Stage 1: Baseline Evidence (Clean state)
            console.log('\n📋 STAGE 1: Baseline Evidence Capture');
            await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
            await this.page.waitForTimeout(3000);
            
            const baselineEvidence = await this.captureEvidence('baseline', url);
            evidencePackage.stages.push(baselineEvidence);

            // Stage 2: Pre-consent Evidence (Banner visible, no interaction)
            console.log('\n📋 STAGE 2: Pre-consent Analysis (CRITICAL FOR GDPR)');
            await this.page.reload({ waitUntil: 'networkidle0' });
            await this.page.waitForTimeout(3000);
            
            const preConsentEvidence = await this.captureEvidence('pre-consent', url);
            evidencePackage.stages.push(preConsentEvidence);

            // Stage 3: Post-reject Evidence (After rejecting cookies)
            console.log('\n📋 STAGE 3: Post-reject Analysis');
            await this.page.reload({ waitUntil: 'networkidle0' });
            await this.page.waitForTimeout(3000);
            
            const rejectSuccess = await this.clickCMPButton('reject');
            if (rejectSuccess) {
                await this.page.waitForTimeout(3000);
                const postRejectEvidence = await this.captureEvidence('post-reject', url);
                evidencePackage.stages.push(postRejectEvidence);
            } else {
                console.log('⚠️ Could not test reject scenario - may indicate EU-C-004 violation');
            }

            // Stage 4: Post-accept Evidence (After accepting cookies)
            console.log('\n📋 STAGE 4: Post-accept Analysis');
            await this.page.reload({ waitUntil: 'networkidle0' });
            await this.page.waitForTimeout(3000);
            
            const acceptSuccess = await this.clickCMPButton('accept');
            if (acceptSuccess) {
                await this.page.waitForTimeout(3000);
                const postAcceptEvidence = await this.captureEvidence('post-accept', url);
                evidencePackage.stages.push(postAcceptEvidence);
            }

            // Professional GDPR Violation Analysis
            console.log('\n🔍 ANALYZING GDPR COMPLIANCE...');
            console.log('📊 Running Professional Violation Detection Engine');
            console.log('⚖️ Checking Articles 5, 6, 7, 12, 21 compliance...');
            
            const complianceReport = this.violationEngine.analyzeCompliance(evidencePackage);
            
            // Generate Professional Report
            const report = this.generateProfessionalReport(url, evidencePackage, complianceReport, startTime);
            
            return report;

        } catch (error) {
            console.error('❌ Error during crawl:', error.message);
            throw error;
        }
    }

    generateProfessionalReport(url, evidencePackage, complianceReport, startTime) {
        const scanDuration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        console.log('\n' + '='.repeat(80));
        console.log('📊 SPECTRAL PRIVACY COMPLIANCE AUDIT REPORT');
        console.log('='.repeat(80));
        console.log(`🌐 Domain: ${url}`);
        console.log(`📅 Scan Date: ${new Date().toLocaleString()}`);
        console.log(`⏱️ Scan Duration: ${scanDuration} seconds`);
        console.log(`🎯 Compliance Score: ${complianceReport.complianceScore}%`);
        console.log(`⚠️ Risk Level: ${complianceReport.riskLevel}`);
        console.log('='.repeat(80));

        // Executive Summary
        console.log('\n📋 EXECUTIVE SUMMARY');
        console.log('-'.repeat(50));
        if (complianceReport.violations.length === 0) {
            console.log('✅ NO GDPR VIOLATIONS DETECTED');
            console.log('   Site demonstrates good privacy compliance practices.');
            console.log('   Congratulations! This site follows GDPR best practices.');
        } else {
            console.log(`🚨 ${complianceReport.summary.totalViolations} GDPR VIOLATIONS DETECTED:`);
            console.log(`   • ${complianceReport.summary.criticalViolations} Critical violations (immediate action required)`);
            console.log(`   • ${complianceReport.summary.highViolations} High-severity violations (fix within 1 week)`);
            console.log(`   • ${complianceReport.summary.mediumViolations} Medium-severity violations (fix within 1 month)`);
        }

        // Detailed Violations
        if (complianceReport.violations.length > 0) {
            console.log('\n🔍 DETAILED VIOLATION ANALYSIS');
            console.log('-'.repeat(50));
            
            complianceReport.violations.forEach((violation, index) => {
                console.log(`\n[${violation.code}] ${violation.title}`);
                console.log(`📜 GDPR Reference: ${violation.gdprArticle}`);
                console.log(`⚠️ Severity: ${violation.severity}`);
                console.log(`📋 Description: ${violation.description}`);
                console.log(`💼 Business Impact: ${violation.businessImpact}`);
                console.log(`🔧 Remediation: ${violation.remediation}`);
                
                if (violation.details) {
                    if (violation.details.scripts?.length > 0) {
                        console.log(`📜 Detected Scripts: ${violation.details.scripts.slice(0, 3).join(', ')}${violation.details.scripts.length > 3 ? '...' : ''}`);
                    }
                    if (violation.details.cookies?.length > 0) {
                        console.log(`🍪 Detected Cookies: ${violation.details.cookies.slice(0, 3).join(', ')}${violation.details.cookies.length > 3 ? '...' : ''}`);
                    }
                }
            });
        }

        // Legal Analysis
        console.log('\n⚖️ LEGAL RISK ASSESSMENT');
        console.log('-'.repeat(50));
        console.log(`Legal Risk: ${complianceReport.legalAnalysis.legalRisk}`);
        console.log(`Regulatory Risk: ${complianceReport.legalAnalysis.regulatoryAction}`);
        console.log(`Fine Exposure: ${complianceReport.legalAnalysis.fineExposure}`);
        
        if (complianceReport.legalAnalysis.affectedArticles.length > 0) {
            console.log(`Affected GDPR Articles: ${complianceReport.legalAnalysis.affectedArticles.join(', ')}`);
        }

        // Recommendations
        if (complianceReport.recommendations.length > 0) {
            console.log('\n💡 STRATEGIC RECOMMENDATIONS');
            console.log('-'.repeat(50));
            complianceReport.recommendations.forEach((rec, index) => {
                console.log(`\n${index + 1}. ${rec.action}`);
                console.log(`   Priority: ${rec.priority} | Timeline: ${rec.timeline} | Effort: ${rec.effort}`);
                console.log(`   Impact: ${rec.impact}`);
            });
        }

        // Technical Summary
        console.log('\n🔧 TECHNICAL SCAN SUMMARY');
        console.log('-'.repeat(50));
        evidencePackage.stages.forEach(stage => {
            console.log(`📋 ${stage.stage}: ${stage.scripts.length} scripts, ${stage.cookies.length} cookies captured`);
        });

        // CMP Analysis Summary
        const preConsentStage = evidencePackage.stages.find(stage => stage.stage === 'pre-consent');
        if (preConsentStage && preConsentStage.bannerAnalysis) {
            console.log(`🎯 CMP Detected: ${preConsentStage.bannerAnalysis.cmpType}`);
            console.log(`🎯 Language: ${preConsentStage.bannerAnalysis.language}`);
            console.log(`🎯 Has Reject Option: ${preConsentStage.bannerAnalysis.hasRejectOption ? 'Yes' : 'No'}`);
        }

        console.log('\n' + '='.repeat(80));
        console.log('✅ SPECTRAL AUDIT COMPLETE - Professional Privacy Compliance Report Generated');
        console.log('📊 This report is ready for legal review and regulatory submission');
        console.log('='.repeat(80));

        return {
            domain: url,
            scanId: evidencePackage.scanId,
            timestamp: evidencePackage.timestamp,
            scanDuration: parseFloat(scanDuration),
            complianceScore: complianceReport.complianceScore,
            riskLevel: complianceReport.riskLevel,
            summary: complianceReport.summary,
            violations: complianceReport.violations,
            legalAnalysis: complianceReport.legalAnalysis,
            recommendations: complianceReport.recommendations,
            evidencePackage: evidencePackage,
            reportGenerated: new Date().toISOString()
        };
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔒 Browser closed');
        }
    }
}

module.exports = SpectralCrawler;