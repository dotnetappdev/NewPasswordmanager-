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
    }

    public async Task<bool> DatabaseExistsAsync()
    {
        return await _context.Database.CanConnectAsync();
    }
}
