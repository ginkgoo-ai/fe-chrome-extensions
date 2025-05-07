# Frontend Chrome Extensions

A modern Chrome extension project built with React, TypeScript, and Vite.

## Features

- 🚀 Built with React 18 and TypeScript
- 📦 Vite for fast development and building
- 🎨 Ant Design and Tailwind CSS for styling
- 📱 Multiple extension views (Popup, Sidepanel, Content Script)
- 🔄 Redux for state management
- 🛠️ ESLint and Prettier for code quality
- 📝 TypeScript support

## Prerequisites

- Node.js (Latest LTS version recommended)
- Yarn package manager
- Google Chrome browser

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd fe-chrome-extensions
```

2. Install dependencies:

```bash
yarn install
```

## Development

The project supports multiple development modes:

- Popup development:

```bash
yarn dev:popup
```

- Sidepanel development:

```bash
yarn dev:sidepanel
```

## Building

To build the extension:

```bash
yarn build
```

This will create a production build in the `build` directory.

## Project Structure

- `src/` - Source code
- `public/` - Static assets
- `build/` - Production build output
- `vite.*.config.ts` - Vite configuration files for different parts of the extension

## Technologies

- React 18
- TypeScript
- Vite
- Redux
- Ant Design
- Tailwind CSS
- ESLint
- Prettier

## Scripts

- `yarn dev:popup` - Start popup development server
- `yarn dev:sidepanel` - Start sidepanel development server
- `yarn build` - Build the extension
- `yarn lint` - Run ESLint
- `yarn preview` - Preview the popup build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
