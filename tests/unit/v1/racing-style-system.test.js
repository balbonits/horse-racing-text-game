const RacingStyle = require('../../../src/models/styles/RacingStyle');
const FrontRunner = require('../../../src/models/styles/FrontRunner');
const Stalker = require('../../../src/models/styles/Stalker');
const Closer = require('../../../src/models/styles/Closer');
const RacingStyleRegistry = require('../../../src/models/styles/RacingStyleRegistry');

describe('V1 Racing Style System', () => {
    describe('Base Racing Style Class', () => {
        test('should create racing style with valid configuration', () => {
            const config = {
                energyStrategy: { early: 0.4, middle: 0.3, late: 0.3 },
                positionPreference: { early: [3, 5], middle: [2, 4], late: [1, 3] },
                paceProfile: { fast: 1.1, moderate: 1.0, slow: 0.9 },
                description: 'Test racing style',
                strengths: ['Tactical flexibility']
            };
            
            const style = new RacingStyle('Test Style', config);
            
            expect(style.name).toBe('Test Style');
            expect(style.energyStrategy.early).toBe(0.4);
            expect(style.positionPreference.early).toEqual([3, 5]);
        });
        
        test('should validate energy strategy sums to 1.0', () => {
            const invalidConfig = {
                energyStrategy: { early: 0.5, middle: 0.5, late: 0.5 }, // Sums to 1.5
                positionPreference: { early: [1, 3], middle: [1, 3], late: [1, 3] },
                paceProfile: { fast: 1.0, moderate: 1.0, slow: 1.0 }
            };
            
            expect(() => new RacingStyle('Invalid', invalidConfig)).toThrow();
        });
        
        test('should calculate energy expenditure by phase', () => {
            const style = new FrontRunner();
            const totalEnergy = 100;
            
            const earlyEnergy = style.calculateEnergyExpenditure('early', totalEnergy);
            const middleEnergy = style.calculateEnergyExpenditure('middle', totalEnergy);
            const lateEnergy = style.calculateEnergyExpenditure('late', totalEnergy);
            
            expect(earlyEnergy).toBe(50); // Front runners use 50% early
            expect(middleEnergy).toBe(30);
            expect(lateEnergy).toBe(20);
        });
        
        test('should get preferred position ranges', () => {
            const style = new Stalker();
            const earlyPosition = style.getPreferredPosition('early');
            const latePosition = style.getPreferredPosition('late');
            
            expect(earlyPosition).toEqual([3, 6]); // Stalkers start mid-pack
            expect(latePosition).toEqual([1, 3]);  // Move up late
        });
        
        test('should calculate pace effectiveness', () => {
            const frontRunner = new FrontRunner();
            
            expect(frontRunner.getPaceEffectiveness('slow')).toBe(1.15);  // Excellent in slow pace
            expect(frontRunner.getPaceEffectiveness('fast')).toBe(0.90); // Struggles in fast pace
        });
        
        test('should calculate positioning bonus', () => {
            const stalker = new Stalker();
            const fieldSize = 10;
            
            // Perfect position (4th in early phase)
            const perfectBonus = stalker.getPositioningBonus('early', 4, fieldSize);
            expect(perfectBonus).toBe(1.08);
            
            // Suboptimal position (1st in early phase - too aggressive for stalker)
            const suboptimalBonus = stalker.getPositioningBonus('early', 1, fieldSize);
            expect(suboptimalBonus).toBeLessThan(1.0);
        });
        
        test('should provide tactical recommendations', () => {
            const style = new Closer();
            const raceInfo = { distance: 2000, pace: 'fast', fieldSize: 12 };
            const horseStats = { speed: 70, stamina: 80, power: 65 };
            
            const recommendations = style.getTacticalRecommendations(raceInfo, horseStats);
            
            expect(recommendations).toHaveProperty('style');
            expect(recommendations).toHaveProperty('earlyStrategy');
            expect(recommendations).toHaveProperty('paceAdvice');
        });
    });
    
    describe('Front Runner Racing Style', () => {
        test('should have aggressive early energy strategy', () => {
            const frontRunner = new FrontRunner();
            
            expect(frontRunner.name).toBe('Front Runner');
            expect(frontRunner.energyStrategy.early).toBe(0.50); // Aggressive early
            expect(frontRunner.positionPreference.early).toEqual([1, 3]); // Lead from front
        });
        
        test('should excel in slow pace scenarios', () => {
            const frontRunner = new FrontRunner();
            
            expect(frontRunner.getPaceEffectiveness('slow')).toBe(1.15);
            expect(frontRunner.getPaceEffectiveness('fast')).toBe(0.90);
        });
        
        test('should provide front-running tactical advice', () => {
            const frontRunner = new FrontRunner();
            const raceInfo = { distance: 1200, pace: 'slow', fieldSize: 8 };
            const horseStats = { speed: 85, stamina: 70, power: 75 };
            
            const advice = frontRunner.getTacticalRecommendations(raceInfo, horseStats);
            
            expect(advice.gateStrategy).toContain('Break alertly');
            expect(advice.paceControl).toContain('IDEAL CONDITIONS');
        });
        
        test('should have excellent synergy with Sprinter specialization', () => {
            const frontRunner = new FrontRunner();
            const sprinterSynergy = frontRunner.calculateSynergyBonus('Sprinter');
            const stayerSynergy = frontRunner.calculateSynergyBonus('Stayer');
            
            expect(sprinterSynergy).toBe(1.12);
            expect(stayerSynergy).toBe(0.96);
        });
        
        test('should provide energy warnings for longer distances', () => {
            const frontRunner = new FrontRunner();
            const longDistance = 2000;
            const lowStaminaStats = { speed: 80, stamina: 50, power: 70 };
            
            const warning = frontRunner.getEnergyWarning(longDistance, lowStaminaStats);
            expect(warning).toContain('LONG DISTANCE');
            expect(warning).toContain('risk');
        });
    });
    
    describe('Stalker Racing Style', () => {
        test('should have balanced energy distribution', () => {
            const stalker = new Stalker();
            
            expect(stalker.name).toBe('Stalker');
            expect(stalker.energyStrategy.early).toBe(0.35);
            expect(stalker.energyStrategy.middle).toBe(0.40); // Key phase
            expect(stalker.energyStrategy.late).toBe(0.25);
        });
        
        test('should benefit from fast pace scenarios', () => {
            const stalker = new Stalker();
            
            expect(stalker.getPaceEffectiveness('fast')).toBe(1.08);
            expect(stalker.getPaceEffectiveness('slow')).toBe(0.98);
        });
        
        test('should provide tactical positioning advice', () => {
            const stalker = new Stalker();
            const raceInfo = { distance: 1600, pace: 'fast', fieldSize: 10 };
            const horseStats = { speed: 70, stamina: 75, power: 68 };
            
            const advice = stalker.getTacticalRecommendations(raceInfo, horseStats);
            
            expect(advice.positioningStrategy).toContain('4th-6th position');
            expect(advice.tacticalOpportunities).toContain('Fast pace scenario');
        });
        
        test('should have excellent synergy with Miler specialization', () => {
            const stalker = new Stalker();
            const milerSynergy = stalker.calculateSynergyBonus('Miler');
            const sprinterSynergy = stalker.calculateSynergyBonus('Sprinter');
            
            expect(milerSynergy).toBe(1.12);
            expect(sprinterSynergy).toBe(1.08);
        });
        
        test('should provide tactical insights', () => {
            const stalker = new Stalker();
            const insights = stalker.getTacticalInsights();
            
            expect(insights).toHaveProperty('raceReading');
            expect(insights).toHaveProperty('positioning');
            expect(insights).toHaveProperty('energyManagement');
            expect(insights).toHaveProperty('finishingTactics');
        });
    });
    
    describe('Closer Racing Style', () => {
        test('should have late-heavy energy strategy', () => {
            const closer = new Closer();
            
            expect(closer.name).toBe('Closer');
            expect(closer.energyStrategy.early).toBe(0.25); // Conservative early
            expect(closer.energyStrategy.late).toBe(0.45);  // Explosive late
            expect(closer.positionPreference.early).toEqual([6, 10]); // Back of pack
        });
        
        test('should excel in fast pace scenarios', () => {
            const closer = new Closer();
            
            expect(closer.getPaceEffectiveness('fast')).toBe(1.15);
            expect(closer.getPaceEffectiveness('slow')).toBe(0.90);
        });
        
        test('should provide patient racing advice', () => {
            const closer = new Closer();
            const raceInfo = { distance: 2000, pace: 'fast', fieldSize: 12 };
            const horseStats = { speed: 65, stamina: 85, power: 70 };
            
            const advice = closer.getTacticalRecommendations(raceInfo, horseStats);
            
            expect(advice.patienceStrategy).toContain('IDEAL CONDITIONS');
            expect(advice.finishingPlan).toContain('IDEAL DISTANCE');
        });
        
        test('should have excellent synergy with Stayer specialization', () => {
            const closer = new Closer();
            const stayerSynergy = closer.calculateSynergyBonus('Stayer');
            const sprinterSynergy = closer.calculateSynergyBonus('Sprinter');
            
            expect(stayerSynergy).toBe(1.15);
            expect(sprinterSynergy).toBe(0.94);
        });
        
        test('should calculate late-race kick multiplier', () => {
            const closer = new Closer();
            const lateRaceContext = {
                energyRemaining: 0.8,
                position: 7,
                phase: 'late',
                distance: 2000
            };
            
            const kickMultiplier = closer.getLateRaceKick(lateRaceContext);
            expect(kickMultiplier).toBeGreaterThan(1.5); // Strong kick from behind
        });
        
        test('should provide patience strategies', () => {
            const closer = new Closer();
            const strategies = closer.getPatienceStrategies();
            
            expect(strategies).toHaveProperty('earlyRace');
            expect(strategies).toHaveProperty('midRace'); 
            expect(strategies).toHaveProperty('lateRace');
            expect(strategies).toHaveProperty('raceSelection');
        });
    });
    
    describe('Racing Style Registry', () => {
        test('should provide all racing style instances', () => {
            const styleNames = RacingStyleRegistry.getStyleNames();
            expect(styleNames).toContain('Front Runner');
            expect(styleNames).toContain('Stalker');
            expect(styleNames).toContain('Closer');
        });
        
        test('should get style by name', () => {
            const frontRunner = RacingStyleRegistry.getStyle('Front Runner');
            expect(frontRunner.name).toBe('Front Runner');
            
            const stalker = RacingStyleRegistry.getStyle('Stalker');
            expect(stalker.name).toBe('Stalker');
        });
        
        test('should return default style for invalid name', () => {
            const unknown = RacingStyleRegistry.getStyle('NonExistent');
            expect(unknown.name).toBe('Stalker'); // Default
        });
        
        test('should validate style names', () => {
            expect(RacingStyleRegistry.isValidStyle('Front Runner')).toBe(true);
            expect(RacingStyleRegistry.isValidStyle('NonExistent')).toBe(false);
        });
        
        test('should provide style recommendations for race conditions', () => {
            const raceConditions = {
                pace: 'fast',
                averageDistance: 1600,
                averageFieldSize: 10
            };
            const horseAttributes = {
                specialization: 'Miler',
                breed: { name: 'Thoroughbred' }
            };
            
            const recommendations = RacingStyleRegistry.getStyleRecommendations(raceConditions, horseAttributes);
            expect(recommendations).toHaveLength(3);
            
            // Stalker should score well for Miler + fast pace
            const stalkerRec = recommendations.find(r => r.name === 'Stalker');
            expect(stalkerRec.suitabilityScore).toBeGreaterThan(1.0);
        });
        
        test('should recommend style based on preferences', () => {
            const aggressivePreference = { playstyle: 'aggressive' };
            const recommendation = RacingStyleRegistry.getRecommendedStyle(aggressivePreference);
            expect(recommendation.styleName).toBe('Front Runner');
            
            const patientPreference = { playstyle: 'patient' };
            const patientRecommendation = RacingStyleRegistry.getRecommendedStyle(patientPreference);
            expect(patientRecommendation.styleName).toBe('Closer');
        });
        
        test('should provide comprehensive style analysis', () => {
            const horseAttributes = {
                specialization: 'Miler',
                breed: { name: 'Thoroughbred' },
                stats: { speed: 70, stamina: 75, power: 65 }
            };
            const upcomingRaces = [
                { distance: 1400, pace: 'moderate' },
                { distance: 1600, pace: 'fast' }
            ];
            
            const analysis = RacingStyleRegistry.getStyleAnalysis(horseAttributes, upcomingRaces);
            
            expect(analysis).toHaveProperty('styleRankings');
            expect(analysis).toHaveProperty('raceByRaceRecommendations');
            expect(analysis.styleRankings).toHaveLength(3);
            expect(analysis.raceByRaceRecommendations).toHaveLength(2);
        });
    });
    
    describe('Racing Style Integration Tests', () => {
        test('should have different energy strategies that sum to 1.0', () => {
            const styles = [new FrontRunner(), new Stalker(), new Closer()];
            
            styles.forEach(style => {
                const totalEnergy = Object.values(style.energyStrategy)
                    .reduce((sum, energy) => sum + energy, 0);
                expect(Math.abs(totalEnergy - 1.0)).toBeLessThan(0.01);
            });
        });
        
        test('should have complementary position preferences', () => {
            const frontRunner = new FrontRunner();
            const stalker = new Stalker();
            const closer = new Closer();
            
            // Front runners prefer early positions
            expect(frontRunner.positionPreference.early[1]).toBeLessThan(4);
            
            // Stalkers prefer middle positions  
            expect(stalker.positionPreference.early[0]).toBeGreaterThan(2);
            expect(stalker.positionPreference.early[1]).toBeLessThan(7);
            
            // Closers prefer back positions
            expect(closer.positionPreference.early[0]).toBeGreaterThan(5);
        });
        
        test('should have different pace preferences that complement each other', () => {
            const frontRunner = new FrontRunner();
            const closer = new Closer();
            
            // Front runners prefer slow pace (can control it)
            expect(frontRunner.getPaceEffectiveness('slow')).toBeGreaterThan(1.0);
            expect(frontRunner.getPaceEffectiveness('fast')).toBeLessThan(1.0);
            
            // Closers prefer fast pace (leaders tire)
            expect(closer.getPaceEffectiveness('fast')).toBeGreaterThan(1.0);
            expect(closer.getPaceEffectiveness('slow')).toBeLessThan(1.0);
        });
        
        test('should provide different specialization synergies', () => {
            const styles = [new FrontRunner(), new Stalker(), new Closer()];
            const specializations = ['Sprinter', 'Miler', 'Stayer'];
            
            styles.forEach(style => {
                specializations.forEach(spec => {
                    const synergy = style.calculateSynergyBonus(spec);
                    expect(synergy).toBeGreaterThan(0.9);
                    expect(synergy).toBeLessThan(1.2);
                });
            });
        });
        
        test('should handle edge cases in energy calculation', () => {
            const styles = [new FrontRunner(), new Stalker(), new Closer()];
            const phases = ['early', 'middle', 'late'];
            
            styles.forEach(style => {
                phases.forEach(phase => {
                    const energy = style.calculateEnergyExpenditure(phase, 100);
                    expect(energy).toBeGreaterThan(0);
                    expect(energy).toBeLessThanOrEqual(100);
                });
            });
        });
        
        test('should provide consistent tactical recommendations', () => {
            const styles = [new FrontRunner(), new Stalker(), new Closer()];
            const raceInfo = { distance: 1600, pace: 'moderate', fieldSize: 10 };
            const horseStats = { speed: 70, stamina: 70, power: 70 };
            
            styles.forEach(style => {
                const recommendations = style.getTacticalRecommendations(raceInfo, horseStats);
                
                expect(recommendations).toHaveProperty('style');
                expect(recommendations).toHaveProperty('keyTactics');
                expect(recommendations.keyTactics).toBeInstanceOf(Array);
                expect(recommendations.keyTactics.length).toBeGreaterThan(0);
            });
        });
    });
});