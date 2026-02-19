namespace PasswordManager.Core.Interfaces;

public interface IThemeService
{
    void ApplyTheme(Enums.AppTheme theme);
    Enums.AppTheme GetCurrentTheme();
    Enums.AppTheme GetSystemTheme();
    void SaveThemePreference(Enums.AppTheme theme);
    Enums.AppTheme LoadThemePreference();
}
