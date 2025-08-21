// src/crawler/testCrawler.js
// Final robust test with error handling

const SpectralCrawler = require('./spectralCrawler');

async function testCrawler() {
    console.log('🧪 Test final...');
    
    const results = {
        domain: 'cnn.com',
        timestamp: new Date().toISOString(),
        states: {}
    };
    
    try {
        // BASELINE
        console.log('\n=== BASELINE ===');
        const crawler1 = new SpectralCrawler();
        await crawler1.init();
        results.states.baseline = await crawler1.crawlState('cnn.com', 'baseline');
        await crawler1.close();
        
        // REJECT
        console.log('\n=== REJECT ===');
        const crawler2 = new SpectralCrawler();
        await crawler2.init();
        results.states.reject = await crawler2.crawlState('cnn.com', 'reject');
        await crawler2.close();
        
        // ACCEPT
        console.log('\n=== ACCEPT ===');
        const crawler3 = new SpectralCrawler();
        await crawler3.init();
        results.states.accept = await crawler3.crawlState('cnn.com', 'accept');
        await crawler3.close();
        
        // RESUMEN
        console.log('\n📊 RESUMEN FINAL:');
        const states = ['baseline', 'reject', 'accept'];
        
        for (const state of states) {
            const result = results.states[state];
            if (result && !result.error) {
                const cmpCount = result.cmps?.length || 0;
                const cookieCount = result.cookies?.length || 0;
                console.log(`${state.charAt(0).toUpperCase() + state.slice(1)}: ${cmpCount} CMPs, ${cookieCount} cookies`);
            } else {
                console.log(`${state.charAt(0).toUpperCase() + state.slice(1)}: Error - ${result?.error || 'Unknown'}`);
            }
        }
        
        console.log('\n📋 SCRIPTS:');
        for (const state of states) {
            const result = results.states[state];
            if (result && !result.error && result.evidence) {
                const before = result.evidence.scripts?.before?.length || 0;
                const after = result.evidence.scripts?.after?.length || 0;
                console.log(`${state.charAt(0).toUpperCase() + state.slice(1)}: ${before} → ${after}`);
            } else {
                console.log(`${state.charAt(0).toUpperCase() + state.slice(1)}: No data`);
            }
        }
        
        return results;
        
    } catch (error) {
        console.error('❌ Error en test:', error);
        return { error: error.message };
    }
}

if (require.main === module) {
    testCrawler().then(() => {
        console.log('✅ Test completado');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Test falló:', error);
        process.exit(1);
    });
}

module.exports = testCrawler;