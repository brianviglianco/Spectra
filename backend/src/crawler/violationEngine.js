// violationEngine.js - GDPR Violation Detection and Classification Engine
// SPECTRAL MVP - Day 1 Implementation - BUGS FIXED
// Business Impact: Transforms basic detection into audit-ready professional reports

class GDPRViolationEngine {
    constructor() {
        this.violations = [];
        this.gdprArticles = this.initializeGDPRDatabase();
        this.violationCodes = this.initializeViolationCodes();
    }

    // GDPR Articles Database - Legal Foundation
    initializeGDPRDatabase() {
        return {
            'Article 5': {
                title: 'Principles relating to processing of personal data',
                subsections: {
                    '5(1)(a)': 'Lawfulness, fairness and transparency',
                    '5(1)(b)': 'Purpose limitation',
                    '5(1)(c)': 'Data minimisation',
                    '5(3)': 'Consent for cookies and tracking'
                }
            },
            'Article 6': {
                title: 'Lawfulness of processing',
                subsections: {
                    '6(1)(a)': 'Consent of the data subject'
                }
            },
            'Article 7': {
                title: 'Conditions for consent',
                subsections: {
                    '7(1)': 'Demonstrable consent',
                    '7(2)': 'Clear and distinguishable consent request',
                    '7(3)': 'Right to withdraw consent',
                    '7(4)': 'Freely given consent'
                }
            },
            'Article 12': {
                title: 'Transparent information and communication',
                subsections: {
                    '12(1)': 'Transparent and easily accessible information'
                }
            },
            'Article 21': {
                title: 'Right to object',
                subsections: {
                    '21(1)': 'Right to object to processing'
                }
            }
        };
    }

