# Password Manager - Visual Documentation & Screenshots

This document provides high-quality screenshots of all screens and features in the Password Manager application.

> **Note**: All screenshots use demo data. Never screenshot real passwords or sensitive information.

---

## Table of Contents
- [Main Screens](#main-screens)
- [Dialogs](#dialogs)
- [Features & Functionality](#features--functionality)
- [Themes](#themes)
- [Account Types & Permissions](#account-types--permissions)
- [How to Capture Screenshots](#how-to-capture-screenshots)

---

## Main Screens

### 1. Login Window
**File**: `screenshots/01-login-window.png`

The login screen is the entry point to the application with a modern two-panel design:
- **Left Panel**: Branding with lock icon and tagline "Secure. Simple. Modern."
- **Right Panel**: Account selection and authentication
  - Account dropdown (Netflix-style user selection)
  - Password input field
  - Sign In button
  - Create New Account button

**Demo Accounts**:
- Admin: `admin` / `Admin123!`
- User: `john` / `John123!`
- Child: `sarah` / `Sarah123!`

![Login Window](screenshots/01-login-window.png)

---

### 2. Create Account Dialog
**File**: `screenshots/02-create-account-dialog.png`

Dialog for creating a new user account:
- Username input field
- Password input field with validation
- Confirm Password field
- Account Type dropdown (Admin/User/Child)
- Create Account and Cancel buttons

![Create Account Dialog](screenshots/02-create-account-dialog.png)

---

### 3. Main Window - Overview
**File**: `screenshots/03-main-window-overview.png`

The main application interface after login:
- **Top Bar**: Application title, username display, Settings and Logout buttons
- **Sidebar** (left):
  - New Entry button
  - Vaults list
  - New Vault button
- **Content Area** (right):
  - Search bar with icon
  - Type filter buttons (All, Login, Credit Card, Notes, Files)
  - Password entries list

![Main Window Overview](screenshots/03-main-window-overview.png)

---

### 4. Main Window - With Entries
**File**: `screenshots/04-main-window-with-entries.png`

Main window showing populated password entries:
- Multiple vault entries displayed
- Different entry types (logins, credit cards, notes)
- Entry details preview
- Favorites marked with star icon

![Main Window with Entries](screenshots/04-main-window-with-entries.png)

---

## Dialogs

### 5. Entry Dialog - Login Credentials
**File**: `screenshots/05-entry-dialog-login.png`

Dialog for creating/editing login credentials:
- Title field
- Username field
- Email field
- Password field with:
  - Reveal/Hide toggle (eye icon)
  - Copy button
  - Generate Password button
  - Strength indicator
- URL field
- Notes field (multiline)
- Favorite checkbox
- Save and Cancel buttons

![Login Entry Dialog](screenshots/05-entry-dialog-login.png)

---

### 6. Entry Dialog - Credit Card
**File**: `screenshots/06-entry-dialog-credit-card.png`

Dialog for storing credit card information:
- Title field
- Cardholder Name
- Card Number (encrypted)
- Expiry Date (MM/YY format)
- CVV (encrypted)
- Notes field
- Favorite checkbox
- Save and Cancel buttons

![Credit Card Entry Dialog](screenshots/06-entry-dialog-credit-card.png)

---

### 7. Entry Dialog - Secure Note
**File**: `screenshots/07-entry-dialog-secure-note.png`

Dialog for creating secure text notes:
- Title field
- Large multiline text area for notes
- Favorite checkbox
- Save and Cancel buttons

![Secure Note Dialog](screenshots/07-entry-dialog-secure-note.png)

---

### 8. Entry Dialog - File Attachment
**File**: `screenshots/08-entry-dialog-file.png`

Dialog for attaching and storing files:
- Title field
- File selection button
- File name display
- Notes field
- Favorite checkbox
- Save and Cancel buttons

![File Entry Dialog](screenshots/08-entry-dialog-file.png)

---

### 9. Password Generator Dialog
**File**: `screenshots/09-password-generator-dialog.png`

Password generator tool:
- Generated password display
- Password length slider (8-64 characters)
- Character type options:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&*)
- Password strength indicator
- Generate button
- Copy to Clipboard button
- Use This Password button

![Password Generator Dialog](screenshots/09-password-generator-dialog.png)

---

### 10. Vault Dialog
**File**: `screenshots/10-vault-dialog.png`

Dialog for creating/editing vaults:
- Vault name field
- Description field
- Color selection (for organization)
- Save and Cancel buttons

![Vault Dialog](screenshots/10-vault-dialog.png)

---

### 11. Settings Dialog
**File**: `screenshots/11-settings-dialog.png`

Settings and preferences:
- **Account Section**:
  - Current username display
  - Change Password button
  - Account type badge
- **Appearance Section**:
  - Theme selector (Light/Dark/System)
- **Database Section**:
  - Database location display
  - Backup button
- **About Section**:
  - Version information
  - License information

![Settings Dialog](screenshots/11-settings-dialog.png)

---

## Features & Functionality

### 12. Search and Filter
**File**: `screenshots/12-search-and-filter.png`

Enhanced search functionality:
- Search bar with magnifying glass icon
- Placeholder text: "Search entries..."
- Type filter buttons highlighted
- Real-time filtering as you type
- Results update dynamically

![Search and Filter](screenshots/12-search-and-filter.png)

---

### 13. Password Reveal
**File**: `screenshots/13-password-reveal.png`

Password visibility toggle:
- Eye icon button next to password field
- Password shown in plain text when revealed
- Quick toggle between hidden (dots) and visible

![Password Reveal](screenshots/13-password-reveal.png)

---

### 14. Password Strength Indicator
**File**: `screenshots/14-password-strength-indicator.png`

Real-time password strength feedback:
- Visual bar indicator
- Color-coded strength:
  - Red: Weak (< 6 characters)
  - Yellow: Medium (6-11 characters)
  - Green: Strong (12+ characters with variety)
- Text label: "Weak", "Medium", or "Strong"

![Password Strength Indicator](screenshots/14-password-strength-indicator.png)

---

## Themes

### 15. Dark Theme
**File**: `screenshots/15-dark-theme.png`

Application in dark mode:
- Dark background colors
- High contrast for readability
- Optimized for low-light environments
- Consistent theming across all dialogs

![Dark Theme](screenshots/15-dark-theme.png)

---

### 16. Light Theme
**File**: `screenshots/16-light-theme.png`

Application in light mode (default):
- Bright, clean interface
- Professional appearance
- Default theme on first launch

![Light Theme](screenshots/16-light-theme.png)

---

## Account Types & Permissions

### 17. Admin Account View
**File**: `screenshots/17-admin-view.png`

Admin account features:
- Full access to all vaults
- Can create access restrictions
- User management capabilities
- All standard features

**Login**: `admin` / `Admin123!`

![Admin View](screenshots/17-admin-view.png)

---

### 18. User Account View
**File**: `screenshots/18-user-view.png`

Standard user account:
- Personal vaults
- Full password management features
- Cannot manage access restrictions
- Cannot access restricted entries

**Login**: `john` / `John123!`

![User View](screenshots/18-user-view.png)

---

### 19. Child Account View
**File**: `screenshots/19-child-view.png`

Child account with restrictions:
- Limited access based on admin settings
- Some entries may be blocked
- Can view and use allowed entries
- Cannot modify restrictions

**Login**: `sarah` / `Sarah123!`

![Child View](screenshots/19-child-view.png)

---

### 20. Access Restriction Settings
**File**: `screenshots/20-access-restriction.png`

Admin-only access restriction management:
- Select entries to restrict
- Choose which child users to restrict
- Manage existing restrictions
- Granular permission control

![Access Restriction](screenshots/20-access-restriction.png)

---

## How to Capture Screenshots

### Prerequisites
- Windows operating system (WPF application)
- .NET 8.0 SDK installed
- Application built and ready to run

### Quick Start

1. **Build the application**:
   ```bash
   dotnet build
   ```

2. **Run the application**:
   ```bash
   dotnet run --project PasswordManager.UI
   ```

3. **Use the automated guide** (recommended):
   ```powershell
   .\Take-Screenshots.ps1
   ```
   
   This PowerShell script will guide you through capturing each screenshot step-by-step.

### Manual Screenshot Capture

**Recommended Tools**:
- Windows Snipping Tool (Win + Shift + S) - Built-in
- ShareX - Free, feature-rich
- Greenshot - Free, simple
- Snagit - Professional (paid)

**Guidelines**:
- Use 1920x1080 or higher resolution
- Capture full window including title bar
- Ensure good contrast and readability
- Use demo accounts (never real data)
- Save as PNG format for best quality
- Use consistent window sizes
- Disable desktop notifications before capturing

### Screenshot Checklist

See `screenshots/README.md` for the complete list of required screenshots.

---

## Contributing Screenshots

If you're updating screenshots:

1. Follow the naming convention: `##-description.png`
2. Use demo data only
3. Ensure high quality (1080p+)
4. Capture both light and dark themes where applicable
5. Save in `screenshots/` directory
6. Update this document if adding new screens

---

## Notes

- All screenshots use demo accounts and sample data
- Password Manager respects your privacy - no telemetry or data collection
- Screenshots are taken on Windows 11 with .NET 8.0
- Application design may evolve; screenshots will be updated accordingly

---

*Last Updated: [Date to be added when screenshots are captured]*
