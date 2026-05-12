import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Cylinder, Cone, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { THEME } from './theme';
import type { FlowState, WorldPos } from './flow';

// ─── World constants ────────────────────────────────────────────────────────
const SLAB = 20;
const SLAB_HALF = SLAB / 2;
const SLAB_USABLE = SLAB_HALF - 0.6;

// ─── Road definitions ───────────────────────────────────────────────────────
export type Road = {
  id: string;
  axis: 'x' | 'z';
  center: number;
  length: number;
  width: number;
  label: string;
};

export const ROADS: Road[] = [
  { id: 'ring-1', axis: 'x', center: -3.0, length: 20, width: 1.5, label: 'Ring Road 1' },
  { id: 'ring-2', axis: 'x', center: 4.6, length: 20, width: 1.5, label: 'Ring Road 2' },
  { id: 'avenue-a', axis: 'z', center: -4.2, length: 20, width: 1.4, label: 'Avenue A' },
  { id: 'avenue-b', axis: 'z', center: 5.2, length: 20, width: 1.4, label: 'Avenue B' },
];

// ─── Existing building catalog (also acts as shadow casters / obstacles) ────
type Kind = 'house' | 'midrise' | 'tall' | 'warehouse' | 'dome';

type BuildingDef = {
  id: string;
  pos: [number, number];      // x, z
  size: [number, number];     // w, d
  height: number;
  kind: Kind;
  accent?: boolean;
  rot?: number;
};