    // Violation Codes Database - Professional Classification System
    initializeViolationCodes() {
        return {
            // PRE-CONSENT VIOLATIONS
            'EU-C-001': {
                title: 'Pre-consent Tracking Script Execution',
                severity: 'HIGH',
                gdprArticle: 'Article 5(3)',
                description: 'Tracking scripts executed before user consent obtained',
                businessImpact: 'Unlawful processing of personal data, potential fines up to €20M',
                remediation: 'Implement consent-gated script loading using CMP integration'
            },
            'EU-C-002': {
                title: 'Pre-consent Cookie Setting',
                severity: 'HIGH', 
                gdprArticle: 'Article 5(3)',
                description: 'Non-essential cookies set before user consent',
                businessImpact: 'Violation of cookie consent requirements, regulatory action risk',
                remediation: 'Configure CMP to block non-essential cookies until consent'
            },
            'EU-C-003': {
                title: 'Pre-consent Third-party Requests',
                severity: 'HIGH',
                gdprArticle: 'Article 5(3)',
                description: 'Third-party tracking requests initiated before consent',
                businessImpact: 'Data sharing without legal basis, potential GDPR fines',
                remediation: 'Implement server-side consent verification for third-party integrations'
            },

            // CONSENT BANNER VIOLATIONS  
            'EU-C-004': {
                title: 'Missing Reject Option',
                severity: 'CRITICAL',
                gdprArticle: 'Article 7(4)',
                description: 'No clear mechanism to reject non-essential cookies',
                businessImpact: 'Consent not freely given, entire consent framework invalid',
                remediation: 'Add prominent "Reject All" button with equal visual weight to "Accept"'
            },
            'EU-C-005': {
                title: 'Accept-only Banner Design',
                severity: 'HIGH',
                gdprArticle: 'Article 7(4)',
                description: 'Banner designed to nudge users toward acceptance only',
                businessImpact: 'Consent not freely given, potential regulatory investigation',
                remediation: 'Redesign banner with neutral language and equal choice prominence'
            },
            'EU-C-006': {
                title: 'Pre-ticked Consent Boxes',
                severity: 'CRITICAL',
                gdprArticle: 'Article 7(2)',
                description: 'Consent checkboxes pre-selected by default',
                businessImpact: 'Invalid consent mechanism, complete compliance failure',
                remediation: 'Ensure all consent options default to unchecked state'
            },

            // TRANSPARENCY VIOLATIONS
            'EU-C-007': {
                title: 'Insufficient Cookie Information',
                severity: 'MEDIUM',
                gdprArticle: 'Article 12(1)',
                description: 'Incomplete or unclear cookie purpose descriptions',
                businessImpact: 'Lack of transparency, potential user complaints and fines',
                remediation: 'Provide detailed cookie tables with purpose, duration, and data controller'
            },
            'EU-C-008': {
                title: 'Missing Data Controller Information',
                severity: 'MEDIUM',
                gdprArticle: 'Article 12(1)', 
                description: 'Third-party data controllers not clearly identified',
                businessImpact: 'Transparency violations, difficulty exercising data subject rights',
                remediation: 'Create comprehensive list of all data processing parties'
            },

            // CONSENT WITHDRAWAL VIOLATIONS
            'EU-C-009': {
                title: 'Difficult Consent Withdrawal',
                severity: 'HIGH',
                gdprArticle: 'Article 7(3)',
                description: 'Consent withdrawal process more complex than giving consent',
                businessImpact: 'Violation of withdrawal rights, potential individual complaints',
                remediation: 'Implement one-click consent withdrawal mechanism'
            },
            'EU-C-010': {
                title: 'Hidden Preference Center',
                severity: 'MEDIUM',
                gdprArticle: 'Article 7(3)',
                description: 'Cookie preferences difficult to locate after initial consent',
                businessImpact: 'Impeded user rights, potential accessibility violations',
                remediation: 'Add persistent cookie preferences link in website footer'
            },

            // TECHNICAL VIOLATIONS
            'EU-C-011': {
                title: 'Consent Bypass Vulnerability',
                severity: 'CRITICAL',
                gdprArticle: 'Article 5(1)(a)',
                description: 'Technical methods detected to bypass consent mechanism',
                businessImpact: 'Systematic GDPR violations, potential criminal liability',
                remediation: 'Implement server-side consent validation and audit trails'
            },
            'EU-C-012': {
                title: 'Cross-site Consent Leakage',
                severity: 'HIGH',
                gdprArticle: 'Article 5(1)(c)',
                description: 'Consent state shared between unrelated websites',
                businessImpact: 'Data minimization violations, privacy breach potential',
                remediation: 'Isolate consent mechanisms per domain/legal entity'
            },

            // LEGITIMATE INTEREST VIOLATIONS
            'EU-C-013': {
                title: 'Unjustified Legitimate Interest',
                severity: 'HIGH',
                gdprArticle: 'Article 6(1)(f)',
                description: 'Legitimate interest claimed without proper balancing test',
                businessImpact: 'Invalid legal basis for processing, potential fines',
                remediation: 'Conduct and document legitimate interest assessment (LIA)'
            },
            'EU-C-014': {
                title: 'Missing Objection Mechanism',
                severity: 'MEDIUM',
                gdprArticle: 'Article 21(1)',
                description: 'No clear way to object to legitimate interest processing',
                businessImpact: 'Violation of objection rights, user complaint risk',
                remediation: 'Add "Object" options for all legitimate interest processing'
            },

            // SPECIAL CATEGORY VIOLATIONS
            'EU-C-015': {
                title: 'Special Category Data Processing',
                severity: 'CRITICAL',
                gdprArticle: 'Article 9',
                description: 'Sensitive personal data processed without explicit consent',
                businessImpact: 'Severe GDPR violations, maximum fine exposure €20M/4% revenue',
                remediation: 'Implement explicit consent mechanisms for sensitive data'
            },

            // CONSENT EFFECTIVENESS VIOLATIONS - NEW FOR BUG FIXES
            'EU-C-016': {
                title: 'Consent Mechanism Not Functional',
                severity: 'CRITICAL',
                gdprArticle: 'Article 7(1)',
                description: 'Accept consent does not activate agreed tracking technologies',
                businessImpact: 'CMP implementation failure, consent framework invalid',
                remediation: 'Debug and fix consent signal propagation to tracking scripts'
            },
            'EU-C-017': {
                title: 'Identical Tracking Regardless of Choice',
                severity: 'HIGH',
                gdprArticle: 'Article 7(4)',
                description: 'Same tracking behavior whether user accepts or rejects',
                businessImpact: 'Consent choices meaningless, potential regulatory investigation',
                remediation: 'Implement differential tracking based on user consent'
            }
        };
    }

