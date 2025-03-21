const fs = require("fs");

function checkLicense() {
    const licensePath = "./LICENSE";
    
    if (!fs.existsSync(licensePath)) {
        console.error("🚨 ERROR: LICENSE file missing! Bot shutting down.");
        process.exit(1);
    }

    const licenseContent = fs.readFileSync(licensePath, "utf-8");

    if (!licenseContent.includes("Lunar Developments")) {
        console.error("🚨 ERROR: License verification failed! Unauthorized modification detected.");
        process.exit(1);
    }

    console.log("✅ License verified successfully!");
}

// Corrected export method
module.exports = checkLicense;
