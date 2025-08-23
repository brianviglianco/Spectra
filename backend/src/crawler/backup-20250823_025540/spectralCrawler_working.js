const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
const path = require('path');
const GDPRViolationEngine = require('./violationEngine');

puppeteer.use(StealthPlugin());

class SpectralCrawler {
    constructor(options = {}) {
        this.options = {
            headless: false,
            timeout: 60000,
            screenshotDir: path.join(__dirname, '../../public/screenshots'),
            ...options
        };
        this.browser = null;
        this.page = null;
        this.violationEngine = new GDPRViolationEngine();
    }

    async init() {
        console.log('🚀 Starting Spectral Crawler...');
        console.log('📊 GDPR Violation Engine loaded - 17 violation codes ready');
        
        await fs.mkdir(this.options.screenshotDir, { recursive: true });
        
        this.browser = await puppeteer.launch({
            headless: this.options.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--lang=de-DE',
                '--accept-lang=de-DE,de;q=0.9,en;q=0.8',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ],
            defaultViewport: { width: 1366, height: 768 }
        });

        this.page = await this.browser.newPage();
        await this.page.setGeolocation({ latitude: 52.5200, longitude: 13.4050 });
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8'
        });
    }

    async captureEvidence(stage, url) {
        console.log(`📊 Capturing ${stage}...`);
        
        const evidence = { timestamp: new Date().toISOString(), stage, url };

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            let scriptsCount = 0;
            let scriptDetails = [];
            try {
                const scriptData = await this.page.evaluate(() => {
                    return Array.from(document.scripts).map(script => ({
                        src: script.src || '',
                        type: script.type || '',
                        innerHTML: script.innerHTML ? script.innerHTML.substring(0, 100) : ''
                    }));
                });
                scriptsCount = scriptData.length;
                scriptDetails = scriptData;
            } catch (frameError) {
                console.log('⚠️ Frame detached, retrying...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                scriptsCount = await this.page.evaluate(() => document.scripts.length);
            }
            evidence.scriptsCount = scriptsCount;
            evidence.scripts = scriptDetails;

            const cookies = await this.page.cookies();
            evidence.cookiesCount = cookies.length;
            evidence.cookies = cookies;

            const storageCount = await this.page.evaluate(() => {
                try {
                    return window.localStorage.length;
                } catch (e) {
                    return 0;
                }
            });
            evidence.localStorageCount = storageCount;

            const trackingPixels = await this.page.evaluate(() => {
                const images = Array.from(document.querySelectorAll('img'));
                return images.filter(img => 
                    (img.width === 1 && img.height === 1) ||
                    img.src.includes('analytics') ||
                    img.src.includes('tracking') ||
                    img.src.includes('pixel') ||
                    img.src.includes('facebook.com') ||
                    img.src.includes('google-analytics.com')
                ).length;
            });
            evidence.trackingPixels = trackingPixels;

            const thirdPartyScripts = await this.page.evaluate(() => {
                const scripts = Array.from(document.scripts);
                return scripts.filter(script => {
                    const src = script.src;
                    return src && (
                        src.includes('google') ||
                        src.includes('facebook') ||
                        src.includes('analytics') ||
                        src.includes('doubleclick') ||
                        src.includes('amazon-adsystem') ||
                        !src.includes(window.location.hostname)
                    );
                }).length;
            });
            evidence.thirdPartyScripts = thirdPartyScripts;

            // ENHANCED: Analyze scripts by domain/purpose with COMPLETE tracking detection
            const scriptAnalysis = await this.page.evaluate(() => {
                const scripts = Array.from(document.scripts);
                
                // COMPREHENSIVE tracking domains database
                const trackingDomains = [
                    // Google ecosystem
                    'google-analytics.com', 'googletagmanager.com', 'googlesyndication.com', 'doubleclick.net',
                    'google.com/analytics', 'gstatic.com/analytics', 'googleadservices.com',
                    
                    // Facebook ecosystem  
                    'facebook.com', 'facebook.net', 'connect.facebook.net',
                    
                    // Adobe Analytics ecosystem - COMPLETE
                    'adobe.com', 'adobedtm.com', 'assets.adobedtm.com', 'omtrdc.net',
                    'demdex.net', 'everesttech.net', 'omniture.com',
                    
                    // Major analytics platforms
                    'segment.com', 'segment.io', 'cdn.segment.com', 'api.segment.io',
                    'mixpanel.com', 'amplitude.com', 'hotjar.com', 'mouseflow.com', 
                    'crazyegg.com', 'fullstory.com', 'logrocket.com', 'smartlook.com',
                    
                    // Advertising platforms
                    'amazon-adsystem.com', 'adsystem.amazon.com', 'scorecardresearch.com',
                    'quantserve.com', 'quantcast.com', 'outbrain.com', 'taboola.com',
                    'criteo.com', '6sc.co', 'bizible.com', 'marketo.net',
                    
                    // Social media tracking
                    'twitter.com/analytics', 'analytics.twitter.com', 
                    'linkedin.com/analytics', 'ads.linkedin.com', 'snap.licdn.com',
                    'pinterest.com/analytics', 'snapchat.com/analytics', 'tiktok.com/analytics',
                    
                    // Chat/support tracking
                    'drift.com', 'driftt.com', 'intercom.io', 'zendesk.com/embeddable_framework',
                    
                    // Other tracking services
                    'newrelic.com', 'bugsnag.com', 'sentry.io', 'datadog.com',
                    'pingdom.com', 'gtm.start.dk', 'gemius.dk'
                ];
                
                const necessaryDomains = [
                    // CMP scripts
                    'cookielaw.org', 'onetrust.com', 'cookiebot.com', 'cookieinformation.com',
                    'sourcepoint.mgr.consensu.org',
                    
                    // Core libraries
                    'jquery.com', 'jsdelivr.net', 'unpkg.com', 'cdnjs.cloudflare.com',
                    
                    // Security & Infrastructure - COMPREHENSIVE
                    'recaptcha.net', 'hcaptcha.com', 'cloudflare.com', 'challenges.cloudflare.com',
                    'turnstile.cloudflare.com', 'cf-assets.com',
                    
                    // Payment processing
                    'stripe.com', 'paypal.com', 'checkout.com',
                    
                    // CDN and infrastructure
                    'amazonaws.com', 'fastly.com', 'akamai.net', 'maxcdn.com',
                    
                    // Essential functionality
                    'polyfill.io', 'bootstrapcdn.com', 'fontawesome.com', 'fonts.googleapis.com'
                ];
                
                let trackingScripts = 0;
                let necessaryScripts = 0;
                let unknownScripts = 0;
                let trackingScriptDetails = [];
                let unknownScriptDetails = [];
                let necessaryScriptDetails = [];
                
                scripts.forEach((script, index) => {
                    const src = script.src || '';
                    const hostname = window.location.hostname;
                    
                    if (!src || src.includes(hostname)) {
                        necessaryScripts++;
                        necessaryScriptDetails.push(src || '[inline]');
                    } else if (trackingDomains.some(domain => src.toLowerCase().includes(domain.toLowerCase()))) {
                        trackingScripts++;
                        trackingScriptDetails.push(src);
                    } else if (necessaryDomains.some(domain => src.toLowerCase().includes(domain.toLowerCase()))) {
                        necessaryScripts++;
                        necessaryScriptDetails.push(src);
                    } else {
                        unknownScripts++;
                        unknownScriptDetails.push(src);
                    }
                });
                
                // Math validation
                const totalCalculated = trackingScripts + necessaryScripts + unknownScripts;
                
                return {
                    total: scripts.length,
                    tracking: trackingScripts,
                    necessary: necessaryScripts,
                    unknown: unknownScripts,
                    trackingDetails: trackingScriptDetails,
                    unknownDetails: unknownScriptDetails,
                    necessaryDetails: necessaryScriptDetails.slice(0, 5),
                    mathCheck: totalCalculated === scripts.length ? 'PASS' : 'FAIL'
                };
            });
            evidence.scriptAnalysis = scriptAnalysis;

            // Analyze cookies by domain/purpose
            const cookieAnalysis = await this.page.evaluate(() => {
                const cookies = document.cookie.split(';');
                const trackingCookies = cookies.filter(cookie => {
                    const name = cookie.split('=')[0].trim().toLowerCase();
                    return name.includes('ga') || name.includes('_utm') || 
                           name.includes('facebook') || name.includes('_fbp') ||
                           name.includes('linkedin') || name.includes('doubleclick');
                });
                
                return {
                    total: cookies.length,
                    tracking: trackingCookies.length,
                    necessary: cookies.length - trackingCookies.length
                };
            });
            evidence.cookieAnalysis = cookieAnalysis;

            // Analyze localStorage for tracking content
            const localStorageAnalysis = await this.page.evaluate(() => {
                let trackingItems = 0;
                try {
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i).toLowerCase();
                        if (key.includes('ga') || key.includes('utm') || key.includes('facebook') || 
                            key.includes('analytics') || key.includes('tracking')) {
                            trackingItems++;
                        }
                    }
                } catch (e) {
                    // localStorage not accessible
                }
                return {
                    total: localStorage.length || 0,
                    tracking: trackingItems,
                    necessary: (localStorage.length || 0) - trackingItems
                };
            });
            evidence.localStorageAnalysis = localStorageAnalysis;

            const screenshotName = `${Date.now()}_${stage}.png`;
            await this.page.screenshot({ 
                path: path.join(this.options.screenshotDir, screenshotName),
                timeout: 10000
            });
            evidence.screenshot = screenshotName;

            console.log(`📸 ${stage}: ${scriptsCount} scripts (${scriptAnalysis.tracking} tracking, ${scriptAnalysis.necessary} necessary, ${scriptAnalysis.unknown} unknown), ${cookies.length} cookies (${cookieAnalysis.tracking} tracking), ${storageCount} localStorage (${localStorageAnalysis.tracking} tracking), ${trackingPixels} pixels, ${thirdPartyScripts} 3rd-party`);
            
            // Math validation logging
            if (scriptAnalysis.mathCheck === 'FAIL') {
                console.log(`⚠️ MATH ERROR: Script totals don't add up for ${stage}`);
            }

            // Show script classification details for troubleshooting
            if (scriptAnalysis.tracking > 0) {
                console.log(`🎯 TRACKING SCRIPTS FOUND (${scriptAnalysis.tracking}):`);
                scriptAnalysis.trackingDetails.forEach((script, i) => {
                    console.log(`  ${i + 1}. ${script}`);
                });
            }

            // FIXED: Better unknown scripts logging
            if (scriptAnalysis.unknown > 0 && scriptAnalysis.unknownDetails) {
                const displayCount = Math.min(3, scriptAnalysis.unknown);
                console.log(`❓ UNKNOWN SCRIPTS (${scriptAnalysis.unknown})${scriptAnalysis.unknown > 3 ? ' - First 3:' : ':'}`);
                scriptAnalysis.unknownDetails.slice(0, displayCount).forEach((script, i) => {
                    console.log(`  ${i + 1}. ${script}`);
                });
                if (scriptAnalysis.unknown > 3) {
                    console.log(`  ... and ${scriptAnalysis.unknown - 3} more unknown scripts`);
                }
            }
            
            return evidence;

        } catch (error) {
            console.error(`❌ Error capturing ${stage}:`, error.message);
            evidence.error = error.message;
            evidence.scriptsCount = 0;
            evidence.cookiesCount = 0;
            evidence.localStorageCount = 0;
            evidence.trackingPixels = 0;
            evidence.thirdPartyScripts = 0;
            return evidence;
        }
    }

    async clickCMPButton(action) {
        console.log(`🖱️ Looking for ${action} button...`);
        
        // ENHANCED: Better OneTrust detection with more selectors
        const oneTrustSelectors = {
            accept: [
                '#onetrust-accept-btn-handler',
                '#accept-recommended-btn-handler',
                '.onetrust-close-btn-handler',
                '.ot-pc-refuse-all-handler'
            ],
            reject: [
                '#onetrust-reject-all-handler', 
                '#onetrust-pc-btn-handler',
                '.ot-pc-refuse-all-handler'
            ],
            settings: ['#onetrust-pc-btn-handler']
        };

        for (const selector of oneTrustSelectors[action] || []) {
            try {
                const button = await this.page.$(selector);
                if (button) {
                    const isVisible = await button.evaluate(el => el.offsetParent !== null);
                    if (isVisible) {
                        await button.click();
                        console.log(`✅ Clicked OneTrust ${action} button: ${selector}`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        return true;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Error with OneTrust selector ${selector}:`, error.message);
            }
        }

        // ENHANCED: Better Cookiebot detection
        const cookiebotSelectors = {
            accept: [
                '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
                '#CybotCookiebotDialogBodyButtonAccept',
                'button[data-cookie-optin-type="all"]',
                'a[data-cookie-optin-type="all"]'
            ],
            reject: [
                '#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll', 
                '#CybotCookiebotDialogBodyButtonDecline',
                'button[data-cookie-optin-type="necessary"]',
                'a[data-cookie-optin-type="necessary"]'
            ],
            settings: [
                '#CybotCookiebotDialogBodyLevelButtonLevelDetails',
                'button[data-cookie-optin-type="details"]'
            ]
        };

        for (const selector of cookiebotSelectors[action] || []) {
            try {
                const button = await this.page.$(selector);
                if (button) {
                    const isVisible = await button.evaluate(el => el.offsetParent !== null);
                    if (isVisible) {
                        await button.click();
                        console.log(`✅ Clicked Cookiebot ${action} button: ${selector}`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        return true;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Error with Cookiebot selector ${selector}:`, error.message);
            }
        }

        // Iframe handling
        const iframeSuccess = await this.page.evaluate((actionType) => {
            const iframes = document.querySelectorAll('iframe');
            for (const iframe of iframes) {
                try {
                    const rect = iframe.getBoundingClientRect();
                    if (rect.width > 100 && rect.height > 100) {
                        try {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                            if (iframeDoc) {
                                const buttons = iframeDoc.querySelectorAll('button, a, [role="button"]');
                                for (const btn of buttons) {
                                    const text = btn.textContent.toLowerCase();
                                    if (actionType === 'accept' && (
                                        text.includes('accept') || text.includes('allow') || 
                                        text.includes('tillad alle') || text.includes('accepter')
                                    )) {
                                        btn.click();
                                        return 'iframe_content_accept';
                                    } else if (actionType === 'reject' && (
                                        text.includes('reject') || text.includes('decline') ||
                                        text.includes('tillad udvalgte') || text.includes('kun nødvendige')
                                    )) {
                                        btn.click();
                                        return 'iframe_content_reject';
                                    }
                                }
                            }
                        } catch (crossOriginError) {}
                        
                        if (actionType === 'accept') {
                            const event = new MouseEvent('click', {
                                clientX: rect.left + rect.width * 0.7,
                                clientY: rect.top + rect.height * 0.8
                            });
                            document.elementFromPoint(event.clientX, event.clientY)?.click();
                            return 'iframe_fallback_accept';
                        } else if (actionType === 'reject') {
                            const event = new MouseEvent('click', {
                                clientX: rect.left + rect.width * 0.3,
                                clientY: rect.top + rect.height * 0.8
                            });
                            document.elementFromPoint(event.clientX, event.clientY)?.click();
                            return 'iframe_fallback_reject';
                        }
                    }
                } catch (e) {}
            }
            return false;
        }, action);

        if (iframeSuccess) {
            console.log(`✅ Clicked ${action} in iframe: ${iframeSuccess}`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            try {
                await this.page.waitForFunction(
                    () => document.readyState === 'complete',
                    { timeout: 10000 }
                );
            } catch (timeoutError) {
                console.log('⚠️ Page load timeout after consent click, continuing...');
            }
            
            return true;
        }

        // Fallback to text-based search
        const found = await this.page.evaluate((actionType) => {
            const elements = Array.from(document.querySelectorAll('button, a, [role="button"], .button, [onclick]'));
            const textPatterns = {
                accept: [
                    'accept all cookies', 'allow all cookies', 'accept all', 'allow all',
                    'i agree', 'got it', 'ok', 'continue', 'proceed',
                    'alle cookies akzeptieren', 'alle akzeptieren', 'einverstanden',
                    'accepter tous les cookies', 'tout accepter',
                    'tillad alle', 'accepter alle', 'tillad alle cookies'
                ],
                reject: [
                    'reject all', 'decline all', 'reject', 'decline', 'accept only necessary', 
                    'only necessary', 'necessary only', 'essential only',
                    'nur das notwendige akzeptieren', 'nur notwendige', 'ablehnen', 'nur erforderliche',
                    'tillad udvalgte', 'afvis alle', 'kun nødvendige', 'kun de nødvendige'
                ]
            };
            
            const patterns = textPatterns[actionType] || [];
            
            for (const element of elements) {
                const text = element.textContent.toLowerCase().trim();
                
                for (const pattern of patterns) {
                    if (text.includes(pattern.toLowerCase()) && text.length < 100) {
                        element.click();
                        return pattern;
                    }
                }
            }
            return false;
        }, action);

        if (found) {
            console.log(`✅ Clicked ${action} button by text: ${found}`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            try {
                await this.page.waitForFunction(
                    () => document.readyState === 'complete',
                    { timeout: 10000 }
                );
            } catch (timeoutError) {
                console.log('⚠️ Page load timeout after text-based consent click, continuing...');
            }
            
            return true;
        }

        console.log(`❌ No ${action} button found`);
        return false;
    }

    async analyzeBanner() {
        const bannerInfo = await this.page.evaluate(() => {
            const oneTrustBanner = document.querySelector('#onetrust-banner-sdk, #onetrust-consent-sdk');
            const cookiebotBanner = document.querySelector('#CybotCookiebotDialog, [id*="Cookiebot"], [id*="cookiebot"], .cookiebot') ||
                                   document.querySelector('iframe[src*="cookiebot"], iframe[src*="cookieinformation"]');
            const sourcePointBanner = document.querySelector('[class*="sp_choice"], [id*="sp_"], .message-container') ||
                                     document.querySelector('iframe[src*="sourcepoint"], iframe[title*="SP Consent"]');
            
            const banner = oneTrustBanner || cookiebotBanner || sourcePointBanner;
            if (!banner) return { detected: false };
            
            const consentButtons = [];
            const iframeButtons = [];
            
            document.querySelectorAll('button, a[role="button"], [data-cookie-optin-type]').forEach(btn => {
                const text = btn.textContent.toLowerCase().trim();
                if (text && (
                    text.includes('cookie') || text.includes('accept') || text.includes('reject') ||
                    text.includes('allow') || text.includes('decline') || text.includes('manage') ||
                    text.includes('tillad') || text.includes('afvis') || text.includes('indstillinger') ||
                    text.includes('einstellungen') || text.includes('akzeptieren') ||
                    btn.id.includes('cookie') || btn.id.includes('consent') ||
                    btn.className.includes('cookie') || btn.className.includes('consent')
                )) {
                    consentButtons.push(text);
                }
            });
            
            document.querySelectorAll('iframe').forEach(iframe => {
                try {
                    const iframeDoc = iframe.contentDocument;
                    if (iframeDoc) {
                        iframeDoc.querySelectorAll('button, a[role="button"]').forEach(btn => {
                            const text = btn.textContent.toLowerCase().trim();
                            if (text && text.length < 50) {
                                iframeButtons.push(text);
                            }
                        });
                    }
                } catch (e) {}
            });
            
            const allButtonTexts = [...consentButtons, ...iframeButtons].slice(0, 20);
            
            const hasAccept = allButtonTexts.some(text => 
                text.includes('accept') || text.includes('allow') || text.includes('akzeptieren') || 
                text.includes('accepter') || text.includes('aceptar') || text.includes('accettare') || 
                text.includes('aceitar') || text.includes('accepteren') || text.includes('godkänn') || 
                text.includes('acceptér') || text.includes('alle cookies') ||
                text.includes('tillad alle')
            );
            
            const hasReject = allButtonTexts.some(text => 
                text.includes('reject') || text.includes('decline') || text.includes('notwendige') ||
                text.includes('rejeter') || text.includes('rechazar') || text.includes('rifiutare') ||
                text.includes('rejeitar') || text.includes('weigeren') || text.includes('avvisa') ||
                text.includes('afvis') || text.includes('nur das notwendige') ||
                text.includes('accept only necessary') || text.includes('only necessary') ||
                text.includes('manage or reject') ||
                text.includes('tillad udvalgte') || text.includes('kun nødvendige')
            );
            
            const hasSettings = allButtonTexts.some(text => 
                text.includes('manage') || text.includes('settings') || text.includes('einstellungen') ||
                text.includes('gérer') || text.includes('gestionar') || text.includes('gestire') ||
                text.includes('gerir') || text.includes('beheren') || text.includes('hantera') ||
                text.includes('administrer') || text.includes('anpassen') ||
                text.includes('indstillinger') || text.includes('preferences') ||
                text.includes('customize') || text.includes('details')
            );
            
            let provider = 'Unknown';
            if (oneTrustBanner) provider = 'OneTrust';
            else if (cookiebotBanner) provider = 'Cookiebot'; 
            else if (sourcePointBanner) provider = 'SourcePoint';
            
            const textContent = banner.textContent || banner.innerText || '';
            
            return {
                detected: true,
                provider,
                text: textContent.substring(0, 200),
                hasDirectReject: hasReject,
                hasAccept: hasAccept,
                hasSettings: hasSettings,
                type: hasReject ? 'GDPR_style' : 'US_style',
                buttonTexts: allButtonTexts
            };
        });
        
        console.log('🎯 Banner Analysis:', bannerInfo);
        return bannerInfo;
    }

    async crawlSite(url) {
        console.log(`🌐 Crawling: ${url}`);
        const results = { url, evidence: {} };

        try {
            console.log('📋 Loading baseline...');
            await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.options.timeout });
            await new Promise(resolve => setTimeout(resolve, 5000));
            results.evidence.baseline = await this.captureEvidence('baseline', url);

            console.log('📋 Loading for reject...');
            await this.page.deleteCookie(...await this.page.cookies());
            await this.page.evaluate(() => localStorage.clear());
            await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.options.timeout });
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const bannerInfo = await this.analyzeBanner();
            results.bannerAnalysis = bannerInfo;
            
            results.evidence.reject_pre = await this.captureEvidence('reject_pre', url);
            
            if (bannerInfo.hasDirectReject) {
                const rejectSuccess = await this.clickCMPButton('reject');
                if (rejectSuccess) {
                    console.log('⏳ Waiting for rejection to take effect...');
                    await new Promise(resolve => setTimeout(resolve, 8000));
                    await this.page.reload({ waitUntil: 'domcontentloaded' });
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
                results.evidence.reject = await this.captureEvidence('reject', url);
            } else {
                console.log('⚠️ US-style banner: No reject option available');
                results.evidence.reject = {
                    ...results.evidence.reject_pre,
                    stage: 'reject_unavailable',
                    violation: 'No reject option provided (GDPR violation)'
                };
            }

            console.log('📋 Loading for accept...');
            await this.page.deleteCookie(...await this.page.cookies());
            await this.page.evaluate(() => localStorage.clear());
            await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.options.timeout });
            await new Promise(resolve => setTimeout(resolve, 5000));
            results.evidence.accept_pre = await this.captureEvidence('accept_pre', url);
            
            const acceptSuccess = await this.clickCMPButton('accept');
            if (acceptSuccess) {
                console.log('⏳ Waiting for acceptance to take effect and load tracking...');
                await new Promise(resolve => setTimeout(resolve, 10000));
                
                try {
                    await this.page.waitForFunction(
                        () => document.readyState === 'complete',
                        { timeout: 15000 }
                    );
                } catch (timeoutError) {
                    console.log('⚠️ Page complete timeout, continuing...');
                }
                
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            results.evidence.accept = await this.captureEvidence('accept', url);

            // ✅ FIXED: GDPR VIOLATION ANALYSIS WITH CORRECT STAGE MAPPING
   // ✅ FINAL FIX: GDPR VIOLATION ANALYSIS WITH CORRECT STAGE MAPPING
            console.log('\n🔍 ANALYZING GDPR COMPLIANCE...');
            console.log('📊 Running Professional Violation Detection Engine');

            const evidencePackage = {
                domain: url,
                stages: []
            };

            console.log('🔧 DEBUG: Raw evidence keys:', Object.keys(results.evidence));

            // CRITICAL FIX: stage MUST come AFTER spread operator to not be overwritten
            if (results.evidence.baseline) {
                console.log('📊 Mapping baseline to pre-consent stage (FINAL FIX)');
                const preConsentStage = {
                    ...results.evidence.baseline, // ❌ First spread the original data
                    stage: 'pre-consent', // ✅ THEN override the stage name
                    bannerAnalysis: bannerInfo // ✅ Add banner analysis
                };
                evidencePackage.stages.push(preConsentStage);
                console.log('🔧 DEBUG: Pre-consent stage created with stage name:', preConsentStage.stage);
            }

            if (results.evidence.reject_pre) {
                console.log('📊 Mapping reject_pre stage');
                evidencePackage.stages.push({
                    ...results.evidence.reject_pre,
                    stage: 'reject_pre' // ✅ Keep as is for effectiveness analysis
                });
            }

            if (results.evidence.reject) {
                console.log('📊 Mapping post-reject stage (FINAL FIX)');
                evidencePackage.stages.push({
                    ...results.evidence.reject,
                    stage: 'post-reject' // ✅ CRITICAL FIX - override original stage
                });
            }

            if (results.evidence.accept_pre) {
                console.log('📊 Mapping accept_pre stage');
                evidencePackage.stages.push({
                    ...results.evidence.accept_pre,
                    stage: 'accept_pre' // ✅ Keep as is for effectiveness analysis
                });
            }

            if (results.evidence.accept) {
                console.log('📊 Mapping post-accept stage (FINAL FIX)');
                evidencePackage.stages.push({
                    ...results.evidence.accept,
                    stage: 'post-accept' // ✅ CRITICAL FIX - override original stage
                });
            }

            console.log(`📊 Evidence package prepared with ${evidencePackage.stages.length} stages`);
            console.log(`📊 Stage names (FINAL FIX): ${evidencePackage.stages.map(s => s.stage).join(', ')}`);

            // DEBUG: Verify stages exist
            const preConsentCheck = evidencePackage.stages.find(s => s.stage === 'pre-consent');
            const postRejectCheck = evidencePackage.stages.find(s => s.stage === 'post-reject');
            const postAcceptCheck = evidencePackage.stages.find(s => s.stage === 'post-accept');

            console.log('✅ FINAL DEBUG VERIFICATION:');
            console.log('  Pre-consent stage found:', !!preConsentCheck, 'with tracking:', preConsentCheck?.scriptAnalysis?.tracking);
            console.log('  Post-reject stage found:', !!postRejectCheck);
            console.log('  Post-accept stage found:', !!postAcceptCheck);
            console.log('  Banner analysis attached:', !!preConsentCheck?.bannerAnalysis);

            const gdprReport = this.violationEngine.analyzeCompliance(evidencePackage);
            results.gdprCompliance = gdprReport;

        } catch (error) {
            console.error(`❌ Crawl error:`, error.message);
            results.error = error.message;
        }

        return results;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

module.exports = SpectralCrawler;