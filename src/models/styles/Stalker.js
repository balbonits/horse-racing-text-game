const RacingStyle = require('./RacingStyle');

/**
 * Stalker racing style - Tactical positioning with balanced energy management
 * 
 * Stalkers use intelligent positioning to track the pace while conserving energy
 * for well-timed moves. They excel at reading race dynamics and positioning for
 * optimal striking opportunities in the final stages of races.
 * 
 * Characteristics:
 * - Balanced energy distribution (35% early, 40% middle, 25% late)
 * - Preferred positions: 3rd-6th early, 2nd-4th late
 * - Excellent tactical flexibility
 * - Compatible with all specializations
 * 
 * @class Stalker
 * @extends RacingStyle
 */
class Stalker extends RacingStyle {
    constructor() {
        const config = {
            energyStrategy: {
                early: 0.35,    // Moderate early positioning
                middle: 0.40,   // Key tactical phase
                late: 0.25      // Finishing drive
            },
            positionPreference: {
                early: [3, 6],  // Track the pace from ideal striking position
                middle: [2, 5], // Move closer to leaders
                late: [1, 3]    // Strike for victory
            },
            paceProfile: {
                fast: 1.08,     // Benefits from fast pace (leaders tire)
                moderate: 1.05, // Good in moderate pace
                slow: 0.98      // Slightly disadvantaged by slow pace
            },
            description: "Balanced tactical racing with intelligent positioning. Track the leaders while conserving energy for well-timed moves and strong finishing kicks.",
            strengths: [
                "Superior tactical positioning and race reading",
                "Excellent energy management and efficiency",
                "Strong finishing capability from ideal position",
                "Adaptable to various race scenarios and conditions"
            ],
            compatibleSpecializations: ['Sprinter', 'Miler', 'Stayer'] // Works well with all
        };
        
        super('Stalker', config);
    }
    
    /**
     * Get specialized tactical recommendations for Stalkers
     * @param {Object} raceInfo - Information about the race
     * @param {Object} horseStats - Current horse statistics
     * @returns {Object} Enhanced tactical recommendations
     */
    getTacticalRecommendations(raceInfo, horseStats) {
        const baseRecommendations = super.getTacticalRecommendations(raceInfo, horseStats);
        const { distance, pace, fieldSize } = raceInfo;
        
        const stalkerAdvice = {
            ...baseRecommendations,
            positioningStrategy: this.getPositioningStrategy(pace, distance, fieldSize),
            timingAdvice: this.getTimingAdvice(distance, horseStats),
            tacticalOpportunities: this.identifyOpportunities(raceInfo, horseStats),
            energyManagement: this.getEnergyManagementPlan(distance, horseStats)
        };
        
        return stalkerAdvice;
    }
    
    /**
     * Get positioning strategy based on race conditions
     * @param {string} pace - Expected race pace
     * @param {number} distance - Race distance
     * @param {number} fieldSize - Number of horses
     * @returns {string} Positioning strategy
     */
    getPositioningStrategy(pace, distance, fieldSize) {
        let baseStrategy = "Track leaders from 4th-6th position early, move to 3rd-4th in middle phase";
        
        if (pace === 'fast') {
            return baseStrategy + " - Fast pace will tire leaders, perfect for stalking tactics";
        } else if (pace === 'slow') {
            return "Position closer to pace (3rd-4th early) - slow pace reduces stalking advantage";
        } else {
            return baseStrategy + " - Moderate pace allows flexible positioning";
        }
    }
    
    /**
     * Get timing advice for the stalking move
     * @param {number} distance - Race distance
     * @param {Object} horseStats - Horse statistics
     * @returns {string} Timing advice
     */
    getTimingAdvice(distance, horseStats) {
        const speedRatio = horseStats.speed / 100;
        const staminaRatio = horseStats.stamina / 100;
        
        if (distance <= 1400) {
            if (speedRatio > 0.7) {
                return "SHORT RACE - Make move at 1/4 pole, use speed advantage for sustained drive";
            } else {
                return "SHORT RACE - Wait until final 200m, rely on tactical positioning";
            }
        } else if (distance <= 1800) {
            return "IDEAL DISTANCE - Begin move at 1/2 mile, sustain pressure to wire";
        } else {
            if (staminaRatio > 0.7) {
                return "LONG RACE - Patient approach, strong move at 3/8 pole with stamina reserves";
            } else {
                return "LONG RACE - Very patient, save move for final 1/4 mile";
            }
        }
    }
    
