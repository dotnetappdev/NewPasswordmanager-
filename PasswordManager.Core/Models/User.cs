using PasswordManager.Core.Enums;

namespace PasswordManager.Core.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Salt { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    
    public ICollection<Vault> Vaults { get; set; } = new List<Vault>();
    public ICollection<AccessRestriction> RestrictedEntries { get; set; } = new List<AccessRestriction>();
}
