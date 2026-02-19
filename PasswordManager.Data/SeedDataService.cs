using Microsoft.EntityFrameworkCore;
using PasswordManager.Core.Enums;
using PasswordManager.Core.Interfaces;
using PasswordManager.Core.Models;
using PasswordManager.Data.Context;

namespace PasswordManager.Data;

public class SeedDataService
{
    private readonly PasswordManagerContext _context;
    private readonly IEncryptionService _encryptionService;

    public SeedDataService(PasswordManagerContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task SeedDemoDataAsync()
    {
        // Check if data already exists
        if (await _context.Users.AnyAsync())
        {
            return; // Data already seeded
        }

        // Create demo users
        var demoUsers = new List<User>
        {
            CreateUser("admin", "Admin123!", UserRole.Admin),
            CreateUser("john", "John123!", UserRole.User),
            CreateUser("sarah", "Sarah123!", UserRole.Child)
        };

        _context.Users.AddRange(demoUsers);
        await _context.SaveChangesAsync();

        // Create vaults for each user
        foreach (var user in demoUsers)
        {
            var vault = new Vault
            {
                Name = "Personal",
                Description = $"Personal vault for {user.Username}",
                UserId = user.Id,
                CreatedAt = DateTime.Now
            };
            _context.Vaults.Add(vault);
        }
        await _context.SaveChangesAsync();

        // Add sample password entries for admin user
        var adminUser = demoUsers[0];
        var adminVault = await _context.Vaults.FirstAsync(v => v.UserId == adminUser.Id);

        var sampleEntries = new List<PasswordEntry>
        {
            new PasswordEntry
            {
                Title = "GitHub",
                Type = EntryType.Login,
                VaultId = adminVault.Id,
                Username = "admin@example.com",
                Email = "admin@example.com",
                EncryptedPassword = _encryptionService.Encrypt("DemoPass123!", "Admin123!"),
                Url = "https://github.com",
                Notes = "Demo GitHub account",
                IsFavorite = true,
                CreatedAt = DateTime.Now
            },
            new PasswordEntry
            {
                Title = "Gmail",
                Type = EntryType.Login,
                VaultId = adminVault.Id,
                Username = "admin",
                Email = "admin@gmail.com",
                EncryptedPassword = _encryptionService.Encrypt("Gmail456!", "Admin123!"),
                Url = "https://gmail.com",
                Notes = "Personal email",
                CreatedAt = DateTime.Now
            },
            new PasswordEntry
            {
                Title = "Primary Visa",
                Type = EntryType.CreditCard,
                VaultId = adminVault.Id,
                CardholderName = "Admin User",
                EncryptedCardNumber = _encryptionService.Encrypt("4532123456789012", "Admin123!"),
                ExpiryDate = "12/28",
                EncryptedCvv = _encryptionService.Encrypt("123", "Admin123!"),
                Notes = "Primary credit card",
                CreatedAt = DateTime.Now
            },
            new PasswordEntry
            {
                Title = "WiFi Password",
                Type = EntryType.SecureNote,
                VaultId = adminVault.Id,
                Notes = "Network: HomeNetwork\nPassword: MySecureWiFi123!\nRouter: 192.168.1.1",
                CreatedAt = DateTime.Now
            }
        };

        _context.PasswordEntries.AddRange(sampleEntries);
        await _context.SaveChangesAsync();
    }

    private User CreateUser(string username, string password, UserRole role)
    {
        var salt = _encryptionService.GenerateSalt();
        var passwordHash = _encryptionService.HashPassword(password, salt);

        return new User
        {
            Username = username,
            Salt = salt,
            PasswordHash = passwordHash,
            Role = role,
            CreatedAt = DateTime.Now
        };
    }
}
