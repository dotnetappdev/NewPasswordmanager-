using System.IO;
using System.Windows;
using System.Windows.Controls;
using Microsoft.EntityFrameworkCore;
using Microsoft.Win32;
using PasswordManager.Core.Enums;
using PasswordManager.Core.Interfaces;
using PasswordManager.Core.Models;
using PasswordManager.Data.Context;

namespace PasswordManager.UI.Views;

public partial class EntryDialog : Window
{
    private readonly PasswordManagerContext _context;
    private readonly IEncryptionService _encryptionService;
    private readonly IPasswordGeneratorService _passwordGeneratorService;
    private readonly IPasskeyService _passkeyService;
    private readonly int _vaultId;
    private readonly string _masterPassword;
    private readonly User _currentUser;
    private readonly PasswordEntry? _existingEntry;
    private byte[]? _attachedFileData;
    private string? _attachedFileName;
    private bool _isPasswordRevealed = false;
    private bool _passkeyGenerated = false;
    private string? _generatedPasskeyPrivateKey;

    public EntryDialog(PasswordManagerContext context, IEncryptionService encryptionService,
        IPasswordGeneratorService passwordGeneratorService, IPasskeyService passkeyService, int vaultId, string masterPassword,
        User currentUser, PasswordEntry? existingEntry = null)
    {
        InitializeComponent();
        _context = context;
        _encryptionService = encryptionService;
        _passwordGeneratorService = passwordGeneratorService;
        _passkeyService = passkeyService;
        _vaultId = vaultId;
        _masterPassword = masterPassword;
        _currentUser = currentUser;
        _existingEntry = existingEntry;

        InitializeDialog();
    }

    private async void InitializeDialog()
    {
        TypeComboBox.ItemsSource = Enum.GetValues(typeof(EntryType));
        TypeComboBox.SelectedIndex = 0;

        if (_currentUser.Role == UserRole.Admin)
        {
            AdminControls.Visibility = Visibility.Visible;
            await LoadChildUsersAsync();
        }

        if (_existingEntry != null)
        {
            TitleText.Text = "Edit Entry";
            DeleteButton.Visibility = Visibility.Visible;
            LoadExistingEntry();
        }
    }

    private async Task LoadChildUsersAsync()
    {
        var childUsers = await _context.Users
            .Where(u => u.Role == UserRole.Child && u.Id != _currentUser.Id)
            .ToListAsync();
        RestrictedUsersListBox.ItemsSource = childUsers;
    }

