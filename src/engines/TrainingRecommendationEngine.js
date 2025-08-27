const BreedRegistry = require('../models/breeds/BreedRegistry');
const SpecializationRegistry = require('../models/specializations/SpecializationRegistry');
const RacingStyleRegistry = require('../models/styles/RacingStyleRegistry');

/**
 * Advanced training recommendation engine for v1.0
 * 
 * Integrates breed characteristics, racing specializations, and racing styles
 * to provide intelligent, personalized training recommendations throughout
 * a horse's career development.
 * 
 * @class TrainingRecommendationEngine
 */
class TrainingRecommendationEngine {
    constructor() {
        this.breedRegistry = BreedRegistry;
        this.specializationRegistry = SpecializationRegistry;
        this.styleRegistry = RacingStyleRegistry;
    }
    
    /**
     * Get comprehensive training recommendations for a horse
     * @param {Object} horse - The horse object with breed, specialization, style, stats
     * @param {number} currentTurn - Current career turn (1-24)
     * @param {Array<Object>} upcomingRaces - Array of upcoming race information
     * @param {Object} options - Additional options for recommendations
     * @returns {Object} Comprehensive training recommendations
     */
    getTrainingRecommendations(horse, currentTurn, upcomingRaces = [], options = {}) {
        const breed = this.breedRegistry.getBreed(horse.breed);
        const specialization = this.specializationRegistry.getSpecialization(horse.specialization);
        const racingStyle = this.styleRegistry.getStyle(horse.racingStyle);
        
        // Analyze current horse state
        const analysis = this.analyzeHorseState(horse, breed, specialization, racingStyle);
        
        // Generate multi-layered recommendations
        const recommendations = {
            // Core recommendation data
            horse: horse.name,
            turn: currentTurn,
            careerPhase: this.getCareerPhase(currentTurn),
            
            // Individual system recommendations
            breedRecommendations: this.getBreedRecommendations(horse, breed, currentTurn),
            specializationRecommendations: this.getSpecializationRecommendations(horse, specialization, currentTurn),
            styleRecommendations: this.getStyleRecommendations(horse, racingStyle, currentTurn),
            
            // Integrated recommendations
            priorityStats: this.calculateStatPriorities(horse, breed, specialization, racingStyle),
            trainingEfficiencyAnalysis: this.analyzeTrainingEfficiency(horse, breed, specialization),
            upcomingRacePreparation: this.getUpcomingRacePrep(horse, upcomingRaces, breed, specialization, racingStyle),
            
            // Actionable guidance
            topRecommendations: this.getTopRecommendations(analysis, currentTurn, upcomingRaces),
            warningsAndConcerns: this.identifyWarningsAndConcerns(analysis, currentTurn),
            strategicAdvice: this.getStrategicAdvice(analysis, currentTurn, upcomingRaces)
        };
        
        return recommendations;
    }
    
    /**
     * Analyze the current state of a horse across all systems
     * @param {Object} horse - Horse data
     * @param {Object} breed - Breed instance
     * @param {Object} specialization - Specialization instance
     * @param {Object} racingStyle - Racing style instance
     * @returns {Object} Comprehensive analysis
     */
    analyzeHorseState(horse, breed, specialization, racingStyle) {
        const stats = horse.stats || { speed: 0, stamina: 0, power: 0 };
        const totalStats = stats.speed + stats.stamina + stats.power;
        const avgStat = totalStats / 3;
        
        return {
            // Basic metrics
            totalStats,
            avgStat,
            highestStat: Math.max(stats.speed, stats.stamina, stats.power),
            lowestStat: Math.min(stats.speed, stats.stamina, stats.power),
            statBalance: this.calculateStatBalance(stats),
            
            // System-specific analysis
            breedAlignment: this.analyzeBreeAlignment(stats, breed),
            specializationAlignment: this.analyzeSpecializationAlignment(stats, specialization),
            styleCompatibility: this.analyzeStyleCompatibility(stats, racingStyle),
            
            // Development potential
            growthPotential: this.calculateGrowthPotential(stats, breed, specialization),
            cappedStats: this.identifyCappedStats(stats, breed),
            
            // Strategic positioning
            competitivePosition: this.assessCompetitivePosition(stats, avgStat),
            developmentStage: this.assessDevelopmentStage(stats, totalStats)
        };
    }
    
