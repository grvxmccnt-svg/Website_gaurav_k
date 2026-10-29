# Full site map — Gaurav’s 3D spatial portfolio

## 1. First impression: the mathematical studio

Visitors land in a warm, isometric pistachio-and-plum study. The scene has procedural geometry for every element:

- A geometric low-poly avatar with an amber visor and a glowing floor marker
- A central rug, the avatar’s landing area and the entry point to the profile
- A desk with two monitors, keyboard, lamp, and warm point light for explorations
- A chalkboard with verified milestone formulas and metrics
- A framed gallery wall, reserved for real personal work
- An amber / sage / deep-plum room palette and soft shadows

The environment uses no downloaded 3D models. That keeps deployment fast and avoids broken asset URLs.

## 2. Walking and room controls

On desktop, visitors focus the room by clicking it or tabbing to its region. WASD or the arrow keys move the avatar through the connected spaces, while dragging rotates the camera. Movement keys only control the room while it has focus, so the arrow keys continue to work for normal page navigation elsewhere. Clicking a labeled threshold or room object opens its section directly.

## 3. Navigation that does not depend on 3D

The room has three floating thresholds, several labeled room objects, and a four-item glass dock at the bottom:

| Zone | Physical room object | Content opened |
| --- | --- | --- |
| 01 | Chalkboard | Verified achievements and current academic chapter |
| 02 | Desk / monitors | Dynamic project catalogue and maths interaction |
| 03 | Gallery frames | Artwork/photo archive |
| 04 | Rug / entry space | Profile, contact details, résumé, and future direction |

The guided tour follows those zones in order. It is optional and ends normally after the profile rather than trapping the visitor in a sequence.

## 4. Achievements & milestones panel

This section reads every card from `portfolioData.achievements`. It contains only the supplied, verified facts:

- ISI B.Math Entrance — AIR 32 and EWS Rank 3
- Mathematical Olympiad — within 7 marks of INMO qualification after 1–2 weeks of preparation in a highly competitive region
- Freshie Quantathon — 2nd Place
- IIT Madras — first-year BS Mathematics undergraduate

Future entries take one data object; the layout does not need editing. Current study is visually separated from achievement cards.

## 5. Explorations & projects panel

The project library is filterable by four categories:

- Mathematics & Algorithms
- Systems & Code Experiments
- Cybersecurity Learning
- Artwork & Creative Media

Each project supports: title, category, status, placeholder flag, summary, technologies, notes, GitHub URL, and live URL. A project card never creates a dead link. Until you add a URL, it says that links appear when published.

The starter catalogue uses carefully labelled concepts, not fake completed projects. They are editable placeholders for a research direction, grapple physics experiment, cryptography learning log, and generative artwork.

This panel also contains a live “eigenmode sketch,” whose slider changes a wave visual in real time. In the art wing, visitors can play Prism Relay and collect eight moving prisms. Both are site interactions, not claims of published research.

## 6. Gallery panel

The archive is intentionally empty until you add real images. There are no stock portraits or invented project images. Adding a file to `public/gallery/` or `public/photos/` plus a matching data entry creates a captioned Gallery card. The 3D display walls remain decorative landmarks.

## 7. Profile panel

The profile uses editable data fields for:

- Working philosophy / bio
- Location label and degree
- Email
- Résumé link
- GitHub, LinkedIn, and other social links
- A future-facing note

Empty items display a clear private placeholder so you can fill them before launch.

## 8. Device, accessibility, and performance behavior

- Desktop: WebGL 3D scene with camera orbit, focused keyboard walking, room thresholds, Prism Relay, guided tour, and dock.
- Mobile: a purpose-built 2D room map with the same zones and panels; no unusable tiny 3D scene.
- Reduced motion: motion is disabled by default when the visitor’s operating system requests it; the header exposes a manual motion toggle.
- Quality control: visitors can choose high or lite rendering quality, changing canvas pixel density and antialiasing.
- Keyboard: dock/pin/modal controls are regular buttons; Escape closes active panels; a skip link bypasses the scene.

## 9. Technical structure

```text
src/
├── data/portfolioData.ts     # all editable content
├── components/
│   ├── PortfolioScene.tsx    # 3D room, avatar, grappling, pins
│   └── Overlay.tsx           # header, dock, mobile map, all panels
├── App.tsx                   # tour, motion, quality, modal state
├── index.css                 # palette and responsive visuals
└── main.tsx                  # React entry point
```

The Vite config uses a relative base path and the included GitHub Actions workflow builds and deploys static files to GitHub Pages.