// NB: every building must keep ≥0.5 unit of clear ground between its
// footprint and the body of every road.  Road bodies are:
//   Ring Road 1   z ∈ [-3.75, -2.25]
//   Ring Road 2   z ∈ [ 3.85,  5.35]
//   Avenue A      x ∈ [-4.90, -3.50]
//   Avenue B      x ∈ [ 4.50,  5.90]
const BUILDINGS: BuildingDef[] = [
  // NW residential cluster (low houses) — west of Avenue A, north of Ring 1
  { id: 'nw1', pos: [-8.6, -8.4], size: [0.9, 0.9], height: 0.75, kind: 'house', rot: 0.3 },
  { id: 'nw2', pos: [-7.3, -7.2], size: [1.0, 1.0], height: 0.8, kind: 'house', rot: -0.1 },
  { id: 'nw3', pos: [-6.2, -8.6], size: [0.9, 0.9], height: 0.75, kind: 'house', rot: 0.2 },
  { id: 'nw4', pos: [-9.0, -5.8], size: [0.9, 0.9], height: 0.75, kind: 'house', rot: 0.5 },
  { id: 'nw5', pos: [-7.6, -4.8], size: [1.0, 1.0], height: 0.85, kind: 'house', rot: 0.0 },
  { id: 'nw6', pos: [-6.0, -5.8], size: [0.9, 1.0], height: 0.8, kind: 'house', rot: -0.3 },

  // NE commercial — east of Avenue B, north of Ring 1
  { id: 'ne1', pos: [7.4, -8.2], size: [1.5, 1.5], height: 2.6, kind: 'midrise' },
  { id: 'ne2', pos: [8.6, -6.4], size: [1.7, 1.7], height: 5.2, kind: 'tall', accent: true },
  { id: 'ne3', pos: [7.2, -5.6], size: [1.4, 1.4], height: 3.0, kind: 'midrise' },
  { id: 'ne4', pos: [9.0, -5.2], size: [1.3, 1.3], height: 2.4, kind: 'midrise' },

  // N-center mid-rises — between Avenues A & B, north of Ring 1
  { id: 'nc1', pos: [-2.0, -7.4], size: [1.5, 1.5], height: 2.6, kind: 'midrise' },
  { id: 'nc2', pos: [1.4, -8.0], size: [1.5, 1.5], height: 3.0, kind: 'midrise' },
  { id: 'nc3', pos: [3.2, -6.2], size: [1.4, 1.4], height: 2.6, kind: 'midrise' },
  { id: 'nc4', pos: [-0.4, -5.6], size: [1.4, 1.4], height: 2.2, kind: 'midrise' },
  { id: 'nc5', pos: [-2.2, -5.8], size: [1.3, 1.3], height: 2.4, kind: 'midrise' },

  // Civic dome (center-west, between Avenue A and Avenue B, between Ring 1 and Ring 2)
  { id: 'civ', pos: [-1.6, 0.4], size: [2.0, 2.0], height: 1.8, kind: 'dome' },

  // Center-east skyscrapers — main shadow casters for the planning demo
  { id: 'sky1', pos: [2.4, 0.8], size: [1.7, 1.7], height: 5.8, kind: 'tall', accent: true },
  { id: 'sky2', pos: [3.2, -0.4], size: [1.4, 1.4], height: 4.8, kind: 'tall' },
  { id: 'sky3', pos: [2.6, 2.6], size: [1.4, 1.4], height: 4.0, kind: 'tall' },

  // SW small houses — west of Avenue A, south of Ring 2
  { id: 'sw1', pos: [-7.4, 6.6], size: [0.9, 0.9], height: 0.75, kind: 'house', rot: 0.3 },
  { id: 'sw2', pos: [-8.6, 8.0], size: [0.9, 0.9], height: 0.8, kind: 'house', rot: -0.2 },
  { id: 'sw3', pos: [-6.0, 7.6], size: [1.0, 1.0], height: 0.75, kind: 'house', rot: 0.1 },

  // SE warehouses (low, wide) — east of Avenue B, south of Ring 2
  { id: 'se1', pos: [7.8, 6.6], size: [2.2, 1.4], height: 1.0, kind: 'warehouse' },
  { id: 'se2', pos: [7.8, 8.4], size: [2.2, 1.4], height: 1.0, kind: 'warehouse' },
  { id: 'se3', pos: [9.2, 7.4], size: [1.2, 2.0], height: 1.0, kind: 'warehouse' },

  // S-center residential blocks — between Avenues, south of Ring 2
  { id: 'sc1', pos: [-2.0, 6.6], size: [1.4, 1.4], height: 2.0, kind: 'midrise' },
  { id: 'sc2', pos: [1.0, 7.0], size: [1.4, 1.4], height: 2.0, kind: 'midrise' },
  { id: 'sc3', pos: [3.0, 6.8], size: [1.4, 1.4], height: 1.8, kind: 'midrise' },
  { id: 'sc4', pos: [-2.0, 8.6], size: [1.3, 1.3], height: 1.8, kind: 'midrise' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c = 1.6;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
function aabbFromBuilding(b: BuildingDef): { min: THREE.Vector3; max: THREE.Vector3 } {
  return {
    min: new THREE.Vector3(b.pos[0] - b.size[0] / 2, 0, b.pos[1] - b.size[1] / 2),
    max: new THREE.Vector3(b.pos[0] + b.size[0] / 2, b.height, b.pos[1] + b.size[1] / 2),
  };
}

function rayHitsAABB(origin: THREE.Vector3, dir: THREE.Vector3, min: THREE.Vector3, max: THREE.Vector3): boolean {
  let tmin = 0;
  let tmax = Infinity;
  for (const axis of ['x', 'y', 'z'] as const) {
    const o = origin[axis];
    const d = dir[axis];
    if (Math.abs(d) < 1e-6) {
      if (o < min[axis] || o > max[axis]) return false;
    } else {
      let t1 = (min[axis] - o) / d;
      let t2 = (max[axis] - o) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }
  }
  return tmax > 0.001;
}

function distanceToRoad(x: number, z: number, road: Road): number {
  if (road.axis === 'x') return Math.abs(z - road.center);
  return Math.abs(x - road.center);
}

function pointInsideBuilding(x: number, z: number, b: BuildingDef, pad: number): boolean {
  return (
    x > b.pos[0] - b.size[0] / 2 - pad &&
    x < b.pos[0] + b.size[0] / 2 + pad &&
    z > b.pos[1] - b.size[1] / 2 - pad &&
    z < b.pos[1] + b.size[1] / 2 + pad
  );
}

type Obstacle = { pos: [number, number]; size: [number, number]; height: number };

function isPositionValid(x: number, z: number, placedObstacles: Obstacle[], footprint = 1.4): boolean {
  // inside slab
  if (Math.abs(x) > SLAB_USABLE - footprint / 2 || Math.abs(z) > SLAB_USABLE - footprint / 2) return false;
  // away from roads (sidewalk + safety buffer of 0.9 so the preview can't visually overlap the curb)
  for (const r of ROADS) {
    if (distanceToRoad(x, z, r) < r.width / 2 + footprint / 2 + 0.9) return false;
  }
  // away from existing buildings
  for (const b of BUILDINGS) {
    if (pointInsideBuilding(x, z, b, footprint / 2 + 0.3)) return false;
  }
  // away from other placed entities
  for (const o of placedObstacles) {
    if (
      x > o.pos[0] - o.size[0] / 2 - footprint / 2 - 0.4 &&
      x < o.pos[0] + o.size[0] / 2 + footprint / 2 + 0.4 &&
      z > o.pos[1] - o.size[1] / 2 - footprint / 2 - 0.4 &&
      z < o.pos[1] + o.size[1] / 2 + footprint / 2 + 0.4
    )
      return false;
  }
  return true;
}

function snapToValidPosition(
  cx: number,
  cz: number,
  placedObstacles: Obstacle[],
  footprint = 1.4,
): WorldPos | null {
  if (isPositionValid(cx, cz, placedObstacles, footprint)) return [cx, cz];
  // Spiral outwards looking for the nearest valid grid point.
  const step = 0.35;
  for (let r = step; r <= 5.0; r += step) {
    const samples = Math.max(12, Math.floor((r / step) * 8));
    for (let s = 0; s < samples; s++) {
      const a = (s / samples) * Math.PI * 2;
      const tx = cx + Math.cos(a) * r;
      const tz = cz + Math.sin(a) * r;
      if (isPositionValid(tx, tz, placedObstacles, footprint)) return [tx, tz];
    }
  }
  return null;
}

// ─── Scene props ────────────────────────────────────────────────────────────
type SceneProps = {
  state: FlowState;
  onPickGround: (pos: WorldPos) => void;
  onPickRoad: (id: string) => void;
};

function roadById(id?: string): Road | null {
  if (!id) return null;
  return ROADS.find((r) => r.id === id) ?? null;
}

// ─── Land + ground ──────────────────────────────────────────────────────────
function LandSlab() {
  return (
    <group>
      <RoundedBox args={[SLAB, 0.05, SLAB]} radius={0.05} smoothness={4} position={[0, -0.025, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={THEME.brick} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[SLAB - 0.2, 0.04, SLAB - 0.2]} radius={0.05} smoothness={4} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color={THEME.ground} roughness={1} />
      </RoundedBox>
      <ParkPatches />
      <River />
      <Roads />
      <Sidewalks />
    </group>
  );
}

// Every park body keeps ≥2.5 units of clear ground from every road body.  This
// is the size of the visible visual buffer between curb and grass — enough
// that no oblique camera angle can collapse the gap to zero in screen space.
const PARKS: { pos: [number, number]; size: [number, number]; rot?: number }[] = [
  { pos: [0.7, 0.9], size: [2.2, 1.4] },            // central park: z[0.2, 1.6] — 2.65 from Ring 1, 2.25 from Ring 2
  { pos: [-7.4, 9.0], size: [2.4, 1.2] },           // SW park: z[8.4, 9.6] — 3.05 from Ring 2
  { pos: [9.2, 0.8], size: [0.8, 1.0] },            // NE strip: z[0.3, 1.3]
  { pos: [-9.3, 0.8], size: [0.8, 1.0] },           // NW strip: z[0.3, 1.3]
];

function ParkPatches() {
  return (
    <group>
      {PARKS.map((p, i) => (
        <RoundedBox
          key={i}
          args={[p.size[0], 0.05, p.size[1]]}
          radius={0.06}
          smoothness={4}
          position={[p.pos[0], 0.0, p.pos[1]]}
          rotation={[0, p.rot ?? 0, 0]}
          receiveShadow
        >
          <meshStandardMaterial color={THEME.parkGrass} roughness={1} />
        </RoundedBox>
      ))}
    </group>
  );
}

function River() {
  const geometry = useMemo(() => {
    // Build a flat ribbon (custom BufferGeometry) along a smoothed centerline.
    // Path is kept well inside the slab usable area so the ribbon never spills
    // off the visible ground.
    const samples = 60;
    const centerline: THREE.Vector3[] = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const x = -8 + 16 * t;                                    // x ∈ [-8, 8]
      const z = 8.2 + Math.sin(t * Math.PI * 1.45) * 0.65 - t * 0.35; // z ∈ ~[7.2, 8.85]
      centerline.push(new THREE.Vector3(x, 0.06, z));
    }
    const width = 1.0;
    const halfW = width / 2;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    for (let i = 0; i <= samples; i++) {
      const p = centerline[i];
      const next = centerline[Math.min(i + 1, samples)];
      const prev = centerline[Math.max(i - 1, 0)];
      const dx = next.x - prev.x;
      const dz = next.z - prev.z;
      const len = Math.max(0.0001, Math.hypot(dx, dz));
      const nx = -dz / len;
      const nz = dx / len;
      positions.push(p.x + nx * halfW, p.y, p.z + nz * halfW);
      positions.push(p.x - nx * halfW, p.y, p.z - nz * halfW);
      uvs.push(0, i / samples);
      uvs.push(1, i / samples);
    }
    for (let i = 0; i < samples; i++) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color={THEME.water} roughness={0.3} metalness={0.25} />
    </mesh>
  );
}

// For a road, return the marking segments along its length, with the
// intersection regions removed.  Each returned segment is a slice of the road
// where lane markings can safely render without colliding with the crossing
// road's paint.
function getMarkingSegments(road: Road): { centerCoord: number; length: number }[] {
  const intersections: { start: number; end: number }[] = [];
  for (const other of ROADS) {
    if (other.axis === road.axis) continue;
    intersections.push({
      start: other.center - other.width / 2,
      end: other.center + other.width / 2,
    });
  }
  intersections.sort((a, b) => a.start - b.start);

  const segments: { centerCoord: number; length: number }[] = [];
  const roadStart = -road.length / 2;
  const roadEnd = road.length / 2;
  let cursor = roadStart;
  for (const ix of intersections) {
    if (ix.start > cursor) {
      const length = ix.start - cursor;
      segments.push({ centerCoord: (cursor + ix.start) / 2, length });
    }
    cursor = Math.max(cursor, ix.end);
  }
  if (cursor < roadEnd) {
    segments.push({ centerCoord: (cursor + roadEnd) / 2, length: roadEnd - cursor });
  }
  return segments;
}

const MARK_Y = 0.31;
const YELLOW_W = 0.07;
const WHITE_W = 0.045;

function Roads() {
  return (
    <group>
      {/* asphalt road surface */}
      {ROADS.map((r) => {
        const args: [number, number, number] = r.axis === 'x'
          ? [r.length, 0.14, r.width]
          : [r.width, 0.14, r.length];
        const pos: [number, number, number] = r.axis === 'x'
          ? [0, 0.22, r.center]
          : [r.center, 0.22, 0];
        return (
          <mesh key={r.id} position={pos} receiveShadow castShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color={THEME.asphalt} roughness={0.95} />
          </mesh>
        );
      })}
      {/* dashed yellow center — broken at intersections, evenly-spaced dashes per segment */}
      {ROADS.flatMap((r) => {
        const segs = getMarkingSegments(r);
        const dashLen = 0.45;
        const dashCycle = 0.85; // dash + gap
        return segs.flatMap((s, segIdx) => {
          const numDashes = Math.max(1, Math.round(s.length / dashCycle));
          return Array.from({ length: numDashes }).map((_, i) => {
            const t = (i + 0.5) / numDashes;             // 0..1 within segment
            const offset = (t - 0.5) * s.length;
            const coord = s.centerCoord + offset;
            const args: [number, number, number] = r.axis === 'x'
              ? [dashLen, 0.04, YELLOW_W]
              : [YELLOW_W, 0.04, dashLen];
            const pos: [number, number, number] = r.axis === 'x'
              ? [coord, MARK_Y, r.center]
              : [r.center, MARK_Y, coord];
            return (
              <mesh key={`${r.id}-c-${segIdx}-${i}`} position={pos}>
                <boxGeometry args={args} />
                <meshBasicMaterial color={'#FFD84A'} toneMapped={false} />
              </mesh>
            );
          });
        });
      })}
      {/* thin white edge lines flush to the curb — broken at intersections */}
      {ROADS.flatMap((r) => {
        const segs = getMarkingSegments(r);
        const edgeInset = 0.05; // distance from outer asphalt edge inward
        return segs.flatMap((s, idx) =>
          [-1, 1].map((side) => {
            const lateralOffset = side * (r.width / 2 - edgeInset);
            const args: [number, number, number] = r.axis === 'x'
              ? [s.length, 0.04, WHITE_W]
              : [WHITE_W, 0.04, s.length];
            const pos: [number, number, number] = r.axis === 'x'
              ? [s.centerCoord, MARK_Y, r.center + lateralOffset]
              : [r.center + lateralOffset, MARK_Y, s.centerCoord];
            return (
              <mesh key={`${r.id}-w-${idx}-${side}`} position={pos}>
                <boxGeometry args={args} />
                <meshBasicMaterial color={'#FFFFFF'} toneMapped={false} />
              </mesh>
            );
          })
        );
      })}
    </group>
  );
}

function Sidewalks() {
  return (
    <group>
      {ROADS.map((r) => {
        const inset = r.width / 2 + 0.25;
        return [-1, 1].map((side) => {
          // Sidewalk slab — raised pavement, top at y=0.3 (just above road top of 0.29)
          const swArgs: [number, number, number] = r.axis === 'x'
            ? [r.length, 0.16, 0.5]
            : [0.5, 0.16, r.length];
          const swPos: [number, number, number] = r.axis === 'x'
            ? [0, 0.22, r.center + side * inset]
            : [r.center + side * inset, 0.22, 0];
          // Curb lip — small step right at the road edge, top at y=0.34
          const cArgs: [number, number, number] = r.axis === 'x'
            ? [r.length, 0.2, 0.08]
            : [0.08, 0.2, r.length];
          const cPos: [number, number, number] = r.axis === 'x'
            ? [0, 0.24, r.center + side * (r.width / 2 + 0.05)]
            : [r.center + side * (r.width / 2 + 0.05), 0.24, 0];
          return (
            <group key={`${r.id}-sw-${side}`}>
              <RoundedBox args={swArgs} radius={0.04} smoothness={3} position={swPos} receiveShadow castShadow>
                <meshStandardMaterial color={THEME.pavement} roughness={1} />
              </RoundedBox>
              <RoundedBox args={cArgs} radius={0.02} smoothness={2} position={cPos} receiveShadow>
                <meshStandardMaterial color={THEME.curb} roughness={1} />
              </RoundedBox>
            </group>
          );
        });
      })}
      <Streetlamps />
    </group>
  );
}

const INTERSECTIONS: { pos: [number, number]; ringRoad: Road; avenue: Road }[] = (() => {
  const horizontals = ROADS.filter((r) => r.axis === 'x');
  const verticals = ROADS.filter((r) => r.axis === 'z');
  const list: { pos: [number, number]; ringRoad: Road; avenue: Road }[] = [];
  for (const h of horizontals) {
    for (const v of verticals) {
      list.push({ pos: [v.center, h.center], ringRoad: h, avenue: v });
    }
  }
  return list;
})();

function Streetlamps() {
  const lamps: { pos: [number, number, number]; rotY: number }[] = useMemo(() => {
    const out: { pos: [number, number, number]; rotY: number }[] = [];
    const spacing = 3.2;
    const inset = 0.32; // distance from road centerline to lamp post
    for (const r of ROADS) {
      const count = Math.floor(r.length / spacing) - 1;
      for (let i = 0; i < count; i++) {
        const t = (i + 1) / (count + 1);
        const coord = t * r.length - r.length / 2;
        // skip near intersections
        const nearIntersection = INTERSECTIONS.some((it) => {
          const itCoord = r.axis === 'x' ? it.pos[0] : it.pos[1];
          return Math.abs(coord - itCoord) < 1.4;
        });
        if (nearIntersection) continue;
        const side = i % 2 === 0 ? 1 : -1;
        const offset = (r.width / 2 + inset) * side;
        const pos: [number, number, number] = r.axis === 'x'
          ? [coord, 0.3, r.center + offset]
          : [r.center + offset, 0.3, coord];
        const rotY = r.axis === 'x' ? (side > 0 ? Math.PI : 0) : (side > 0 ? -Math.PI / 2 : Math.PI / 2);
        out.push({ pos, rotY });
      }
    }
    return out;
  }, []);

  return (
    <group>
      {lamps.map((l, i) => (
        <Streetlamp key={i} position={l.pos} rotY={l.rotY} />
      ))}
    </group>
  );
}

function Streetlamp({ position, rotY }: { position: [number, number, number]; rotY: number }) {
  const lightRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((s) => {
    if (!lightRef.current) return;
    lightRef.current.emissiveIntensity = 0.55 + Math.sin(s.clock.elapsedTime * 1.4 + position[0]) * 0.08;
  });
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Cylinder args={[0.06, 0.09, 0.7, 8]} position={[0, 0.35, 0]} castShadow>
        <meshStandardMaterial color={THEME.forest700} roughness={0.7} />
      </Cylinder>
      <Cylinder args={[0.03, 0.03, 0.22, 6]} position={[0, 0.7, 0.11]} rotation={[Math.PI / 2.3, 0, 0]}>
        <meshStandardMaterial color={THEME.forest700} roughness={0.7} />
      </Cylinder>
      <mesh position={[0, 0.76, 0.21]}>
        <sphereGeometry args={[0.07, 12, 8]} />
        <meshStandardMaterial
          ref={lightRef}
          color={THEME.cream50}
          emissive={THEME.mint50}
          emissiveIntensity={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

// ─── Existing buildings ─────────────────────────────────────────────────────
const BUILDING_PALETTE: Record<Kind, string[]> = {
  house: [THEME.bone100, THEME.cream50, THEME.brick],
  midrise: [THEME.bone100, THEME.cream50, THEME.glass, THEME.brick, THEME.pavement],
  tall: [THEME.glass, THEME.bone100, THEME.cream50, THEME.pavement],
  warehouse: [THEME.pavement, THEME.cream50],
  dome: [THEME.forest700],
};

function colorFor(id: string, kind: Kind): string {
  const arr = BUILDING_PALETTE[kind];
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return arr[hash % arr.length];
}

const HOUSE_ROOFS = [THEME.forest700, THEME.brick, THEME.alertRed, THEME.asphalt];

function StaticBuilding({ def, mountDelay }: { def: BuildingDef; mountDelay: number }) {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    const elapsed = Math.max(0, t.current - mountDelay);
    const p = Math.min(1, elapsed / 0.8);
    const e = easeOutCubic(p);
    if (group.current) {
      group.current.scale.y = Math.max(0.001, e);
      group.current.position.y = (def.height / 2) * e;
    }
  });

  if (def.kind === 'dome') {
    return <CivicDomeMesh def={def} mountDelay={mountDelay} />;
  }
  if (def.kind === 'house') {
    return <HouseMesh def={def} mountDelay={mountDelay} />;
  }

  const isTall = def.kind === 'tall';
  const isWarehouse = def.kind === 'warehouse';
  const baseColor = colorFor(def.id, def.kind);
  const trim = def.accent ? THEME.sand400 : THEME.forest700;

  return (
    <group ref={group} position={[def.pos[0], 0, def.pos[1]]} rotation={[0, def.rot ?? 0, 0]}>
      <RoundedBox args={[def.size[0], def.height, def.size[1]]} radius={0.08} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={baseColor} roughness={0.75} />
      </RoundedBox>
      {/* window strips */}
      {Array.from({ length: Math.max(1, Math.floor(def.height / 0.55)) }).map((_, i) => (
        <mesh key={i} position={[0, -def.height / 2 + 0.35 + i * 0.55, def.size[1] / 2 + 0.001]}>
          <planeGeometry args={[def.size[0] * 0.78, 0.18]} />
          <meshStandardMaterial color={trim} roughness={0.5} />
        </mesh>
      ))}
      {Array.from({ length: Math.max(1, Math.floor(def.height / 0.55)) }).map((_, i) => (
        <mesh key={`b-${i}`} position={[0, -def.height / 2 + 0.35 + i * 0.55, -def.size[1] / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[def.size[0] * 0.78, 0.18]} />
          <meshStandardMaterial color={trim} roughness={0.5} />
        </mesh>
      ))}
      {isTall && (
        <RoundedBox args={[def.size[0] * 0.55, 0.2, def.size[1] * 0.55]} radius={0.04} smoothness={3} position={[0, def.height / 2 + 0.1, 0]}>
          <meshStandardMaterial color={THEME.forest700} roughness={0.7} />
        </RoundedBox>
      )}
      {isWarehouse && (
        <mesh position={[0, def.height / 2 + 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[def.size[0] * 0.95, def.size[1] * 0.95]} />
          <meshStandardMaterial color={THEME.sand400} roughness={0.9} />
        </mesh>
      )}
    </group>
  );
}

function HouseMesh({ def, mountDelay }: { def: BuildingDef; mountDelay: number }) {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    const elapsed = Math.max(0, t.current - mountDelay);
    const p = Math.min(1, elapsed / 0.7);
    const e = easeOutBack(p);
    if (group.current) group.current.scale.setScalar(e);
  });
  const wall = colorFor(def.id, 'house');
  const roofHash = def.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const roof = HOUSE_ROOFS[roofHash % HOUSE_ROOFS.length];
  return (
    <group ref={group} position={[def.pos[0], 0, def.pos[1]]} rotation={[0, def.rot ?? 0, 0]}>
      <RoundedBox args={[def.size[0], def.height, def.size[1]]} radius={0.05} smoothness={3} position={[0, def.height / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={wall} roughness={0.95} />
      </RoundedBox>
      <Cone args={[Math.max(def.size[0], def.size[1]) * 0.78, 0.4, 4]} position={[0, def.height + 0.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <meshStandardMaterial color={roof} roughness={0.7} />
      </Cone>
    </group>
  );
}

function CivicDomeMesh({ def, mountDelay }: { def: BuildingDef; mountDelay: number }) {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    const elapsed = Math.max(0, t.current - mountDelay);
    const p = Math.min(1, elapsed / 0.9);
    const e = easeOutCubic(p);
    if (group.current) group.current.scale.setScalar(e);
  });
  return (
    <group ref={group} position={[def.pos[0], 0, def.pos[1]]}>
      <Cylinder args={[0.95, 1.05, 0.8, 24]} position={[0, 0.4, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={THEME.forest700} roughness={0.7} />
      </Cylinder>
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.95, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={THEME.mint50} roughness={0.5} />
      </mesh>
      <Cylinder args={[0.06, 0.06, 0.4, 8]} position={[0, 1.85, 0]}>
        <meshStandardMaterial color={THEME.forest700} />
      </Cylinder>
      {/* plaza ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[1.2, 1.9, 32]} />
        <meshStandardMaterial color={THEME.cream50} roughness={1} />
      </mesh>
    </group>
  );
}

function Tree({ position, scale = 1, delay = 0 }: { position: [number, number, number]; scale?: number; delay?: number }) {
  const ref = useRef<THREE.Group>(null);
  const swayRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    if (ref.current) {
      const elapsed = Math.max(0, t.current - delay);
      const p = Math.min(1, elapsed / 0.7);
      const e = easeOutBack(p);
      ref.current.scale.setScalar(scale * e);
    }
    if (swayRef.current) {
      swayRef.current.rotation.z = Math.sin(t.current * 0.6 + position[0] * 2.1) * 0.04;
    }
  });
  return (
    <group ref={ref} position={position}>
      <Cylinder args={[0.05, 0.07, 0.4, 6]} position={[0, 0.2, 0]} castShadow>
        <meshStandardMaterial color={THEME.sand400} roughness={1} />
      </Cylinder>
      <mesh ref={swayRef} position={[0, 0.55, 0]} castShadow>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={THEME.forest700} roughness={0.7} flatShading />
      </mesh>
    </group>
  );
}

function Hedge({ position, size = [1.4, 0.3] }: { position: [number, number, number]; size?: [number, number] }) {
  return (
    <RoundedBox args={[size[0], 0.3, size[1]]} radius={0.12} smoothness={4} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={THEME.sage400} roughness={1} />
    </RoundedBox>
  );
}

function GroundGear({ position, radius = 0.9, dir = 1 }: { position: [number, number, number]; radius?: number; dir?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.1 * dir;
  });
  const teeth = 12;
  return (
    <group ref={ref} position={position}>
      <Cylinder args={[radius, radius, 0.08, 32]} position={[0, 0.04, 0]} receiveShadow>
        <meshStandardMaterial color={THEME.sand400} roughness={0.95} />
      </Cylinder>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        const x = Math.cos(a) * radius;
        const z = Math.sin(a) * radius;
        return (
          <RoundedBox
            key={i}
            args={[0.22, 0.08, 0.18]}
            radius={0.03}
            smoothness={2}
            position={[x, 0.04, z]}
            rotation={[0, -a, 0]}
            receiveShadow
          >
            <meshStandardMaterial color={THEME.sand400} roughness={0.95} />
          </RoundedBox>
        );
      })}
      <Cylinder args={[radius * 0.3, radius * 0.3, 0.1, 16]} position={[0, 0.08, 0]}>
        <meshStandardMaterial color={THEME.forest700} roughness={0.85} />
      </Cylinder>
    </group>
  );
}

// Trees sit deep inside their park footprints and ≥1.5 units from any road
// body. Foliage radius is 0.3, so the visible tree extends only ~0.3 past its
// center — combined with the 2.5-unit park-to-road clearance this means there
// is always >2 units of clear ground between any tree and the curb.
const TREE_POSITIONS: [number, number][] = [
  // Central park (0.7, 0.9, 2.2×1.4) — x [-0.4, 1.8], z [0.2, 1.6]
  [0.0, 0.6], [1.2, 0.7], [-0.2, 1.2], [1.4, 1.4], [0.7, 1.4],
  // SW park (-7.4, 9.0, 2.4×1.2) — x [-8.6, -6.2], z [8.4, 9.6]
  [-8.2, 8.7], [-6.4, 8.7], [-7.4, 9.3], [-6.6, 9.3], [-8.2, 9.4],
  // NE strip (9.2, 0.8, 0.8×1.0) — z [0.3, 1.3]
  [9.4, 0.5], [9.4, 1.1],
  // NW strip (-9.3, 0.8, 0.8×1.0)
  [-9.3, 0.5], [-9.3, 1.1],
];

function BasePropsScene() {
  return (
    <group>
      {BUILDINGS.map((b, i) => (
        <StaticBuilding key={b.id} def={b} mountDelay={0.15 + i * 0.03} />
      ))}

      {TREE_POSITIONS.map((p, i) => (
        <Tree
          key={`tree-${i}`}
          position={[p[0], 0, p[1]]}
          scale={0.85 + (i % 4) * 0.08}
          delay={0.5 + i * 0.03}
        />
      ))}

      {/* Hedges marking private boundaries */}
      <Hedge position={[-7.9, 0.16, -6.4]} size={[0.3, 1.4]} />
      <Hedge position={[-6.4, 0.16, -6.4]} size={[0.3, 1.4]} />
      <Hedge position={[-7.0, 0.16, 7.4]} size={[1.6, 0.3]} />

      {/* Decorative ground gears in central park */}
      <GroundGear position={[0.5, 0.13, 0.7]} radius={0.42} dir={1} />
      <GroundGear position={[1.2, 0.13, 1.4]} radius={0.3} dir={-1.4} />
    </group>
  );
}

// ─── Ground-pick plane (click anywhere) ─────────────────────────────────────
function PlacementInteractor({
  active,
  intent,
  placedObstacles,
  onPick,
  onPreviewChange,
}: {
  active: boolean;
  intent: 'building' | 'evse' | undefined;
  placedObstacles: Obstacle[];
  onPick: (pos: WorldPos) => void;
  onPreviewChange: (preview: { pos: WorldPos | null; valid: boolean }) => void;
}) {
  const footprint = intent === 'evse' ? 2.2 : 1.7;
  return (
    <mesh
      visible={false}
      position={[0, 0.06, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        if (!active) return;
        e.stopPropagation();
        const p = e.point;
        const snapped = snapToValidPosition(p.x, p.z, placedObstacles, footprint);
        onPreviewChange({ pos: snapped ?? [p.x, p.z], valid: !!snapped });
      }}
      onPointerOut={() => {
        if (!active) return;
        onPreviewChange({ pos: null, valid: false });
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (!active) return;
        e.stopPropagation();
        const p = e.point;
        const snapped = snapToValidPosition(p.x, p.z, placedObstacles, footprint);
        if (snapped) onPick(snapped);
      }}
    >
      <planeGeometry args={[SLAB, SLAB]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function GhostPreview({ preview, intent }: { preview: { pos: WorldPos | null; valid: boolean }; intent: 'building' | 'evse' | undefined }) {
  if (!preview.pos) return null;
  const color = preview.valid ? THEME.forest700 : THEME.alertRed;
  const isEvse = intent === 'evse';
  const w = isEvse ? 2.2 : 1.7;
  const d = isEvse ? 2.2 : 1.7;
  return (
    <group position={[preview.pos[0], 0.3, preview.pos[1]]}>
      {/* footprint outline ring on the ground (no filled box) */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.max(w, d) * 0.5, Math.max(w, d) * 0.55, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} depthWrite={false} />
      </mesh>
      {/* corner crosshair */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.06, d * 0.7]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.7, d * 0.06]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} depthWrite={false} />
      </mesh>
      <Html position={[0, 1.2, 0]} center distanceFactor={9}>
        <div style={{
          background: preview.valid ? THEME.forest700 : THEME.alertRed,
          color: THEME.bone100,
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 14px rgba(31,42,38,0.25)',
        }}>
          {preview.valid ? 'Click to place here' : 'No clear site nearby'}
        </div>
      </Html>
    </group>
  );
}

// ─── Road hit targets for policy mode ───────────────────────────────────────
function RoadHit({ road, active, selected, onClick }: { road: Road; active: boolean; selected: boolean; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const t = s.clock.elapsedTime;
    mat.opacity = active ? 0.45 + Math.sin(t * 2.4) * 0.2 : selected ? 0.35 : 0;
    mat.emissiveIntensity = active ? 0.7 + Math.sin(t * 2.4) * 0.3 : selected ? 0.5 : 0;
  });

  const args: [number, number, number] = road.axis === 'x'
    ? [road.length, 0.05, road.width + 0.3]
    : [road.width + 0.3, 0.05, road.length];
  const pos: [number, number, number] = road.axis === 'x'
    ? [0, 0.13, road.center]
    : [road.center, 0.13, 0];

  return (
    <group>
      <mesh
        ref={meshRef}
        position={pos}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          if (!active) return;
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => { if (active) document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = ''; }}
      >
        <boxGeometry args={args} />
        <meshStandardMaterial
          color={THEME.alertAmber}
          emissive={THEME.alertAmber}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      {active && (
        <Html
          position={road.axis === 'x' ? [0, 0.7, road.center] : [road.center, 0.7, 0]}
          center
          distanceFactor={10}
        >
          <div style={{
            background: THEME.forest700,
            color: THEME.bone100,
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 14px rgba(31,42,38,0.25)',
          }}>
            {road.label}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Placed building ────────────────────────────────────────────────────────
function PlacedBuilding({
  position,
  isAnimating,
  hasSolar,
  animatingSolar,
  solarElapsedRef,
  sunDirRef,
}: {
  position: [number, number];
  isAnimating: boolean;
  hasSolar: boolean;
  animatingSolar: boolean;
  solarElapsedRef: ElapsedRef;
  sunDirRef: SunDirRef;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(0);
  const height = 3.6;
  const width = 1.6;
  const depth = 1.6;
  const duration = 1.6;

  useFrame((_, dt) => {
    t.current += dt;
    if (!groupRef.current) return;
    const p = isAnimating ? Math.min(1, t.current / duration) : 1;
    const e = easeOutCubic(p);
    groupRef.current.scale.y = Math.max(0.001, e);
    groupRef.current.position.y = (height / 2) * e - 0.001;
  });

  return (
    <group position={[position[0], 0, position[1]]}>
      <group ref={groupRef}>
        <RoundedBox args={[width, height, depth]} radius={0.1} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color={THEME.bone100} roughness={0.7} />
        </RoundedBox>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0, -height / 2 + 0.4 + i * 0.55, depth / 2 + 0.001]}>
            <planeGeometry args={[width * 0.78, 0.18]} />
            <meshStandardMaterial color={THEME.forest700} roughness={0.5} />
          </mesh>
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`b-${i}`} position={[0, -height / 2 + 0.4 + i * 0.55, -depth / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[width * 0.78, 0.18]} />
            <meshStandardMaterial color={THEME.forest700} roughness={0.5} />
          </mesh>
        ))}
        <RoundedBox args={[width * 0.5, 0.18, depth * 0.5]} radius={0.04} smoothness={3} position={[0, height / 2 + 0.1, 0]}>
          <meshStandardMaterial color={THEME.forest700} roughness={0.7} />
        </RoundedBox>
        {(hasSolar || animatingSolar) && (
          <ShadeAwareSolarRoof
            origin={[position[0], height, position[1]]}
            localOrigin={[0, height / 2 + 0.02, 0]}
            roofWidth={width * 0.85}
            roofDepth={depth * 0.85}
            buildingHeight={height}
            animating={animatingSolar}
            elapsedRef={solarElapsedRef}
            sunDirRef={sunDirRef}
          />
        )}
      </group>
    </group>
  );
}

// ─── Day-cycle aware solar roof ─────────────────────────────────────────────
type CellGeom = {
  localX: number;
  localZ: number;
  worldX: number;
  worldZ: number;
  roofY: number;
};

type SunDirRef = React.MutableRefObject<THREE.Vector3>;

const SOLAR_DAY_DURATION = 6.0;

function ShadeAwareSolarRoof({
  origin,
  localOrigin,
  roofWidth,
  roofDepth,
  buildingHeight,
  animating,
  elapsedRef,
  sunDirRef,
}: {
  origin: [number, number, number];
  localOrigin: [number, number, number];
  roofWidth: number;
  roofDepth: number;
  buildingHeight: number;
  animating: boolean;
  elapsedRef: ElapsedRef;
  sunDirRef: SunDirRef;
}) {
  const cols = 4;
  const rows = 4;
  const cellW = roofWidth / cols;
  const cellD = roofDepth / rows;

  const cells = useMemo<CellGeom[]>(() => {
    const out: CellGeom[] = [];
    const roofY = buildingHeight + 0.01;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const localX = -roofWidth / 2 + cellW / 2 + i * cellW;
        const localZ = -roofDepth / 2 + cellD / 2 + j * cellD;
        const worldX = origin[0] + localX;
        const worldZ = origin[2] + localZ;
        out.push({ localX, localZ, worldX, worldZ, roofY });
      }
    }
    return out;
  }, [origin, roofWidth, roofDepth, buildingHeight, cellW, cellD]);

  const tallyRef = useRef<{ sun: number; total: number }[]>(cells.map(() => ({ sun: 0, total: 0 })));
  const wasAnimating = useRef(animating);

  useEffect(() => {
    if (animating && !wasAnimating.current) {
      tallyRef.current = cells.map(() => ({ sun: 0, total: 0 }));
    }
    wasAnimating.current = animating;
  }, [animating, cells]);

  return (
    <group position={localOrigin}>
      {cells.map((c, idx) => (
        <DayCycleSolarCell
          key={idx}
          cell={c}
          cellW={cellW * 0.86}
          cellD={cellD * 0.86}
          animating={animating}
          sunDirRef={sunDirRef}
          tallyRef={tallyRef}
          index={idx}
        />
      ))}
      <SolarHud
        animating={animating}
        elapsedRef={elapsedRef}
        tallyRef={tallyRef}
      />
    </group>
  );
}

function DayCycleSolarCell({
  cell,
  cellW,
  cellD,
  animating,
  sunDirRef,
  tallyRef,
  index,
}: {
  cell: CellGeom;
  cellW: number;
  cellD: number;
  animating: boolean;
  sunDirRef: SunDirRef;
  tallyRef: React.MutableRefObject<{ sun: number; total: number }[]>;
  index: number;
}) {
  const panelRef = useRef<THREE.Mesh>(null);
  const ghostRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const fillRef = useRef<THREE.Mesh>(null);
  const rayOrigin = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    rayOrigin.current.set(cell.worldX, cell.roofY + 0.02, cell.worldZ);
    const sunDir = sunDirRef.current;
    let shaded = false;
    for (const b of BUILDINGS) {
      if (b.height < cell.roofY) continue;
      const aabb = aabbFromBuilding(b);
      if (rayHitsAABB(rayOrigin.current, sunDir, aabb.min, aabb.max)) {
        shaded = true;
        break;
      }
    }

    if (animating) {
      const tally = tallyRef.current[index];
      tally.total += dt;
      if (!shaded) tally.sun += dt;

      if (panelRef.current) panelRef.current.visible = false;
      if (ghostRef.current) {
        const gm = ghostRef.current.material as THREE.MeshBasicMaterial;
        gm.opacity = shaded ? 0.45 : 0.18;
      }
      if (haloRef.current) {
        const hm = haloRef.current.material as THREE.MeshBasicMaterial;
        hm.opacity = shaded ? 0 : 0.7;
        haloRef.current.scale.setScalar(0.9 + Math.sin(performance.now() / 220 + index) * 0.06);
      }
      if (fillRef.current) {
        const frac = tally.total > 0 ? tally.sun / tally.total : 0;
        fillRef.current.scale.x = Math.max(0.001, frac);
        const fm = fillRef.current.material as THREE.MeshBasicMaterial;
        fm.opacity = 0.88;
      }
    } else {
      const tally = tallyRef.current[index];
      const frac = tally.total > 0 ? tally.sun / tally.total : 1;
      const place = frac >= 0.55;
      if (panelRef.current) {
        panelRef.current.visible = place;
        panelRef.current.scale.setScalar(1);
        panelRef.current.position.y = 0;
      }
      if (ghostRef.current) {
        const gm = ghostRef.current.material as THREE.MeshBasicMaterial;
        gm.opacity = place ? 0 : 0.45;
      }
      if (haloRef.current) {
        const hm = haloRef.current.material as THREE.MeshBasicMaterial;
        hm.opacity = 0;
      }
      if (fillRef.current) {
        const fm = fillRef.current.material as THREE.MeshBasicMaterial;
        fm.opacity = 0;
      }
    }
  });

  return (
    <group position={[cell.localX, 0, cell.localZ]}>
      {/* shade overlay (visible when currently shaded) */}
      <mesh ref={ghostRef} position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[cellW, cellD]} />
        <meshBasicMaterial color={THEME.ink900} transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* sun halo (visible when currently lit) */}
      <mesh ref={haloRef} position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.min(cellW, cellD) * 0.32, Math.min(cellW, cellD) * 0.48, 24]} />
        <meshBasicMaterial color={THEME.laneLine} transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* sun-hour fill bar inside the cell (left-anchored) */}
      <group position={[-cellW / 2, 0.012, cellD * 0.42]}>
        <mesh ref={fillRef} position={[cellW / 2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0, 1, 1]}>
          <planeGeometry args={[cellW, cellD * 0.12]} />
          <meshBasicMaterial color={THEME.forest700} transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      {/* solid solar panel placed at end */}
      <mesh ref={panelRef} rotation={[-Math.PI / 2 + 0.08, 0, 0]} castShadow>
        <boxGeometry args={[cellW, 0.04, cellD]} />
        <meshStandardMaterial color={THEME.forest700} roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

