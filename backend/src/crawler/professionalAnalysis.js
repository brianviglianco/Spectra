const SpectralCrawler = require('./spectralCrawler');
const fs = require('fs').promises;
const path = require('path');

class SpectralAnalysisRunner {
    constructor() {
        this.reportDir = path.join(__dirname, '../../reports');
    }

    async generateExecutiveReport(url) {
        console.log('🏢 SPECTRAL PRIVACY COMPLIANCE ANALYSIS');
        console.log('=' .repeat(60));
        console.log(`🌐 Target: ${url}`);
        console.log(`📅 Analysis Date: ${new Date().toLocaleString()}`);
        console.log('=' .repeat(60));
        
        const crawler = new SpectralCrawler({ headless: false });
        
        try {
            await crawler.init();
            const results = await crawler.crawlSite(url);
            
            // Generate comprehensive report
            const report = await this.buildExecutiveReport(results);
            
            // Display executive summary
            this.displayExecutiveSummary(report);
            
            // Display detailed analysis
            this.displayDetailedAnalysis(results);
            
            // Display GDPR compliance report
            this.displayGDPRComplianceReport(results.gdprCompliance);
            
            // Display unknown scripts research - FIXED
            this.displayUnknownScriptsAnalysis(results);
            
            // Display recommendations
            this.displayStrategicRecommendations(report);
            
            // Save comprehensive report
            await this.saveReport(url, report, results);
            
            return report;
            
        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
            throw error;
        } finally {
            await crawler.close();
        }
    }

    async buildExecutiveReport(results) {
        const baseline = results.evidence.baseline;
        const accept = results.evidence.accept;
        const reject = results.evidence.reject;
        
        return {
            executiveSummary: {
                complianceScore: results.gdprCompliance?.complianceScore || 0,
                riskLevel: results.gdprCompliance?.riskLevel || 'UNKNOWN',
                totalViolations: results.gdprCompliance?.summary?.totalViolations || 0,
                criticalViolations: results.gdprCompliance?.summary?.criticalViolations || 0,
                trackingScripts: baseline?.scriptAnalysis?.tracking || 0,
                unknownScripts: baseline?.scriptAnalysis?.unknown || 0,
                cmpProvider: results.bannerAnalysis?.provider || 'None detected',
                consentMechanism: results.bannerAnalysis?.type || 'Unknown'
            },
            technicalFindings: {
                preConsentTracking: baseline?.scriptAnalysis?.tracking || 0,
                postAcceptTracking: accept?.scriptAnalysis?.tracking || 0,
                postRejectTracking: reject?.scriptAnalysis?.tracking || 0,
                trackingIncrease: (accept?.scriptAnalysis?.tracking || 0) - (baseline?.scriptAnalysis?.tracking || 0),
                cookieIncrease: (accept?.cookiesCount || 0) - (baseline?.cookiesCount || 0),
                storageIncrease: (accept?.localStorageCount || 0) - (baseline?.localStorageCount || 0)
            },
            businessImpact: this.calculateBusinessImpact(results.gdprCompliance),
            urgency: this.calculateUrgency(results.gdprCompliance)
        };
    }

    displayExecutiveSummary(report) {
        console.log('\n📋 EXECUTIVE SUMMARY');
        console.log('═'.repeat(50));
        
        const status = report.executiveSummary.complianceScore >= 80 ? '✅ COMPLIANT' :
                      report.executiveSummary.complianceScore >= 60 ? '⚠️ NEEDS ATTENTION' :
                      '🚨 NON-COMPLIANT';
        
        console.log(`Privacy Compliance Status: ${status}`);
        console.log(`Overall Score: ${report.executiveSummary.complianceScore}%`);
        console.log(`Risk Level: ${report.executiveSummary.riskLevel}`);
        console.log(`GDPR Violations: ${report.executiveSummary.totalViolations} total (${report.executiveSummary.criticalViolations} critical)`);
        console.log(`CMP Implementation: ${report.executiveSummary.cmpProvider} (${report.executiveSummary.consentMechanism})`);
        console.log(`Pre-consent Tracking: ${report.executiveSummary.trackingScripts} scripts detected`);
        console.log(`Unknown Technologies: ${report.executiveSummary.unknownScripts} require research`);
        
        console.log(`\n💼 Business Impact: ${report.businessImpact}`);
        console.log(`⏰ Action Required: ${report.urgency}`);
    }