    // Main Violation Analysis Function - ENHANCED FOR BUG FIXES
    analyzeCompliance(evidencePackage) {
        console.log('🔍 GDPR Engine: Starting compliance analysis...');
        this.violations = [];
        
        // Analyze each evidence stage
        this.analyzePreConsentViolations(evidencePackage);
        this.analyzeBannerViolations(evidencePackage);
        this.analyzeConsentMechanismViolations(evidencePackage);
        this.analyzeConsentEffectivenessViolations(evidencePackage); // NEW: Fix Bug #2
        this.analyzeTransparencyViolations(evidencePackage);
        
        console.log(`🔍 GDPR Engine: Analysis complete - ${this.violations.length} violations detected`);
        return this.generateComplianceReport();
    }

    // Pre-consent Violation Detection - FIXED TRACKING DOMAINS & LOGIC
    analyzePreConsentViolations(evidence) {
        console.log('🔍 Analyzing pre-consent violations...');
        console.log(`📊 Available stages: ${evidence.stages.map(s => s.stage).join(', ')}`);
        
        const preConsentStage = evidence.stages.find(stage => stage.stage === 'pre-consent');
        if (!preConsentStage) {
            console.log('⚠️ No pre-consent stage found');
            return;
        }

        console.log(`📊 Pre-consent analysis: ${preConsentStage.scripts?.length || 0} scripts found`);
        console.log(`📊 Script analysis data:`, preConsentStage.scriptAnalysis);

        // FIXED: Enhanced tracking script detection using scriptAnalysis data
        if (preConsentStage.scriptAnalysis && preConsentStage.scriptAnalysis.tracking > 0) {
            console.log(`🚨 Found ${preConsentStage.scriptAnalysis.tracking} tracking scripts in pre-consent stage`);
            
            this.addViolation('EU-C-001', {
                count: preConsentStage.scriptAnalysis.tracking,
                scripts: preConsentStage.scriptAnalysis.trackingDetails || [],
                evidence: preConsentStage.screenshot,
                rawData: {
                    totalScripts: preConsentStage.scriptsCount,
                    trackingScripts: preConsentStage.scriptAnalysis.tracking,
                    necessaryScripts: preConsentStage.scriptAnalysis.necessary
                }
            });
        }

        // FIXED: Enhanced cookie analysis using cookieAnalysis data  
        if (preConsentStage.cookieAnalysis && preConsentStage.cookieAnalysis.tracking > 0) {
            console.log(`🚨 Found ${preConsentStage.cookieAnalysis.tracking} tracking cookies in pre-consent stage`);
            
            this.addViolation('EU-C-002', {
                count: preConsentStage.cookieAnalysis.tracking,
                cookies: preConsentStage.cookies?.map(c => c.name) || [],
                evidence: preConsentStage.screenshot,
                rawData: {
                    totalCookies: preConsentStage.cookiesCount,
                    trackingCookies: preConsentStage.cookieAnalysis.tracking
                }
            });
        }

        // Check for third-party requests before consent
        if (preConsentStage.thirdPartyScripts > 0) {
            console.log(`🚨 Found ${preConsentStage.thirdPartyScripts} third-party scripts in pre-consent stage`);
            
            // Only flag if they're actually tracking scripts, not just any 3rd party
            const tracking3rdParty = preConsentStage.scripts?.filter(script => 
                script.src && this.isTrackingScript(script.src) && !this.isEssentialScript(script.src)
            ) || [];

            if (tracking3rdParty.length > 0) {
                this.addViolation('EU-C-003', {
                    count: tracking3rdParty.length,
                    requests: tracking3rdParty.map(s => s.src),
                    evidence: preConsentStage.screenshot
                });
            }
        }
    }