function SolarHud({
  animating,
  elapsedRef,
  tallyRef,
}: {
  animating: boolean;
  elapsedRef: ElapsedRef;
  tallyRef: React.MutableRefObject<{ sun: number; total: number }[]>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const tallyDomRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    if (!wrapRef.current) return;
    if (!animating) {
      wrapRef.current.style.opacity = '0';
      return;
    }
    wrapRef.current.style.opacity = '1';
    const t = Math.min(1, elapsedRef.current / SOLAR_DAY_DURATION);
    const hourFloat = 6 + t * 12;
    const hour = Math.floor(hourFloat);
    const ampm = hour < 12 ? 'AM' : 'PM';
    const dispHour = hour === 0 || hour === 12 ? 12 : hour % 12;
    if (timeRef.current) timeRef.current.textContent = `Time of day · ${dispHour}:00 ${ampm}`;
    const tallies = tallyRef.current;
    const fractions = tallies.map((x) => (x.total > 0 ? x.sun / x.total : 0));
    const clear = fractions.filter((x) => x >= 0.55).length;
    if (tallyDomRef.current) tallyDomRef.current.textContent = `${clear} of ${tallies.length} cells ≥ 55% sun-hours so far`;
    if (barRef.current) barRef.current.style.width = `${t * 100}%`;
  });

  return (
    <Html position={[0, 1.6, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
      <div
        ref={wrapRef}
        style={{
          opacity: 0,
          transition: 'opacity 220ms ease',
          background: 'rgba(31,42,38,0.92)',
          color: '#E2DFDA',
          padding: '12px 16px',
          borderRadius: 12,
          minWidth: 280,
          boxShadow: '0 18px 38px rgba(31,42,38,0.32)',
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8BA49A', marginBottom: 4 }}>
          Solar day-cycle · live ray-cast
        </div>
        <div ref={timeRef} style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }} />
        <div ref={tallyDomRef} style={{ fontSize: 12, marginTop: 2, color: '#CBDED3' }} />
        <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: 'rgba(226,223,218,0.18)', overflow: 'hidden' }}>
          <div ref={barRef} style={{ height: '100%', width: '0%', background: '#F4E4B8', transition: 'width 60ms linear' }} />
        </div>
      </div>
    </Html>
  );
}