    displayDetailedAnalysis(results) {
        console.log('\n🔍 DETAILED TECHNICAL ANALYSIS');
        console.log('═'.repeat(50));
        
        const baseline = results.evidence.baseline;
        const accept = results.evidence.accept;
        const reject = results.evidence.reject;
        
        console.log(`\n📊 TRACKING TECHNOLOGY ANALYSIS:`);
        console.log(`┌─ Pre-consent (Baseline): ${baseline?.scriptAnalysis?.tracking || 0} tracking scripts`);
        console.log(`├─ Post-accept: ${accept?.scriptAnalysis?.tracking || 0} tracking scripts (+${(accept?.scriptAnalysis?.tracking || 0) - (baseline?.scriptAnalysis?.tracking || 0)})`);
        console.log(`└─ Post-reject: ${reject?.scriptAnalysis?.tracking || 0} tracking scripts`);
        
        console.log(`\n🍪 DATA COLLECTION ANALYSIS:`);
        console.log(`┌─ Cookies: ${baseline?.cookiesCount || 0} → ${accept?.cookiesCount || 0} (Accept) / ${reject?.cookiesCount || 0} (Reject)`);
        console.log(`├─ Local Storage: ${baseline?.localStorageCount || 0} → ${accept?.localStorageCount || 0} (Accept) / ${reject?.localStorageCount || 0} (Reject)`);
        console.log(`└─ Tracking Pixels: ${baseline?.trackingPixels?.count || 0} → ${accept?.trackingPixels?.count || 0} (Accept)`);

        // Risk profile analysis
        if (baseline?.scriptAnalysis?.riskAssessment) {
            const risk = baseline.scriptAnalysis.riskAssessment;
            console.log(`\n⚠️ RISK PROFILE ANALYSIS:`);
            console.log(`┌─ High Risk Scripts: ${risk.high || 0}`);
            console.log(`├─ Medium Risk Scripts: ${risk.medium || 0}`);
            console.log(`├─ Low Risk Scripts: ${risk.low || 0}`);
            console.log(`└─ No Risk Scripts: ${risk.none || 0}`);
        }

        // Categories breakdown
        if (baseline?.scriptAnalysis?.categories) {
            console.log(`\n📈 TECHNOLOGY CATEGORIES:`);
            Object.entries(baseline.scriptAnalysis.categories).forEach(([category, count]) => {
                console.log(`├─ ${category.charAt(0).toUpperCase() + category.slice(1)}: ${count} scripts`);
            });
        }
    }

    displayGDPRComplianceReport(gdprCompliance) {
        if (!gdprCompliance) return;
        
        console.log('\n⚖️ GDPR COMPLIANCE ASSESSMENT');
        console.log('═'.repeat(50));
        
        if (gdprCompliance.violations.length > 0) {
            console.log('\n🚨 VIOLATIONS DETECTED:');
            console.log('─'.repeat(40));
            
            gdprCompliance.violations.forEach((violation, index) => {
                const severityIcon = {
                    'CRITICAL': '🔴',
                    'HIGH': '🟠', 
                    'MEDIUM': '🟡',
                    'LOW': '🟢'
                }[violation.severity] || '⚪';
                
                console.log(`\n${severityIcon} [${violation.code}] ${violation.title}`);
                console.log(`   Legal Reference: ${violation.gdprArticle}`);
                console.log(`   Business Risk: ${violation.businessImpact}`);
                console.log(`   Recommended Action: ${violation.remediation}`);
                
                if (violation.details?.scripts?.length > 0) {
                    console.log(`   Violating Scripts: ${violation.details.scripts.slice(0, 2).join(', ')}${violation.details.scripts.length > 2 ? '...' : ''}`);
                }
            });
            
            console.log('\n💰 LEGAL & FINANCIAL RISK:');
            console.log('─'.repeat(30));
            console.log(`Legal Risk: ${gdprCompliance.legalAnalysis.legalRisk}`);
            console.log(`Regulatory Action: ${gdprCompliance.legalAnalysis.regulatoryAction}`);
            console.log(`Fine Exposure: ${gdprCompliance.legalAnalysis.fineExposure}`);
            
        } else {
            console.log('✅ NO GDPR VIOLATIONS DETECTED');
            console.log('The website demonstrates good privacy compliance practices.');
        }
    }

