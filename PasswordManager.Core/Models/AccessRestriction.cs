namespace PasswordManager.Core.Models;

public class AccessRestriction
{
    public int Id { get; set; }
    public int PasswordEntryId { get; set; }
    public int RestrictedUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedByUserId { get; set; }
    
    public PasswordEntry PasswordEntry { get; set; } = null!;
    public User RestrictedUser { get; set; } = null!;
}
