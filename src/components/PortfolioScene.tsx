import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, Html, Line, OrbitControls, RoundedBox, Sparkles, Text, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type ComponentRef, type RefObject } from "react";
import * as THREE from "three";
import type { Group } from "three";
import type { ModalName, Quality, Theme } from "../App";
import { portfolioData } from "../data/portfolioData";

type Section = Exclude<ModalName, null>;

type Palette = {
  background: string;
  floor: string;
  wall: string;
  wallDeep: string;
  ink: string;
  muted: string;
  line: string;
  light: string;
  accent: string;
  gallery: string;
  project: string;
  profile: string;
};

const palettes: Record<Theme, Palette> = {
  light: { background: "#e8eee9", floor: "#d4dfd7", wall: "#f2f4ef", wallDeep: "#bdccbf", ink: "#27332c", muted: "#52665a", line: "#9bad9e", light: "#fff3cf", accent: "#f4b44c", gallery: "#8d77d0", project: "#5e9b89", profile: "#d46a73" },
  dark: { background: "#0c1411", floor: "#142019", wall: "#1a2a21", wallDeep: "#263b2f", ink: "#ecf5ed", muted: "#adc4b3", line: "#3a5747", light: "#f4dda5", accent: "#ffc45c", gallery: "#b7a7ff", project: "#78d2b7", profile: "#ff98a3" }
};

type Destination = {
  section: Section;
  number: string;
  title: string;
  subtitle: string;
  position: [number, number, number];
  color: keyof Pick<Palette, "accent" | "gallery" | "project" | "profile">;
  radius: number;
};

const destinations: Destination[] = [
  { section: "explorations", number: "02", title: "The workbench", subtitle: "projects · coming soon", position: [5.25, 0, -2.9], color: "project", radius: 1.55 },
  { section: "gallery", number: "03", title: "The art wing", subtitle: "paintings & photographs", position: [13.0, 0, 3.6], color: "gallery", radius: 1.65 }
];

type SceneProps = {
  activeSection: ModalName;
  motionEnabled: boolean;
  quality: Quality;
  theme: Theme;
  onOpen: (section: Section) => void;
};

function useWalkingKeys(enabled: boolean) {
  const keys = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled) {
      keys.current.clear();
      return;
    }
    const isWalkingKey = (key: string) => ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key.toLowerCase());
    const isInteractiveTarget = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, button, a") !== null);
    const down = (event: KeyboardEvent) => {
      if (!isWalkingKey(event.key) || isInteractiveTarget(event.target)) return;
      const key = event.key.toLowerCase();
      keys.current.add(key);
      if (key.startsWith("arrow")) event.preventDefault();
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    const clear = () => keys.current.clear();
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      keys.current.clear();
    };
  }, [enabled]);

  return keys;
}

function Walker({ playerRef, enabled, palette, onThreshold }: { playerRef: RefObject<Group>; enabled: boolean; palette: Palette; onThreshold: (section: Section) => void }) {
  const keys = useWalkingKeys(enabled);
  const entered = useRef<Section | null>(null);
  const velocity = useMemo(() => new THREE.Vector3(), []);
  const moveDirection = useMemo(() => new THREE.Vector3(), []);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const side = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const player = playerRef.current;
    if (!player) return;

    const pressed = keys.current;
    const horizontal = (pressed.has("d") || pressed.has("arrowright") ? 1 : 0) - (pressed.has("a") || pressed.has("arrowleft") ? 1 : 0);
    const vertical = (pressed.has("w") || pressed.has("arrowup") ? 1 : 0) - (pressed.has("s") || pressed.has("arrowdown") ? 1 : 0);

    if (enabled && (horizontal || vertical)) {
      state.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      side.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
      moveDirection.copy(forward).multiplyScalar(vertical).addScaledVector(side, horizontal).normalize();
      velocity.lerp(moveDirection.multiplyScalar(4.1), Math.min(1, delta * 8));
      player.position.addScaledVector(velocity, delta);
      player.position.x = THREE.MathUtils.clamp(player.position.x, -7.55, 26.55);
      player.position.z = THREE.MathUtils.clamp(player.position.z, -6.35, 6.7);
      player.rotation.y = THREE.MathUtils.damp(player.rotation.y, Math.atan2(velocity.x, velocity.z), 10, delta);
    } else {
      velocity.multiplyScalar(Math.max(0, 1 - delta * 8));
    }

    player.position.y = 0.28 + Math.sin(state.clock.elapsedTime * 3.1) * 0.025;
    if (!enabled) return;
    const current = destinations.find((destination) => {
      const dx = player.position.x - destination.position[0];
      const dz = player.position.z - destination.position[2];
      return Math.hypot(dx, dz) < destination.radius;
    });

    if (current && entered.current !== current.section) {
      entered.current = current.section;
      onThreshold(current.section);
    } else if (!current) {
      entered.current = null;
    }
  });

  return (
    <group ref={playerRef} position={[0, 0.28, 5.9]}>
      <mesh castShadow position={[0, 0.42, 0]}>
        <capsuleGeometry args={[0.25, 0.56, 6, 12]} />
        <meshStandardMaterial color={palette.ink} roughness={0.38} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[0, 0.97, 0]}>
        <sphereGeometry args={[0.28, 18, 18]} />
        <meshStandardMaterial color={palette.wall} roughness={0.42} />
      </mesh>
      <mesh position={[0.1, 0.98, 0.245]}>
        <circleGeometry args={[0.075, 20]} />
        <meshBasicMaterial color={palette.accent} />
      </mesh>
      <pointLight color={palette.accent} intensity={enabled ? 1.05 : 0.35} distance={3.4} position={[0, 1.35, 0.15]} />
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.37, 32]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.68} />
      </mesh>
    </group>
  );
}

