using System.Windows;
using System.Windows.Controls;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PasswordManager.Core.Enums;
using PasswordManager.Core.Interfaces;
using PasswordManager.Core.Models;
using PasswordManager.Data;
using PasswordManager.Data.Context;

namespace PasswordManager.UI.Views;

public partial class LoginWindow : Window
{
    private readonly PasswordManagerContext _context;
    private readonly IEncryptionService _encryptionService;
    private readonly DatabaseService _databaseService;

    public LoginWindow(PasswordManagerContext context, IEncryptionService encryptionService, 
        DatabaseService databaseService)
    {
        InitializeComponent();
        _context = context;
        _encryptionService = encryptionService;
        _databaseService = databaseService;
        
        Loaded += LoginWindow_Loaded;
    }

    private async void LoginWindow_Loaded(object sender, RoutedEventArgs e)
    {
        await _databaseService.InitializeDatabaseAsync();
        await LoadUsersAsync();
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
        var dialog = new CreateAccountDialog(_context, _encryptionService);
        if (dialog.ShowDialog() == true)
        {
            await LoadUsersAsync();
        }
    }

    private void ShowError(string message)
    {
        ErrorText.Text = message;
        ErrorText.Visibility = Visibility.Visible;
    }
}
