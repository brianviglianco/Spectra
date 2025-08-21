// src/crawler/spectralCrawler.js
// Motor principal de crawling de SPECTRAL

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const CMPDetector = require('./cmps/cmpDetector');

class SpectralCrawler {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    // Inicializa el navegador con geolocalización europea
    async init() {
        console.log('🚀 Iniciando Spectral Crawler...');
        
        this.browser = await puppeteer.launch({
            headless: false, // Visual para debugging
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
        
        // Configurar geolocalización europea (Berlin)
        await this.page.setGeolocation({
            latitude: 52.520008, 
            longitude: 13.404954
        });
        
        // Headers europeos para activar GDPR
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'en-GB,en;q=0.9',
            'CF-IPCountry': 'DE'
        });
        
        // Configurar viewport y user agent
        await this.page.setViewport({ width: 1920, height: 1080 });
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log('✅ Navegador iniciado (simulando ubicación europea)');
    }

    // Crawlea un dominio completo (3 estados: sin CMP, aceptar, rechazar)
    async crawlDomain(domain) {
        console.log(`🌐 Crawleando dominio: ${domain}`);
        
        const results = {
            domain,
            timestamp: new Date().toISOString(),
            states: {}
        };

        try {
            // Estado 1: Sin interacción con CMP (baseline)
            console.log('📊 Estado 1: Baseline (sin CMP)');
            results.states.baseline = await this.crawlState(domain, 'baseline');

            // Estado 2: Rechazar cookies
            console.log('🚫 Estado 2: Rechazar cookies');
            results.states.reject = await this.crawlState(domain, 'reject');

            // Estado 3: Aceptar cookies
            console.log('✅ Estado 3: Aceptar cookies');
            results.states.accept = await this.crawlState(domain, 'accept');

            console.log(`🎯 Crawling completo para ${domain}`);
            return results;

        } catch (error) {
            console.error(`❌ Error crawleando ${domain}:`, error);
            results.error = error.message;
            return results;
        }
    }

    // Crawlea un estado específico (baseline/reject/accept)
    async crawlState(domain, state) {
        const url = domain.startsWith('http') ? domain : `https://${domain}`;
        console.log(`📄 Navegando a: ${url} (${state})`);

        const stateResult = {
            state,
            url,
            timestamp: new Date().toISOString(),
            cmps: [],
            screenshots: {},
            violations: [],
            evidence: {
                scripts: { before: [], after: [] },
                requests: { before: [], after: [] },
                storage: { before: {}, after: {} },
                pixels: { before: [], after: [] }
            }
        };

        try {
            // Navegar a la página
            await this.page.goto(url, { 
                waitUntil: 'networkidle0',
                timeout: 30000 
            });

            // Capturar evidencia ANTES
            await this.captureEvidence(stateResult.evidence, 'before');

            // Screenshot inicial
            const screenshotBefore = await this.takeScreenshot(domain, state, 'before');
            stateResult.screenshots.before = screenshotBefore;

            // Detectar CMPs
            const cmpDetector = new CMPDetector(this.page);
            const detectedCMPs = await cmpDetector.detectAll();
            stateResult.cmps = detectedCMPs;

            // Interactuar según el estado
            if (state === 'reject' && detectedCMPs.length > 0) {
                await cmpDetector.rejectAllCookies();
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else if (state === 'accept' && detectedCMPs.length > 0) {
                await cmpDetector.acceptAllCookies();
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            // Capturar evidencia DESPUÉS
            await this.captureEvidence(stateResult.evidence, 'after');

            // Screenshot después de interacción
            const screenshotAfter = await this.takeScreenshot(domain, state, 'after');
            stateResult.screenshots.after = screenshotAfter;

            // Analizar cookies
            const cookies = await this.page.cookies();
            stateResult.cookies = cookies;

            console.log(`✅ Estado ${state} completado: ${detectedCMPs.length} CMPs, ${cookies.length} cookies`);
            return stateResult;

        } catch (error) {
            console.error(`❌ Error en estado ${state}:`, error.message);
            stateResult.error = error.message;
            return stateResult;
        }
    }

    // Captura evidencia completa (scripts, requests, storage, pixels)
    async captureEvidence(evidence, moment) {
        console.log(`📊 Capturando evidencia ${moment}...`);

        // 1. Scripts ejecutados
        evidence.scripts[moment] = await this.page.evaluate(() => {
            return Array.from(document.scripts).map(script => ({
                src: script.src || 'inline',
                content: script.src ? null : script.innerHTML.slice(0, 200),
                async: script.async,
                defer: script.defer
            }));
        });

        // 2. Requests de red (simplificado)
        evidence.requests[moment] = await this.page.evaluate(() => {
            return window.performance.getEntriesByType('resource').map(entry => ({
                name: entry.name,
                initiatorType: entry.initiatorType,
                transferSize: entry.transferSize
            }));
        });

        // 3. Storage
        evidence.storage[moment] = await this.page.evaluate(() => {
            const storage = {};
            
            // localStorage
            storage.localStorage = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                storage.localStorage[key] = localStorage.getItem(key);
            }
            
            // sessionStorage
            storage.sessionStorage = {};
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                storage.sessionStorage[key] = sessionStorage.getItem(key);
            }
            
            return storage;
        });

        // 4. Tracking pixels (imágenes 1x1)
        evidence.pixels[moment] = await this.page.evaluate(() => {
            return Array.from(document.images)
                .filter(img => (img.width <= 1 && img.height <= 1) || img.src.includes('track'))
                .map(img => ({
                    src: img.src,
                    width: img.width,
                    height: img.height
                }));
        });

        console.log(`📊 Evidencia ${moment}: ${evidence.scripts[moment].length} scripts, ${evidence.requests[moment].length} requests`);
    }

    // Toma screenshot y guarda archivo
    async takeScreenshot(domain, state, moment) {
        const filename = `${domain.replace(/[^a-zA-Z0-9]/g, '_')}_${state}_${moment}_${Date.now()}.png`;
        const filepath = path.join(__dirname, '../../public/screenshots', filename);
        
        await this.page.screenshot({ 
            path: filepath,
            fullPage: true 
        });

        console.log(`📸 Screenshot: ${filename}`);
        return filename;
    }

    // Cierra el navegador
    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔴 Navegador cerrado');
        }
    }
}

module.exports = SpectralCrawler;