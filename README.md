# Gaurav Khanchandani — Spatial Portfolio

An interactive, data-driven 3D personal portfolio built with React, TypeScript, Vite, Three.js, React Three Fiber, Drei, Tailwind CSS, and Lucide.

## What it is

The home page is a procedural mathematical studio, not a standard scrolling résumé. Its workbench, trophy, photo wall, art wing, lighting, and geometric avatar are created in code, without downloaded 3D models.

- Focus the room by clicking it or tabbing to it, then walk with WASD or the arrow keys. Click outside the room to return to normal page navigation.
- Open sections from the glowing thresholds, labeled room objects, or the floating dock.
- Visit the art wing to play Prism Relay and collect eight moving prisms.
- Use the guided tour for a clear first-time visitor journey.
- On phones, the 3D room becomes a touch-friendly 2D isometric floor plan with the same portfolio sections.

## The single source of truth

Before you publish, edit only:

```text
src/data/portfolioData.ts
```

This powers your name, bio, contact details, achievements, projects, technologies, external links, images, gallery captions, future note, section cards, and modal content.

### Add a published project

Copy an object in `portfolioData.projects`, give it a unique `id`, then update `title`, `category`, `status`, `summary`, `technologies`, and (when available) `githubUrl` or `liveUrl`. Set `isPlaceholder: false` only when it is genuinely ready to show.

### Add an achievement

Copy one object in `portfolioData.achievements`. Use exact wording and only verified information. The cards are automatically rendered without changing UI code.

### Add paintings and personal photos

The 3D room has reserved displays in the connected **art wing** and at the **photo wall**. Actual image files appear in the Gallery panel.

1. Put paintings in `public/gallery/` and add them to `portfolioData.gallery`.
2. Put personal photos in `public/photos/` and add them to `portfolioData.photos`.
3. Each entry becomes a captioned image in the Gallery panel. Use this object shape for either collection:

```ts
{
  id: "penrose-study-01",
  src: "./gallery/penrose-study-01.jpg",
  alt: "A geometric Penrose tiling study",
  caption: "Penrose study · 2026"
}
```

For a personal photo, use `src: "./photos/name.jpg"` and add it to `portfolioData.photos` instead. The empty frames in the 3D studio are intentionally labelled until you add real work.

### Add profile details

Fill `email`, `resumeUrl`, and `socials` inside `portfolioData.person`. Empty strings/arrays intentionally show safe “add before publishing” messages rather than false links.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The Vite base is `./`, so static assets work correctly when deployed to a GitHub Pages project repository.

## Deploy to GitHub Pages

1. Create a GitHub repository and push this project to its `main` branch.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. The included workflow at `.github/workflows/deploy.yml` builds and deploys the site on every push to `main`.

## Contents still intentionally awaiting your input

- Your final profile/philosophy wording
- GitHub, LinkedIn, email, and résumé URL
- Real project descriptions, links, and technologies
- Genuine artwork or photographs for the archive

Until those are filled, the UI labels them clearly as placeholders instead of making claims on your behalf.
