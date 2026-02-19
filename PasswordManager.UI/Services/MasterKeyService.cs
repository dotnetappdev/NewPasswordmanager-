using System.IO;
using PasswordManager.Core.Interfaces;
using System.Text.Json;

namespace PasswordManager.UI.Services;

public class MasterKeyService
{
    private readonly IEncryptionService _encryptionService;
    private readonly string _settingsPath;

    public MasterKeyService(IEncryptionService encryptionService)
    {
        _encryptionService = encryptionService;

        var appDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "PasswordManager"
        );
        Directory.CreateDirectory(appDataPath);
        _settingsPath = Path.Combine(appDataPath, "masterkey.settings");
    }

    public bool HasMasterKey()
    {
        return File.Exists(_settingsPath);
    }

    public void SetMasterKey(string masterKey)
    {
        var salt = _encryptionService.GenerateSalt();
        var hash = _encryptionService.HashPassword(masterKey, salt);
        var obj = new { salt, hash };
        File.WriteAllText(_settingsPath, JsonSerializer.Serialize(obj));
    }

    public void RemoveMasterKey()
    {
        if (File.Exists(_settingsPath)) File.Delete(_settingsPath);
    }

    public bool VerifyMasterKey(string masterKey)
    {
        try
        {
            if (!File.Exists(_settingsPath)) return false;
            var json = File.ReadAllText(_settingsPath);
            var doc = JsonDocument.Parse(json);
            var salt = doc.RootElement.GetProperty("salt").GetString();
            var hash = doc.RootElement.GetProperty("hash").GetString();
            if (salt == null || hash == null) return false;
            return _encryptionService.VerifyPassword(masterKey, salt, hash);
        }
        catch
        {
            return false;
        }
    }
}