function CameraController({ player }: { player: RefObject<Group> }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const lastPosition = useRef(new THREE.Vector3());
  const movement = useMemo(() => new THREE.Vector3(), []);
  const focus = useMemo(() => new THREE.Vector3(), []);
  const ready = useRef(false);

  useFrame((state) => {
    const avatar = player.current;
    const orbit = controls.current;
    if (!avatar || !orbit) return;

    focus.copy(avatar.position).add(new THREE.Vector3(0, 1.2, 0));
    if (!ready.current) {
      lastPosition.current.copy(avatar.position);
      orbit.target.copy(focus);
      state.camera.lookAt(focus);
      orbit.update();
      ready.current = true;
      return;
    }

    movement.copy(avatar.position).sub(lastPosition.current);
    if (movement.lengthSq() > 0) {
      state.camera.position.add(movement);
      orbit.target.add(movement);
      lastPosition.current.copy(avatar.position);
    }
    orbit.update();
  });

  return <OrbitControls ref={controls} enablePan={false} enableZoom={false} enableDamping dampingFactor={0.08} minPolarAngle={0.38} maxPolarAngle={1.48} rotateSpeed={0.64} />;
}

function Column({ position, palette, height = 4.1 }: { position: [number, number, number]; palette: Palette; height?: number }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.19, 0.26, height, 12]} />
        <meshStandardMaterial color={palette.wallDeep} roughness={0.74} />
      </mesh>
      <mesh castShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.16, 12]} />
        <meshStandardMaterial color={palette.wall} roughness={0.86} />
      </mesh>
      <mesh castShadow position={[0, height - 0.06, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.16, 12]} />
        <meshStandardMaterial color={palette.wall} roughness={0.86} />
      </mesh>
    </group>
  );
}

function Threshold({ destination, palette, active, motionEnabled, onOpen }: { destination: Destination; palette: Palette; active: boolean; motionEnabled: boolean; onOpen: (section: Section) => void }) {
  const color = palette[destination.color];
  const [x, , z] = destination.position;
  return (
    <group position={[x, 0.03, z]}>
      <Float speed={motionEnabled ? 1.15 : 0} floatIntensity={motionEnabled ? 0.1 : 0} rotationIntensity={0}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.02, 1.11, 56]} />
          <meshBasicMaterial color={color} transparent opacity={active ? 1 : 0.62} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <circleGeometry args={[0.98, 56]} />
          <meshBasicMaterial color={color} transparent opacity={active ? 0.16 : 0.085} />
        </mesh>
      </Float>
      <pointLight color={color} intensity={active ? 2.3 : 1.1} distance={4.4} position={[0, 1.25, 0]} />
      <Text position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.16} color={color} anchorX="center" letterSpacing={0.12}>{destination.number}</Text>
      <Html center position={[0, 0.42, 0]} distanceFactor={10} style={{ pointerEvents: "auto" }}>
        <button className={`threshold-card ${active ? "threshold-card-active" : ""}`} type="button" onClick={() => onOpen(destination.section)}>
          <span>{destination.title}</span>
          <small>{destination.subtitle} · enter ↗</small>
        </button>
      </Html>
    </group>
  );
}

function LibraryBook({ position, width, height, color, palette, lean = 0 }: { position: [number, number, number]; width: number; height: number; color: string; palette: Palette; lean?: number }) {
  return (
    <group position={position} rotation={[0, 0, lean]}>
      <RoundedBox args={[width, height, 0.2]} radius={0.025} smoothness={3} castShadow>
        <meshStandardMaterial color={color} roughness={0.43} metalness={0.08} />
      </RoundedBox>
      <mesh position={[0, 0, 0.106]}>
        <planeGeometry args={[Math.max(.06, width - .07), Math.max(.12, height - .12)]} />
        <meshBasicMaterial color={palette.light} transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, height * .28, 0.112]}>
        <planeGeometry args={[Math.max(.05, width - .09), 0.012]} />
        <meshBasicMaterial color={palette.light} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, -height * .28, 0.112]}>
        <planeGeometry args={[Math.max(.05, width - .09), 0.012]} />
        <meshBasicMaterial color={palette.light} transparent opacity={0.38} />
      </mesh>
    </group>
  );
}

function Library({ palette }: { palette: Palette }) {
  const bookColors = [palette.project, palette.gallery, palette.profile, palette.accent, palette.ink, palette.wallDeep];
  const shelves = [0.46, 1.47, 2.48];
  return (
    <group position={[-7.42, 0, 0.8]} rotation={[0, Math.PI / 2, 0]}>
      <RoundedBox args={[3.92, 3.72, 0.34]} radius={0.12} smoothness={4} position={[0, 1.86, -0.06]} castShadow>
        <meshStandardMaterial color={palette.wallDeep} roughness={0.52} metalness={0.08} />
      </RoundedBox>
      <RoundedBox args={[3.62, 3.42, 0.11]} radius={0.04} smoothness={3} position={[0, 1.86, 0.15]}>
        <meshStandardMaterial color={palette.ink} roughness={0.72} />
      </RoundedBox>
      {[-1.73, 1.73].map((x) => <RoundedBox key={x} args={[0.16, 3.58, 0.3]} radius={0.04} smoothness={3} position={[x, 1.79, 0.21]} castShadow><meshStandardMaterial color={palette.wallDeep} roughness={0.4} metalness={0.18} /></RoundedBox>)}
      <RoundedBox args={[3.62, 0.15, 0.34]} radius={0.035} smoothness={3} position={[0, 3.55, 0.21]} castShadow><meshStandardMaterial color={palette.wallDeep} roughness={0.4} metalness={0.2} /></RoundedBox>
      {shelves.map((height) => (
        <group key={height}>
          <RoundedBox args={[3.46, 0.1, 0.38]} radius={0.025} smoothness={2} position={[0, height, 0.24]} castShadow><meshStandardMaterial color={palette.light} roughness={0.32} metalness={0.4} /></RoundedBox>
          <mesh position={[0, height + 0.058, 0.45]}><boxGeometry args={[3.28, 0.014, 0.03]} /><meshBasicMaterial color={palette.accent} transparent opacity={0.42} /></mesh>
        </group>
      ))}
      {shelves.flatMap((shelf, row) => Array.from({ length: 5 }, (_, column) => {
        const width = 0.23 + ((row * 3 + column) % 3) * 0.065;
        const height = 0.48 + ((row + column * 2) % 4) * 0.075;
        const x = -1.33 + column * 0.55;
        const lean = column === 4 && row !== 1 ? (row === 0 ? 0.19 : -0.16) : 0;
        return <LibraryBook key={`${row}-${column}`} position={[x, shelf + height / 2 + 0.045, 0.43]} width={width} height={height} color={bookColors[(row * 2 + column) % bookColors.length]} palette={palette} lean={lean} />;
      }))}
      <group position={[1.12, 3.1, 0.44]} rotation={[0, 0, -0.14]}>
        <mesh castShadow><cylinderGeometry args={[0.09, 0.12, 0.42, 16]} /><meshStandardMaterial color={palette.accent} metalness={0.52} roughness={0.24} /></mesh>
        <mesh position={[0, 0.27, 0]}><coneGeometry args={[0.22, 0.34, 4]} /><meshStandardMaterial color={palette.gallery} emissive={palette.gallery} emissiveIntensity={0.1} roughness={0.34} metalness={0.2} /></mesh>
      </group>
      <Text position={[0, 3.93, 0.3]} fontSize={0.1} color={palette.light} anchorX="center" letterSpacing={0.12}>REFERENCE SHELF</Text>
    </group>
  );
}

