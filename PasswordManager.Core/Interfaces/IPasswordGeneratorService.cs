namespace PasswordManager.Core.Interfaces;

public interface IPasswordGeneratorService
{
    string GeneratePassword(int length, bool includeUppercase, bool includeLowercase, bool includeNumbers, bool includeSpecialChars);
    int CalculatePasswordStrength(string password);
}
