/**
 * StableOwner class - Represents the player as a stable owner/manager
 * 
 * Manages the player's profile, stable information, reputation, finances,
 * facilities, staff, and achievements in the racing industry.
 */

const Gender = require('../breeding/Gender');

class StableOwner {
    constructor(name, stableName, philosophy = 'balanced') {
        this.profile = {
            name: name || 'Unknown Owner',
            title: null,
            stableName: stableName || 'Unnamed Stable',
            founded: new Date(),
            philosophy: philosophy,
            reputation: 0,
            experience: 'Rookie',
            region: 'Kentucky',
            bio: null
        };

        this.financial = {
            cash: 50000,
            totalEarnings: 0,
            totalExpenses: 0,
            monthlyOperatingCost: 5000,
            netWorth: 50000,
            prizeMoneyEarned: 0,
            breedingIncome: 0,
            facilityUpgradeCosts: 0,
            staffSalaries: 0
        };

        this.facilities = {
            stalls: 10,
            maxStalls: 50,
            trainingTrack: 'basic',
            breedingBarn: false,
            veterinaryClinic: false,
            quarantineFacility: false,
            guestAccommodations: false,
            paddocks: 5,
            offices: 'basic',
            storage: 'adequate'
        };

        this.staff = {
            trainers: 1,
            jockeys: 0,
            grooms: 1,
            veterinarian: false,
            breedingSpecialist: false,
            facilityManager: false,
            assistant: false,
            totalStaff: 2
        };

        this.achievements = {
            racesWon: 0,
            gradeOneWins: 0,
            gradeOneRaces: [],
            breedingChampions: 0,
            yearEndAwards: [],
            prestigiousRaces: [],
            breedingSuccesses: [],
            milestones: []
        };

        this.statistics = {
            horsesOwned: 0,
            horsesRaced: 0,
            horsesBred: 0,
            horsesPurchased: 0,
            horsesSold: 0,
            totalStarts: 0,
            totalWins: 0,
            totalPlacings: 0,
            winPercentage: 0.0,
            placingPercentage: 0.0,
            earningsPerStart: 0.0,
            averageRaceEarnings: 0.0,
            championsProduced: 0,
            yearsFounded: 0
        };

        this.preferences = {
            preferredSurface: null, // 'dirt', 'turf', or null for both
            preferredDistance: null, // 'sprint', 'mile', 'classic', 'distance', or null
            breedingStrategy: 'balanced', // 'speed', 'stamina', 'balanced', 'hybrid'
            riskTolerance: 'moderate', // 'conservative', 'moderate', 'aggressive'
            expansionGoals: []
        };

        // Initialize philosophy bonuses
        this.philosophyBonus = this.calculatePhilosophyBonuses(philosophy);
    }

    // PHILOSOPHY SYSTEM

    calculatePhilosophyBonuses(philosophy) {
        const bonuses = {
            speed: {
                sprintRaceBonus: 1.15,
                trainingEfficiency: { speed: 1.1, power: 1.05 },
                jockeyAttraction: 1.2,
                facilityCost: 0.95,
                breedingPenalty: 0.9,
                description: 'Focus on speed and sprint racing excellence'
            },
            classic: {
                distanceRaceBonus: 1.15,
                trainingEfficiency: { stamina: 1.1, overall: 1.05 },
                prestigeRaceAccess: 1.25,
                traditionBonus: 1.1,
                modernFacilityPenalty: 1.05,
                description: 'Emphasis on classic distance racing and tradition'
            },
            breeding: {
                breedingSuccess: 1.2,
                pedigreeValue: 1.15,
                stallionAttraction: 1.3,
                breedingFacilityCost: 0.85,
                racePerformancePenalty: 0.95,
                description: 'Specialized in bloodline development and breeding'
            },
            balanced: {
                versatilityBonus: 1.05,
                adaptabilityBonus: 1.1,
                staffSatisfaction: 1.1,
                facilityFlexibility: 1.05,
                specializationPenalty: 0.95,
                description: 'Well-rounded approach to all aspects of racing'
            }
        };

        return bonuses[philosophy] || bonuses.balanced;
    }

