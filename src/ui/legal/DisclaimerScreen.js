/**
 * Legal Disclaimer Screen - In-Game Legal Protection
 * 
 * Displays comprehensive legal disclaimer to users when starting the game
 * to provide maximum copyright and trademark protection.
 */

class DisclaimerScreen {
    constructor() {
        this.disclaimerText = this.getDisclaimerText();
        this.acknowledgeRequired = true;
    }

    getDisclaimerText() {
        return {
            title: "LEGAL DISCLAIMER & FAIR USE NOTICE",
            subtitle: "Please read carefully before playing",
            sections: [
                {
                    header: "PARODY AND FAIR USE PROTECTION",
                    content: [
                        "This is a work of PARODY and FICTION protected under U.S. copyright",
                        "law as 'fair use' (17 U.S. Code § 107). This game is intended for",
                        "entertainment purposes only and is NOT affiliated with any real-world",
                        "racing organizations, tracks, horses, or industry entities."
                    ]
                },
                {
                    header: "FICTIONAL CONTENT DECLARATION",
                    content: [
                        "ALL content in this game is FICTIONAL and originally created:",
                        "• Horse names - Generated using original algorithms",
                        "• Race names - Fictional combinations of generic terminology", 
                        "• Track names - Fictional locations with common descriptive terms",
                        "• Stable names - Original fictional creations",
                        "• Owner names - Generated from public domain naming conventions"
                    ]
                },
                {
                    header: "COINCIDENTAL SIMILARITIES DISCLAIMER",
                    content: [
                        "Any resemblance to actual racehorses, racing venues, race events,",
                        "racing stables, industry personnel, real persons (living or dead),",
                        "or actual events is PURELY COINCIDENTAL and UNINTENTIONAL."
                    ]
                },
                {
                    header: "INTELLECTUAL PROPERTY SAFEGUARDS",
                    content: [
                        "Our name generation system specifically AVOIDS:",
                        "• All known copyrighted horse names (Secretariat, Man o' War, etc.)",
                        "• All trademarked track names (Churchill Downs, Belmont Park, etc.)",
                        "• All copyrighted race names (Kentucky Derby, Preakness Stakes, etc.)",
                        "• Uses ONLY generic, public domain terminology"
                    ]
                },
                {
                    header: "SIMULATION & ENTERTAINMENT NOTICE",
                    content: [
                        "This is a work of simulation and entertainment. It is NOT intended",
                        "to accurately represent real-world horse racing operations, breeding",
                        "practices, or industry standards. All gameplay mechanics are fictional."
                    ]
                }
            ],
            acknowledgment: [
                "By playing this game, you acknowledge that you understand:",
                "• This is a work of parody protected by fair use",
                "• All content is fictional and coincidental similarities are unintentional",
                "• The game is not affiliated with any real racing entities",
                "• You assume responsibility for compliance with local laws"
            ]
        };
    }

    displayDisclaimer() {
        const disclaimer = this.disclaimerText;
        let output = [];

        // Title section
        output.push("═".repeat(70));
        output.push(this.centerText(disclaimer.title, 70));
        output.push(this.centerText(disclaimer.subtitle, 70));
        output.push("═".repeat(70));
        output.push("");

        // Content sections
        disclaimer.sections.forEach((section, index) => {
            output.push(`${section.header}`);
            output.push("─".repeat(section.header.length));
            
            section.content.forEach(line => {
                output.push(line);
            });
            
            if (index < disclaimer.sections.length - 1) {
                output.push("");
            }
        });

        // Acknowledgment section
        output.push("");
        output.push("═".repeat(70));
        output.push("ACKNOWLEDGMENT REQUIRED");
        output.push("═".repeat(70));
        
        disclaimer.acknowledgment.forEach(line => {
            output.push(line);
        });

        output.push("");
        output.push("Press [A] to ACKNOWLEDGE and continue, or [Q] to quit:");

        return output.join("\n");
    }

    displayCompactDisclaimer() {
        // Shorter version for subsequent game starts
        return [
            "═".repeat(50),
            "    HORSE RACING TEXT GAME - PARODY NOTICE",
            "═".repeat(50),
            "",
            "This is a work of PARODY protected by fair use.",
            "All names and events are FICTIONAL.",
            "Any similarities to real entities are COINCIDENTAL.",
            "",
            "Full disclaimer available in documentation.",
            "",
            "Press [ENTER] to continue: "
        ].join("\n");
    }

    getStartupDisclaimer() {
        // Brief disclaimer shown at game startup
        return [
            "",
            "⚖️  LEGAL NOTICE: This is a work of parody. All content is fictional.",
            "   Any similarities to real racing entities are purely coincidental.",
            "   Protected under fair use provisions of copyright law.",
            ""
        ].join("\n");
    }

    getInGameDisclaimer() {
        // Brief reminder displayed in game menus
        return "📝 Parody Notice: All names and events are fictional | Full disclaimer in documentation";
    }

    centerText(text, width) {
        const padding = Math.max(0, Math.floor((width - text.length) / 2));
        return " ".repeat(padding) + text;
    }

    async promptAcknowledgment() {
        return new Promise((resolve) => {
            const handleInput = (input) => {
                const key = input.toLowerCase();
                if (key === 'a' || key === 'acknowledge') {
                    resolve({ acknowledged: true });
                } else if (key === 'q' || key === 'quit') {
                    resolve({ acknowledged: false, quit: true });
                }
                // Continue waiting for valid input
            };

            // This would be integrated with the actual input system
            process.stdin.once('data', handleInput);
        });
    }

    // Method to save acknowledgment status
    saveAcknowledgment(userProfile) {
        userProfile.legalAcknowledgments = userProfile.legalAcknowledgments || {};
        userProfile.legalAcknowledgments.disclaimerAccepted = true;
        userProfile.legalAcknowledgments.acceptedDate = new Date();
        userProfile.legalAcknowledgments.version = "1.0";
    }

    // Check if user has already acknowledged
    hasUserAcknowledged(userProfile) {
        return userProfile.legalAcknowledgments && 
               userProfile.legalAcknowledgments.disclaimerAccepted === true;
    }

    // Get copyright notice for source code
    getSourceCodeNotice() {
        return [
            "/*",
            " * LEGAL NOTICE: This is a work of parody protected by fair use.",
            " * All names and content are fictional. Any similarities to real",
            " * racing entities are purely coincidental and unintentional.",
            " * See docs/LEGAL_DISCLAIMER.md for full legal information.",
            " */"
        ].join("\n");
    }

    // Get build/distribution notice
    getBuildNotice() {
        return [
            "HORSE RACING TEXT GAME v1.0",
            "",
            "PARODY & FAIR USE NOTICE:",
            "This is a work of original parody and fiction.",
            "All content is fictional and any similarities",
            "to real entities are purely coincidental.",
            "",
            "Protected under fair use provisions of",
            "U.S. copyright law (17 U.S.C. § 107).",
            "",
            "Not affiliated with any real racing organizations.",
            "",
            "Full legal disclaimer available in game documentation."
        ].join("\n");
    }
}

module.exports = DisclaimerScreen;