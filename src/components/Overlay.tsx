import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, CircleUserRound, Compass, Footprints, Image, LayoutGrid, Mail, Maximize2, Moon, MoonStar, Sparkles, Sun, X, Zap } from "lucide-react";
import type { ModalName, Quality, Theme } from "../App";
import { portfolioData } from "../data/portfolioData";

type Section = Exclude<ModalName, null>;

const dockItems: Array<{ id: Section; number: string; label: string; icon: typeof Sparkles }> = [
  { id: "milestones", number: "01", label: "Milestones", icon: Sparkles },
  { id: "explorations", number: "02", label: "Projects", icon: Compass },
  { id: "gallery", number: "03", label: "Gallery", icon: Image },
  { id: "profile", number: "04", label: "Profile", icon: CircleUserRound }
];

type HeaderProps = {
  person: typeof portfolioData.person;
  motionEnabled: boolean;
  quality: Quality;
  theme: Theme;
  onMotionToggle: () => void;
  onQualityToggle: () => void;
  onThemeToggle: () => void;
  onOpenProfile: () => void;
};

export function SiteHeader({ person, motionEnabled, quality, theme, onMotionToggle, onQualityToggle, onThemeToggle, onOpenProfile }: HeaderProps) {
  return (
    <header className="site-header">
      <button className="brand-button" type="button" onClick={onOpenProfile} aria-label="Open Gaurav's profile">
        <span className="brand-mark">{person.monogram}</span>
        <span className="brand-name">{person.name}</span>
      </button>
      <div className="header-meta">
        <span className="degree-label">{person.degree}</span>
        <button className="control-button" type="button" onClick={onMotionToggle} aria-pressed={motionEnabled} title={motionEnabled ? "Pause walking and room motion" : "Enable walking and room motion"}>
          <Footprints size={14} aria-hidden="true" />
          <span>{motionEnabled ? "Motion" : "Still"}</span>
        </button>
        <button className="control-button theme-toggle" type="button" onClick={onThemeToggle} aria-pressed={theme === "dark"} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
          {theme === "light" ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
          <span>{theme === "light" ? "Dark" : "Light"}</span>
        </button>
        <button className="control-button desktop-control" type="button" onClick={onQualityToggle} title="Toggle render quality">
          <Zap size={14} aria-hidden="true" />
          <span>{quality === "high" ? "Crisp" : "Lite"}</span>
        </button>
      </div>
    </header>
  );
}

export function StudioDock({ activeSection, onOpen }: { activeSection: ModalName; onOpen: (section: Section) => void }) {
  return (
    <nav id="studio-navigation" className="studio-dock" aria-label="Portfolio sections" tabIndex={-1}>
      {dockItems.map(({ id, number, label, icon: Icon }) => (
        <button key={id} type="button" className={activeSection === id ? "dock-item is-active" : "dock-item"} onClick={() => onOpen(id)}>
          <span className="dock-number">{number}</span>
          <span className="dock-icon"><Icon size={15} aria-hidden="true" /></span>
          <span className="dock-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}

export function MobileStudioMap({ activeSection, onOpen }: { activeSection: ModalName; onOpen: (section: Section) => void }) {
  return (
    <section className="mobile-studio" aria-label="Interactive studio map">
      <div className="mobile-studio-caption"><LayoutGrid size={14} aria-hidden="true" /> <span>2D studio map · touch a threshold to enter</span></div>
      <div className="mobile-room-map">
        <span className="map-path map-path-one" aria-hidden="true"></span>
        <span className="map-path map-path-two" aria-hidden="true"></span>
        <button type="button" className={`map-zone zone-board ${activeSection === "milestones" ? "is-active" : ""}`} onClick={() => onOpen("milestones")}>01<br /><span>Milestones</span></button>
        <button type="button" className={`map-zone zone-gallery ${activeSection === "gallery" ? "is-active" : ""}`} onClick={() => onOpen("gallery")}>03<br /><span>Art wing</span></button>
        <button type="button" className={`map-zone zone-desk ${activeSection === "explorations" ? "is-active" : ""}`} onClick={() => onOpen("explorations")}>02<br /><span>Workbench</span></button>
        <button type="button" className={`map-zone zone-rug ${activeSection === "profile" ? "is-active" : ""}`} onClick={() => onOpen("profile")}>04<br /><span>Profile</span></button>
        <span className="map-avatar" aria-hidden="true"><i></i><b></b></span>
      </div>
      <p className="mobile-studio-footer"><span></span> Choose any room — nothing is locked.</p>
    </section>
  );
}

function SectionHeading({ eyebrow, title, detail, titleId }: { eyebrow: string; title: string; detail: string; titleId: string }) {
  return (
    <div className="modal-heading">
      <p className="eyebrow"><span className="glow-dot"></span>{eyebrow}</p>
      <h2 id={titleId}>{title}</h2>
      <p>{detail}</p>
    </div>
  );
}

function Milestones({ titleId }: { titleId: string }) {
  return (
    <>
      <SectionHeading titleId={titleId} eyebrow="01 · VERIFIED MILESTONES" title="The coordinates so far." detail="These are kept precise: achievements are separate from current study and future work." />
      <div className="achievement-list">
        {portfolioData.achievements.map((achievement, index) => (
          <article className={`achievement-card ${achievement.type === "current" ? "current-card" : ""}`} key={achievement.id}>
            <span className="achievement-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <p className="card-label">{achievement.label}</p>
            <div className="achievement-metric">{achievement.metric}</div>
            {achievement.supportingMetric && <p className="supporting-metric">{achievement.supportingMetric}</p>}
            <h3>{achievement.title}</h3>
            <p>{achievement.detail}</p>
          </article>
        ))}
      </div>
      <p className="data-tip"><BookOpen size={15} aria-hidden="true" /> Every result is shown with its context; current study sits apart from achievements.</p>
    </>
  );
}

function MiniMathLab() {
  const [mode, setMode] = useState(3);
  const sample = Array.from({ length: 80 }, (_, index) => {
    const x = index / 79;
    const y = 0.5 - Math.sin(x * Math.PI * mode) * 0.34;
    return `${(x * 320).toFixed(2)},${(y * 120).toFixed(2)}`;
  }).join(" ");
  return (
    <section className="math-lab" aria-labelledby="math-lab-title">
      <div>
        <p className="card-label">INTERACTIVE MATH CORNER</p>
        <h3 id="math-lab-title">Eigenmode sketch</h3>
        <p>A small visual study of a changing wave mode — a site interaction, not a claim of published research.</p>
      </div>
      <div className="wave-tool">
        <div className="wave-readout" aria-hidden="true"><span>harmonic</span><strong>{String(mode).padStart(2, "0")}</strong><span>{mode % 2 === 0 ? "even mode" : "odd mode"}</span></div>
        <svg viewBox="0 0 320 120" role="img" aria-label={`Wave mode ${mode}`}>
          <path d="M0 60H320" className="wave-axis" />
          <polyline points={sample} className="wave-line" />
        </svg>
        <label>
          mode <strong>{mode}</strong>
          <input type="range" min="1" max="7" value={mode} onChange={(event) => setMode(Number(event.target.value))} />
        </label>
      </div>
    </section>
  );
}

function Explorations({ titleId }: { titleId: string }) {
  return (
    <>
      <SectionHeading titleId={titleId} eyebrow="02 · PROJECTS" title="Projects coming soon." detail="I’m currently building original work to share here." />
      <div className="project-empty project-empty--studio" role="status">
        <div className="project-empty-status"><span></span> WORKBENCH ACTIVE</div>
        <p><strong>First collection in progress.</strong></p>
        <p>I’m currently building original work to share here. This panel will turn into project cards when the work is ready.</p>
      </div>
      <MiniMathLab />
    </>
  );
}

function Gallery({ titleId }: { titleId: string }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const archive = [
    ...portfolioData.gallery.map((image) => ({ ...image, kind: "Painting / study" })),
    ...portfolioData.photos.map((image) => ({ ...image, kind: "Personal photograph" }))
  ];
  const selected = selectedIndex === null ? null : archive[selectedIndex];
  const browse = (direction: -1 | 1) => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + direction + archive.length) % archive.length);
  };
  return (
    <>
      <SectionHeading titleId={titleId} eyebrow="03 · THE ART WING / ARCHIVE" title="A room for paintings and memory." detail="Your portrait lives in the main studio; the archive holds paintings, sketches, and visual studies." />
      {archive.length === 0 ? (
        <div className="empty-gallery">
          <Image size={32} strokeWidth={1.2} aria-hidden="true" />
          <h3>Hang the first work.</h3>
          <p>The archive is ready for original paintings, studies, and photographs. No sample images are used here.</p>
        </div>
      ) : (
        <>
          <div className="gallery-toolbar"><span>{archive.length} works in this room</span><span>select an artwork to focus</span></div>
          <div className="gallery-grid">
            {archive.map((image, index) => <button className="gallery-tile" key={`${image.kind}-${image.id}`} type="button" onClick={() => setSelectedIndex(index)} aria-label={`Open ${image.caption}`}><span className="gallery-image-wrap"><img src={image.src} alt={image.alt} loading="lazy" decoding="async" /><span className="gallery-inspect"><Maximize2 size={16} aria-hidden="true" /></span></span><span className="gallery-caption"><span>{image.kind}</span>{image.caption}</span></button>)}
          </div>
          {selected && (
            <section className="gallery-focus" aria-label={`${selected.caption} focused view`}>
              <button type="button" className="gallery-focus-close" onClick={() => setSelectedIndex(null)} aria-label="Close artwork view"><X size={18} /></button>
              <button type="button" className="gallery-focus-nav gallery-focus-prev" onClick={() => browse(-1)} aria-label="Previous artwork"><ChevronLeft size={21} /></button>
              <figure><img src={selected.src} alt={selected.alt} /><figcaption><span>{selected.kind} · {String((selectedIndex ?? 0) + 1).padStart(2, "0")} / {String(archive.length).padStart(2, "0")}</span><strong>{selected.caption}</strong></figcaption></figure>
              <button type="button" className="gallery-focus-nav gallery-focus-next" onClick={() => browse(1)} aria-label="Next artwork"><ChevronRight size={21} /></button>
            </section>
          )}
        </>
      )}
    </>
  );
}

function Profile({ titleId }: { titleId: string }) {
  const { person, futureNote } = portfolioData;
  return (
    <>
      <SectionHeading titleId={titleId} eyebrow="04 · PROFILE" title="Rigor, curiosity, and a willingness to build." detail="A short introduction to my current studies, interests, and public links." />
      <div className="profile-grid">
        <section className="profile-statement">
          <p className="card-label">WORKING PHILOSOPHY</p>
          <div className="profile-identity"><img src={person.portraitSrc} alt="Gaurav Khanchandani" /><div><strong>{person.name}</strong><span>field notes / ongoing</span></div></div>
          <blockquote>“{person.philosophy}”</blockquote>
          <p className="profile-location">{person.locationLabel} · {person.degree}</p>
        </section>
        <section className="profile-links">
          <p className="card-label">CONNECT / DOCUMENTS</p>
          {person.email ? <a className="profile-link-row" href={`mailto:${person.email}`}><Mail size={15} /><span><small>EMAIL</small>{person.email}</span><ArrowUpRight size={14} /></a> : <p className="muted-line">Email details aren’t available yet.</p>}
          {person.resumeUrl ? <a className="profile-link-row" href={person.resumeUrl} target="_blank" rel="noreferrer"><BookOpen size={15} /><span><small>DOCUMENT</small>Download résumé</span><ArrowUpRight size={14} /></a> : <p className="muted-line">Résumé link isn’t available yet.</p>}
          {person.socials.length > 0 ? person.socials.map((social) => <a className="profile-link-row" key={social.label} href={social.url} target="_blank" rel="noreferrer"><ArrowUpRight size={15} /><span><small>SOCIAL</small>{social.label}</span><ArrowUpRight size={14} /></a>) : <p className="muted-line">Public links aren’t available yet.</p>}
        </section>
      </div>
      <section className="future-note"><MoonStar size={17} aria-hidden="true" /><div><p className="card-label">WHAT CHANGES NEXT</p><p>{futureNote}</p></div></section>
    </>
  );
}

export function PortfolioModal({ section, tourIndex, tourLength, onClose, onNextTourStep }: { section: ModalName; tourIndex: number | null; tourLength: number; onClose: () => void; onNextTourStep: () => void }) {
  const modalRef = useRef<HTMLElement>(null);
  const previousSection = useRef<ModalName>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const titleId = section ? `modal-${section}` : "";

  useEffect(() => {
    if (!previousSection.current && section) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      modalRef.current?.querySelector<HTMLElement>(".modal-close")?.focus({ preventScroll: true });
    } else if (previousSection.current && !section) {
      if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
      returnFocus.current = null;
    } else if (section) {
      modalRef.current?.querySelector<HTMLElement>(".modal-close")?.focus({ preventScroll: true });
    }
    previousSection.current = section;
  }, [section]);

  useEffect(() => {
    if (!section) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) {
        event.preventDefault();
        modal.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!modal.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [section]);

  if (!section) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={modalRef} className="portfolio-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close panel"><X size={18} /></button>
        {section === "milestones" && <Milestones titleId={titleId} />}
        {section === "explorations" && <Explorations titleId={titleId} />}
        {section === "gallery" && <Gallery titleId={titleId} />}
        {section === "profile" && <Profile titleId={titleId} />}
        {tourIndex !== null && (
          <div className="tour-footer">
            <span>Guided tour · {tourIndex + 1}/{tourLength}</span>
            <button type="button" onClick={onNextTourStep}>{tourIndex + 1 === tourLength ? "Finish tour" : "Next room"} <ArrowUpRight size={15} /></button>
          </div>
        )}
      </section>
    </div>
  );
}
