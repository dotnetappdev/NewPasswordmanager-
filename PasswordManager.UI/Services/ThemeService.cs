using System.IO;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Media;
using Microsoft.Win32;
using PasswordManager.Core.Enums;
using PasswordManager.Core.Interfaces;

namespace PasswordManager.UI.Services;

public class ThemeService : IThemeService
{
    private AppTheme _currentTheme = AppTheme.System;
    private readonly string _settingsPath;

    public ThemeService()
    {
        var appDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "PasswordManager"
        );
        Directory.CreateDirectory(appDataPath);
        _settingsPath = Path.Combine(appDataPath, "theme.settings");
    }

    public void ApplyTheme(AppTheme theme)
    {
        _currentTheme = theme;

        // Determine which theme to apply
        var effectiveTheme = theme == AppTheme.System ? GetSystemTheme() : theme;

        // Apply theme to application
        Application.Current.Dispatcher.Invoke(() =>
        {
            var app = Application.Current;
            var dict = app.Resources.MergedDictionaries.FirstOrDefault();
            
            if (dict != null)
            {
                if (effectiveTheme == AppTheme.Dark)
                {
                    ApplyDarkTheme(dict);
                }
                else
                {
                    ApplyLightTheme(dict);
                }
            }
        });
    }

    public AppTheme GetCurrentTheme()
    {
        return _currentTheme;
    }

    public AppTheme GetSystemTheme()
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            try
            {
                using var key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize");
                var value = key?.GetValue("AppsUseLightTheme");
                
                if (value is int intValue)
                {
                    return intValue == 0 ? AppTheme.Dark : AppTheme.Light;
                }
            }
            catch
            {
                // If we can't read the registry, default to light
            }
        }
        
        return AppTheme.Light;
    }

    public void SaveThemePreference(AppTheme theme)
    {
        try
        {
            File.WriteAllText(_settingsPath, ((int)theme).ToString());
        }
        catch
        {
            // Silently fail if we can't save settings
        }
    }

    public AppTheme LoadThemePreference()
    {
        try
        {
            if (File.Exists(_settingsPath))
            {
                var content = File.ReadAllText(_settingsPath);
                if (int.TryParse(content, out int themeValue))
                {
                    return (AppTheme)themeValue;
                }
            }
        }
        catch
        {
            // Silently fail if we can't load settings
        }

        return AppTheme.System;
    }

    private void ApplyLightTheme(ResourceDictionary dict)
    {
        dict["PrimaryBrush"] = new SolidColorBrush(Color.FromRgb(0x25, 0x63, 0xEB));
        dict["SecondaryBrush"] = new SolidColorBrush(Color.FromRgb(0x47, 0x55, 0x69));
        dict["BackgroundBrush"] = new SolidColorBrush(Color.FromRgb(0xF8, 0xFA, 0xFC));
        dict["SurfaceBrush"] = new SolidColorBrush(Color.FromRgb(0xFF, 0xFF, 0xFF));
        dict["TextBrush"] = new SolidColorBrush(Color.FromRgb(0x1E, 0x29, 0x3B));
        dict["BorderBrush"] = new SolidColorBrush(Color.FromRgb(0xE2, 0xE8, 0xF0));
        dict["HoverBrush"] = new SolidColorBrush(Color.FromRgb(0x3B, 0x82, 0xF6));
    }

    private void ApplyDarkTheme(ResourceDictionary dict)
    {
        dict["PrimaryBrush"] = new SolidColorBrush(Color.FromRgb(0x3B, 0x82, 0xF6));
        dict["SecondaryBrush"] = new SolidColorBrush(Color.FromRgb(0x94, 0xA3, 0xB8));
        dict["BackgroundBrush"] = new SolidColorBrush(Color.FromRgb(0x0F, 0x17, 0x2A));
        dict["SurfaceBrush"] = new SolidColorBrush(Color.FromRgb(0x1E, 0x29, 0x3B));
        dict["TextBrush"] = new SolidColorBrush(Color.FromRgb(0xF1, 0xF5, 0xF9));
        dict["BorderBrush"] = new SolidColorBrush(Color.FromRgb(0x33, 0x41, 0x55));
        dict["HoverBrush"] = new SolidColorBrush(Color.FromRgb(0x60, 0xA5, 0xFA));
    }
}
