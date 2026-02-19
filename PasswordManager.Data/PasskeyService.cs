using System.Security.Cryptography;
using System.Text;
using PasswordManager.Core.Interfaces;

namespace PasswordManager.Data;

public class PasskeyService
{
    private readonly IEncryptionService _encryptionService;

    public PasskeyService(IEncryptionService encryptionService)
    {
        _encryptionService = encryptionService;
    }

    public class GeneratedPasskey
    {
        public string CredentialIdBase64 { get; set; } = string.Empty;
        public string UserHandleBase64 { get; set; } = string.Empty;
        public string PublicKeyPem { get; set; } = string.Empty;
        public string EncryptedPrivateKey { get; set; } = string.Empty;
        public int Counter { get; set; }
    }

    public GeneratedPasskey GeneratePasskey(string protectionKey)
    {
        // Create 32-byte credential id
        var credentialId = RandomNumberGenerator.GetBytes(32);
        var credentialIdB64 = Convert.ToBase64String(credentialId);

        // Create 16-byte user handle
        var userHandle = RandomNumberGenerator.GetBytes(16);
        var userHandleB64 = Convert.ToBase64String(userHandle);

        using var rsa = RSA.Create(2048);

        // Export public key (SubjectPublicKeyInfo / PKCS#8 SPKI)
        var publicDer = rsa.ExportSubjectPublicKeyInfo();
        var publicPem = ToPem(publicDer, "PUBLIC KEY");

        // Export private key (PKCS#1)
        var privateDer = rsa.ExportRSAPrivateKey();
        var privatePem = ToPem(privateDer, "RSA PRIVATE KEY");

        // Encrypt private PEM with protection key
        var encryptedPrivate = _encryptionService.Encrypt(privatePem, protectionKey);

        return new GeneratedPasskey
        {
            CredentialIdBase64 = credentialIdB64,
            UserHandleBase64 = userHandleB64,
            PublicKeyPem = publicPem,
            EncryptedPrivateKey = encryptedPrivate,
            Counter = 0
        };
    }

    private static string ToPem(byte[] derBytes, string label)
    {
        var b64 = Convert.ToBase64String(derBytes);
        var sb = new StringBuilder();
        sb.AppendLine($"-----BEGIN {label}-----");
        int offset = 0;
        const int LineLen = 64;
        while (offset < b64.Length)
        {
            var line = b64.Substring(offset, Math.Min(LineLen, b64.Length - offset));
            sb.AppendLine(line);
            offset += line.Length;
        }
        sb.AppendLine($"-----END {label}-----");
        return sb.ToString();
    }
}
