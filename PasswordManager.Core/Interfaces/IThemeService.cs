namespace PasswordManager.Core.Interfaces;

public interface IThemeService
{
    void ApplyTheme(Enums.AppTheme theme);
    Enums.AppTheme GetCurrentTheme();
    Enums.AppTheme GetSystemTheme();
    void SaveThemePreference(Enums.AppTheme theme);
    Enums.AppTheme LoadThemePreference();

    // Accent / color variants
    void ApplyAccent(Enums.AppAccent accent);
    Enums.AppAccent GetCurrentAccent();
    void SaveAccentPreference(Enums.AppAccent accent);
    Enums.AppAccent LoadAccentPreference();
}