    // Banner Design Violation Detection - ENHANCED
    analyzeBannerViolations(evidence) {
        console.log('🔍 Analyzing banner violations...');
        console.log(`📊 Available stages: ${evidence.stages.map(s => s.stage).join(', ')}`);
        
        const bannerStage = evidence.stages.find(stage => stage.stage === 'pre-consent');
        if (!bannerStage || !bannerStage.bannerAnalysis) {
            console.log('⚠️ No banner analysis found');
            return;
        }

        const banner = bannerStage.bannerAnalysis;
        console.log(`📊 Banner analysis: Provider=${banner.provider}, HasReject=${banner.hasDirectReject}, Type=${banner.type}`);

        // Check for missing reject option
        if (!banner.hasDirectReject) {
            console.log('🚨 Missing reject option detected');
            this.addViolation('EU-C-004', {
                bannerType: banner.provider,
                detectedButtons: banner.buttonTexts?.slice(0, 10) || [], // Limit to avoid spam
                evidence: bannerStage.screenshot
            });
        }

        // Check for accept-only design patterns
        if (banner.type === 'US_style') {
            console.log('🚨 US-style banner detected (accept-only)');
            this.addViolation('EU-C-005', {
                bannerType: banner.provider,
                pattern: 'accept-only-design',
                evidence: bannerStage.screenshot
            });
        }
    }

    // NEW: Consent Effectiveness Analysis - FIXES BUG #2
    analyzeConsentEffectivenessViolations(evidence) {
        console.log('🔍 Analyzing consent effectiveness...');
        console.log(`📊 Available stages: ${evidence.stages.map(s => s.stage).join(', ')}`);
        
        const preAcceptStage = evidence.stages.find(stage => stage.stage === 'accept_pre');
        const postAcceptStage = evidence.stages.find(stage => stage.stage === 'post-accept');
        const preRejectStage = evidence.stages.find(stage => stage.stage === 'reject_pre');
        const postRejectStage = evidence.stages.find(stage => stage.stage === 'post-reject');

        if (!postAcceptStage || !postRejectStage) {
            console.log('⚠️ Missing accept/reject stages for effectiveness analysis');
            return;
        }

        // Check if accept actually increases tracking
        const acceptIncrease = this.calculateTrackingIncrease(preAcceptStage, postAcceptStage);
        console.log(`📊 Accept tracking increase: scripts+${acceptIncrease.scripts}, cookies+${acceptIncrease.cookies}, localStorage+${acceptIncrease.localStorage}`);

        // FIXED: If accept doesn't increase tracking significantly, it's a violation
        if (acceptIncrease.scripts === 0 && acceptIncrease.cookies === 0 && acceptIncrease.localStorage === 0) {
            console.log('🚨 Consent mechanism not functional - accept has no effect');
            this.addViolation('EU-C-016', {
                acceptIncrease,
                evidence: postAcceptStage.screenshot,
                details: 'Accept consent did not activate any additional tracking'
            });
        }

        // Check if reject/accept produce identical results  
        const identicalTracking = this.compareTrackingLevels(postRejectStage, postAcceptStage);
        if (identicalTracking.identical) {
            console.log('🚨 Identical tracking regardless of user choice');
            this.addViolation('EU-C-017', {
                rejectData: {
                    scripts: postRejectStage.scriptsCount,
                    cookies: postRejectStage.cookiesCount,
                    localStorage: postRejectStage.localStorageCount
                },
                acceptData: {
                    scripts: postAcceptStage.scriptsCount,
                    cookies: postAcceptStage.cookiesCount,  
                    localStorage: postAcceptStage.localStorageCount
                },
                evidence: postAcceptStage.screenshot
            });
        }
    }

    // NEW: Helper function to calculate tracking increase
    calculateTrackingIncrease(preStage, postStage) {
        if (!preStage || !postStage) {
            return { scripts: 0, cookies: 0, localStorage: 0 };
        }

        return {
            scripts: (postStage.scriptsCount || 0) - (preStage.scriptsCount || 0),
            cookies: (postStage.cookiesCount || 0) - (preStage.cookiesCount || 0),
            localStorage: (postStage.localStorageCount || 0) - (preStage.localStorageCount || 0)
        };
    }