function Workbench({ palette }: { palette: Palette }) {
  return (
    <group position={[5.2, 0, -5.55]} rotation={[0, Math.PI, 0]}>
      <RoundedBox args={[4.2, 0.16, 1.2]} radius={0.06} smoothness={3} position={[0, 1.05, 0]} castShadow><meshStandardMaterial color={palette.ink} roughness={0.48} /></RoundedBox>
      {[-1.72, 1.72].flatMap((x) => [-0.43, 0.43].map((z) => <mesh key={`${x}-${z}`} castShadow position={[x, 0.5, z]}><boxGeometry args={[0.12, 1.02, 0.12]} /><meshStandardMaterial color={palette.wallDeep} /></mesh>))}
      {[-0.84, 0.84].map((x) => <group key={x} position={[x, 1.62, -0.25]} rotation={[0.06, x > 0 ? -0.18 : 0.18, 0]}>
        <RoundedBox args={[1.26, 0.78, 0.08]} radius={0.04} smoothness={3} castShadow><meshStandardMaterial color={palette.ink} roughness={0.28} metalness={0.25} /></RoundedBox>
        <mesh position={[0, 0, 0.051]}><planeGeometry args={[1.05, 0.57]} /><meshBasicMaterial color={palette.project} transparent opacity={0.52} /></mesh>
      </group>)}
      <pointLight color={palette.project} intensity={1.45} distance={4.6} position={[0, 2.65, 0.5]} />
    </group>
  );
}

function StudyTable({ palette, onOpen }: { palette: Palette; onOpen: (section: Section) => void }) {
  return (
    <group position={[3.15, 0, 1.15]} onClick={() => onOpen("profile")}>
      <RoundedBox args={[2.55, 0.16, 1.35]} radius={0.06} smoothness={3} position={[0, 0.98, 0]} castShadow><meshStandardMaterial color={palette.ink} roughness={0.48} /></RoundedBox>
      {[-0.98, 0.98].flatMap((x) => [-0.46, 0.46].map((z) => <mesh key={`${x}-${z}`} castShadow position={[x, 0.47, z]}><boxGeometry args={[0.12, 0.94, 0.12]} /><meshStandardMaterial color={palette.wallDeep} roughness={0.7} /></mesh>))}
      <group position={[-0.18, 1.08, 0.05]} rotation={[0, -0.08, 0]}>
        <mesh rotation={[-0.2, 0.04, 0.08]} position={[-0.31, 0.055, 0]}><boxGeometry args={[0.64, 0.05, 0.78]} /><meshStandardMaterial color={palette.light} roughness={0.92} /></mesh>
        <mesh rotation={[-0.2, -0.04, -0.08]} position={[0.31, 0.055, 0]}><boxGeometry args={[0.64, 0.05, 0.78]} /><meshStandardMaterial color={palette.light} roughness={0.92} /></mesh>
        <Line points={[[-0.52, 0.09, -0.2], [-0.12, 0.09, -0.1], [-0.52, 0.09, 0.02]]} color={palette.profile} lineWidth={1.1} />
        <Line points={[[0.12, 0.09, -0.2], [0.52, 0.09, -0.1], [0.12, 0.09, 0.02]]} color={palette.profile} lineWidth={1.1} />
      </group>
      <mesh position={[0.88, 1.22, -0.18]}><cylinderGeometry args={[0.06, 0.075, 0.42, 12]} /><meshStandardMaterial color={palette.profile} metalness={0.25} roughness={0.35} /></mesh>
      <Text position={[0, 1.18, 0.88]} fontSize={0.12} color={palette.profile} anchorX="center">OPEN BOOK · PROFILE</Text>
      <Html center position={[0, 1.48, 0.93]} distanceFactor={10} style={{ pointerEvents: "auto" }}>
        <button className="object-card" type="button" onClick={() => onOpen("profile")}>Read the open book <span>about / contact ↗</span></button>
      </Html>
    </group>
  );
}

