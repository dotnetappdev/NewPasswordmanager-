using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using Microsoft.EntityFrameworkCore;
using PasswordManager.Core.Enums;
using PasswordManager.Core.Interfaces;
using PasswordManager.Core.Models;
using PasswordManager.Data.Context;
using PasswordManager.UI.Services;
using Microsoft.Extensions.DependencyInjection;

namespace PasswordManager.UI;

public partial class MainWindow : Window
{
    private readonly PasswordManagerContext _context;
    private readonly IEncryptionService _encryptionService;
    private readonly IPasswordGeneratorService _passwordGeneratorService;

    private User _currentUser = null!;
    private string _masterPassword = string.Empty;
    private EntryType? _currentFilter;
    private bool _showFavoritesOnly;
    private PasswordEntry? _selectedEntry;

    private const string PasswordMask   = "••••••••••";
    private const string CardNumberMask = "•••• •••• •••• ••••";
    private const string CvvMask        = "•••";

    // View-model wrapper so the ListBox can bind TypeIcon/SubLabel
    private record EntryVM(PasswordEntry Entry, string TypeIcon, string SubLabel)
    {
        public string Title      => Entry.Title;
        public bool   IsFavorite => Entry.IsFavorite;
    }

    public MainWindow(PasswordManagerContext context, IEncryptionService encryptionService,
        IPasswordGeneratorService passwordGeneratorService)
    {
        InitializeComponent();
        _context = context;
        _encryptionService = encryptionService;
        _passwordGeneratorService = passwordGeneratorService;
    }

    public void SetCurrentUser(User user, string masterPassword)
    {
        _currentUser = user;
        _masterPassword = masterPassword;
        UserNameText.Text = $"{user.Username}  •  {user.Role}";
        LoadDataAsync();
    }

    private async void LoadDataAsync()
    {
        await LoadVaultsAsync();
        await LoadEntriesAsync();
    }

    // ── Vaults ────────────────────────────────────────────────────────────────

    private async Task LoadVaultsAsync()
    {
        var vaults = await _context.Vaults
            .Where(v => v.UserId == _currentUser.Id)
            .ToListAsync();

        VaultsListBox.ItemsSource = vaults;
        if (vaults.Count > 0)
            VaultsListBox.SelectedIndex = 0;
    }

