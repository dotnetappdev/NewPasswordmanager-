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
            MessageBox.Show("Please enter the master key.", "Master Key", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        if (_masterKeyService.VerifyMasterKey(key))
        {
            DialogResult = true;
            Close();
        }
        else
        {
            MessageBox.Show("Master key is invalid.", "Master Key", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }
}
