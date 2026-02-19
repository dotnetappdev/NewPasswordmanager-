namespace PasswordManager.Core.Interfaces;

public interface IPasskeyService
{
    /// <summary>
    /// Generates a new passkey credential
    /// </summary>
    /// <param name="relyingPartyId">The relying party identifier (e.g., "example.com")</param>
    /// <param name="relyingPartyName">The human-readable relying party name</param>
    /// <param name="userName">The user's display name</param>
    /// <param name="userHandle">Unique user identifier for the relying party</param>
    /// <returns>Tuple containing (credentialId, publicKey, privateKey)</returns>
    (string CredentialId, string PublicKey, string PrivateKey) GeneratePasskey(
        string relyingPartyId, 
        string relyingPartyName, 
        string userName, 
        string userHandle);
}
