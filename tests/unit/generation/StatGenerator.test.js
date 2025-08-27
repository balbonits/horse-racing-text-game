/**
 * Tests for StatGenerator - TDD approach for stat randomization system
 * 
 * Test-driven development for the stat generation system that will be used
 * throughout character creation, breeding, and legacy systems.
 * 
 * Requirements to test:
 * 1. Base stat generation with realistic ranges (20-80 for foundation horses)
 * 2. Breed-based stat modifiers and tendencies
 * 3. Parent inheritance for breeding (average + variation)
 * 4. Legacy bonuses from previous careers
 * 5. Growth potential assignment (S/A/B/C/D ratings)
 * 6. Stat distribution balance (no overpowered horses)
 * 7. Reproducible generation with seeds for testing
 */

const StatGenerator = require('../../../src/models/generation/StatGenerator');

describe('StatGenerator - TDD Approach', () => {
    let statGenerator;

    beforeEach(() => {
        statGenerator = new StatGenerator();
    });

    describe('Base Stat Generation', () => {
        test('should generate stats within valid ranges', () => {
            const stats = statGenerator.generateBaseStats();
            
            expect(stats.speed).toBeGreaterThanOrEqual(20);
            expect(stats.speed).toBeLessThanOrEqual(80);
            expect(stats.stamina).toBeGreaterThanOrEqual(20);
            expect(stats.stamina).toBeLessThanOrEqual(80);
            expect(stats.power).toBeGreaterThanOrEqual(20);
            expect(stats.power).toBeLessThanOrEqual(80);
        });

        test('should generate different stats on multiple calls', () => {
            const stats1 = statGenerator.generateBaseStats();
            const stats2 = statGenerator.generateBaseStats();
            
            // Should have variation (not identical)
            const identical = stats1.speed === stats2.speed && 
                            stats1.stamina === stats2.stamina && 
                            stats1.power === stats2.power;
            expect(identical).toBe(false);
        });

        test('should generate balanced total stats', () => {
            const generations = [];
            for (let i = 0; i < 50; i++) {
                const stats = statGenerator.generateBaseStats();
                const total = stats.speed + stats.stamina + stats.power;
                generations.push(total);
            }
            
            const average = generations.reduce((a, b) => a + b) / generations.length;
            // Average should be around 150 (50 * 3) with reasonable variance
            expect(average).toBeGreaterThanOrEqual(120);
            expect(average).toBeLessThanOrEqual(180);
        });

        test('should support reproducible generation with seed', () => {
            const seed = 12345;
            const stats1 = statGenerator.generateBaseStatsWithSeed(seed);
            const stats2 = statGenerator.generateBaseStatsWithSeed(seed);
            
            expect(stats1).toEqual(stats2);
        });
    });

    describe('Breed-Based Generation', () => {
        test('should apply breed modifiers correctly', () => {
            const thoroughbredStats = statGenerator.generateStatsForBreed('thoroughbred');
            const arabianStats = statGenerator.generateStatsForBreed('arabian');
            
            // Thoroughbreds should tend toward speed/power
            // Arabians should tend toward stamina
            expect(thoroughbredStats.speed).toBeGreaterThanOrEqual(25);
            expect(arabianStats.stamina).toBeGreaterThanOrEqual(25);
        });

        test('should maintain breed characteristic distributions', () => {
            const generations = [];
            for (let i = 0; i < 20; i++) {
                generations.push(statGenerator.generateStatsForBreed('thoroughbred'));
            }
            
            const avgSpeed = generations.reduce((sum, s) => sum + s.speed, 0) / generations.length;
            const avgStamina = generations.reduce((sum, s) => sum + s.stamina, 0) / generations.length;
            
            // Thoroughbreds should have higher average speed than stamina
            expect(avgSpeed).toBeGreaterThan(avgStamina);
        });

        test('should throw error for invalid breed', () => {
            expect(() => {
                statGenerator.generateStatsForBreed('invalidbreed');
            }).toThrow('Invalid breed');
        });
    });

    describe('Inheritance System (for breeding)', () => {
        test('should average parent stats with variation', () => {
            const sireStats = { speed: 60, stamina: 40, power: 50 };
            const damStats = { speed: 40, stamina: 60, power: 50 };
            
            const offspring = statGenerator.generateInheritedStats(sireStats, damStats);
            
            // Should be close to averages but with some variation
            expect(offspring.speed).toBeGreaterThanOrEqual(40);
            expect(offspring.speed).toBeLessThanOrEqual(70);
            expect(offspring.stamina).toBeGreaterThanOrEqual(40);
            expect(offspring.stamina).toBeLessThanOrEqual(70);
        });

        test('should show inheritance patterns over multiple generations', () => {
            const sireStats = { speed: 80, stamina: 30, power: 40 };
            const damStats = { speed: 30, stamina: 80, power: 40 };
            
            const offspring = [];
            for (let i = 0; i < 20; i++) {
                offspring.push(statGenerator.generateInheritedStats(sireStats, damStats));
            }
            
            const avgSpeed = offspring.reduce((sum, s) => sum + s.speed, 0) / offspring.length;
            const avgStamina = offspring.reduce((sum, s) => sum + s.stamina, 0) / offspring.length;
            
            // Should trend toward parent averages
            expect(avgSpeed).toBeGreaterThanOrEqual(45);
            expect(avgSpeed).toBeLessThanOrEqual(65);
            expect(avgStamina).toBeGreaterThanOrEqual(45);
            expect(avgStamina).toBeLessThanOrEqual(65);
        });

        test('should handle extreme parent stat combinations', () => {
            const maxSire = { speed: 100, stamina: 100, power: 100 };
            const minDam = { speed: 1, stamina: 1, power: 1 };
            
            const offspring = statGenerator.generateInheritedStats(maxSire, minDam);
            
            // Should still produce reasonable offspring
            expect(offspring.speed).toBeGreaterThanOrEqual(20);
            expect(offspring.speed).toBeLessThanOrEqual(80);
        });
    });

    describe('Legacy Bonus System', () => {
        test('should apply legacy bonuses correctly', () => {
            const baseStats = { speed: 50, stamina: 50, power: 50 };
            const legacyBonuses = { speed: 10, stamina: 5, power: 15 };
            
            const boostedStats = statGenerator.applyLegacyBonuses(baseStats, legacyBonuses);
            
            expect(boostedStats.speed).toBe(60);
            expect(boostedStats.stamina).toBe(55);
            expect(boostedStats.power).toBe(65);
        });

        test('should cap stats at maximum values', () => {
            const baseStats = { speed: 95, stamina: 90, power: 85 };
            const largeBonuses = { speed: 20, stamina: 25, power: 30 };
            
            const cappedStats = statGenerator.applyLegacyBonuses(baseStats, largeBonuses);
            
            expect(cappedStats.speed).toBeLessThanOrEqual(100);
            expect(cappedStats.stamina).toBeLessThanOrEqual(100);
            expect(cappedStats.power).toBeLessThanOrEqual(100);
        });

        test('should handle negative legacy bonuses', () => {
            const baseStats = { speed: 50, stamina: 50, power: 50 };
            const penalties = { speed: -10, stamina: -5, power: 0 };
            
            const penalizedStats = statGenerator.applyLegacyBonuses(baseStats, penalties);
            
            expect(penalizedStats.speed).toBe(40);
            expect(penalizedStats.stamina).toBe(45);
            expect(penalizedStats.power).toBe(50);
            
            // Should not go below minimum
            expect(penalizedStats.speed).toBeGreaterThanOrEqual(1);
            expect(penalizedStats.stamina).toBeGreaterThanOrEqual(1);
            expect(penalizedStats.power).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Growth Potential System', () => {
        test('should assign growth potential ratings', () => {
            const stats = { speed: 60, stamina: 40, power: 50 };
            const growthPotential = statGenerator.generateGrowthPotential(stats);
            
            expect(['S', 'A', 'B', 'C', 'D']).toContain(growthPotential.speed);
            expect(['S', 'A', 'B', 'C', 'D']).toContain(growthPotential.stamina);
            expect(['S', 'A', 'B', 'C', 'D']).toContain(growthPotential.power);
        });

        test('should correlate growth potential with base stats', () => {
            const highStats = { speed: 80, stamina: 75, power: 70 };
            const lowStats = { speed: 25, stamina: 30, power: 35 };
            
            const highPotential = statGenerator.generateGrowthPotential(highStats);
            const lowPotential = statGenerator.generateGrowthPotential(lowStats);
            
            // Higher base stats should tend toward better growth potential
            // This is probabilistic, so we test the trend over multiple generations
            const highGrades = Object.values(highPotential);
            const lowGrades = Object.values(lowPotential);
            
            expect(highGrades.filter(g => ['S', 'A'].includes(g)).length)
                .toBeGreaterThanOrEqual(lowGrades.filter(g => ['S', 'A'].includes(g)).length);
        });
    });

    describe('Advanced Stat Generation Scenarios', () => {
        test('should handle complex breeding with multiple generations', () => {
            // Grandparents
            const sire1 = { speed: 70, stamina: 60, power: 50 };
            const dam1 = { speed: 50, stamina: 70, power: 60 };
            
            // Parents (first generation)
            const parent1 = statGenerator.generateInheritedStats(sire1, dam1);
            const parent2 = statGenerator.generateInheritedStats(dam1, sire1);
            
            // Offspring (second generation)
            const offspring = statGenerator.generateInheritedStats(parent1, parent2);
            
            expect(offspring.speed).toBeGreaterThanOrEqual(20);
            expect(offspring.speed).toBeLessThanOrEqual(80);
            expect(offspring.stamina).toBeGreaterThanOrEqual(20);
            expect(offspring.stamina).toBeLessThanOrEqual(80);
            expect(offspring.power).toBeGreaterThanOrEqual(20);
            expect(offspring.power).toBeLessThanOrEqual(80);
        });

        test('should maintain statistical balance across large generations', () => {
            const largeSample = [];
            for (let i = 0; i < 100; i++) {
                largeSample.push(statGenerator.generateBaseStats());
            }
            
            // Check distribution properties
            const speeds = largeSample.map(s => s.speed);
            const staminas = largeSample.map(s => s.stamina);
            const powers = largeSample.map(s => s.power);
            
            // Should have reasonable distribution (not all clustered)
            const speedRange = Math.max(...speeds) - Math.min(...speeds);
            const staminaRange = Math.max(...staminas) - Math.min(...staminas);
            const powerRange = Math.max(...powers) - Math.min(...powers);
            
            expect(speedRange).toBeGreaterThan(20);
            expect(staminaRange).toBeGreaterThan(20);
            expect(powerRange).toBeGreaterThan(20);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle null parent stats gracefully', () => {
            expect(() => {
                statGenerator.generateInheritedStats(null, { speed: 50, stamina: 50, power: 50 });
            }).toThrow('Invalid parent stats');
        });

        test('should handle invalid stat ranges', () => {
            const invalidStats = { speed: -10, stamina: 150, power: 'invalid' };
            
            expect(() => {
                statGenerator.applyLegacyBonuses(invalidStats, { speed: 0, stamina: 0, power: 0 });
            }).toThrow('Invalid stats format');
        });

        test('should handle extreme legacy bonuses gracefully', () => {
            const baseStats = { speed: 50, stamina: 50, power: 50 };
            const extremeBonuses = { speed: 1000, stamina: -1000, power: 0 };
            
            const result = statGenerator.applyLegacyBonuses(baseStats, extremeBonuses);
            
            // Should be capped at valid ranges
            expect(result.speed).toBeLessThanOrEqual(100);
            expect(result.stamina).toBeGreaterThanOrEqual(1);
        });
    });
});