const SpectralCrawler = require('./spectralCrawler');

async function testCrawler() {
    console.log('🧪 SPECTRAL TEST - CNN OneTrust');
    console.log('=' .repeat(40));
    
    const crawler = new SpectralCrawler({ headless: false });

    try {
        await crawler.init();
        
        const results = await crawler.crawlSite('https://www.osu.edu');
        
        console.log('\n📊 RESULTS:');
        console.log(`URL: ${results.url}`);
        
        // Show banner analysis
        if (results.bannerAnalysis) {
            console.log('\n🎯 BANNER ANALYSIS:');
            console.log(`Type: ${results.bannerAnalysis.type || 'Unknown'}`);
            console.log(`Direct Reject: ${results.bannerAnalysis.hasDirectReject ? 'Yes' : 'No'}`);
            console.log(`Settings Available: ${results.bannerAnalysis.hasSettings ? 'Yes' : 'No'}`);
            if (results.bannerAnalysis.text) {
                console.log(`Text: "${results.bannerAnalysis.text.substring(0, 100)}..."`);
            }
        }
        
        // Show script counts with PRE/POST details
        const baseline = results.evidence.baseline?.scriptsCount || 0;
        const rejectPre = results.evidence.reject_pre?.scriptsCount || 0;
        const reject = results.evidence.reject?.scriptsCount || 0;
        const acceptPre = results.evidence.accept_pre?.scriptsCount || 0;
        const accept = results.evidence.accept?.scriptsCount || 0;
        
        console.log('\n📈 DETAILED SCRIPT ANALYSIS:');
        console.log(`Baseline: ${baseline} scripts`);
        console.log('');
        
        if (results.evidence.reject?.violation) {
            console.log(`REJECT TEST:`);
            console.log(`  PRE:  ${rejectPre} scripts`);
            console.log(`  POST: UNAVAILABLE (${results.evidence.reject.violation})`);
        } else {
            console.log(`REJECT TEST:`);
            console.log(`  PRE:  ${rejectPre} scripts`);
            console.log(`  POST: ${reject} scripts (${reject - rejectPre >= 0 ? '+' : ''}${reject - rejectPre} change)`);
        }
        
        console.log('');
        console.log(`ACCEPT TEST:`);
        console.log(`  PRE:  ${acceptPre} scripts`);
        console.log(`  POST: ${accept} scripts (${accept - acceptPre >= 0 ? '+' : ''}${accept - acceptPre} change)`);
        
        console.log('\n🚨 VIOLATIONS DETECTED:');
        if (results.bannerAnalysis?.type === 'US_style' && !results.bannerAnalysis.hasDirectReject) {
            console.log('• No reject option available (GDPR Article 7 violation)');
            console.log(`• Pre-consent tracking: ${baseline} scripts loaded before user choice`);
            console.log(`• Accept increases tracking by ${accept - acceptPre} scripts (+${((accept - acceptPre) / acceptPre * 100).toFixed(1)}%)`);
        }

        console.log('\n📷 Screenshots saved in public/screenshots/');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await crawler.close();
    }
}

testCrawler();