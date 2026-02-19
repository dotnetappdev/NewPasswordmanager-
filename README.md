# Password Manager - Modern Desktop Application

A modern, secure password manager built with .NET 8 and WPF, following SOLID principles.

## 📚 Documentation

- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete user guide with step-by-step instructions
- **[TECHNICAL_DOCS.md](TECHNICAL_DOCS.md)** - Technical architecture and developer documentation
- **[SCREENSHOTS.md](SCREENSHOTS.md)** - High-quality screenshots of all application screens
- **[FEATURES.md](FEATURES.md)** - Comprehensive feature showcase with examples
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Implementation overview and statistics

### Screenshot Documentation (Windows Only)
- **[SCREENSHOT_QUICKSTART.md](SCREENSHOT_QUICKSTART.md)** - Quick start guide for capturing screenshots
- **[SCREENSHOT_REQUIREMENTS.md](SCREENSHOT_REQUIREMENTS.md)** - Detailed capture guidelines and specifications

## Features

### 🔐 Security
- **AES-256 Encryption**: Heavy encryption for all sensitive data (passwords, credit cards, CVV)
- **Secure Password Hashing**: PBKDF2 with SHA-256 for user authentication
- **SQLite Database**: Stored securely in AppData folder
- **Password Strength Indicator**: Real-time feedback on password security

### 👥 Account Management
- **Multiple Account Types**: Admin, User, and Child roles
- **Netflix-style Login**: Select from existing accounts on login screen
- **Access Control**: Admins can block child users from specific password entries
- **Secure Password Changes**: Update passwords through settings

### 🗂️ Organization
- **Multiple Vaults**: Organize passwords into different vaults
- **Entry Categories**: 
  - Login credentials (username, email, password, URL)
  - Credit cards (cardholder, number, expiry, CVV)
  - Secure notes
  - Custom file attachments
- **Enhanced Search Bar**: Real-time search with icon and placeholder text - filter entries by title or username as you type
- **Type Filters**: Quickly filter by entry type (All, Login, Credit Card, Notes, Files)
- **Favorites**: Mark important entries for quick access

### 🛠️ Password Tools
- **Password Generator**: 
  - Customizable length (8-64 characters)
  - Character type selection (uppercase, lowercase, numbers, special chars)
  - Strength indicator
- **Reveal/Hide**: Toggle password visibility
- **Copy to Clipboard**: One-click password copying
- **Edit Dialog Integration**: Generate passwords directly in entry forms

### 🎨 User Interface
- **Modern Design**: Clean, intuitive WPF interface
- **Responsive Layout**: Organized sidebar and content area
- **Settings Page**: Manage account and view database location

## Architecture

The application follows SOLID principles with a clean separation of concerns:

### Projects
1. **PasswordManager.Core** - Business logic and domain models
   - Models: User, Vault, PasswordEntry, AccessRestriction
   - Services: EncryptionService, PasswordGeneratorService
   - Interfaces: IEncryptionService, IPasswordGeneratorService

2. **PasswordManager.Data** - Data access layer
   - Entity Framework Core with SQLite
   - DbContext configuration
   - Database stored in AppData

3. **PasswordManager.UI** - WPF presentation layer
   - MVVM pattern with CommunityToolkit.Mvvm
   - Views and ViewModels
   - Dependency injection

## Technology Stack

- **.NET 8.0**
- **WPF (Windows Presentation Foundation)**
- **Entity Framework Core 8.0**
- **SQLite Database**
- **CommunityToolkit.Mvvm**
- **Microsoft.Extensions.DependencyInjection**

## Getting Started

### Prerequisites
- .NET 8.0 SDK or later
- Windows OS (WPF requirement)

### Building the Application
```bash
dotnet build
```

### Running the Application
```bash
dotnet run --project PasswordManager.UI
```

### First Time Setup
1. Launch the application
2. Demo users are automatically created on first run:
   - **Username:** `admin` | **Password:** `Admin123!` | **Role:** Admin
   - **Username:** `john` | **Password:** `John123!` | **Role:** User
   - **Username:** `sarah` | **Password:** `Sarah123!` | **Role:** Child
3. Admin account includes sample password entries (GitHub, Gmail, Credit Card, WiFi Note)
4. Or create your own account by clicking "Create New Account"

### Theme Support
- **Light Mode**: Default bright theme
- **Dark Mode**: Optimized dark theme
- **System Mode**: Auto-detects Windows theme setting
- Change theme in Settings → Appearance → Theme
- Theme preference is saved and persists across sessions

## Screenshots & Visual Documentation

See **[SCREENSHOTS.md](SCREENSHOTS.md)** for detailed screenshots of all application screens and features.

To capture new screenshots on Windows:
```powershell
.\Take-Screenshots.ps1
```

This interactive script guides you through capturing all 20 required screenshots. See **[SCREENSHOT_REQUIREMENTS.md](SCREENSHOT_REQUIREMENTS.md)** for detailed guidelines.

## Database Location

The SQLite database is stored at:
```
%AppData%\PasswordManager\passwordmanager.db
```

## Security Best Practices

- Always use a strong master password for your account
- Regularly update your passwords using the password generator
- Use the password strength indicator to ensure strong passwords
- Backup your database file regularly
- Keep your master password secure and memorable

## License

This project is licensed under the MIT License.