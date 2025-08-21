// src/crawler/cmps/cmpDetector.js
// Coordinador principal de detección de CMPs - ACTUALIZADO con Cookiebot

const OneTrustDetector = require('./oneTrustDetector');
const CookiebotDetector = require('./cookiebotDetector');

class CMPDetector {
    constructor(page) {
        this.page = page;
        this.detectedCMPs = [];
        this.detectors = [
            new OneTrustDetector(page),
            new CookiebotDetector(page)
            // Más detectores se agregan aquí
        ];
    }

    // Detecta todos los CMPs en la página
    async detectAll() {
        console.log('🔍 Iniciando detección de CMPs...');
        
        // Esperar carga completa
        await new Promise(resolve => setTimeout(resolve, 3000));

        for (const detector of this.detectors) {
            try {
                const result = await detector.detect();
                if (result.detected) {
                    this.detectedCMPs.push(result);
                    console.log(`✅ Detectado: ${result.provider}`);
                }
            } catch (error) {
                console.log(`❌ Error detectando ${detector.name}:`, error.message);
            }
        }

        console.log(`🎯 CMPs detectados: ${this.detectedCMPs.length}`);
        return this.detectedCMPs;
    }

    // Rechaza cookies en todos los CMPs detectados
    async rejectAllCookies() {
        console.log('🚫 Rechazando cookies en todos los CMPs...');
        
        for (const cmpResult of this.detectedCMPs) {
            const detector = this.detectors.find(d => d.name === cmpResult.provider);
            if (detector && detector.rejectAll) {
                await detector.rejectAll();
            }
        }
    }

    // Acepta cookies en todos los CMPs detectados
    async acceptAllCookies() {
        console.log('✅ Aceptando cookies en todos los CMPs...');
        
        for (const cmpResult of this.detectedCMPs) {
            const detector = this.detectors.find(d => d.name === cmpResult.provider);
            if (detector && detector.acceptAll) {
                await detector.acceptAll();
            }
        }
    }

    // Obtiene resumen de CMPs detectados
    getDetectedCMPs() {
        return this.detectedCMPs.map(cmp => ({
            provider: cmp.provider,
            foundSelector: cmp.foundSelector,
            type: cmp.type
        }));
    }
}

module.exports = CMPDetector;