const Breed = require('../../../src/models/breeds/Breed');
const Thoroughbred = require('../../../src/models/breeds/Thoroughbred');
const Arabian = require('../../../src/models/breeds/Arabian');
const QuarterHorse = require('../../../src/models/breeds/QuarterHorse');
const BreedRegistry = require('../../../src/models/breeds/BreedRegistry');

describe('V1 Breed System', () => {
    describe('Base Breed Class', () => {
        test('should create breed with valid configuration', () => {
            const config = {
                statCaps: { speed: 100, stamina: 100, power: 100 },
                growthRates: { speed: 1.0, stamina: 1.0, power: 1.0 },
                surfacePreferences: { turf: 1.0, dirt: 1.0 },
                description: 'Test breed',
                strengths: ['Balanced']
            };
            
            const breed = new Breed('Test', config);
            
            expect(breed.name).toBe('Test');
            expect(breed.statCaps.speed).toBe(100);
            expect(breed.growthRates.speed).toBe(1.0);
            expect(breed.surfacePreferences.turf).toBe(1.0);
        });
        
        test('should validate configuration on creation', () => {
            const invalidConfig = {
                statCaps: { speed: -10, stamina: 100, power: 100 },
                growthRates: { speed: 1.0, stamina: 1.0, power: 1.0 },
                surfacePreferences: { turf: 1.0, dirt: 1.0 }
            };
            
            expect(() => new Breed('Invalid', invalidConfig)).toThrow();
        });
        
        test('should get stat caps correctly', () => {
            const breed = new Thoroughbred();
            expect(breed.getStatCap('speed')).toBe(100);
            expect(breed.getStatCap('stamina')).toBe(100);
            expect(breed.getStatCap('power')).toBe(100);
        });
        
        test('should apply growth rates to training gains', () => {
            const breed = new Thoroughbred();
            const baseGain = 10;
            const modifiedGain = breed.applyGrowthRate('speed', baseGain);
            expect(modifiedGain).toBe(10); // Thoroughbred has 1.0 growth rate
        });
        
        test('should enforce stat caps', () => {
            const breed = new Thoroughbred();
            const stats = { speed: 105, stamina: 95, power: 90 };
            const cappedStats = breed.enforceStatCaps(stats);
            
            expect(cappedStats.speed).toBe(100); // Capped at breed limit
            expect(cappedStats.stamina).toBe(95); // Unchanged
            expect(cappedStats.power).toBe(90);   // Unchanged
        });
        
        test('should check if stat is at cap', () => {
            const breed = new Thoroughbred();
            expect(breed.isStatAtCap('speed', 100)).toBe(true);
            expect(breed.isStatAtCap('speed', 99)).toBe(false);
        });
        
        test('should serialize to/from JSON', () => {
            const originalBreed = new Thoroughbred();
            const json = originalBreed.toJSON();
            const restoredBreed = Breed.fromJSON(json);
            
            expect(restoredBreed.name).toBe(originalBreed.name);
            expect(restoredBreed.statCaps).toEqual(originalBreed.statCaps);
            expect(restoredBreed.growthRates).toEqual(originalBreed.growthRates);
        });
    });
    
    describe('Thoroughbred Breed', () => {
        test('should have balanced characteristics', () => {
            const thoroughbred = new Thoroughbred();
            
            expect(thoroughbred.name).toBe('Thoroughbred');
            expect(thoroughbred.statCaps).toEqual({ speed: 100, stamina: 100, power: 100 });
            expect(thoroughbred.growthRates).toEqual({ speed: 1.0, stamina: 1.0, power: 1.0 });
            expect(thoroughbred.surfacePreferences).toEqual({ turf: 1.0, dirt: 1.0 });
        });
        
        test('should provide training recommendations', () => {
            const thoroughbred = new Thoroughbred();
            const recommendations = thoroughbred.getTrainingRecommendations();
            
            expect(recommendations).toHaveProperty('earlyCareer');
            expect(recommendations).toHaveProperty('midCareer');
            expect(recommendations).toHaveProperty('lateCareer');
        });
        
        test('should provide race strategy recommendations', () => {
            const thoroughbred = new Thoroughbred();
            const raceInfo = { distance: 1600, surface: 'dirt' };
            const strategy = thoroughbred.getRaceStrategy(raceInfo);
            
            expect(strategy).toHaveProperty('primary');
            expect(strategy).toHaveProperty('recommended');
        });
    });
    
    describe('Arabian Breed', () => {
        test('should have stamina specialization', () => {
            const arabian = new Arabian();
            
            expect(arabian.name).toBe('Arabian');
            expect(arabian.statCaps.stamina).toBe(110); // Higher than base
            expect(arabian.statCaps.speed).toBe(95);    // Lower than base
            expect(arabian.growthRates.stamina).toBe(1.25); // Enhanced growth
            expect(arabian.surfacePreferences.turf).toBe(1.08); // Turf preference
        });
        
        test('should provide stamina training bonus', () => {
            const arabian = new Arabian();
            const baseGain = 10;
            const staminaGain = arabian.applyGrowthRate('stamina', baseGain);
            const speedGain = arabian.applyGrowthRate('speed', baseGain);
            
            expect(staminaGain).toBe(13); // 10 * 1.25 = 12.5, rounded to 13
            expect(speedGain).toBe(10);   // 10 * 0.95 = 9.5, rounded to 10
        });
        
        test('should have turf surface advantage', () => {
            const arabian = new Arabian();
            expect(arabian.getSurfacePreference('turf')).toBe(1.08);
            expect(arabian.getSurfacePreference('dirt')).toBe(0.96);
        });
        
        test('should provide endurance achievements', () => {
            const arabian = new Arabian();
            const achievements = arabian.getPossibleAchievements();
            
            expect(achievements.some(a => a.name.includes('Marathon'))).toBe(true);
            expect(achievements.some(a => a.name.includes('Stamina'))).toBe(true);
        });
    });
    
    describe('Quarter Horse Breed', () => {
        test('should have speed specialization', () => {
            const quarterHorse = new QuarterHorse();
            
            expect(quarterHorse.name).toBe('Quarter Horse');
            expect(quarterHorse.statCaps.speed).toBe(110);    // Higher than base
            expect(quarterHorse.statCaps.stamina).toBe(90);   // Lower than base
            expect(quarterHorse.growthRates.speed).toBe(1.25); // Enhanced growth
            expect(quarterHorse.surfacePreferences.dirt).toBe(1.08); // Dirt preference
        });
        
        test('should provide speed training bonus', () => {
            const quarterHorse = new QuarterHorse();
            const baseGain = 10;
            const speedGain = quarterHorse.applyGrowthRate('speed', baseGain);
            const staminaGain = quarterHorse.applyGrowthRate('stamina', baseGain);
            
            expect(speedGain).toBe(13);   // 10 * 1.25 = 12.5, rounded to 13
            expect(staminaGain).toBe(9);  // 10 * 0.85 = 8.5, rounded to 9
        });
        
        test('should have dirt surface advantage', () => {
            const quarterHorse = new QuarterHorse();
            expect(quarterHorse.getSurfacePreference('dirt')).toBe(1.08);
            expect(quarterHorse.getSurfacePreference('turf')).toBe(0.95);
        });
        
        test('should provide sprint achievements', () => {
            const quarterHorse = new QuarterHorse();
            const achievements = quarterHorse.getPossibleAchievements();
            
            expect(achievements.some(a => a.name.includes('Sprint'))).toBe(true);
            expect(achievements.some(a => a.name.includes('Speed'))).toBe(true);
        });
    });
    
    describe('Breed Registry', () => {
        test('should provide all breed instances', () => {
            const breedNames = BreedRegistry.getBreedNames();
            expect(breedNames).toContain('Thoroughbred');
            expect(breedNames).toContain('Arabian');
            expect(breedNames).toContain('Quarter Horse');
        });
        
        test('should get breed by name', () => {
            const thoroughbred = BreedRegistry.getBreed('Thoroughbred');
            expect(thoroughbred.name).toBe('Thoroughbred');
            
            const arabian = BreedRegistry.getBreed('Arabian');
            expect(arabian.name).toBe('Arabian');
        });
        
        test('should return default breed for invalid name', () => {
            const unknownBreed = BreedRegistry.getBreed('NonExistent');
            expect(unknownBreed.name).toBe('Thoroughbred'); // Default
        });
        
        test('should validate breed names', () => {
            expect(BreedRegistry.isValidBreed('Thoroughbred')).toBe(true);
            expect(BreedRegistry.isValidBreed('Arabian')).toBe(true);
            expect(BreedRegistry.isValidBreed('NonExistent')).toBe(false);
        });
        
        test('should provide breed comparison data', () => {
            const comparison = BreedRegistry.getBreedComparison();
            
            expect(comparison).toHaveProperty('breeds');
            expect(comparison).toHaveProperty('statComparison');
            expect(comparison).toHaveProperty('surfaceComparison');
            expect(comparison.breeds).toHaveLength(3);
        });
        
        test('should recommend breed based on preferences', () => {
            const speedPreference = { playstyle: 'speed' };
            const recommendation = BreedRegistry.getRecommendedBreed(speedPreference);
            expect(recommendation.breedName).toBe('Quarter Horse');
            
            const endurancePreference = { playstyle: 'endurance' };
            const enduranceRecommendation = BreedRegistry.getRecommendedBreed(endurancePreference);
            expect(enduranceRecommendation.breedName).toBe('Arabian');
        });
        
        test('should create breed from save data', () => {
            // String format (legacy)
            const breedFromString = BreedRegistry.createFromSaveData('Arabian');
            expect(breedFromString.name).toBe('Arabian');
            
            // Object format (modern)
            const breedFromObject = BreedRegistry.createFromSaveData({ name: 'Quarter Horse' });
            expect(breedFromObject.name).toBe('Quarter Horse');
            
            // Invalid data should return default
            const breedFromInvalid = BreedRegistry.createFromSaveData(null);
            expect(breedFromInvalid.name).toBe('Thoroughbred');
        });
    });
    
    describe('Breed Integration Tests', () => {
        test('should calculate combined training effectiveness', () => {
            const arabian = new Arabian();
            const quarterHorse = new QuarterHorse();
            
            // Arabian should be better at stamina training
            const arabianStamina = arabian.applyGrowthRate('stamina', 10);
            const quarterHorseStamina = quarterHorse.applyGrowthRate('stamina', 10);
            expect(arabianStamina).toBeGreaterThan(quarterHorseStamina);
            
            // Quarter Horse should be better at speed training
            const arabianSpeed = arabian.applyGrowthRate('speed', 10);
            const quarterHorseSpeed = quarterHorse.applyGrowthRate('speed', 10);
            expect(quarterHorseSpeed).toBeGreaterThan(arabianSpeed);
        });
        
        test('should handle edge cases in stat capping', () => {
            const arabian = new Arabian();
            
            // Test stats at exactly the cap
            const exactCapStats = { speed: 95, stamina: 110, power: 95 };
            const cappedExact = arabian.enforceStatCaps(exactCapStats);
            expect(cappedExact).toEqual(exactCapStats);
            
            // Test stats exceeding caps
            const exceedingStats = { speed: 120, stamina: 130, power: 100 };
            const cappedExceeding = arabian.enforceStatCaps(exceedingStats);
            expect(cappedExceeding.speed).toBe(95);
            expect(cappedExceeding.stamina).toBe(110);
            expect(cappedExceeding.power).toBe(95);
        });
        
        test('should provide consistent surface preferences', () => {
            const breeds = [
                new Thoroughbred(),
                new Arabian(), 
                new QuarterHorse()
            ];
            
            breeds.forEach(breed => {
                const turfPref = breed.getSurfacePreference('turf');
                const dirtPref = breed.getSurfacePreference('dirt');
                
                expect(turfPref).toBeGreaterThan(0);
                expect(dirtPref).toBeGreaterThan(0);
                expect(typeof turfPref).toBe('number');
                expect(typeof dirtPref).toBe('number');
            });
        });
    });
});