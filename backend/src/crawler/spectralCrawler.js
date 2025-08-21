const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
const path = require('path');

puppeteer.use(StealthPlugin());

class SpectralCrawler {
    constructor(options = {}) {
        this.options = {
            headless: false,
            timeout: 30000,
            screenshotDir: path.join(__dirname, '../../public/screenshots'),
            ...options
        };
        this.browser = null;
        this.page = null;
    }

    async init() {
        console.log('🚀 Starting Spectral Crawler...');
        
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
            try {
                scriptsCount = await this.page.evaluate(() => document.scripts.length);
            } catch (frameError) {
                console.log('⚠️ Frame detached, retrying...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                scriptsCount = await this.page.evaluate(() => document.scripts.length);
            }
            evidence.scriptsCount = scriptsCount;

            const cookies = await this.page.cookies();
            evidence.cookiesCount = cookies.length;

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

            // Analyze scripts by domain/purpose
            const scriptAnalysis = await this.page.evaluate(() => {
                const scripts = Array.from(document.scripts);
                
                const trackingDomains = [
                    'google-analytics.com', 'googletagmanager.com', 'googlesyndication.com',
                    'facebook.com', 'facebook.net', 'doubleclick.net',
                    'amazon-adsystem.com', 'adsystem.amazon.com',
                    'twitter.com', 'analytics.twitter.com',
                    'linkedin.com', 'ads.linkedin.com',
                    'hotjar.com', 'mouseflow.com', 'crazyegg.com',
                    'segment.com', 'mixpanel.com', 'amplitude.com'
                ];
                
                const necessaryDomains = [
                    'cookielaw.org', 'onetrust.com', // CMP scripts
                    'jquery.com', 'jsdelivr.net', 'unpkg.com', // Libraries
                    'stripe.com', 'paypal.com', // Payment
                    'recaptcha.net', 'hcaptcha.com' // Security
                ];
                
                let trackingScripts = 0;
                let necessaryScripts = 0;
                let unknownScripts = 0;
                
                scripts.forEach(script => {
                    const src = script.src || '';
                    const hostname = window.location.hostname;
                    
                    if (!src || src.includes(hostname)) {
                        necessaryScripts++; // First-party or inline
                    } else if (trackingDomains.some(domain => src.includes(domain))) {
                        trackingScripts++;
                    } else if (necessaryDomains.some(domain => src.includes(domain))) {
                        necessaryScripts++;
                    } else {
                        unknownScripts++;
                    }
                });
                
                return {
                    total: scripts.length,
                    tracking: trackingScripts,
                    necessary: necessaryScripts,
                    unknown: unknownScripts
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
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i).toLowerCase();
                    if (key.includes('ga') || key.includes('utm') || key.includes('facebook') || 
                        key.includes('analytics') || key.includes('tracking')) {
                        trackingItems++;
                    }
                }
                return {
                    total: localStorage.length,
                    tracking: trackingItems,
                    necessary: localStorage.length - trackingItems
                };
            });
            evidence.localStorageAnalysis = localStorageAnalysis;

            const screenshotName = `${Date.now()}_${stage}.png`;
            await this.page.screenshot({ 
                path: path.join(this.options.screenshotDir, screenshotName),
                timeout: 10000
            });
            evidence.screenshot = screenshotName;

            console.log(`📸 ${stage}: ${scriptsCount} scripts (${scriptAnalysis.tracking} tracking, ${scriptAnalysis.necessary} necessary), ${cookies.length} cookies (${cookieAnalysis.tracking} tracking), ${storageCount} localStorage (${localStorageAnalysis.tracking} tracking), ${trackingPixels} pixels, ${thirdPartyScripts} 3rd-party`);
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

    async clickOneTrustButton(action) {
        console.log(`🖱️ Looking for ${action} button...`);
        
        // Try direct OneTrust selectors first
        const directSelectors = {
            accept: ['#onetrust-accept-btn-handler'],
            reject: ['#onetrust-reject-all-handler'],
            settings: ['#onetrust-pc-btn-handler']
        };

        for (const selector of directSelectors[action] || []) {
            try {
                const button = await this.page.$(selector);
                if (button) {
                    const isVisible = await button.evaluate(el => el.offsetParent !== null);
                    if (isVisible) {
                        await button.click();
                        console.log(`✅ Clicked ${action} button: ${selector}`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        return true;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Error with selector ${selector}:`, error.message);
            }
        }

        // Try clicking iframe content for SourcePoint
        const iframeClicked = await this.page.evaluate((actionType) => {
            const iframes = document.querySelectorAll('iframe');
            for (const iframe of iframes) {
                try {
                    const rect = iframe.getBoundingClientRect();
                    if (rect.width > 100 && rect.height > 100) { // Likely consent iframe
                        if (actionType === 'accept') {
                            iframe.click(); // Click center of iframe
                            return 'iframe_accept';
                        } else if (actionType === 'reject') {
                            // Click left side of iframe (where reject usually is)
                            const event = new MouseEvent('click', {
                                clientX: rect.left + rect.width * 0.3,
                                clientY: rect.top + rect.height * 0.8
                            });
                            iframe.dispatchEvent(event);
                            return 'iframe_reject';
                        }
                    }
                } catch (e) {}
            }
            return false;
        }, action);

        if (iframeClicked) {
            console.log(`✅ Clicked ${action} in iframe: ${iframeClicked}`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return true;
        }

        // Fallback to text-based search
        const found = await this.page.evaluate((actionType) => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const textPatterns = {
                accept: [
                    'accept all cookies', 'allow all cookies', 'accept', 'allow all',
                    'alle cookies akzeptieren', 'akzeptieren',
                    'accepter tous les cookies', 'accepter'
                ],
                reject: [
                    'reject all', 'decline', 'reject', 'accept only necessary', 'only necessary',
                    'nur das notwendige akzeptieren', 'notwendige', 'ablehnen'
                ]
            };
            
            for (const button of buttons) {
                const text = button.innerText.toLowerCase();
                const patterns = textPatterns[actionType] || [];
                
                for (const pattern of patterns) {
                    if (text.includes(pattern.toLowerCase())) {
                        button.click();
                        return pattern;
                    }
                }
            }
            return false;
        }, action);

        if (found) {
            console.log(`✅ Clicked ${action} button by text: ${found}`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return true;
        }

        console.log(`❌ No ${action} button found`);
        return false;
    }

    async analyzeBanner() {
        const bannerInfo = await this.page.evaluate(() => {
            // Check OneTrust
            const oneTrustBanner = document.querySelector('#onetrust-banner-sdk');
            
            // Check SourcePoint (including iframes)
            const sourcePointBanner = document.querySelector('[class*="sp_choice"], [id*="sp_"], .message-container') ||
                                     document.querySelector('iframe[src*="sourcepoint"], iframe[title*="SP Consent"]') ||
                                     (document.querySelector('iframe') && document.querySelector('iframe').contentDocument?.querySelector('[class*="sp_choice"]'));
            
            const banner = oneTrustBanner || sourcePointBanner;
            if (!banner) return { detected: false };
            
            // Get all buttons on page (including iframe content)
            const buttons = Array.from(document.querySelectorAll('button'));
            const iframeButtons = [];
            
            // Try to access iframe buttons (if same-origin)
            document.querySelectorAll('iframe').forEach(iframe => {
                try {
                    const iframeDoc = iframe.contentDocument;
                    if (iframeDoc) {
                        iframeButtons.push(...Array.from(iframeDoc.querySelectorAll('button')));
                    }
                } catch (e) {} // Cross-origin iframe, skip
            });
            
            const allButtons = [...buttons, ...iframeButtons];
            const buttonTexts = allButtons.map(btn => btn.innerText.toLowerCase().trim()).filter(text => text);
            
            const hasAccept = buttonTexts.some(text => 
                text.includes('accept') || text.includes('allow') || text.includes('akzeptieren') || 
                text.includes('accepter') || text.includes('aceptar') || text.includes('accettare') || 
                text.includes('aceitar') || text.includes('accepteren') || text.includes('godkänn') || 
                text.includes('acceptér') || text.includes('alle cookies')
            );
            const hasReject = buttonTexts.some(text => 
                text.includes('reject') || text.includes('decline') || text.includes('notwendige') ||
                text.includes('rejeter') || text.includes('rechazar') || text.includes('rifiutare') ||
                text.includes('rejeitar') || text.includes('weigeren') || text.includes('avvisa') ||
                text.includes('afvis') || text.includes('nur das notwendige') ||
                text.includes('accept only necessary') || text.includes('only necessary') ||
                text.includes('manage or reject')
            );
            const hasSettings = buttonTexts.some(text => 
                text.includes('manage') || text.includes('settings') || text.includes('einstellungen') ||
                text.includes('gérer') || text.includes('gestionar') || text.includes('gestire') ||
                text.includes('gerir') || text.includes('beheren') || text.includes('hantera') ||
                text.includes('administrer') || text.includes('anpassen')
            );
            
            const provider = oneTrustBanner ? 'OneTrust' : 'SourcePoint';
            const textContent = banner.textContent || banner.innerText || '';
            
            return {
                detected: true,
                provider,
                text: textContent.substring(0, 200),
                hasDirectReject: hasReject,
                hasAccept: hasAccept,
                hasSettings: hasSettings,
                type: hasReject ? 'GDPR_style' : 'US_style',
                buttonTexts: buttonTexts
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
            await this.page.goto(url, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 5000));
            results.evidence.baseline = await this.captureEvidence('baseline', url);

            console.log('📋 Loading for reject...');
            await this.page.deleteCookie(...await this.page.cookies());
            await this.page.evaluate(() => localStorage.clear());
            await this.page.goto(url, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const bannerInfo = await this.analyzeBanner();
            results.bannerAnalysis = bannerInfo;
            
            results.evidence.reject_pre = await this.captureEvidence('reject_pre', url);
            
            if (bannerInfo.hasDirectReject) {
                const rejectSuccess = await this.clickOneTrustButton('reject');
                if (rejectSuccess) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
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
            await this.page.goto(url, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 5000));
            results.evidence.accept_pre = await this.captureEvidence('accept_pre', url);
            
            const acceptSuccess = await this.clickOneTrustButton('accept');
            if (acceptSuccess) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            results.evidence.accept = await this.captureEvidence('accept', url);

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