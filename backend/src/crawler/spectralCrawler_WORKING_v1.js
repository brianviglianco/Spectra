// src/crawler/spectralCrawler.js
// Híbrido: Stealth + AutoConsent + Detectores manuales como fallback

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const CMPDetector = require('./cmps/cmpDetector');

// Enable stealth mode
puppeteer.use(StealthPlugin());

class SpectralCrawler {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        console.log('🚀 Iniciando Spectral Crawler híbrido (Stealth + AutoConsent)...');
        
        this.browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        this.page = await this.browser.newPage();
        
        // Setup europeo completo
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await this.page.setViewport({ width: 1366, height: 768 });
        
        // Geolocalización Berlin forzada
        await this.page.setGeolocation({
            latitude: 52.520008,
            longitude: 13.404954
        });

        // Headers alemanes completos
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'CF-IPCountry': 'DE',
            'CF-Connecting-IP': '85.214.132.117',
            'X-Forwarded-For': '85.214.132.117',
            'X-Real-IP': '85.214.132.117'
        });

        // Override timezone
        await this.page.evaluateOnNewDocument(() => {
            Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
                value: function() {
                    return { timeZone: 'Europe/Berlin' };
                }
            });
        });

        // Inyectar AutoConsent script al inicio de cada página
        await this.page.evaluateOnNewDocument(() => {
            window.autoConsentReject = async function() {
                console.log('🤖 AutoConsent: Intentando rechazar cookies...');
                
                const allButtons = Array.from(document.querySelectorAll('button, a[role="button"], div[role="button"]'));
                
                // Buscar "Cookie Settings"
                for (const button of allButtons) {
                    const text = button.textContent.toLowerCase();
                    if (text.includes('cookie settings') || text.includes('settings') || 
                        text.includes('configuración')) {
                        console.log('🎯 Abriendo Settings:', text);
                        button.click();
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        
                        // Desactivar todos los toggles excepto esenciales
                        const toggles = document.querySelectorAll('input[type="checkbox"], .toggle, [role="switch"]');
                        let togglesChanged = 0;
                        
                        for (const toggle of toggles) {
                            const label = toggle.closest('label') || toggle.parentElement;
                            const labelText = label ? label.textContent.toLowerCase() : '';
                            
                            // No tocar "essential" o "necessary"
                            if (labelText.includes('essential') || labelText.includes('necessary') || 
                                labelText.includes('esencial') || labelText.includes('necesario')) {
                                continue;
                            }
                            
                            // Desactivar todo lo demás
                            if (toggle.checked || toggle.getAttribute('aria-checked') === 'true') {
                                toggle.click();
                                togglesChanged++;
                                console.log('🔘 Toggle desactivado:', labelText);
                            }
                        }
                        
                        // Confirmar cambios
                        const confirmButtons = Array.from(document.querySelectorAll('button'));
                        for (const btn of confirmButtons) {
                            const btnText = btn.textContent.toLowerCase();
                            if (btnText.includes('confirm') || btnText.includes('save') || 
                                btnText.includes('confirmar') || btnText.includes('guardar')) {
                                btn.click();
                                console.log(`✅ AutoConsent: ${togglesChanged} toggles desactivados, confirmado`);
                                return 'CNN_Toggles';
                            }
                        }
                    }
                }

                // OneTrust API fallback
                if (window.OneTrust && window.OneTrust.setConsent) {
                    window.OneTrust.setConsent([1]); // Solo necessary
                    console.log('✅ AutoConsent: OneTrust API reject');
                    return 'OneTrust_API';
                }

                console.log('❌ AutoConsent: No encontrado');
                return null;
            };

            window.autoConsentAccept = async function() {
                console.log('🤖 AutoConsent: Intentando aceptar cookies...');
                
                // OneTrust
                const oneTrustAccept = document.querySelector('#onetrust-accept-btn-handler');
                if (oneTrustAccept && oneTrustAccept.offsetParent) {
                    oneTrustAccept.click();
                    console.log('✅ AutoConsent: OneTrust accept');
                    return 'OneTrust';
                }

                // Cookiebot
                const cookiebotAccept = document.querySelector('#CybotCookiebotDialogBodyButtonAccept');
                if (cookiebotAccept && cookiebotAccept.offsetParent) {
                    cookiebotAccept.click();
                    console.log('✅ AutoConsent: Cookiebot accept');
                    return 'Cookiebot';
                }

                // Búsqueda genérica
                const acceptTexts = ['accept all', 'allow all', 'agree to all'];
                const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
                
                for (const button of buttons) {
                    const text = button.textContent.toLowerCase();
                    if (acceptTexts.some(acceptText => text.includes(acceptText))) {
                        button.click();
                        console.log('✅ AutoConsent: Generic accept:', text);
                        return 'Generic';
                    }
                }

                console.log('❌ AutoConsent: No accept buttons found');
                return null;
            };
        });

        console.log('✅ Crawler híbrido iniciado');
    }

    async crawlState(domain, state) {
        const url = domain.startsWith('http') ? domain : `https://${domain}`;
        console.log(`📄 Navegando a: ${url} (${state})`);

        const stateResult = {
            state,
            url,
            timestamp: new Date().toISOString(),
            cmps: [],
            screenshots: {},
            cookies: [],
            evidence: {
                scripts: { before: [], after: [] },
                requests: { before: [], after: [] },
                storage: { before: {}, after: {} }
            },
            autoconsentResult: null
        };

        try {
            // Delay humano
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
            
            // Navegación
            await this.page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            // Esperar carga completa
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Evidencia ANTES (inicial - página cargada)
            await new Promise(resolve => setTimeout(resolve, 3000));
            await this.captureEvidence(stateResult.evidence, 'before');
            const screenshotBefore = await this.takeScreenshot(domain, state, 'before');
            stateResult.screenshots.before = screenshotBefore;

            // Ejecutar acciones según estado
            if (state === 'reject') {
                console.log('🤖 Intentando AutoConsent reject...');
                const autoResult = await this.page.evaluate(() => window.autoConsentReject());
                stateResult.autoconsentResult = autoResult;
                
                if (autoResult) {
                    console.log(`✅ AutoConsent exitoso: ${autoResult}`);
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar que termine tracking
                } else {
                    console.log('⚠️ AutoConsent falló, usando detectores manuales...');
                    await this.fallbackToManualDetectors(state);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } else if (state === 'accept') {
                console.log('🤖 Intentando AutoConsent accept...');
                const autoResult = await this.page.evaluate(() => window.autoConsentAccept());
                stateResult.autoconsentResult = autoResult;
                
                if (autoResult) {
                    console.log(`✅ AutoConsent exitoso: ${autoResult}`);
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar que cargue tracking
                } else {
                    console.log('⚠️ AutoConsent falló, usando detectores manuales...');
                    await this.fallbackToManualDetectors(state);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } else {
                // Baseline - no hacer nada, solo detectar CMPs
                console.log('📊 Estado baseline - solo detectando CMPs...');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            // Detectar CMPs (para logging)
            const cmpDetector = new CMPDetector(this.page);
            const detectedCMPs = await cmpDetector.detectAll();
            stateResult.cmps = detectedCMPs;

            // Evidencia DESPUÉS (post-acción)
            await this.captureEvidence(stateResult.evidence, 'after');
            const screenshotAfter = await this.takeScreenshot(domain, state, 'after');
            stateResult.screenshots.after = screenshotAfter;

            // Cookies finales
            const cookies = await this.page.cookies();
            stateResult.cookies = cookies;

            // Análisis de efectividad
            const scriptDiff = stateResult.evidence.scripts.after.length - stateResult.evidence.scripts.before.length;

            console.log(`✅ Estado ${state}: ${detectedCMPs.length} CMPs detectados, ${cookies.length} cookies`);
            console.log(`📊 Scripts: ${stateResult.evidence.scripts.before.length} → ${stateResult.evidence.scripts.after.length} (${scriptDiff > 0 ? '+' : ''}${scriptDiff})`);
            console.log(`🍪 AutoConsent: ${stateResult.autoconsentResult || 'No usado'}`);
            
            return stateResult;

        } catch (error) {
            console.error(`❌ Error en estado ${state}:`, error.message);
            stateResult.error = error.message;
            return stateResult;
        }
    }

    async fallbackToManualDetectors(state) {
        console.log('🔄 Ejecutando detectores manuales...');
        
        const cmpDetector = new CMPDetector(this.page);
        const detectedCMPs = await cmpDetector.detectAll();
        
        if (detectedCMPs.length > 0) {
            if (state === 'reject') {
                await cmpDetector.rejectAllCookies();
            } else if (state === 'accept') {
                await cmpDetector.acceptAllCookies();
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log('✅ Detectores manuales ejecutados');
        } else {
            console.log('❌ No se detectaron CMPs conocidos');
        }
    }

    async captureEvidence(evidence, moment) {
        console.log(`📊 Capturando evidencia ${moment}...`);

        // Scripts - incluir dinámicos
        evidence.scripts[moment] = await this.page.evaluate(() => {
            const allScripts = [];
            const scriptElements = document.querySelectorAll('script');
            
            scriptElements.forEach(script => {
                allScripts.push({
                    src: script.src || 'inline',
                    content: script.src ? null : script.innerHTML.slice(0, 100),
                    async: script.async,
                    defer: script.defer,
                    type: script.type || 'text/javascript'
                });
            });
            
            return allScripts;
        });

        // Requests completos - esperar que termine el tracking
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        evidence.requests[moment] = await this.page.evaluate(() => {
            return window.performance.getEntriesByType('resource').map(entry => ({
                name: entry.name,
                initiatorType: entry.initiatorType,
                transferSize: entry.transferSize || 0,
                responseEnd: entry.responseEnd
            }));
        });

        // Storage completo
        evidence.storage[moment] = await this.page.evaluate(() => {
            const storage = {};
            try {
                storage.localStorage = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    storage.localStorage[key] = localStorage.getItem(key)?.slice(0, 200);
                }
                
                storage.sessionStorage = {};
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    storage.sessionStorage[key] = sessionStorage.getItem(key)?.slice(0, 200);
                }
            } catch (error) {
                storage.localStorage = { error: 'Access denied' };
                storage.sessionStorage = { error: 'Access denied' };
            }
            return storage;
        });

        console.log(`📊 Evidencia ${moment}: ${evidence.scripts[moment].length} scripts, ${evidence.requests[moment].length} requests`);
    }

    async takeScreenshot(domain, state, moment) {
        const cleanDomain = domain.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${cleanDomain}_${state}_${moment}_${Date.now()}.png`;
        
        const screenshotsDir = path.join(__dirname, '../../public/screenshots');
        try {
            await require('fs').promises.mkdir(screenshotsDir, { recursive: true });
        } catch (error) {
            // Directory exists
        }
        
        const filepath = path.join(screenshotsDir, filename);
        await this.page.screenshot({ 
            path: filepath,
            fullPage: true 
        });

        console.log(`📸 Screenshot: ${filename}`);
        return filename;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔴 Navegador cerrado');
        }
    }
}

module.exports = SpectralCrawler;