using System.IO;
using System.Windows;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PasswordManager.Core.Interfaces;
using PasswordManager.Core.Services;
using PasswordManager.Data;
using PasswordManager.Data.Context;
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
        services.AddScoped<DatabaseService>();

        // Register views
        services.AddTransient<LoginWindow>();
        services.AddTransient<MainWindow>();

        ServiceProvider = services.BuildServiceProvider();
    }

    private void Application_Startup(object sender, StartupEventArgs e)
    {
        var loginWindow = ServiceProvider.GetRequiredService<LoginWindow>();
        loginWindow.Show();
    }
}

