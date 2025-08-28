/**
 * ASCII Art Graphics - Horse Racing Splash Screen
 * 
 * Contains the beautiful horse ASCII art for the game's splash screen.
 */

class ASCIIArt {
    /**
     * Main splash screen with racing horse
     * Beautiful ASCII art from horse-splash.txt
     */
    static getMainSplash() {
        return `
    ████████████████████████████████████████████████████████████████████████
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
    }

    /**
     * Get colored ASCII art (requires ColorThemeManager)
     */
    static getColoredSplash(colorManager) {
        if (!colorManager) {
            return this.getMainSplash();
        }

        const lines = this.getMainSplash().split('\n');
        return lines.map(line => {
            if (line.includes('HORSE RACING TEXT GAME')) {
                return colorManager.header(line);
            } else if (line.includes('WELCOME TO THE STABLES')) {
                return colorManager.success(line);
            } else if (line.includes('Train Champions')) {
                return colorManager.info(line);
            } else if (line.includes('█')) {
                return colorManager.info(line);
            } else if (line.includes('═')) {
                return colorManager.highlight(line);
            }
            return line;
        }).join('\n');
    }
}

module.exports = ASCIIArt;