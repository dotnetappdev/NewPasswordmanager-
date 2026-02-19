# New Features - Passkeys, Seed Data & Theme Support

## 🔑 Passkey Support (WebAuthn)

### Generate and Store Passkey Credentials

The password manager now supports **passkeys** (WebAuthn credentials), enabling you to store cryptographic credentials for passwordless authentication.

**What are Passkeys?**
- Modern replacement for passwords using public-key cryptography
- More secure than traditional passwords (resistant to phishing, credential stuffing)
- Used by major platforms (Google, Apple, Microsoft, GitHub, etc.)
- Based on FIDO2/WebAuthn standards

**How to Create a Passkey Entry:**

1. **Select a vault** and click "New Entry"
2. **Choose "Passkey"** as the Entry Type
3. **Fill in the details:**
   ```
   Title:              Your App/Site Name
   Relying Party ID:   example.com
   Relying Party Name: Example Website
   User Display Name:  john.doe
   User Handle:        (auto-generated or custom)
   ```
4. **Click "Generate Passkey Credential"**
5. **Save the entry** - The private key is encrypted and stored securely

**Security Features:**
- RSA 2048-bit cryptographic key pairs
- Private keys encrypted with AES-256 using your master password
- Secure random credential and user handle generation
- Credential counter for replay attack prevention
- Public/private key separation (only private key is encrypted)

**Use Cases:**
- Store WebAuthn credentials for websites
- Backup passkeys for critical accounts
- Manage FIDO2 authentication across devices
- Passwordless authentication workflows

---

## Demo Users (Seed Data)

### Automatically Created on First Launch

When you run the application for the first time, three demo users are automatically created:

#### 1. Admin Account
```
Username: admin
Password: Admin123!
Role:     Admin
```

**Pre-loaded Sample Data:**
- 🔑 GitHub Login (Favorite)
  - Username: admin@example.com
  - Password: DemoPass123!
  - URL: https://github.com
  
- 🔑 Gmail Login
  - Username: admin
  - Email: admin@gmail.com
  - Password: Gmail456!
  
- 💳 Primary Visa Card
  - Cardholder: Admin User
  - Card Number: 4532 1234 5678 9012
  - Expiry: 12/28
  - CVV: 123
  
- 📝 WiFi Password Note
  - Network: HomeNetwork
  - Password: MySecureWiFi123!
  - Router: 192.168.1.1

#### 2. User Account
```
Username: john
Password: John123!
Role:     User
```
- Empty personal vault ready for use

#### 3. Child Account
```
Username: sarah
Password: Sarah123!
Role:     Child
```
- Empty personal vault ready for use

### Purpose
- **Quick Start**: Try the app immediately without setup
- **Feature Demo**: See all entry types in action
- **Testing**: Test access control and restrictions
- **Learning**: Explore the interface with real data

---

## Theme Support

### Three Theme Modes

#### 1. Light Mode (Default)
```
Primary Blue:   #2563EB
Secondary:      #475569
Background:     #F8FAFC (Light gray)
Surface:        #FFFFFF (White)
Text:           #1E293B (Dark)
Border:         #E2E8F0
```

**Best for:**
- Bright environments
- Daytime use
- Maximum readability
- Default Windows light mode

#### 2. Dark Mode
```
Primary Blue:   #3B82F6
Secondary:      #94A3B8
Background:     #0F172A (Very dark blue)
Surface:        #1E293B (Dark blue-gray)
Text:           #F1F5F9 (Light)
Border:         #334155
```

**Best for:**
- Low-light environments
- Evening/night use
- Reduced eye strain
- Dark Windows theme users

#### 3. System Mode (Auto)
- **Detects Windows theme setting**
- Reads from: `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize`
- Registry value: `AppsUseLightTheme`
- Updates when Windows theme changes (requires app restart)

### Settings Integration

**Location:** Main Window → Settings → Appearance

**Visual Layout:**
```
┌─────────────────────────────────────┐
│ Appearance                          │
│                                     │
│ Theme                               │
│ ┌─────────────────────────────────┐│
│ │ System                       ▼ ││
│ └─────────────────────────────────┘│
│                                     │
│ Options:                            │
│ • System (Auto-detect Windows)      │
│ • Light                             │
│ • Dark                              │
└─────────────────────────────────────┘
```

