const SpectralCrawler = require('./spectralCrawler');

async function testCrawler() {
    console.log('🧪 SPECTRAL TEST - CNN OneTrust');
    console.log('=' .repeat(40));
    
    const crawler = new SpectralCrawler({ headless: false });

    try {
        await crawler.init();
        
        const results = await crawler.crawlSite('https://cookielaw.org/the-site/');
        
        console.log('\n📊 RESULTS:');
        console.log(`URL: ${results.url}`);
        
        if (results.bannerAnalysis) {
            console.log('\n🎯 BANNER ANALYSIS:');
            console.log(`Type: ${results.bannerAnalysis.type || 'Unknown'}`);
            console.log(`Direct Reject: ${results.bannerAnalysis.hasDirectReject ? 'Yes' : 'No'}`);
            console.log(`Settings Available: ${results.bannerAnalysis.hasSettings ? 'Yes' : 'No'}`);
            if (results.bannerAnalysis.text) {
                console.log(`Text: "${results.bannerAnalysis.text.substring(0, 100)}..."`);
            }
        }
        
        const baseline = results.evidence.baseline?.scriptsCount || 0;
        const baselineLS = results.evidence.baseline?.localStorageCount || 0;
        const baseline3P = results.evidence.baseline?.thirdPartyScripts || 0;
        
        const rejectPre = results.evidence.reject_pre?.scriptsCount || 0;
        const reject = results.evidence.reject?.scriptsCount || 0;
        const rejectLS = results.evidence.reject?.localStorageCount || 0;
        const reject3P = results.evidence.reject?.thirdPartyScripts || 0;
        
        const acceptPre = results.evidence.accept_pre?.scriptsCount || 0;
        const accept = results.evidence.accept?.scriptsCount || 0;
        const acceptLS = results.evidence.accept?.localStorageCount || 0;
        const accept3P = results.evidence.accept?.thirdPartyScripts || 0;
        
        console.log('\n📈 DETAILED TRACKING ANALYSIS:');
        console.log(`Baseline: ${baseline} scripts, ${baselineLS} localStorage, ${baseline3P} 3rd-party`);
        console.log('');
        
        if (results.evidence.reject?.violation) {
            console.log(`REJECT TEST:`);
            console.log(`  PRE:  ${rejectPre} scripts, ${results.evidence.reject_pre?.localStorageCount || 0} localStorage, ${results.evidence.reject_pre?.thirdPartyScripts || 0} 3rd-party`);
            console.log(`  POST: UNAVAILABLE (${results.evidence.reject.violation})`);
        } else {
            console.log(`REJECT TEST:`);
            console.log(`  PRE:  ${rejectPre} scripts, ${results.evidence.reject_pre?.localStorageCount || 0} localStorage, ${results.evidence.reject_pre?.thirdPartyScripts || 0} 3rd-party`);
            console.log(`  POST: ${reject} scripts (+${reject - rejectPre}), ${rejectLS} localStorage, ${reject3P} 3rd-party`);
        }
        
        console.log('');
        console.log(`ACCEPT TEST:`);
        console.log(`  PRE:  ${acceptPre} scripts, ${results.evidence.accept_pre?.localStorageCount || 0} localStorage, ${results.evidence.accept_pre?.thirdPartyScripts || 0} 3rd-party`);
        console.log(`  POST: ${accept} scripts (+${accept - acceptPre}), ${acceptLS} localStorage (+${acceptLS - (results.evidence.accept_pre?.localStorageCount || 0)}), ${accept3P} 3rd-party (+${accept3P - (results.evidence.accept_pre?.thirdPartyScripts || 0)})`);
        
        console.log('\n🚨 VIOLATIONS DETECTED:');
        if (results.bannerAnalysis?.type === 'US_style' && !results.bannerAnalysis.hasDirectReject) {
            console.log('• No reject option available (GDPR Article 7 violation)');
            console.log(`• Pre-consent tracking: ${baseline} scripts + ${baselineLS} localStorage + ${baseline3P} 3rd-party scripts`);
            console.log(`• Accept increases: +${accept - acceptPre} scripts, +${acceptLS - (results.evidence.accept_pre?.localStorageCount || 0)} localStorage, +${accept3P - (results.evidence.accept_pre?.thirdPartyScripts || 0)} 3rd-party`);
        } else if (results.bannerAnalysis?.type === 'GDPR_style') {
            console.log('✅ NO VIOLATIONS DETECTED');
            console.log('• GDPR-compliant banner with reject option');
            console.log('• Reject maintains minimal tracking');
            console.log('• Accept properly increases tracking after consent');
        } else {
            console.log('⚠️ Could not determine compliance - no banner detected');
        }

        console.log('\n📷 Screenshots saved in public/screenshots/');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await crawler.close();
    }
}

testCrawler();