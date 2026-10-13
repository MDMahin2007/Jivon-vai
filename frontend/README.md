# Arcforma Studio — Frontend

The public portfolio website built with React and Vite. It contains the home page, project and service listings, project details, a visual gallery, and the contact form.

**Live website:** [https://jivon-vai-five.vercel.app](https://jivon-vai-five.vercel.app)  
**Backend API:** [https://arcforma-studio.onrender.com](https://arcforma-studio.onrender.com)

## Stack

- React 18 and React DOM
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- React Icons

## Requirements

- Node.js 20.19 or newer
- npm

## Local development

From the repository root:

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

The development server normally runs at `http://localhost:5173`.

The frontend defaults to the deployed API at `https://arcforma-studio.onrender.com/api`. To use a local backend, create `frontend/.env` (based on [`.env.example`](./.env.example)):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Vite reads `VITE_*` variables when it starts or builds the app. Restart the development server after editing the environment file. Never put database credentials, email-provider keys, or other secrets in this file; frontend variables are included in the browser bundle.

## Scripts

Run from `frontend/` or use `npm --prefix frontend` from the repository root.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create the production site in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run optimize:media` | Regenerate optimized images and videos from the local original-media archive |

Check the complete site from the repository root:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
```

## Content and media

- Portfolio content and project-specific galleries are maintained in `src/data/projects.js`.
- Public, deployable media is in `public/projects/`; project references should point to files in that directory.
- Images are distributed as WebP, and project walkthroughs are optimized MP4 files. Gallery imagery is lazy-loaded; project videos do not all download in full when a page opens.
- Original source media may be kept locally at `media-originals/projects/`. That directory is ignored by Git so the large originals are not added to the source repository or public build.
- To regenerate deployment assets, keep source files in `media-originals/projects/` and run:

  ```bash
  npm --prefix frontend run optimize:media
  ```

  The script requires the frontend development dependencies to be installed. Review generated files and confirm referenced assets exist before deploying.

## Deployment

The frontend is deployed on Vercel. Set this build-time environment variable in the Vercel project:

```env
VITE_API_BASE_URL=https://arcforma-studio.onrender.com/api
```

Redeploy after changing the API URL or frontend source. The Vercel configuration serves the React app for client-side routes such as `/projects` and `/project/:id`.

For API configuration, MongoDB, email delivery, and backend deployment, see [backend/README.md](../backend/README.md). For the full project overview and production checklist, see the [root README](../README.md).