function TrophyPlinth({ palette, onOpen }: { palette: Palette; onOpen: (section: Section) => void }) {
  return (
    <group position={[-2.55, 0, 1.48]} onClick={() => onOpen("milestones")}>
      <mesh castShadow position={[0, 0.12, 0]}><cylinderGeometry args={[0.88, 0.96, 0.22, 48]} /><meshStandardMaterial color={palette.ink} roughness={0.28} metalness={0.36} /></mesh>
      <mesh castShadow position={[0, 0.28, 0]}><cylinderGeometry args={[0.74, 0.82, 0.13, 48]} /><meshStandardMaterial color={palette.light} roughness={0.22} metalness={0.68} /></mesh>
      <RoundedBox args={[1.2, 0.78, 0.9]} radius={0.12} smoothness={5} position={[0, 0.67, 0]} castShadow><meshStandardMaterial color={palette.wallDeep} roughness={0.34} metalness={0.17} /></RoundedBox>
      <RoundedBox args={[0.78, 0.2, 0.036]} radius={0.025} smoothness={2} position={[0, 0.67, 0.47]}><meshStandardMaterial color={palette.ink} roughness={0.26} metalness={0.34} /></RoundedBox>
      <Text position={[0, 0.67, 0.495]} fontSize={0.07} color={palette.accent} anchorX="center" letterSpacing={0.085}>PROOF KNOT</Text>
      <group position={[0, 1.28, 0]} rotation={[0.08, 0.35, 0]}>
        <mesh castShadow rotation={[0.25, 0.34, 0.56]} scale={[0.88, 1.18, 0.88]}>
          <torusKnotGeometry args={[0.34, 0.055, 120, 14, 2, 3]} />
          <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.16} metalness={0.78} roughness={0.16} />
        </mesh>
        <mesh rotation={[1.14, 0.4, -0.22]} scale={[0.8, 1.22, 0.8]}>
          <torusGeometry args={[0.48, 0.026, 10, 72, Math.PI * 1.5]} />
          <meshStandardMaterial color={palette.light} metalness={0.72} roughness={0.18} />
        </mesh>
        <mesh rotation={[-0.5, 0.16, 2.1]} scale={[0.74, 1.12, 0.74]}>
          <torusGeometry args={[0.42, 0.022, 10, 72, Math.PI * 1.34]} />
          <meshStandardMaterial color={palette.profile} emissive={palette.profile} emissiveIntensity={0.12} metalness={0.5} roughness={0.2} />
        </mesh>
      </group>
      <pointLight color={palette.accent} intensity={1.65} distance={4.3} position={[0, 2.15, 0.5]} />
      <Text position={[0, 0.08, 0.98]} fontSize={0.105} color={palette.accent} anchorX="center" letterSpacing={0.07}>MILESTONES / 01</Text>
      <Html center position={[0, 2.32, 0.2]} distanceFactor={10} style={{ pointerEvents: "auto" }}>
        <button className="object-card" type="button" onClick={() => onOpen("milestones")}>Inspect the proof knot <span>achievements ↗</span></button>
      </Html>
    </group>
  );
}

function PhotoWall({ palette }: { palette: Palette }) {
  return (
    <group position={[0, 0, -7.57]}>
      <RoundedBox args={[17.1, 3.25, 0.24]} radius={0.1} smoothness={4} position={[0, 2.35, 0]} castShadow><meshStandardMaterial color={palette.wallDeep} roughness={0.64} metalness={0.08} /></RoundedBox>
      <mesh position={[0, 3.83, 0.14]}>
        <boxGeometry args={[15.9, 0.024, 0.025]} />
        <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.2} />
      </mesh>
      <Text position={[-7.15, 3.56, 0.15]} fontSize={0.105} color={palette.light} anchorX="left" letterSpacing={0.12}>FIELD NOTES / GAURAV KHANCHANDANI</Text>
      <Text position={[7.15, 3.56, 0.15]} fontSize={0.095} color={palette.muted} anchorX="right" letterSpacing={0.08}>01 — ONGOING</Text>
      {portfolioData.mainRoomImages.map((image) => (
        <group key={image.id} position={[image.position.x, image.position.y, 0.13]} rotation={[0, 0, image.rotation]}>
          <ArtworkFrame frameWidth={image.frameWidth} frameHeight={image.frameHeight} palette={palette} accent={palette.project} />
          <GalleryPainting src={image.src} maxWidth={image.maxWidth} maxHeight={image.maxHeight} />
        </group>
      ))}
      <group position={[0, 2.38, 0.14]}>
        <ArtworkFrame frameWidth={2.28} frameHeight={3.05} palette={palette} accent={palette.accent} />
        <GalleryPainting src={portfolioData.person.portraitSrc} maxWidth={1.94} maxHeight={2.66} />
        <Text position={[0, -1.76, 0.19]} fontSize={0.09} color={palette.light} anchorX="center" letterSpacing={0.075}>GAURAV K. / 2026</Text>
      </group>
      {[-5.45, 0, 5.35].map((x) => <spotLight key={x} color={palette.light} intensity={1.05} distance={6} angle={0.46} penumbra={0.9} position={[x, 4.25, 2.15]} />)}
    </group>
  );
}

function GalleryDoor({ palette }: { palette: Palette }) {
  return (
    <group position={[8.62, 0, 2.7]} rotation={[0, Math.PI / 2, 0]}>
      <RoundedBox args={[0.22, 3.2, 0.22]} radius={0.07} smoothness={3} position={[-1.24, 1.6, 0]} castShadow><meshStandardMaterial color={palette.wallDeep} roughness={0.68} /></RoundedBox>
      <RoundedBox args={[0.22, 3.2, 0.22]} radius={0.07} smoothness={3} position={[1.24, 1.6, 0]} castShadow><meshStandardMaterial color={palette.wallDeep} roughness={0.68} /></RoundedBox>
      <RoundedBox args={[2.7, 0.22, 0.22]} radius={0.07} smoothness={3} position={[0, 3.15, 0]} castShadow><meshStandardMaterial color={palette.wallDeep} roughness={0.68} /></RoundedBox>
      <Text position={[0, 3.68, 0.16]} rotation={[0, 0, 0]} fontSize={0.16} color={palette.gallery} anchorX="center">TO THE ART WING →</Text>
      <pointLight color={palette.gallery} intensity={1.4} distance={4} position={[0, 2.2, 0.2]} />
    </group>
  );
}