    /**
     * Calculate statistical balance across speed, stamina, power
     * @param {Object} stats - Current stats
     * @returns {number} Balance score (0-1, where 1 is perfectly balanced)
     */
    calculateStatBalance(stats) {
        const values = Object.values(stats);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Convert to balance score (lower deviation = better balance)
        return Math.max(0, 1 - (standardDeviation / avg));
    }
    
    /**
     * Analyze how well current stats align with breed strengths
     * @param {Object} stats - Current stats
     * @param {Object} breed - Breed instance
     * @returns {Object} Breed alignment analysis
     */
    analyzeBreeAlignment(stats, breed) {
        const alignment = {};
        
        for (const [stat, value] of Object.entries(stats)) {
            const growthRate = breed.getGrowthRate(stat);
            const statCap = breed.getStatCap(stat);
            const capUtilization = value / statCap;
            
            alignment[stat] = {
                current: value,
                cap: statCap,
                capUtilization: capUtilization,
                growthRate: growthRate,
                efficiency: growthRate * (1 - capUtilization), // Higher when far from cap with good growth
                recommendation: this.getStatRecommendation(value, statCap, growthRate)
            };
        }
        
        return alignment;
    }
    
    /**
     * Get stat-specific recommendation based on current value, cap, and growth rate
     * @param {number} current - Current stat value
     * @param {number} cap - Stat cap from breed
     * @param {number} growthRate - Growth rate modifier
     * @returns {string} Recommendation text
     */
    getStatRecommendation(current, cap, growthRate) {
        const utilization = current / cap;
        
        if (utilization >= 0.95) {
            return 'At cap - no further development possible';
        } else if (utilization >= 0.85) {
            return 'Near cap - diminishing returns on training';
        } else if (growthRate >= 1.2 && utilization < 0.7) {
            return 'High priority - excellent growth rate and room for development';
        } else if (growthRate >= 1.1) {
            return 'Good priority - above-average growth potential';
        } else if (growthRate < 0.95) {
            return 'Low priority - below-average growth rate for this breed';
        } else {
            return 'Moderate priority - standard growth potential';
        }
    }
    
    /**
     * Analyze alignment with racing specialization
     * @param {Object} stats - Current stats
     * @param {Object} specialization - Specialization instance
     * @returns {Object} Specialization alignment analysis
     */
    analyzeSpecializationAlignment(stats, specialization) {
        const primaryStats = specialization.getPrimaryStats();
        const weakStats = specialization.getWeakStats(stats);
        
        let alignmentScore = 0;
        const statScores = {};
        
        for (const [stat, weight] of Object.entries(specialization.statWeighting)) {
            const expectedValue = stats.speed + stats.stamina + stats.power; // Total stats
            const actualValue = stats[stat];
            const expectedForStat = (expectedValue / 3) * (weight / 0.33); // Adjust for weighting
            
            const alignmentRatio = actualValue / expectedForStat;
            statScores[stat] = {
                actual: actualValue,
                expected: expectedForStat,
                alignment: alignmentRatio,
                weight: weight,
                isPrimary: primaryStats.includes(stat),
                isWeak: weakStats.includes(stat)
            };
            
            alignmentScore += alignmentRatio * weight;
        }
        
        return {
            overallScore: alignmentScore,
            statBreakdown: statScores,
            primaryStats,
            weakStats,
            recommendation: this.getSpecializationRecommendation(alignmentScore, weakStats)
        };
    }
    
    /**
     * Get recommendation based on specialization alignment
     * @param {number} alignmentScore - Overall alignment score
     * @param {Array<string>} weakStats - Stats that need attention
     * @returns {string} Recommendation
     */
    getSpecializationRecommendation(alignmentScore, weakStats) {
        if (alignmentScore >= 1.1) {
            return 'Excellent specialization alignment - continue current approach';
        } else if (alignmentScore >= 0.95) {
            return 'Good alignment with specialization goals';
        } else if (weakStats.length > 0) {
            return `Address weak ${weakStats.join(' and ')} to improve specialization effectiveness`;
        } else {
            return 'Focus on primary stats for better specialization alignment';
        }
    }
    
