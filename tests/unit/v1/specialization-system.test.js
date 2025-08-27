const RacingSpecialization = require('../../../src/models/specializations/RacingSpecialization');
const Sprinter = require('../../../src/models/specializations/Sprinter');
const Miler = require('../../../src/models/specializations/Miler');
const Stayer = require('../../../src/models/specializations/Stayer');
const SpecializationRegistry = require('../../../src/models/specializations/SpecializationRegistry');

describe('V1 Specialization System', () => {
    describe('Base Racing Specialization Class', () => {
        test('should create specialization with valid configuration', () => {
            const config = {
                optimalDistances: [1400, 1800],
                statWeighting: { speed: 0.4, stamina: 0.4, power: 0.2 },
                trainingBonus: { speed: 1.1, stamina: 1.1, power: 1.0 },
                description: 'Test specialization',
                strengths: ['Balanced approach']
            };
            
            const specialization = new RacingSpecialization('Test', config);
            
            expect(specialization.name).toBe('Test');
            expect(specialization.optimalDistances).toEqual([1400, 1800]);
            expect(specialization.statWeighting.speed).toBe(0.4);
        });
        
        test('should validate stat weighting sums to 1.0', () => {
            const invalidConfig = {
                optimalDistances: [1000, 1400],
                statWeighting: { speed: 0.6, stamina: 0.6, power: 0.2 }, // Sums to 1.4
                trainingBonus: { speed: 1.0, stamina: 1.0, power: 1.0 }
            };
            
            expect(() => new RacingSpecialization('Invalid', invalidConfig)).toThrow();
        });
        
        test('should calculate distance match factor correctly', () => {
            const specialization = new Sprinter();
            
            // Within optimal range (1000-1400m)
            expect(specialization.getDistanceMatchFactor(1200)).toBe(1.15);
            
            // Outside optimal range
            expect(specialization.getDistanceMatchFactor(1600)).toBeLessThan(1.0);
            expect(specialization.getDistanceMatchFactor(800)).toBeLessThan(1.0);
        });
        
        test('should calculate performance with distance factor', () => {
            const specialization = new Sprinter();
            const stats = { speed: 80, stamina: 60, power: 70 };
            
            // Sprint distance (optimal)
            const sprintPerformance = specialization.calculatePerformance(stats, 1200);
            
            // Long distance (suboptimal) 
            const longPerformance = specialization.calculatePerformance(stats, 2000);
            
            expect(sprintPerformance).toBeGreaterThan(longPerformance);
        });
        
        test('should provide training recommendations by career phase', () => {
            const specialization = new Sprinter();
            const stats = { speed: 50, stamina: 40, power: 45 };
            
            const earlyRecommendations = specialization.getTrainingRecommendations(stats, 5);
            const lateRecommendations = specialization.getTrainingRecommendations(stats, 20);
            
            expect(earlyRecommendations).toContain(expect.stringMatching(/foundation/i));
            expect(lateRecommendations).toContain(expect.stringMatching(/fine.tune/i));
        });
        
        test('should serialize to/from JSON', () => {
            const originalSpec = new Sprinter();
            const json = originalSpec.toJSON();
            const restoredSpec = RacingSpecialization.fromJSON(json);
            
            expect(restoredSpec.name).toBe(originalSpec.name);
            expect(restoredSpec.optimalDistances).toEqual(originalSpec.optimalDistances);
            expect(restoredSpec.statWeighting).toEqual(originalSpec.statWeighting);
        });
    });
    
    describe('Sprinter Specialization', () => {
        test('should have speed-focused characteristics', () => {
            const sprinter = new Sprinter();
            
            expect(sprinter.name).toBe('Sprinter');
            expect(sprinter.optimalDistances).toEqual([1000, 1400]);
            expect(sprinter.statWeighting.speed).toBe(0.50); // Highest weighting
            expect(sprinter.trainingBonus.speed).toBe(1.25); // Enhanced training
        });
        
        test('should excel in short races', () => {
            const sprinter = new Sprinter();
            
            expect(sprinter.getDistanceMatchFactor(1200)).toBe(1.15); // Optimal
            expect(sprinter.getDistanceMatchFactor(2000)).toBeLessThan(1.0); // Poor
        });
        
        test('should provide sprint-specific training recommendations', () => {
            const sprinter = new Sprinter();
            const stats = { speed: 40, stamina: 35, power: 38 };
            const recommendations = sprinter.getTrainingRecommendations(stats, 8);
            
            expect(recommendations.some(r => r.toLowerCase().includes('speed'))).toBe(true);
            expect(recommendations.some(r => r.toLowerCase().includes('power'))).toBe(true);
        });
        
        test('should provide sprint race strategy', () => {
            const sprinter = new Sprinter();
            const shortRace = { distance: 1200, surface: 'dirt' };
            const longRace = { distance: 2000, surface: 'turf' };
            
            const shortStrategy = sprinter.getRaceStrategy(shortRace);
            const longStrategy = sprinter.getRaceStrategy(longRace);
            
            expect(shortStrategy.confidence).toBe('VERY HIGH');
            expect(longStrategy.confidence).toBe('LOW');
        });
    });
    
    describe('Miler Specialization', () => {
        test('should have balanced characteristics', () => {
            const miler = new Miler();
            
            expect(miler.name).toBe('Miler');
            expect(miler.optimalDistances).toEqual([1400, 1800]);
            expect(miler.statWeighting.speed).toBe(0.40);
            expect(miler.statWeighting.stamina).toBe(0.35);
            expect(miler.statWeighting.power).toBe(0.25);
        });
        
        test('should excel in middle distances', () => {
            const miler = new Miler();
            
            expect(miler.getDistanceMatchFactor(1600)).toBe(1.15); // Optimal
            expect(miler.getDistanceMatchFactor(1200)).toBeLessThan(1.15); // Suboptimal
            expect(miler.getDistanceMatchFactor(2200)).toBeLessThan(1.15); // Suboptimal
        });
        
        test('should provide balanced training recommendations', () => {
            const miler = new Miler();
            const unbalancedStats = { speed: 60, stamina: 40, power: 45 };
            const recommendations = miler.getTrainingRecommendations(unbalancedStats, 12);
            
            expect(recommendations.some(r => r.toLowerCase().includes('balance'))).toBe(true);
        });
        
        test('should provide tactical racing advice', () => {
            const miler = new Miler();
            const raceInfo = { distance: 1600, surface: 'dirt' };
            const strategy = miler.getRaceStrategy(raceInfo);
            
            expect(strategy.confidence).toBe('VERY HIGH');
            expect(strategy.strategy).toContain('ANY STYLE');
        });
        
        test('should provide tactical insights', () => {
            const miler = new Miler();
            const insights = miler.getTacticalInsights();
            
            expect(insights).toHaveProperty('fastPace');
            expect(insights).toHaveProperty('slowPace');
            expect(insights).toHaveProperty('advice');
        });
    });
    
    describe('Stayer Specialization', () => {
        test('should have stamina-focused characteristics', () => {
            const stayer = new Stayer();
            
            expect(stayer.name).toBe('Stayer');
            expect(stayer.optimalDistances).toEqual([1800, 2400]);
            expect(stayer.statWeighting.stamina).toBe(0.50); // Highest weighting
            expect(stayer.trainingBonus.stamina).toBe(1.30); // Exceptional training
        });
        
        test('should excel in long races', () => {
            const stayer = new Stayer();
            
            expect(stayer.getDistanceMatchFactor(2000)).toBe(1.15); // Optimal
            expect(stayer.getDistanceMatchFactor(1200)).toBeLessThan(1.0); // Poor
        });
        
        test('should provide endurance training recommendations', () => {
            const stayer = new Stayer();
            const stats = { speed: 45, stamina: 40, power: 35 };
            const recommendations = stayer.getTrainingRecommendations(stats, 8);
            
            expect(recommendations.some(r => r.toLowerCase().includes('stamina'))).toBe(true);
        });
        
        test('should provide endurance race strategy', () => {
            const stayer = new Stayer();
            const shortRace = { distance: 1200, surface: 'turf' };
            const longRace = { distance: 2200, surface: 'dirt' };
            
            const shortStrategy = stayer.getRaceStrategy(shortRace);
            const longStrategy = stayer.getRaceStrategy(longRace);
            
            expect(shortStrategy.confidence).toBe('LOW');
            expect(longStrategy.confidence).toBe('VERY HIGH');
        });
        
        test('should provide energy management strategies', () => {
            const stayer = new Stayer();
            const energyManagement = stayer.getEnergyManagement();
            
            expect(energyManagement).toHaveProperty('earlyRace');
            expect(energyManagement).toHaveProperty('midRace');
            expect(energyManagement).toHaveProperty('lateRace');
        });
    });
    
    describe('Specialization Registry', () => {
        test('should provide all specialization instances', () => {
            const specNames = SpecializationRegistry.getSpecializationNames();
            expect(specNames).toContain('Sprinter');
            expect(specNames).toContain('Miler');
            expect(specNames).toContain('Stayer');
        });
        
        test('should get specialization by name', () => {
            const sprinter = SpecializationRegistry.getSpecialization('Sprinter');
            expect(sprinter.name).toBe('Sprinter');
            
            const miler = SpecializationRegistry.getSpecialization('Miler');
            expect(miler.name).toBe('Miler');
        });
        
        test('should return default specialization for invalid name', () => {
            const unknown = SpecializationRegistry.getSpecialization('NonExistent');
            expect(unknown.name).toBe('Miler'); // Default
        });
        
        test('should validate specialization names', () => {
            expect(SpecializationRegistry.isValidSpecialization('Sprinter')).toBe(true);
            expect(SpecializationRegistry.isValidSpecialization('NonExistent')).toBe(false);
        });
        
        test('should provide specialization recommendations for races', () => {
            const races = [
                { distance: 1200 }, // Sprint
                { distance: 1600 }, // Mile
                { distance: 2000 }  // Long
            ];
            
            const recommendations = SpecializationRegistry.getSpecializationRecommendations(races);
            expect(recommendations).toHaveLength(3);
            
            // Miler should score well for this balanced schedule
            const milerRec = recommendations.find(r => r.name === 'Miler');
            expect(milerRec.matchScore).toBeGreaterThan(1.0);
        });
        
        test('should recommend specialization based on preferences', () => {
            const sprintPreference = { distance: 'sprint' };
            const recommendation = SpecializationRegistry.getRecommendedSpecialization(sprintPreference);
            expect(recommendation.specializationName).toBe('Sprinter');
            
            const longPreference = { distance: 'long' };
            const longRecommendation = SpecializationRegistry.getRecommendedSpecialization(longPreference);
            expect(longRecommendation.specializationName).toBe('Stayer');
        });
        
        test('should analyze training effectiveness with breed combination', () => {
            const breed = { 
                name: 'Arabian',
                getGrowthRate: (stat) => stat === 'stamina' ? 1.25 : 1.0
            };
            
            const analysis = SpecializationRegistry.getTrainingEffectivenessAnalysis('Stayer', breed);
            
            expect(analysis.statEffectiveness.stamina.multiplier).toBeGreaterThan(1.5); // 1.30 * 1.25
            expect(analysis.statEffectiveness.stamina.rating).toBe('Exceptional');
        });
    });
    
    describe('Specialization Integration Tests', () => {
        test('should have different optimal distances that cover racing spectrum', () => {
            const sprinter = new Sprinter();
            const miler = new Miler();
            const stayer = new Stayer();
            
            // Sprinter optimal range
            expect(sprinter.optimalDistances[1]).toBeLessThanOrEqual(1400);
            
            // Miler optimal range should overlap/connect with both
            expect(miler.optimalDistances[0]).toBeLessThanOrEqual(sprinter.optimalDistances[1]);
            expect(miler.optimalDistances[1]).toBeLessThanOrEqual(stayer.optimalDistances[0]);
            
            // Stayer optimal range
            expect(stayer.optimalDistances[0]).toBeGreaterThanOrEqual(1800);
        });
        
        test('should have complementary stat weightings', () => {
            const specs = [new Sprinter(), new Miler(), new Stayer()];
            
            specs.forEach(spec => {
                const totalWeight = Object.values(spec.statWeighting)
                    .reduce((sum, weight) => sum + weight, 0);
                expect(Math.abs(totalWeight - 1.0)).toBeLessThan(0.01);
            });
        });
        
        test('should provide different training bonuses that reflect specialization', () => {
            const sprinter = new Sprinter();
            const stayer = new Stayer();
            
            // Sprinter should be better at speed training
            expect(sprinter.getTrainingBonus('speed')).toBeGreaterThan(stayer.getTrainingBonus('speed'));
            
            // Stayer should be better at stamina training
            expect(stayer.getTrainingBonus('stamina')).toBeGreaterThan(sprinter.getTrainingBonus('stamina'));
        });
        
        test('should provide consistent weak stat identification', () => {
            const miler = new Miler();
            
            // Balanced stats should have no weak stats
            const balancedStats = { speed: 60, stamina: 60, power: 60 };
            const noWeakStats = miler.getWeakStats(balancedStats);
            expect(noWeakStats).toHaveLength(0);
            
            // Imbalanced stats should identify weak areas
            const imbalancedStats = { speed: 70, stamina: 40, power: 60 };
            const weakStats = miler.getWeakStats(imbalancedStats);
            expect(weakStats).toContain('stamina');
        });
        
        test('should handle edge cases in distance matching', () => {
            const specializations = [new Sprinter(), new Miler(), new Stayer()];
            
            // Test boundary distances
            const boundaryDistances = [1000, 1400, 1800, 2400];
            
            specializations.forEach(spec => {
                boundaryDistances.forEach(distance => {
                    const factor = spec.getDistanceMatchFactor(distance);
                    expect(factor).toBeGreaterThan(0);
                    expect(factor).toBeLessThan(2.0);
                });
            });
        });
    });
});