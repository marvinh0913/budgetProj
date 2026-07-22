# BudgetProj

A client-side budgeting application built with React and Python (via Pyodide). Enter your monthly income and expenses to get a personalized budget breakdown, spending analysis, and financial suggestions based on the 50/30/20 rule. All calculations run directly in your browser.

## Live Demo
[URL ]

## Features
- **Budget Analysis** — Track income and expenses by category with real-time calculations
- **50/30/20 Rule** — Personalized suggestions based on the recommended budgeting guideline
- **Live Interest Rates** — Real-time rates from the Federal Reserve (FRED API)
- **Debt & Interest Calculator** — Mortgage, credit card, auto loan, and savings calculations
- **Client-Side Python** — All calculations run in Python via Pyodide (WebAssembly)
- **Privacy First** — Your data never leaves your browser

## Tech Stack
- **React** + **Vite** — UI and build tooling
- **Pyodide** — Python runtime in the browser via WebAssembly
- **Chart.js** — Data visualizations
- **FRED API** — Federal Reserve real-time interest rates
- **localStorage** — Client-side data persistence
- **Vitest** + **pytest** — JavaScript and Python testing

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- A free FRED API key from [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html)

### Installation
```bash
git clone https://github.com/yourusername/BudgetProj.git
cd BudgetProj
npm install
pip install pytest black flake8
```

### Environment Variables
Create a `.env` file in the project root

See `.env.example` for reference. Never commit your `.env` file.

### Start Development Server
```bash
npm run dev
```

## Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run JavaScript tests
npm run lint         # Lint JavaScript
pytest tests/python/ # Run Python tests
black src/python/    # Format Python code
```

## Deployment (GitHub Pages)
Deployed via GitHub Pages. Run `npm run build` to generate the production bundle in `dist/`.
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_FRED_API_KEY` | FRED API key from stlouisfed.org | Yes |

## License
MIT