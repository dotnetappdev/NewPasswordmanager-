using PasswordManager.Core.Enums;

namespace PasswordManager.Core.Models;

public class PasswordEntry
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public EntryType Type { get; set; }
    public int VaultId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ModifiedAt { get; set; }
    
    // Login fields
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? EncryptedPassword { get; set; }
    public string? Url { get; set; }
    
    // Credit card fields
    public string? CardholderName { get; set; }
    public string? EncryptedCardNumber { get; set; }
    public string? ExpiryDate { get; set; }
    public string? EncryptedCvv { get; set; }
    
    // Common fields
    public string? Notes { get; set; }
    public string? Category { get; set; }
    public bool IsFavorite { get; set; }
    
    // File attachment
    public string? FileName { get; set; }
    public byte[]? FileData { get; set; }
    
    public Vault Vault { get; set; } = null!;
    public ICollection<AccessRestriction> AccessRestrictions { get; set; } = new List<AccessRestriction>();
}
