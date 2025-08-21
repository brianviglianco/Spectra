// src/crawler/cmps/oneTrustDetector.js
// Detector específico para OneTrust - el CMP más usado globalmente

class OneTrustDetector {
    constructor(page) {
        this.page = page;
        this.name = 'OneTrust';
    }

    // Detecta si OneTrust está presente en la página
    async detect() {
        console.log('🔍 Detectando OneTrust...');
        
        // Esperar a que cargue la página
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const selectors = {
            // Banner principal
            banner: [
                '#onetrust-banner-sdk',
                '#onetrust-consent-sdk', 
                '.onetrust-pc-dark',
                '.ot-sdk-container'
            ],
            // Botones de acción
            acceptBtn: [
                '#onetrust-accept-btn-handler',
                '.onetrust-close-btn-handler',
                '.accept-cookies-btn'
            ],
            rejectBtn: [
                '#onetrust-reject-all-handler',
                '.onetrust-reject-all',
                '.ot-pc-refuse-all-handler'
            ],
            settingsBtn: [
                '#onetrust-pc-btn-handler',
                '.onetrust-pc-dark-filter',
                '.ot-sdk-show-settings'
            ]
        };

        // Buscar cualquier elemento OneTrust
        for (const [type, selectorList] of Object.entries(selectors)) {
            for (const selector of selectorList) {
                const element = await this.page.$(selector);
                if (element) {
                    console.log(`✅ OneTrust detectado: ${selector}`);
                    return {
                        detected: true,
                        provider: this.name,
                        selectors,
                        foundSelector: selector,
                        type
                    };
                }
            }
        }

        // Buscar scripts OneTrust
        const scriptCheck = await this.page.evaluate(() => {
            const scripts = Array.from(document.scripts);
            return scripts.some(script => 
                script.src.includes('onetrust') || 
                script.innerHTML.includes('OneTrust') ||
                script.innerHTML.includes('OptanonWrapper')
            );
        });

        if (scriptCheck) {
            console.log('✅ OneTrust detectado: script');
            return {
                detected: true,
                provider: this.name,
                selectors,
                foundSelector: 'script',
                type: 'script'
            };
        }

        console.log('❌ OneTrust no detectado');
        return { detected: false };
    }

    // Rechaza todas las cookies con validación robusta
    async rejectAll() {
        console.log('🚫 Rechazando cookies OneTrust...');
        
        try {
            // Verificar que el banner existe antes de interactuar
            const bannerExists = await this.page.waitForSelector('#onetrust-banner-sdk, #onetrust-consent-sdk', { timeout: 5000 });
            if (!bannerExists) {
                console.log('❌ Banner OneTrust no encontrado');
                return false;
            }

            // Paso 1: Buscar botón de rechazo directo
            const directReject = await this.page.$('#onetrust-reject-all-handler');
            if (directReject) {
                // Verificar que el botón es visible y clickeable
                const isVisible = await this.page.evaluate(el => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                }, directReject);

                if (isVisible) {
                    await directReject.click();
                    
                    // VALIDACIÓN: Esperar que el banner desaparezca
                    const bannerGone = await this.page.waitForFunction(
                        () => {
                            const banner = document.querySelector('#onetrust-banner-sdk, #onetrust-consent-sdk');
                            return !banner || banner.style.display === 'none' || banner.style.visibility === 'hidden';
                        },
                        { timeout: 10000 }
                    );

                    if (bannerGone) {
                        console.log('✅ Rechazo directo OneTrust - Banner desapareció');
                        return true;
                    } else {
                        console.log('⚠️ Banner OneTrust sigue visible después del click');
                    }
                }
            }

            // Paso 2: Método alternativo - configuración manual
            const settingsBtn = await this.page.$('#onetrust-pc-btn-handler');
            if (settingsBtn) {
                await settingsBtn.click();
                
                // Esperar modal de configuración
                await this.page.waitForSelector('#onetrust-pc-sdk', { timeout: 5000 });

                // Desactivar todos los toggles opcionales
                const toggles = await this.page.$$('.ot-switch input:not([disabled])');
                console.log(`🔧 Desactivando ${toggles.length} toggles`);
                
                for (const toggle of toggles) {
                    const isChecked = await toggle.isChecked();
                    if (isChecked) {
                        await toggle.click();
                        await new Promise(resolve => setTimeout(resolve, 300));
                    }
                }

                // Confirmar cambios
                const saveBtn = await this.page.$('.save-preference-btn-handler, #onetrust-pc-save-btn-handler');
                if (saveBtn) {
                    await saveBtn.click();
                    
                    // VALIDACIÓN: Modal debe cerrarse
                    const modalClosed = await this.page.waitForFunction(
                        () => {
                            const modal = document.querySelector('#onetrust-pc-sdk');
                            return !modal || modal.style.display === 'none';
                        },
                        { timeout: 10000 }
                    );

                    if (modalClosed) {
                        console.log('✅ Configuración OneTrust guardada - Modal cerrado');
                        return true;
                    }
                }
            }

            console.log('❌ No se pudo rechazar OneTrust');
            return false;
        } catch (error) {
            console.log('❌ Error rechazando OneTrust:', error.message);
            return false;
        }
    }

    // Acepta todas las cookies con validación
    async acceptAll() {
        console.log('✅ Aceptando cookies OneTrust...');
        
        try {
            // Verificar banner existe
            const bannerExists = await this.page.waitForSelector('#onetrust-banner-sdk, #onetrust-consent-sdk', { timeout: 5000 });
            if (!bannerExists) {
                console.log('❌ Banner OneTrust no encontrado');
                return false;
            }

            const acceptBtn = await this.page.$('#onetrust-accept-btn-handler');
            if (acceptBtn) {
                // Verificar visibilidad
                const isVisible = await this.page.evaluate(el => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                }, acceptBtn);

                if (isVisible) {
                    await acceptBtn.click();
                    
                    // VALIDACIÓN: Banner debe desaparecer
                    const bannerGone = await this.page.waitForFunction(
                        () => {
                            const banner = document.querySelector('#onetrust-banner-sdk, #onetrust-consent-sdk');
                            return !banner || banner.style.display === 'none' || banner.style.visibility === 'hidden';
                        },
                        { timeout: 10000 }
                    );

                    if (bannerGone) {
                        console.log('✅ Cookies OneTrust aceptadas - Banner desapareció');
                        return true;
                    } else {
                        console.log('⚠️ Banner OneTrust sigue visible después del accept');
                        return false;
                    }
                }
            }
            
            console.log('❌ Botón accept OneTrust no encontrado');
            return false;
        } catch (error) {
            console.log('❌ Error aceptando OneTrust:', error.message);
            return false;
        }
    }
}

module.exports = OneTrustDetector;