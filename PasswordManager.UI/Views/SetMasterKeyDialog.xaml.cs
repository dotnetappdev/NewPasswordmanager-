using System.Windows;
using PasswordManager.UI.Services;

namespace PasswordManager.UI.Views;

public partial class SetMasterKeyDialog : Window
{
    private readonly MasterKeyService _masterKeyService;

    public SetMasterKeyDialog(MasterKeyService masterKeyService)
    {
        InitializeComponent();
        _masterKeyService = masterKeyService;
    }

    private void Save_Click(object sender, RoutedEventArgs e)
    {
        var key = MasterKeyBox.Password;
        var confirm = ConfirmKeyBox.Password;

        if (string.IsNullOrWhiteSpace(key))
        {
            ShowError("Please enter a master key.");
            return;
        }

        if (key.Length < 8)
        {
            ShowError("Master key must be at least 8 characters.");
            return;
        }

        if (key != confirm)
        {
            ShowError("Keys do not match.");
            return;
        }

        _masterKeyService.SetMasterKey(key);
        MessageBox.Show("Master key saved successfully.", "Master Key Set",
            MessageBoxButton.OK, MessageBoxImage.Information);
        DialogResult = true;
        Close();
    }

    private void Cancel_Click(object sender, RoutedEventArgs e)
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
