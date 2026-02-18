using Microsoft.EntityFrameworkCore;
using PasswordManager.Core.Models;

namespace PasswordManager.Data.Context;

public class PasswordManagerContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Vault> Vaults { get; set; }
    public DbSet<PasswordEntry> PasswordEntries { get; set; }
    public DbSet<AccessRestriction> AccessRestrictions { get; set; }

    public PasswordManagerContext(DbContextOptions<PasswordManagerContext> options) 
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Salt).IsRequired();
            entity.HasIndex(e => e.Username).IsUnique();
        });

        // Vault configuration
        modelBuilder.Entity<Vault>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.User)
                .WithMany(u => u.Vaults)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // PasswordEntry configuration
        modelBuilder.Entity<PasswordEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.Vault)
                .WithMany(v => v.Entries)
                .HasForeignKey(e => e.VaultId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // AccessRestriction configuration
        modelBuilder.Entity<AccessRestriction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.PasswordEntry)
                .WithMany(p => p.AccessRestrictions)
                .HasForeignKey(e => e.PasswordEntryId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.RestrictedUser)
                .WithMany(u => u.RestrictedEntries)
                .HasForeignKey(e => e.RestrictedUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