function ArtworkFrame({ frameWidth, frameHeight, palette, accent }: { frameWidth: number; frameHeight: number; palette: Palette; accent: string }) {
  const rail = 0.08;
  const innerWidth = frameWidth - rail * 1.45;
  const innerHeight = frameHeight - rail * 1.45;
  return (
    <group>
      <RoundedBox args={[frameWidth, frameHeight, 0.13]} radius={0.055} smoothness={3} castShadow>
        <meshStandardMaterial color={palette.ink} roughness={0.3} metalness={0.32} />
      </RoundedBox>
      <RoundedBox args={[innerWidth, innerHeight, 0.026]} radius={0.025} smoothness={2} position={[0, 0, 0.073]}>
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.055} roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[frameWidth - 0.02, rail, 0.15]} radius={0.02} smoothness={2} position={[0, frameHeight / 2 - rail / 2, 0.112]} castShadow>
        <meshStandardMaterial color={palette.light} metalness={0.52} roughness={0.24} />
      </RoundedBox>
      <RoundedBox args={[frameWidth - 0.02, rail, 0.15]} radius={0.02} smoothness={2} position={[0, -frameHeight / 2 + rail / 2, 0.112]} castShadow>
        <meshStandardMaterial color={palette.light} metalness={0.52} roughness={0.24} />
      </RoundedBox>
      <RoundedBox args={[rail, frameHeight - 0.02, 0.15]} radius={0.02} smoothness={2} position={[frameWidth / 2 - rail / 2, 0, 0.112]} castShadow>
        <meshStandardMaterial color={palette.light} metalness={0.52} roughness={0.24} />
      </RoundedBox>
      <RoundedBox args={[rail, frameHeight - 0.02, 0.15]} radius={0.02} smoothness={2} position={[-frameWidth / 2 + rail / 2, 0, 0.112]} castShadow>
        <meshStandardMaterial color={palette.light} metalness={0.52} roughness={0.24} />
      </RoundedBox>
      <mesh position={[0, 0, 0.175]}>
        <planeGeometry args={[innerWidth - 0.04, innerHeight - 0.04]} />
        <meshPhysicalMaterial color={palette.light} transparent opacity={0.055} roughness={0.08} metalness={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}

function GalleryPainting({ src, maxWidth = 1.4, maxHeight = 1.22 }: { src: string; maxWidth?: number; maxHeight?: number }) {
  const texture = useTexture(src);
  const image = texture.image as HTMLImageElement;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const aspect = image.width / image.height;
  const width = Math.min(maxWidth, maxHeight * aspect);
  const height = width / aspect;
  return (
    <mesh position={[0, 0, 0.1]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function GallerySculpture({ palette }: { palette: Palette }) {
  return (
    <group position={[13.05, 0, 3.7]}>
      <mesh castShadow position={[0, 0.13, 0]}><cylinderGeometry args={[0.96, 1.08, 0.26, 48]} /><meshStandardMaterial color={palette.ink} roughness={0.28} metalness={0.34} /></mesh>
      <mesh castShadow position={[0, 0.3, 0]}><cylinderGeometry args={[0.75, 0.86, 0.1, 48]} /><meshStandardMaterial color={palette.light} roughness={0.2} metalness={0.62} /></mesh>
      <Float speed={1.25} floatIntensity={0.12} rotationIntensity={0.12}>
        <group position={[0, 1.08, 0]} rotation={[0.18, -0.28, 0.12]}>
          <mesh scale={[0.74, 1.2, 0.74]} rotation={[0.12, 0.18, 0.62]}>
            <torusGeometry args={[0.48, 0.034, 12, 80, Math.PI * 1.58]} />
            <meshStandardMaterial color={palette.gallery} emissive={palette.gallery} emissiveIntensity={0.22} metalness={0.62} roughness={0.18} />
          </mesh>
          <mesh scale={[0.84, 1.08, 0.84]} rotation={[1.35, 0.72, -0.52]}>
            <torusGeometry args={[0.43, 0.028, 12, 80, Math.PI * 1.42]} />
            <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.12} metalness={0.55} roughness={0.2} />
          </mesh>
          <Line points={[[-0.42, -0.42, 0], [0.1, 0.48, 0.08], [0.43, -0.25, 0], [-0.42, -0.42, 0]]} color={palette.light} lineWidth={1.1} transparent opacity={0.64} />
        </group>
      </Float>
      <Text position={[0, 0.5, 0.88]} fontSize={0.08} color={palette.gallery} anchorX="center" letterSpacing={0.09}>FORM STUDY / 01</Text>
      <pointLight color={palette.gallery} intensity={1.65} distance={5.8} position={[0, 2.3, 0.2]} />
    </group>
  );
}

function ArtWing({ palette, onOpen }: { palette: Palette; onOpen: (section: Section) => void }) {
  const paintings = Array.from({ length: Math.max(portfolioData.gallery.length, 6) }, (_, index) => portfolioData.gallery[index]);
  return (
    <group onClick={() => onOpen("gallery")}>
      <mesh receiveShadow position={[13.1, 2.35, 7.9]}><boxGeometry args={[9.2, 4.7, 0.32]} /><meshStandardMaterial color={palette.wall} roughness={0.92} /></mesh>
      <mesh receiveShadow position={[13.1, 2.35, -0.55]}><boxGeometry args={[9.2, 4.7, 0.32]} /><meshStandardMaterial color={palette.wall} roughness={0.92} /></mesh>
      {paintings.slice(0, 6).map((painting, index) => {
        const x = 10.4 + (index % 3) * 2.62;
        const z = index < 3 ? 7.63 : -0.28;
        const color = [palette.gallery, palette.accent, palette.profile, palette.project][index % 4];
        return <group key={painting?.id ?? `painting-slot-${index}`} position={[x, 2.1, z]} rotation={[0, index < 3 ? Math.PI : 0, 0]}>
          <ArtworkFrame frameWidth={1.65} frameHeight={1.48} palette={palette} accent={color} />
          {painting ? (
            <GalleryPainting src={painting.src} />
          ) : (
            <>
              <mesh position={[0, 0, 0.075]}><planeGeometry args={[1.4, 1.22]} /><meshBasicMaterial color={color} transparent opacity={0.57} /></mesh>
              <Text position={[0, 0, 0.085]} fontSize={0.11} color={palette.light} anchorX="center">ADD A PAINTING</Text>
            </>
          )}
          {painting && <Text position={[0, -0.91, 0.19]} fontSize={0.075} color={palette.light} anchorX="center" letterSpacing={0.055}>{String(index + 1).padStart(2, "0")} / {painting.caption.toUpperCase()}</Text>}
        </group>;
      })}
      <GallerySculpture palette={palette} />
      {[10.3, 13.05, 15.8].map((x) => <pointLight key={x} color={palette.light} intensity={1.15} distance={4.2} position={[x, 3.7, 3.7]} />)}
      <Text position={[13.05, 3.75, 3.7]} rotation={[0, Math.PI, 0]} fontSize={0.2} color={palette.gallery} anchorX="center">THE ART WING</Text>
    </group>
  );
}

function PrismGlyph({ palette }: { palette: Palette }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.23, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.22, 0.46, 4]} />
        <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.8} metalness={0.65} roughness={0.14} />
      </mesh>
      <mesh castShadow position={[0, -0.23, 0]} rotation={[Math.PI, Math.PI / 4, 0]}>
        <coneGeometry args={[0.22, 0.46, 4]} />
        <meshStandardMaterial color={palette.light} emissive={palette.accent} emissiveIntensity={0.22} metalness={0.6} roughness={0.16} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[0.38, 0.415, 4]} />
        <meshBasicMaterial color={palette.project} transparent opacity={0.82} />
      </mesh>
      <Line points={[[-0.34, 0, 0], [0, 0.34, 0], [0.34, 0, 0], [0, -0.34, 0], [-0.34, 0, 0]]} color={palette.light} transparent opacity={0.72} lineWidth={1} />
    </group>
  );
}

