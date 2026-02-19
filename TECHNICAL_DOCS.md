# Technical Documentation - Password Manager

## Architecture Overview

This application follows clean architecture principles with clear separation of concerns across three projects.

### Project Structure

```
PasswordManager/
├── PasswordManager.Core/         # Domain & Business Logic
│   ├── Enums/                   # Enumerations
│   │   ├── UserRole.cs
│   │   └── EntryType.cs
│   ├── Interfaces/              # Service interfaces
│   │   ├── IEncryptionService.cs
│   │   └── IPasswordGeneratorService.cs
│   ├── Models/                  # Domain models
│   │   ├── User.cs
│   │   ├── Vault.cs
│   │   ├── PasswordEntry.cs
│   │   └── AccessRestriction.cs
│   └── Services/                # Business logic
│       ├── EncryptionService.cs
│       └── PasswordGeneratorService.cs
├── PasswordManager.Data/        # Data Access Layer
│   ├── Context/
│   │   ├── PasswordManagerContext.cs
│   │   └── PasswordManagerContextFactory.cs
│   └── DatabaseService.cs
└── PasswordManager.UI/          # Presentation Layer
    ├── Views/                   # XAML views
    ├── ViewModels/              # (Future: ViewModels)
    ├── Converters/              # Value converters
    ├── Styles/                  # UI styles
    └── Helpers/                 # UI helpers
```

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- Each class has one reason to change
- `EncryptionService`: Only handles encryption/decryption
- `PasswordGeneratorService`: Only generates passwords
- `PasswordManagerContext`: Only manages database context

### Open/Closed Principle (OCP)
- Services are open for extension through interfaces
- New entry types can be added without modifying existing code
- New encryption algorithms can be implemented by creating new `IEncryptionService` implementations

### Liskov Substitution Principle (LSP)
- All service implementations can be substituted through their interfaces
- Dependency injection allows swapping implementations

### Interface Segregation Principle (ISP)
- Small, focused interfaces (`IEncryptionService`, `IPasswordGeneratorService`)
- Clients only depend on interfaces they use

### Dependency Inversion Principle (DIP)
- High-level modules (UI) depend on abstractions (interfaces)
- Low-level modules (services) implement abstractions
- Dependencies injected through constructor injection

## Data Models

### User
```csharp
- Id: int (PK)
- Username: string (Unique)
- PasswordHash: string
- Salt: string
- Role: UserRole (Admin/User/Child)
- CreatedAt: DateTime
- LastLoginAt: DateTime?
- Vaults: ICollection<Vault>
- RestrictedEntries: ICollection<AccessRestriction>
```

### Vault
```csharp
- Id: int (PK)
- Name: string
- Description: string
- UserId: int (FK)
- CreatedAt: DateTime
- ModifiedAt: DateTime?
- User: User
- Entries: ICollection<PasswordEntry>
```

### PasswordEntry
```csharp
- Id: int (PK)
- Title: string
- Type: EntryType
- VaultId: int (FK)
- CreatedAt: DateTime
- ModifiedAt: DateTime?
- Login Fields: Username, Email, EncryptedPassword, Url
- Credit Card Fields: CardholderName, EncryptedCardNumber, ExpiryDate, EncryptedCvv
- Common: Notes, Category, IsFavorite
- File: FileName, FileData
- Vault: Vault
- AccessRestrictions: ICollection<AccessRestriction>
```

### AccessRestriction
```csharp
- Id: int (PK)
- PasswordEntryId: int (FK)
- RestrictedUserId: int (FK)
- CreatedAt: DateTime
- CreatedByUserId: int
- PasswordEntry: PasswordEntry
- RestrictedUser: User
```

## Security Implementation

### Password Hashing
**Algorithm**: PBKDF2 with SHA-256
**Iterations**: 10,000
**Salt**: 32 bytes, randomly generated per user
**Hash**: 32 bytes

```csharp
var salt = RandomNumberGenerator.GetBytes(32);
var pbkdf2 = new Rfc2898DeriveBytes(password, saltBytes, 10000, HashAlgorithmName.SHA256);
var hash = pbkdf2.GetBytes(32);
```

### Data Encryption
**Algorithm**: AES-256-CBC
**Key Derivation**: PBKDF2 with SHA-256
**IV**: Derived from password and salt
**Salt**: 16 bytes per encrypted value

**Encrypted Fields**:
- PasswordEntry.EncryptedPassword
- PasswordEntry.EncryptedCardNumber
- PasswordEntry.EncryptedCvv

**Process**:
1. Generate random 16-byte salt
2. Derive 32-byte key from master password + salt using PBKDF2
3. Derive 16-byte IV from same derivation
4. Encrypt plaintext using AES-256-CBC
5. Concatenate salt + ciphertext
6. Base64 encode for storage

### Password Strength Calculation

Scoring system (0-100):
- Length ≥8: +20 points
- Length ≥12: +20 points
- Length ≥16: +10 points
- Contains uppercase: +15 points
- Contains lowercase: +15 points
- Contains digits: +10 points
- Contains special chars: +10 points

