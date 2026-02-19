using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PasswordManager.Data.Context;

public class PasswordManagerContextFactory : IDesignTimeDbContextFactory<PasswordManagerContext>
{
    public PasswordManagerContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<PasswordManagerContext>();
        
        // Use a temp path for design-time
        var dbPath = Path.Combine(Path.GetTempPath(), "passwordmanager.db");
        optionsBuilder.UseSqlite($"Data Source={dbPath}");

        return new PasswordManagerContext(optionsBuilder.Options);
    }
}