    private void LoadExistingEntry()
    {
        if (_existingEntry == null) return;

        TypeComboBox.SelectedItem = _existingEntry.Type;
        EntryTitleTextBox.Text = _existingEntry.Title;
        FavoriteCheckBox.IsChecked = _existingEntry.IsFavorite;
        NotesTextBox.Text = _existingEntry.Notes ?? string.Empty;

        switch (_existingEntry.Type)
        {
            case EntryType.Login:
                UsernameTextBox.Text = _existingEntry.Username ?? string.Empty;
                EmailTextBox.Text = _existingEntry.Email ?? string.Empty;
                UrlTextBox.Text = _existingEntry.Url ?? string.Empty;
                if (!string.IsNullOrEmpty(_existingEntry.EncryptedPassword))
                {
                    try
                    {
                        var decryptedPassword = _encryptionService.Decrypt(_existingEntry.EncryptedPassword, _masterPassword);
                        PasswordBoxControl.Password = decryptedPassword;
                        UpdatePasswordStrength();
                    }
                    catch { }
                }
                break;

            case EntryType.CreditCard:
                CardholderNameTextBox.Text = _existingEntry.CardholderName ?? string.Empty;
                ExpiryDateTextBox.Text = _existingEntry.ExpiryDate ?? string.Empty;
                if (!string.IsNullOrEmpty(_existingEntry.EncryptedCardNumber))
                {
                    try
                    {
                        CardNumberTextBox.Text = _encryptionService.Decrypt(_existingEntry.EncryptedCardNumber, _masterPassword);
                    }
                    catch { }
                }
                if (!string.IsNullOrEmpty(_existingEntry.EncryptedCvv))
                {
                    try
                    {
                        CvvPasswordBox.Password = _encryptionService.Decrypt(_existingEntry.EncryptedCvv, _masterPassword);
                    }
                    catch { }
                }
                break;

            case EntryType.Passkey:
                RelyingPartyIdTextBox.Text = _existingEntry.RelyingPartyId ?? string.Empty;
                RelyingPartyNameTextBox.Text = _existingEntry.RelyingPartyName ?? string.Empty;
                PasskeyUserNameTextBox.Text = _existingEntry.Username ?? string.Empty;
                UserHandleTextBox.Text = _existingEntry.UserHandle ?? string.Empty;
                if (!string.IsNullOrEmpty(_existingEntry.CredentialId))
                {
                    _passkeyGenerated = true;
                    PasskeyGeneratedText.Visibility = Visibility.Visible;
                    GeneratePasskeyButton.Content = "Regenerate Passkey Credential";
                }
                break;
        }

        if (!string.IsNullOrEmpty(_existingEntry.FileName))
        {
            _attachedFileName = _existingEntry.FileName;
            _attachedFileData = _existingEntry.FileData;
            FileNameText.Text = _existingEntry.FileName;
        }

        // Load access restrictions
        if (_currentUser.Role == UserRole.Admin && _existingEntry.AccessRestrictions.Any())
        {
            var restrictedUserIds = _existingEntry.AccessRestrictions.Select(r => r.RestrictedUserId).ToList();
            foreach (User user in RestrictedUsersListBox.Items)
            {
                if (restrictedUserIds.Contains(user.Id))
                {
                    RestrictedUsersListBox.SelectedItems.Add(user);
                }
            }
        }
    }

