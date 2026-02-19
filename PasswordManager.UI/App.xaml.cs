using System.IO;
using System.Windows;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PasswordManager.Core.Interfaces;
using PasswordManager.Core.Services;
using PasswordManager.Data;
using PasswordManager.Data.Context;
using PasswordManager.UI.Services;
using PasswordManager.UI.Views;

namespace PasswordManager.UI;

public partial class App : Application
{
    public static IServiceProvider ServiceProvider { get; private set; } = null!;

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        ConfigureServices();
    }

    private void ConfigureServices()
    {
        var services = new ServiceCollection();

        // Database path in AppData
        var appDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "PasswordManager"
        );
        Directory.CreateDirectory(appDataPath);
        var dbPath = Path.Combine(appDataPath, "passwordmanager.db");

        // Register DbContext
        services.AddDbContext<PasswordManagerContext>(options =>
            options.UseSqlite($"Data Source={dbPath}"));

        // Register services
        services.AddSingleton<IEncryptionService, EncryptionService>();
        services.AddSingleton<IPasswordGeneratorService, PasswordGeneratorService>();
        services.AddSingleton<IThemeService, ThemeService>();
        services.AddSingleton<IPasskeyService, PasskeyService>();
        services.AddScoped<DatabaseService>();
        services.AddScoped<SeedDataService>();

        // Register views
        services.AddTransient<LoginWindow>();
        services.AddTransient<MainWindow>();

        ServiceProvider = services.BuildServiceProvider();

        // Apply theme
        var themeService = ServiceProvider.GetRequiredService<IThemeService>();
        var savedTheme = themeService.LoadThemePreference();
        themeService.ApplyTheme(savedTheme);
    }

    private async void Application_Startup(object sender, StartupEventArgs e)
    {
        // Initialize database and seed demo data
        using (var scope = ServiceProvider.CreateScope())
        {
            var dbService = scope.ServiceProvider.GetRequiredService<DatabaseService>();
            await dbService.InitializeDatabaseAsync();

            var seedService = scope.ServiceProvider.GetRequiredService<SeedDataService>();
            await seedService.SeedDemoDataAsync();
        }

        var loginWindow = ServiceProvider.GetRequiredService<LoginWindow>();
        loginWindow.Show();
    }
}

