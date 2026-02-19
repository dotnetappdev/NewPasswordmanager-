using System.Windows;
using PasswordManager.UI.Services;

namespace PasswordManager.UI.Views;

public partial class MasterKeyDialog : Window
{
    private readonly MasterKeyService _masterKeyService;

    public MasterKeyDialog(MasterKeyService masterKeyService)
    {
        InitializeComponent();
        _masterKeyService = masterKeyService;
    }

    private void Cancel_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }

    private void Unlock_Click(object sender, RoutedEventArgs e)
    {
        var key = MasterKeyBox.Password;
        if (string.IsNullOrWhiteSpace(key))
        {
            ShowError("Please enter the master key.");
            return;
        }

        if (_masterKeyService.VerifyMasterKey(key))
        {
            DialogResult = true;
            Close();
        }
        else
        {
            ShowError("Master key is invalid. Please try again.");
        }
    }

    private void ShowError(string message)
    {
        ErrorText.Text = message;
        ErrorText.Visibility = Visibility.Visible;
    }
}
