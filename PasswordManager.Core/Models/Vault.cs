namespace PasswordManager.Core.Models;

public class Vault
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ModifiedAt { get; set; }
    
    public User User { get; set; } = null!;
    public ICollection<PasswordEntry> Entries { get; set; } = new List<PasswordEntry>();
}
