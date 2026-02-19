using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using PasswordManager.Data.Context;

namespace PasswordManager.Data;

public class DatabaseService
{
    private readonly PasswordManagerContext _context;

    public DatabaseService(PasswordManagerContext context)
    {
        _context = context;
    }

    public async Task InitializeDatabaseAsync()
    {
        await _context.Database.EnsureCreatedAsync();
        await EnsureSchemaUpToDateAsync();
    }

    private async Task EnsureSchemaUpToDateAsync()
    {
        // Add columns that may be missing from older database versions.
        // SQLite's ALTER TABLE ADD COLUMN throws if the column already exists,
        // so we catch and ignore those errors.
        var alterStatements = new[]
        {
            "ALTER TABLE PasswordEntries ADD COLUMN RelyingPartyId TEXT",
            "ALTER TABLE PasswordEntries ADD COLUMN RelyingPartyName TEXT",
            "ALTER TABLE PasswordEntries ADD COLUMN UserHandle TEXT",
            "ALTER TABLE PasswordEntries ADD COLUMN CredentialId TEXT",
            "ALTER TABLE PasswordEntries ADD COLUMN PublicKeyPem TEXT",
            "ALTER TABLE PasswordEntries ADD COLUMN EncryptedPrivateKey TEXT",
            "ALTER TABLE PasswordEntries ADD COLUMN Counter INTEGER",
            "ALTER TABLE PasswordEntries ADD COLUMN FileName TEXT",
            "ALTER TABLE PasswordEntries ADD COLUMN FileData BLOB",
            "ALTER TABLE PasswordEntries ADD COLUMN Category TEXT",
        };

        foreach (var sql in alterStatements)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(sql);
            }
            catch (SqliteException ex) when (ex.Message.Contains("duplicate column"))
            {
                // Column already exists – ignore.
            }
        }
    }

    public async Task<bool> DatabaseExistsAsync()
    {
        return await _context.Database.CanConnectAsync();
    }
}