    // NEW: Helper function to compare tracking levels
    compareTrackingLevels(stage1, stage2) {
        if (!stage1 || !stage2) return { identical: false };

        const identical = (
            stage1.scriptsCount === stage2.scriptsCount &&
            stage1.cookiesCount === stage2.cookiesCount &&
            stage1.localStorageCount === stage2.localStorageCount
        );

        return { identical };
    }

    // Consent Mechanism Analysis - ENHANCED
    analyzeConsentMechanismViolations(evidence) {
        console.log('🔍 Analyzing consent mechanism violations...');
        const postRejectStage = evidence.stages.find(stage => stage.stage === 'post-reject');
        const postAcceptStage = evidence.stages.find(stage => stage.stage === 'post-accept');

        if (postRejectStage && postRejectStage.scriptAnalysis) {
            // Check if tracking continues after rejection
            if (postRejectStage.scriptAnalysis.tracking > 0) {
                console.log(`🚨 Tracking continues after rejection: ${postRejectStage.scriptAnalysis.tracking} scripts`);
                this.addViolation('EU-C-011', {
                    type: 'consent-bypass',
                    scripts: postRejectStage.scriptAnalysis.trackingDetails || [],
                    evidence: postRejectStage.screenshot
                });
            }
        }
    }

    // Transparency Analysis
    analyzeTransparencyViolations(evidence) {
        console.log('🔍 Analyzing transparency violations...');
        const bannerStage = evidence.stages.find(stage => stage.stage === 'pre-consent');
        if (!bannerStage || !bannerStage.bannerAnalysis) return;

        const banner = bannerStage.bannerAnalysis;

        // Check for insufficient information
        if (banner.text && banner.text.length < 50) {
            console.log('🚨 Insufficient cookie information detected');
            this.addViolation('EU-C-007', {
                textLength: banner.text.length,
                missingInfo: 'detailed-cookie-purposes',
                evidence: bannerStage.screenshot
            });
        }
    }

    // ENHANCED: Script Classification with COMPREHENSIVE tracking domains
    isTrackingScript(src) {
        if (!src) return false;
        
        const trackingDomains = [
            // Google ecosystem - COMPREHENSIVE
            'google-analytics.com',
            'googletagmanager.com',
            'googlesyndication.com',
            'doubleclick.net',
            'google.com/analytics',
            'gstatic.com/analytics',
            'googleadservices.com',
            'google.dk/analytics', // Regional variants
            
            // Facebook ecosystem  
            'facebook.com',
            'facebook.net', 
            'connect.facebook.net',
            
            // Major analytics platforms - EXPANDED
            'segment.com',           // FIXED: Added segment.com explicitly
            'segment.io',
            'cdn.segment.com',       // FIXED: CDN variant
            'api.segment.io',        // FIXED: API variant
            'mixpanel.com',
            'amplitude.com',
            'hotjar.com',
            'mouseflow.com',
            'crazyegg.com',
            'fullstory.com',
            'logrocket.com',
            'smartlook.com',
            
            // Advertising platforms - COMPREHENSIVE
            'amazon-adsystem.com',
            'adsystem.amazon.com',
            'scorecardresearch.com',
            'quantserve.com',
            'quantcast.com',
            'outbrain.com',
            'taboola.com',
            'criteo.com',
            'adsystem.dk',           // Regional ad systems
            
            // Social media tracking - COMPREHENSIVE
            'twitter.com/analytics',
            'analytics.twitter.com', 
            'linkedin.com/analytics',
            'ads.linkedin.com',
            'pinterest.com/analytics',
            'snapchat.com/analytics',
            'tiktok.com/analytics',
            
            // Other tracking services - COMPREHENSIVE
            'newrelic.com',
            'bugsnag.com', 
            'sentry.io',
            'datadog.com',
            'pingdom.com',
            'gtm.start.dk',          // Danish tracking services
            'gemius.dk',             // Danish analytics
            
            // European tracking services
            'matomo.org',
            'piwik.org',
            'etracker.com',
            'webtrekk.com',
            'at-o.net',             // AT Internet
            'xiti.com',             // AT Internet
            
            // Cookie consent tracking (ironically)
            'cookiebot.com/uc',      // Cookiebot stats
            'onetrust.com/analytics' // OneTrust analytics
        ];
        
        const srcLower = src.toLowerCase();
        const isTracking = trackingDomains.some(domain => srcLower.includes(domain.toLowerCase()));
        
        if (isTracking) {
            console.log(`🎯 Tracking script identified: ${src}`);
        }
        
        return isTracking;
    }

