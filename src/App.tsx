import { Component, lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { Footprints, Info, Sparkles } from "lucide-react";
import { MobileStudioMap, PortfolioModal, SiteHeader, StudioDock } from "./components/Overlay";
import { portfolioData } from "./data/portfolioData";

// The WebGL engine stays out of the initial/mobile bundle.
const PortfolioScene = lazy(() => import("./components/PortfolioScene").then((module) => ({ default: module.PortfolioScene })));

export type ModalName = "milestones" | "explorations" | "gallery" | "profile" | null;
export type Quality = "standard" | "high";
export type Theme = "light" | "dark";

const tour: Exclude<ModalName, null>[] = ["milestones", "explorations", "gallery", "profile"];

class WebGLBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function WebGLFallback({ activeSection, onOpen }: { activeSection: ModalName; onOpen: (section: Exclude<ModalName, null>) => void }) {
  return (
    <div className="scene-webgl-fallback">
      <div className="webgl-fallback-message">
        <p className="eyebrow"><Sparkles size={13} aria-hidden="true" /> 3D VIEWER PAUSED</p>
        <h2>The studio is still open.</h2>
        <p>Your browser could not start the 3D view right now. Use the interactive map to explore every room.</p>
      </div>
      <MobileStudioMap activeSection={activeSection} onOpen={onOpen} />
    </div>
  );
}

function useCompactLayout() {
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 760px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return compact;
}

export default function App() {
  const compact = useCompactLayout();
  const [modal, setModal] = useState<ModalName>(null);
  const [motionEnabled, setMotionEnabled] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [quality, setQuality] = useState<Quality>("high");
  const [theme, setTheme] = useState<Theme>(() => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const activeSection = useMemo(() => (tourIndex === null ? modal : tour[tourIndex]), [modal, tourIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModal(null);
        setTourIndex(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const startTour = () => {
    setTourIndex(0);
    setModal(tour[0]);
  };

  const enterStudio = () => {
    document.getElementById("walkthrough")?.scrollIntoView({ behavior: motionEnabled ? "smooth" : "auto", block: "start" });
  };

  const nextTourStep = () => {
    if (tourIndex === null) return;
    const next = tourIndex + 1;
    if (next >= tour.length) {
      setModal(null);
      setTourIndex(null);
      return;
    }
    setTourIndex(next);
    setModal(tour[next]);
  };

  const openSection = (section: Exclude<ModalName, null>) => {
    setTourIndex(null);
    setModal(section);
  };

  return (
    <div className="app-shell min-h-screen overflow-x-hidden bg-canvas text-plum" data-theme={theme}>
      <a className="skip-link" href="#studio-navigation">Skip the 3D room and open section navigation</a>
      <SiteHeader
        person={portfolioData.person}
        motionEnabled={motionEnabled}
        quality={quality}
        theme={theme}
        onMotionToggle={() => setMotionEnabled((value) => !value)}
        onQualityToggle={() => setQuality((value) => (value === "high" ? "standard" : "high"))}
        onThemeToggle={() => setTheme((value) => value === "light" ? "dark" : "light")}
        onOpenProfile={() => openSection("profile")}
      />

      <main id="portfolio-content">
        <section className="arrival" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={13} aria-hidden="true" /> PERSONAL ATELIER · 01</p>
            <h1 id="hero-title">{portfolioData.person.name}</h1>
            <p className="hero-degree">{portfolioData.person.degree}</p>
            <p className="hero-title">{portfolioData.person.shortTitle}</p>
            <div className="hero-actions">
              <button className="primary-action" type="button" onClick={enterStudio}>
                Enter the studio <span aria-hidden="true">↓</span>
              </button>
              <p className="scene-instruction"><Footprints size={13} aria-hidden="true" /> Enter the room, click its floor, then walk with <strong>WASD</strong> or arrow keys.</p>
            </div>
            <div className="hero-signature" aria-label="Portfolio themes">
              <span>MATHEMATICS</span>
              <i aria-hidden="true"></i>
              <span>ART</span>
              <i aria-hidden="true"></i>
              <span>MAKING</span>
            </div>
          </div>
          <figure className="arrival-portrait">
            <img
              src={portfolioData.person.portraitSrc}
              alt="Portrait of Gaurav Khanchandani"
              decoding="async"
              fetchPriority="high"
            />
            <figcaption><span>GK</span> · Studies in progress</figcaption>
          </figure>
          <div className="arrival-index" aria-hidden="true"><span>01</span><b>2026</b></div>
          <div className="arrival-map" aria-hidden="true"><span>01</span><i></i><span>04</span></div>
        </section>

        <section id="walkthrough" className="walkthrough" aria-label="Walkable portfolio studio">
          <div className="walkthrough-title">
            <p className="eyebrow"><Footprints size={13} aria-hidden="true" /> THE ATELIER · EXPLORE BY OBJECT</p>
            <button type="button" onClick={startTour}>Take a guided route <span aria-hidden="true">↗</span></button>
          </div>
          {compact ? (
            <MobileStudioMap activeSection={activeSection} onOpen={openSection} />
          ) : (
            <WebGLBoundary
              onFailure={() => setWebglUnavailable(true)}
              fallback={<WebGLFallback activeSection={activeSection} onOpen={openSection} />}
            >
              <Suspense fallback={<div className="scene-loading" aria-live="polite">Opening the studio…</div>}>
                <PortfolioScene
                  activeSection={activeSection}
                  motionEnabled={motionEnabled}
                  quality={quality}
                  theme={theme}
                  onOpen={openSection}
                />
              </Suspense>
            </WebGLBoundary>
          )}

          <aside className="scene-note" aria-label="How to explore the room">
            <Info size={15} aria-hidden="true" />
            <span id="scene-controls">{webglUnavailable ? "The 3D view is unavailable in this browser, but every room is available from the studio map." : "Click or tab into the room to walk with WASD or arrow keys. Click outside the room to return to page scrolling."}</span>
          </aside>

          <StudioDock activeSection={modal} onOpen={openSection} />
        </section>
      </main>

      <PortfolioModal
        section={modal}
        tourIndex={tourIndex}
        tourLength={tour.length}
        onClose={() => { setModal(null); setTourIndex(null); }}
        onNextTourStep={nextTourStep}
      />
    </div>
  );
}
