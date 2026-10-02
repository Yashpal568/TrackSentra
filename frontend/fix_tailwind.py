import os
import re

files_to_fix = [
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
]

for file_path in files_to_fix:
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace var(--color-X) with X
    content = re.sub(r'([a-z]+)-\[var\(--color-([a-zA-Z0-9-]+)\)\]', r'\1-\2', content)
    content = re.sub(r'([a-z]+):([a-z]+)-\[var\(--color-([a-zA-Z0-9-]+)\)\]', r'\1:\2-\3', content)

    # Some specific replaces
    content = content.replace("text-[#070B09]", "text-background")
    content = content.replace("bg-[length:20px_20px]", "bg-size-[20px_20px]")
    content = content.replace("-left-[11px]", "-left-2.75")
    content = content.replace("bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]", "bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))]")
    
    # Specific sizes
    content = content.replace("max-w-[1400px]", "max-w-350")
    content = content.replace("bg-gradient-to-b", "bg-linear-to-b")
    content = content.replace("bg-gradient-to-r", "bg-linear-to-r")
    content = content.replace("bg-gradient-to-br", "bg-linear-to-br")
    content = content.replace("w-[280px]", "w-70")
    content = content.replace("xl:w-[80px]", "xl:w-20")
    content = content.replace("left-[85px]", "left-21.25")
    content = content.replace("z-[100]", "z-100")
    content = content.replace("xl:ml-[280px]", "xl:ml-70")
    content = content.replace("xl:ml-[80px]", "xl:ml-20")
    content = content.replace("w-[800px]", "w-200")
    content = content.replace("h-[400px]", "h-100")
    content = content.replace("h-[100dvh]", "h-dvh")
    content = content.replace("min-h-[300px]", "min-h-75")
    content = content.replace("max-w-[250px]", "max-w-62.5")
    content = content.replace("min-w-[200px]", "min-w-50")
    content = content.replace("max-w-[200px]", "max-w-50")
    content = content.replace("min-h-[400px]", "min-h-100")
    content = content.replace("min-h-[140px]", "min-h-35")
    
    # from-[var(--color-background)]/90 -> from-background/90
    content = re.sub(r'([a-z]+)-\[var\(--color-([a-zA-Z0-9-]+)\)\]/([0-9]+)', r'\1-\2/\3', content)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