    isEssentialScript(src) {
        if (!src) return false;
        
        const essentialPatterns = [
            // Core libraries
            '/jquery', '/bootstrap', '/foundation',
            'cdnjs.cloudflare.com',
            'unpkg.com',
            'jsdelivr.net',
            
            // Site functionality
            '/css/', '/fonts/', '/images/',
            '/static/', '/assets/',
            '/wp-content/', '/themes/',
            
            // Payment/security
            'stripe.com',
            'paypal.com', 
            'recaptcha.net',
            'hcaptcha.com',
            
            // CMP (these are essential for consent management)
            'cookielaw.org',
            'onetrust.com',
            'cookiebot.com',
            'cookieinformation.com',
            'sourcepoint.mgr.consensu.org',
            
            // CDN and infrastructure
            'amazonaws.com',
            'cloudflare.com',
            'fastly.com',
            'akamai.net'
        ];
        
        return essentialPatterns.some(pattern => src.toLowerCase().includes(pattern.toLowerCase()));
    }

    isEssentialCookie(name) {
        if (!name) return false;
        
        const essentialPatterns = [
            'session', 'csrf', 'auth', 'login', 'security',
            'language', 'currency', 'cart', 'checkout',
            'consent', 'cookie-consent', 'gdpr',
            'onetrust', 'cookiebot', 'euconsent',
            'necessary', 'essential', 'functional'
        ];
        
        return essentialPatterns.some(pattern => 
            name.toLowerCase().includes(pattern.toLowerCase())
        );
    }

    isThirdPartyTrackingRequest(url, domain) {
        try {
            const urlDomain = new URL(url).hostname;
            const siteDomain = new URL(domain).hostname;
            
            if (urlDomain === siteDomain) return false;
            
            return this.isTrackingScript(url);
        } catch (error) {
            return false;
        }
    }

    // Add Violation to Collection
    addViolation(code, details) {
        const violationDef = this.violationCodes[code];
        if (!violationDef) {
            console.log(`⚠️ Unknown violation code: ${code}`);
            return;
        }

        console.log(`🚨 Adding violation: ${code} - ${violationDef.title}`);
        this.violations.push({
            code,
            title: violationDef.title,
            severity: violationDef.severity,
            gdprArticle: violationDef.gdprArticle,
            description: violationDef.description,
            businessImpact: violationDef.businessImpact,
            remediation: violationDef.remediation,
            details,
            detectedAt: new Date().toISOString()
        });
    }

    // Generate Compliance Report
    generateComplianceReport() {
        const totalViolations = this.violations.length;
        const criticalViolations = this.violations.filter(v => v.severity === 'CRITICAL').length;
        const highViolations = this.violations.filter(v => v.severity === 'HIGH').length;
        const mediumViolations = this.violations.filter(v => v.severity === 'MEDIUM').length;

        // Calculate compliance score (0-100%)
        const complianceScore = this.calculateComplianceScore();
        
        // Determine risk level
        const riskLevel = this.calculateRiskLevel(criticalViolations, highViolations);

        console.log(`📊 Compliance report: ${complianceScore}% score, ${riskLevel} risk, ${totalViolations} violations`);

        return {
            complianceScore,
            riskLevel,
            summary: {
                totalViolations,
                criticalViolations,
                highViolations,
                mediumViolations
            },
            violations: this.violations,
            recommendations: this.generateRecommendations(),
            legalAnalysis: this.generateLegalAnalysis()
        };
    }