    // REPUTATION MANAGEMENT

    addReputation(points, source) {
        const oldLevel = this.getReputationLevel();
        this.profile.reputation += points;
        const newLevel = this.getReputationLevel();

        if (newLevel.level !== oldLevel.level) {
            this.achievements.milestones.push({
                type: 'reputation',
                description: `Stable reached ${newLevel.level} reputation`,
                date: new Date(),
                reputationPoints: this.profile.reputation
            });
        }

        // Update experience level based on reputation
        this.updateExperienceLevel();

        return {
            pointsAdded: points,
            totalReputation: this.profile.reputation,
            leveledUp: newLevel.level !== oldLevel.level,
            newLevel: newLevel,
            source: source
        };
    }

    getReputationLevel() {
        const levels = {
            0: { level: 'Unknown', description: 'New stable with no reputation' },
            100: { level: 'Local', description: 'Known in regional racing circuits' },
            300: { level: 'Regional', description: 'Recognized across multiple states' },
            600: { level: 'National', description: 'Respected nationwide' },
            1000: { level: 'Elite', description: 'Top-tier racing stable' },
            1500: { level: 'Legendary', description: 'World-renowned racing empire' }
        };

        let currentLevel = levels[0];
        for (const [threshold, level] of Object.entries(levels)) {
            if (this.profile.reputation >= parseInt(threshold)) {
                currentLevel = level;
            }
        }

        return currentLevel;
    }

    updateExperienceLevel() {
        const reputation = this.profile.reputation;
        const yearsActive = this.statistics.yearsFounded;
        const majorWins = this.achievements.gradeOneWins;

        if (reputation >= 1200 && majorWins >= 10) {
            this.profile.experience = 'Legend';
        } else if (reputation >= 800 && majorWins >= 5) {
            this.profile.experience = 'Champion';
        } else if (reputation >= 400 && yearsActive >= 3) {
            this.profile.experience = 'Veteran';
        } else if (reputation >= 150 && this.achievements.racesWon >= 10) {
            this.profile.experience = 'Experienced';
        } else if (this.achievements.racesWon >= 3) {
            this.profile.experience = 'Developing';
        } else {
            this.profile.experience = 'Rookie';
        }
    }

    // FINANCIAL MANAGEMENT

    addEarnings(amount, source) {
        this.financial.cash += amount;
        this.financial.totalEarnings += amount;
        
        if (source === 'prize_money') {
            this.financial.prizeMoneyEarned += amount;
        } else if (source === 'breeding') {
            this.financial.breedingIncome += amount;
        }

        this.updateNetWorth();

        return {
            amount: amount,
            newBalance: this.financial.cash,
            totalEarnings: this.financial.totalEarnings,
            source: source
        };
    }

    spendMoney(amount, category) {
        if (this.financial.cash < amount) {
            return { success: false, reason: 'Insufficient funds', balance: this.financial.cash };
        }

        this.financial.cash -= amount;
        this.financial.totalExpenses += amount;

        // Track by category
        switch (category) {
            case 'facility':
                this.financial.facilityUpgradeCosts += amount;
                break;
            case 'staff':
                this.financial.staffSalaries += amount;
                break;
            case 'horse_purchase':
            case 'breeding_fee':
            case 'training':
            case 'medical':
            case 'entry_fees':
                // These could be tracked separately if needed
                break;
        }

        this.updateNetWorth();

        return {
            success: true,
            amountSpent: amount,
            newBalance: this.financial.cash,
            category: category
        };
    }

