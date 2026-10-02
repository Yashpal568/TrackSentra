const fs = require('fs');
const path = require('path');

const filesToFix = [
    "src/pages/guard/GuardPatrols.tsx",
    "src/pages/guard/GuardDashboard.tsx",
    "src/pages/guard/GuardProfile.tsx",
    "src/components/GuardLayout.tsx",
    "src/components/AppLayout.tsx",
    "src/pages/Subscription.tsx",
    "src/pages/CompanyProfile.tsx",
    "src/pages/AdminHelpCenter.tsx",
    "src/pages/AdminTickets.tsx",
    "src/pages/AuditLogs.tsx",
    "src/pages/HelpCenter.tsx",
    "src/pages/Login.tsx",
    "src/pages/Reports.tsx",
    "src/pages/SupportTickets.tsx",
];

for (const filePath of filesToFix) {
    if (!fs.existsSync(filePath)) {
        continue;
    }
    let content = fs.readFileSync(filePath, 'utf-8');

    // Replace var(--color-X) with X
    content = content.replace(/([a-z]+)-\[var\(--color-([a-zA-Z0-9-]+)\)\]/g, '$1-$2');
    content = content.replace(/([a-z]+):([a-z]+)-\[var\(--color-([a-zA-Z0-9-]+)\)\]/g, '$1:$2-$3');

    // Some specific replaces
    content = content.replace(/text-\[#070B09\]/g, "text-background");
    content = content.replace(/bg-\[length:20px_20px\]/g, "bg-size-[20px_20px]");
    content = content.replace(/-left-\[11px\]/g, "-left-2.75");
    content = content.replace(/bg-\[radial-gradient\(ellipse_at_top,_var\(--tw-gradient-stops\)\)\]/g, "bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))]");
    
    // Specific sizes
    content = content.replace(/max-w-\[1400px\]/g, "max-w-350");
    content = content.replace(/bg-gradient-to-b/g, "bg-linear-to-b");
    content = content.replace(/bg-gradient-to-r/g, "bg-linear-to-r");
    content = content.replace(/bg-gradient-to-br/g, "bg-linear-to-br");
    content = content.replace(/w-\[280px\]/g, "w-70");
    content = content.replace(/xl:w-\[80px\]/g, "xl:w-20");
    content = content.replace(/left-\[85px\]/g, "left-21.25");
    content = content.replace(/z-\[100\]/g, "z-100");
    content = content.replace(/xl:ml-\[280px\]/g, "xl:ml-70");
    content = content.replace(/xl:ml-\[80px\]/g, "xl:ml-20");
    content = content.replace(/w-\[800px\]/g, "w-200");
    content = content.replace(/h-\[400px\]/g, "h-100");
    content = content.replace(/h-\[100dvh\]/g, "h-dvh");
    content = content.replace(/min-h-\[300px\]/g, "min-h-75");
    content = content.replace(/max-w-\[250px\]/g, "max-w-62.5");
    content = content.replace(/min-w-\[200px\]/g, "min-w-50");
    content = content.replace(/max-w-\[200px\]/g, "max-w-50");
    content = content.replace(/min-h-\[400px\]/g, "min-h-100");
    content = content.replace(/min-h-\[140px\]/g, "min-h-35");
    
    // from-[var(--color-background)]/90 -> from-background/90
    content = content.replace(/([a-z]+)-\[var\(--color-([a-zA-Z0-9-]+)\)\]\/([0-9]+)/g, '$1-$2/$3');

    fs.writeFileSync(filePath, content, 'utf-8');
}
console.log("Done");
