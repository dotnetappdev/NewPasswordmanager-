using System.Security.Cryptography;
using System.Text;
using PasswordManager.Core.Interfaces;

namespace PasswordManager.Core.Services;

public class EncryptionService : IEncryptionService
{
    private const int KeySize = 256;
    private const int Iterations = 10000;

    public string Encrypt(string plainText, string key)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        
        using var aes = Aes.Create();
        aes.KeySize = KeySize;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;
        
        var keyDerivation = new Rfc2898DeriveBytes(key, salt, Iterations, HashAlgorithmName.SHA256);
        aes.Key = keyDerivation.GetBytes(32);
        aes.IV = keyDerivation.GetBytes(16);
        
        using var encryptor = aes.CreateEncryptor();
        byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
        byte[] encrypted = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);
        
        byte[] result = new byte[salt.Length + encrypted.Length];
        Buffer.BlockCopy(salt, 0, result, 0, salt.Length);
        Buffer.BlockCopy(encrypted, 0, result, salt.Length, encrypted.Length);
        
        return Convert.ToBase64String(result);
    }

    public string Decrypt(string encryptedText, string key)
    {
        byte[] fullCipher = Convert.FromBase64String(encryptedText);
        
        byte[] salt = new byte[16];
        byte[] cipher = new byte[fullCipher.Length - salt.Length];
        
        Buffer.BlockCopy(fullCipher, 0, salt, 0, salt.Length);
        Buffer.BlockCopy(fullCipher, salt.Length, cipher, 0, cipher.Length);
        
        using var aes = Aes.Create();
        aes.KeySize = KeySize;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;
        
        var keyDerivation = new Rfc2898DeriveBytes(key, salt, Iterations, HashAlgorithmName.SHA256);
        aes.Key = keyDerivation.GetBytes(32);
        aes.IV = keyDerivation.GetBytes(16);
        
        using var decryptor = aes.CreateDecryptor();
        byte[] decrypted = decryptor.TransformFinalBlock(cipher, 0, cipher.Length);
        
        return Encoding.UTF8.GetString(decrypted);
    }

    public string GenerateSalt()
    {
        byte[] salt = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(salt);
    }

    public string HashPassword(string password, string salt)
    {
        byte[] saltBytes = Convert.FromBase64String(salt);
        var pbkdf2 = new Rfc2898DeriveBytes(password, saltBytes, Iterations, HashAlgorithmName.SHA256);
        byte[] hash = pbkdf2.GetBytes(32);
        return Convert.ToBase64String(hash);
    }

    public bool VerifyPassword(string password, string salt, string hash)
    {
        string computedHash = HashPassword(password, salt);
        return computedHash == hash;
    }
}
