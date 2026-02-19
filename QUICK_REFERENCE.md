# Password Manager - Quick Reference Card

## 🚀 Quick Start

### First Time Setup
```
1. Launch PasswordManager.UI.exe
2. Click "Create New Account"
3. Enter username & strong password
4. Select role: Admin (recommended for first user)
5. Default "Personal" vault created automatically
```

### Daily Use
```
1. Select account from dropdown
2. Enter master password
3. Click "Sign In"
4. Start managing passwords!
```

---

## 🎯 Common Tasks

### Add New Password
```
Main Window → [+ New Entry] → Fill details → [Save]
```

### Find Password
```
Search bar → Type title/username → Click entry → View/Edit
```

### Generate Strong Password
```
Entry Dialog → [Generate Password] → Adjust options → [Use Password]
```

### Change Master Password
```
Main Window → [Settings] → Change Password section → [Update Password]
```

### Create New Vault
```
Main Window → [+ New Vault] → Enter name/description → [Create Vault]
```

---

## ⌨️ Interface Elements

### Main Window Layout
```
┌─────────────────────────────────────────────────────┐
│ 🔐 Password Manager    User (Role) │ Settings │ ▶   │
├──────────┬──────────────────────────────────────────┤
│          │ 🔍 Search...                             │
│ + New    │ [All] [Login] [Card] [Note] [File]      │
│          │                                          │
│ VAULTS   │ ┌──────────────────────────────────┐    │
│ ▶Vault 1 │ │ Entry 1                    ⭐    │    │
│  Vault 2 │ └──────────────────────────────────┘    │
│          │ ┌──────────────────────────────────┐    │
│ + Vault  │ │ Entry 2                          │    │
│          │ └──────────────────────────────────┘    │
└──────────┴──────────────────────────────────────────┘
```

### Entry Types
- **Login** 🔑: Website credentials
- **Credit Card** 💳: Payment cards  
- **Secure Note** 📝: Text notes
- **Custom File** 📄: File attachments

---

## 🔒 Security Tips

### Strong Master Password
✅ **DO:**
- 12+ characters
- Mix: Upper, lower, numbers, symbols
- Unique (not used elsewhere)
- Memorable to you

❌ **DON'T:**
- Common words ("password")
- Personal info (birthdate)
- Keyboard patterns ("qwerty")
- Share with anyone

### Best Practices
- ✅ Use password generator
- ✅ Aim for "Strong" (green)
- ✅ Unique password per account
- ✅ Regular backups
- ✅ Logout when done

---

## 👤 Account Roles

| Role  | Create Entries | Edit Own | Restrict Others |
|-------|---------------|----------|-----------------|
| Admin | ✅            | ✅       | ✅              |
| User  | ✅            | ✅       | ❌              |
| Child | ✅            | ✅       | ❌              |

**Admin Special Powers:**
- Can block child users from specific entries
- Access Restrictions section visible in entry dialog

---

## 🔍 Search Tips

### Search Capabilities
- Searches **Title** and **Username** fields
- **Real-time** filtering
- **Case-insensitive**
- Works with **type filters**

### Examples
```
Search: "github"
→ Finds: "GitHub Login", "GitHub API Token"

Search: "work"  +  Filter: [Login]
→ Finds: Only login entries with "work"
```

---

## 🎨 Password Generator

### Quick Settings
```
Length: 16 (recommended)
☑ Uppercase
☑ Lowercase  
☑ Numbers
☑ Special Characters
```

### Strength Guide
- 🔴 **Weak** (0-39): Add length & variety
- 🟠 **Medium** (40-69): Add special chars
- 🟢 **Strong** (70-100): Perfect!

---

## 📁 File Locations

### Database
```
Windows: %AppData%\PasswordManager\passwordmanager.db
Full:    C:\Users\[YourName]\AppData\Roaming\PasswordManager\
```

### Backup
```
1. Close Password Manager
2. Copy passwordmanager.db
3. Save to secure location (USB, cloud backup)
4. Restore: Replace file & restart
```

---

## 🆘 Troubleshooting

### Can't Login?
- ✓ Check Caps Lock
- ✓ Correct account selected?
- ✓ Try retyping password
- ⚠️ No password recovery available!

### Entry Not Showing?
- ✓ Correct vault selected?
- ✓ Search/filter active?
- ✓ If Child account: May be restricted

### Performance Slow?
- ✓ Close & reopen app
- ✓ Check database size
- ✓ Consider archiving old entries

---

## 🎯 Keyboard Shortcuts

| Action | Key |
|--------|-----|
| Search | Click search box, start typing |
| Save Dialog | Enter |
| Cancel Dialog | Esc |

---

## 📊 At a Glance

### Features
✅ AES-256 Encryption  
✅ Multiple Vaults  
✅ Password Generator  
✅ Search & Filter  
✅ Access Control  
✅ 4 Entry Types  

### Tech Stack
- .NET 8.0
- WPF UI
- SQLite DB
- EF Core 8.0

### Capacity
- Users: Unlimited
- Vaults: Unlimited  
- Entries: 10,000+ tested
- Files: <10MB recommended

---

## 📞 Support

### Documentation
- `USER_GUIDE.md` - Full user manual
- `TECHNICAL_DOCS.md` - Developer docs
- `FEATURES.md` - Feature showcase
- `SCREENSHOTS.md` - UI layouts

### Security
- No internet connection required
- Data stored locally only
- Master password never stored
- Industry-standard encryption

---

**Version:** 1.0  
**Platform:** Windows 10/11  
**License:** MIT

*Keep your master password safe - it cannot be recovered!*