    private void TypeComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (TypeComboBox.SelectedItem is EntryType entryType)
        {
            LoginFields.Visibility = entryType == EntryType.Login ? Visibility.Visible : Visibility.Collapsed;
            CreditCardFields.Visibility = entryType == EntryType.CreditCard ? Visibility.Visible : Visibility.Collapsed;
            PasskeyFields.Visibility = entryType == EntryType.Passkey ? Visibility.Visible : Visibility.Collapsed;
            FileFields.Visibility = entryType == EntryType.CustomFile ? Visibility.Visible : Visibility.Collapsed;
        }
    }

    private void RevealPasswordButton_Click(object sender, RoutedEventArgs e)
    {
        if (_isPasswordRevealed)
        {
            PasswordBoxControl.Password = PasswordTextBox.Text;
            PasswordBoxControl.Visibility = Visibility.Visible;
            PasswordTextBox.Visibility = Visibility.Collapsed;
            _isPasswordRevealed = false;
        }
        else
        {
            PasswordTextBox.Text = PasswordBoxControl.Password;
            PasswordTextBox.Visibility = Visibility.Visible;
            PasswordBoxControl.Visibility = Visibility.Collapsed;
            _isPasswordRevealed = true;
        }
    }

    private void CopyPasswordButton_Click(object sender, RoutedEventArgs e)
    {
        var password = _isPasswordRevealed ? PasswordTextBox.Text : PasswordBoxControl.Password;
        if (!string.IsNullOrEmpty(password))
        {
            Clipboard.SetText(password);
            MessageBox.Show("Password copied to clipboard!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }

    private void GeneratePasswordButton_Click(object sender, RoutedEventArgs e)
    {
        var dialog = new PasswordGeneratorDialog(_passwordGeneratorService);
        if (dialog.ShowDialog() == true && !string.IsNullOrEmpty(dialog.GeneratedPassword))
        {
            if (_isPasswordRevealed)
            {
                PasswordTextBox.Text = dialog.GeneratedPassword;
            }
            else
            {
                PasswordBoxControl.Password = dialog.GeneratedPassword;
            }
            UpdatePasswordStrength();
        }
    }

    private void UpdatePasswordStrength()
    {
        var password = _isPasswordRevealed ? PasswordTextBox.Text : PasswordBoxControl.Password;
        var strength = _passwordGeneratorService.CalculatePasswordStrength(password);
        PasswordStrengthBar.Value = strength;
        
        if (strength < 40)
        {
            PasswordStrengthText.Text = "Weak";
            PasswordStrengthBar.Foreground = System.Windows.Media.Brushes.Red;
        }
        else if (strength < 70)
        {
            PasswordStrengthText.Text = "Medium";
            PasswordStrengthBar.Foreground = System.Windows.Media.Brushes.Orange;
        }
        else
        {
            PasswordStrengthText.Text = "Strong";
            PasswordStrengthBar.Foreground = System.Windows.Media.Brushes.Green;
        }
    }

    private void PasswordBoxControl_PasswordChanged(object sender, RoutedEventArgs e)
    {
        UpdatePasswordStrength();
    }

    private void PasswordTextBox_TextChanged(object sender, TextChangedEventArgs e)
    {
        UpdatePasswordStrength();
    }

    private void GeneratePasskeyButton_Click(object sender, RoutedEventArgs e)
    {
        var relyingPartyId = RelyingPartyIdTextBox.Text.Trim();
        var relyingPartyName = RelyingPartyNameTextBox.Text.Trim();
        var userName = PasskeyUserNameTextBox.Text.Trim();
        var userHandle = UserHandleTextBox.Text.Trim();

        if (string.IsNullOrEmpty(relyingPartyId) || string.IsNullOrEmpty(userName))
        {
            MessageBox.Show("Relying Party ID and User Display Name are required to generate a passkey.", 
                "Validation Error", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        // Auto-generate user handle if not provided
        if (string.IsNullOrEmpty(userHandle))
        {
            userHandle = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(16));
            UserHandleTextBox.Text = userHandle;
        }

        // Auto-fill relying party name if not provided
        if (string.IsNullOrEmpty(relyingPartyName))
        {
            relyingPartyName = relyingPartyId;
            RelyingPartyNameTextBox.Text = relyingPartyName;
        }

        var (credentialId, publicKey, privateKey) = _passkeyService.GeneratePasskey(
            relyingPartyId, relyingPartyName, userName, userHandle);

        _generatedPasskeyPrivateKey = privateKey;
        _passkeyGenerated = true;
        PasskeyGeneratedText.Visibility = Visibility.Visible;
        GeneratePasskeyButton.Content = "Regenerate Passkey Credential";

        MessageBox.Show("Passkey credential generated successfully! The credential will be saved when you save this entry.", 
            "Success", MessageBoxButton.OK, MessageBoxImage.Information);
    }

    private void AttachFileButton_Click(object sender, RoutedEventArgs e)
    {
        var dialog = new OpenFileDialog
        {
            Title = "Select File to Attach"
        };

        if (dialog.ShowDialog() == true)
        {
            try
            {
                _attachedFileData = File.ReadAllBytes(dialog.FileName);
                _attachedFileName = Path.GetFileName(dialog.FileName);
                FileNameText.Text = _attachedFileName;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error reading file: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }

    private async void SaveButton_Click(object sender, RoutedEventArgs e)
    {
        ErrorText.Visibility = Visibility.Collapsed;

        var title = EntryTitleTextBox.Text.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            ShowError("Title is required.");
            return;
        }

        var entryType = (EntryType)TypeComboBox.SelectedItem;

        var entry = _existingEntry ?? new PasswordEntry
        {
            VaultId = _vaultId,
            CreatedAt = DateTime.Now
        };

        entry.Title = title;
        entry.Type = entryType;
        entry.Notes = NotesTextBox.Text;
        entry.IsFavorite = FavoriteCheckBox.IsChecked == true;
        entry.ModifiedAt = DateTime.Now;

        try
        {
            switch (entryType)
            {
                case EntryType.Login:
                    entry.Username = UsernameTextBox.Text;
                    entry.Email = EmailTextBox.Text;
                    entry.Url = UrlTextBox.Text;
                    var password = _isPasswordRevealed ? PasswordTextBox.Text : PasswordBoxControl.Password;
                    if (!string.IsNullOrEmpty(password))
                    {
                        entry.EncryptedPassword = _encryptionService.Encrypt(password, _masterPassword);
                    }
                    break;

                case EntryType.CreditCard:
                    entry.CardholderName = CardholderNameTextBox.Text;
                    entry.ExpiryDate = ExpiryDateTextBox.Text;
                    if (!string.IsNullOrEmpty(CardNumberTextBox.Text))
                    {
                        entry.EncryptedCardNumber = _encryptionService.Encrypt(CardNumberTextBox.Text, _masterPassword);
                    }
                    if (!string.IsNullOrEmpty(CvvPasswordBox.Password))
                    {
                        entry.EncryptedCvv = _encryptionService.Encrypt(CvvPasswordBox.Password, _masterPassword);
                    }
                    break;

                case EntryType.Passkey:
                    if (!_passkeyGenerated)
                    {
                        ShowError("Please generate a passkey credential before saving.");
                        return;
                    }

                    entry.RelyingPartyId = RelyingPartyIdTextBox.Text.Trim();
                    entry.RelyingPartyName = RelyingPartyNameTextBox.Text.Trim();
                    entry.Username = PasskeyUserNameTextBox.Text.Trim();
                    entry.UserHandle = UserHandleTextBox.Text.Trim();

                    // Generate and store credential if new or regenerated
                    if (!string.IsNullOrEmpty(_generatedPasskeyPrivateKey))
                    {
                        var (credentialId, publicKey, privateKey) = _passkeyService.GeneratePasskey(
                            entry.RelyingPartyId, entry.RelyingPartyName, entry.Username, entry.UserHandle);
                        
                        entry.CredentialId = credentialId;
                        entry.PublicKey = publicKey;
                        entry.EncryptedPrivateKey = _encryptionService.Encrypt(privateKey, _masterPassword);
                        entry.Counter = 0;
                    }
                    break;
            }

            if (_attachedFileData != null && _attachedFileName != null)
            {
                entry.FileName = _attachedFileName;
                entry.FileData = _attachedFileData;
            }

            if (_existingEntry == null)
            {
                _context.PasswordEntries.Add(entry);
            }

            await _context.SaveChangesAsync();

            // Handle access restrictions
            if (_currentUser.Role == UserRole.Admin)
            {
                // Remove existing restrictions
                var existingRestrictions = await _context.AccessRestrictions
                    .Where(r => r.PasswordEntryId == entry.Id)
                    .ToListAsync();
                _context.AccessRestrictions.RemoveRange(existingRestrictions);

                // Add new restrictions
                foreach (User selectedUser in RestrictedUsersListBox.SelectedItems)
                {
                    _context.AccessRestrictions.Add(new AccessRestriction
                    {
                        PasswordEntryId = entry.Id,
                        RestrictedUserId = selectedUser.Id,
                        CreatedByUserId = _currentUser.Id,
                        CreatedAt = DateTime.Now
                    });
                }

                await _context.SaveChangesAsync();
            }

            DialogResult = true;
            Close();
        }
        catch (Exception ex)
        {
            ShowError($"Error saving entry: {ex.Message}");
        }
    }

    private async void DeleteButton_Click(object sender, RoutedEventArgs e)
    {
        if (_existingEntry == null) return;

        var result = MessageBox.Show("Are you sure you want to delete this entry?", 
            "Confirm Delete", MessageBoxButton.YesNo, MessageBoxImage.Warning);

        if (result == MessageBoxResult.Yes)
        {
            _context.PasswordEntries.Remove(_existingEntry);
            await _context.SaveChangesAsync();
            DialogResult = true;
            Close();
        }
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
