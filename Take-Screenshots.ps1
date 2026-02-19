# Password Manager Screenshot Capture Guide
# Run this script on Windows after building the application

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Password Manager - Screenshot Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This interactive guide will help you capture all required screenshots." -ForegroundColor Yellow
Write-Host "Please have a screenshot tool ready (Win + Shift + S recommended)." -ForegroundColor Yellow
Write-Host ""

# Check if running on Windows
if (-not $IsWindows -and $PSVersionTable.PSVersion.Major -lt 6) {
    $IsWindows = $true
}

if (-not $IsWindows) {
    Write-Host "ERROR: This script must be run on Windows as it's a WPF application." -ForegroundColor Red
    exit 1
}

# Screenshot list
$screenshots = @(
    @{Number=1; File="01-login-window.png"; Description="Login screen with account selection dropdown"},
    @{Number=2; File="02-create-account-dialog.png"; Description="Click 'Create New Account' button"},
    @{Number=3; File="03-main-window-overview.png"; Description="Main window after login (use admin account)"},
    @{Number=4; File="04-main-window-with-entries.png"; Description="Main window showing password entries list"},
    @{Number=5; File="05-entry-dialog-login.png"; Description="Click 'New Entry' and select Login type"},
    @{Number=6; File="06-entry-dialog-credit-card.png"; Description="Click 'New Entry' and select Credit Card type"},
    @{Number=7; File="07-entry-dialog-secure-note.png"; Description="Click 'New Entry' and select Secure Note type"},
    @{Number=8; File="08-entry-dialog-file.png"; Description="Click 'New Entry' and select File type"},
    @{Number=9; File="09-password-generator-dialog.png"; Description="Click 'Generate Password' in entry dialog"},
    @{Number=10; File="10-vault-dialog.png"; Description="Click 'New Vault' button"},
    @{Number=11; File="11-settings-dialog.png"; Description="Click 'Settings' button"},
    @{Number=12; File="12-search-and-filter.png"; Description="Type in search bar and show filters"},
    @{Number=13; File="13-password-reveal.png"; Description="Click eye icon to reveal a password"},
    @{Number=14; File="14-password-strength-indicator.png"; Description="Show password strength indicator (weak/medium/strong)"},
    @{Number=15; File="15-dark-theme.png"; Description="Settings > Theme > Dark Mode"},
    @{Number=16; File="16-light-theme.png"; Description="Settings > Theme > Light Mode"},
    @{Number=17; File="17-admin-view.png"; Description="Login with admin account (admin/Admin123!)"},
    @{Number=18; File="18-user-view.png"; Description="Login with user account (john/John123!)"},
    @{Number=19; File="19-child-view.png"; Description="Login with child account (sarah/Sarah123!)"},
    @{Number=20; File="20-access-restriction.png"; Description="Admin view showing access restriction features"}
)

Write-Host "SETUP INSTRUCTIONS:" -ForegroundColor Green
Write-Host "1. Build the application: dotnet build" -ForegroundColor White
Write-Host "2. Run the application: dotnet run --project PasswordManager.UI" -ForegroundColor White
Write-Host "3. Have your screenshot tool ready (Win + Shift + S)" -ForegroundColor White
Write-Host "4. Save screenshots to: screenshots/ folder" -ForegroundColor White
Write-Host ""

Write-Host "Demo Accounts:" -ForegroundColor Green
Write-Host "  Admin:  admin / Admin123!" -ForegroundColor White
Write-Host "  User:   john / John123!" -ForegroundColor White
Write-Host "  Child:  sarah / Sarah123!" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Press Enter to start the screenshot checklist (or Ctrl+C to exit)"

foreach ($screenshot in $screenshots) {
    Write-Host ""
    Write-Host ("=" * 80) -ForegroundColor Cyan
    Write-Host "Screenshot $($screenshot.Number) of $($screenshots.Count)" -ForegroundColor Yellow
    Write-Host ("=" * 80) -ForegroundColor Cyan
    Write-Host ""
    Write-Host "File Name: " -NoNewline -ForegroundColor Green
    Write-Host $screenshot.File -ForegroundColor White
    Write-Host ""
    Write-Host "Instructions: " -NoNewline -ForegroundColor Green
    Write-Host $screenshot.Description -ForegroundColor White
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Magenta
    Write-Host "  1. Follow the instructions above to navigate to the screen" -ForegroundColor White
    Write-Host "  2. Press Win + Shift + S to capture the screenshot" -ForegroundColor White
    Write-Host "  3. Save as: screenshots/$($screenshot.File)" -ForegroundColor White
    Write-Host ""
    
    $response = Read-Host "Screenshot captured? (y/n/skip/quit)"
    
    switch ($response.ToLower()) {
        "y" { 
            Write-Host "✓ Screenshot $($screenshot.Number) completed!" -ForegroundColor Green
        }
        "skip" {
            Write-Host "⊘ Screenshot $($screenshot.Number) skipped" -ForegroundColor Yellow
        }
        "quit" {
            Write-Host "Exiting screenshot guide..." -ForegroundColor Yellow
            exit 0
        }
        default {
            Write-Host "⊘ Screenshot $($screenshot.Number) skipped" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Green
Write-Host "SCREENSHOT CAPTURE COMPLETE!" -ForegroundColor Green
Write-Host ("=" * 80) -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Verify all screenshots are saved in the screenshots/ folder" -ForegroundColor White
Write-Host "2. Check that screenshots are high quality and readable" -ForegroundColor White
Write-Host "3. Commit the screenshots to the repository" -ForegroundColor White
Write-Host ""
Write-Host "Thank you for documenting the Password Manager!" -ForegroundColor Cyan