// ─── Sun arc animator + visible sun marker ─────────────────────────────────
function SolarClock({ state, elapsedRef }: { state: FlowState; elapsedRef: ElapsedRef }) {
  const lastStep = useRef(state.step);
  useFrame((_, dt) => {
    const animating = state.step === 'planning-animating-solar';
    if (animating && lastStep.current !== 'planning-animating-solar') {
      elapsedRef.current = 0;
    }
    if (animating) {
      elapsedRef.current += dt;
    } else if (state.step !== 'planning-complete') {
      elapsedRef.current = 0;
    }
    lastStep.current = state.step;
  });
  return null;
}

const DEFAULT_SUN_DIR = new THREE.Vector3(0.4, 0.85, 0.35).normalize();

function SolarSun({
  active,
  elapsedRef,
  sunDirRef,
  lightRef,
}: {
  active: boolean;
  elapsedRef: ElapsedRef;
  sunDirRef: SunDirRef;
  lightRef: React.RefObject<THREE.DirectionalLight | null>;
}) {
  const tmp = useRef(new THREE.Vector3());
  useFrame(() => {
    if (active) {
      const t = Math.min(1, elapsedRef.current / SOLAR_DAY_DURATION);
      const angle = (t - 0.5) * Math.PI * 0.85;
      const sx = -Math.sin(angle);
      const sy = Math.max(0.22, Math.cos(angle));
      tmp.current.set(sx, sy, 0.32).normalize();
      sunDirRef.current.lerp(tmp.current, 0.5);
    } else {
      sunDirRef.current.lerp(DEFAULT_SUN_DIR, 0.06);
    }
    if (lightRef.current) {
      const p = sunDirRef.current;
      lightRef.current.position.set(p.x * 14, p.y * 14 + 2, p.z * 14 + 4);
    }
  });
  return null;
}