    updateNetWorth() {
        // Base calculation - could be enhanced with facility values, horse values, etc.
        this.financial.netWorth = this.financial.cash + 
                                 (this.facilities.stalls * 1000) + // Rough facility value
                                 (this.achievements.racesWon * 500); // Reputation value
    }

    // FACILITY MANAGEMENT

    upgradeFacility(facilityType) {
        const upgrades = {
            trainingTrack: {
                basic: { cost: 15000, next: 'intermediate', benefit: 'Better training efficiency' },
                intermediate: { cost: 35000, next: 'professional', benefit: 'Optimal training conditions' },
                professional: { cost: null, next: null, benefit: 'Maximum training effectiveness' }
            },
            stalls: {
                cost: 2000, // Per additional stall
                benefit: 'Increase horse capacity'
            },
            breedingBarn: {
                cost: 25000,
                benefit: 'Enable breeding operations'
            },
            veterinaryClinic: {
                cost: 20000,
                benefit: 'On-site medical care, faster injury recovery'
            },
            quarantineFacility: {
                cost: 15000,
                benefit: 'Safe horse imports and health isolation'
            }
        };

        const upgrade = upgrades[facilityType];
        if (!upgrade) {
            return { success: false, reason: 'Unknown facility type' };
        }

        if (facilityType === 'stalls') {
            if (this.facilities.stalls >= this.facilities.maxStalls) {
                return { success: false, reason: 'Maximum stall capacity reached' };
            }
            
            const cost = upgrade.cost;
            const spendResult = this.spendMoney(cost, 'facility');
            if (!spendResult.success) return spendResult;

            this.facilities.stalls++;
            return {
                success: true,
                facilityType: facilityType,
                newCapacity: this.facilities.stalls,
                cost: cost
            };
        }

        // Handle other facility types
        const currentLevel = this.facilities[facilityType];
        const upgradeInfo = upgrade[currentLevel] || upgrade;
        
        if (!upgradeInfo || !upgradeInfo.cost) {
            return { success: false, reason: 'Facility already at maximum level' };
        }

        const cost = upgradeInfo.cost;
        const spendResult = this.spendMoney(cost, 'facility');
        if (!spendResult.success) return spendResult;

        this.facilities[facilityType] = upgradeInfo.next || true;
        
        return {
            success: true,
            facilityType: facilityType,
            newLevel: this.facilities[facilityType],
            cost: cost,
            benefit: upgradeInfo.benefit
        };
    }

    // STAFF MANAGEMENT

    hireStaff(staffType) {
        const staffInfo = {
            trainer: { cost: 3000, monthlySalary: 1000, benefit: 'Additional horse training capacity' },
            jockey: { cost: 1500, monthlySalary: 500, benefit: 'Improved race performance' },
            groom: { cost: 800, monthlySalary: 300, benefit: 'Better horse care and condition' },
            veterinarian: { cost: 5000, monthlySalary: 2000, benefit: 'On-site medical care' },
            breedingSpecialist: { cost: 4000, monthlySalary: 1500, benefit: 'Improved breeding success' },
            facilityManager: { cost: 2500, monthlySalary: 800, benefit: 'Reduced facility operating costs' }
        };

        const info = staffInfo[staffType];
        if (!info) {
            return { success: false, reason: 'Unknown staff type' };
        }

        // Check if already have this type of specialized staff
        if (staffType !== 'trainer' && staffType !== 'jockey' && staffType !== 'groom') {
            if (this.staff[staffType]) {
                return { success: false, reason: `Already have a ${staffType}` };
            }
        }

        const spendResult = this.spendMoney(info.cost, 'staff');
        if (!spendResult.success) return spendResult;

        if (staffType === 'trainer' || staffType === 'jockey' || staffType === 'groom') {
            this.staff[staffType + 's'] = (this.staff[staffType + 's'] || 0) + 1;
        } else {
            this.staff[staffType] = true;
        }

        this.staff.totalStaff++;
        this.financial.monthlyOperatingCost += info.monthlySalary;

        return {
            success: true,
            staffType: staffType,
            hireCost: info.cost,
            monthlyCost: info.monthlySalary,
            benefit: info.benefit
        };
    }

