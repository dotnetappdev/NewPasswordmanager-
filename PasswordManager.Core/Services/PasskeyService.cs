using System.Security.Cryptography;
using System.Text;
using PasswordManager.Core.Interfaces;

namespace PasswordManager.Core.Services;

public class PasskeyService : IPasskeyService
{
    public (string CredentialId, string PublicKey, string PrivateKey) GeneratePasskey(
        string relyingPartyId, 
        string relyingPartyName, 
        string userName, 
        string userHandle)
    {
        // Generate a unique credential ID
        var credentialId = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        
        // Generate an RSA key pair for the passkey
        using var rsa = RSA.Create(2048);
        
        // Export the private key in PEM format
        var privateKey = rsa.ExportRSAPrivateKeyPem();
        
        // Export the public key in PEM format
        var publicKey = rsa.ExportRSAPublicKeyPem();
        
        return (credentialId, publicKey, privateKey);
    }
}
