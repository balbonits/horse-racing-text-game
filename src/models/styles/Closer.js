const RacingStyle = require('./RacingStyle');

/**
 * Closer racing style - Patient late-race acceleration and finishing kick
 * 
 * Closers use conservative early positioning to preserve energy for devastating
 * late-race moves. They excel at making up ground in the final stages when
 * rivals are tiring, relying on superior stamina and finishing speed.
 * 
 * Characteristics:
 * - Conservative energy usage (25% early, 30% middle, 45% late)
 * - Patient early positioning: 6th-10th, finishing 1st-3rd
 * - Devastating in fast-pace races when leaders tire
 * - Best with Stayer and some Miler specializations
 * 
 * @class Closer
 * @extends RacingStyle
 */
class Closer extends RacingStyle {
    constructor() {
        const config = {
            energyStrategy: {
                early: 0.25,    // Conservative early positioning
                middle: 0.30,   // Gradual advancement
                late: 0.45      // Explosive finishing drive
            },
            positionPreference: {
                early: [6, 10], // Patient back-of-pack positioning
                middle: [4, 8], // Begin gradual move forward
                late: [1, 3]    // Strong finishing kick
            },
            paceProfile: {
                fast: 1.15,     // Excellent in fast pace (leaders tire)
                moderate: 1.00, // Neutral in moderate pace
                slow: 0.90      // Disadvantaged by slow pace
            },
            description: "Patient late-race acceleration with explosive finishing kicks. Conserve energy early to deliver devastating moves when rivals are most vulnerable.",
            strengths: [
                "Devastating late-race acceleration and finishing speed",
                "Superior energy conservation in early race phases",
                "Excellent performance when early pace is fast",
                "Strong ability to make up significant ground late"
            ],
            compatibleSpecializations: ['Stayer', 'Miler'] // Less compatible with Sprinters
        };
        
        super('Closer', config);
    }
    
    /**
     * Get specialized tactical recommendations for Closers
     * @param {Object} raceInfo - Information about the race
     * @param {Object} horseStats - Current horse statistics
     * @returns {Object} Enhanced tactical recommendations
     */
    getTacticalRecommendations(raceInfo, horseStats) {
        const baseRecommendations = super.getTacticalRecommendations(raceInfo, horseStats);
        const { distance, pace, fieldSize } = raceInfo;
        
        const closerAdvice = {
            ...baseRecommendations,
            patienceStrategy: this.getPatienceStrategy(pace, distance, fieldSize),
            finishingPlan: this.getFinishingPlan(distance, horseStats),
            riskAssessment: this.assessClosingRisks(raceInfo, horseStats),
            groundToMakeUp: this.calculateGroundToMakeUp(raceInfo, horseStats)
        };
        
        return closerAdvice;
    }
    
    /**
     * Get patience strategy based on race conditions
     * @param {string} pace - Expected race pace
     * @param {number} distance - Race distance
     * @param {number} fieldSize - Number of horses
     * @returns {string} Patience strategy
     */
    getPatienceStrategy(pace, distance, fieldSize) {
        let baseStrategy = "Settle last 25% of field early, begin move at 1/2 mile point";
        
        if (pace === 'fast') {
            return "IDEAL CONDITIONS - " + baseStrategy + " Fast pace will tire leaders perfectly";
        } else if (pace === 'slow') {
            return "CHALLENGING - Position closer (5th-7th early) as slow pace reduces closing advantage";
        } else {
            return baseStrategy + " - Moderate pace allows standard closing tactics";
        }
    }
    
    /**
     * Get finishing plan based on distance and stats
     * @param {number} distance - Race distance
     * @param {Object} horseStats - Horse statistics
     * @returns {string} Finishing plan
     */
    getFinishingPlan(distance, horseStats) {
        const staminaRatio = horseStats.stamina / 100;
        const speedRatio = horseStats.speed / 100;
        
        if (distance <= 1400) {
            if (speedRatio > 0.7) {
                return "SHORT RACE - Make explosive move at 1/8 pole, use raw speed for kick";
            } else {
                return "SHORT RACE - CHALLENGING distance, need early positioning improvement";
            }
        } else if (distance <= 1800) {
            return "GOOD DISTANCE - Begin sustained move at 3/8 pole, strong to wire";
        } else {
            if (staminaRatio > 0.7) {
                return "IDEAL DISTANCE - Patient approach, crushing move at 1/4 pole when others tire";
            } else {
                return "LONG RACE - Very patient, final 200m explosion when you have stamina advantage";
            }
        }
    }
    
