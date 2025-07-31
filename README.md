# Nevu Desktop

A modern desktop application for [Nevu](https://github.com/Ipmake/Nevu), the alternative UI for Plex.

## Features

- **Cross-platform**: Available for Windows, macOS, and Linux
- **Auto-discovery**: Automatically finds Nevu servers on your network using UDP discovery
- **Custom window controls**: Native-feeling window management
- **Hardware acceleration**: Optional GPU acceleration for better performance
- **Auto-updates**: Automatic updates when new versions are released
- **Settings management**: Easy configuration of server URL and preferences
- **Dark mode**: Modern, minimalistic dark interface

## Installation

### From Releases

Download the latest release for your platform:

- **Windows**: `Nevu-Setup-vX.X.X-Windows.exe` (installer) or `Nevu-vX.X.X-Windows-Portable.exe` (portable)
- **macOS**: `Nevu-vX.X.X-macOS.dmg` (disk image) or `Nevu-vX.X.X-macOS.zip` (ZIP archive)
- **Linux**: `Nevu-vX.X.X-Linux.AppImage` (AppImage), `Nevu-vX.X.X-Linux.deb` (Debian), or `Nevu-vX.X.X-Linux.rpm` (Red Hat)

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/YourUsername/nevu-desktop.git
   cd nevu-desktop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start in development mode:
   ```bash
   npm run dev
   ```

4. Build for your platform:
   ```bash
   npm run build
   ```

## Usage

### First Launch

When you first launch Nevu Desktop, you'll be presented with a setup screen where you can:

1. **Enter a manual server URL**: If you know the URL of your Nevu server (e.g., `http://localhost:3000`)
2. **Select from discovered servers**: The app automatically discovers Nevu servers on your network

### Settings

Access settings through the app menu (macOS) or by calling `window.nevuDesktop.openSettings()` from the Nevu web interface.

Settings include:
- **Server URL**: Change the Nevu server you're connected to
- **Hardware Acceleration**: Enable/disable GPU acceleration

### API for Nevu Web Interface

The desktop app exposes a `nevuDesktop` API that the Nevu web interface can use:

```javascript
// Check if running in desktop app
if (window.nevuDesktop) {
  // Get platform information
  const platform = await window.nevuDesktop.getPlatform();
  console.log('Running on:', platform.platform);
  
  // Open settings
  window.nevuDesktop.openSettings();
  
  // Get app version
  const version = await window.nevuDesktop.getVersion();
}
```

## Development

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Building

```bash
# Install dependencies
npm install

# Generate icons (requires ImageMagick or uses placeholders)
npm run generate-icons

# Build for all platforms
npm run build

# Build for specific platforms
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

### Project Structure

```
nevu-desktop/
├── src/
│   ├── main.js       # Main Electron process
│   ├── preload.js    # Preload script for security
│   ├── setup.html    # Initial setup page
│   └── settings.html # Settings window
├── assets/
│   ├── icon.svg      # Source icon
│   ├── icon.ico      # Windows icon
│   ├── icon.icns     # macOS icon
│   └── icon.png      # Linux icon
├── scripts/
│   └── generate-icons.js # Icon generation script
└── .github/workflows/
    └── build.yml     # GitHub Actions build workflow
```

## Server Discovery

The app uses UDP discovery to find Nevu servers on your network. Servers are discovered when they announce themselves with the name "Nevu".

For a Nevu server to be discoverable, it should announce itself using udp-discovery:

```javascript
const Discovery = require('udp-discovery').Discovery;
const discovery = new Discovery();

discovery.announce("Nevu", {
  port: parseInt(process.env.PORT || '3000'),
  type: 'nevu',
  protocol: 'tcp',
  txt: {
    deploymentID,
    version: '1.0.0',
    plexServer: process.env.PLEX_SERVER,
  }
}, 500, true);
```

## Building and Releases

This project uses GitHub Actions to automatically build and release the application when a new tag is pushed:

1. Create a new tag: `git tag v1.0.0`
2. Push the tag: `git push origin v1.0.0`
3. GitHub Actions will build for all platforms and create a release

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues related to Nevu Desktop, please open an issue on this repository.
For issues related to the Nevu server itself, please visit the [main Nevu repository](https://github.com/Ipmake/Nevu).
