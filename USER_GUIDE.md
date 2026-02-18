# User Guide - Password Manager

## Getting Started

### First Launch

1. **Run the application**
   - Execute `PasswordManager.UI.exe` or run `dotnet run --project PasswordManager.UI`
   
2. **Create your first account**
   - Click "Create New Account"
   - Enter a username (unique)
   - Enter a strong password (minimum 8 characters)
   - Select account type:
     - **Admin**: Full control, can manage access restrictions
     - **User**: Standard user with personal vaults
     - **Child**: Limited access, can be restricted by admins
   
3. **Login**
   - Select your account from the dropdown
   - Enter your password
   - Click "Sign In"

## Main Interface

### Sidebar
- **New Entry**: Create a new password entry
- **Vaults**: List of your vaults
- **New Vault**: Create a new vault to organize entries

### Content Area
- **Search Bar**: Enhanced search with icon and placeholder text - search entries by title or username in real-time
- **Filter Buttons**: Filter by entry type (All, Login, Credit Card, Notes, Files)
- **Entries List**: Click on any entry to view/edit details

## Managing Password Entries

### Creating a New Entry

1. Click "New Entry" button
2. Select entry type:
   - **Login**: Store website credentials
   - **Credit Card**: Store payment card information
   - **Secure Note**: Store text notes
   - **Custom File**: Attach and store files

3. Fill in the required fields:
   - **Title**: Name of the entry
   - Type-specific fields (username, password, card number, etc.)
   - **Notes**: Additional information
   - **Favorite**: Mark important entries

4. Click "Save"

### Login Entries

**Fields:**
- Title
- Username
- Email
- Password (encrypted)
- URL
- Notes

**Password Features:**
- 👁 **Reveal/Hide**: Toggle password visibility
- 📋 **Copy**: Copy password to clipboard
- **Generate**: Open password generator
- **Strength Indicator**: Real-time password strength feedback

### Credit Card Entries

**Fields:**
- Title
- Cardholder Name
- Card Number (encrypted)
- Expiry Date (MM/YY format)
- CVV (encrypted)
- Notes

### Secure Notes

Store any text information securely in your vault.

### Custom Files

Attach files of any type. Files are stored encrypted in the database.

## Password Generator

### Opening the Generator
- Click "Generate Password" in the entry dialog
- Or use it from the entry form when creating/editing login credentials

### Options
- **Password Length**: 8-64 characters (slider)
- **Include Uppercase**: A-Z
- **Include Lowercase**: a-z
- **Include Numbers**: 0-9
- **Include Special Characters**: !@#$%^&*()...

### Features
- **Real-time Regeneration**: Changes update the password instantly
- **Strength Indicator**: Visual feedback on password quality
- **Copy**: Copy generated password
- **Use Password**: Insert into the current entry

## Managing Vaults

### Creating a Vault
1. Click "New Vault"
2. Enter vault name
3. Add optional description
4. Click "Create Vault"

### Using Vaults
- Select a vault from the sidebar to view its entries
- Each vault can contain unlimited entries
- Organize by purpose (Personal, Work, Family, etc.)

## Account Settings

### Accessing Settings
Click the "Settings" button in the top-right corner.

### Available Settings
1. **Account Information**
   - View username
   - View account type
   - View creation date

2. **Change Password**
   - Enter current password
   - Enter new password
   - Confirm new password
   - Click "Update Password"

3. **Database Information**
   - View database file location
   - Located in: `%AppData%\PasswordManager\passwordmanager.db`

## Access Control (Admin Only)

Admins can restrict child users' access to specific entries.

### Blocking Access
1. Create or edit a password entry
2. Scroll to "Access Restrictions" section (Admin only)
3. Select child users to restrict
4. Click "Save"

### Effect
- Restricted entries won't appear for child users
- Child users cannot view or edit restricted entries

## Security Features

### Encryption
- **AES-256**: Industry-standard encryption for passwords
- **PBKDF2**: Secure password hashing with SHA-256
- **Master Password**: Used as encryption key

### Best Practices
1. **Use Strong Master Password**: Your master password protects everything
2. **Regular Updates**: Change passwords periodically using the generator
3. **Backup Database**: Copy `passwordmanager.db` to safe location
4. **Don't Share Master Password**: Keep it secret and secure

## Tips & Tricks

1. **Search Quickly**: Use the search bar to find entries instantly
2. **Use Favorites**: Star frequently used entries
3. **Organize with Vaults**: Separate personal and work credentials
4. **Generate Strong Passwords**: Use the password generator for all new accounts
5. **Check Password Strength**: Aim for "Strong" (green) ratings
6. **Use Notes**: Add security questions, recovery codes, or other info

## Troubleshooting

### Forgot Master Password?
Unfortunately, passwords are encrypted with your master password. If you forget it, there's no recovery method. Always remember your master password!

### Database Location?
Check Settings to see the exact path. Default: `%AppData%\PasswordManager\passwordmanager.db`

### Can't See an Entry?
- Check if you're in the correct vault
- Check if filters are applied
- If you're a child user, it might be restricted by an admin

### Password Not Copying?
Make sure clipboard access is enabled in your system settings.

## Keyboard Shortcuts

- **Search**: Click the search box and start typing
- **Enter**: Save in dialogs
- **Escape**: Cancel in dialogs

## Data Management

### Backup
1. Close the application
2. Navigate to `%AppData%\PasswordManager\`
3. Copy `passwordmanager.db` to backup location
4. Store securely

### Restore
1. Close the application
2. Replace `passwordmanager.db` with your backup
3. Restart the application

## Support

For issues or questions:
- Check this user guide
- Review the README.md file
- Check for application updates