    /**
     * Assess risks of closing tactics for this race
     * @param {Object} raceInfo - Race information
     * @param {Object} horseStats - Horse statistics
     * @returns {Array<string>} Risk assessment
     */
    assessClosingRisks(raceInfo, horseStats) {
        const risks = [];
        const { pace, distance, fieldSize, rivals = [] } = raceInfo;
        
        if (pace === 'slow') {
            risks.push("Slow pace reduces leader fatigue - may not tire enough for effective close");
        }
        
        if (distance <= 1400) {
            risks.push("Short distance limits time to make up ground - need earlier positioning");
        }
        
        if (fieldSize < 8) {
            risks.push("Small field reduces pace pressure - leaders may not tire as expected");
        }
        
        const otherClosers = rivals.filter(r => r.racingStyle === 'Closer').length;
        if (otherClosers >= 2) {
            risks.push("Multiple closers - increased competition for late running room");
        }
        
        if (horseStats.speed < 50) {
            risks.push("Limited speed may not be sufficient for effective finishing kick");
        }
        
        if (risks.length === 0) {
            risks.push("Standard closing risks - ensure clear running room and proper timing");
        }
        
        return risks;
    }
    
    /**
     * Calculate ground that needs to be made up
     * @param {Object} raceInfo - Race information
     * @param {Object} horseStats - Horse statistics
     * @returns {string} Ground calculation and strategy
     */
    calculateGroundToMakeUp(raceInfo, horseStats) {
        const { distance, fieldSize } = raceInfo;
        
        // Estimate deficit based on positioning strategy
        const earlyPosition = (this.positionPreference.early[0] + this.positionPreference.early[1]) / 2;
        const estimatedLengthsBack = Math.round((earlyPosition - 1) * 1.5); // Rough estimation
        
        if (distance <= 1400) {
            return `Expect to be ${estimatedLengthsBack}+ lengths back early - need explosive speed to close gap quickly`;
        } else if (distance <= 1800) {
            return `Expect to be ${estimatedLengthsBack}+ lengths back early - sustained drive should close gap effectively`;
        } else {
            return `Expect to be ${estimatedLengthsBack}+ lengths back early - patient approach will wear down leaders over distance`;
        }
    }
    
    /**
     * Get key tactical points for Closer style
     * @param {Object} raceInfo - Race information
     * @param {Object} horseStats - Horse statistics
     * @returns {Array<string>} Key tactical points
     */
    getKeyTactics(raceInfo, horseStats) {
        return [
            "Break cleanly but settle in back third of field immediately",
            "Maintain patient position until halfway point - resist urge to move early",
            "Watch leaders for signs of fatigue - time move when they begin to tire",
            "Make wide move for clear running room - avoid getting trapped",
            "Deliver sustained finishing kick - not just one burst but continued acceleration"
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
                return 0.94; // Poor synergy - conflicting energy strategies
            case 'Miler':
                return 1.08; // Good synergy - tactical flexibility
            case 'Stayer':
                return 1.15; // Excellent synergy - stamina for late kick
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
            case 'energyConservation':
                // Excellent efficiency when conserving energy early
                if (phase === 'early' && position >= 6) {
                    return 0.78;
                }
                return 1.0;
                
            case 'lateRaceKick':
                // Very efficient when making late race move
                if (phase === 'late') {
                    return 0.85;
                }
                return 1.0;
                
            case 'fastPaceScenario':
                // Benefits when others are expending energy in fast pace
                if (pace === 'fast' && phase !== 'late') {
                    return 0.80;
                }
                return 1.0;
                
            case 'groundMaking':
                // Efficient when making up ground (natural ability)
                if (phase === 'middle' || phase === 'late') {
                    return 0.88;
                }
                return 1.0;
                
            default:
                return 1.0;
        }
    }
    
    /**
     * Get performance bonuses for closing situations
     * @param {Object} raceContext - Current race context
     * @returns {number} Performance bonus multiplier
     */
    getPerformanceBonus(raceContext) {
        const { phase, position, pace, distance, energyRemaining } = raceContext;
        let bonus = 1.0;
        
        // Late race positioning bonus
        if (phase === 'late' && position >= 4) {
            bonus *= 1.20; // Major bonus for late positioning
        }
        
        // Fast pace scenario bonus
        if (pace === 'fast' && energyRemaining > 0.7) {
            bonus *= 1.18;
        }
        
        // Energy conservation bonus
        if (phase === 'early' && energyRemaining > 0.9) {
            bonus *= 1.05;
        }
        
        // Distance suitability bonus
        if (distance >= 1800 && phase === 'late') {
            bonus *= 1.12;
        }
        
        // Ground-making bonus (closing from behind)
        if (phase === 'late' && position > 4) {
            bonus *= 1.15;
        }
        
        return bonus;
    }
    
