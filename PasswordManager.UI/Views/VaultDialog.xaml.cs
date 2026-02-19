using System.Windows;
using PasswordManager.Core.Models;
using PasswordManager.Data.Context;

namespace PasswordManager.UI.Views;

public partial class VaultDialog : Window
{
    private readonly PasswordManagerContext _context;
    private readonly int _userId;

    public VaultDialog(PasswordManagerContext context, int userId)
    {
        InitializeComponent();
        _context = context;
        _userId = userId;
    }

    private async void CreateButton_Click(object sender, RoutedEventArgs e)
    {
        var name = NameTextBox.Text.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            MessageBox.Show("Vault name is required.", "Validation Error", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        var vault = new Vault
        {
            Name = name,
            Description = DescriptionTextBox.Text.Trim(),
            UserId = _userId,
            CreatedAt = DateTime.Now
        };

        _context.Vaults.Add(vault);
        await _context.SaveChangesAsync();

        DialogResult = true;
        Close();
    }

    private void CancelButton_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }
}
