# Angular Webpage Loader with NgRx

This is an Angular application that allows users to load and display webpages using an iframe, with state management handled by NgRx.

## Features

- 🌐 Load and display webpages in an iframe
- 🔄 NgRx state management for loading states, errors, and current URL
- 🧪 Comprehensive unit tests with Jasmine and Karma
- 📱 Responsive design
- ⚡ Real-time loading indicators and error handling

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── webpage-loader/           # Main webpage loading component
│   ├── store/                        # NgRx store setup
│   │   ├── webpage.actions.ts        # NgRx actions
│   │   ├── webpage.reducer.ts        # NgRx reducer
│   │   ├── webpage.effects.ts        # NgRx effects
│   │   ├── webpage.selectors.ts      # NgRx selectors
│   │   └── *.spec.ts                # Unit tests for store
│   ├── app.component.*               # Root component
│   └── app.module.ts                 # Main module with NgRx setup
├── styles.scss                      # Global styles
└── index.html                       # Main HTML file
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

   The app will be available at `http://localhost:4200`

3. **API Configuration (Important)**:
   
   The application expects a backend API running at `http://localhost:3000` with the following endpoints:
   - `GET /webpages` - Get all webpages
   - `GET /webpages/:id` - Get a specific webpage
   - `POST /webpages` - Create a new webpage
   - `PUT /webpages/:id` - Update a webpage
   - `DELETE /webpages/:id` - Delete a webpage

   The proxy configuration in `proxy.conf.json` automatically forwards `/api/*` requests to your backend server.

   **To connect to your backend:**
   - Ensure your backend is running on `http://localhost:3000`
   - Or update the `target` in `proxy.conf.json` to match your backend URL

3. Open your browser and navigate to `http://localhost:4200`

### Running Tests

Run the unit tests:
```bash
npm test
```

## Usage

1. Enter a URL in the input field (e.g., `https://www.example.com`)
2. Click "Load Webpage" or press Enter
3. The webpage will be loaded and displayed in the iframe below
4. Loading states and errors are managed through NgRx store

## NgRx State Management

The application uses NgRx to manage the following state:
- `currentUrl`: The currently loaded webpage URL
- `isLoading`: Loading state indicator
- `error`: Error messages if webpage loading fails

### Actions

- `loadWebpage`: Initiates webpage loading
- `loadWebpageSuccess`: Successful webpage load
- `loadWebpageFailure`: Failed webpage load
- `setCurrentUrl`: Updates current URL

## Development

### Adding New Features

1. Create new actions in `webpage.actions.ts`
2. Update the reducer in `webpage.reducer.ts`
3. Add effects if needed in `webpage.effects.ts`
4. Create selectors in `webpage.selectors.ts`
5. Write comprehensive tests

### Testing

The project includes unit tests for:
- Components
- NgRx store (actions, reducers, effects, selectors)
- Integration tests

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Technologies Used

- Angular 17
- NgRx (Store, Effects, DevTools)
- TypeScript
- SCSS
- Jasmine & Karma (Testing)

## Browser Compatibility

Modern browsers that support ES2022 features.