    /**
     * Get late-race kick calculation
     * @param {Object} raceContext - Current race context
     * @returns {number} Late-race kick multiplier
     */
    getLateRaceKick(raceContext) {
        const { energyRemaining, position, phase, distance } = raceContext;
        
        if (phase !== 'late') {
            return 1.0;
        }
        
        // Base kick strength depends on energy reserves
        let kickMultiplier = 1.0 + (energyRemaining * 0.5); // Up to 1.5x with full energy
        
        // Position bonus for coming from behind
        if (position >= 6) {
            kickMultiplier *= 1.2;
        } else if (position >= 4) {
            kickMultiplier *= 1.1;
        }
        
        // Distance bonus for longer races
        if (distance >= 1800) {
            kickMultiplier *= 1.15;
        }
        
        return kickMultiplier;
    }
    
    /**
     * Get achievements possible with Closer style
     * @returns {Array<Object>} Possible achievements
     */
    getPossibleAchievements() {
        return [
            {
                name: "From the Clouds",
                description: "Win a race from 8th place or worse at the halfway point",
                difficulty: "Medium"
            },
            {
                name: "Late Surge",
                description: "Win 3 races by making up 5+ lengths in final quarter",
                difficulty: "Hard"
            },
            {
                name: "Energy Miser",
                description: "Win a race with 80%+ energy remaining at halfway point",
                difficulty: "Medium"
            },
            {
                name: "Pace Vulture",
                description: "Win 2 consecutive fast-pace races using closing tactics",
                difficulty: "Medium"
            },
            {
                name: "Marathon Closer",
                description: "Win all races 1800m+ in a career using closing style",
                difficulty: "Hard"
            },
            {
                name: "Lightning Strike",
                description: "Win by 3+ lengths after being last at the 3/4 point",
                difficulty: "Expert"
            }
        ];
    }
    
    /**
     * Get patience and timing strategies
     * @returns {Object} Detailed guidance for closing tactics
     */
    getPatienceStrategies() {
        return {
            earlyRace: [
                "Accept poor position early - patience is your weapon",
                "Track the pace from behind, don't worry about being last",
                "Save energy by avoiding early pace battles",
                "Position wide to avoid trouble and prepare for late move"
            ],
            midRace: [
                "Begin gradual move at halfway point, don't rush",
                "Look for openings but don't force your way through traffic",
                "Start building momentum for late surge",
                "Watch leaders for signs of fatigue"
            ],
            lateRace: [
                "Make explosive move when leaders show weakness",
                "Switch to outside for clear running room if needed",
                "Use sustained acceleration, not just one quick burst",
                "Keep driving to wire - many photo finishes favor closers"
            ],
            raceSelection: [
                "Target races with fast expected pace",
                "Look for large fields that create pace pressure",
                "Avoid races with multiple other closers",
                "Prefer longer distances that suit patient tactics"
            ]
        };
    }
    
    /**
     * Get weaknesses and mitigation for Closer style
     * @returns {Object} Weakness analysis and countermeasures
     */
    getWeaknesses() {
        return {
            primaryRisk: "Dependence on early pace scenario and clear late running room",
            challengingConditions: [
                "Slow early pace races where leaders don't tire",
                "Short sprint races with limited time to close",
                "Small fields with insufficient pace pressure",
                "Traffic problems in final turn limiting late moves"
            ],
            strategicCounters: [
                "Front runners can control slow pace to limit closing effectiveness",
                "Stalkers can beat closers to the punch with earlier moves",
                "Multiple closers create traffic jams and limit running room"
            ],
            mitigation: [
                "Develop tactical flexibility - not every race suits closing",
                "Improve positioning slightly in slow pace scenarios",
                "Build sufficient speed to be competitive in shorter races",
                "Practice wide moves to avoid traffic problems"
            ],
            successFactors: [
                "Fast early pace that tires leaders",
                "Adequate speed to deliver effective finishing kick",
                "Clear running room in final quarter",
                "Superior stamina to sustain late acceleration"
            ]
        };
    }
    
    /**
     * Get display information with Closer-specific details
     * @returns {Object} Enhanced display information
     */
    getDisplayInfo() {
        const baseInfo = super.getDisplayInfo();
        return {
            ...baseInfo,
            difficulty: "Hard",
            playstyle: "Patient energy conservation with explosive late acceleration",
            idealFor: "Patient players who enjoy dramatic come-from-behind victories",
            notableFeature: "45% late-race energy focus for devastating finishing kicks",
            bestConditions: "Fast-pace races and longer distances",
            racingPhilosophy: "Patience and timing - let them come back to you",
            energyPattern: "Conserve early (25%) - Build middle (30%) - Explode late (45%)",
            riskLevel: "High due to dependence on pace scenario and running room"
        };
    }
}

module.exports = Closer;