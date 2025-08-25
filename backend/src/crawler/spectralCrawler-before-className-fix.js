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

    // ✅ UNIVERSAL MULTI-LANGUAGE DETECTION SYSTEM - ENTERPRISE ENHANCED
    async detectLanguageAndGetButtons(page) {
        return await page.evaluate(() => {
            // 1. GET PAGE CONTENT FOR LANGUAGE DETECTION
            const pageText = document.body.textContent || '';
            const htmlLang = document.documentElement.lang || '';
            const metaLang = document.querySelector('meta[name="language"]')?.content || '';
            
            // 2. COMPREHENSIVE LANGUAGE DETECTION PATTERNS
            const languageHints = {
                'de': [
                    // Cookie/Privacy terms
                    'datenschutz', 'cookie', 'einstellungen', 'verwalten', 'zustimmung',
                    'datenschutzerklärung', 'nutzungsbedingungen', 'impressum',
                    // Action words  
                    'annehmen', 'ablehnen', 'akzeptieren', 'zurückweisen', 'verweigern',
                    'alle akzeptieren', 'alle ablehnen', 'nur erforderliche',
                    // German specific words
                    'über uns', 'kontakt', 'unternehmen', 'produkte', 'lösungen'
                ],
                'es': [
                    // Cookie/Privacy terms
                    'privacidad', 'cookies', 'configuración', 'gestionar', 'consentimiento',
                    'política de privacidad', 'términos de uso', 'aviso legal',
                    // Action words
                    'aceptar', 'rechazar', 'declinar', 'permitir', 'denegar', 
                    'aceptar todo', 'rechazar todo', 'solo necesarias',
                    // Spanish specific words
                    'nosotros', 'contacto', 'empresa', 'productos', 'soluciones'
                ],
                'fr': [
                    // Cookie/Privacy terms
                    'confidentialité', 'cookies', 'paramètres', 'gérer', 'consentement',
                    'politique de confidentialité', 'conditions d\'utilisation', 'mentions légales',
                    // Action words
                    'accepter', 'refuser', 'rejeter', 'autoriser', 'interdire',
                    'tout accepter', 'tout refuser', 'seulement nécessaires',
                    // French specific words
                    'à propos', 'contact', 'entreprise', 'produits', 'solutions'
                ],
                'it': [
                    // Cookie/Privacy terms  
                    'privacy', 'cookie', 'impostazioni', 'gestisci', 'consenso',
                    'informativa privacy', 'termini di utilizzo', 'note legali',
                    // Action words
                    'accetta', 'rifiuta', 'declina', 'consenti', 'nega',
                    'accetta tutto', 'rifiuta tutto', 'solo necessari',
                    // Italian specific words
                    'chi siamo', 'contatti', 'azienda', 'prodotti', 'soluzioni'
                ],
                'nl': [
                    // Cookie/Privacy terms
                    'privacy', 'cookies', 'instellingen', 'beheren', 'toestemming',
                    'privacybeleid', 'gebruiksvoorwaarden', 'juridische informatie',
                    // Action words  
                    'accepteren', 'weigeren', 'afwijzen', 'toestaan', 'blokkeren',
                    'alles accepteren', 'alles weigeren', 'alleen noodzakelijke',
                    // Dutch specific words
                    'over ons', 'contact', 'bedrijf', 'producten', 'oplossingen'
                ],
                'da': [
                    // Cookie/Privacy terms
                    'privatliv', 'cookies', 'indstillinger', 'administrer', 'samtykke',
                    'privatlivspolitik', 'brugsvilkår', 'juridiske oplysninger',
                    // Action words
                    'accepter', 'afvis', 'tillade', 'blokere', 'nægte',
                    'tillad alle', 'afvis alle', 'kun nødvendige',
                    // Danish specific words
                    'om os', 'kontakt', 'virksomhed', 'produkter', 'løsninger'
                ],
                'sv': [
                    // Cookie/Privacy terms - ENHANCED
                    'integritet', 'cookies', 'inställningar', 'hantera', 'samtycke',
                    'integritetspolicy', 'användarvillkor', 'juridisk information',
                    // Action words - ENHANCED  
                    'acceptera', 'avvisa', 'tillåt', 'blockera', 'neka',
                    'acceptera alla', 'avvisa alla', 'endast nödvändiga',
                    // Swedish specific words - ENHANCED
                    'om oss', 'kontakt', 'företag', 'produkter', 'lösningar',
                    // ADDED: Microsoft-specific Swedish terms
                    'godkänn', 'godkann', 'hantera cookies', 'valfria cookies'
                ],
                'en': [
                    // Cookie/Privacy terms
                    'privacy', 'cookie', 'settings', 'manage', 'consent',
                    'privacy policy', 'terms of use', 'legal notice',
                    // Action words
                    'accept', 'reject', 'decline', 'allow', 'deny',
                    'accept all', 'reject all', 'only necessary', 'essential only',
                    // English specific words
                    'about', 'contact', 'company', 'products', 'solutions'
                ]
            };
            
            // 3. MULTI-LAYER LANGUAGE DETECTION
            let detectedLanguage = 'en'; // default fallback
            let maxScore = 0;
            const lowerText = pageText.toLowerCase();
            
            // Layer 1: HTML lang attribute (highest priority)
            if (htmlLang && languageHints[htmlLang.toLowerCase().substring(0, 2)]) {
                detectedLanguage = htmlLang.toLowerCase().substring(0, 2);
                console.log(`🌍 Language detected from HTML lang: ${detectedLanguage}`);
            } 
            // Layer 2: Meta language tag
            else if (metaLang && languageHints[metaLang.toLowerCase().substring(0, 2)]) {
                detectedLanguage = metaLang.toLowerCase().substring(0, 2);
                console.log(`🌍 Language detected from meta tag: ${detectedLanguage}`);
            }
            // Layer 3: Content analysis with scoring
            else {
                for (let [lang, hints] of Object.entries(languageHints)) {
                    let score = 0;
                    let matches = [];
                    
                    for (let hint of hints) {
                        if (lowerText.includes(hint.toLowerCase())) {
                            // Weight scoring: privacy terms = 3, action words = 2, generic = 1
                            let weight = 1;
                            if (hint.includes('privacy') || hint.includes('datenschutz') || hint.includes('cookie')) weight = 3;
                            else if (['accept', 'reject', 'annehmen', 'ablehnen', 'aceptar', 'rechazar'].includes(hint)) weight = 2;
                            
                            score += weight;
                            matches.push(hint);
                        }
                    }
                    
                    if (score > maxScore) {
                        maxScore = score;
                        detectedLanguage = lang;
                        console.log(`🌍 Language detected from content: ${lang} (score: ${score}, matches: ${matches.slice(0, 3).join(', ')})`);
                    }
                }
            }
            
            // 4. UNIVERSAL BUTTON PATTERNS BY LANGUAGE - ENTERPRISE ENHANCED
            const buttonPatterns = {
                'de': {
                    accept: [
                        'annehmen', 'akzeptieren', 'zustimmen', 'einverstanden',
                        'alle akzeptieren', 'alle cookies akzeptieren', 'alle zulassen',
                        'zustimmen und weiter'
                    ],
                    reject: [
                        'ablehnen', 'zurückweisen', 'verweigern', 'nicht einverstanden',
                        'alle ablehnen', 'alle cookies ablehnen', 'cookies ablehnen', 'verweigern',
                        'nur erforderliche', 'nur notwendige', 'minimal'
                    ],
                    settings: [
                        'einstellungen', 'verwalten', 'cookies verwalten', 'anpassen',
                        'mehr optionen', 'erweiterte einstellungen', 'details'
                    ]
                },
                'es': {
                    accept: [
                        'aceptar', 'acepto', 'de acuerdo', 'permitir',
                        'aceptar todo', 'aceptar todas', 'permitir todo',
                        'continuar', 'entendido', 'vale'
                    ],
                    reject: [
                        'rechazar', 'rechazo', 'declinar', 'no acepto',
                        'rechazar todo', 'rechazar todas', 'denegar',
                        'solo necesarias', 'solo esenciales', 'mínimo'
                    ],
                    settings: [
                        'configuración', 'gestionar', 'gestionar cookies', 'personalizar',
                        'más opciones', 'configuración avanzada', 'detalles'
                    ]
                },
                'fr': {
                    accept: [
                        'accepter', 'j\'accepte', 'd\'accord', 'autoriser',
                        'tout accepter', 'accepter tous', 'autoriser tout',
                        'continuer', 'compris', 'd\'accord'
                    ],
                    reject: [
                        'refuser', 'je refuse', 'décliner', 'rejeter',
                        'tout refuser', 'refuser tous', 'rejeter tout',
                        'seulement nécessaires', 'seulement essentiels', 'minimal'
                    ],
                    settings: [
                        'paramètres', 'gérer', 'gérer les cookies', 'personnaliser',
                        'plus d\'options', 'paramètres avancés', 'détails'
                    ]
                },
                'it': {
                    accept: [
                        'accetta', 'accetto', 'd\'accordo', 'consenti',
                        'accetta tutto', 'accetta tutti', 'consenti tutto',
                        'continua', 'capito', 'va bene'
                    ],
                    reject: [
                        'rifiuta', 'rifiuto', 'declina', 'nego',
                        'rifiuta tutto', 'rifiuta tutti', 'nega tutto',
                        'solo necessari', 'solo essenziali', 'minimale'
                    ],
                    settings: [
                        'impostazioni', 'gestisci', 'gestisci cookie', 'personalizza',
                        'più opzioni', 'impostazioni avanzate', 'dettagli'
                    ]
                },
                'nl': {
                    accept: [
                        'accepteren', 'accepteer', 'akkoord', 'toestaan',
                        'alles accepteren', 'alle accepteren', 'alles toestaan',
                        'doorgaan', 'begrepen', 'oké'
                    ],
                    reject: [
                        'weigeren', 'weiger', 'afwijzen', 'blokkeren',
                        'alles weigeren', 'alle weigeren', 'alles blokkeren',
                        'alleen noodzakelijke', 'alleen essentiële', 'minimaal'
                    ],
                    settings: [
                        'instellingen', 'beheren', 'cookies beheren', 'aanpassen',
                        'meer opties', 'geavanceerde instellingen', 'details'
                    ]
                },
                'da': {
                    accept: [
                        'accepter', 'acceptér', 'enig', 'tillad',
                        'tillad alle', 'accepter alle', 'tillad alt',
                        'fortsæt', 'forstået', 'okay'
                    ],
                    reject: [
                        'afvis', 'afvisning', 'nægt', 'blokér',
                        'afvis alle', 'nægt alle', 'blokér alt',
                        'kun nødvendige', 'kun væsentlige', 'minimal'
                    ],
                    settings: [
                        'indstillinger', 'administrer', 'administrer cookies', 'tilpas',
                        'flere muligheder', 'avancerede indstillinger', 'detaljer'
                    ]
                },
                'sv': {
                    accept: [
                        'acceptera', 'accepterar', 'godkänn', 'godkann', 'tillåt',
                        'acceptera alla', 'godkänn alla', 'tillåt alla',
                        'fortsätt', 'förstått', 'okej'
                    ],
                    reject: [
                        'avvisa', 'avvisar', 'neka', 'blockera', 'avböj',
                        'avvisa alla', 'neka alla', 'blockera alla',
                        'endast nödvändiga', 'endast väsentliga', 'minimal',
                        // ✅ SWEDISH FIX: Added specific Microsoft Swedish patterns
                        'neka cookies', 'avvisa cookies', 'blockera cookies'
                    ],
                    settings: [
                        'inställningar', 'hantera', 'hantera cookies', 'anpassa',
                        'fler alternativ', 'avancerade inställningar', 'detaljer'
                    ]
                },
                'en': {
                    accept: [
                        'accept', 'accept all', 'allow all', 'agree to all',
                        'continue'
                    ],
                    reject: [
                        'reject', 'decline', 'deny', 'disagree',
                        'reject all', 'decline all', 'deny all',
                        'only necessary', 'only essential', 'minimal', 'necessary only'
                    ],
                    settings: [
                        'settings', 'manage', 'manage cookies', 'customize',
                        'more options', 'advanced settings', 'details', 'preferences'
                    ]
                }
            };
            
            const patterns = buttonPatterns[detectedLanguage] || buttonPatterns['en'];
            
            return {
                detectedLanguage,
                patterns,
                pageHints: {
                    htmlLang,
                    metaLang,
                    contentScore: maxScore
                }
            };
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

            // ✅ ENTERPRISE ENHANCED: Complete tracking database + ALL DISCOVERED DOMAINS
            const scriptAnalysis = await this.page.evaluate(() => {
                const scripts = Array.from(document.scripts);
                
                // ✅ COMPLETE ENTERPRISE TRACKING DOMAINS DATABASE - FULLY UPDATED
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
                    'pingdom.com', 'gtm.start.dk', 'gemius.dk',
                    
                    // ✅ MICROSOFT ENTERPRISE TRACKING DOMAINS
                    'clarity.ms', 'www.clarity.ms', 'scripts.clarity.ms',        
                    'monitor.azure.com', 'js.monitor.azure.com',                
                    'applicationinsights.microsoft.com',                        
                    'dc.services.visualstudio.com',                            
                    'vortex.data.microsoft.com',                               
                    'browser.pipe.aria.microsoft.com',
                    
                    // ✅ BING ADS CONVERSION TRACKING
                    'bat.bing.com', 'bing.com/analytics', 'uet.bing.com',
                    
                    // ✅ CLICKTALE / CONTENTSQUARE
                    'clicktale.net', 'cdnssl.clicktale.net', 'contentsquare.com',
                    
                    // ✅ SALESFORCE ENTERPRISE TRACKING - NEWLY DISCOVERED
                    'evgnet.com', 'cdn.evgnet.com',                           // Evergage (Salesforce Personalization)
                    's.go-mpulse.net',                                        // Akamai mPulse - Real User Monitoring

                    // ✅ TEALIUM TAG MANAGEMENT SYSTEM - MAJOR DISCOVERY
                    'tags.tiqcdn.com', 'tiqcdn.com',                         // Tealium Universal Tag (utag.js)
                    
                    // ✅ ORACLE ELOQUA TRACKING - ENTERPRISE
                    'img.en25.com', 'en25.com',                              // Oracle Eloqua marketing automation
                    
                    // ✅ LIVEPERSON CHAT TRACKING
                    'lptag.liveperson.net',                                   // LivePerson chat analytics
                    
                    // ✅ WOOPIC ANALYTICS PLATFORM - FRENCH
                    'woopic.com', 'c.woopic.com', 'elcos.cdn.s.woopic.com', 'gp.cdn.woopic.com',
                    
                    // ✅ CONFIANT AD SECURITY TRACKING
                    'cdn.confiant-integrations.net',                         // Confiant ad verification
                    
                    // ✅ USERCENTRICS CMP TRACKING (Partial)
                    'app.usercentrics.eu'                                    // Usercentrics CMP scripts
                ];
                
                const necessaryDomains = [
                    // CMP scripts
                    'cookielaw.org', 'onetrust.com', 'cookiebot.com', 'cookieinformation.com',
                    'sourcepoint.mgr.consensu.org',
                    
                    // Core libraries
                    'jquery.com', 'jsdelivr.net', 'unpkg.com', 'cdnjs.cloudflare.com',
                    
                    // Security & Infrastructure
                    'recaptcha.net', 'hcaptcha.com', 'cloudflare.com', 'challenges.cloudflare.com',
                    'turnstile.cloudflare.com', 'cf-assets.com',
                    
                    // Payment processing
                    'stripe.com', 'paypal.com', 'checkout.com',
                    
                    // CDN and infrastructure
                    'amazonaws.com', 'fastly.com', 'akamai.net', 'maxcdn.com',
                    
                    // Essential functionality
                    'polyfill.io', 'bootstrapcdn.com', 'fontawesome.com', 'fonts.googleapis.com',
                    
                    // ✅ MICROSOFT NECESSARY DOMAINS
                    'wcpstatic.microsoft.com',                                  
                    'mem.gfx.ms',                                              
                    'c.msn.com',                                               
                    'assets.msn.com',                                          
                    'statics-marketingsites-wcus-ms-com.akamaized.net',
                    
                    // ✅ ADOBE HELIX RUM (Performance Monitoring - NECESSARY)
                    'rum.hlx.page', 'hlx.page', 'hlx3.page',
                    
                    // ✅ SALESFORCE NECESSARY DOMAINS - NEWLY DISCOVERED
                    'sfdcstatic.com', 'a.sfdcstatic.com',                     // Salesforce static assets CDN
                    
                    // ✅ SIEMENS ENTERPRISE DOMAINS  
                    'w3.siemens.com',                                          // Siemens web platform
                    'prod.ste.dc.siemens.com',                               // Siemens production services
                    'data.cdn.siemens.com',                                  // Siemens CDN services
                    
                    // ✅ ORANGE TELECOM INFRASTRUCTURE
                    'orangeads.fr', 'cdn.adgtw.orangeads.fr',               // Orange ad platform (internal)
                    
                    // ✅ PRIVACY CENTER SDK - CMP NECESSARY
                    'sdk.privacy-center.org',                                // Privacy center consent SDK
                    
                    // ✅ TEMPLATE ENGINES - UNIVERSAL NECESSARY  
                    'nunjucks'                                              // Nunjucks templating engine
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
        
        // ✅ UNIVERSAL MULTI-LANGUAGE BUTTON DETECTION - ENTERPRISE FIXED
        const languageInfo = await this.detectLanguageAndGetButtons(this.page);
        const { detectedLanguage, patterns } = languageInfo;
        const targetPatterns = patterns[action] || [];
        
        console.log(`🌍 Detected language: ${detectedLanguage.toUpperCase()}`);
        console.log(`🎯 Searching for ${action} patterns: ${targetPatterns.slice(0, 3).join(', ')}${targetPatterns.length > 3 ? '...' : ''}`);
        
        // ✅ PRIORITY 1: UNIVERSAL MULTI-LANGUAGE CMP DETECTION - CRITICAL FIXES APPLIED
        const universalFound = await this.page.evaluate((actionType, patterns) => {
            const elements = Array.from(document.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"]'));
            
            for (const element of elements) {
                const text = element.textContent?.trim() || '';
                const value = element.value || '';
                const ariaLabel = element.getAttribute('aria-label') || '';
                const title = element.getAttribute('title') || '';
                const combinedText = (text + ' ' + value + ' ' + ariaLabel + ' ' + title).toLowerCase();
                
                // Check against language-specific patterns with exact and partial matching
                for (const pattern of patterns) {
                    const patternLower = pattern.toLowerCase();
                    
                    // Exact match (highest priority)
                    if (text.toLowerCase() === patternLower || 
                        value.toLowerCase() === patternLower) {
                        
                        // Additional safety check: avoid clicking links or explanatory text
                        const isClickableButton = element.tagName === 'BUTTON' || 
                                                  element.getAttribute('role') === 'button' || 
                                                  element.type === 'button' || 
                                                  element.type === 'submit';
                        
                        if (isClickableButton || element.tagName === 'A') {
                            element.click();
                            return `Universal ${actionType}: "${text || value}" (exact match)`;
                        }
                    }
                    
                    // 🚨 CRITICAL FIX: Enhanced partial matching with negative filtering
                    if (combinedText.includes(patternLower) && 
                        combinedText.length < 200 &&  // Reasonable length limit
                        // ✅ ENTERPRISE CRITICAL FIXES - Reject negative patterns
                        !combinedText.includes('do not') &&           // English: "Do not accept"
                        !combinedText.includes('don\'t') &&           // English: "Don't accept"  
                        !combinedText.includes('sans') &&             // French: "sans accepter" = "without accepting"
                        !combinedText.includes('ohne') &&             // German: "ohne akzeptieren" = "without accepting"
                        !combinedText.includes('senza') &&            // Italian: "senza accettare" = "without accepting"
                        !combinedText.includes('sin') &&              // Spanish: "sin aceptar" = "without accepting"
                        !combinedText.includes('zonder') &&           // Dutch: "zonder accepteren" = "without accepting"
                        !combinedText.includes('continuer sans') &&   // French: "continuer sans accepter"
                        !combinedText.includes('weiter ohne') &&      // German: "weiter ohne akzeptieren"
                        !combinedText.includes('continue without') && // English: "continue without accepting"
                        // Existing safety filters
                        !combinedText.includes('drittanbieter') &&    // Avoid "third-party" links
                        !combinedText.includes('mehr informationen') && // Avoid "more info" links
                        !combinedText.includes('weitere informationen') && // Avoid "more info" links
                        !combinedText.includes('läs mer') &&          // Avoid Swedish "read more" links
                        !combinedText.includes('mer information')) {  // Avoid Swedish "more information" links
                        
                        // Only click actual buttons for partial matches
                        const isClickableButton = element.tagName === 'BUTTON' || 
                                                  element.getAttribute('role') === 'button' || 
                                                  element.type === 'button' || 
                                                  element.type === 'submit';
                        
                        if (isClickableButton) {
                            element.click();
                            return `Universal ${actionType}: "${text || value}" (partial match: ${pattern})`;
                        }
                    }
                }
            }
            return false;
        }, action, targetPatterns);

        if (universalFound) {
            console.log(`✅ Clicked universal ${action} button: ${universalFound} [${detectedLanguage}]`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return true;
        }

        // ✅ PRIORITY 2: OneTrust detection (with multi-language fallback)
        const oneTrustSelectors = {
            accept: [
                '#onetrust-accept-btn-handler',
                '#accept-recommended-btn-handler',
                '.onetrust-close-btn-handler'
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
                        console.log(`✅ Clicked OneTrust ${action} button: ${selector} [${detectedLanguage}]`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        return true;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Error with OneTrust selector ${selector}:`, error.message);
            }
        }

        // ✅ PRIORITY 3: Cookiebot detection (with multi-language fallback)
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
                        console.log(`✅ Clicked Cookiebot ${action} button: ${selector} [${detectedLanguage}]`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        return true;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Error with Cookiebot selector ${selector}:`, error.message);
            }
        }

        // ✅ PRIORITY 4: Usercentrics detection - ENHANCED & FIXED
        console.log(`🔍 Trying Usercentrics-specific detection for ${action}...`);
        
        // First try text-based detection with proper async handling
        try {
            const usercentricsTextResult = await this.page.evaluate(async (actionType) => {
                // Wait for potential dynamic content
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Enhanced element selection including shadow DOM
                let allElements = Array.from(document.querySelectorAll('button, a, [role="button"], div[onclick], [class*="button"], [data-testid]'));
                
                // Check for shadow DOM elements
                document.querySelectorAll('*').forEach(el => {
                    if (el.shadowRoot) {
                        const shadowButtons = Array.from(el.shadowRoot.querySelectorAll('button, a, [role="button"]'));
                        allElements = allElements.concat(shadowButtons);
                    }
                });
                
                const patterns = {
                    accept: ['alle cookies akzeptieren', 'alle akzeptieren', 'akzeptieren', 'zustimmen'],
                    reject: ['cookies ablehnen', 'alle ablehnen', 'ablehnen', 'zurückweisen'],
                    settings: ['einstellungen verwalten', 'einstellungen', 'cookie-einstellungen', 'verwalten']
                };
                
                const targetPatterns = patterns[actionType] || [];
                
                for (const element of allElements) {
                    const text = element.textContent?.toLowerCase().trim() || '';
                    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
                    const title = element.getAttribute('title')?.toLowerCase() || '';
                    const className = element.className?.toLowerCase() || '';
                    const combinedText = text + ' ' + ariaLabel + ' ' + title + ' ' + className;
                    
                    for (const pattern of targetPatterns) {
                        if (combinedText.includes(pattern)) {
                            const rect = element.getBoundingClientRect();
                            if (rect.width > 0 && rect.height > 0) {
                                element.click();
                                return `Usercentrics ${actionType}: "${text || ariaLabel || 'unlabeled'}"`;
                            }
                        }
                    }
                }
                return false;
            }, action);

            if (usercentricsTextResult) {
                console.log(`✅ Clicked Usercentrics ${action} button via enhanced detection: ${usercentricsTextResult} [${detectedLanguage}]`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return true;
            }
        } catch (error) {
            console.log(`⚠️ Error with Usercentrics text detection:`, error.message);
        }

        // Fallback to standard selectors
        const usercentricsSelectors = {
            accept: [
                '[data-usercentrics="accept"]',
                '[data-usercentrics="accept-all"]', 
                '.usercentrics-accept-all',
                'button[data-testid="uc-accept-all-button"]',
                '[data-testid="uc-accept-all-button"]'
            ],
            reject: [
                '[data-usercentrics="deny"]',
                '[data-usercentrics="reject-all"]',
                '.usercentrics-deny-all', 
                'button[data-testid="uc-deny-all-button"]',
                '[data-testid="uc-deny-all-button"]'
            ],
            settings: [
                '[data-usercentrics="settings"]',
                '.usercentrics-settings',
                'button[data-testid="uc-more-information-button"]',
                '[data-testid="uc-more-information-button"]'
            ]
        };

        for (const selector of usercentricsSelectors[action] || []) {
            try {
                const button = await this.page.$(selector);
                if (button) {
                    const isVisible = await button.evaluate(el => el.offsetParent !== null);
                    if (isVisible) {
                        await button.click();
                        console.log(`✅ Clicked Usercentrics ${action} button: ${selector} [${detectedLanguage}]`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        return true;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Error with Usercentrics selector ${selector}:`, error.message);
            }
        }

        // ✅ PRIORITY 5: Iframe handling (with multi-language support)
        const iframeSuccess = await this.page.evaluate((actionType, patterns) => {
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
                                    
                                    // Use language-specific patterns
                                    for (const pattern of patterns) {
                                        if (text.includes(pattern.toLowerCase())) {
                                            btn.click();
                                            return `iframe_multilang_${actionType}_${pattern}`;
                                        }
                                    }
                                }
                            }
                        } catch (crossOriginError) {}
                        
                        // Fallback positioning for iframes
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
        }, action, targetPatterns);

        if (iframeSuccess) {
            console.log(`✅ Clicked ${action} in iframe: ${iframeSuccess} [${detectedLanguage}]`);
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

        console.log(`❌ No ${action} button found for language ${detectedLanguage.toUpperCase()}`);
        return false;
    }

    async analyzeBanner() {
        const bannerInfo = await this.page.evaluate(() => {
            const oneTrustBanner = document.querySelector('#onetrust-banner-sdk, #onetrust-consent-sdk');
            const cookiebotBanner = document.querySelector('#CybotCookiebotDialog, [id*="Cookiebot"], [id*="cookiebot"], .cookiebot') ||
                                   document.querySelector('iframe[src*="cookiebot"], iframe[src*="cookieinformation"]');
            const sourcePointBanner = document.querySelector('[class*="sp_choice"], [id*="sp_"], .message-container') ||
                                     document.querySelector('iframe[src*="sourcepoint"], iframe[title*="SP Consent"]');
            
            // ✅ ENHANCED: MICROSOFT CUSTOM CONSENT DETECTION
            const microsoftBanner = document.querySelector('[data-module="cookiebanner"], .mscc-banner, #msccBanner, [id*="mscc"]') ||
                                   document.querySelector('script[src*="wcpstatic.microsoft.com"]')?.parentElement;
            
            // ✅ ENHANCED: USERCENTRICS CMP DETECTION - Major European CMP
            const usercentricsBanner = document.querySelector('[data-usercentrics], #usercentrics-root, .usercentrics') ||
                                      document.querySelector('script[src*="usercentrics"]')?.parentElement ||
                                      document.querySelector('script[src*="app.usercentrics.eu"]')?.parentElement;
            
            const banner = oneTrustBanner || cookiebotBanner || sourcePointBanner || microsoftBanner || usercentricsBanner;
            if (!banner) return { detected: false };
            
            const consentButtons = [];
            const iframeButtons = [];
            
            // Universal consent button detection with multi-language support - USERCENTRICS ENHANCED
            const universalButtonPatterns = [
                // English
                'accept', 'reject', 'decline', 'allow', 'deny', 'manage', 'settings',
                // German - USERCENTRICS ENHANCED
                'annehmen', 'ablehnen', 'akzeptieren', 'verweigern', 'einstellungen', 'verwalten',
                'alle cookies akzeptieren', 'cookies ablehnen', 'alle akzeptieren', 'alle ablehnen',
                // Spanish
                'aceptar', 'rechazar', 'gestionar', 'configuración',
                // French  
                'accepter', 'refuser', 'gérer', 'paramètres',
                // Italian
                'accetta', 'rifiuta', 'gestisci', 'impostazioni',
                // Dutch
                'accepteren', 'weigeren', 'beheren', 'instellingen',
                // Danish
                'accepter', 'afvis', 'administrer', 'indstillinger',
                // Swedish - ENHANCED
                'acceptera', 'avvisa', 'hantera', 'inställningar', 'godkänn', 'neka'
            ];
            
            // ✅ CRITICAL FIX: Safe property access to prevent className error
            document.querySelectorAll('button, a[role="button"], [data-cookie-optin-type], input[type="button"], [class*="button"], [data-testid]').forEach(btn => {
                const text = (btn.textContent || btn.value || '').toLowerCase().trim();
                const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
                const title = btn.getAttribute('title')?.toLowerCase() || '';
                // ✅ FIXED: Safe className access
                const className = btn.className ? String(btn.className).toLowerCase() : '';
                const dataTestId = btn.getAttribute('data-testid')?.toLowerCase() || '';
                
                const combinedText = text + ' ' + ariaLabel + ' ' + title + ' ' + className + ' ' + dataTestId;
                
                if (combinedText && (
                    universalButtonPatterns.some(pattern => combinedText.includes(pattern)) ||
                    combinedText.includes('cookie') || combinedText.includes('privacy') ||
                    btn.id.includes('cookie') || btn.id.includes('consent') ||
                    className.includes('cookie') || className.includes('consent')
                )) {
                    consentButtons.push(text || ariaLabel || 'unlabeled');
                }
            });
            
            // ✅ NEW: Also check shadow DOM for buttons
            document.querySelectorAll('*').forEach(el => {
                if (el.shadowRoot) {
                    el.shadowRoot.querySelectorAll('button, a[role="button"]').forEach(btn => {
                        const text = btn.textContent?.toLowerCase().trim() || '';
                        if (text && text.length < 50) {
                            consentButtons.push(text);
                        }
                    });
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
            
            // Multi-language acceptance detection - USERCENTRICS ENHANCED
            const hasAccept = allButtonTexts.some(text => 
                ['accept', 'allow', 'agree', 'consent', 'yes', 'ok',
                 'annehmen', 'akzeptieren', 'zustimmen', 'ja', 'alle akzeptieren', 'alle cookies akzeptieren',
                 'aceptar', 'permitir', 'acepto', 'sí',
                 'accepter', 'autoriser', 'oui',
                 'accetta', 'consenti', 'sì',
                 'accepteren', 'toestaan', 'ja',
                 'accepter', 'tillad', 'ja',
                 'acceptera', 'tillåt', 'ja', 'godkänn' // ✅ Swedish enhanced
                ].some(pattern => text.includes(pattern))
            );
            
            // Multi-language rejection detection - USERCENTRICS ENHANCED
            const hasReject = allButtonTexts.some(text => 
                ['reject', 'decline', 'deny', 'no', 'necessary', 'essential',
                 'ablehnen', 'verweigern', 'zurückweisen', 'nein', 'notwendige', 'erforderliche', 
                 'cookies ablehnen', 'alle ablehnen',
                 'rechazar', 'declinar', 'denegar', 'no', 'necesarias', 'esenciales', 
                 'refuser', 'décliner', 'non', 'nécessaires', 'essentiels',
                 'rifiuta', 'declina', 'no', 'necessari', 'essenziali',
                 'weigeren', 'afwijzen', 'nee', 'noodzakelijke', 'essentiële',
                 'afvis', 'nægt', 'nej', 'nødvendige', 'væsentlige',
                 'avvisa', 'neka', 'nej', 'nödvändiga', 'väsentliga' // ✅ Swedish enhanced
                ].some(pattern => text.includes(pattern))
            );
            
            // Multi-language settings detection - ENHANCED
            const hasSettings = allButtonTexts.some(text => 
                ['manage', 'settings', 'preferences', 'customize', 'details', 'more',
                 'verwalten', 'einstellungen', 'anpassen', 'details', 'mehr',
                 'gestionar', 'configuración', 'personalizar', 'detalles', 'más',
                 'gérer', 'paramètres', 'personnaliser', 'détails', 'plus',
                 'gestisci', 'impostazioni', 'personalizza', 'dettagli', 'altro',
                 'beheren', 'instellingen', 'aanpassen', 'details', 'meer',
                 'administrer', 'indstillinger', 'tilpas', 'detaljer', 'flere',
                 'hantera', 'inställningar', 'anpassa', 'detaljer', 'fler' // ✅ Swedish enhanced
                ].some(pattern => text.includes(pattern))
            );
            
            let provider = 'Unknown';
            if (oneTrustBanner) provider = 'OneTrust';
            else if (cookiebotBanner) provider = 'Cookiebot'; 
            else if (sourcePointBanner) provider = 'SourcePoint';
            else if (microsoftBanner) provider = 'Microsoft';
            else if (usercentricsBanner) provider = 'Usercentrics';  // ✅ ENHANCED
            
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

            // ✅ GDPR VIOLATION ANALYSIS WITH CORRECT STAGE MAPPING
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
                    ...results.evidence.baseline,
                    stage: 'pre-consent',
                    bannerAnalysis: bannerInfo
                };
                evidencePackage.stages.push(preConsentStage);
                console.log('🔧 DEBUG: Pre-consent stage created with stage name:', preConsentStage.stage);
            }

            if (results.evidence.reject_pre) {
                console.log('📊 Mapping reject_pre stage');
                evidencePackage.stages.push({
                    ...results.evidence.reject_pre,
                    stage: 'reject_pre'
                });
            }

            if (results.evidence.reject) {
                console.log('📊 Mapping post-reject stage (FINAL FIX)');
                evidencePackage.stages.push({
                    ...results.evidence.reject,
                    stage: 'post-reject'
                });
            }

            if (results.evidence.accept_pre) {
                console.log('📊 Mapping accept_pre stage');
                evidencePackage.stages.push({
                    ...results.evidence.accept_pre,
                    stage: 'accept_pre'
                });
            }

            if (results.evidence.accept) {
                console.log('📊 Mapping post-accept stage (FINAL FIX)');
                evidencePackage.stages.push({
                    ...results.evidence.accept,
                    stage: 'post-accept'
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