    // FIXED: Unknown Scripts Analysis with correct data access
    displayUnknownScriptsAnalysis(results) {
        const baseline = results.evidence.baseline;
        const unknownScripts = baseline?.scriptAnalysis?.unknownDetails || [];
        
        if (unknownScripts.length === 0) return;
        
        console.log('\n🔍 UNKNOWN TECHNOLOGY RESEARCH');
        console.log('═'.repeat(50));
        
        console.log(`Found ${unknownScripts.length} unknown scripts requiring manual classification:`);
        
        unknownScripts.forEach((scriptUrl, index) => {
            console.log(`\n${index + 1}. ${scriptUrl}`);
            
            // Enhanced research logic with confidence scoring
            const research = this.analyzeUnknownScript(scriptUrl);
            
            const confidenceIcon = research.confidence >= 0.8 ? '🟢' :
                                  research.confidence >= 0.6 ? '🟡' :
                                  research.confidence >= 0.4 ? '🟠' : '🔴';
            
            console.log(`   ${confidenceIcon} Analysis: ${research.suggestion}`);
            console.log(`   Confidence: ${Math.round(research.confidence * 100)}%`);
            console.log(`   Suggested Category: ${research.category}`);
            console.log(`   Action: ${research.needsManualReview ? 'Manual review required' : 'Auto-classification possible'}`);
        });
        
        console.log(`\n💡 RECOMMENDATION: Review these ${unknownScripts.length} scripts to improve analysis accuracy.`);
        console.log(`   High-confidence suggestions can be added to the script classification database.`);
    }

    // NEW: Intelligent script analysis with confidence scoring
    analyzeUnknownScript(scriptUrl) {
        if (!scriptUrl || typeof scriptUrl !== 'string') {
            return {
                suggestion: 'Invalid script URL',
                confidence: 0,
                category: 'error',
                needsManualReview: true
            };
        }

        const url = scriptUrl.toLowerCase();
        
        // Domain-based analysis patterns
        const patterns = [
            // High confidence patterns
            {
                pattern: /api\.[^\/]+\/.*\/(build|bundle|component)/,
                suggestion: 'Custom API frontend component',
                confidence: 0.85,
                category: 'necessary'
            },
            {
                pattern: /cdn\.[^\/]+\/.*\/(ui|widget|component)/,
                suggestion: 'Third-party UI component',
                confidence: 0.8,
                category: 'functional'
            },
            {
                pattern: /\.(gov|edu)\/.*\/(public|assets)/,
                suggestion: 'Government/educational institution asset',
                confidence: 0.9,
                category: 'necessary'
            },
            // Medium confidence patterns
            {
                pattern: /\/assets?\//,
                suggestion: 'Website asset or resource file',
                confidence: 0.7,
                category: 'necessary'
            },
            {
                pattern: /\/(static|public)\//,
                suggestion: 'Static website resource',
                confidence: 0.75,
                category: 'necessary'
            },
            {
                pattern: /\/(build|dist|bundle)/,
                suggestion: 'Compiled frontend bundle',
                confidence: 0.8,
                category: 'necessary'
            },
            // Lower confidence patterns
            {
                pattern: /\.(min\.)?js$/,
                suggestion: 'JavaScript file, requires manual classification',
                confidence: 0.3,
                category: 'unknown'
            }
        ];

        // Check against patterns
        for (const pattern of patterns) {
            if (pattern.pattern.test(url)) {
                return {
                    suggestion: pattern.suggestion,
                    confidence: pattern.confidence,
                    category: pattern.category,
                    needsManualReview: pattern.confidence < 0.7
                };
            }
        }

        // Default case
        return {
            suggestion: 'Unknown script, manual review required',
            confidence: 0.2,
            category: 'unknown',
            needsManualReview: true
        };
    }

    displayStrategicRecommendations(report) {
        console.log('\n🎯 STRATEGIC RECOMMENDATIONS');
        console.log('═'.repeat(50));
        
        const recommendations = this.generateCustomRecommendations(report);
        
        recommendations.forEach((rec, index) => {
            const priorityIcon = {
                'IMMEDIATE': '🔴',
                'HIGH': '🟠',
                'MEDIUM': '🟡',
                'LOW': '🟢'
            }[rec.priority] || '⚪';
            
            console.log(`\n${priorityIcon} ${index + 1}. ${rec.title}`);
            console.log(`   Priority: ${rec.priority}`);
            console.log(`   Timeline: ${rec.timeline}`);
            console.log(`   Effort: ${rec.effort}`);
            console.log(`   Impact: ${rec.impact}`);
            console.log(`   Action: ${rec.action}`);
        });
    }

