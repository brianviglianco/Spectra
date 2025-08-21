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
        
        // Show script counts
        const baseline = results.evidence.baseline?.scriptsCount || 0;
        const reject = results.evidence.reject?.scriptsCount || 0;
        const accept = results.evidence.accept?.scriptsCount || 0;
        
        console.log('\n📈 SCRIPT COUNTS:');
        console.log(`Baseline: ${baseline}`);
        console.log(`Reject:   ${reject} (${reject - baseline >= 0 ? '+' : ''}${reject - baseline})`);
        console.log(`Accept:   ${accept} (${accept - baseline >= 0 ? '+' : ''}${accept - baseline})`);
        
        // Expected: baseline ≈ reject < accept
        if (accept > baseline + 10) {
            console.log('\n✅ Accept shows more tracking (good)');
        } else {
            console.log('\n⚠️ Accept not showing expected increase');
        }
        
        if (reject <= baseline + 5) {
            console.log('✅ Reject shows minimal tracking (good)');
        } else {
            console.log('⚠️ Reject not reducing tracking effectively');
        }

        console.log('\n📷 Screenshots saved in public/screenshots/');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await crawler.close();
    }
}

testCrawler();