    // Calculate Compliance Score (0-100%) - STRICTER PENALTIES
    calculateComplianceScore() {
        if (this.violations.length === 0) return 100;

        let totalPenalty = 0;
        this.violations.forEach(violation => {
            switch(violation.severity) {
                case 'CRITICAL': totalPenalty += 30; break; // Increased from 25
                case 'HIGH': totalPenalty += 20; break;     // Increased from 15
                case 'MEDIUM': totalPenalty += 10; break;   // Increased from 8
                case 'LOW': totalPenalty += 5; break;       // Increased from 3
            }
        });

        return Math.max(0, 100 - totalPenalty);
    }

    // Calculate Risk Level
    calculateRiskLevel(critical, high) {
        if (critical > 0) return 'CRITICAL';
        if (high >= 2) return 'HIGH';  // Lowered threshold from 3 to 2
        if (high > 0) return 'MEDIUM';
        return 'LOW';
    }

    // Generate Actionable Recommendations
    generateRecommendations() {
        const recommendations = [];
        
        // Group violations by type for strategic recommendations
        const violationsByType = {};
        this.violations.forEach(violation => {
            const type = violation.code.substring(0, 6); // EU-C-00X
            if (!violationsByType[type]) violationsByType[type] = [];
            violationsByType[type].push(violation);
        });

        // Generate strategic recommendations
        if (this.violations.some(v => ['EU-C-001', 'EU-C-002', 'EU-C-003'].includes(v.code))) {
            recommendations.push({
                priority: 'IMMEDIATE',
                category: 'Technical Implementation',
                action: 'Implement consent-gated loading for all tracking technologies',
                timeline: '1-2 weeks',
                effort: 'Medium',
                impact: 'Eliminates high-risk pre-consent violations'
            });
        }

        if (this.violations.some(v => v.code === 'EU-C-004')) {
            recommendations.push({
                priority: 'IMMEDIATE', 
                category: 'UI/UX Design',
                action: 'Add prominent "Reject All" button to consent banner',
                timeline: '1-3 days',
                effort: 'Low',
                impact: 'Ensures freely given consent, critical for GDPR compliance'
            });
        }

        if (this.violations.some(v => ['EU-C-016', 'EU-C-017'].includes(v.code))) {
            recommendations.push({
                priority: 'CRITICAL',
                category: 'CMP Configuration',
                action: 'Debug and fix consent mechanism functionality',
                timeline: '1 week',
                effort: 'High',
                impact: 'Makes consent choices meaningful and legally valid'
            });
        }

        return recommendations;
    }

    // Generate Legal Analysis
    generateLegalAnalysis() {
        const affectedArticles = [...new Set(this.violations.map(v => v.gdprArticle))];
        
        return {
            affectedArticles,
            legalRisk: this.assessLegalRisk(),
            regulatoryAction: this.assessRegulatoryRisk(),
            fineExposure: this.calculateFineExposure()
        };
    }

    assessLegalRisk() {
        const critical = this.violations.filter(v => v.severity === 'CRITICAL').length;
        const high = this.violations.filter(v => v.severity === 'HIGH').length;

        if (critical > 0) {
            return 'HIGH - Fundamental consent violations detected. Immediate remediation required.';
        }
        if (high >= 2) {
            return 'MEDIUM - Multiple compliance issues. Address within 30 days.';
        }
        return 'LOW - Minor compliance gaps. Monitor and improve.';
    }

    assessRegulatoryRisk() {
        const hasConsentViolations = this.violations.some(v => 
            ['EU-C-001', 'EU-C-002', 'EU-C-004', 'EU-C-006', 'EU-C-016'].includes(v.code)
        );

        if (hasConsentViolations) {
            return 'Regulatory investigation risk if user complaints filed. Priority remediation advised.';
        }
        return 'Low regulatory risk. Proactive compliance improvements recommended.';
    }

    calculateFineExposure() {
        const critical = this.violations.filter(v => v.severity === 'CRITICAL').length;
        const high = this.violations.filter(v => v.severity === 'HIGH').length;

        if (critical > 0) {
            return 'Up to €20M or 4% of annual turnover for systematic consent violations';
        }
        if (high >= 2) {
            return 'Up to €10M or 2% of annual turnover for multiple compliance failures';
        }
        return 'Administrative fines up to €10,000 for minor violations';
    }
}

module.exports = GDPRViolationEngine;