function PrismRelay({ palette }: { palette: Palette }) {
  const targets: Array<[number, number, number]> = [[21.0, 1.55, 0.7], [23.45, 1.2, 2.2], [25.2, 1.85, 4.9], [21.7, 2.2, 6.2], [24.35, 1.15, 6.9], [26.0, 2.25, 1.5], [22.1, 1.65, 4.05], [25.0, 1.35, 3.35]];
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const target = targets[score % targets.length];
  const complete = score >= targets.length;

  const start = () => {
    setScore(0);
    setStarted(true);
  };

  const hit = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (!started || complete) return;
    setScore((value) => value + 1);
  };

  return (
    <group>
      <mesh receiveShadow position={[22.25, 0.11, 3.65]}>
        <cylinderGeometry args={[3.46, 3.68, 0.22, 96]} />
        <meshStandardMaterial color={palette.ink} roughness={0.36} metalness={0.24} />
      </mesh>
      {[2.88, 2.42, 1.72].map((radius, index) => <mesh key={radius} position={[22.25, 0.235 + index * 0.004, 3.65]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[radius, radius + 0.026, 80]} /><meshBasicMaterial color={index === 0 ? palette.project : palette.light} transparent opacity={index === 0 ? 0.7 : 0.24} /></mesh>)}
      {targets.map(([x, , z], index) => <mesh key={`${x}-${z}`} position={[x, 0.247, z]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}><ringGeometry args={[0.11, 0.135, 4]} /><meshBasicMaterial color={index < score ? palette.project : palette.line} transparent opacity={index < score ? 0.86 : 0.32} /></mesh>)}
      <group position={[19.5, 0, 3.65]} onClick={start}>
        <mesh castShadow position={[0, 0.12, 0]}><cylinderGeometry args={[0.68, 0.78, 0.24, 32]} /><meshStandardMaterial color={palette.ink} roughness={0.28} metalness={0.32} /></mesh>
        <RoundedBox args={[0.78, 1.28, 0.58]} radius={0.11} smoothness={5} position={[0, 0.78, 0]} castShadow><meshStandardMaterial color={palette.wallDeep} roughness={0.3} metalness={0.2} /></RoundedBox>
        <RoundedBox args={[0.57, 0.41, 0.025]} radius={0.035} smoothness={2} position={[0, 0.92, 0.305]}><meshBasicMaterial color={started ? palette.project : palette.accent} transparent opacity={0.76} /></RoundedBox>
        <Line points={[[-0.19, 0.91, 0.322], [-0.05, 1.02, 0.322], [0.08, 0.84, 0.322], [0.23, 0.98, 0.322]]} color={palette.light} lineWidth={1.25} />
        <mesh position={[0, 0.42, 0.32]}><circleGeometry args={[0.06, 20]} /><meshBasicMaterial color={started ? palette.project : palette.accent} /></mesh>
        <pointLight color={started ? palette.project : palette.accent} intensity={1.12} distance={3.5} position={[0, 1.3, 0.58]} />
        <Html center position={[0, 1.84, 0.15]} distanceFactor={10} style={{ pointerEvents: "auto" }}>
          <button className="object-card game-card" type="button" onClick={start}>{complete ? "Replay constellation" : started ? `Tracking node ${score + 1}/${targets.length}` : "Begin constellation"}<span>{complete ? "all eight nodes resolved ✦" : "find the floating glyph"}</span></button>
        </Html>
      </group>
      {!started && <Text position={[22.25, 0.29, 3.65]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.13} color={palette.project} anchorX="center" letterSpacing={0.16}>READY / 08 NODES</Text>}
      {started && !complete && (
        <Float key={score} speed={1.7} floatIntensity={0.22} rotationIntensity={0.38}>
          <group position={target} onClick={hit}>
            <PrismGlyph palette={palette} />
            <pointLight color={palette.accent} intensity={1.85} distance={4.1} />
            <Html center position={[0, 0.78, 0]} distanceFactor={10} style={{ pointerEvents: "auto" }}>
              <button className="object-card prism-target" type="button" onClick={hit} aria-label={`Resolve prism node ${score + 1} of ${targets.length}`}>Resolve node {score + 1}/{targets.length}<span>select the glyph ↗</span></button>
            </Html>
          </group>
        </Float>
      )}
      {complete && <Text position={[22.25, 3.38, 3.65]} rotation={[0, Math.PI, 0]} fontSize={0.23} color={palette.project} anchorX="center" letterSpacing={0.06}>CONSTELLATION RESOLVED · 8 / 8</Text>}
      <Text position={[22.25, 3.72, 3.65]} rotation={[0, Math.PI, 0]} fontSize={0.14} color={palette.project} anchorX="center" letterSpacing={0.13}>PRISM RELAY / CONSTELLATION LAB</Text>
      {[20.35, 22.25, 24.15].map((x) => <spotLight key={x} color={palette.light} intensity={0.95} distance={5.4} angle={0.3} penumbra={0.8} position={[x, 3.86, 3.65]} />)}
    </group>
  );
}

