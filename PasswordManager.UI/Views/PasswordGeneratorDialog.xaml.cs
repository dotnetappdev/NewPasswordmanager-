using System.Windows;
using System.Windows.Controls;
using PasswordManager.Core.Interfaces;

namespace PasswordManager.UI.Views;

public partial class PasswordGeneratorDialog : Window
{
    private readonly IPasswordGeneratorService _passwordGeneratorService;
    
    public string? GeneratedPassword { get; private set; }

    public PasswordGeneratorDialog(IPasswordGeneratorService passwordGeneratorService)
    {
        InitializeComponent();
        _passwordGeneratorService = passwordGeneratorService;
        GenerateNewPassword();
    }

    private void GenerateNewPassword()
    {
        var length = (int)LengthSlider.Value;
        var includeUppercase = UppercaseCheckBox.IsChecked == true;
        var includeLowercase = LowercaseCheckBox.IsChecked == true;
        var includeNumbers = NumbersCheckBox.IsChecked == true;
        var includeSpecialChars = SpecialCharsCheckBox.IsChecked == true;

        GeneratedPassword = _passwordGeneratorService.GeneratePassword(
            length, includeUppercase, includeLowercase, includeNumbers, includeSpecialChars);
        
        GeneratedPasswordText.Text = GeneratedPassword;
        UpdatePasswordStrength();
    }

    private void UpdatePasswordStrength()
    {
        if (string.IsNullOrEmpty(GeneratedPassword))
            return;

        var strength = _passwordGeneratorService.CalculatePasswordStrength(GeneratedPassword);
        StrengthBar.Value = strength;

        if (strength < 40)
        {
            StrengthText.Text = "Weak";
            StrengthBar.Foreground = System.Windows.Media.Brushes.Red;
        }
        else if (strength < 70)
        {
            StrengthText.Text = "Medium";
            StrengthBar.Foreground = System.Windows.Media.Brushes.Orange;
        }
        else
        {
            StrengthText.Text = "Strong";
            StrengthBar.Foreground = System.Windows.Media.Brushes.Green;
        }
    }

    private void LengthSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        if (IsLoaded)
        {
            GenerateNewPassword();
        }
    }

    private void RegenerateButton_Click(object sender, RoutedEventArgs e)
    {
        GenerateNewPassword();
    }

    private void CopyButton_Click(object sender, RoutedEventArgs e)
    {
        if (!string.IsNullOrEmpty(GeneratedPassword))
        {
            Clipboard.SetText(GeneratedPassword);
            MessageBox.Show("Password copied to clipboard!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }

    private void UsePasswordButton_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = true;
        Close();
    }
}