    private async void VaultsListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        await LoadEntriesAsync();
    }

    // ── Entries ───────────────────────────────────────────────────────────────

    private async Task LoadEntriesAsync()
    {
        if (VaultsListBox.SelectedItem is not Vault selectedVault)
        {
            EntriesListBox.ItemsSource = null;
            NoItemsText.Visibility = Visibility.Visible;
            return;
        }

        var query = _context.PasswordEntries
            .Include(e => e.AccessRestrictions)
            .Where(e => e.VaultId == selectedVault.Id);

        if (_currentFilter.HasValue)
            query = query.Where(e => e.Type == _currentFilter.Value);

        if (_showFavoritesOnly)
            query = query.Where(e => e.IsFavorite);

        var searchText = SearchBox.Text?.Trim();
        if (!string.IsNullOrWhiteSpace(searchText))
            query = query.Where(e => e.Title.Contains(searchText) ||
                                     (e.Username != null && e.Username.Contains(searchText)));

        var entries = await query.ToListAsync();

        if (_currentUser.Role == UserRole.Child)
            entries = entries.Where(e => !e.AccessRestrictions.Any(r => r.RestrictedUserId == _currentUser.Id)).ToList();

        var vms = entries.Select(e => new EntryVM(e, GetTypeIcon(e.Type), GetSubLabel(e))).ToList();
        EntriesListBox.ItemsSource = vms;
        NoItemsText.Visibility = vms.Count == 0 ? Visibility.Visible : Visibility.Collapsed;

        // Reset detail pane
        DetailPanel.Visibility     = Visibility.Collapsed;
        NoSelectionPanel.Visibility = Visibility.Visible;
        _selectedEntry = null;
    }

    private static string GetTypeIcon(EntryType type) => type switch
    {
        EntryType.Login      => "🔑",
        EntryType.CreditCard => "💳",
        EntryType.SecureNote => "📝",
        EntryType.CustomFile => "📁",
        EntryType.Passkey    => "🔐",
        _                    => "🔑"
    };

    private static string GetSubLabel(PasswordEntry e) =>
        e.Username ?? e.Email ?? e.Type.ToString();

    // ── Selection / detail pane ───────────────────────────────────────────────

    private void EntriesListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (EntriesListBox.SelectedItem is EntryVM vm)
        {
            _selectedEntry = vm.Entry;
            PopulateDetailPane(vm.Entry);
        }
    }

    private void PopulateDetailPane(PasswordEntry entry)
    {
        DetailPanel.Visibility      = Visibility.Visible;
        NoSelectionPanel.Visibility = Visibility.Collapsed;

        DetailIconText.Text     = GetTypeIcon(entry.Type);
        DetailTitleText.Text    = entry.Title;
        DetailSubtitleText.Text = entry.Username ?? entry.Email ?? entry.Type.ToString();

        DetailFieldsPanel.Children.Clear();

        switch (entry.Type)
        {
            case EntryType.Login:
                if (!string.IsNullOrEmpty(entry.Username))
                    DetailFieldsPanel.Children.Add(CreateFieldRow("Username", entry.Username));
                if (!string.IsNullOrEmpty(entry.Email))
                    DetailFieldsPanel.Children.Add(CreateFieldRow("Email", entry.Email));
                if (!string.IsNullOrEmpty(entry.EncryptedPassword))
                    DetailFieldsPanel.Children.Add(CreateFieldRow("Password", PasswordMask, isPassword: true));
                if (!string.IsNullOrEmpty(entry.Url))
                    DetailFieldsPanel.Children.Add(CreateFieldRow("URL", entry.Url));
                break;

            case EntryType.CreditCard:
                if (!string.IsNullOrEmpty(entry.CardholderName))
                    DetailFieldsPanel.Children.Add(CreateFieldRow("Cardholder", entry.CardholderName));
                if (!string.IsNullOrEmpty(entry.EncryptedCardNumber))
                    DetailFieldsPanel.Children.Add(CreateFieldRow("Card Number", CardNumberMask, isPassword: true));
                if (!string.IsNullOrEmpty(entry.ExpiryDate))
                    DetailFieldsPanel.Children.Add(CreateFieldRow("Expiry", entry.ExpiryDate));
                if (!string.IsNullOrEmpty(entry.EncryptedCvv))
                    DetailFieldsPanel.Children.Add(CreateFieldRow("CVV", CvvMask, isPassword: true));
                break;

            case EntryType.Passkey:
                if (!string.IsNullOrEmpty(entry.RelyingPartyId))
                    DetailFieldsPanel.Children.Add(CreateFieldRow("Relying Party", entry.RelyingPartyId));
                if (!string.IsNullOrEmpty(entry.RelyingPartyName))
                    DetailFieldsPanel.Children.Add(CreateFieldRow("RP Name", entry.RelyingPartyName));
                if (!string.IsNullOrEmpty(entry.CredentialId))
                    DetailFieldsPanel.Children.Add(CreateFieldRow("Credential ID", entry.CredentialId));
                break;

            case EntryType.CustomFile:
                if (!string.IsNullOrEmpty(entry.FileName))
                    DetailFieldsPanel.Children.Add(CreateFieldRow("File", entry.FileName));
                break;
        }

        if (!string.IsNullOrEmpty(entry.Notes))
            DetailFieldsPanel.Children.Add(CreateFieldRow("Notes", entry.Notes));

        DetailModifiedText.Text = entry.ModifiedAt.HasValue
            ? $"Modified {entry.ModifiedAt.Value:MMM d, yyyy}"
            : string.Empty;
        DetailCreatedText.Text = $"Created {entry.CreatedAt:MMM d, yyyy}";
    }

    private StackPanel CreateFieldRow(string label, string value, bool isPassword = false)
    {
        var panel = new StackPanel { Margin = new Thickness(0, 0, 0, 16) };

        var labelBlock = new TextBlock
        {
            Text       = label.ToUpperInvariant(),
            FontSize   = 11,
            FontWeight = FontWeights.SemiBold,
            Foreground = (Brush)FindResource("SecondaryBrush"),
            Margin     = new Thickness(0, 0, 0, 4)
        };

        var valueBlock = new TextBlock
        {
            Text         = value,
            FontSize     = 14,
            Foreground   = (Brush)FindResource("TextBrush"),
            TextWrapping = TextWrapping.Wrap
        };

        panel.Children.Add(labelBlock);
        panel.Children.Add(valueBlock);
        return panel;
    }

    // ── Sidebar nav ───────────────────────────────────────────────────────────

    private async void AllItemsNavButton_Click(object sender, RoutedEventArgs e)
    {
        _currentFilter    = null;
        _showFavoritesOnly = false;
        ListPaneTitle.Text = "All Items";
        await LoadEntriesAsync();
    }

    private async void FavoritesNavButton_Click(object sender, RoutedEventArgs e)
    {
        _currentFilter    = null;
        _showFavoritesOnly = true;
        ListPaneTitle.Text = "Favorites";
        await LoadEntriesAsync();
    }

    // ── Search ────────────────────────────────────────────────────────────────

    private async void SearchBox_TextChanged(object sender, TextChangedEventArgs e)
    {
        await LoadEntriesAsync();
    }

    // ── Category filters ──────────────────────────────────────────────────────

    private async void FilterAll_Click(object sender, RoutedEventArgs e)
    {
        _currentFilter = null;
        _showFavoritesOnly = false;
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

    private async void FilterPasskey_Click(object sender, RoutedEventArgs e)
    {
        _currentFilter = EntryType.Passkey;
        await LoadEntriesAsync();
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    private void NewEntryButton_Click(object sender, RoutedEventArgs e)
    {
        if (VaultsListBox.SelectedItem is not Vault selectedVault)
        {
            MessageBox.Show("Please select a vault first.", "No Vault Selected",
                MessageBoxButton.OK, MessageBoxImage.Information);
            return;
        }

        var dialog = new Views.EntryDialog(_context, _encryptionService, _passwordGeneratorService,
            selectedVault.Id, _masterPassword, _currentUser);
        if (dialog.ShowDialog() == true)
            _ = LoadEntriesAsync();
    }

    private void NewVaultButton_Click(object sender, RoutedEventArgs e)
    {
        var dialog = new Views.VaultDialog(_context, _currentUser.Id);
        if (dialog.ShowDialog() == true)
            _ = LoadVaultsAsync();
    }

    private void EditButton_Click(object sender, RoutedEventArgs e)
    {
        if (_selectedEntry == null) return;

        var dialog = new Views.EntryDialog(_context, _encryptionService, _passwordGeneratorService,
            _selectedEntry.VaultId, _masterPassword, _currentUser, _selectedEntry);
        if (dialog.ShowDialog() == true)
            _ = LoadEntriesAsync();
    }

    private void SettingsButton_Click(object sender, RoutedEventArgs e)
    {
        var dialog = new Views.SettingsDialog(_context, _encryptionService, _currentUser, _masterPassword);
        dialog.ShowDialog();
    }

    private void LogoutButton_Click(object sender, RoutedEventArgs e)
    {
        var loginWindow = new Views.LoginWindow(_context, _encryptionService,
            new Data.DatabaseService(_context),
            App.ServiceProvider.GetRequiredService<MasterKeyService>());
        loginWindow.Show();
        Close();
    }
}
