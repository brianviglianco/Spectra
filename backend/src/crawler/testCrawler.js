// src/crawler/testCrawler.js
// Test del crawler con sesiones separadas para validación completa

const SpectralCrawler = require('./spectralCrawler');

async function testCrawler() {
    console.log('🧪 Iniciando test completo con sesiones separadas...');
    
    const results = {
        domain: 'cnn.com',
        timestamp: new Date().toISOString(),
        states: {}
    };
    
    try {
        // BASELINE - Sesión limpia
        console.log('\n=== BASELINE (sin interacción) ===');
        const crawler1 = new SpectralCrawler();
        await crawler1.init();
        results.states.baseline = await crawler1.crawlState('cnn.com', 'baseline');
        await crawler1.close();
        
        // REJECT - Nueva sesión
        console.log('\n=== REJECT (rechazar cookies) ===');
        const crawler2 = new SpectralCrawler();
        await crawler2.init();
        results.states.reject = await crawler2.crawlState('cnn.com', 'reject');
        await crawler2.close();
        
        // ACCEPT - Nueva sesión
        console.log('\n=== ACCEPT (aceptar cookies) ===');
        const crawler3 = new SpectralCrawler();
        await crawler3.init();
        results.states.accept = await crawler3.crawlState('cnn.com', 'accept');
        await crawler3.close();
        
        // RESUMEN
        console.log('\n📊 RESUMEN FINAL:');
        console.log(`Baseline: ${results.states.baseline.cmps.length} CMPs, ${results.states.baseline.cookies.length} cookies`);
        console.log(`Reject: ${results.states.reject.cmps.length} CMPs, ${results.states.reject.cookies.length} cookies`);
        console.log(`Accept: ${results.states.accept.cmps.length} CMPs, ${results.states.accept.cookies.length} cookies`);
        
        // Scripts comparison
        console.log('\n📋 SCRIPTS:');
        console.log(`Baseline: ${results.states.baseline.evidence.scripts.before.length} → ${results.states.baseline.evidence.scripts.after.length}`);
        console.log(`Reject: ${results.states.reject.evidence.scripts.before.length} → ${results.states.reject.evidence.scripts.after.length}`);
        console.log(`Accept: ${results.states.accept.evidence.scripts.before.length} → ${results.states.accept.evidence.scripts.after.length}`);
        
        return results;
        
    } catch (error) {
        console.error('❌ Error en test:', error);
    }
}

// Ejecutar test
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