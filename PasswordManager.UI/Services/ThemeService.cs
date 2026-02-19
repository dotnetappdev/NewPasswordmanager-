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
    private AppAccent _currentAccent = AppAccent.Default;
    private readonly string _settingsPath;

    public ThemeService()
    {
        var appDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "PasswordManager"
        );
        Directory.CreateDirectory(appDataPath);
        _settingsPath = Path.Combine(appDataPath, "appearance.settings");
    }

    public void ApplyTheme(AppTheme theme)
    {
        _currentTheme = theme;

        // Determine which theme to apply
        var effectiveTheme = theme == AppTheme.System ? GetSystemTheme() : theme;

        // Apply theme to application (also apply accent)
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

                // Apply accent after base theme
                ApplyAccent(_currentAccent);
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
            // Save both theme and accent into a small JSON blob
            var obj = new { theme = (int)theme, accent = (int)_currentAccent };
            var json = System.Text.Json.JsonSerializer.Serialize(obj);
            File.WriteAllText(_settingsPath, json);
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
                var doc = System.Text.Json.JsonDocument.Parse(content);
                if (doc.RootElement.TryGetProperty("theme", out var themeProp) && themeProp.TryGetInt32(out int themeValue))
                {
                    if (doc.RootElement.TryGetProperty("accent", out var accentProp) && accentProp.TryGetInt32(out int accentValue))
                    {
                        _currentAccent = (AppAccent)accentValue;
                    }
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

    public void ApplyAccent(AppAccent accent)
    {
        _currentAccent = accent;

        Application.Current.Dispatcher.Invoke(() =>
        {
            var app = Application.Current;
            var dict = app.Resources.MergedDictionaries.FirstOrDefault();
            if (dict == null) return;

            switch (accent)
            {
                case AppAccent.Windows11Blue:
                    dict["PrimaryBrush"] = new SolidColorBrush(Color.FromRgb(0x00, 0x78, 0xD4)); // Windows blue
                    dict["HoverBrush"] = new SolidColorBrush(Color.FromRgb(0x00, 0x78, 0xD4));
                    break;
                default:
                    // leave as-is or re-apply theme defaults
                    var effectiveTheme = _currentTheme == AppTheme.System ? GetSystemTheme() : _currentTheme;
                    if (effectiveTheme == AppTheme.Dark) ApplyDarkTheme(dict); else ApplyLightTheme(dict);
                    break;
            }
        });
    }

    public AppAccent GetCurrentAccent() => _currentAccent;

    public void SaveAccentPreference(AppAccent accent)
    {
        _currentAccent = accent;
        SaveThemePreference(_currentTheme);
    }

    public AppAccent LoadAccentPreference()
    {
        // LoadThemePreference already populates _currentAccent when possible
        LoadThemePreference();
        return _currentAccent;
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
        dict["PrimaryBrush"]    = new SolidColorBrush(Color.FromRgb(0x6E, 0x4E, 0xBF));
        dict["SecondaryBrush"]  = new SolidColorBrush(Color.FromRgb(0x78, 0x78, 0xA0));
        dict["BackgroundBrush"] = new SolidColorBrush(Color.FromRgb(0x1A, 0x1A, 0x24));
        dict["SurfaceBrush"]    = new SolidColorBrush(Color.FromRgb(0x2A, 0x2A, 0x3C));
        dict["TextBrush"]       = new SolidColorBrush(Color.FromRgb(0xE8, 0xE8, 0xF5));
        dict["BorderBrush"]     = new SolidColorBrush(Color.FromRgb(0x35, 0x35, 0x4A));
        dict["HoverBrush"]      = new SolidColorBrush(Color.FromRgb(0x2E, 0x2E, 0x44));
        dict["SidebarBrush"]    = new SolidColorBrush(Color.FromRgb(0x22, 0x22, 0x32));
        dict["ListPaneBrush"]   = new SolidColorBrush(Color.FromRgb(0x1C, 0x1C, 0x28));
        dict["DetailPaneBrush"] = new SolidColorBrush(Color.FromRgb(0x1E, 0x1E, 0x2C));
        dict["SelectedBrush"]   = new SolidColorBrush(Color.FromRgb(0x5C, 0x3E, 0x9C));
        dict["AccentBrush"]     = new SolidColorBrush(Color.FromRgb(0x4A, 0x8C, 0xF7));
    }
}
