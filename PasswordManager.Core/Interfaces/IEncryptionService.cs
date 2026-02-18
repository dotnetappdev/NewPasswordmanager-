namespace PasswordManager.Core.Interfaces;

public interface IEncryptionService
{
    string Encrypt(string plainText, string key);
    string Decrypt(string encryptedText, string key);
    string GenerateSalt();
    string HashPassword(string password, string salt);
    bool VerifyPassword(string password, string salt, string hash);
}
