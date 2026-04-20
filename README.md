# API Client - Mini Postman

A lightweight, interactive API client built with Astro and React. Inspired by Postman, this application allows you to send HTTP requests, manage collections, and work with environment variables.

## Architecture

This project uses **Astro Islands** architecture for optimal performance:

- **Static Shell**: The main layout and structure are rendered statically on the server
- **React Islands**: Interactive components (RequestEditor, ResponsePanel, Sidebar) are hydrated on the client
- **Partial Hydration**: Only necessary components load JavaScript, reducing initial bundle size

## Tech Stack

- **Framework**: Astro 6.x with SSR support
- **UI**: React 19.x for interactive islands
- **State Management**: Zustand 5.x
- **Persistence**: Dexie (IndexedDB wrapper)
- **Styling**: TailwindCSS 3.x
- **HTTP Client**: Native fetch API

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:4321`

### Production Build

```bash
npm run build
```

Start the production server:

```bash
node dist/server/entry.mjs
```

## Features

### Core Functionality

- Send HTTP requests (GET, POST, PUT, PATCH, DELETE)
- Custom headers and body types (JSON, Form Data, x-www-form-urlencoded)
- Response visualization with status, timing, and headers
- Request history with grouping by date

### Collections

- Organize requests into collections
- Drag and drop to move requests between collections
- Import/Export collections as JSON

### Environment Variables

- Create multiple environments
- Define variables like `{{baseUrl}}`, `{{apiKey}}`
- Automatic variable substitution in requests
- Preview how variables resolve

### Utilities

- cURL import/export
- OpenAPI 3.0 support
- Postman collection import/export
- Keyboard shortcuts (Ctrl+Enter to send, Ctrl+S to save)

### Export Options

- Export responses as JSON
- Export entire workspace
- Import from JSON files

## Why Astro?

### Performance

Astro's partial hydration means only interactive components load JavaScript. The sidebar and static elements render as pure HTML, while the request editor loads React only when needed.

### Developer Experience

- File-based routing
- TypeScript support out of the box
- Integrations for React, Tailwind, and more

### Flexibility

Use `output: 'server'` for SSR endpoints or `output: 'static'` for pure static builds.

## Usage Examples

### Sending a Request

1. Enter a URL in the address bar
2. Select HTTP method (GET, POST, etc.)
3. Add headers if needed
4. Click "Send" or press Ctrl+Enter
5. View response in the panel below

### Using Variables

1. Create an environment in the Envs panel
2. Add variables like `baseUrl: https://api.example.com`
3. Use in requests as `{{baseUrl}}/endpoint`
4. Variables resolve automatically when sending

### Importing cURL

1. Copy a cURL command from browser dev tools
2. Click the "cURL" button in Headers editor
3. Paste and parse the command
4. Request is automatically created

## Keyboard Shortcuts

| Shortcut | Action |
|---------|--------|
| Ctrl + Enter | Send request |
| Ctrl + S | Save request |
| Ctrl + N | New request |
| Ctrl + H | Focus search |
| F1 | Show shortcuts help |
| Esc | Close modal |

## Project Structure

```
src/
├── components/       # React UI components
│   ├── request/     # Request editor components
│   ├── response/    # Response panel components
│   ├── sidebar/     # Sidebar components
│   └── ui/          # Shared UI components
├── layouts/         # Astro layouts
├── pages/           # Astro pages
│   ├── api/         # API endpoints
│   ├── collections.astro
│   ├── environments.astro
│   └── index.astro
├── store/           # Zustand stores
├── types/           # TypeScript types
└── utils/          # Utility functions
```

## License

MIT