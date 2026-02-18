using System.Windows;
using Microsoft.EntityFrameworkCore;
using PasswordManager.Core.Enums;
using PasswordManager.Core.Interfaces;
using PasswordManager.Core.Models;
using PasswordManager.Data.Context;

namespace PasswordManager.UI.Views;

public partial class CreateAccountDialog : Window
{
    private readonly PasswordManagerContext _context;
    private readonly IEncryptionService _encryptionService;

    public CreateAccountDialog(PasswordManagerContext context, IEncryptionService encryptionService)
    {
        InitializeComponent();
        _context = context;
        _encryptionService = encryptionService;

        RoleComboBox.ItemsSource = Enum.GetValues(typeof(UserRole));
        RoleComboBox.SelectedIndex = 1; // Default to User
    }

    private async void CreateButton_Click(object sender, RoutedEventArgs e)
    {
        ErrorText.Visibility = Visibility.Collapsed;

        var username = UsernameTextBox.Text.Trim();
        var password = PasswordBox.Password;
        var confirmPassword = ConfirmPasswordBox.Password;

        // Validation
        if (string.IsNullOrWhiteSpace(username))
        {
            ShowError("Username is required.");
            return;
        }

        if (string.IsNullOrWhiteSpace(password))
        {
            ShowError("Password is required.");
            return;
        }

        if (password != confirmPassword)
        {
            ShowError("Passwords do not match.");
            return;
        }

        if (password.Length < 8)
        {
            ShowError("Password must be at least 8 characters long.");
            return;
        }

        // Check if username exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (existingUser != null)
        {
            ShowError("Username already exists.");
            return;
        }

        // Create new user
        var salt = _encryptionService.GenerateSalt();
        var passwordHash = _encryptionService.HashPassword(password, salt);

        var newUser = new User
        {
            Username = username,
            Salt = salt,
            PasswordHash = passwordHash,
            Role = (UserRole)RoleComboBox.SelectedItem,
            CreatedAt = DateTime.Now
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        // Create default vault
        var defaultVault = new Vault
        {
            Name = "Personal",
            Description = "My personal vault",
            UserId = newUser.Id,
            CreatedAt = DateTime.Now
        };

        _context.Vaults.Add(defaultVault);
        await _context.SaveChangesAsync();

        DialogResult = true;
        Close();
    }

    private void CancelButton_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }

    private void ShowError(string message)
    {
        ErrorText.Text = message;
        ErrorText.Visibility = Visibility.Visible;
    }
}
