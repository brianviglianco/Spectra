// src/crawler/cmps/cookiebotDetector.js
// Versión que funcionaba con DR.dk (49→73/68 scripts)

class CookiebotDetector {
    constructor(page) {
        this.page = page;
        this.name = 'Cookiebot';
    }

    async detect() {
        console.log('🔍 Detectando Cookiebot...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const apiCheck = await this.page.evaluate(() => {
            return !!(window.Cookiebot || window.CookieConsent || 
                     document.querySelector('#CybotCookiebotDialog') ||
                     document.querySelector('script[src*="cookiebot"]'));
        });

        if (apiCheck) {
            console.log('✅ Cookiebot detectado: API/script');
            return {
                detected: true,
                provider: this.name,
                foundSelector: 'api',
                type: 'api'
            };
        }

        console.log('❌ Cookiebot no detectado');
        return { detected: false };
    }

    async rejectAll() {
        console.log('🚫 Rechazando cookies Cookiebot...');
        
        try {
            const apiResult = await this.page.evaluate(() => {
                if (window.Cookiebot) {
                    if (typeof window.Cookiebot.decline === 'function') {
                        window.Cookiebot.decline();
                        return 'decline';
                    }
                    
                    if (typeof window.Cookiebot.setUserStatus === 'function') {
                        window.Cookiebot.setUserStatus({
                            purposes: {
                                enabled: [],
                                disabled: ['cookies', 'analytics', 'marketing', 'social_media']
                            }
                        });
                        return 'setUserStatus';
                    }
                    
                    if (window.Cookiebot.consent) {
                        window.Cookiebot.consent.marketing = false;
                        window.Cookiebot.consent.statistics = false;
                        window.Cookiebot.consent.preferences = false;
                        window.Cookiebot.consent.necessary = true;
                        
                        if (typeof window.Cookiebot.submitConsent === 'function') {
                            window.Cookiebot.submitConsent();
                            return 'manual_consent';
                        }
                    }
                }
                return false;
            });

            if (apiResult) {
                console.log(`✅ Cookiebot rechazado vía API: ${apiResult}`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return true;
            }

            return await this.rejectViaDom();

        } catch (error) {
            console.log('❌ Error rechazando Cookiebot:', error.message);
            return false;
        }
    }

    async rejectViaDom() {
        console.log('🔧 Cookiebot DOM rejection...');
        
        const bannerSelectors = [
            '#CybotCookiebotDialog',
            '.CybotCookiebotDialog',
            '[id*="CybotCookiebot"]'
        ];

        let bannerFound = false;
        for (const selector of bannerSelectors) {
            const banner = await this.page.$(selector);
            if (banner) {
                bannerFound = true;
                break;
            }
        }

        if (!bannerFound) {
            console.log('❌ Banner Cookiebot no encontrado');
            return false;
        }

        const rejectSelectors = [
            '#CybotCookiebotDialogBodyButtonDecline',
            '#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll',
            '.cookiebot-decline-all',
            '[data-action="dismiss"]',
            'button[id*="disagree" i]',
            'button[id*="decline" i]',
            'button[id*="reject" i]',
            'button[id*="afvis" i]', // Danés
            'button[id*="ablehnen" i]', // Alemán
            'button[id*="refuser" i]', // Francés
            'button[id*="rifiuta" i]' // Italiano
        ];

        for (const selector of rejectSelectors) {
            try {
                const button = await this.page.$(selector);
                if (button) {
                    const isVisible = await this.page.evaluate(el => {
                        const rect = el.getBoundingClientRect();
                        return rect.width > 0 && rect.height > 0;
                    }, button);

                    if (isVisible) {
                        await button.click();
                        const success = await this.validateDismissal();
                        if (success) {
                            console.log(`✅ Cookiebot reject: ${selector}`);
                            return true;
                        }
                    }
                }
            } catch (error) {
                continue;
            }
        }

        const textBasedReject = await this.page.evaluate(() => {
            const rejectTexts = [
                'disagree', 'decline', 'reject', 'afvis', 'ablehnen', 
                'refuser', 'rifiuta', 'rechazar', 'non accetto', 'não aceito'
            ];
            
            const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
            
            for (const button of buttons) {
                const text = button.textContent.toLowerCase().trim();
                if (rejectTexts.some(rejectText => text.includes(rejectText))) {
                    button.click();
                    return text;
                }
            }
            return false;
        });

        if (textBasedReject) {
            console.log(`✅ Cookiebot click por texto: ${textBasedReject}`);
            const success = await this.validateDismissal();
            return success;
        }

        return false;
    }

    async acceptAll() {
        console.log('✅ Aceptando cookies Cookiebot...');
        
        try {
            const apiResult = await this.page.evaluate(() => {
                if (window.Cookiebot) {
                    if (typeof window.Cookiebot.setUserAgreeToAll === 'function') {
                        window.Cookiebot.setUserAgreeToAll();
                        return 'setUserAgreeToAll';
                    }
                    
                    if (typeof window.Cookiebot.setUserStatus === 'function') {
                        window.Cookiebot.setUserStatus({
                            purposes: {
                                enabled: ['cookies', 'analytics', 'marketing', 'social_media'],
                                disabled: []
                            }
                        });
                        return 'setUserStatus_accept';
                    }
                    
                    if (window.Cookiebot.consent) {
                        window.Cookiebot.consent.marketing = true;
                        window.Cookiebot.consent.statistics = true;
                        window.Cookiebot.consent.preferences = true;
                        window.Cookiebot.consent.necessary = true;
                        
                        if (typeof window.Cookiebot.submitConsent === 'function') {
                            window.Cookiebot.submitConsent();
                            return 'consent_api';
                        }
                    }
                }
                return false;
            });

            if (apiResult) {
                console.log(`✅ Cookiebot aceptado vía API: ${apiResult}`);
                return true;
            }

            const acceptSelectors = [
                '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
                '#CybotCookiebotDialogBodyButtonAccept',
                '.didomi-continue-without-agreeing',
                'button[id*="agree" i]',
                'button[id*="accept" i]',
                'button[id*="accepter" i]', // Francés
                'button[id*="akzeptieren" i]' // Alemán
            ];

            for (const selector of acceptSelectors) {
                const button = await this.page.$(selector);
                if (button) {
                    await button.click();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    const success = await this.validateDismissal();
                    if (success) {
                        console.log(`✅ Cookiebot accept: ${selector}`);
                        return true;
                    }
                }
            }

            const apiResultFallback = await this.page.evaluate(() => {
                if (window.Cookiebot && window.Cookiebot.consent) {
                    window.Cookiebot.consent.marketing = true;
                    window.Cookiebot.consent.statistics = true;
                    window.Cookiebot.consent.preferences = true;
                    window.Cookiebot.consent.necessary = true;
                    
                    if (window.Cookiebot.submitConsent) {
                        window.Cookiebot.submitConsent();
                        return true;
                    }
                }
                return false;
            });

            if (apiResultFallback) {
                console.log('✅ Cookiebot aceptado vía API fallback');
                return true;
            }
            
            console.log('❌ Botón accept Cookiebot no encontrado');
            return false;

        } catch (error) {
            console.log('❌ Error aceptando Cookiebot:', error.message);
            return false;
        }
    }

    async validateDismissal() {
        try {
            const dismissed = await this.page.waitForFunction(
                () => {
                    const dialogs = document.querySelectorAll('#CybotCookiebotDialog, .CybotCookiebotDialog, [id*="CybotCookiebot"]');
                    return Array.from(dialogs).every(dialog => 
                        !dialog || 
                        dialog.style.display === 'none' || 
                        dialog.style.visibility === 'hidden' ||
                        !dialog.offsetParent
                    );
                },
                { timeout: 10000 }
            );
            return !!dismissed;
        } catch (error) {
            return false;
        }
    }
}

module.exports = CookiebotDetector;