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
            // Wait for page stability
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Count scripts with retry
            let scriptsCount = 0;
            try {
                scriptsCount = await this.page.evaluate(() => document.scripts.length);
            } catch (frameError) {
                console.log('⚠️ Frame detached, retrying...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                scriptsCount = await this.page.evaluate(() => document.scripts.length);
            }
            evidence.scriptsCount = scriptsCount;

            // Count cookies
            const cookies = await this.page.cookies();
            evidence.cookiesCount = cookies.length;

            // Take screenshot
            const screenshotName = `${Date.now()}_${stage}.png`;
            await this.page.screenshot({ 
                path: path.join(this.options.screenshotDir, screenshotName),
                timeout: 10000
            });
            evidence.screenshot = screenshotName;

            console.log(`📸 ${stage}: ${scriptsCount} scripts, ${cookies.length} cookies`);
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
        
        // Try direct selectors first
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

        // Try text-based search
        const found = await this.page.evaluate((actionType) => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const textPatterns = {
                accept: ['Accept all cookies', 'Allow all cookies', 'Accept', 'Allow all'],
                reject: ['Reject all', 'Decline', 'Reject'],
                settings: ['Review cookie settings', 'Cookie settings', 'Manage preferences', 'Settings']
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

        // If reject not found, try settings approach
        if (action === 'reject') {
            console.log('🔧 No direct reject, trying settings approach...');
            return await this.handleSettingsReject();
        }

        console.log(`❌ No ${action} button found`);
        return false;
    }

    async handleSettingsReject() {
        try {
            // Click settings button by text search
            const settingsClicked = await this.page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                for (const button of buttons) {
                    const text = button.innerText.toLowerCase();
                    if (text.includes('review') || text.includes('settings') || text.includes('manage')) {
                        button.click();
                        return true;
                    }
                }
                return false;
            });

            if (settingsClicked) {
                console.log('🔧 Opened cookie settings');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Turn off all toggles
                const toggles = await this.page.$('.ot-switch input:not([disabled])');
                console.log(`🔧 Found ${toggles.length} toggles`);
                
                for (const toggle of toggles) {
                    try {
                        const isChecked = await toggle.evaluate(el => el.checked);
                        if (isChecked) {
                            await toggle.click();
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    } catch (error) {
                        console.log('⚠️ Toggle error:', error.message);
                    }
                }
                
                // Find save button by text
                const saveClicked = await this.page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    for (const button of buttons) {
                        const text = button.innerText.toLowerCase();
                        if (text.includes('confirm') || text.includes('save') || text.includes('apply')) {
                            button.click();
                            return true;
                        }
                    }
                    return false;
                });

                if (saveClicked) {
                    console.log('✅ Settings reject completed');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.log('❌ Settings reject failed:', error.message);
            return false;
        }
    }

    async analyzeBanner() {
        const bannerInfo = await this.page.evaluate(() => {
            const banner = document.querySelector('#onetrust-banner-sdk, [id*="onetrust"]');
            if (!banner) return { detected: false };
            
            const buttons = Array.from(banner.querySelectorAll('button'));
            const buttonTexts = buttons.map(btn => btn.innerText.toLowerCase());
            
            const hasAccept = buttonTexts.some(text => 
                text.includes('accept') || text.includes('allow')
            );
            const hasReject = buttonTexts.some(text => 
                text.includes('reject') || text.includes('decline')
            );
            const hasSettings = buttonTexts.some(text => 
                text.includes('review') || text.includes('settings') || text.includes('manage')
            );
            
            return {
                detected: true,
                text: banner.innerText.substring(0, 200),
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
            // BASELINE - fresh load
            console.log('📋 Loading baseline...');
            await this.page.goto(url, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 5000));
            results.evidence.baseline = await this.captureEvidence('baseline', url);

            // REJECT - fresh load
            console.log('📋 Loading for reject...');
            await this.page.deleteCookie(...await this.page.cookies());
            await this.page.evaluate(() => localStorage.clear());
            await this.page.goto(url, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Analyze banner before interaction
            const bannerInfo = await this.analyzeBanner();
            results.bannerAnalysis = bannerInfo;
            
            results.evidence.reject_pre = await this.captureEvidence('reject_pre', url);
            
            const rejectSuccess = await this.clickOneTrustButton('reject');
            if (rejectSuccess) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            results.evidence.reject = await this.captureEvidence('reject', url);

            // ACCEPT - fresh load  
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