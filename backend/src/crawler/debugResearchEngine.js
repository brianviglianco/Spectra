// DEBUG: Unknown Script Research Engine - Find where data gets lost
const SpectralCrawler = require('./spectralCrawler');

async function debugUnknownScriptFlow() {
    console.log('🔍 DEBUG: Unknown Script Research Data Flow Analysis');
    console.log('=' .repeat(60));
    
    const crawler = new SpectralCrawler({ headless: false });
    
    try {
        await crawler.init();
        
        // Test with DR.dk (known to have unknown scripts)
        const url = 'https://www.dr.dk';
        console.log(`🌐 Testing: ${url}`);
        
        // 1. CAPTURE BASELINE EVIDENCE  
        await crawler.page.goto(url, { waitUntil: 'domcontentloaded' });
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const evidence = await crawler.captureEvidence('baseline', url);
        
        // 2. DEBUG: Print scriptAnalysis structure
        console.log('\n📊 DEBUG: Evidence.scriptAnalysis structure:');
        console.log(JSON.stringify(evidence.scriptAnalysis, null, 2));
        
        // 3. DEBUG: Check unknown scripts specifically
        console.log('\n❓ DEBUG: Unknown scripts check:');
        console.log('unknownDetails exists:', !!evidence.scriptAnalysis?.unknownDetails);
        console.log('unknownDetails length:', evidence.scriptAnalysis?.unknownDetails?.length || 0);
        console.log('unknownDetails content:', evidence.scriptAnalysis?.unknownDetails);
        
        // 4. DEBUG: Simulate professionalAnalysis data access
        console.log('\n🔍 DEBUG: Simulating professionalAnalysis access:');
        const baseline = evidence; // This is how professionalAnalysis.js accesses it
        const unknownScripts = baseline?.scriptAnalysis?.unknownDetails || [];
        console.log('unknownScripts in analysis:', unknownScripts);
        console.log('unknownScripts length:', unknownScripts.length);
        
        // 5. DEBUG: Manual unknown detection for comparison
        if (evidence.scripts && evidence.scripts.length > 0) {
            console.log('\n🔍 DEBUG: Manual unknown script detection:');
            const manualUnknownScripts = evidence.scripts.filter(script => {
                const src = script.src || '';
                if (!src) return false;
                
                // Check if it's tracking
                const trackingDomains = ['google-analytics', 'segment.com', 'facebook', 'doubleclick'];
                const isTracking = trackingDomains.some(domain => src.includes(domain));
                
                // Check if it's necessary
                const necessaryDomains = ['cookiebot', 'onetrust', 'jquery', 'cloudflare', 'dr.dk'];
                const isNecessary = necessaryDomains.some(domain => src.includes(domain));
                
                return !isTracking && !isNecessary;
            });
            
            console.log('Manual unknown scripts found:', manualUnknownScripts.length);
            manualUnknownScripts.forEach((script, index) => {
                console.log(`  ${index + 1}. ${script.src}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    } finally {
        await crawler.close();
    }
}

debugUnknownScriptFlow();