    /**
     * Identify tactical opportunities based on race setup
     * @param {Object} raceInfo - Race information
     * @param {Object} horseStats - Horse statistics
     * @returns {Array<string>} Tactical opportunities
     */
    identifyOpportunities(raceInfo, horseStats) {
        const opportunities = [];
        const { rivals = [], pace, distance } = raceInfo;
        
        const frontRunners = rivals.filter(r => r.racingStyle === 'Front Runner').length;
        const closers = rivals.filter(r => r.racingStyle === 'Closer').length;
        const otherStalkers = rivals.filter(r => r.racingStyle === 'Stalker').length;
        
        if (frontRunners >= 2) {
            opportunities.push("Multiple front runners - expect pace duel, ideal for stalking");
        }
        
        if (closers >= 3) {
            opportunities.push("Many closers - early positioning advantage, beat them to punch");
        }
        
        if (otherStalkers <= 1) {
            opportunities.push("Few other stalkers - clean tactical positioning available");
        }
        
        if (pace === 'fast') {
            opportunities.push("Fast pace scenario - leaders will tire, perfect striking position");
        }
        
        if (opportunities.length === 0) {
            opportunities.push("Standard race setup - rely on superior tactical positioning");
        }
        
        return opportunities;
    }
    
    /**
     * Get energy management plan for stalker tactics
     * @param {number} distance - Race distance
     * @param {Object} horseStats - Horse statistics
     * @returns {string} Energy management plan
     */
    getEnergyManagementPlan(distance, horseStats) {
        const totalStats = horseStats.speed + horseStats.stamina + horseStats.power;
        const balance = Math.abs(horseStats.speed - horseStats.stamina) / totalStats;
        
        if (balance < 0.1) { // Well-balanced stats
            return "BALANCED HORSE - Use standard energy distribution, make move based on race flow";
        } else if (horseStats.speed > horseStats.stamina) {
            return "SPEED-LEANING - Conserve early, use speed for sustained middle-race pressure";
        } else {
            return "STAMINA-LEANING - More aggressive positioning, use endurance for late kick";
        }
    }
    
    /**
     * Get key tactical points for Stalker style
     * @param {Object} raceInfo - Race information
     * @param {Object} horseStats - Horse statistics
     * @returns {Array<string>} Key tactical points
     */
    getKeyTactics(raceInfo, horseStats) {
        return [
            "Settle in tactical position 4th-6th, avoid early pace pressure",
            "Track leaders closely without applying pressure in early stages",
            "Begin tactical move at halfway point, gradually improve position",
            "Time finishing drive based on leaders' energy levels",
            "Use superior positioning to avoid trouble and find clear running room"
        ];
    }
    
    /**
     * Calculate synergy bonus with specializations
     * @param {string} specializationName - Name of racing specialization
     * @returns {number} Synergy bonus multiplier
     */
    calculateSynergyBonus(specializationName) {
        switch (specializationName) {
            case 'Sprinter':
                return 1.08; // Good synergy - stalking sets up speed finish
            case 'Miler':
                return 1.12; // Excellent synergy - perfect tactical match
            case 'Stayer':
                return 1.09; // Very good synergy - positioning for stamina finish
            default:
                return 1.05;
        }
    }
    
    /**
     * Get energy efficiency for different contexts
     * @param {string} context - Energy usage context
     * @param {Object} raceConditions - Current race conditions
     * @returns {number} Energy efficiency multiplier
     */
    getEnergyEfficiency(context, raceConditions = {}) {
        const { pace, position, phase } = raceConditions;
        
        switch (context) {
            case 'tacticalPositioning':
                // More efficient when in ideal tactical position
                if (position >= 3 && position <= 6 && phase !== 'late') {
                    return 0.90;
                }
                return 1.0;
                
            case 'draftingBenefit':
                // Efficiency from drafting behind leaders
                if (position >= 2 && position <= 5) {
                    return 0.92;
                }
                return 1.0;
                
            case 'timingMove':
                // Efficient when making well-timed tactical move
                if (phase === 'middle') {
                    return 0.88;
                }
                return 1.0;
                
            case 'fastPace':
                // Benefits from fast pace (conserves energy while others expend)
                if (pace === 'fast' && phase === 'early') {
                    return 0.85;
                }
                return 1.0;
                
            default:
                return 1.0;
        }
    }
    