function SunMarker({
  active,
  sunDirRef,
  focusPos,
}: {
  active: boolean;
  sunDirRef: SunDirRef;
  focusPos: [number, number] | null;
}) {
  const ref = useRef<THREE.Group>(null);
  const intensity = useRef(0);
  useFrame(() => {
    if (!ref.current) return;
    const target = active && focusPos ? 1 : 0;
    intensity.current += (target - intensity.current) * 0.1;
    ref.current.visible = intensity.current > 0.04;
    if (focusPos) {
      const dir = sunDirRef.current;
      ref.current.position.set(
        focusPos[0] + dir.x * 6,
        Math.max(0.5, dir.y * 7 + 1.5),
        focusPos[1] + dir.z * 6,
      );
      ref.current.scale.setScalar(intensity.current);
    }
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.42, 16, 12]} />
        <meshStandardMaterial color={THEME.laneLine} emissive={THEME.laneLine} emissiveIntensity={1.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.85, 16, 12]} />
        <meshBasicMaterial color={THEME.laneLine} transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── Placed EVSE ────────────────────────────────────────────────────────────
function PlacedEvse({
  position,
  isAnimating,
  hasSolar,
  animatingSolar,
  solarElapsedRef,
  sunDirRef,
}: {
  position: [number, number];
  isAnimating: boolean;
  hasSolar: boolean;
  animatingSolar: boolean;
  solarElapsedRef: ElapsedRef;
  sunDirRef: SunDirRef;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    t.current += dt;
    if (groupRef.current) {
      const p = isAnimating ? Math.min(1, t.current / 1.4) : 1;
      const e = easeOutCubic(p);
      groupRef.current.scale.setScalar(e);
    }
  });

  return (
    <group position={[position[0], 0, position[1]]}>
      <RoundedBox args={[2.2, 0.14, 2.2]} radius={0.08} smoothness={3} position={[0, 0.1, 0]} receiveShadow>
        <meshStandardMaterial color={THEME.pavement} roughness={1} />
      </RoundedBox>
      <group ref={groupRef}>
        {[
          [-0.7, 0.17, -0.55],
          [0.0, 0.17, -0.55],
          [0.7, 0.17, -0.55],
          [-0.7, 0.17, 0.45],
          [0.0, 0.17, 0.45],
          [0.7, 0.17, 0.45],
        ].map((p, i) => (
          <ChargingPole key={i} position={p as [number, number, number]} delay={i * 0.08} />
        ))}
        <EvMesh position={[-0.7, 0.27, -0.18]} />
        <EvMesh position={[0.0, 0.27, -0.18]} delay={0.2} />
        {(hasSolar || animatingSolar) && (
          <SolarCanopy
            position={[0, 1.6, 0]}
            animating={animatingSolar}
            origin={[position[0], 1.6, position[1]]}
            solarElapsedRef={solarElapsedRef}
            sunDirRef={sunDirRef}
          />
        )}
      </group>
    </group>
  );
}

