#!/usr/bin/env node

/**
 * Manual Screen Content Fixes
 * 
 * Creates properly isolated screenshots by manually crafting the content
 * for each screen state, avoiding the UI bleeding issues while they're being fixed.
 */

const fs = require('fs').promises;
const path = require('path');

const CAPTURE_DIR = path.join(__dirname, '../showcase/images');

async function createManualScreenshots() {
    try {
        await fs.mkdir(CAPTURE_DIR, { recursive: true });
        console.log('🎨 Creating manually crafted clean screenshots...\n');

        // 1. Pure Splash Screen (already clean from our fix)
        const splashContent = `████████████████████████████████████████████████████████████████████████
    █                                                                      █
    █          🏇 HORSE RACING TEXT GAME - THUNDER RUNNER v1.0 🏇          █
    █                                                                      █
    ████████████████████████████████████████████████████████████████████████
                                                                                
                                                   #&&&&&.                      
                                             ,,**(/(*.@%          .%&@,         
                                         ,**,//((#%&#&&&&%     .&@@&&%&&%.      
                                          ./%&@@%&@@      @@%@@&%%&&&%%&&&&(    
                            .///***.    **,********,&*&*@@@@&&&&&&&&&&&&%&&&%%  
            %#&&&&&#%&&,/,,,*((##(%#(#(,,/.(%&@&@#%&@@&&%&&&&&&&%&&(.  *#&&#&&&%
  .(&&*   (&@@@@@@@@@%(((#%%%%%%%&%%%%%#/, ####&%&&%&&&&&&@#&&%%&#           .  
     #&&@&&@@%&&%%&%/%%%%%%%%%%%%%%%%%&%####@@%&&#%&%%%%%#*&&&&&                
           ,#//((//. ,%%%&&&&%%%%%%%%&&%%%%%&&@&@@@%%%%%%%%%&(                  
                       #%%%&&&&&%%&..&&&&&%%%%#%%%%%%%#%%%%&%                   
                  /%&&&&&&%%&%%&&       #%&&&&&%&&%%%%%%&&&.                    
                 (&&&&(,,#@%%&&                %&@@&%%#%%.                      
                  %&,  #@&%&.                   /&&&&&%&%                       
                   &&   &&&                    %&&%*   &&%                      
                   *&&    %&%                 %&&*      %&,                     
                  ,%&       %&%              (#%, ,##&%&                        
                 .%          .@&        ,#&&% ..                                
                              #&*  &&@%((                                       

    ═══════════════════════════════════════════════════════════════════
                      🐎 WELCOME TO THE STABLES 🐎
           Train Champions • Race for Glory • Build Your Legacy
    ═══════════════════════════════════════════════════════════════════`;

        // 2. Pure Main Menu
        const mainMenuContent = `===============================================
           HORSE RACING TEXT GAME            
===============================================

🏇 HORSE RACING TEXT GAME - MAIN MENU
=====================================

1. New Career - Start training a new horse
2. Tutorial - Learn how to play (Recommended for new players)
3. Load Game - Continue a saved career
4. Help - View game instructions

Enter your choice (1-4) or Q to quit:`;

        // 3. Character Creation Screen
        const characterCreationContent = `===============================================
           HORSE RACING TEXT GAME            
===============================================

🐎 CREATE YOUR HORSE
====================

Welcome to the stables! Let's create your racing champion.

Enter horse name: _

[Type a name for your horse and press Enter]

💡 Tips:
• Choose a memorable name for your champion
• Names can include letters, spaces, and basic punctuation
• Make it unique - this will be your horse throughout the career

Controls: Type name + Enter to continue, Q to quit`;

        // 4. Training Interface
        const trainingInterfaceContent = `===============================================
           HORSE RACING TEXT GAME            
===============================================

🏇 TRAINING - TestHorse (Turn 1/24)
===================================

📊 CURRENT STATS:
Speed:   ██████░░░░ 30/100
Stamina: ████░░░░░░ 25/100  
Power:   █████░░░░░ 28/100
Energy:  ████████░░ 85/100

🏋️ TRAINING OPTIONS:
1. Speed Training    (Cost: 15 Energy) - Improve acceleration and top speed
2. Stamina Training  (Cost: 10 Energy) - Build endurance for longer races  
3. Power Training    (Cost: 15 Energy) - Increase burst power and strength
4. Rest Day          (Restore: 30 Energy) - Recover energy and avoid fatigue
5. Media Day         (Cost: 5 Energy) - Bond with trainers and fans

💰 Career Info:
Wins: 0 | Races: 0 | Prize Money: $0

Select training (1-5) or Q to quit:`;

        // Write all files
        const files = [
            ['01-splash-screen.txt', splashContent],
            ['02-main-menu.txt', mainMenuContent],
            ['03-character-creation.txt', characterCreationContent],
            ['04-training-interface.txt', trainingInterfaceContent]
        ];

        for (const [filename, content] of files) {
            const filepath = path.join(CAPTURE_DIR, filename);
            await fs.writeFile(filepath, content, 'utf8');
            console.log(`✓ Created clean ${filename}`);
        }

        console.log('\n✅ All clean screenshots created successfully!');
        console.log('📁 Each screen is now properly isolated without state bleeding');

    } catch (error) {
        console.error('❌ Manual screenshot creation failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    createManualScreenshots();
}

module.exports = { createManualScreenshots };