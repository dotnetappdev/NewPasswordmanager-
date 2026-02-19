using System.Windows;
using System.Windows.Controls;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PasswordManager.Core.Enums;
using PasswordManager.Core.Interfaces;
using PasswordManager.Core.Models;
using PasswordManager.Data;
using PasswordManager.Data.Context;
using PasswordManager.UI.Services;

namespace PasswordManager.UI.Views;

public partial class LoginWindow : Window
{
    private CreateAccountControl? _createAccountControl;

    private readonly PasswordManagerContext _context;
    private readonly IEncryptionService _encryptionService;
    private readonly DatabaseService _databaseService;
    private readonly MasterKeyService _masterKeyService;

    public LoginWindow(PasswordManagerContext context, IEncryptionService encryptionService, 
        DatabaseService databaseService, MasterKeyService masterKeyService)
    {
        InitializeComponent();
        _context = context;
        _encryptionService = encryptionService;
        _databaseService = databaseService;
        _masterKeyService = masterKeyService;
        
        Loaded += LoginWindow_Loaded;
    }

    private async void LoginWindow_Loaded(object sender, RoutedEventArgs e)
    {
        await _databaseService.InitializeDatabaseAsync();
        await LoadUsersAsync();

        // If no accounts exist yet, automatically show the create-account form
        if (UserComboBox.Items.Count == 0)
        {
            CreateAccountButton_Click(this, new RoutedEventArgs());
        }
    }

    private async Task LoadUsersAsync()
    {
        var users = await _context.Users.ToListAsync();
        UserComboBox.ItemsSource = users;
        
        if (users.Count > 0)
        {
            UserComboBox.SelectedIndex = 0;
        }
    }

    private async void LoginButton_Click(object sender, RoutedEventArgs e)
    {
        ErrorText.Visibility = Visibility.Collapsed;

        if (UserComboBox.SelectedItem is not User selectedUser)
        {
            ShowError("Please select an account.");
            return;
        }

        var password = PasswordBox.Password;
        if (string.IsNullOrWhiteSpace(password))
        {
            ShowError("Please enter your password.");
            return;
        }

        if (_encryptionService.VerifyPassword(password, selectedUser.Salt, selectedUser.PasswordHash))
        {
            // Update last login
            selectedUser.LastLoginAt = DateTime.Now;
            await _context.SaveChangesAsync();

            // Open main window
            var mainWindow = App.ServiceProvider.GetRequiredService<MainWindow>();
            mainWindow.SetCurrentUser(selectedUser, password);
            mainWindow.Show();
            Close();
        }
        else
        {
            ShowError("Invalid password.");
        }
    }

    private async void CreateAccountButton_Click(object sender, RoutedEventArgs e)
    {
        // Show embedded create-account control in overlay
        if (CreateAccountOverlay.Visibility == Visibility.Visible) return;

        _createAccountControl = new CreateAccountControl(_context, _encryptionService);
        _createAccountControl.AccountSaved += async (s, ev) =>
        {
            CreateAccountOverlay.Visibility = Visibility.Collapsed;
            CreateAccountHost.Content = null;
            await LoadUsersAsync();
        };
        _createAccountControl.Cancelled += (s, ev) =>
        {
            CreateAccountOverlay.Visibility = Visibility.Collapsed;
            CreateAccountHost.Content = null;
        };

        CreateAccountHost.Content = _createAccountControl;
        CreateAccountOverlay.Visibility = Visibility.Visible;
    }

    private void ShowError(string message)
    {
        ErrorText.Text = message;
        ErrorText.Visibility = Visibility.Visible;
    }

    private void UseMasterKey_Click(object sender, RoutedEventArgs e)
    {
        if (!_masterKeyService.HasMasterKey())
        {
            var result = MessageBox.Show(
                "No master key is configured.\n\nWould you like to set one now?",
                "Set Up Master Key",
                MessageBoxButton.YesNo,
                MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                var setup = new SetMasterKeyDialog(_masterKeyService) { Owner = this };
                setup.ShowDialog();
            }
            return;
        }

        var dialog = new MasterKeyDialog(_masterKeyService) { Owner = this };
        if (dialog.ShowDialog() == true)
        {
            // unlocked via master key
            var mainWindow = App.ServiceProvider.GetRequiredService<MainWindow>();
            mainWindow.Show();
            Close();
        }
    }
}
