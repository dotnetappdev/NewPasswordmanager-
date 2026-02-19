using System.Security.Cryptography;
using System.Text;
using PasswordManager.Core.Interfaces;

namespace PasswordManager.Core.Services;

public class PasswordGeneratorService : IPasswordGeneratorService
{
    private const string UppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private const string LowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    private const string NumberChars = "0123456789";
    private const string SpecialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    public string GeneratePassword(int length, bool includeUppercase, bool includeLowercase, 
        bool includeNumbers, bool includeSpecialChars)
    {
        if (length < 4)
            length = 4;

        var charSet = new StringBuilder();
        if (includeUppercase) charSet.Append(UppercaseChars);
        if (includeLowercase) charSet.Append(LowercaseChars);
        if (includeNumbers) charSet.Append(NumberChars);
        if (includeSpecialChars) charSet.Append(SpecialChars);

        if (charSet.Length == 0)
            charSet.Append(LowercaseChars);

        var password = new char[length];
        var chars = charSet.ToString();

        for (int i = 0; i < length; i++)
        {
            password[i] = chars[RandomNumberGenerator.GetInt32(chars.Length)];
        }

        return new string(password);
    }

    public int CalculatePasswordStrength(string password)
    {
        if (string.IsNullOrEmpty(password))
            return 0;

        int strength = 0;

        // Length check
        if (password.Length >= 8) strength += 20;
        if (password.Length >= 12) strength += 20;
        if (password.Length >= 16) strength += 10;

        // Uppercase check
        if (password.Any(char.IsUpper)) strength += 15;

        // Lowercase check
        if (password.Any(char.IsLower)) strength += 15;

        // Number check
        if (password.Any(char.IsDigit)) strength += 10;

        // Special character check
        if (password.Any(c => !char.IsLetterOrDigit(c))) strength += 10;

        return Math.Min(100, strength);
    }
}