    /**
     * Calculate training efficiency for each stat
     * @param {Object} horse - Horse data
     * @param {Object} breed - Breed instance
     * @param {Object} specialization - Specialization instance
     * @returns {Object} Training efficiency analysis
     */
    analyzeTrainingEfficiency(horse, breed, specialization) {
        const analysis = {};
        
        for (const stat of ['speed', 'stamina', 'power']) {
            const breedModifier = breed.getGrowthRate(stat);
            const specializationModifier = specialization.getTrainingBonus(stat);
            const combinedEfficiency = breedModifier * specializationModifier;
            
            analysis[stat] = {
                breedModifier,
                specializationModifier,
                combinedEfficiency,
                rating: this.getEfficiencyRating(combinedEfficiency),
                recommendation: this.getEfficiencyRecommendation(combinedEfficiency)
            };
        }
        
        // Rank stats by efficiency
        const rankedStats = Object.entries(analysis)
            .sort(([,a], [,b]) => b.combinedEfficiency - a.combinedEfficiency)
            .map(([stat]) => stat);
        
        analysis.ranking = rankedStats;
        analysis.mostEfficient = rankedStats[0];
        analysis.leastEfficient = rankedStats[2];
        
        return analysis;
    }
    
    /**
     * Get efficiency rating text
     * @param {number} efficiency - Combined efficiency multiplier
     * @returns {string} Rating
     */
    getEfficiencyRating(efficiency) {
        if (efficiency >= 1.4) return 'Exceptional';
        if (efficiency >= 1.25) return 'Excellent';
        if (efficiency >= 1.15) return 'Very Good';
        if (efficiency >= 1.05) return 'Good';
        if (efficiency >= 0.95) return 'Average';
        if (efficiency >= 0.85) return 'Below Average';
        return 'Poor';
    }
    
    /**
     * Get efficiency-based training recommendation
     * @param {number} efficiency - Efficiency multiplier
     * @returns {string} Recommendation
     */
    getEfficiencyRecommendation(efficiency) {
        if (efficiency >= 1.25) {
            return 'High priority - exceptional development rate';
        } else if (efficiency >= 1.15) {
            return 'Good priority - strong development potential';
        } else if (efficiency >= 0.95) {
            return 'Standard priority - normal development rate';
        } else {
            return 'Low priority - consider focusing elsewhere';
        }
    }
    
    /**
     * Calculate stat training priorities based on all systems
     * @param {Object} horse - Horse data
     * @param {Object} breed - Breed instance
     * @param {Object} specialization - Specialization instance
     * @param {Object} racingStyle - Racing style instance
     * @returns {Array<Object>} Prioritized stat recommendations
     */
    calculateStatPriorities(horse, breed, specialization, racingStyle) {
        const stats = horse.stats || { speed: 0, stamina: 0, power: 0 };
        const priorities = [];
        
        for (const stat of ['speed', 'stamina', 'power']) {
            // Breed factors
            const breedGrowth = breed.getGrowthRate(stat);
            const breedCap = breed.getStatCap(stat);
            const capUtilization = stats[stat] / breedCap;
            
            // Specialization factors
            const specializationBonus = specialization.getTrainingBonus(stat);
            const specializationWeight = specialization.statWeighting[stat] || 0.33;
            
            // Current state factors
            const currentValue = stats[stat];
            const remainingPotential = breedCap - currentValue;
            
            // Calculate priority score
            let priorityScore = 0;
            
            // Efficiency component (40%)
            priorityScore += (breedGrowth * specializationBonus) * 0.4;
            
            // Specialization importance (30%)
            priorityScore += specializationWeight * 3 * 0.3;
            
            // Remaining potential (20%)
            priorityScore += (remainingPotential / breedCap) * 0.2;
            
            // Current deficit (10%) - bonus for stats that are behind
            const avgStat = (stats.speed + stats.stamina + stats.power) / 3;
            if (currentValue < avgStat * 0.9) {
                priorityScore += 0.1;
            }
            
            priorities.push({
                stat,
                priorityScore,
                currentValue,
                breedCap,
                capUtilization,
                breedGrowth,
                specializationBonus,
                specializationWeight,
                remainingPotential,
                recommendation: this.getStatPriorityRecommendation(priorityScore, capUtilization)
            });
        }
        
        return priorities.sort((a, b) => b.priorityScore - a.priorityScore);
    }
    
