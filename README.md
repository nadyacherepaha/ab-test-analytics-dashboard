# AB Test Analytics Dashboard

Interactive conversion-rate visualization for multiple experiment variations.  
Built with React, TypeScript, Vite, Recharts and CSS Modules.

## Visualization Library

This project uses **Recharts** because it provides:

- Native React components for charts with declarative API
- Built-in chart types needed for the task: `LineChart`, `Area`, `ComposedChart`
- Easy customization for tooltip, axes, colors, and line styles
- Good performance
- TypeScript support with comprehensive type definitions

## Implemented Features

### Core Requirements

- **Conversion Rate Calculation**: Calculates `conversionRate = (conversions / visits) * 100` for each variation
- **Line Chart Visualization**: Displays conversion rate as percentage for all variations
- **Interactive Tooltip**: On hover, shows a vertical line and popup with daily data:
  - Date display with calendar icon
  - Best-performing variation indicator (trophy icon)
  - Sorted variations by conversion rate
  - Formatted percentage values (comma as decimal separator)
- **Variations Selector**: Multi-select dropdown to show/hide variations (at least one variation must always be selected)
- **Day / Week Selector**: Switch between daily and weekly data aggregation modes
- **Dynamic Axes**: Both X and Y axes automatically adapt to the visible data range when variations are toggled
- **Percentage Display**: All values displayed as percentages
- **Responsive Layout**: Optimized for screens between 671px and 1300px width

### Bonus Features

- **Zoom / Reset Zoom**: Zoom in/out with +/- buttons and reset functionality
- **Line Style Selector**: Three visualization modes:
  - Line: Straight lines connecting data points
  - Smooth: Curved lines (monotone interpolation)
  - Area: Filled area charts with transparency
- **Light / Dark Theme Toggle**: Theme switching with CSS variables, affecting all UI components
- **Export Chart to PNG**: Export current chart view to PNG using html2canvas (preserves theme, zoom, and active variations)

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Recharts** - Chart visualization library
- **date-fns** - Date manipulation and formatting
- **html2canvas** - PNG export functionality
- **CSS Modules** - Scoped component styling

## Local Setup

### Prerequisites

- **Node.js**: Version 20.19+ or 22.12+ (required by Vite)
- **npm** or **yarn** package manager

### Installation Steps

1. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

 2. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at:

   ```
   http://localhost:5173
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors and format with Prettier

## Deployment

The project is configured for deployment to GitHub Pages. After building, the production files will be in the `dist` directory.

## Project Structure

```
src/
├── app/              # App-level styles and theme
├── features/         # Feature components
│   ├── ExperimentAnalyticsPage.tsx
│   ├── ExperimentChart.tsx
│   ├── ExperimentTooltip.tsx
│   ├── useExperimentChartData.ts
│   ├── useExperimentData.ts
│   └── ...           # Selectors and controls
├── shared/           # Shared utilities and types
│   ├── icons/        # SVG icon components
│   └── types.ts      # TypeScript type definitions
└── main.tsx          # Application entry point
```

## Usage

1. **Select Variations**: Use the variations dropdown to show/hide specific variations (at least one must remain selected)
2. **Change Time Mode**: Switch between Day and Week aggregation modes
3. **Adjust Line Style**: Choose between Line, Smooth, or Area visualization
4. **Zoom**: Use +/- buttons to zoom in/out, or reset to full view
5. **Toggle Theme**: Switch between light and dark themes
6. **Export**: Click the export icon to download the current chart view as PNG
7. **Hover**: Hover over data points to see detailed tooltip information with daily data
