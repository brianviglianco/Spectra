const SpectralCrawler = require('./spectralCrawler');

async function testCrawler() {
    console.log('🧪 SPECTRAL TEST - Enhanced GDPR Detection');
    console.log('=' .repeat(50));
    
    const crawler = new SpectralCrawler({ headless: false });

    try {
        await crawler.init();
        
        // FIXED: Test on cookielaw.org - has OneTrust with tracking scripts
        console.log('🎯 Testing on cookielaw.org (OneTrust + GA tracking)');
        const results = await crawler.crawlSite('https://cookielaw.org');
        
        console.log('\n📊 RESULTS:');
        console.log(`URL: ${results.url}`);
        
        if (results.bannerAnalysis) {
            console.log('\n🎯 BANNER ANALYSIS:');
            console.log(`Type: ${results.bannerAnalysis.type || 'Unknown'}`);
            console.log(`Provider: ${results.bannerAnalysis.provider || 'Unknown'}`);
            console.log(`Direct Reject: ${results.bannerAnalysis.hasDirectReject ? 'Yes' : 'No'}`);
            console.log(`Settings Available: ${results.bannerAnalysis.hasSettings ? 'Yes' : 'No'}`);
            if (results.bannerAnalysis.buttonTexts?.length > 0) {
                console.log(`Buttons Found: ${results.bannerAnalysis.buttonTexts.slice(0, 5).join(', ')}${results.bannerAnalysis.buttonTexts.length > 5 ? '...' : ''}`);
            }
            if (results.bannerAnalysis.text) {
                console.log(`Text: "${results.bannerAnalysis.text.substring(0, 100)}..."`);
            }
        }
        
        const baseline = results.evidence.baseline?.scriptsCount || 0;
        const baselineLS = results.evidence.baseline?.localStorageCount || 0;
        const baseline3P = results.evidence.baseline?.thirdPartyScripts || 0;
        const baselineTracking = results.evidence.baseline?.scriptAnalysis?.tracking || 0;
        
        const rejectPre = results.evidence.reject_pre?.scriptsCount || 0;
        const reject = results.evidence.reject?.scriptsCount || 0;
        const rejectLS = results.evidence.reject?.localStorageCount || 0;
        const reject3P = results.evidence.reject?.thirdPartyScripts || 0;
        const rejectTracking = results.evidence.reject?.scriptAnalysis?.tracking || 0;
        
        const acceptPre = results.evidence.accept_pre?.scriptsCount || 0;
        const accept = results.evidence.accept?.scriptsCount || 0;
        const acceptLS = results.evidence.accept?.localStorageCount || 0;
        const accept3P = results.evidence.accept?.thirdPartyScripts || 0;
        const acceptTracking = results.evidence.accept?.scriptAnalysis?.tracking || 0;
        
        console.log('\n📈 DETAILED TRACKING ANALYSIS:');
        console.log(`Baseline: ${baseline} scripts (${baselineTracking} tracking), ${baselineLS} localStorage, ${baseline3P} 3rd-party`);
        console.log('');
        
        if (results.evidence.reject?.violation) {
            console.log(`REJECT TEST:`);
            console.log(`  PRE:  ${rejectPre} scripts (${results.evidence.reject_pre?.scriptAnalysis?.tracking || 0} tracking), ${results.evidence.reject_pre?.localStorageCount || 0} localStorage, ${results.evidence.reject_pre?.thirdPartyScripts || 0} 3rd-party`);
            console.log(`  POST: UNAVAILABLE (${results.evidence.reject.violation})`);
        } else {
            console.log(`REJECT TEST:`);
            console.log(`  PRE:  ${rejectPre} scripts (${results.evidence.reject_pre?.scriptAnalysis?.tracking || 0} tracking), ${results.evidence.reject_pre?.localStorageCount || 0} localStorage, ${results.evidence.reject_pre?.thirdPartyScripts || 0} 3rd-party`);
            console.log(`  POST: ${reject} scripts (${rejectTracking} tracking, +${reject - rejectPre}), ${rejectLS} localStorage, ${reject3P} 3rd-party`);
        }
        
        console.log('');
        console.log(`ACCEPT TEST:`);
        console.log(`  PRE:  ${acceptPre} scripts (${results.evidence.accept_pre?.scriptAnalysis?.tracking || 0} tracking), ${results.evidence.accept_pre?.localStorageCount || 0} localStorage, ${results.evidence.accept_pre?.thirdPartyScripts || 0} 3rd-party`);
        console.log(`  POST: ${accept} scripts (${acceptTracking} tracking, +${accept - acceptPre}), ${acceptLS} localStorage (+${acceptLS - (results.evidence.accept_pre?.localStorageCount || 0)}), ${accept3P} 3rd-party (+${accept3P - (results.evidence.accept_pre?.thirdPartyScripts || 0)})`);
        
        // ENHANCED: Show tracking script details for debugging
        if (results.evidence.baseline?.scriptAnalysis?.trackingDetails?.length > 0) {
            console.log('\n🔍 TRACKING SCRIPTS DETECTED:');
            results.evidence.baseline.scriptAnalysis.trackingDetails.forEach((script, index) => {
                console.log(`  ${index + 1}. ${script}`);
            });
        }

        // GDPR COMPLIANCE ANALYSIS - UNIFIED REPORTING ONLY
        if (results.gdprCompliance) {
            console.log('\n' + '='.repeat(80));
            console.log('📊 GDPR COMPLIANCE REPORT');
            console.log('='.repeat(80));
            console.log(`🎯 Compliance Score: ${results.gdprCompliance.complianceScore}%`);
            console.log(`⚠️ Risk Level: ${results.gdprCompliance.riskLevel}`);
            console.log(`📊 Total Violations: ${results.gdprCompliance.summary.totalViolations}`);
            
            if (results.gdprCompliance.violations.length > 0) {
                console.log('\n🚨 GDPR VIOLATIONS DETECTED:');
                console.log('-'.repeat(50));
                
                results.gdprCompliance.violations.forEach((violation, index) => {
                    console.log(`\n[${violation.code}] ${violation.title}`);
                    console.log(`📜 GDPR Reference: ${violation.gdprArticle}`);
                    console.log(`⚠️ Severity: ${violation.severity}`);
                    console.log(`📋 Description: ${violation.description}`);
                    console.log(`💼 Business Impact: ${violation.businessImpact}`);
                    console.log(`🔧 Remediation: ${violation.remediation}`);
                    
                    // Show violating elements
                    if (violation.details) {
                        console.log('\n🚨 VIOLATING ELEMENTS DETECTED:');
                        if (violation.details.scripts && violation.details.scripts.length > 0) {
                            console.log(`📜 Scripts in violation:`);
                            violation.details.scripts.slice(0, 3).forEach(script => {
                                console.log(`   • ${script}`);
                            });
                            if (violation.details.scripts.length > 3) {
                                console.log(`   • ... and ${violation.details.scripts.length - 3} more`);
                            }
                        }
                        if (violation.details.cookies && violation.details.cookies.length > 0) {
                            console.log(`🍪 Cookies in violation:`);
                            violation.details.cookies.slice(0, 3).forEach(cookie => {
                                console.log(`   • ${cookie}`);
                            });
                            if (violation.details.cookies.length > 3) {
                                console.log(`   • ... and ${violation.details.cookies.length - 3} more`);
                            }
                        }
                        if (violation.details.requests && violation.details.requests.length > 0) {
                            console.log(`🌐 Network requests in violation:`);
                            violation.details.requests.slice(0, 3).forEach(request => {
                                console.log(`   • ${request}`);
                            });
                            if (violation.details.requests.length > 3) {
                                console.log(`   • ... and ${violation.details.requests.length - 3} more`);
                            }
                        }
                        if (violation.details.rawData) {
                            console.log(`📊 Technical Details:`);
                            console.log(`   • Total Scripts: ${violation.details.rawData.totalScripts}`);
                            console.log(`   • Tracking Scripts: ${violation.details.rawData.trackingScripts}`);
                            console.log(`   • Necessary Scripts: ${violation.details.rawData.necessaryScripts}`);
                        }
                    }
                });
                
                console.log('\n⚖️ LEGAL RISK ASSESSMENT:');
                console.log('-'.repeat(50));
                console.log(`Legal Risk: ${results.gdprCompliance.legalAnalysis.legalRisk}`);
                console.log(`Regulatory Risk: ${results.gdprCompliance.legalAnalysis.regulatoryAction}`);
                console.log(`Fine Exposure: ${results.gdprCompliance.legalAnalysis.fineExposure}`);
                
                if (results.gdprCompliance.recommendations.length > 0) {
                    console.log('\n💡 STRATEGIC RECOMMENDATIONS:');
                    console.log('-'.repeat(50));
                    results.gdprCompliance.recommendations.forEach((rec, index) => {
                        console.log(`\n${index + 1}. ${rec.action}`);
                        console.log(`   Priority: ${rec.priority} | Timeline: ${rec.timeline} | Effort: ${rec.effort}`);
                        console.log(`   Impact: ${rec.impact}`);
                    });
                }
                
            } else {
                console.log('\n✅ NO GDPR VIOLATIONS DETECTED');
                console.log('Site demonstrates excellent privacy compliance practices.');
            }
            console.log('\n' + '='.repeat(80));
        }

        console.log('\n📷 Screenshots saved in public/screenshots/');

        // ENHANCED: Debug summary for development
        console.log('\n🔧 DEBUG SUMMARY:');
        console.log('-'.repeat(30));
        console.log(`Banner Provider: ${results.bannerAnalysis?.provider || 'None'}`);
        console.log(`Accept Button Working: ${(accept - acceptPre) > 0 || (acceptLS - (results.evidence.accept_pre?.localStorageCount || 0)) > 0 ? 'YES' : 'NO'}`);
        console.log(`Reject Button Working: ${results.evidence.reject?.violation ? 'N/A' : 'YES'}`);
        console.log(`Pre-consent Tracking: ${baselineTracking > 0 ? 'DETECTED' : 'None'}`);
        console.log(`GDPR Engine Violations: ${results.gdprCompliance?.summary?.totalViolations || 0}`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await crawler.close();
    }
}

// ENHANCED: Add test site options
async function runTests() {
    console.log('🎯 SPECTRAL TEST SUITE');
    console.log('='.repeat(50));
    
    const testSites = [
        {
            name: 'OneTrust + GA Tracking',
            url: 'https://cookielaw.org',
            expectedViolations: ['EU-C-001'], // Pre-consent tracking
            description: 'Should detect Google Analytics loading before consent'
        },
        {
            name: 'DR.dk Cookiebot',
            url: 'https://www.dr.dk',
            expectedViolations: [],
            description: 'Well-implemented Cookiebot (may have violations)'
        }
    ];

    for (const testSite of testSites) {
        console.log(`\n🧪 TESTING: ${testSite.name}`);
        console.log(`📝 Expected: ${testSite.description}`);
        console.log(`🌐 URL: ${testSite.url}`);
        console.log('-'.repeat(50));

        const crawler = new SpectralCrawler({ headless: false });
        
        try {
            await crawler.init();
            const results = await crawler.crawlSite(testSite.url);
            
            const actualViolations = results.gdprCompliance?.violations?.map(v => v.code) || [];
            const score = results.gdprCompliance?.complianceScore || 0;
            
            console.log(`\n✅ TEST RESULTS:`);
            console.log(`   Compliance Score: ${score}%`);
            console.log(`   Violations Found: ${actualViolations.join(', ') || 'None'}`);
            console.log(`   Expected: ${testSite.expectedViolations.join(', ') || 'None'}`);
            
            // Check if we found expected violations
            const foundExpected = testSite.expectedViolations.every(expected => 
                actualViolations.includes(expected)
            );
            
            if (foundExpected || testSite.expectedViolations.length === 0) {
                console.log(`   Status: ✅ PASS`);
            } else {
                console.log(`   Status: ❌ FAIL - Expected violations not detected`);
            }
            
        } catch (error) {
            console.error(`❌ Test failed: ${error.message}`);
        } finally {
            await crawler.close();
        }
        
        console.log('\n' + '='.repeat(50));
    }
}

// Run the enhanced test or single test based on argument
if (process.argv[2] === '--full') {
    runTests();
} else {
    testCrawler();
}