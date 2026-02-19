using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using Microsoft.EntityFrameworkCore;
using PasswordManager.Core.Enums;
using PasswordManager.Core.Interfaces;
using PasswordManager.Core.Models;
using PasswordManager.Data.Context;

namespace PasswordManager.UI;

public partial class MainWindow : Window
{
    private readonly PasswordManagerContext _context;
    private readonly IEncryptionService _encryptionService;
    private readonly IPasswordGeneratorService _passwordGeneratorService;
    private readonly IPasskeyService _passkeyService;
    
    private User _currentUser = null!;
    private string _masterPassword = string.Empty;
    private EntryType? _currentFilter;

    public MainWindow(PasswordManagerContext context, IEncryptionService encryptionService,
        IPasswordGeneratorService passwordGeneratorService, IPasskeyService passkeyService)
    {
        InitializeComponent();
        _context = context;
        _encryptionService = encryptionService;
        _passwordGeneratorService = passwordGeneratorService;
        _passkeyService = passkeyService;
    }

    public void SetCurrentUser(User user, string masterPassword)
    {
        _currentUser = user;
        _masterPassword = masterPassword;
        UserNameText.Text = $"{user.Username} ({user.Role})";
        LoadDataAsync();
    }

    private async void LoadDataAsync()
    {
        await LoadVaultsAsync();
        await LoadEntriesAsync();
    }

    private async Task LoadVaultsAsync()
    {
        var vaults = await _context.Vaults
            .Where(v => v.UserId == _currentUser.Id)
            .ToListAsync();
        
        VaultsListBox.ItemsSource = vaults;
        if (vaults.Count > 0)
        {
            VaultsListBox.SelectedIndex = 0;
        }
    }

    private async Task LoadEntriesAsync()
    {
        if (VaultsListBox.SelectedItem is not Vault selectedVault)
        {
            EntriesItemsControl.ItemsSource = null;
            return;
        }

        var query = _context.PasswordEntries
            .Include(e => e.AccessRestrictions)
            .Where(e => e.VaultId == selectedVault.Id);

        // Apply filter
        if (_currentFilter.HasValue)
        {
            query = query.Where(e => e.Type == _currentFilter.Value);
        }

        // Apply search
        var searchText = SearchBox.Text?.Trim();
        if (!string.IsNullOrWhiteSpace(searchText))
        {
            query = query.Where(e => e.Title.Contains(searchText) || 
                                   (e.Username != null && e.Username.Contains(searchText)));
        }

        var entries = await query.ToListAsync();

        // Filter out restricted entries for child users
        if (_currentUser.Role == UserRole.Child)
        {
            entries = entries.Where(e => !e.AccessRestrictions.Any(r => r.RestrictedUserId == _currentUser.Id)).ToList();
        }

        EntriesItemsControl.ItemsSource = entries;
    }

    private async void VaultsListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        await LoadEntriesAsync();
    }

    private async void SearchBox_TextChanged(object sender, TextChangedEventArgs e)
    {
        await LoadEntriesAsync();
    }

    private async void FilterAll_Click(object sender, RoutedEventArgs e)
    {
        _currentFilter = null;
        await LoadEntriesAsync();
    }

    private async void FilterLogin_Click(object sender, RoutedEventArgs e)
    {
        _currentFilter = EntryType.Login;
        await LoadEntriesAsync();
    }

    private async void FilterCreditCard_Click(object sender, RoutedEventArgs e)
    {
        _currentFilter = EntryType.CreditCard;
        await LoadEntriesAsync();
    }

    private async void FilterNotes_Click(object sender, RoutedEventArgs e)
    {
        _currentFilter = EntryType.SecureNote;
        await LoadEntriesAsync();
    }

    private async void FilterFiles_Click(object sender, RoutedEventArgs e)
    {
        _currentFilter = EntryType.CustomFile;
        await LoadEntriesAsync();
    }

    private void NewEntryButton_Click(object sender, RoutedEventArgs e)
    {
        if (VaultsListBox.SelectedItem is not Vault selectedVault)
        {
            MessageBox.Show("Please select a vault first.", "No Vault Selected", MessageBoxButton.OK, MessageBoxImage.Information);
            return;
        }

        var dialog = new Views.EntryDialog(_context, _encryptionService, _passwordGeneratorService, 
            _passkeyService, selectedVault.Id, _masterPassword, _currentUser);
        if (dialog.ShowDialog() == true)
        {
            _ = LoadEntriesAsync();
        }
    }

    private void NewVaultButton_Click(object sender, RoutedEventArgs e)
    {
        var dialog = new Views.VaultDialog(_context, _currentUser.Id);
        if (dialog.ShowDialog() == true)
        {
            _ = LoadVaultsAsync();
        }
    }

    private void Entry_Click(object sender, MouseButtonEventArgs e)
    {
        if (sender is Border border && border.Tag is PasswordEntry entry)
        {
            var dialog = new Views.EntryDialog(_context, _encryptionService, _passwordGeneratorService, 
                _passkeyService, entry.VaultId, _masterPassword, _currentUser, entry);
            if (dialog.ShowDialog() == true)
            {
                _ = LoadEntriesAsync();
            }
        }
    }

    private void SettingsButton_Click(object sender, RoutedEventArgs e)
    {
        var dialog = new Views.SettingsDialog(_context, _encryptionService, _currentUser, _masterPassword);
        dialog.ShowDialog();
    }

    private void LogoutButton_Click(object sender, RoutedEventArgs e)
    {
        var loginWindow = new Views.LoginWindow(_context, _encryptionService, 
            new Data.DatabaseService(_context));
        loginWindow.Show();
        Close();
    }
}