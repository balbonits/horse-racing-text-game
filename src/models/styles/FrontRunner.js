const RacingStyle = require('./RacingStyle');

/**
 * Front Runner racing style - Aggressive early pace and wire-to-wire tactics
 * 
 * Front runners use aggressive early positioning to establish commanding leads,
 * then attempt to maintain their advantage throughout the race. They excel
 * when they can control the pace and have sufficient stamina to sustain it.
 * 
 * Characteristics:
 * - High early energy expenditure (50%)
 * - Preferred early positions: 1st-3rd
 * - Excellent in slow-pace races
 * - Best with Sprinter and some Miler specializations
 * 
 * @class FrontRunner
 * @extends RacingStyle
 */
class FrontRunner extends RacingStyle {
    constructor() {
        const config = {
            energyStrategy: {
                early: 0.50,    // Aggressive early pace
                middle: 0.30,   // Maintain position
                late: 0.20      // Hope to hold on
            },
            positionPreference: {
                early: [1, 3],  // Lead or press the pace
                middle: [1, 4], // Stay near the front
                late: [1, 2]    // Wire-to-wire or close second
            },
            paceProfile: {
                fast: 0.90,     // Struggles when others set fast pace
                moderate: 1.05, // Good in moderate pace
                slow: 1.15      // Excellent when controlling slow pace
            },
            description: "Aggressive wire-to-wire tactics. Establish early leads through superior gate speed and maintain position through sustained pace pressure.",
            strengths: [
                "Excellent gate speed and early positioning",
                "Controls race pace from the front",
                "Devastating in slow-pace scenarios", 
                "Psychological pressure on following horses"
            ],
            compatibleSpecializations: ['Sprinter', 'Miler'] // Less compatible with Stayers
        };
        
        super('Front Runner', config);
    }
    
    /**
     * Get specialized tactical recommendations for Front Runners
     * @param {Object} raceInfo - Information about the race
     * @param {Object} horseStats - Current horse statistics
     * @returns {Object} Enhanced tactical recommendations
     */
    getTacticalRecommendations(raceInfo, horseStats) {
        const baseRecommendations = super.getTacticalRecommendations(raceInfo, horseStats);
        const { distance, pace, fieldSize } = raceInfo;
        
        // Front runner specific advice
        const frontRunnerAdvice = {
            ...baseRecommendations,
            gateStrategy: "Break alertly and establish early position within first 200m",
            paceControl: this.getPaceControlAdvice(pace, distance, horseStats),
            energyWarning: this.getEnergyWarning(distance, horseStats),
            competitionAnalysis: this.analyzeCompetition(raceInfo, horseStats)
        };
        
        return frontRunnerAdvice;
    }
    
    /**
     * Get pace control strategy advice
     * @param {string} pace - Expected race pace
     * @param {number} distance - Race distance
     * @param {Object} horseStats - Horse statistics
     * @returns {string} Pace control advice
     */
    getPaceControlAdvice(pace, distance, horseStats) {
        if (pace === 'slow') {
            return "IDEAL CONDITIONS - Control pace from the front, make it a stamina test";
        } else if (pace === 'moderate') {
            return "Good conditions - press early pace but be ready for challenges";
        } else { // fast pace
            return "CHALLENGING CONDITIONS - Consider letting another horse set pace, draft early";
        }
    }
    
    /**
     * Get energy management warning based on distance and stats
     * @param {number} distance - Race distance
     * @param {Object} horseStats - Horse statistics  
     * @returns {string} Energy warning
     */
    getEnergyWarning(distance, horseStats) {
        const staminaRatio = horseStats.stamina / 100;
        
        if (distance <= 1400) {
            if (staminaRatio < 0.5) {
                return "SHORT RACE - Your style favors this distance despite lower stamina";
            } else {
                return "SHORT RACE - Perfect for wire-to-wire dominance";
            }
        } else if (distance <= 1800) {
            if (staminaRatio < 0.6) {
                return "MEDIUM DISTANCE - Pace conservation crucial, consider more tactical approach";
            } else {
                return "MEDIUM DISTANCE - Strong stamina supports front-running tactics";
            }
        } else {
            if (staminaRatio < 0.7) {
                return "LONG DISTANCE - High risk strategy, ensure adequate stamina reserves";
            } else {
                return "LONG DISTANCE - Elite stamina required for wire-to-wire at this distance";
            }
        }
    }
    
    /**
     * Analyze competition for front-running strategy
     * @param {Object} raceInfo - Race information
     * @param {Object} horseStats - Horse statistics
     * @returns {string} Competition analysis
     */
    analyzeCompetition(raceInfo, horseStats) {
        const { rivals = [] } = raceInfo;
        
        if (rivals.length === 0) {
            return "Competition unknown - rely on pace judgment and stamina management";
        }
        
        const otherFrontRunners = rivals.filter(r => r.racingStyle === 'Front Runner').length;
        const closers = rivals.filter(r => r.racingStyle === 'Closer').length;
        
        if (otherFrontRunners >= 2) {
            return "Multiple front runners - expect hot early pace, consider tactical adjustment";
        } else if (otherFrontRunners === 1) {
            return "One other front runner - pace duel likely, ensure superior early speed";
        } else if (closers >= 3) {
            return "Closer-heavy field - control pace to prevent strong finishing kicks";
        } else {
            return "Balanced competition - front-running tactics should be effective";
        }
    }
    
