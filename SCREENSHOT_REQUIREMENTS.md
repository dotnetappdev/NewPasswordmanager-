# Screenshot Requirements Guide

## Purpose
This document outlines the requirements for capturing high-quality screenshots of the Password Manager application for documentation purposes.

## Why Screenshots Are Important
- Help users understand the UI before installing
- Serve as visual documentation for features
- Aid in bug reporting and feature requests
- Provide marketing and promotional material
- Support user guides and tutorials

## Screenshot Requirements

### Technical Specifications
- **Format**: PNG (lossless compression)
- **Resolution**: Minimum 1920x1080 (1080p)
- **Color Depth**: 24-bit or 32-bit color
- **File Size**: Optimized but maintaining quality (typically 100KB-2MB per screenshot)

### Quality Standards
1. **Clarity**: Text must be crisp and readable
2. **Completeness**: Capture the entire window/dialog
3. **Context**: Include window title bars and borders
4. **Cleanliness**: No desktop clutter in background
5. **Consistency**: Same window size and position when possible

### Content Guidelines
1. **Use Demo Data Only**: Never capture real passwords or sensitive information
2. **Realistic Examples**: Use believable example data
3. **Professional Appearance**: Ensure UI looks polished
4. **No Personal Information**: Avoid any identifying information
5. **Proper State**: Show features in their intended state

## Required Screenshots (20 Total)

### Main Screens (4 screenshots)
1. **Login Window** - Initial screen with account selection
2. **Create Account Dialog** - New user registration
3. **Main Window Overview** - Clean slate after login
4. **Main Window with Entries** - Populated with sample data

### Dialogs (7 screenshots)
5. **Login Entry Dialog** - Username/password entry form
6. **Credit Card Entry Dialog** - Payment card information form
7. **Secure Note Dialog** - Text note creation
8. **File Entry Dialog** - File attachment interface
9. **Password Generator** - Password generation tool
10. **Vault Dialog** - Vault creation/editing
11. **Settings Dialog** - Application settings and preferences

### Features (3 screenshots)
12. **Search and Filter** - Search functionality in action
13. **Password Reveal** - Toggle password visibility
14. **Password Strength** - Strength indicator display

### Themes (2 screenshots)
15. **Dark Theme** - Application in dark mode
16. **Light Theme** - Application in light mode

### Account Types (4 screenshots)
17. **Admin View** - Admin account perspective
18. **User View** - Standard user perspective
19. **Child View** - Child account with restrictions
20. **Access Restrictions** - Admin restriction settings

## Capture Instructions

### Setup
1. Build and run the application on Windows
2. Login with demo account (admin/Admin123!)
3. Close unnecessary applications
4. Disable notifications
5. Set display scaling to 100% (recommended)

### Tools
**Recommended**: Windows Snipping Tool (Win + Shift + S)
- Built into Windows 10/11
- Easy to use
- Good quality output
- Quick access via keyboard shortcut

**Alternative Tools**:
- ShareX (Free, feature-rich)
- Greenshot (Free, lightweight)
- Snagit (Paid, professional)

### Process
1. Navigate to the screen you want to capture
2. Ensure the window is properly sized and positioned
3. Press Win + Shift + S
4. Select the area to capture (or use Window Snip)
5. Save the file with the correct name
6. Verify the screenshot quality
7. Move to the next screenshot

### Naming Convention
Files should be named according to the pattern:
```
##-description.png
```

Examples:
- `01-login-window.png`
- `05-entry-dialog-login.png`
- `15-dark-theme.png`

## Demo Account Information

Use these pre-populated demo accounts:

| Username | Password     | Role  | Purpose                           |
|----------|--------------|-------|-----------------------------------|
| admin    | Admin123!    | Admin | Full features, sample entries     |
| john     | John123!     | User  | Standard user view                |
| sarah    | Sarah123!    | Child | Restricted account view           |

## Sample Data

The admin account includes these sample entries:
- GitHub login credentials
- Gmail login credentials
- Visa credit card
- WiFi password secure note

## Quality Checklist

Before finalizing each screenshot, verify:
- [ ] Window is fully visible
- [ ] Title bar is included
- [ ] Text is readable and crisp
- [ ] No real sensitive data is shown
- [ ] No desktop icons or taskbar visible (unless relevant)
- [ ] Proper file name used
- [ ] File saved in `screenshots/` directory
- [ ] PNG format
- [ ] Appropriate file size

## Automated Guide

Use the PowerShell script for a guided experience:
```powershell
.\Take-Screenshots.ps1
```

This script will:
- Walk you through each screenshot step-by-step
- Provide instructions for each screen
- Track your progress
- Ensure nothing is missed

## Post-Capture Tasks

After capturing all screenshots:
1. Review each image for quality
2. Verify all 20 screenshots are present
3. Check file names match the specification
4. Ensure file sizes are reasonable
5. Test that images display correctly in SCREENSHOTS.md
6. Commit screenshots to the repository

## Tips for Best Results

### Window Sizing
- Use a consistent window size
- Don't maximize windows (harder to capture cleanly)
- Center windows on screen
- Leave some padding around edges

### Timing
- Capture during daylight hours (better screen clarity)
- Allow animations to complete
- Ensure focus is on the correct window
- Wait for all elements to load

### Content
- Use example.com for URLs
- Use fake but realistic names
- Use obviously fake credit card numbers
- Show features in action when possible

### Consistency
- Same theme for most screenshots (light mode default)
- Capture dark theme separately
- Use same zoom level
- Maintain same DPI settings

## Troubleshooting

### Screenshot is blurry
- Check display scaling (should be 100%)
- Ensure you're capturing at full resolution
- Verify screenshot tool settings

### Colors look wrong
- Check theme settings
- Verify color calibration
- Use PNG format (not JPG)

### Window is cut off
- Resize window before capturing
- Use full window capture mode
- Adjust monitor resolution if needed

### File size too large
- Optimize PNG with tools like TinyPNG
- Remove unnecessary metadata
- Ensure you're not capturing at excessive resolution

## Maintenance

Screenshots should be updated when:
- UI design changes significantly
- New features are added
- Old features are removed
- Themes are updated
- Branding changes

## Questions?

If you have questions about screenshot requirements, please:
1. Check this guide first
2. Review existing screenshots for examples
3. Consult SCREENSHOTS.md for context
4. Open an issue if still unclear

---

**Last Updated**: February 2026
**Version**: 1.0
