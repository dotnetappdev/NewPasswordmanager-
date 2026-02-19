# Screenshots Directory

This directory contains high-quality screenshots of the Password Manager application.

## Screenshot Files

The following screenshots document all screens of the application:

### Main Screens
1. `01-login-window.png` - Login screen with account selection
2. `02-create-account-dialog.png` - New account creation dialog
3. `03-main-window-overview.png` - Main application window with sidebar and content area
4. `04-main-window-with-entries.png` - Main window showing password entries list

### Dialogs
5. `05-entry-dialog-login.png` - Add/Edit Login entry dialog
6. `06-entry-dialog-credit-card.png` - Add/Edit Credit Card entry dialog
7. `07-entry-dialog-secure-note.png` - Add/Edit Secure Note dialog
8. `08-entry-dialog-file.png` - Add/Edit File entry dialog
9. `09-password-generator-dialog.png` - Password generator tool
10. `10-vault-dialog.png` - Create/Edit vault dialog
11. `11-settings-dialog.png` - Settings and preferences

### Features
12. `12-search-and-filter.png` - Search bar and type filters in action
13. `13-password-reveal.png` - Password reveal/hide functionality
14. `14-password-strength-indicator.png` - Password strength indicator
15. `15-dark-theme.png` - Application in dark mode
16. `16-light-theme.png` - Application in light mode

### Account Types & Permissions
17. `17-admin-view.png` - Admin account view with all features
18. `18-user-view.png` - Standard user view
19. `19-child-view.png` - Child account with restrictions
20. `20-access-restriction.png` - Access restriction settings (admin)

## How to Take Screenshots

### Prerequisites
- Windows operating system
- .NET 8.0 SDK installed
- Application built and ready to run

### Steps to Capture Screenshots

1. **Build the application**
   ```bash
   dotnet build
   ```

2. **Run the application**
   ```bash
   dotnet run --project PasswordManager.UI
   ```

3. **Screenshot Tool Recommendations**
   - Windows Snipping Tool (Win + Shift + S)
   - Snagit (professional tool)
   - ShareX (free, open-source)
   - Greenshot (free, open-source)

4. **Screenshot Guidelines**
   - Use high DPI settings (1920x1080 or higher)
   - Capture full windows including title bar
   - Ensure good contrast and readability
   - Use demo data (avoid real passwords)
   - Show realistic example data
   - Capture both light and dark themes

5. **Save files** in this directory with the naming convention above

### Demo Account Credentials
Use these pre-created demo accounts for screenshots:
- **Admin**: username `admin`, password `Admin123!`
- **User**: username `john`, password `John123!`
- **Child**: username `sarah`, password `Sarah123!`

### Tips for High-Quality Screenshots
- Close unnecessary background windows
- Ensure the application is in focus
- Use consistent window sizes
- Capture during the day for better screen clarity
- Disable notifications that might appear in screenshots
- Use the Windows + Shift + S shortcut for quick, clean captures