    /**
     * Get key tactical points for Front Runner style
     * @param {Object} raceInfo - Race information
     * @param {Object} horseStats - Horse statistics
     * @returns {Array<string>} Key tactical points
     */
    getKeyTactics(raceInfo, horseStats) {
        return [
            "Break alertly from gate - early position is crucial",
            "Establish lead or press pace within first quarter-mile",
            "Control tempo to suit your stamina capabilities",
            "Monitor following horses - increase pace when threatened",
            "Save enough energy for final drive to the wire"
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
                return 1.12; // Excellent synergy - speed + front running
            case 'Miler':
                return 1.06; // Good synergy - tactical flexibility
            case 'Stayer':
                return 0.96; // Slight penalty - stamina focus vs aggressive pace
            default:
                return 1.0;
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
            case 'leadingRace':
                // More efficient when controlling pace from front
                if (position <= 2 && phase !== 'late') {
                    return 0.92;
                }
                return 1.0;
                
            case 'slowPace':
                // Very efficient in slow pace races
                if (pace === 'slow') {
                    return 0.88;
                }
                return 1.0;
                
            case 'earlyPositioning':
                // Slightly more efficient at getting early position
                if (phase === 'early') {
                    return 0.95;
                }
                return 1.0;
                
            case 'pacePressure':
                // Less efficient when under pace pressure
                if (pace === 'fast' && phase === 'early') {
                    return 1.10;
                }
                return 1.0;
                
            default:
                return 1.0;
        }
    }
    
    /**
     * Get performance bonuses for front-running situations
     * @param {Object} raceContext - Current race context
     * @returns {number} Performance bonus multiplier
     */
    getPerformanceBonus(raceContext) {
        const { phase, position, pace, distance } = raceContext;
        let bonus = 1.0;
        
        // Leading race bonus
        if (position === 1) {
            if (phase === 'early') bonus *= 1.10;
            if (phase === 'middle') bonus *= 1.08;
            if (phase === 'late') bonus *= 1.05; // Harder to maintain late
        }
        
        // Pace control bonus
        if (pace === 'slow' && position <= 2) {
            bonus *= 1.12;
        }
        
        // Distance suitability
        if (distance <= 1400 && position <= 3) {
            bonus *= 1.08; // Front running works well in sprints
        }
        
        // Gate speed bonus
        if (phase === 'early' && position <= 3) {
            bonus *= 1.15;
        }
        
        return bonus;
    }
    
    /**
     * Get achievements possible with Front Runner style
     * @returns {Array<Object>} Possible achievements
     */
    getPossibleAchievements() {
        return [
            {
                name: "Wire to Wire",
                description: "Win a race leading from start to finish",
                difficulty: "Easy"
            },
            {
                name: "Pace Setter",
                description: "Lead at halfway point in 5 consecutive races",
                difficulty: "Medium"
            },
            {
                name: "Gate Master",
                description: "Break from gate to 1st place within 200m in 3 races",
                difficulty: "Medium"
            },
            {
                name: "Front Runner's Gambit",
                description: "Win a race 1800m+ using front-running tactics",
                difficulty: "Hard"
            },
            {
                name: "Pace Controller",
                description: "Win 3 races by controlling a slow early pace",
                difficulty: "Medium"
            },
            {
                name: "Speed Demon",
                description: "Win with front-running style after leading by 3+ lengths",
                difficulty: "Hard"
            }
        ];
    }
    
    /**
     * Get weaknesses and risks of Front Runner style
     * @returns {Object} Weakness analysis and mitigation
     */
    getWeaknesses() {
        return {
            primaryRisk: "Vulnerable to pace pressure and energy depletion",
            challengingConditions: [
                "Fast early pace races with multiple speed horses",
                "Long distances without adequate stamina reserves",
                "Large fields with multiple front-running competitors"
            ],
            strategicCounters: [
                "Stalkers can draft behind and out-kick late",
                "Closers benefit when front runners set fast pace",
                "Multiple speed horses can force unsustainable pace duel"
            ],
            mitigation: [
                "Develop adequate stamina for sustained pace pressure",
                "Learn tactical flexibility - not every race requires wire-to-wire",
                "Analyze competition pre-race to avoid pace duels",
                "Consider stalking tactics when facing other front runners"
            ],
            idealConditions: [
                "Small fields with few other speed horses",
                "Races where you have clear early speed advantage",
                "Slow-pace scenarios where you can control tempo",
                "Sprint distances that favor early speed"
            ]
        };
    }
    
    /**
     * Get display information with Front Runner-specific details
     * @returns {Object} Enhanced display information
     */
    getDisplayInfo() {
        const baseInfo = super.getDisplayInfo();
        return {
            ...baseInfo,
            difficulty: "Medium",
            playstyle: "Aggressive early pace with wire-to-wire ambitions",
            idealFor: "Players who enjoy controlling race tempo and early positioning",
            notableFeature: "50% early energy usage for dominant gate speed",
            bestConditions: "Slow-pace races and sprint distances",
            racingPhilosophy: "The best defense is a good offense - lead them from pillar to post",
            energyPattern: "Aggressive early (50%) - Maintain middle (30%) - Survive late (20%)",
            riskLevel: "Medium-High due to energy commitment and pace pressure vulnerability"
        };
    }
}

module.exports = FrontRunner;