    /**
     * Get priority recommendation text
     * @param {number} priorityScore - Calculated priority score
     * @param {number} capUtilization - How close to stat cap (0-1)
     * @returns {string} Priority recommendation
     */
    getStatPriorityRecommendation(priorityScore, capUtilization) {
        if (capUtilization >= 0.95) {
            return 'CAPPED - No further development possible';
        } else if (priorityScore >= 1.0) {
            return 'HIGH PRIORITY - Excellent development opportunity';
        } else if (priorityScore >= 0.8) {
            return 'GOOD PRIORITY - Solid development potential';
        } else if (priorityScore >= 0.6) {
            return 'MODERATE PRIORITY - Average development value';
        } else {
            return 'LOW PRIORITY - Limited development benefit';
        }
    }
    
    /**
     * Get top actionable training recommendations
     * @param {Object} analysis - Horse state analysis
     * @param {number} currentTurn - Current career turn
     * @param {Array<Object>} upcomingRaces - Upcoming races
     * @returns {Array<string>} Top recommendations
     */
    getTopRecommendations(analysis, currentTurn, upcomingRaces) {
        const recommendations = [];
        
        // Career phase recommendations
        const careerPhase = this.getCareerPhase(currentTurn);
        if (careerPhase === 'early') {
            recommendations.push("Build balanced foundation across all stats early in career");
        } else if (careerPhase === 'mid') {
            recommendations.push("Focus on specialization strengths while addressing weak stats");
        } else {
            recommendations.push("Fine-tune stats for championship races and peak performance");
        }
        
        // Stat balance recommendations
        if (analysis.statBalance < 0.7 && careerPhase === 'early') {
            recommendations.push(`Address stat imbalance - lowest stat is ${analysis.lowestStat}`);
        }
        
        // Breed utilization recommendations
        if (analysis.breedAlignment.speed.efficiency > 0.8) {
            recommendations.push("Prioritize speed training - excellent breed compatibility");
        }
        if (analysis.breedAlignment.stamina.efficiency > 0.8) {
            recommendations.push("Focus on stamina development - strong breed advantage");
        }
        if (analysis.breedAlignment.power.efficiency > 0.8) {
            recommendations.push("Emphasize power training - good breed synergy");
        }
        
        // Upcoming race preparation
        if (upcomingRaces.length > 0) {
            const nextRace = upcomingRaces[0];
            if (nextRace.distance <= 1400) {
                recommendations.push("Prepare for sprint race - focus on speed and power");
            } else if (nextRace.distance >= 1800) {
                recommendations.push("Prepare for distance race - emphasize stamina development");
            }
        }
        
        return recommendations.slice(0, 5); // Top 5 recommendations
    }
    
    /**
     * Identify potential warnings and concerns
     * @param {Object} analysis - Horse state analysis
     * @param {number} currentTurn - Current career turn
     * @returns {Array<string>} Warnings and concerns
     */
    identifyWarningsAndConcerns(analysis, currentTurn) {
        const warnings = [];
        
        // Development rate concerns
        if (currentTurn >= 12 && analysis.totalStats < 150) {
            warnings.push("Below-average development rate for mid-career horse");
        }
        
        // Stat cap approaching
        analysis.cappedStats?.forEach(stat => {
            warnings.push(`${stat} approaching breed cap - consider alternative training focus`);
        });
        
        // Specialization misalignment
        if (analysis.specializationAlignment.overallScore < 0.8) {
            warnings.push("Current stats don't align well with chosen specialization");
        }
        
        // Extreme stat imbalance
        if (analysis.highestStat - analysis.lowestStat > 30) {
            warnings.push("Extreme stat imbalance may limit racing versatility");
        }
        
        return warnings;
    }
    
    /**
     * Get strategic advice for long-term development
     * @param {Object} analysis - Horse state analysis
     * @param {number} currentTurn - Current career turn
     * @param {Array<Object>} upcomingRaces - Upcoming races
     * @returns {Array<string>} Strategic advice
     */
    getStrategicAdvice(analysis, currentTurn, upcomingRaces) {
        const advice = [];
        
        // Career phase strategy
        const careerPhase = this.getCareerPhase(currentTurn);
        if (careerPhase === 'early') {
            advice.push("Focus on building strong foundation - avoid over-specializing too early");
        } else if (careerPhase === 'late') {
            advice.push("Optimize existing strengths rather than addressing major weaknesses");
        }
        
        // Breed-specialization synergy advice
        if (analysis.breedAlignment && analysis.specializationAlignment) {
            advice.push("Leverage breed strengths that align with your specialization");
        }
        
        // Racing preparation strategy
        if (upcomingRaces.length >= 2) {
            const distances = upcomingRaces.map(r => r.distance);
            const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
            
            if (avgDistance <= 1500) {
                advice.push("Career schedule favors speed - prioritize sprint preparation");
            } else if (avgDistance >= 1900) {
                advice.push("Distance-heavy schedule - emphasize stamina development");
            } else {
                advice.push("Balanced race schedule - maintain tactical flexibility");
            }
        }
        
        return advice;
    }
    