**Behavior:**
1. Select theme from dropdown
2. Theme applies instantly
3. Preference saved to `%AppData%\PasswordManager\theme.settings`
4. Persists across application restarts

### Theme Comparison

**Login Window Example:**

**Light Mode:**
```
┌──────────────────────────────────────┐
│                                      │
│  ┌────────┐      ┌──────────────┐   │
│  │  🔐    │      │ Welcome Back │   │
│  │ Light  │      │              │   │
│  │  BG    │      │ [Account ▼] │   │
│  │ #2563EB│      │              │   │
│  │        │      │ [Password  ] │   │
│  │        │      │              │   │
│  │        │      │ [Sign In   ] │   │
│  └────────┘      └──────────────┘   │
│     Blue              White          │
└──────────────────────────────────────┘
```

**Dark Mode:**
```
┌──────────────────────────────────────┐
│                                      │
│  ┌────────┐      ┌──────────────┐   │
│  │  🔐    │      │ Welcome Back │   │
│  │  Dark  │      │              │   │
│  │   BG   │      │ [Account ▼] │   │
│  │ #3B82F6│      │              │   │
│  │        │      │ [Password  ] │   │
│  │        │      │              │   │
│  │        │      │ [Sign In   ] │   │
│  └────────┘      └──────────────┘   │
│   Lighter Blue    Dark Surface      │
└──────────────────────────────────────┘
```

### Technical Implementation

**Theme Detection (Windows Registry):**
```csharp
Registry Path: HKEY_CURRENT_USER\Software\Microsoft\Windows\
               CurrentVersion\Themes\Personalize

Key: AppsUseLightTheme
Value: 0 = Dark Mode
       1 = Light Mode
```

**Storage:**
```
File: %AppData%\PasswordManager\theme.settings
Content: Integer (0=System, 1=Light, 2=Dark)
```

**Runtime Behavior:**
- Theme service reads Windows registry
- Applies colors to WPF resource dictionary
- All UI elements update dynamically
- No restart required for manual changes

### User Benefits

✅ **Accessibility**: Better visibility in different lighting
✅ **Comfort**: Reduced eye strain in dark mode
✅ **Integration**: Matches Windows system preference
✅ **Flexibility**: Manual override when needed
✅ **Persistence**: Remembers your choice

### Keyboard Shortcut (Future Enhancement)
- Could add Ctrl+T to toggle themes
- Could add system tray theme indicator

---

## Combined Demo Flow

### First Launch Experience

```
1. Launch Application
   ↓
2. Database Created (passwordmanager.db)
   ↓
3. Seed Data Loaded
   - 3 Users Created
   - 1 Vault per User
   - 4 Sample Entries for Admin
   ↓
4. Theme Applied
   - Loads saved preference (or System default)
   - Applies colors
   ↓
5. Login Window Shown
   ↓
6. User Sees:
   - 3 accounts in dropdown
   - Theme already applied
   - Ready to login!
```

### Testing Themes with Demo Data

**Try This:**
1. Login as `admin` / `Admin123!`
2. View sample password entries
3. Go to Settings
4. Change theme to "Dark"
5. See entries update with dark colors
6. Change to "Light"
7. See entries update with light colors
8. Change to "System"
9. Matches your Windows theme

---

## File Structure

New files added:
```
PasswordManager.Core/
├── Enums/
│   └── AppTheme.cs                    (Light/Dark/System enum)
├── Interfaces/
│   └── IThemeService.cs               (Theme service interface)

PasswordManager.Data/
└── SeedDataService.cs                 (Demo data creation)

PasswordManager.UI/
└── Services/
    └── ThemeService.cs                (Theme implementation)
```

Settings files:
```
%AppData%\PasswordManager\
├── passwordmanager.db                 (SQLite database)
└── theme.settings                     (Theme preference)
```

---

*Both features work together to provide an excellent first-time user experience with immediate usability and visual customization.*