function ChargingPole({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const ref = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.MeshStandardMaterial>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    if (ref.current) {
      const e = easeOutCubic(Math.min(1, Math.max(0, t.current - delay) / 0.5));
      ref.current.scale.y = e;
      ref.current.position.y = position[1] + (0.55 / 2) * e;
    }
    if (lightRef.current) {
      lightRef.current.emissiveIntensity = 0.5 + Math.sin(t.current * 3) * 0.4;
    }
  });
  return (
    <group ref={ref} position={position}>
      <RoundedBox args={[0.16, 0.55, 0.14]} radius={0.04} smoothness={3} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color={THEME.forest700} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, 0.18, 0.075]}>
        <planeGeometry args={[0.1, 0.08]} />
        <meshStandardMaterial ref={lightRef} color={THEME.mint50} emissive={THEME.mint50} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function EvMesh({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    if (ref.current) {
      const elapsed = Math.max(0, t.current - delay);
      const e = easeOutCubic(Math.min(1, elapsed / 0.6));
      ref.current.scale.setScalar(e);
    }
  });
  return (
    <group ref={ref} position={position}>
      <RoundedBox args={[0.6, 0.2, 0.32]} radius={0.06} smoothness={3} castShadow>
        <meshStandardMaterial color={THEME.sand400} roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.18, 0.3]} radius={0.05} smoothness={3} position={[-0.04, 0.16, 0]}>
        <meshStandardMaterial color={THEME.forest700} roughness={0.6} />
      </RoundedBox>
    </group>
  );
}

function SolarCanopy({ position, animating, origin, solarElapsedRef, sunDirRef }: {
  position: [number, number, number];
  animating: boolean;
  origin: [number, number, number];
  solarElapsedRef: ElapsedRef;
  sunDirRef: SunDirRef;
}) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    if (ref.current) {
      const p = animating ? Math.min(1, t.current / 0.9) : 1;
      const e = easeOutBack(p);
      ref.current.scale.setScalar(e);
      ref.current.position.y = position[1] + (1 - e) * 1.5;
    }
  });
  return (
    <group ref={ref} position={position}>
      {[[-0.95, -0.7, -0.95], [0.95, -0.7, -0.95], [-0.95, -0.7, 0.95], [0.95, -0.7, 0.95]].map((p, i) => (
        <Cylinder key={i} args={[0.05, 0.05, 1.4, 8]} position={p as [number, number, number]}>
          <meshStandardMaterial color={THEME.forest700} roughness={0.7} />
        </Cylinder>
      ))}
      <ShadeAwareSolarRoof
        origin={origin}
        localOrigin={[0, 0, 0]}
        roofWidth={2.0}
        roofDepth={2.0}
        buildingHeight={1.6}
        animating={animating}
        elapsedRef={solarElapsedRef}
        sunDirRef={sunDirRef}
      />
    </group>
  );
}

// ─── Cars on roads ──────────────────────────────────────────────────────────
type ElapsedRef = React.MutableRefObject<number>;

function CarTraffic({
  road,
  removeFromTimeline,
  count = 8,
  elapsedRef,
  removeBaseDelay = 1.0,
  perCarStagger = 0.4,
}: {
  road: Road;
  removeFromTimeline: boolean;
  count?: number;
  elapsedRef: ElapsedRef;
  removeBaseDelay?: number;
  perCarStagger?: number;
}) {
  const cars = useMemo(() => {
    const list: { offset: number; color: string; lane: number; speed: number; isMotorbike: boolean }[] = [];
    for (let i = 0; i < count; i++) {
      const isMotorbike = i % 3 === 0;
      list.push({
        offset: (i / count) * road.length - road.length / 2,
        color: i % 4 === 0 ? THEME.alertRed : i % 4 === 1 ? THEME.sand400 : i % 4 === 2 ? THEME.sage400 : THEME.forest700,
        lane: i % 2 === 0 ? -0.18 : 0.18,
        speed: 0.5 + (i % 3) * 0.2,
        isMotorbike,
      });
    }
    return list;
  }, [road.length, count]);

  return (
    <group>
      {cars.map((c, i) => (
        <RoadVehicle
          key={i}
          road={road}
          offset={c.offset}
          color={c.color}
          lane={c.lane}
          speed={c.speed}
          isMotorbike={c.isMotorbike}
          removeFromTimeline={removeFromTimeline}
          removeStartAt={removeBaseDelay + i * perCarStagger}
          elapsedRef={elapsedRef}
        />
      ))}
    </group>
  );
}

function RoadVehicle({
  road,
  offset,
  color,
  lane,
  speed,
  isMotorbike,
  removeFromTimeline,
  removeStartAt,
  elapsedRef,
}: {
  road: Road;
  offset: number;
  color: string;
  lane: number;
  speed: number;
  isMotorbike: boolean;
  removeFromTimeline: boolean;
  removeStartAt: number;
  elapsedRef: ElapsedRef;
}) {
  const ref = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const frozen = useRef<number | null>(null);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const elapsed = elapsedRef.current;
    const personalT = removeFromTimeline ? elapsed - removeStartAt : -1;
    const isRemoving = personalT >= 0;

    if (isRemoving && frozen.current === null) frozen.current = t.current;
    if (!isRemoving) frozen.current = null;

    if (!isRemoving) t.current += dt * speed;

    const travT = frozen.current ?? t.current;
    const trav = ((offset + travT) % road.length + road.length) % road.length - road.length / 2;
    if (road.axis === 'x') {
      ref.current.position.x = trav;
      ref.current.position.z = road.center + lane;
      ref.current.rotation.y = 0;
    } else {
      ref.current.position.z = trav;
      ref.current.position.x = road.center + lane;
      ref.current.rotation.y = Math.PI / 2;
    }

    if (isRemoving) {
      const flashWindow = 0.35;
      const fadeWindow = 0.65;
      const flashT = Math.min(1, personalT / flashWindow);
      const fadeT = Math.max(0, Math.min(1, (personalT - flashWindow) / fadeWindow));
      const e = easeOutCubic(fadeT);
      ref.current.position.y = 0.38 + e * 1.4;
      ref.current.scale.setScalar(Math.max(0.001, 1 - e));
      if (haloRef.current) {
        const haloMat = haloRef.current.material as THREE.MeshBasicMaterial;
        const haloOpacity = Math.sin(flashT * Math.PI) * (1 - fadeT) * 0.9;
        haloMat.opacity = haloOpacity;
        haloRef.current.scale.setScalar(1 + flashT * 0.8);
      }
    } else {
      ref.current.position.y = 0.38;
      ref.current.scale.setScalar(1);
      if (haloRef.current) {
        const haloMat = haloRef.current.material as THREE.MeshBasicMaterial;
        haloMat.opacity = 0;
      }
    }
  });

  const carBody = isMotorbike ? (
    <>
      <RoundedBox args={[0.38, 0.14, 0.16]} radius={0.04} smoothness={3} castShadow>
        <meshStandardMaterial color={color} roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.16, 0.16, 0.14]} radius={0.04} smoothness={3} position={[-0.04, 0.14, 0]}>
        <meshStandardMaterial color={THEME.ink900} roughness={0.7} />
      </RoundedBox>
    </>
  ) : (
    <>
      <RoundedBox args={[0.5, 0.18, 0.26]} radius={0.05} smoothness={3} castShadow>
        <meshStandardMaterial color={color} roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.28, 0.14, 0.24]} radius={0.04} smoothness={3} position={[-0.04, 0.14, 0]}>
        <meshStandardMaterial color={THEME.ink900} roughness={0.6} />
      </RoundedBox>
    </>
  );

  return (
    <group ref={ref}>
      {carBody}
      <mesh ref={haloRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.32, 0.42, 24]} />
        <meshBasicMaterial color={THEME.alertRed} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── Replacement EVs (roll in after the ban) ────────────────────────────────