    generateCustomRecommendations(report) {
        const recommendations = [];
        
        if (report.executiveSummary.criticalViolations > 0) {
            recommendations.push({
                priority: 'IMMEDIATE',
                title: 'Address Critical GDPR Violations',
                timeline: '1-2 weeks',
                effort: 'High',
                impact: 'Eliminates legal risk and potential fines',
                action: 'Implement consent-gated tracking and fix CMP configuration'
            });
        }
        
        if (report.executiveSummary.trackingScripts > 0) {
            recommendations.push({
                priority: 'HIGH',
                title: 'Implement Pre-consent Tracking Controls',
                timeline: '2-4 weeks', 
                effort: 'Medium',
                impact: 'Ensures GDPR compliance and user privacy',
                action: 'Configure all tracking scripts to load only after user consent'
            });
        }
        
        if (report.executiveSummary.unknownScripts > 5) {
            recommendations.push({
                priority: 'MEDIUM',
                title: 'Complete Technology Audit',
                timeline: '1-2 weeks',
                effort: 'Low',
                impact: 'Improves monitoring accuracy and compliance oversight',
                action: 'Research and classify unknown scripts to enhance future analysis'
            });
        }
        
        if (report.technicalFindings.trackingIncrease === 0) {
            recommendations.push({
                priority: 'HIGH',
                title: 'Fix Non-functional Consent Mechanism',
                timeline: '1-2 weeks',
                effort: 'Medium',
                impact: 'Ensures user choices are respected and legally valid',
                action: 'Debug CMP integration to activate tracking upon consent'
            });
        }
        
        if (report.executiveSummary.complianceScore < 60) {
            recommendations.push({
                priority: 'IMMEDIATE',
                title: 'Comprehensive Privacy Compliance Review',
                timeline: '4-6 weeks',
                effort: 'High',
                impact: 'Achieves full GDPR compliance and eliminates legal risk',
                action: 'Engage privacy counsel and implement comprehensive privacy program'
            });
        }
        
        return recommendations;
    }

    calculateBusinessImpact(gdprCompliance) {
        if (!gdprCompliance) return 'Unknown - Analysis incomplete';
        
        const criticalViolations = gdprCompliance.summary?.criticalViolations || 0;
        const highViolations = gdprCompliance.summary?.highViolations || 0;
        
        if (criticalViolations > 0) {
            return 'HIGH - Immediate legal risk, potential €20M fines, regulatory investigation likely';
        } else if (highViolations >= 3) {
            return 'MEDIUM - Compliance gaps may lead to user complaints and regulatory scrutiny';
        } else if (highViolations > 0) {
            return 'LOW - Minor compliance issues, proactive improvement recommended';
        } else {
            return 'MINIMAL - Good privacy practices, continue monitoring';
        }
    }

    calculateUrgency(gdprCompliance) {
        if (!gdprCompliance) return 'Assessment needed';
        
        const criticalViolations = gdprCompliance.summary?.criticalViolations || 0;
        const highViolations = gdprCompliance.summary?.highViolations || 0;
        
        if (criticalViolations > 0) {
            return 'IMMEDIATE - Address within 1-2 weeks';
        } else if (highViolations >= 2) {
            return 'HIGH - Address within 30 days';
        } else if (highViolations > 0) {
            return 'MEDIUM - Address within 90 days';
        } else {
            return 'LOW - Monitor and improve continuously';
        }
    }

    async saveReport(url, report, results) {
        try {
            await fs.mkdir(this.reportDir, { recursive: true });
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const domain = new URL(url).hostname;
            const filename = `spectral-analysis-${domain}-${timestamp}.json`;
            const filepath = path.join(this.reportDir, filename);
            
            const reportData = {
                url,
                timestamp: new Date().toISOString(),
                executiveReport: report,
                detailedResults: results,
                metadata: {
                    spectralVersion: '1.0.0',
                    analysisType: 'comprehensive-privacy-compliance',
                    reportGeneration: 'automated'
                }
            };
            
            await fs.writeFile(filepath, JSON.stringify(reportData, null, 2));
            
            console.log(`\n💾 COMPREHENSIVE REPORT SAVED:`);
            console.log(`   📁 Location: ${filepath}`);
            console.log(`   📊 Size: ${(JSON.stringify(reportData).length / 1024).toFixed(1)} KB`);
            console.log(`   🔗 Share with legal/compliance teams for review`);
            
        } catch (error) {
            console.error('❌ Failed to save report:', error.message);
        }
    }
}

// Main execution
async function runAnalysis() {
    if (process.argv.length < 3) {
        console.log('Usage: node professionalAnalysis.js <URL>');
        console.log('Example: node professionalAnalysis.js https://example.com');
        process.exit(1);
    }
    
    const url = process.argv[2];
    const analyzer = new SpectralAnalysisRunner();
    
    try {
        await analyzer.generateExecutiveReport(url);
    } catch (error) {
        console.error('Analysis failed:', error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = SpectralAnalysisRunner;

// Run if called directly
if (require.main === module) {
    runAnalysis();
}