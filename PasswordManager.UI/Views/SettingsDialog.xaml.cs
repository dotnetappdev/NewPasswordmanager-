using System.IO;
using System.Windows;
using PasswordManager.Core.Interfaces;
using PasswordManager.Core.Models;
using PasswordManager.Data.Context;

namespace PasswordManager.UI.Views;

public partial class SettingsDialog : Window
{
    private readonly PasswordManagerContext _context;
    private readonly IEncryptionService _encryptionService;
    private readonly User _currentUser;
    private readonly string _masterPassword;

    public SettingsDialog(PasswordManagerContext context, IEncryptionService encryptionService, 
        User currentUser, string masterPassword)
    {
        InitializeComponent();
        _context = context;
        _encryptionService = encryptionService;
        _currentUser = currentUser;
        _masterPassword = masterPassword;

        LoadSettings();
    }

    private void LoadSettings()
    {
        UsernameText.Text = _currentUser.Username;
        RoleText.Text = _currentUser.Role.ToString();
        CreatedText.Text = _currentUser.CreatedAt.ToString("MMMM dd, yyyy");

        var appDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "PasswordManager"
        );
        var dbPath = Path.Combine(appDataPath, "passwordmanager.db");
        DatabasePathText.Text = $"Database Location: {dbPath}";
    }

    private async void UpdatePasswordButton_Click(object sender, RoutedEventArgs e)
    {
        HideMessage();

        var currentPassword = CurrentPasswordBox.Password;
        var newPassword = NewPasswordBox.Password;
        var confirmPassword = ConfirmPasswordBox.Password;

        // Validation
        if (string.IsNullOrWhiteSpace(currentPassword))
        {
            ShowError("Please enter your current password.");
            return;
        }

        if (!_encryptionService.VerifyPassword(currentPassword, _currentUser.Salt, _currentUser.PasswordHash))
        {
            ShowError("Current password is incorrect.");
            return;
        }

        if (string.IsNullOrWhiteSpace(newPassword))
        {
            ShowError("Please enter a new password.");
            return;
        }

        if (newPassword.Length < 8)
        {
            ShowError("Password must be at least 8 characters long.");
            return;
        }

        if (newPassword != confirmPassword)
        {
            ShowError("New passwords do not match.");
            return;
        }

        // Update password
        var newSalt = _encryptionService.GenerateSalt();
        var newHash = _encryptionService.HashPassword(newPassword, newSalt);

        _currentUser.Salt = newSalt;
        _currentUser.PasswordHash = newHash;

        await _context.SaveChangesAsync();

        // Clear fields
        CurrentPasswordBox.Clear();
        NewPasswordBox.Clear();
        ConfirmPasswordBox.Clear();

        ShowSuccess("Password updated successfully! Please use your new password on next login.");
    }

    private void CloseButton_Click(object sender, RoutedEventArgs e)
    {
        Close();
    }

    private void ShowError(string message)
    {
        MessageText.Text = message;
        MessageText.Foreground = (System.Windows.Media.Brush)FindResource("DangerBrush");
        MessageText.Visibility = Visibility.Visible;
    }

    private void ShowSuccess(string message)
    {
        MessageText.Text = message;
        MessageText.Foreground = (System.Windows.Media.Brush)FindResource("SuccessBrush");
        MessageText.Visibility = Visibility.Visible;
    }

    private void HideMessage()
    {
        MessageText.Visibility = Visibility.Collapsed;
    }
}