function ReplacementEvs({
  road,
  elapsedRef,
  activateAt = 8.0,
  stagger = 0.4,
  total = 5,
}: {
  road: Road;
  elapsedRef: ElapsedRef;
  activateAt?: number;
  stagger?: number;
  total?: number;
}) {
  const evs = useMemo(() => {
    const list: { offset: number; lane: number; speed: number }[] = [];
    for (let i = 0; i < total; i++) {
      list.push({
        offset: (i / total) * road.length - road.length / 2,
        lane: i % 2 === 0 ? -0.18 : 0.18,
        speed: 0.5 + (i % 2) * 0.15,
      });
    }
    return list;
  }, [road.length, total]);

  const [visible, setVisible] = useState(0);
  useFrame(() => {
    const elapsed = elapsedRef.current;
    let target = 0;
    if (elapsed >= activateAt) {
      target = Math.min(evs.length, Math.floor((elapsed - activateAt) / stagger) + 1);
    }
    if (target !== visible) setVisible(target);
  });

  return (
    <group>
      {evs.slice(0, visible).map((e, i) => (
        <ReplacementEv key={i} road={road} offset={e.offset} lane={e.lane} speed={e.speed} />
      ))}
    </group>
  );
}

function ReplacementEv({ road, offset, lane, speed }: { road: Road; offset: number; lane: number; speed: number }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    if (!ref.current) return;
    const p = Math.min(1, t.current / 0.5);
    const e = easeOutBack(p);
    ref.current.scale.setScalar(e);
    const trav = ((offset + t.current * speed) % road.length + road.length) % road.length - road.length / 2;
    if (road.axis === 'x') {
      ref.current.position.x = trav;
      ref.current.position.z = road.center + lane;
      ref.current.rotation.y = 0;
    } else {
      ref.current.position.z = trav;
      ref.current.position.x = road.center + lane;
      ref.current.rotation.y = Math.PI / 2;
    }
    ref.current.position.y = 0.38;
  });
  return (
    <group ref={ref} scale={0}>
      <RoundedBox args={[0.5, 0.18, 0.26]} radius={0.05} smoothness={3} castShadow>
        <meshStandardMaterial color={THEME.mint50} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.28, 0.14, 0.24]} radius={0.04} smoothness={3} position={[-0.04, 0.14, 0]}>
        <meshStandardMaterial color={THEME.forest700} roughness={0.5} emissive={THEME.forest700} emissiveIntensity={0.2} />
      </RoundedBox>
    </group>
  );
}

// ─── Policy trees (carbon-equiv) ────────────────────────────────────────────
function PolicyTrees({
  road,
  elapsedRef,
  activateAt = 6.0,
  stagger = 0.13,
}: {
  road: Road;
  elapsedRef: ElapsedRef;
  activateAt?: number;
  stagger?: number;
}) {
  const trees = useMemo(() => {
    const list: { pos: [number, number, number]; scale: number }[] = [];
    const n = 18;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n - 0.5;
      const side = i % 2 === 0 ? -1 : 1;
      const offset = (road.width / 2 + 0.65) * side;
      const pos: [number, number, number] = road.axis === 'x'
        ? [t * road.length, 0.04, road.center + offset]
        : [road.center + offset, 0.04, t * road.length];
      list.push({ pos, scale: 0.6 + (i % 3) * 0.08 });
    }
    return list;
  }, [road]);

  const [visible, setVisible] = useState(0);
  useFrame(() => {
    const elapsed = elapsedRef.current;
    let target = 0;
    if (elapsed >= activateAt) {
      target = Math.min(trees.length, Math.floor((elapsed - activateAt) / stagger) + 1);
    }
    if (target !== visible) setVisible(target);
  });

  return (
    <group>
      {trees.slice(0, visible).map((tt, i) => (
        <Tree key={i} position={tt.pos} scale={tt.scale} delay={0} />
      ))}
    </group>
  );
}

// ─── Pollution fog ──────────────────────────────────────────────────────────
function PollutionFog({
  road,
  elapsedRef,
  policyActive,
  dissipateAt = 3.8,
}: {
  road: Road;
  elapsedRef: ElapsedRef;
  policyActive: boolean;
  dissipateAt?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  const dissipateT = useRef(0);

  const blobs = useMemo(() => {
    const list: { basePos: [number, number, number]; baseY: number; scale: number; phase: number }[] = [];
    const n = 22;
    for (let i = 0; i < n; i++) {
      const tt = (i + 0.5) / n - 0.5;
      // Deterministic pseudo-random scatter so a fresh river of smog appears
      // dense and natural rather than evenly spaced.
      const heightOffset = ((i * 7919) % 100) / 100;     // 0..1
      const lateralOffset = (((i * 6113) % 100) / 100 - 0.5) * road.width * 0.55;
      const baseY = 0.55 + heightOffset * 0.6;            // 0.55..1.15
      const basePos: [number, number, number] = road.axis === 'x'
        ? [tt * road.length, baseY, road.center + lateralOffset]
        : [road.center + lateralOffset, baseY, tt * road.length];
      const scale = 1.6 + ((i * 4931) % 100) / 100 * 0.9; // 1.6..2.5
      const phase = ((i * 8147) % 100) / 100 * Math.PI * 2;
      list.push({ basePos, baseY, scale, phase });
    }
    return list;
  }, [road]);

  useFrame((_, dt) => {
    t.current += dt;
    const elapsed = elapsedRef.current;
    const shouldDissipate = policyActive && elapsed >= dissipateAt;
    if (shouldDissipate && dissipateT.current < 1) {
      dissipateT.current = Math.min(1, dissipateT.current + dt * 0.45);
    } else if (!shouldDissipate && dissipateT.current > 0) {
      dissipateT.current = Math.max(0, dissipateT.current - dt * 0.6);
    }
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      const blob = blobs[i];
      if (!blob) return;
      const sprite = child as THREE.Sprite;
      const mat = sprite.material as THREE.SpriteMaterial;
      const breath = 0.55 + Math.sin(t.current * 0.9 + blob.phase) * 0.12;
      mat.opacity = breath * (1 - dissipateT.current);
      // Each blob drifts and rises as it dissipates upwards
      sprite.position.y = blob.baseY + dissipateT.current * 2.4 + Math.sin(t.current * 0.5 + blob.phase) * 0.08;
    });
  });

  return (
    <group ref={ref}>
      {blobs.map((b, i) => (
        <sprite key={i} position={b.basePos} scale={[b.scale, b.scale, 1]}>
          <spriteMaterial color={THEME.fog} transparent opacity={0.55} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

// ─── Policy timing clock + on-screen phase callouts ────────────────────────
function PolicyClock({ state, elapsedRef }: { state: FlowState; elapsedRef: ElapsedRef }) {
  const lastStep = useRef(state.step);
  useFrame((_, dt) => {
    const isAnimating = state.step === 'policy-animating';
    if (isAnimating && lastStep.current !== 'policy-animating') {
      elapsedRef.current = 0;
    }
    if (isAnimating) {
      elapsedRef.current += dt;
    } else if (state.step !== 'policy-complete') {
      elapsedRef.current = 0;
    }
    lastStep.current = state.step;
  });
  return null;
}

type Phase = { startAt: number; endAt: number; text: string; sub: string };
const POLICY_PHASES: Phase[] = [
  { startAt: 1.2, endAt: 4.0, text: 'Phase 1 — Banning fossil-fuel motorbikes', sub: 'Removing non-EV fleet from corridor' },
  { startAt: 4.4, endAt: 6.6, text: 'Phase 2 — Air quality recovering', sub: 'PM2.5 dropping ~22% along curb' },
  { startAt: 6.8, endAt: 8.6, text: 'Phase 3 — Carbon equivalent', sub: '~640 mature trees planted on roadside' },
  { startAt: 8.8, endAt: 11.0, text: 'Phase 4 — Electric fleet deploying', sub: 'Replacement EVs roll onto the corridor' },
];

function PolicyTimeline({
  road,
  elapsedRef,
  active,
}: {
  road: Road | null;
  elapsedRef: ElapsedRef;
  active: boolean;
}) {
  const titleRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    if (!titleRef.current || !subRef.current || !wrapRef.current || !barRef.current) return;
    if (!active) {
      wrapRef.current.style.opacity = '0';
      return;
    }
    wrapRef.current.style.opacity = '1';
    const elapsed = elapsedRef.current;
    const current = POLICY_PHASES.find((p) => elapsed >= p.startAt && elapsed <= p.endAt);
    if (current) {
      const fadeIn = Math.min(1, (elapsed - current.startAt) / 0.4);
      const fadeOut = Math.min(1, (current.endAt - elapsed) / 0.4);
      const opacity = Math.min(fadeIn, fadeOut);
      titleRef.current.style.opacity = String(opacity);
      subRef.current.style.opacity = String(opacity * 0.85);
      titleRef.current.style.transform = `translateY(${(1 - opacity) * -6}px)`;
      titleRef.current.textContent = current.text;
      subRef.current.textContent = current.sub;
    } else {
      titleRef.current.style.opacity = '0';
      subRef.current.style.opacity = '0';
    }
    const total = 11;
    const p = Math.max(0, Math.min(1, elapsed / total));
    barRef.current.style.width = `${p * 100}%`;
  });

  if (!road) return null;
  const anchor: [number, number, number] = road.axis === 'x'
    ? [-2, 3.4, road.center - 0.6]
    : [road.center - 0.6, 3.4, -2];

  return (
    <Html position={anchor} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
      <div
        ref={wrapRef}
        style={{
          opacity: 0,
          transition: 'opacity 220ms ease',
          background: 'rgba(31, 42, 38, 0.92)',
          color: '#E2DFDA',
          padding: '14px 20px',
          borderRadius: 14,
          minWidth: 320,
          boxShadow: '0 18px 38px rgba(31,42,38,0.32)',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8BA49A', marginBottom: 6 }}>
          Live policy simulation
        </div>
        <div
          ref={titleRef}
          style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', transition: 'opacity 160ms ease, transform 220ms ease', minHeight: 22 }}
        />
        <div
          ref={subRef}
          style={{ fontSize: 13, marginTop: 2, color: '#CBDED3', transition: 'opacity 160ms ease', minHeight: 18 }}
        />
        <div style={{ marginTop: 10, height: 4, borderRadius: 999, background: 'rgba(226,223,218,0.18)', overflow: 'hidden' }}>
          <div ref={barRef} style={{ height: '100%', width: '0%', background: '#CBDED3', transition: 'width 60ms linear' }} />
        </div>
      </div>
    </Html>
  );
}

// ─── Camera rig ─────────────────────────────────────────────────────────────
function CameraRig({
  state,
  controlsRef,
}: {
  state: FlowState;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const targetVec = useRef(new THREE.Vector3(0, 0, 0));
  const posVec = useRef(new THREE.Vector3(16, 13, 16));
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      camera.position.set(16, 13, 16);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
      initialized.current = true;
    }
  }, [camera, controlsRef]);

  useFrame(() => {
    const selectedRoad = roadById(state.selectedRoadId);
    const goal = computeCameraGoal(state, selectedRoad);
    if (!goal) return;

    posVec.current.lerp(goal.pos, 0.045);
    targetVec.current.lerp(goal.target, 0.045);

    if (goal.locked) {
      camera.position.copy(posVec.current);
      camera.lookAt(targetVec.current);
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
        controlsRef.current.target.copy(targetVec.current);
        controlsRef.current.update();
      }
    } else {
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
        controlsRef.current.target.lerp(goal.target, 0.045);
        controlsRef.current.update();
      }
    }
  });
  return null;
}

