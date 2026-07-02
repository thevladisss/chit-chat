## Getting Started
-   `npm install` - Install dependencies

-   `npm run dev` - Starts a dev server at http://localhost:5173/

-   `npm run build` - Builds for production, emitting to `dist/`

-   `npm run preview` - Starts a server at http://localhost:4173/ to test production build locally

## Verification Pipeline

Before committing, run the following checks:

```bash
npm run lint
npm run type-check
npm run test:unit
npm run build
```