    /**
     * Determine career phase based on current turn
     * @param {number} currentTurn - Current career turn (1-24)
     * @returns {string} Career phase ('early', 'mid', 'late')
     */
    getCareerPhase(currentTurn) {
        if (currentTurn <= 8) return 'early';
        if (currentTurn <= 16) return 'mid';
        return 'late';
    }
    
    /**
     * Get breed-specific recommendations
     * @param {Object} horse - Horse data
     * @param {Object} breed - Breed instance
     * @param {number} currentTurn - Current career turn
     * @returns {Array<string>} Breed-specific recommendations
     */
    getBreedRecommendations(horse, breed, currentTurn) {
        if (breed.getTrainingRecommendations) {
            return breed.getTrainingRecommendations();
        }
        return [`Focus on ${breed.name} breed strengths for optimal development`];
    }
    
    /**
     * Get specialization-specific recommendations
     * @param {Object} horse - Horse data
     * @param {Object} specialization - Specialization instance
     * @param {number} currentTurn - Current career turn
     * @returns {Array<string>} Specialization-specific recommendations
     */
    getSpecializationRecommendations(horse, specialization, currentTurn) {
        const stats = horse.stats || { speed: 0, stamina: 0, power: 0 };
        return specialization.getTrainingRecommendations(stats, currentTurn);
    }
    
    /**
     * Get racing style-specific recommendations
     * @param {Object} horse - Horse data
     * @param {Object} racingStyle - Racing style instance
     * @param {number} currentTurn - Current career turn
     * @returns {Array<string>} Racing style-specific recommendations
     */
    getStyleRecommendations(horse, racingStyle, currentTurn) {
        // Racing styles don't have direct training recommendations,
        // but they influence energy management and tactical preparation
        return [
            `Train with ${racingStyle.name} energy management in mind`,
            "Develop stats that complement your racing style preferences"
        ];
    }
    
    /**
     * Get upcoming race preparation recommendations
     * @param {Object} horse - Horse data
     * @param {Array<Object>} upcomingRaces - Upcoming races
     * @param {Object} breed - Breed instance
     * @param {Object} specialization - Specialization instance
     * @param {Object} racingStyle - Racing style instance
     * @returns {Array<Object>} Race preparation recommendations
     */
    getUpcomingRacePrep(horse, upcomingRaces, breed, specialization, racingStyle) {
        return upcomingRaces.map((race, index) => {
            const distanceMatch = specialization.getDistanceMatchFactor(race.distance);
            const surfacePreference = breed.getSurfacePreference(race.surface);
            const styleStrategy = racingStyle.getRaceStrategy(race);
            
            return {
                raceNumber: index + 1,
                race,
                distanceMatch: distanceMatch >= 1.0 ? 'Favorable' : 'Challenging',
                surfaceAdvantage: surfacePreference >= 1.0 ? 'Advantage' : 'Neutral',
                recommendedStrategy: styleStrategy,
                preparationAdvice: this.getRacePreparationAdvice(race, distanceMatch, surfacePreference)
            };
        });
    }
    
    /**
     * Get race-specific preparation advice
     * @param {Object} race - Race information
     * @param {number} distanceMatch - Distance match factor
     * @param {number} surfacePreference - Surface preference multiplier
     * @returns {string} Preparation advice
     */
    getRacePreparationAdvice(race, distanceMatch, surfacePreference) {
        let advice = [];
        
        if (distanceMatch >= 1.1) {
            advice.push("Distance strongly favors your specialization");
        } else if (distanceMatch < 0.9) {
            advice.push("Challenging distance - focus on energy management");
        }
        
        if (surfacePreference >= 1.05) {
            advice.push("Surface advantage - can race more aggressively");
        } else if (surfacePreference < 0.95) {
            advice.push("Surface disadvantage - use conservative tactics");
        }
        
        return advice.join('; ') || "Standard race preparation recommended";
    }
    
