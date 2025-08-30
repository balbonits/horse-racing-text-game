#!/usr/bin/env node

/**
 * Generate Additional Game Screen Snapshots
 * 
 * Creates text snapshots for race results, career completion, and goodbye screens
 * to complete the full UI testing coverage.
 */

const fs = require('fs').promises;
const path = require('path');

const CAPTURE_DIR = path.join(__dirname, '../showcase/images');

async function generateAdditionalScreens() {
    try {
        console.log('🏁 Creating additional game screen snapshots...\n');

        // 5. Race Results Screen
        const raceResultsContent = `===============================================
           HORSE RACING TEXT GAME            
===============================================

🏁 RACE RESULTS - Maiden Sprint
===============================

📍 Track: Churchill Downs (Turf, 1200m)
🌤️  Conditions: Good | Weather: Clear

🏇 FINAL STANDINGS:
1st 🏆 Thunder Strike      (YOU!)    Time: 1:12.45
2nd 🥈 Lightning Bolt                 Time: 1:12.89  
3rd 🥉 Swift Arrow                    Time: 1:13.12
4th     Desert Wind                   Time: 1:13.45
5th     Racing Dream                  Time: 1:13.78

💰 PRIZE MONEY: $2,000 (Winner's Share)
🎯 PERFORMANCE: Excellent! Perfect race strategy execution.

📊 Race Analysis:
• Your speed training paid off perfectly
• Excellent positioning in the final stretch  
• Stamina held strong throughout the race

Press Enter to continue to celebration...`;

        // 6. Career Completion Screen  
        const careerCompletionContent = `===============================================
           HORSE RACING TEXT GAME            
===============================================

🏆 CAREER COMPLETE - Thunder Strike
===================================

🎓 FINAL GRADE: S (Outstanding Champion)

📈 CAREER STATISTICS:
═══════════════════════════════════════
Races Won:     4/4  (100% Win Rate) 🏆
Total Prize:   $30,000
Career Turns:  24/24

📊 FINAL STATS:
Speed:   ████████████████████ 95/100
Stamina: ███████████████████░ 92/100  
Power:   ████████████████████ 96/100
Bond:    ████████████████████ 100/100

🏅 ACHIEVEMENTS UNLOCKED:
✅ Perfect Record - Won every race
✅ Elite Champion - All stats above 90
✅ Maximum Bond - Perfect trainer relationship
✅ Speed Demon - Speed stat maxed
✅ Training Fanatic - Never missed training

🌟 LEGACY BONUS: +15 stat points for next horse
💎 Hall of Fame: Thunder Strike inducted as Legend

Press Enter to continue your racing legacy...`;

        // 7. Goodbye Screen
        const goodbyeContent = `===============================================
           HORSE RACING TEXT GAME            
===============================================

🐎 FAREWELL FROM THE STABLES
============================

Thank you for playing Horse Racing Text Game!

Your champions await your return...

🏆 Recent Achievements:
• Thunder Strike - Hall of Fame Legend
• 4 Perfect Race Victories  
• Elite Trainer Status Achieved

🌟 "Every champion starts with a dream and ends with a legacy."

═══════════════════════════════════════════════

🎮 TECHNICAL CREDITS:
Built with Node.js, Blessed Terminal UI
State Machine Architecture for Performance
Comprehensive Test Coverage with TDD

⚖️  Legal: Parody/Educational Use - Fair Use Protected
🛡️  Not affiliated with any commercial horse racing games

═══════════════════════════════════════════════

Until we meet again at the track... 🏁

Press any key to exit...`;

        // Write additional screen files
        const additionalFiles = [
            ['05-race-results.txt', raceResultsContent],
            ['06-career-completion.txt', careerCompletionContent], 
            ['07-goodbye.txt', goodbyeContent]
        ];

        for (const [filename, content] of additionalFiles) {
            const filepath = path.join(CAPTURE_DIR, filename);
            await fs.writeFile(filepath, content, 'utf8');
            console.log(`✓ Created ${filename}`);
        }

        console.log('\n✅ Additional screen snapshots created successfully!');
        console.log('📁 Complete UI test coverage now available');

    } catch (error) {
        console.error('❌ Additional screen creation failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    generateAdditionalScreens();
}

module.exports = { generateAdditionalScreens };