    /**
     * Get performance bonuses for stalking situations
     * @param {Object} raceContext - Current race context
     * @returns {number} Performance bonus multiplier
     */
    getPerformanceBonus(raceContext) {
        const { phase, position, pace, distance, energyRemaining } = raceContext;
        let bonus = 1.0;
        
        // Tactical positioning bonus
        if (position >= 3 && position <= 6 && phase === 'early') {
            bonus *= 1.08;
        }
        
        // Mid-race move bonus
        if (phase === 'middle' && position >= 2 && position <= 4) {
            bonus *= 1.12;
        }
        
        // Fast pace advantage
        if (pace === 'fast' && energyRemaining > 0.6) {
            bonus *= 1.10;
        }
        
        // Finishing position bonus
        if (phase === 'late' && position <= 3) {
            bonus *= 1.09;
        }
        
        // Distance versatility bonus
        bonus *= 1.03; // Small consistent bonus for tactical racing
        
        return bonus;
    }
    
    /**
     * Get tactical insights for race reading
     * @returns {Object} Tactical insights and race reading tips
     */
    getTacticalInsights() {
        return {
            raceReading: [
                "Identify the early pace scenario - fast pace favors stalkers",
                "Track the strongest finishers, position to cover their moves",
                "Watch for openings along the rail or outside",
                "Time your move when leaders show signs of fatigue"
            ],
            positioning: [
                "Avoid getting trapped on the rail in large fields",
                "Stay close enough to leaders to make effective move",
                "Position outside horses you want to beat in the stretch",
                "Keep clear running room for finishing drive"
            ],
            energyManagement: [
                "Use drafting to conserve energy behind leaders",
                "Don't make your move too early - patience is key",
                "Save enough energy for sustained finishing drive",
                "React to pace changes but don't initiate them"
            ],
            finishingTactics: [
                "Begin move gradually, build to strong finish",
                "Switch to clear running room if necessary",
                "Use tactical acceleration, not just raw speed",
                "Stay focused - many races are won by stalkers in final strides"
            ]
        };
    }
    
    /**
     * Get achievements possible with Stalker style
     * @returns {Array<Object>} Possible achievements
     */
    getPossibleAchievements() {
        return [
            {
                name: "Perfect Position",
                description: "Win a race from exactly 4th position at halfway point",
                difficulty: "Medium"
            },
            {
                name: "Tactical Master",
                description: "Win 3 races using stalking tactics with different specializations",
                difficulty: "Hard"
            },
            {
                name: "Draft Master",
                description: "Complete race with 75%+ energy remaining while stalking",
                difficulty: "Medium"
            },
            {
                name: "Timing is Everything",
                description: "Win by making your move at exactly the 1/4 pole",
                difficulty: "Hard"
            },
            {
                name: "Versatile Tactician",
                description: "Win races at sprint, mile, and long distances using stalking",
                difficulty: "Hard"
            },
            {
                name: "Race Reader",
                description: "Win 2 consecutive races by correctly reading fast early pace",
                difficulty: "Medium"
            }
        ];
    }
    
    /**
     * Get display information with Stalker-specific details
     * @returns {Object} Enhanced display information
     */
    getDisplayInfo() {
        const baseInfo = super.getDisplayInfo();
        return {
            ...baseInfo,
            difficulty: "Medium",
            playstyle: "Tactical positioning with intelligent race reading",
            idealFor: "Strategic players who enjoy timing moves and reading race dynamics",
            notableFeature: "40% middle-race energy focus for optimal tactical positioning",
            bestConditions: "Fast-pace races and moderate field sizes",
            racingPhilosophy: "Position is everything - be in the right place at the right time",
            energyPattern: "Setup early (35%) - Strike middle (40%) - Finish strong (25%)",
            tacticalAdvantage: "Superior energy efficiency and positioning flexibility"
        };
    }
}

module.exports = Stalker;