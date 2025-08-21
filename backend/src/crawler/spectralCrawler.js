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

            // Capture localStorage
            const storageCount = await this.page.evaluate(() => {
                try {
                    return window.localStorage.length;
                } catch (e) {
                    return 0;
                }
            });
            evidence.localStorageCount = storageCount;

            // Detect tracking pixels (1x1 images)
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

            // Count third-party scripts (simple network detection)
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

            const screenshotName = `${Date.now()}_${stage}.png`;
            await this.page.screenshot({ 
                path: path.join(this.options.screenshotDir, screenshotName),
                timeout: 10000
            });
            evidence.screenshot = screenshotName;

            console.log(`📸 ${stage}: ${scriptsCount} scripts, ${cookies.length} cookies, ${storageCount} localStorage, ${trackingPixels} pixels, ${thirdPartyScripts} 3rd-party`);
            return evidence;

        } catch (error) {
            console.error(`❌ Error capturing ${stage}:`, error.message);
            evidence.error = error.message;
            evidence.scriptsCount = 0;
            evidence.cookiesCount = 0;
            return evidence;
        }
    }

    async clickOneTrustButton(action) {
        console.log(`🖱️ Looking for OneTrust ${action} button...`);
        
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

        const found = await this.page.evaluate((actionType) => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const textPatterns = {
                accept: [
                    // English
                    'accept all cookies', 'allow all cookies', 'accept', 'allow all',
                    // German
                    'alle cookies akzeptieren', 'akzeptieren',
                    // French
                    'accepter tous les cookies', 'accepter',
                    // Spanish
                    'aceptar todas las cookies', 'aceptar',
                    // Italian
                    'accetta tutti i cookie', 'accettare',
                    // Portuguese
                    'aceitar todos os cookies', 'aceitar',
                    // Dutch
                    'alle cookies accepteren', 'accepteren',
                    // Swedish
                    'godkänn alla cookies', 'godkänn',
                    // Danish
                    'acceptér alle cookies', 'acceptér',
                    // Norwegian
                    'godta alle informasjonskapsler', 'godta'
                ],
                reject: [
                    // English
                    'reject all', 'decline', 'reject',
                    // German
                    'nur das notwendige akzeptieren', 'notwendige', 'ablehnen',
                    // French
                    'rejeter tout', 'rejeter', 'nécessaires uniquement',
                    // Spanish
                    'rechazar todo', 'rechazar', 'solo necesarias',
                    // Italian
                    'rifiuta tutto', 'rifiutare', 'solo necessari',
                    // Portuguese
                    'rejeitar tudo', 'rejeitar', 'apenas necessários',
                    // Dutch
                    'alles weigeren', 'weigeren', 'alleen noodzakelijk',
                    // Swedish
                    'avvisa alla', 'avvisa', 'endast nödvändiga',
                    // Danish
                    'afvis alle', 'afvis', 'kun nødvendige',
                    // Norwegian
                    'avvis alle', 'avvis', 'kun nødvendige'
                ],
                settings: [
                    // English
                    'cookie settings', 'manage preferences', 'settings',
                    // German
                    'einstellungen anpassen', 'meine einstellungen', 'cookie-einstellungen',
                    // French
                    'gérer les préférences', 'paramètres', 'gérer',
                    // Spanish
                    'gestionar preferencias', 'configuración', 'gestionar',
                    // Italian
                    'gestisci preferenze', 'impostazioni', 'gestire',
                    // Portuguese
                    'gerir preferências', 'definições', 'gerir',
                    // Dutch
                    'voorkeuren beheren', 'instellingen', 'beheren',
                    // Swedish
                    'hantera inställningar', 'inställningar', 'hantera',
                    // Danish
                    'administrer præferencer', 'indstillinger', 'administrer',
                    // Norwegian
                    'administrer preferanser', 'innstillinger', 'administrer'
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
            
            // Check SourcePoint
            const sourcePointBanner = document.querySelector('[class*="sp_choice"], [id*="sp_"], .message-container, [aria-label*="SP Consent"]') ||
                                     document.querySelector('iframe[src*="sourcepoint"], iframe[title*="SP Consent"]');
            
            const banner = oneTrustBanner || sourcePointBanner;
            if (!banner) return { detected: false };
            
            const textContent = banner.textContent || banner.innerText || '';
            const buttons = Array.from(document.querySelectorAll('button'));
            const buttonTexts = buttons.map(btn => btn.innerText.toLowerCase().trim()).filter(text => text);
            
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
                text.includes('afvis') || text.includes('nur das notwendige')
            );
            const hasSettings = buttonTexts.some(text => 
                text.includes('manage') || text.includes('settings') || text.includes('einstellungen') ||
                text.includes('gérer') || text.includes('gestionar') || text.includes('gestire') ||
                text.includes('gerir') || text.includes('beheren') || text.includes('hantera') ||
                text.includes('administrer') || text.includes('anpassen')
            );
            
            const provider = oneTrustBanner ? 'OneTrust' : 'SourcePoint';
            
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