    // ACHIEVEMENT TRACKING

    recordRaceWin(race, horse) {
        this.achievements.racesWon++;
        this.statistics.totalWins++;
        
        // Check if it's a Grade 1 race
        if (race.grade === 1 || race.prestige === 'grade1') {
            this.achievements.gradeOneWins++;
            this.achievements.gradeOneRaces.push({
                raceName: race.name,
                horseName: horse.name,
                date: new Date(),
                prizeAmount: race.purse
            });
            
            // Major reputation boost for Grade 1 wins
            this.addReputation(25, `Grade 1 win: ${race.name}`);
        } else {
            // Regular reputation boost
            this.addReputation(5, `Race win: ${race.name}`);
        }

        this.updateStatistics();
    }

    recordBreedingSuccess(sire, dam, offspring) {
        this.statistics.horsesBred++;
        this.achievements.breedingSuccesses.push({
            sire: sire.name,
            dam: dam.name,
            offspring: offspring.name,
            date: new Date()
        });

        // Reputation boost for successful breeding
        this.addReputation(3, `Successful breeding: ${offspring.name}`);
    }

    updateStatistics() {
        if (this.statistics.totalStarts > 0) {
            this.statistics.winPercentage = this.statistics.totalWins / this.statistics.totalStarts;
            this.statistics.placingPercentage = this.statistics.totalPlacings / this.statistics.totalStarts;
        }

        if (this.statistics.totalStarts > 0 && this.financial.prizeMoneyEarned > 0) {
            this.statistics.earningsPerStart = this.financial.prizeMoneyEarned / this.statistics.totalStarts;
            this.statistics.averageRaceEarnings = this.financial.prizeMoneyEarned / this.statistics.totalWins;
        }
    }

    // DISPLAY METHODS

    getStatusSummary() {
        const reputationLevel = this.getReputationLevel();
        
        return {
            profile: {
                name: this.profile.name,
                stableName: this.profile.stableName,
                experience: this.profile.experience,
                reputation: `${reputationLevel.level} (${this.profile.reputation})`,
                philosophy: this.profile.philosophy,
                yearsFounded: Math.floor((Date.now() - this.profile.founded.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            },
            financial: {
                cash: this.financial.cash,
                netWorth: this.financial.netWorth,
                monthlyOperatingCost: this.financial.monthlyOperatingCost
            },
            facilities: {
                stalls: `${this.statistics.horsesOwned}/${this.facilities.stalls}`,
                trainingTrack: this.facilities.trainingTrack,
                breedingCapable: this.facilities.breedingBarn
            },
            achievements: {
                racesWon: this.achievements.racesWon,
                gradeOneWins: this.achievements.gradeOneWins,
                championsProduced: this.statistics.championsProduced
            }
        };
    }

    // SERIALIZATION

    serialize() {
        return {
            profile: this.profile,
            financial: this.financial,
            facilities: this.facilities,
            staff: this.staff,
            achievements: this.achievements,
            statistics: this.statistics,
            preferences: this.preferences,
            philosophyBonus: this.philosophyBonus
        };
    }

    static deserialize(data) {
        const owner = new StableOwner(
            data.profile.name,
            data.profile.stableName,
            data.profile.philosophy
        );

        // Restore all properties
        Object.assign(owner.profile, data.profile);
        Object.assign(owner.financial, data.financial);
        Object.assign(owner.facilities, data.facilities);
        Object.assign(owner.staff, data.staff);
        Object.assign(owner.achievements, data.achievements);
        Object.assign(owner.statistics, data.statistics);
        Object.assign(owner.preferences, data.preferences);
        owner.philosophyBonus = data.philosophyBonus;

        return owner;
    }
}

module.exports = StableOwner;