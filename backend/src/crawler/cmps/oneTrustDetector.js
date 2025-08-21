// src/crawler/cmps/oneTrustDetector.js
// OneTrust híbrido: API + DOM clicks + validación real

class OneTrustDetector {
    constructor(page) {
        this.page = page;
        this.name = 'OneTrust';
    }

    async detect() {
        console.log('🔍 Detectando OneTrust...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const apiCheck = await this.page.evaluate(() => {
            return !!(window.OneTrust || window.OptanonWrapper || 
                     document.querySelector('#onetrust-banner-sdk') ||
                     document.querySelector('script[src*="onetrust"]'));
        });

        if (apiCheck) {
            console.log('✅ OneTrust detectado: API/script');
            return {
                detected: true,
                provider: this.name,
                foundSelector: 'api',
                type: 'api'
            };
        }

        console.log('❌ OneTrust no detectado');
        return { detected: false };
    }

    async rejectAll() {
        console.log('🚫 Rechazando cookies OneTrust (híbrido)...');
        
        try {
            // MÉTODO 1: API JavaScript
            console.log('🔧 Intentando API...');
            const apiSuccess = await this.tryAPIReject();
            if (apiSuccess) {
                const isEffective = await this.validateEffectiveness('reject');
                if (isEffective) {
                    console.log('✅ API reject efectivo');
                    return true;
                } else {
                    console.log('⚠️ API reject no efectivo, probando DOM...');
                }
            }

            // MÉTODO 2: DOM clicks
            console.log('🔧 Intentando DOM clicks...');
            const domSuccess = await this.tryDOMReject();
            if (domSuccess) {
                const isEffective = await this.validateEffectiveness('reject');
                if (isEffective) {
                    console.log('✅ DOM reject efectivo');
                    return true;
                }
            }

            console.log('❌ Todos los métodos fallaron');
            return false;

        } catch (error) {
            console.log('❌ Error rechazando OneTrust:', error.message);
            return false;
        }
    }

    async tryAPIReject() {
        return await this.page.evaluate(() => {
            if (window.OneTrust) {
                if (typeof window.OneTrust.setConsent === 'function') {
                    window.OneTrust.setConsent([1]); // Solo necessary
                    return 'setConsent';
                }
                
                if (typeof window.OneTrust.UpdateConsent === 'function') {
                    window.OneTrust.UpdateConsent({
                        'C0001': true,  // Necessary
                        'C0002': false, // Performance
                        'C0003': false, // Functional
                        'C0004': false  // Targeting
                    });
                    return 'UpdateConsent';
                }
            }
            return false;
        });
    }

    async tryDOMReject() {
        // Verificar banner visible
        const bannerExists = await this.page.$('#onetrust-banner-sdk, #onetrust-consent-sdk');
        if (!bannerExists) {
            console.log('❌ Banner OneTrust no visible');
            return false;
        }

        // Paso 1: Reject directo
        const directReject = await this.page.$('#onetrust-reject-all-handler');
        if (directReject) {
            const isVisible = await this.page.evaluate(el => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            }, directReject);

            if (isVisible) {
                await directReject.click();
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const bannerGone = await this.validateDismissal();
                if (bannerGone) {
                    console.log('✅ Reject directo exitoso');
                    return true;
                }
            }
        }

        // Paso 2: Settings + toggles
        console.log('🔧 Abriendo settings...');
        const settingsBtn = await this.page.$('#onetrust-pc-btn-handler');
        if (settingsBtn) {
            await settingsBtn.click();
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Esperar modal
            await this.page.waitForSelector('#onetrust-pc-sdk', { timeout: 5000 });

            // Desactivar ALL toggles
            const toggles = await this.page.$$('.ot-switch input:not([disabled])');
            console.log(`🔧 Encontrados ${toggles.length} toggles`);
            
            for (const toggle of toggles) {
                try {
                    const isChecked = await toggle.evaluate(el => el.checked);
                    if (isChecked) {
                        await toggle.click();
                        await new Promise(resolve => setTimeout(resolve, 500));
                        console.log('🔘 Toggle desactivado');
                    }
                } catch (error) {
                    console.log('⚠️ Error en toggle:', error.message);
                }
            }

            // Confirmar cambios
            const saveBtn = await this.page.$('.save-preference-btn-handler, #onetrust-pc-save-btn-handler');
            if (saveBtn) {
                await saveBtn.click();
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const modalClosed = await this.validateDismissal();
                if (modalClosed) {
                    console.log('✅ Settings reject exitoso');
                    return true;
                }
            }
        }

        return false;
    }

    async acceptAll() {
        console.log('✅ Aceptando cookies OneTrust (híbrido)...');
        
        try {
            // API first
            console.log('🔧 Intentando API accept...');
            const apiSuccess = await this.tryAPIAccept();
            if (apiSuccess) {
                const isEffective = await this.validateEffectiveness('accept');
                if (isEffective) {
                    console.log('✅ API accept efectivo');
                    return true;
                }
            }

            // DOM fallback
            console.log('🔧 Intentando DOM accept...');
            const acceptBtn = await this.page.$('#onetrust-accept-btn-handler');
            if (acceptBtn) {
                await acceptBtn.click();
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const success = await this.validateDismissal();
                if (success) {
                    const isEffective = await this.validateEffectiveness('accept');
                    if (isEffective) {
                        console.log('✅ DOM accept efectivo');
                        return true;
                    }
                }
            }

            return false;

        } catch (error) {
            console.log('❌ Error aceptando OneTrust:', error.message);
            return false;
        }
    }

    async tryAPIAccept() {
        return await this.page.evaluate(() => {
            if (window.OneTrust) {
                if (typeof window.OneTrust.setConsent === 'function') {
                    window.OneTrust.setConsent([1,2,3,4]); // All categories
                    return 'setConsent_all';
                }
                
                if (typeof window.OneTrust.UpdateConsent === 'function') {
                    window.OneTrust.UpdateConsent({
                        'C0001': true, // Necessary
                        'C0002': true, // Performance  
                        'C0003': true, // Functional
                        'C0004': true  // Targeting
                    });
                    return 'UpdateConsent_all';
                }
            }
            return false;
        });
    }

    async validateDismissal() {
        try {
            const dismissed = await this.page.waitForFunction(
                () => {
                    const banner = document.querySelector('#onetrust-banner-sdk, #onetrust-consent-sdk');
                    const modal = document.querySelector('#onetrust-pc-sdk');
                    return (!banner || banner.style.display === 'none' || !banner.offsetParent) &&
                           (!modal || modal.style.display === 'none' || !modal.offsetParent);
                },
                { timeout: 8000 }
            );
            return !!dismissed;
        } catch (error) {
            return false;
        }
    }

    async validateEffectiveness(action) {
        console.log(`🔍 Validando efectividad de ${action}...`);
        
        // Esperar que la página reaccione
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Contar scripts después de acción
        const scriptCount = await this.page.evaluate(() => {
            return document.scripts.length;
        });
        
        // Contar requests activos
        const requestCount = await this.page.evaluate(() => {
            return window.performance.getEntriesByType('resource').length;
        });
        
        console.log(`📊 Post-${action}: ${scriptCount} scripts, ${requestCount} requests`);
        
        // Para accept: debe haber MÁS actividad
        // Para reject: debe haber MENOS actividad
        if (action === 'accept') {
            return scriptCount > 40; // Más scripts = más tracking
        } else {
            return scriptCount < 50; // Menos scripts = menos tracking
        }
    }
}

module.exports = OneTrustDetector;