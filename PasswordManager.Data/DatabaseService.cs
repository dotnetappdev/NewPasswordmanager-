using Microsoft.EntityFrameworkCore;

namespace PasswordManager.Data;

public class DatabaseService
{
    private readonly DbContext _context;

    public DatabaseService(DbContext context)
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
