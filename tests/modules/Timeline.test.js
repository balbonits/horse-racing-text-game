/**
 * Timeline Module Tests  
 * Tests for race scheduling and timing logic
 */

const Timeline = require('../../src/modules/Timeline');

describe('Timeline Module', () => {
  let timeline;
  
  beforeEach(() => {
    timeline = new Timeline();
  });
  
  describe('Race Schedule', () => {
    test('should have 4 races at correct turns', () => {
      expect(timeline.raceSchedule).toHaveLength(4);
      
      const raceTurns = timeline.raceSchedule.map(r => r.turn);
      expect(raceTurns).toEqual([4, 7, 10, 12]);
    });
    
    test('should have correct race names', () => {
      const raceNames = timeline.raceSchedule.map(r => r.name);
      expect(raceNames).toEqual([
        'Maiden Sprint',
        'Mile Championship', 
        'Dirt Stakes',
        'Turf Cup Final'
      ]);
    });
    
    test('should return race for scheduled turns', () => {
      expect(timeline.getRaceForTurn(4)).toBe('Maiden Sprint');
      expect(timeline.getRaceForTurn(7)).toBe('Mile Championship');
      expect(timeline.getRaceForTurn(10)).toBe('Dirt Stakes');
      expect(timeline.getRaceForTurn(12)).toBe('Turf Cup Final');
    });
    
    test('should return null for non-race turns', () => {
      expect(timeline.getRaceForTurn(1)).toBeNull();
      expect(timeline.getRaceForTurn(2)).toBeNull();
      expect(timeline.getRaceForTurn(3)).toBeNull();
      expect(timeline.getRaceForTurn(5)).toBeNull();
      expect(timeline.getRaceForTurn(6)).toBeNull();
      expect(timeline.getRaceForTurn(8)).toBeNull();
      expect(timeline.getRaceForTurn(9)).toBeNull();
      expect(timeline.getRaceForTurn(11)).toBeNull();
      expect(timeline.getRaceForTurn(13)).toBeNull();
    });
  });
  
  describe('Upcoming Race Info', () => {
    test('should calculate turns until first race correctly', () => {
      const info = timeline.getNextRaceInfo(1);
      
      expect(info.name).toBe('Maiden Sprint');
      expect(info.turn).toBe(4);
      expect(info.turnsUntil).toBe(3);
      expect(info.isNext).toBe(false);
    });
    
    test('should identify when race is next turn', () => {
      const info = timeline.getNextRaceInfo(3);
      
      expect(info.name).toBe('Maiden Sprint');
      expect(info.turn).toBe(4);
      expect(info.turnsUntil).toBe(1);
      expect(info.isNext).toBe(true);
    });

    test('should handle race turns correctly', () => {
      const info = timeline.getNextRaceInfo(4);
      
      expect(info.name).toBe('Mile Championship');
      expect(info.turn).toBe(7);
      expect(info.turnsUntil).toBe(3);
    });
    
    test('should return null when no more races', () => {
      const info = timeline.getNextRaceInfo(13);
      expect(info).toBeNull();
    });

    test('should handle mid-career race scheduling', () => {
      let info = timeline.getNextRaceInfo(6);
      expect(info.name).toBe('Mile Championship');
      expect(info.turnsUntil).toBe(1);

      info = timeline.getNextRaceInfo(9);
      expect(info.name).toBe('Dirt Stakes');
      expect(info.turnsUntil).toBe(1);

      info = timeline.getNextRaceInfo(11);
      expect(info.name).toBe('Turf Cup Final');
      expect(info.turnsUntil).toBe(1);
    });
  });

  describe('Race Detection', () => {
    test('should correctly identify race turns', () => {
      expect(timeline.isRaceTurn(4)).toBe(true);
      expect(timeline.isRaceTurn(7)).toBe(true);
      expect(timeline.isRaceTurn(10)).toBe(true);
      expect(timeline.isRaceTurn(12)).toBe(true);
      
      expect(timeline.isRaceTurn(1)).toBe(false);
      expect(timeline.isRaceTurn(5)).toBe(false);
      expect(timeline.isRaceTurn(8)).toBe(false);
      expect(timeline.isRaceTurn(13)).toBe(false);
    });
  });

  describe('Career Completion', () => {
    test('should detect when all races are scheduled', () => {
      expect(timeline.getTotalRaces()).toBe(4);
    });

    test('should provide race schedule summary', () => {
      const summary = timeline.getRaceScheduleSummary();
      
      expect(summary).toHaveLength(4);
      expect(summary[0]).toMatchObject({
        turn: 4,
        name: 'Maiden Sprint'
      });
    });
  });
});