function GameRoom({ palette }: { palette: Palette }) {
  return (
    <group>
      <mesh receiveShadow position={[22.25, 2.35, 7.9]}><boxGeometry args={[9.35, 4.7, 0.32]} /><meshStandardMaterial color={palette.wall} roughness={0.92} /></mesh>
      <mesh receiveShadow position={[26.9, 2.35, 3.7]}><boxGeometry args={[0.32, 4.7, 8.8]} /><meshStandardMaterial color={palette.wall} roughness={0.92} /></mesh>
      <mesh receiveShadow position={[22.25, 2.35, -0.55]}><boxGeometry args={[9.35, 4.7, 0.32]} /><meshStandardMaterial color={palette.wall} roughness={0.92} /></mesh>
      <RoundedBox args={[0.22, 4.3, 0.22]} radius={0.06} smoothness={3} position={[17.7, 2.15, -0.18]} castShadow><meshStandardMaterial color={palette.wallDeep} roughness={0.7} /></RoundedBox>
      <RoundedBox args={[0.22, 4.3, 0.22]} radius={0.06} smoothness={3} position={[17.7, 2.15, 7.4]} castShadow><meshStandardMaterial color={palette.wallDeep} roughness={0.7} /></RoundedBox>
      <mesh position={[22.25, 4.14, 3.7]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[5.6, 5.5]} /><meshBasicMaterial color={palette.project} transparent opacity={0.12} /></mesh>
      <group position={[22.25, 2.6, 7.68]} rotation={[0, Math.PI, 0]}>
        <RoundedBox args={[5.7, 2.08, 0.07]} radius={0.08} smoothness={3}><meshStandardMaterial color={palette.ink} roughness={0.45} metalness={0.16} /></RoundedBox>
        {[-1.95, -0.97, 0, .97, 1.95].map((x) => <Line key={x} points={[[x, -0.72, 0.05], [x, 0.3 + Math.abs(x) * .12, 0.05]]} color={palette.project} transparent opacity={0.45} lineWidth={0.8} />)}
        <Line points={[[-2.18, -0.72, 0.055], [-1.3, -0.2, 0.055], [-.42, .28, 0.055], [.62, -.05, 0.055], [1.36, .45, 0.055], [2.16, -.22, 0.055]]} color={palette.accent} lineWidth={1.5} />
        <Text position={[0, 0.7, 0.08]} fontSize={0.15} color={palette.light} anchorX="center" letterSpacing={0.12}>CONSTELLATION LAB</Text>
        <Text position={[0, 0.42, 0.08]} fontSize={0.075} color={palette.project} anchorX="center" letterSpacing={0.1}>FIND · RESOLVE · REPEAT</Text>
      </group>
      <PrismRelay palette={palette} />
    </group>
  );
}

