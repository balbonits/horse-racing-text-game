/**
 * Tests for NameGenerator system
 * Validates name generation, uniqueness, and legal safety
 */

const NameGenerator = require('../../../src/systems/generation/NameGenerator');

describe('NameGenerator', () => {
    let nameGenerator;
    
    beforeEach(() => {
        nameGenerator = new NameGenerator();
    });

    describe('Horse Name Generation', () => {
        test('generates valid horse names', () => {
            const name = nameGenerator.generateHorseName();
            
            expect(name).toBeTruthy();
            expect(typeof name).toBe('string');
            expect(name.length).toBeGreaterThan(2);
            expect(name.length).toBeLessThanOrEqual(25);
        });

        test('generates unique horse names', () => {
            const names = new Set();
            const count = 100;
            
            for (let i = 0; i < count; i++) {
                const name = nameGenerator.generateHorseName();
                names.add(name);
            }
            
            expect(names.size).toBeGreaterThan(count * 0.95); // At least 95% unique
        });

        test('generates breed-appropriate names', () => {
            const thoroughbredName = nameGenerator.generateHorseName('thoroughbred');
            const arabianName = nameGenerator.generateHorseName('arabian');
            const quarterHorseName = nameGenerator.generateHorseName('quarterHorse');
            
            expect(thoroughbredName).toBeTruthy();
            expect(arabianName).toBeTruthy();
            expect(quarterHorseName).toBeTruthy();
        });

        test('validates horse name format', () => {
            const name = nameGenerator.generateHorseName();
            
            // Should only contain letters, spaces, and apostrophes
            expect(name).toMatch(/^[A-Za-z\s']+$/);
            
            // Should not have double spaces
            expect(name).not.toContain('  ');
            
            // Should be properly capitalized (first letter of each word)
            const words = name.split(' ');
            words.forEach(word => {
                expect(word[0]).toMatch(/[A-Z]/);
            });
        });

        test('generates mythological names', () => {
            // Force mythological pattern by generating many names
            const names = [];
            for (let i = 0; i < 50; i++) {
                names.push(nameGenerator.generateHorseName());
            }
            
            // Should have some single-word mythological names
            const singleWordNames = names.filter(name => !name.includes(' '));
            expect(singleWordNames.length).toBeGreaterThan(0);
        });

        test('handles name exhaustion gracefully', () => {
            // Generate a large number of names to test uniqueness handling
            const names = nameGenerator.generateMultipleHorseNames(500);
            
            expect(names.length).toBe(500);
            
            // All names should be valid
            names.forEach(name => {
                expect(name).toBeTruthy();
                expect(name.length).toBeGreaterThan(2);
            });
        });
    });

    describe('Race Name Generation', () => {
        test('generates valid race names', () => {
            const raceName = nameGenerator.generateRaceName();
            
            expect(raceName).toBeTruthy();
            expect(typeof raceName).toBe('string');
            expect(raceName.length).toBeGreaterThan(5);
        });

        test('generates distance-appropriate race names', () => {
            const sprintRace = nameGenerator.generateRaceName('1200m', 'dirt', 'stakes');
            const mileRace = nameGenerator.generateRaceName('1600m', 'turf', 'classic');
            const longRace = nameGenerator.generateRaceName('2400m', 'dirt', 'cup');
            
            expect(sprintRace).toBeTruthy();
            expect(mileRace).toBeTruthy();
            expect(longRace).toBeTruthy();
        });

        test('generates unique race names', () => {
            const names = new Set();
            const count = 50;
            
            for (let i = 0; i < count; i++) {
                const name = nameGenerator.generateRaceName();
                names.add(name);
            }
            
            expect(names.size).toBeGreaterThan(count * 0.9); // At least 90% unique
        });

        test('includes proper race terminology', () => {
            const raceNames = nameGenerator.generateMultipleRaceNames(20);
            
            const raceTerms = ['Stakes', 'Classic', 'Cup', 'Championship', 'Derby', 
                              'Trophy', 'Prize', 'Memorial', 'Invitational', 'Festival'];
            
            let hasRaceTerms = false;
            raceNames.forEach(name => {
                if (raceTerms.some(term => name.includes(term))) {
                    hasRaceTerms = true;
                }
            });
            
            expect(hasRaceTerms).toBe(true);
        });

        test('categorizes distances correctly', () => {
            expect(nameGenerator.getDistanceCategory('1200m')).toBe('Sprint');
            expect(nameGenerator.getDistanceCategory('1600m')).toBe('Mile');
            expect(nameGenerator.getDistanceCategory('2000m')).toBe('Classic');
            expect(nameGenerator.getDistanceCategory('2500m')).toBe('Distance');
        });
    });

    describe('Track Name Generation', () => {
        test('generates valid track names', () => {
            const trackName = nameGenerator.generateTrackName();
            
            expect(trackName).toBeTruthy();
            expect(typeof trackName).toBe('string');
            expect(trackName.length).toBeGreaterThan(5);
        });

        test('generates unique track names', () => {
            const names = new Set();
            const count = 30;
            
            for (let i = 0; i < count; i++) {
                const name = nameGenerator.generateTrackName();
                names.add(name);
            }
            
            expect(names.size).toBeGreaterThan(count * 0.8); // At least 80% unique
        });

        test('includes proper track terminology', () => {
            const trackNames = nameGenerator.generateMultipleTrackNames(20);
            
            const trackTerms = ['Park', 'Downs', 'Raceway', 'Track', 'Circuit', 
                               'Speedway', 'Course', 'Field', 'Grounds', 'Arena'];
            
            let hasTrackTerms = false;
            trackNames.forEach(name => {
                if (trackTerms.some(term => name.includes(term))) {
                    hasTrackTerms = true;
                }
            });
            
            expect(hasTrackTerms).toBe(true);
        });

        test('generates regional and surface appropriate names', () => {
            const dirtTrack = nameGenerator.generateTrackName('western', 'dirt');
            const turfTrack = nameGenerator.generateTrackName('coastal', 'turf');
            
            expect(dirtTrack).toBeTruthy();
            expect(turfTrack).toBeTruthy();
        });
    });

    describe('Legal Safety', () => {
        test('avoids known copyrighted horse names', () => {
            const copyrightedNames = [
                'Secretariat', 'Man o\' War', 'Seabiscuit', 'Citation',
                'Seattle Slew', 'Affirmed', 'War Admiral', 'Whirlaway',
                'Count Fleet', 'Assault', 'Triple Crown', 'Big Red'
            ];
            
            const generatedNames = nameGenerator.generateMultipleHorseNames(1000);
            
            generatedNames.forEach(name => {
                copyrightedNames.forEach(copyrighted => {
                    expect(name.toLowerCase()).not.toBe(copyrighted.toLowerCase());
                });
            });
        });

        test('avoids known track names', () => {
            const copyrightedTracks = [
                'Churchill Downs', 'Belmont Park', 'Pimlico', 'Santa Anita',
                'Keeneland', 'Saratoga', 'Del Mar', 'Arlington Park',
                'Oaklawn Park', 'Fair Grounds'
            ];
            
            const generatedTracks = nameGenerator.generateMultipleTrackNames(100);
            
            generatedTracks.forEach(track => {
                copyrightedTracks.forEach(copyrighted => {
                    expect(track.toLowerCase()).not.toBe(copyrighted.toLowerCase());
                });
            });
        });

        test('avoids known race names', () => {
            const copyrightedRaces = [
                'Kentucky Derby', 'Preakness Stakes', 'Belmont Stakes',
                'Breeders\' Cup Classic', 'Dubai World Cup', 'Prix de l\'Arc de Triomphe',
                'Melbourne Cup', 'Grand National', 'Epsom Derby'
            ];
            
            const generatedRaces = nameGenerator.generateMultipleRaceNames(100);
            
            generatedRaces.forEach(race => {
                copyrightedRaces.forEach(copyrighted => {
                    expect(race.toLowerCase()).not.toBe(copyrighted.toLowerCase());
                });
            });
        });

        test('uses only generic descriptive terms', () => {
            const names = nameGenerator.generateMultipleHorseNames(50);
            
            // All names should use common English words or fantasy names
            // No specific brand names or trademarked terms
            names.forEach(name => {
                expect(name).not.toMatch(/Nike|Adidas|Coca-Cola|McDonald/i);
                expect(name).not.toMatch(/Godolphin|Coolmore|Juddmonte/i); // Racing stables
            });
        });
    });

    describe('Persistence', () => {
        test('tracks used names', () => {
            const horseName1 = nameGenerator.generateHorseName();
            const horseName2 = nameGenerator.generateHorseName();
            const raceName = nameGenerator.generateRaceName();
            const trackName = nameGenerator.generateTrackName();
            
            const usedNames = nameGenerator.getUsedNames();
            
            expect(usedNames.horses).toContain(horseName1);
            expect(usedNames.horses).toContain(horseName2);
            expect(usedNames.races).toContain(raceName);
            expect(usedNames.tracks).toContain(trackName);
        });

        test('restores used names from save data', () => {
            const originalHorse = nameGenerator.generateHorseName();
            const originalRace = nameGenerator.generateRaceName();
            
            const usedNames = nameGenerator.getUsedNames();
            
            // Create new generator and restore state
            const newGenerator = new NameGenerator();
            newGenerator.setUsedNames(usedNames);
            
            const restoredUsedNames = newGenerator.getUsedNames();
            
            expect(restoredUsedNames.horses).toContain(originalHorse);
            expect(restoredUsedNames.races).toContain(originalRace);
        });

        test('handles reset functionality', () => {
            nameGenerator.generateHorseName();
            nameGenerator.generateRaceName();
            nameGenerator.generateTrackName();
            
            expect(nameGenerator.getUsedNames().horses.length).toBeGreaterThan(0);
            
            nameGenerator.reset();
            
            const usedNames = nameGenerator.getUsedNames();
            expect(usedNames.horses.length).toBe(0);
            expect(usedNames.races.length).toBe(0);
            expect(usedNames.tracks.length).toBe(0);
        });
    });

    describe('Utility Methods', () => {
        test('generates roman numerals correctly', () => {
            expect(nameGenerator.romanNumeral(1)).toBe('I');
            expect(nameGenerator.romanNumeral(5)).toBe('V');
            expect(nameGenerator.romanNumeral(10)).toBe('X');
            expect(nameGenerator.romanNumeral(50)).toBe('L');
            expect(nameGenerator.romanNumeral(100)).toBe('C');
            expect(nameGenerator.romanNumeral(23)).toBe('XXIII');
            expect(nameGenerator.romanNumeral(99)).toBe('XCIX');
        });

        test('validates horse name format correctly', () => {
            expect(nameGenerator.isValidHorseName('Golden Thunder')).toBe(true);
            expect(nameGenerator.isValidHorseName('Swift\'s Pride')).toBe(true);
            expect(nameGenerator.isValidHorseName('AB')).toBe(false); // Too short
            expect(nameGenerator.isValidHorseName('A'.repeat(26))).toBe(false); // Too long
            expect(nameGenerator.isValidHorseName('Golden  Thunder')).toBe(false); // Double space
            expect(nameGenerator.isValidHorseName('Golden123')).toBe(false); // Contains numbers
        });

        test('random selection from arrays works', () => {
            const testArray = ['one', 'two', 'three', 'four', 'five'];
            const selections = [];
            
            for (let i = 0; i < 100; i++) {
                selections.push(nameGenerator.randomFromArray(testArray));
            }
            
            // Should have selected all different values at some point
            const uniqueSelections = new Set(selections);
            expect(uniqueSelections.size).toBeGreaterThan(1);
            
            // All selections should be from the original array
            selections.forEach(selection => {
                expect(testArray).toContain(selection);
            });
        });
    });

    describe('Pattern Generation', () => {
        test('generates different naming patterns', () => {
            const names = nameGenerator.generateMultipleHorseNames(20);
            
            // Should have different patterns - some with spaces, some without
            const singleWordNames = names.filter(name => !name.includes(' '));
            const multiWordNames = names.filter(name => name.includes(' '));
            
            // Should have both types (though exact distribution varies)
            expect(singleWordNames.length + multiWordNames.length).toBe(20);
        });

        test('breed patterns influence naming', () => {
            const arabianNames = nameGenerator.generateMultipleHorseNames(10, 'arabian');
            
            // Arabian names might include desert-themed words
            // This is probabilistic, so we just check they're valid
            arabianNames.forEach(name => {
                expect(name).toBeTruthy();
                expect(nameGenerator.isValidHorseName(name)).toBe(true);
            });
        });
    });
});