function computeCameraGoal(state: FlowState, selectedRoad: Road | null): { pos: THREE.Vector3; target: THREE.Vector3; locked: boolean } | null {
  // planning focus (locked during animations, free during ask-solar/complete)
  if (state.mode === 'planning' && state.selectedPosition) {
    const [px, pz] = state.selectedPosition;
    if (state.step === 'planning-animating') {
      return {
        pos: new THREE.Vector3(px + 5.5, 5.5, pz + 5.5),
        target: new THREE.Vector3(px, 1.6, pz),
        locked: true,
      };
    }
    if (state.step === 'planning-animating-solar') {
      return {
        pos: new THREE.Vector3(px + 3.2, 6.4, pz + 3.2),
        target: new THREE.Vector3(px, 3.0, pz),
        locked: true,
      };
    }
    if (state.step === 'planning-ask-solar' || state.step === 'planning-complete') {
      return {
        pos: new THREE.Vector3(px + 7, 6.5, pz + 7),
        target: new THREE.Vector3(px, 2.0, pz),
        locked: false,
      };
    }
  }
  // policy zoom
  if (selectedRoad && (state.step === 'policy-animating' || state.step === 'policy-complete')) {
    const r = selectedRoad;
    if (state.step === 'policy-animating') {
      if (r.axis === 'x') {
        return {
          pos: new THREE.Vector3(r.length / 2 - 4, 1.8, r.center + 3.2),
          target: new THREE.Vector3(-1, 0.3, r.center),
          locked: true,
        };
      }
      return {
        pos: new THREE.Vector3(r.center + 3.2, 1.8, r.length / 2 - 4),
        target: new THREE.Vector3(r.center, 0.3, -1),
        locked: true,
      };
    }
    // policy-complete: zoom out a bit but stay focused on the corridor
    if (r.axis === 'x') {
      return {
        pos: new THREE.Vector3(0, 7, r.center + 8),
        target: new THREE.Vector3(0, 0.3, r.center),
        locked: false,
      };
    }
    return {
      pos: new THREE.Vector3(r.center + 8, 7, 0),
      target: new THREE.Vector3(r.center, 0.3, 0),
      locked: false,
    };
  }
  return { pos: new THREE.Vector3(16, 13, 16), target: new THREE.Vector3(0, 0, 0), locked: false };
}

// ─── Main Scene ─────────────────────────────────────────────────────────────
export default function Scene({ state, onPickGround, onPickRoad }: SceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const sunDirRef = useRef(new THREE.Vector3(0.4, 0.85, 0.35).normalize());
  const policyElapsedRef = useRef(0);
  const solarElapsedRef = useRef(0);
  const [preview, setPreview] = useState<{ pos: WorldPos | null; valid: boolean }>({ pos: null, valid: false });

  const placedObstacles = useMemo<Obstacle[]>(
    () =>
      state.placed.map((p) => ({
        pos: p.position,
        size: p.kind === 'evse' ? ([2.2, 2.2] as [number, number]) : ([1.6, 1.6] as [number, number]),
        height: p.kind === 'evse' ? 0.6 : 3.6,
      })),
    [state.placed],
  );

  const pickGround = state.step === 'planning-await-where';
  const pickRoad = state.step === 'policy-await-road';
  const animatingSolar = state.step === 'planning-animating-solar';
  const policyAnimating = state.step === 'policy-animating' || state.step === 'policy-complete';
  const selectedRoad = roadById(state.selectedRoadId);

  // reset preview when leaving pick mode
  useEffect(() => {
    if (!pickGround) setPreview({ pos: null, valid: false });
  }, [pickGround]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [16, 13, 16], fov: 32 }}
      style={{ background: THEME.bone100 }}
    >
      <color attach="background" args={[THEME.bone100]} />
      <ambientLight intensity={0.35} color={'#FFFFFF'} />
      <hemisphereLight intensity={0.3} groundColor={THEME.ground} color={THEME.bone100} />
      <directionalLight
        ref={sunLightRef}
        castShadow
        position={[8, 14, 7]}
        intensity={1.35}
        color={THEME.sun}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
      />

      <Suspense fallback={null}>
        <LandSlab />
        <BasePropsScene />

        {/* Ground placement layer */}
        <PlacementInteractor
          active={pickGround}
          intent={state.intent}
          placedObstacles={placedObstacles}
          onPick={onPickGround}
          onPreviewChange={setPreview}
        />
        {pickGround && <GhostPreview preview={preview} intent={state.intent} />}

        {/* Road picking layer (policy mode) */}
        {ROADS.map((r) => (
          <RoadHit
            key={r.id}
            road={r}
            active={pickRoad}
            selected={r.id === state.selectedRoadId}
            onClick={() => onPickRoad(r.id)}
          />
        ))}

        {/* Road traffic — show only in policy mode for clarity */}
        {state.mode === 'policy' && ROADS.map((r) => {
          const isSelected = r.id === state.selectedRoadId;
          const count = isSelected ? 10 : 6;
          return (
            <CarTraffic
              key={`cars-${r.id}`}
              road={r}
              removeFromTimeline={isSelected && policyAnimating}
              count={count}
              elapsedRef={policyElapsedRef}
            />
          );
        })}

        {/* Replacement EVs on selected corridor after the ban */}
        {selectedRoad && (
          <ReplacementEvs road={selectedRoad} elapsedRef={policyElapsedRef} />
        )}

        {/* Carbon-equivalent trees on the selected road */}
        {selectedRoad && (
          <PolicyTrees road={selectedRoad} elapsedRef={policyElapsedRef} />
        )}

        {/* Pollution fog on the selected road */}
        {selectedRoad && state.mode === 'policy' && (
          <PollutionFog
            road={selectedRoad}
            elapsedRef={policyElapsedRef}
            policyActive={state.step === 'policy-animating' || state.step === 'policy-complete'}
          />
        )}

        {/* Phase callouts overlay during the policy run */}
        <PolicyTimeline
          road={selectedRoad}
          elapsedRef={policyElapsedRef}
          active={state.step === 'policy-animating'}
        />

        <PolicyClock state={state} elapsedRef={policyElapsedRef} />
        <SolarClock state={state} elapsedRef={solarElapsedRef} />
        <SolarSun
          active={animatingSolar}
          elapsedRef={solarElapsedRef}
          sunDirRef={sunDirRef}
          lightRef={sunLightRef}
        />
        <SunMarker
          active={animatingSolar}
          sunDirRef={sunDirRef}
          focusPos={animatingSolar && state.placed.length > 0
            ? state.placed[state.placed.length - 1].position
            : null}
        />

        {/* Placed buildings & EVSE */}
        {state.placed.map((entity, idx) => {
          const isLatest = idx === state.placed.length - 1;
          const isAnimating = isLatest && state.step === 'planning-animating';
          const animSolarLocal = isLatest && animatingSolar;
          if (entity.kind === 'building') {
            return (
              <PlacedBuilding
                key={entity.id}
                position={entity.position}
                isAnimating={isAnimating}
                hasSolar={entity.hasSolar || animSolarLocal}
                animatingSolar={animSolarLocal}
                solarElapsedRef={solarElapsedRef}
                sunDirRef={sunDirRef}
              />
            );
          }
          return (
            <PlacedEvse
              key={entity.id}
              position={entity.position}
              isAnimating={isAnimating}
              hasSolar={entity.hasSolar || animSolarLocal}
              animatingSolar={animSolarLocal}
              solarElapsedRef={solarElapsedRef}
              sunDirRef={sunDirRef}
            />
          );
        })}

        <ContactShadows position={[0, 0.02, 0]} opacity={0.45} scale={28} blur={2.5} far={6} />
      </Suspense>

      <CameraRig state={state} controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={6}
        maxDistance={28}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2.75}
        target={[0, 0, 0]}
        makeDefault
      />
    </Canvas>
  );
}