function Architecture({ palette, onOpen }: { palette: Palette; onOpen: (section: Section) => void }) {
  const wallColumns: Array<[number, number, number]> = [[17.1, 0, -0.15], [17.1, 0, 3.7], [17.1, 0, 7.25]];
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[9.0, 0, 0]}><planeGeometry args={[35.2, 15.4]} /><meshPhysicalMaterial color={palette.floor} roughness={0.5} metalness={0.12} clearcoat={0.12} clearcoatRoughness={0.44} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.2, 0.014, 0.1]}>
        <ringGeometry args={[3.45, 3.55, 80]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.22} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[13.05, 0.014, 3.7]}>
        <ringGeometry args={[3.75, 3.82, 80]} />
        <meshBasicMaterial color={palette.gallery} transparent opacity={0.19} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[22.25, 0.014, 3.65]}>
        <ringGeometry args={[4.02, 4.08, 80]} />
        <meshBasicMaterial color={palette.project} transparent opacity={0.16} />
      </mesh>
      {[-6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26].map((coordinate) => <Line key={`v-${coordinate}`} points={[[coordinate, 0.012, -7.5], [coordinate, 0.012, 7.5]]} color={palette.line} transparent opacity={0.14} lineWidth={0.6} />)}
      {[-6, -4, -2, 0, 2, 4, 6].map((coordinate) => <Line key={`h-${coordinate}`} points={[[-8.5, 0.012, coordinate], [26.5, 0.012, coordinate]]} color={palette.line} transparent opacity={0.14} lineWidth={0.6} />)}
      <mesh receiveShadow position={[9.0, 2.35, -7.9]}><boxGeometry args={[35.4, 4.7, 0.32]} /><meshStandardMaterial color={palette.wall} roughness={0.93} /></mesh>
      <mesh receiveShadow position={[-8.65, 2.35, 0]}><boxGeometry args={[0.32, 4.7, 15.8]} /><meshStandardMaterial color={palette.wall} roughness={0.93} /></mesh>
      <mesh receiveShadow position={[8.65, 2.35, -3.7]}><boxGeometry args={[0.32, 4.7, 8.05]} /><meshStandardMaterial color={palette.wall} roughness={0.93} /></mesh>
      <mesh receiveShadow position={[8.65, 2.35, 6.72]}><boxGeometry args={[0.32, 4.7, 2.35]} /><meshStandardMaterial color={palette.wall} roughness={0.93} /></mesh>
      {wallColumns.map((position) => <Column key={position.join("-")} position={position} palette={palette} />)}
      <mesh position={[0, 4.15, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[5.4, 8.4]} /><meshBasicMaterial color={palette.light} transparent opacity={0.17} /></mesh>
      <mesh position={[13.05, 4.15, 3.7]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[5.2, 4.6]} /><meshBasicMaterial color={palette.light} transparent opacity={0.13} /></mesh>
      <Library palette={palette} />
      <Workbench palette={palette} />
      <StudyTable palette={palette} onOpen={onOpen} />
      <TrophyPlinth palette={palette} onOpen={onOpen} />
      <PhotoWall palette={palette} />
      <GalleryDoor palette={palette} />
      <ArtWing palette={palette} onOpen={onOpen} />
      <GameRoom palette={palette} />
    </group>
  );
}

function Studio({ activeSection, motionEnabled, quality, palette, onOpen }: Pick<SceneProps, "activeSection" | "motionEnabled" | "quality" | "onOpen"> & { palette: Palette }) {
  const dark = palette.background === palettes.dark.background;
  const player = useRef<Group>(null);
  return (
    <group>
      <ambientLight intensity={dark ? 0.42 : 0.82} />
      <hemisphereLight color={palette.light} groundColor={palette.wallDeep} intensity={dark ? 0.66 : 0.94} />
      <directionalLight castShadow color={palette.light} intensity={dark ? 1.8 : 2.3} position={[-4, 8, 5]} shadow-mapSize-width={quality === "high" ? 1536 : 1024} shadow-mapSize-height={quality === "high" ? 1536 : 1024} />
      <spotLight color={palette.accent} intensity={dark ? 2.1 : 1.15} distance={19} angle={0.42} penumbra={0.82} position={[-1, 7.2, 2.1]} />
      <spotLight color={palette.gallery} intensity={dark ? 1.7 : 0.86} distance={13} angle={0.44} penumbra={0.86} position={[13.1, 6.6, 3.6]} />
      <spotLight color={palette.project} intensity={dark ? 1.1 : 0.64} distance={12} angle={0.42} penumbra={0.88} position={[22.2, 6.4, 3.6]} />
      <Architecture palette={palette} onOpen={onOpen} />
      <Sparkles count={quality === "high" ? 64 : 28} scale={[32, 5, 14]} size={dark ? 1.65 : 1.15} speed={motionEnabled ? 0.24 : 0} color={palette.light} opacity={dark ? 0.46 : 0.24} position={[9, 2.7, 0]} />
      {destinations.map((destination) => <Threshold key={destination.section} destination={destination} palette={palette} active={activeSection === destination.section} motionEnabled={motionEnabled} onOpen={onOpen} />)}
      <Walker playerRef={player} enabled={motionEnabled && activeSection === null} palette={palette} onThreshold={onOpen} />
      <CameraController player={player} />
      <ContactShadows position={[0, 0.015, 0]} opacity={dark ? 0.54 : 0.24} scale={22} blur={2.7} far={9} />
    </group>
  );
}

export function PortfolioScene({ activeSection, motionEnabled, quality, theme, onOpen }: SceneProps) {
  const palette = palettes[theme];
  const sceneRef = useRef<HTMLDivElement>(null);
  const [walkingActive, setWalkingActive] = useState(false);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const scene = sceneRef.current;
      if (scene && (!(event.target instanceof Node) || !scene.contains(event.target))) {
        setWalkingActive(false);
        if (document.activeElement === scene) scene.blur();
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      if (event.target !== sceneRef.current) setWalkingActive(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className="scene-canvas"
      role="region"
      aria-label="Interactive walkable portfolio studio"
      aria-describedby="scene-controls"
      tabIndex={0}
      onFocus={(event) => { if (event.target === event.currentTarget) setWalkingActive(true); }}
      onBlur={(event) => { if (event.target === event.currentTarget) setWalkingActive(false); }}
      onPointerDownCapture={(event) => {
        if (event.target instanceof HTMLCanvasElement) event.currentTarget.focus({ preventScroll: true });
        else setWalkingActive(false);
      }}
    >
      <Canvas
        shadows
        dpr={quality === "high" ? [1, 1.85] : [1, 1]}
        camera={{ position: [0, 4.5, 13.2], fov: 48 }}
        gl={{ antialias: quality === "high", alpha: false }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = theme === "dark" ? 1.15 : 1.02;
        }}
      >
        <color attach="background" args={[palette.background]} />
        <fog attach="fog" args={[palette.background, 11, 29]} />
        <Suspense fallback={null}>
          <Studio activeSection={activeSection} motionEnabled={motionEnabled} quality={quality} palette={palette} onOpen={onOpen} />
        </Suspense>
      </Canvas>
    </div>
  );
}