    /**
     * Calculate growth potential based on current stats and breed caps
     * @param {Object} stats - Current stats
     * @param {Object} breed - Breed instance
     * @param {Object} specialization - Specialization instance
     * @returns {Object} Growth potential analysis
     */
    calculateGrowthPotential(stats, breed, specialization) {
        const potential = {};
        let totalPotential = 0;
        
        for (const stat of ['speed', 'stamina', 'power']) {
            const current = stats[stat];
            const cap = breed.getStatCap(stat);
            const remaining = cap - current;
            const growthRate = breed.getGrowthRate(stat) * specialization.getTrainingBonus(stat);
            
            potential[stat] = {
                current,
                cap,
                remaining,
                growthRate,
                effectivePotential: remaining * growthRate
            };
            
            totalPotential += potential[stat].effectivePotential;
        }
        
        return {
            byStats: potential,
            totalPotential,
            developmentStage: this.assessDevelopmentStage(stats, stats.speed + stats.stamina + stats.power)
        };
    }
    
    /**
     * Identify stats that are at or near breed caps
     * @param {Object} stats - Current stats
     * @param {Object} breed - Breed instance
     * @returns {Array<string>} Array of capped or near-capped stat names
     */
    identifyCappedStats(stats, breed) {
        const cappedStats = [];
        
        for (const [stat, value] of Object.entries(stats)) {
            const cap = breed.getStatCap(stat);
            const utilization = value / cap;
            
            if (utilization >= 0.95) {
                cappedStats.push(stat);
            }
        }
        
        return cappedStats;
    }
    
    /**
     * Assess competitive position based on stats
     * @param {Object} stats - Current stats
     * @param {number} avgStat - Average stat value
     * @returns {string} Competitive assessment
     */
    assessCompetitivePosition(stats, avgStat) {
        const totalStats = stats.speed + stats.stamina + stats.power;
        
        if (totalStats >= 240) return 'Elite tier - championship caliber';
        if (totalStats >= 210) return 'High competitive - strong contender';
        if (totalStats >= 180) return 'Competitive - solid performer';
        if (totalStats >= 150) return 'Developing - building competitiveness';
        return 'Early development - focus on growth';
    }
    
    /**
     * Assess development stage based on total stats
     * @param {Object} stats - Current stats
     * @param {number} totalStats - Sum of all stats
     * @returns {string} Development stage assessment
     */
    assessDevelopmentStage(stats, totalStats) {
        if (totalStats < 90) return 'Early Foundation';
        if (totalStats < 150) return 'Basic Development';
        if (totalStats < 210) return 'Advanced Training';
        if (totalStats < 270) return 'Elite Development';
        return 'Peak Performance';
    }
    
    /**
     * Analyze style compatibility with current stats
     * @param {Object} stats - Current stats
     * @param {Object} racingStyle - Racing style instance
     * @returns {Object} Style compatibility analysis
     */
    analyzeStyleCompatibility(stats, racingStyle) {
        // This is a simplified analysis - racing styles are more about tactics than stats
        // But certain stat profiles work better with certain styles
        
        const totalStats = stats.speed + stats.stamina + stats.power;
        const speedRatio = stats.speed / totalStats;
        const staminaRatio = stats.stamina / totalStats;
        
        let compatibility = 1.0;
        let recommendation = "Current stats are compatible with your racing style";
        
        if (racingStyle.name === 'Front Runner') {
            if (speedRatio < 0.35 && staminaRatio < 0.35) {
                compatibility = 0.8;
                recommendation = "Consider developing more speed/stamina for front-running tactics";
            } else if (speedRatio >= 0.4) {
                compatibility = 1.15;
                recommendation = "Excellent speed for front-running dominance";
            }
        } else if (racingStyle.name === 'Closer') {
            if (staminaRatio < 0.35) {
                compatibility = 0.8;
                recommendation = "Build more stamina for effective closing tactics";
            } else if (staminaRatio >= 0.4) {
                compatibility = 1.15;
                recommendation = "Superior stamina perfect for late-race kicks";
            }
        }
        
        return {
            compatibilityScore: compatibility,
            recommendation
        };
    }
}

module.exports = TrainingRecommendationEngine;