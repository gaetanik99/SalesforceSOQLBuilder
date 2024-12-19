# Salesforce SOQL Builder Chrome Extension

A powerful and user-friendly Chrome extension for building and managing SOQL queries for Salesforce developers. This extension provides both visual query building and manual query editing capabilities with advanced features like autocompletion, syntax validation, and query optimization.

## Features

- **Visual Query Builder**
  - Interactive object and field selection
  - Drag-and-drop field ordering
  - Visual filter builder with logical operators
  - Support for relationships and subqueries
  
- **Manual Query Editor**
  - Syntax highlighting
  - Real-time validation
  - Autocompletion for objects and fields
  
- **Advanced Features**
  - Query optimization suggestions
  - Performance analysis
  - Template management
  - Query history
  
- **Integration**
  - Direct connection to Salesforce orgs
  - Support for multiple environments (production/sandbox)
  - Export to various formats (Workbench, Apex, SFDX)

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Configuration

1. Create a Connected App in Salesforce:
   - Setup > App Manager > New Connected App
   - Enable OAuth Settings
   - Set Callback URL to: `https://<extension-id>.chromiumapp.org/oauth2`
   - Add OAuth Scopes: "Access and manage your data (api)", "Perform requests on your behalf at any time (refresh_token, offline_access)"

2. Copy the Consumer Key (Client ID) from your Connected App
3. Open the extension options and paste the Client ID

## Usage

1. Click the extension icon in Chrome
2. Authenticate with your Salesforce org
3. Start building queries using either:
   - Visual Builder: Select objects and fields visually
   - Manual Editor: Write SOQL queries directly

## Development

### Project Structure

```
salesforce-soql-builder/
├── manifest.json           # Extension manifest
├── popup.html             # Main extension UI
├── background.js          # Background script for SF communication
├── styles/
│   ├── popup.css         # Main styles
│   └── material.css      # Material design styles
├── js/
│   ├── popup.js          # UI initialization
│   ├── queryBuilder.js   # Query building logic
│   └── soqlParser.js     # SOQL parsing and validation
└── icons/                # Extension icons
```

### Building for Development

1. Make changes to the source code
2. Load the extension directory in Chrome
3. Click the refresh icon in `chrome://extensions/` to update

### Building for Production

1. Update version in `manifest.json`
2. Zip the extension directory
3. Submit to Chrome Web Store

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