**Ratings**:
- 0-39: Weak (Red)
- 40-69: Medium (Orange)
- 70-100: Strong (Green)

## Database Schema

### Tables
1. **Users**
   - Primary Key: Id
   - Unique Index: Username

2. **Vaults**
   - Primary Key: Id
   - Foreign Key: UserId → Users.Id (Cascade Delete)

3. **PasswordEntries**
   - Primary Key: Id
   - Foreign Key: VaultId → Vaults.Id (Cascade Delete)

4. **AccessRestrictions**
   - Primary Key: Id
   - Foreign Key: PasswordEntryId → PasswordEntries.Id (Cascade Delete)
   - Foreign Key: RestrictedUserId → Users.Id (Restrict)

### Connection String
```
Data Source=%AppData%\PasswordManager\passwordmanager.db
```

## Dependency Injection

Services are registered in `App.xaml.cs`:

```csharp
services.AddDbContext<PasswordManagerContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));
services.AddSingleton<IEncryptionService, EncryptionService>();
services.AddSingleton<IPasswordGeneratorService, PasswordGeneratorService>();
services.AddScoped<DatabaseService>();
services.AddTransient<LoginWindow>();
services.AddTransient<MainWindow>();
```

## UI Architecture

### MVVM Pattern (Partial Implementation)
- Views: XAML files
- Code-behind: Event handlers and view logic
- Services: Business logic separated from UI

### Dialogs
1. **LoginWindow**: User authentication
2. **CreateAccountDialog**: New user registration
3. **MainWindow**: Main application interface
4. **EntryDialog**: Create/Edit password entries
5. **VaultDialog**: Create vaults
6. **PasswordGeneratorDialog**: Generate passwords
7. **SettingsDialog**: User settings

### Styling
- Modern, clean design with custom styles
- Consistent color scheme
- Rounded corners and shadows
- Responsive layouts

## Extension Points

### Adding New Entry Types
1. Add enum value to `EntryType`
2. Add fields to `PasswordEntry` model
3. Update `EntryDialog` to handle new type
4. Add filter button in `MainWindow`

### Adding New Services
1. Create interface in `Core/Interfaces`
2. Implement in `Core/Services`
3. Register in DI container
4. Inject where needed

### Custom Encryption
1. Implement `IEncryptionService`
2. Register new implementation in DI
3. Existing code continues to work

## Testing Recommendations

### Unit Tests
- Test `EncryptionService` encrypt/decrypt operations
- Test `PasswordGeneratorService` generation and strength
- Test password hashing and verification

### Integration Tests
- Test database operations
- Test user authentication flow
- Test entry CRUD operations

### UI Tests
- Test navigation flows
- Test form validation
- Test access control

## Performance Considerations

### Database
- Indexes on frequently queried fields (Username)
- Lazy loading for related entities
- Efficient queries with EF Core

### Memory
- Dispose DbContext properly
- Clear sensitive data from memory when done
- Use `using` statements for IDisposable objects

### UI
- Async operations for database calls
- No blocking on UI thread
- Virtual scrolling for large lists (future enhancement)

## Security Best Practices

### Code Level
1. Never log sensitive data
2. Clear passwords from memory after use
3. Use secure random number generation
4. Validate all user inputs
5. Use parameterized queries (EF Core handles this)

### Deployment
1. Enable Windows targeting for WPF
2. Use Release configuration for production
3. Sign the assembly
4. Consider code obfuscation

### User Education
1. Encourage strong master passwords
2. Remind about backup importance
3. Warn about password recovery limitations

## Future Enhancements

### Planned Features
1. Auto-lock after inactivity
2. Two-factor authentication
3. Cloud sync support
4. Browser extension integration
5. Password audit (find weak/reused passwords)
6. Secure password sharing
7. Import/Export functionality
8. Dark mode theme
9. Biometric authentication

### Technical Debt
1. Move to full MVVM with ViewModels
2. Add comprehensive unit tests
3. Implement repository pattern
4. Add logging framework
5. Improve error handling with Result pattern

## Deployment

### Requirements
- .NET 8.0 Runtime
- Windows 10 or later
- 50MB disk space

### Build Commands
```bash
# Debug build
dotnet build

# Release build
dotnet build -c Release

# Publish self-contained
dotnet publish -c Release -r win-x64 --self-contained
```

### Installation
1. Build/publish the application
2. Copy output to desired location
3. Run `PasswordManager.UI.exe`
4. Database created automatically on first run

## Troubleshooting

### Common Issues

**Database locked**
- Ensure only one instance is running
- Check file permissions in AppData folder

**Encryption errors**
- Verify master password is correct
- Check for database corruption

**UI not responsive**
- Ensure async operations are used
- Check for blocking database calls

## Contributing Guidelines

1. Follow SOLID principles
2. Maintain separation of concerns
3. Write clean, readable code
4. Add XML documentation comments
5. Test thoroughly
6. Update documentation

## License

MIT License - See LICENSE file for details
