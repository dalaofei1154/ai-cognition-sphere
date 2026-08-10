"use client";

import { useEffect } from "react";
import type { Mesh, Sprite, Vector3 } from "three";
import {
  LAYERS,
  OVERVIEW_LANDMARK_KEYS,
  RELATIONS,
  localizedName,
  seeded,
  shouldShowNodeLabel,
  type Concept,
  type Lang,
  type RelationSpec,
  type ViewMode,
} from "./cognition-model";
import { AUTHOR_PATH, AUTHOR_PATH_SET, tourFrameAt } from "./cognition-tour";
import {
  CORE_RIM_FRAGMENT_SHADER,
  CORE_RIM_VERTEX_SHADER,
  DEPTH_CAMERA_DISTANCES,
  DEPTH_GESTURE_RANGE,
  DEPTH_GESTURE_RESET_MS,
  DEPTH_MAX,
  DEPTH_SNAP_DELAY_MS,
  OVERVIEW_VOLUME,
  PROTECTED_LINE_FRAGMENT_SHADER,
  PROTECTED_LINE_VERTEX_SHADER,
  STELLAR_FRAGMENT_SHADER,
  STELLAR_PROFILES,
  STELLAR_VERTEX_SHADER,
  activeLayerForDepth,
  cameraDistanceForDepth,
  clampDepth,
} from "./sphere-visuals";

type NodeDatum = Concept & {
  pos: Vector3;
  authorPath: boolean;
  order: number;
  mesh?: Mesh;
  halo?: Sprite;
  flare?: Sprite;
  hitMesh?: Mesh;
  label?: HTMLDivElement;
};

type ValueRef<T> = { current: T };
type ElementRef<T> = ValueRef<T | null>;

const TOUR_LABEL_ROTATION_SECONDS = 1.35;
const TOUR_LABEL_PERMUTATION_STRIDE = 47;
const TOUR_LABEL_MINIMUM = 30;
const TOUR_LABEL_MAXIMUM = 46;
const TOUR_LABEL_GRID_WIDTH = 64;
const TOUR_LABEL_GRID_HEIGHT = 20;

type SphereSceneBindings = {
  mountRef: ElementRef<HTMLDivElement>;
  labelsRef: ElementRef<HTMLDivElement>;
  coreLabelRef: ElementRef<HTMLDivElement>;
  depthVeilRef: ElementRef<HTMLDivElement>;
  tourVeilRef: ElementRef<HTMLDivElement>;
  activeLayerRef: ValueRef<number>;
  autoRotateRef: ValueRef<boolean>;
  viewModeRef: ValueRef<ViewMode>;
  selectedKeyRef: ValueRef<string | null>;
  languageRef: ValueRef<Lang>;
  depthTargetRef: ValueRef<number>;
  depthProgressRef: ValueRef<number>;
  overviewResetPendingRef: ValueRef<boolean>;
  isTouringRef: ValueRef<boolean>;
  tourStartedAtRef: ValueRef<number>;
  setWebglFailed: (value: boolean) => void;
  setShowScrollHint: (value: boolean) => void;
  setActiveLayer: (value: number) => void;
  setArrivalLayer: (value: number | null) => void;
  chooseConcept: (key: string) => void;
  exitTour: () => void;
};

export function useSphereScene({
  mountRef,
  labelsRef,
  coreLabelRef,
  depthVeilRef,
  tourVeilRef,
  activeLayerRef,
  autoRotateRef,
  viewModeRef,
  selectedKeyRef,
  languageRef,
  depthTargetRef,
  depthProgressRef,
  overviewResetPendingRef,
  isTouringRef,
  tourStartedAtRef,
  setWebglFailed,
  setShowScrollHint,
  setActiveLayer,
  setArrivalLayer,
  chooseConcept,
  exitTour,
}: SphereSceneBindings) {
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    void Promise.all([
      import("three"),
      import("three/addons/controls/OrbitControls.js"),
    ]).then(([THREE, { OrbitControls }]) => {
      if (disposed) return;
      const mount = mountRef.current;
      const labelRoot = labelsRef.current;
      const coreLabel = coreLabelRef.current;
      const depthVeil = depthVeilRef.current;
      const tourVeil = tourVeilRef.current;
      if (!mount || !labelRoot || !coreLabel || !depthVeil || !tourVeil) return;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020309, 0.017);
      const camera = new THREE.PerspectiveCamera(
        48,
        mount.clientWidth / mount.clientHeight,
        0.1,
        100,
      );
      camera.position.set(0, 1.4, 22);

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
      } catch {
        setWebglFailed(true);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.055;
      controls.minDistance = 4.8;
      controls.maxDistance = 28;
      controls.autoRotateSpeed = 0.25;

      const root = new THREE.Group();
      root.rotation.set(-0.04, -0.08, 0.02);
      scene.add(root);

      const makeProceduralTexture = (
        size: number,
        sample: (radius: number, angle: number, x: number, y: number) => number,
      ) => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) return new THREE.CanvasTexture(canvas);
        const pixels = context.createImageData(size, size);
        for (let py = 0; py < size; py += 1) {
          for (let px = 0; px < size; px += 1) {
            const x = (px + 0.5) / size * 2 - 1;
            const y = (py + 0.5) / size * 2 - 1;
            const radius = Math.sqrt(x * x + y * y);
            const angle = Math.atan2(y, x);
            const alpha = THREE.MathUtils.clamp(sample(radius, angle, x, y), 0, 1);
            const offset = (py * size + px) * 4;
            pixels.data[offset] = 255;
            pixels.data[offset + 1] = 255;
            pixels.data[offset + 2] = 255;
            pixels.data[offset + 3] = Math.round(alpha * 255);
          }
        }
        context.putImageData(pixels, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      };

      const nodeCoronaTexture = makeProceduralTexture(128, (radius, angle) => {
        // Keep the energy ridge outside the solid body silhouette so the
        // brightest band remains visible around the node.
        const irregularity = 0.43
          + Math.sin(angle * 7 + 0.8) * 0.024
          + Math.sin(angle * 17 - 1.2) * 0.016;
        const rim = Math.exp(-Math.pow((radius - irregularity) / 0.058, 2));
        const rayPattern = 0.5 + 0.5 * Math.sin(angle * 13 + Math.sin(angle * 5));
        const corona = radius > irregularity
          ? Math.exp(-(radius - irregularity) * (4.9 + rayPattern * 2.8))
          : 0;
        const quietGlow = Math.exp(-radius * radius * 4.4) * 0.12;
        return rim * 0.78 + corona * (0.14 + rayPattern * 0.18) + quietGlow;
      });

      const coreCoronaTexture = makeProceduralTexture(256, (radius, angle) => {
        const inner = 0.285
          + Math.sin(angle * 5 + 0.4) * 0.014
          + Math.sin(angle * 19 - 1.8) * 0.009;
        const rim = Math.exp(-Math.pow((radius - inner) / 0.026, 2));
        const rays = Math.pow(0.5 + 0.5 * Math.sin(angle * 11 + Math.sin(angle * 4) * 1.8), 5);
        const broad = Math.pow(0.5 + 0.5 * Math.sin(angle * 3 - 0.7), 2);
        const falloff = radius > inner ? Math.exp(-(radius - inner) * (3.8 + broad * 3.4)) : 0;
        const streamer = falloff * (0.10 + rays * 0.38 + broad * 0.12);
        return rim * 0.92 + streamer;
      });

      const flareTexture = makeProceduralTexture(128, (radius, angle, x, y) => {
        if (x < -0.04 || radius > 1) return 0;
        const width = 0.035 + Math.max(x, 0) * 0.16;
        const beam = Math.exp(-(y * y) / width) * Math.exp(-Math.max(x, 0) * 2.4);
        const crown = Math.exp(-radius * radius * 14);
        const fork = Math.exp(-Math.pow(y - Math.sin(x * 9) * 0.11, 2) / (width * 1.6));
        return beam * 0.62 + fork * Math.exp(-Math.max(x, 0) * 3.1) * 0.24 + crown;
      });

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const nodes: NodeDatum[] = [];
      const nodeByKey = new Map<string, NodeDatum>();
      const shells: Mesh[] = [];
      const hitTargets: Mesh[] = [];
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2(99, 99);
      const authorColor = new THREE.Color(0xe6f8ff);
      const colorTarget = new THREE.Color();
      const layerColors = new Map(
        LAYERS.map((layer) => [layer.id, new THREE.Color(layer.color)]),
      );
      let hover: NodeDatum | null = null;
      let press = { x: 0, y: 0 };

      LAYERS.forEach((layer, layerIndex) => {
        const shell = new THREE.Mesh(
          new THREE.SphereGeometry(layer.radius, 42, 26),
          new THREE.MeshBasicMaterial({
            color: layer.color,
            wireframe: true,
            transparent: true,
            opacity: layerIndex === 7 ? 0.068 : 0.011,
          }),
        );
        shell.userData.layer = layer.id;
        shells.push(shell);
        root.add(shell);

        layer.terms.forEach((name, order) => {
          const count = layer.terms.length;
          const y = 1 - (order + 0.5) * 2 / count;
          const phi = Math.acos(y);
          const theta = Math.PI * (1 + Math.sqrt(5)) * order + layerIndex * 0.74;
          const wobble = (seeded(order + layerIndex * 101) - 0.5) * 0.35;
          const radius = layer.radius + wobble;
          const pos = new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta),
          );
          const key = layer.id + ":" + name;
          const authorPath = AUTHOR_PATH_SET.has(key);
          const boundary = layer.id === 8;
          const theoretical = layer.id === 7;
          const stellarProfile = STELLAR_PROFILES[layer.id];
          const stellarSeed = seeded(order + layerIndex * 211 + 41);
          const size = boundary ? 0.16 : theoretical ? 0.1 : 0.073;
          const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(size, boundary ? 28 : 18, boundary ? 22 : 16),
            new THREE.ShaderMaterial({
              uniforms: {
                uColor: { value: new THREE.Color(layer.color) },
                uTime: { value: 0 },
                uSeed: { value: stellarSeed },
                uOpacity: { value: 0.68 },
                uActivity: { value: 0.18 },
                uFocus: { value: 0 },
                uGranulation: { value: stellarProfile.granulation },
                uDrift: { value: stellarProfile.drift },
                uTurbulence: { value: stellarProfile.turbulence },
                uContrast: { value: stellarProfile.contrast },
                uRim: { value: stellarProfile.rim },
                uOverview: { value: 0 },
                uDepthCue: { value: 1 },
              },
              vertexShader: STELLAR_VERTEX_SHADER,
              fragmentShader: STELLAR_FRAGMENT_SHADER,
              transparent: true,
              depthWrite: true,
            }),
          );
          mesh.position.copy(pos);
          mesh.userData = { key, stellarSeed };
          root.add(mesh);

          const halo = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: nodeCoronaTexture,
              color: layer.color,
              transparent: true,
              opacity: boundary ? 0.32 : 0.12,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              depthTest: true,
            }),
          );
          const haloSize = boundary ? 1.28 : theoretical ? 0.74 : 0.48;
          halo.position.copy(pos);
          halo.scale.setScalar(haloSize);
          halo.userData = { key, haloSize };
          root.add(halo);

          const flare = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: flareTexture,
              color: layer.color,
              transparent: true,
              opacity: 0,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              depthTest: true,
            }),
          );
          flare.position.copy(pos);
          flare.scale.set(haloSize * 1.9, haloSize * 1.9, 1);
          flare.visible = false;
          flare.userData = { key, stellarSeed, haloSize };
          root.add(flare);

          const hitMesh = new THREE.Mesh(
            new THREE.SphereGeometry(boundary ? 0.34 : 0.24, 8, 8),
            new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0,
              depthWrite: false,
            }),
          );
          hitMesh.position.copy(pos);
          hitMesh.userData = { key };
          root.add(hitMesh);
          hitTargets.push(hitMesh);

          const datum: NodeDatum = {
            key,
            name,
            layer,
            pos,
            authorPath,
            order,
            mesh,
            halo,
            flare,
            hitMesh,
          };
          const label = document.createElement("div");
          label.className =
            "node-label" +
            (OVERVIEW_LANDMARK_KEYS.has(key) ? " landmark" : "") +
            (boundary ? " boundary-label" : "");
          label.style.setProperty("--layer-color", layer.color);
          label.textContent = localizedName(name, languageRef.current, key);
          labelRoot.appendChild(label);
          datum.label = label;
          nodes.push(datum);
          nodeByKey.set(key, datum);
        });
      });

      const coreCoronaOuter = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: coreCoronaTexture,
          color: 0xffd98a,
          transparent: true,
          opacity: 0.20,
          rotation: 0.24,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: true,
        }),
      );
      coreCoronaOuter.scale.setScalar(3.55);
      coreCoronaOuter.renderOrder = -2;
      root.add(coreCoronaOuter);

      const coreCoronaInner = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: coreCoronaTexture,
          color: 0xc6b5ff,
          transparent: true,
          opacity: 0.105,
          rotation: -0.56,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: true,
        }),
      );
      coreCoronaInner.scale.setScalar(2.8);
      coreCoronaInner.renderOrder = -1;
      root.add(coreCoronaInner);

      const coreRimMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(0xffe4a2) },
          uTime: { value: 0 },
          uOpacity: { value: 0.92 },
        },
        vertexShader: CORE_RIM_VERTEX_SHADER,
        fragmentShader: CORE_RIM_FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const coreRim = new THREE.Mesh(
        new THREE.SphereGeometry(0.565, 64, 48),
        coreRimMaterial,
      );
      coreRim.renderOrder = 2;
      root.add(coreRim);

      const darkCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.52, 64, 48),
        new THREE.MeshBasicMaterial({ color: 0x000005 }),
      );
      darkCore.renderOrder = 3;
      root.add(darkCore);

      const coreLensGroup = new THREE.Group();
      const lensArcMaterials: Array<InstanceType<typeof THREE.MeshBasicMaterial>> = [];
      const createLensArc = (
        points: Array<InstanceType<typeof THREE.Vector3>>,
        radius: number,
        color: number,
        opacity: number,
      ) => {
        const material = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        material.userData.baseOpacity = opacity;
        lensArcMaterials.push(material);
        return new THREE.Mesh(
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(points, false, "centripetal"),
            72,
            radius,
            7,
            false,
          ),
          material,
        );
      };

      const rearUpperLens = createLensArc([
        new THREE.Vector3(-1.03, -0.02, -0.14),
        new THREE.Vector3(-0.78, 0.31, -0.24),
        new THREE.Vector3(-0.34, 0.58, -0.31),
        new THREE.Vector3(0, 0.67, -0.34),
        new THREE.Vector3(0.34, 0.58, -0.31),
        new THREE.Vector3(0.78, 0.31, -0.24),
        new THREE.Vector3(1.03, -0.02, -0.14),
      ], 0.018, 0xffe8aa, 0.50);
      const rearLowerLens = createLensArc([
        new THREE.Vector3(-0.94, -0.03, -0.18),
        new THREE.Vector3(-0.66, -0.29, -0.26),
        new THREE.Vector3(-0.25, -0.46, -0.30),
        new THREE.Vector3(0, -0.50, -0.31),
        new THREE.Vector3(0.25, -0.46, -0.30),
        new THREE.Vector3(0.66, -0.29, -0.26),
        new THREE.Vector3(0.94, -0.03, -0.18),
      ], 0.010, 0xb497ff, 0.23);
      const frontLensBand = createLensArc([
        new THREE.Vector3(-1.18, 0.025, 0.30),
        new THREE.Vector3(-0.64, -0.035, 0.38),
        new THREE.Vector3(0, -0.065, 0.42),
        new THREE.Vector3(0.64, -0.035, 0.38),
        new THREE.Vector3(1.18, 0.025, 0.30),
      ], 0.022, 0xffd36d, 0.78);
      const chromaticLensArc = createLensArc([
        new THREE.Vector3(-0.93, 0.13, 0.05),
        new THREE.Vector3(-0.45, 0.34, 0.16),
        new THREE.Vector3(0.12, 0.38, 0.18),
        new THREE.Vector3(0.72, 0.18, 0.09),
        new THREE.Vector3(0.98, 0.04, 0.02),
      ], 0.009, 0x9f83ff, 0.31);
      frontLensBand.renderOrder = 5;
      chromaticLensArc.renderOrder = 4;
      coreLensGroup.add(rearUpperLens, rearLowerLens, frontLensBand, chromaticLensArc);
      coreLensGroup.rotation.set(-0.10, 0.24, -0.13);
      root.add(coreLensGroup);

      const resolvedRelations = RELATIONS
        .map((spec) => ({
          spec,
          from: nodeByKey.get(spec.source),
          to: nodeByKey.get(spec.target),
        }))
        .filter((item): item is { spec: RelationSpec; from: NodeDatum; to: NodeDatum } =>
          Boolean(item.from && item.to),
        );
      const curvedRelationPoints = (from: NodeDatum, to: NodeDatum, segments = 14) => {
        const midpoint = from.pos.clone().add(to.pos).multiplyScalar(0.5);
        const radial = midpoint.lengthSq() > 0.0001
          ? midpoint.clone().normalize()
          : from.pos.clone().normalize();
        const control = midpoint.add(
          radial.multiplyScalar(Math.min(0.78, from.pos.distanceTo(to.pos) * 0.12)),
        );
        const curve = new THREE.QuadraticBezierCurve3(from.pos, control, to.pos);
        const samples = curve.getPoints(segments);
        return samples.slice(0, -1).flatMap((point, index) => {
          const next = samples[index + 1];
          return [point.x, point.y, point.z, next.x, next.y, next.z];
        });
      };
      const overviewRelations = resolvedRelations.filter(({ from, to }) =>
        OVERVIEW_LANDMARK_KEYS.has(from.key) && OVERVIEW_LANDMARK_KEYS.has(to.key),
      );
      const edgePoints = overviewRelations.flatMap(({ from, to }) =>
        curvedRelationPoints(from, to),
      );
      const edgeGeometry = new THREE.BufferGeometry();
      edgeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(edgePoints, 3));
      const edges = new THREE.LineSegments(
        edgeGeometry,
        new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: new THREE.Color(0x78a9c7) },
            uOpacity: { value: 0.105 },
            uProtectionInner: { value: 0.68 },
            uProtectionOuter: { value: 1.28 },
          },
          vertexShader: PROTECTED_LINE_VERTEX_SHADER,
          fragmentShader: PROTECTED_LINE_FRAGMENT_SHADER,
          transparent: true,
          depthWrite: false,
        }),
      );
      edges.renderOrder = 1;
      edges.userData.relationCount = overviewRelations.length;
      root.add(edges);

      const neighborGeometry = new THREE.BufferGeometry();
      const neighborEdges = new THREE.LineSegments(
        neighborGeometry,
        new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: new THREE.Color(0xe7f7ff) },
            uOpacity: { value: 0.48 },
            uProtectionInner: { value: 0.72 },
            uProtectionOuter: { value: 1.38 },
          },
          vertexShader: PROTECTED_LINE_VERTEX_SHADER,
          fragmentShader: PROTECTED_LINE_FRAGMENT_SHADER,
          transparent: true,
          depthWrite: false,
        }),
      );
      neighborEdges.renderOrder = 3;
      root.add(neighborEdges);

      const pathNodes = AUTHOR_PATH
        .map((key) => nodeByKey.get(key))
        .filter((node): node is NodeDatum => Boolean(node));
      const authorPathProgressByKey = new Map(
        pathNodes.map((node, index) => [node.key, index / (pathNodes.length - 1)]),
      );
      const pathCurve = new THREE.CatmullRomCurve3(
        pathNodes.map((node) => node.pos),
        false,
        "centripetal",
        0.25,
      );
      const pathCoreMaterial = new THREE.MeshBasicMaterial({
        color: 0xb9f2ff,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const pathGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x39cfff,
        transparent: true,
        opacity: 0.065,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const pathCore = new THREE.Mesh(
        new THREE.TubeGeometry(pathCurve, 420, 0.008, 5, false),
        pathCoreMaterial,
      );
      const pathGlow = new THREE.Mesh(
        new THREE.TubeGeometry(pathCurve, 420, 0.038, 6, false),
        pathGlowMaterial,
      );
      pathCore.renderOrder = 6;
      pathGlow.renderOrder = 5;
      root.add(pathGlow, pathCore);

      const flowCount = 40;
      const flowPositions = new Float32Array(flowCount * 3);
      const flowColors = new Float32Array(flowCount * 3);
      for (let i = 0; i < flowCount; i += 1) {
        const brightness = 1 - i / (flowCount * 1.08);
        flowColors.set([brightness, brightness, brightness], i * 3);
      }
      const flowGeometry = new THREE.BufferGeometry();
      flowGeometry.setAttribute("position", new THREE.BufferAttribute(flowPositions, 3));
      flowGeometry.setAttribute("color", new THREE.BufferAttribute(flowColors, 3));
      const flow = new THREE.Points(
        flowGeometry,
        new THREE.PointsMaterial({
          size: 0.075,
          vertexColors: true,
          transparent: true,
          opacity: 0.58,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          sizeAttenuation: true,
        }),
      );
      flow.renderOrder = 7;
      root.add(flow);

      const tourTrailCount = 320;
      const tourTrailPositions = new Float32Array(tourTrailCount * 3);
      const tourTrailGeometry = new THREE.BufferGeometry();
      tourTrailGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(tourTrailPositions, 3),
      );
      const tourTrail = new THREE.Line(
        tourTrailGeometry,
        new THREE.LineBasicMaterial({
          color: 0x9deaff,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: true,
        }),
      );
      const tourTrailInsurance = new THREE.Line(
        tourTrailGeometry,
        new THREE.LineBasicMaterial({
          color: 0x7bdfff,
          transparent: true,
          opacity: 0.028,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,
        }),
      );
      const tourHeadCount = 48;
      const tourHeadPositions = new Float32Array(tourHeadCount * 3);
      const tourHeadGeometry = new THREE.BufferGeometry();
      tourHeadGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(tourHeadPositions, 3),
      );
      const tourHead = new THREE.Line(
        tourHeadGeometry,
        new THREE.LineBasicMaterial({
          color: 0xdaf8ff,
          transparent: true,
          opacity: 0.78,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,
        }),
      );
      const tourTrailParticles = new THREE.Points(
        tourHeadGeometry,
        new THREE.PointsMaterial({
          color: 0xe8fbff,
          size: 0.052,
          transparent: true,
          opacity: 0.46,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,
          sizeAttenuation: true,
        }),
      );
      tourTrail.renderOrder = 8;
      tourTrailInsurance.renderOrder = 9;
      tourHead.renderOrder = 10;
      tourTrailParticles.renderOrder = 11;
      tourTrail.visible = false;
      tourTrailInsurance.visible = false;
      tourHead.visible = false;
      tourTrailParticles.visible = false;
      root.add(tourTrail, tourTrailInsurance, tourHead, tourTrailParticles);

      const starsGeometry = new THREE.BufferGeometry();
      const stars = Array.from({ length: 1500 }, (_, i) => {
        const radius = 14 + seeded(i) * 23;
        const angle = seeded(i + 1700) * Math.PI * 2;
        const z = seeded(i + 3400) * 2 - 1;
        const scale = Math.sqrt(1 - z * z);
        return [
          radius * scale * Math.cos(angle),
          radius * z,
          radius * scale * Math.sin(angle),
        ];
      }).flat();
      starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(stars, 3));
      const starField = new THREE.Points(
        starsGeometry,
        new THREE.PointsMaterial({
          color: 0x9dc7e2,
          size: 0.032,
          transparent: true,
          opacity: 0.52,
          depthWrite: false,
        }),
      );
      scene.add(starField);

      const updatePointer = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      };
      let suppressPointerUp = false;
      const onPointerDown = (event: PointerEvent) => {
        if (isTouringRef.current) {
          suppressPointerUp = true;
          exitTour();
          controls.enabled = true;
        }
        press = { x: event.clientX, y: event.clientY };
      };
      const onPointerMove = (event: PointerEvent) => updatePointer(event);
      const onPointerLeave = () => pointer.set(99, 99);
      const onPointerUp = (event: PointerEvent) => {
        if (suppressPointerUp) {
          suppressPointerUp = false;
          return;
        }
        updatePointer(event);
        if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) return;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(hitTargets)[0];
        const datum = hit ? nodeByKey.get(String(hit.object.userData.key)) : null;
        if (datum) chooseConcept(datum.key);
      };
      renderer.domElement.addEventListener("pointerdown", onPointerDown, true);
      renderer.domElement.addEventListener("pointermove", onPointerMove);
      renderer.domElement.addEventListener("pointerleave", onPointerLeave);
      renderer.domElement.addEventListener("pointerup", onPointerUp);

      let lastWheelEventAt = Number.NEGATIVE_INFINITY;
      let depthSnapAt = Number.NEGATIVE_INFINITY;
      let depthGestureAnchor = 0;
      let depthGestureActive = false;
      let depthSnapPending = false;
      let wasTouring = false;
      const preTourCamera = new THREE.Vector3();
      const preTourTarget = new THREE.Vector3();
      const preTourRootRotation = new THREE.Euler();
      const onWheel = (event: WheelEvent) => {
        if (isTouringRef.current) {
          exitTour();
          controls.enabled = true;
          return;
        }
        if (viewModeRef.current !== "structure" || selectedKeyRef.current) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        setShowScrollHint(false);

        const now = performance.now();
        if (now - lastWheelEventAt > DEPTH_GESTURE_RESET_MS) {
          depthGestureAnchor = depthTargetRef.current;
          depthGestureActive = true;
        }
        lastWheelEventAt = now;
        depthSnapAt = now + DEPTH_SNAP_DELAY_MS;
        depthSnapPending = true;

        const deltaPixels = event.deltaY * (
          event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? 16
            : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
              ? mount.clientHeight
              : 1
        );
        let depthDelta = THREE.MathUtils.clamp(deltaPixels * 0.0032, -0.18, 0.18);
        if (depthDelta > 0) {
          const boundaryResistance = THREE.MathUtils.smoothstep(
            depthTargetRef.current,
            6.5,
            DEPTH_MAX,
          );
          depthDelta *= 1 - boundaryResistance * 0.72;
        }
        depthTargetRef.current = clampDepth(THREE.MathUtils.clamp(
          depthTargetRef.current + depthDelta,
          depthGestureAnchor - DEPTH_GESTURE_RANGE,
          depthGestureAnchor + DEPTH_GESTURE_RANGE,
        ));
      };
      renderer.domElement.addEventListener("wheel", onWheel, {
        passive: false,
        capture: true,
      });

      const projected = new THREE.Vector3();
      const worldPos = new THREE.Vector3();
      let frame = 0;
      let previousLayer = 0;
      let activationStart = 0;
      let shellPulseLayer = 0;
      let shellPulseStart = Number.NEGATIVE_INFINITY;
      let previousGraphSelection: string | null | undefined;
      let previousFrameAt = performance.now();
      let activeTourLabelKeys = new Set<string>();
      let tourLabelSelectionEpoch = -1;
      let tourLabelFocusSignature = "";

      const animate = () => {
        frame = requestAnimationFrame(animate);
        const now = performance.now();
        const frameDelta = Math.min(0.05, Math.max(0.001, (now - previousFrameAt) / 1000));
        previousFrameAt = now;
        const time = now * 0.001;
        const motionTime = reduceMotion ? 0 : time;
        const selectedNodeKey = selectedKeyRef.current;
        const currentViewMode = viewModeRef.current;
        const touring = isTouringRef.current && !selectedNodeKey;
        const tourSeconds = touring ? (now - tourStartedAtRef.current) / 1000 : 0;
        const tourFrame = touring
          ? tourFrameAt(reduceMotion ? Math.floor(tourSeconds / 4) * 4 : tourSeconds)
          : null;
        if (tourFrame && reduceMotion) tourFrame.fade = tourFrameAt(tourSeconds).fade;
        const structureDepthActive = currentViewMode === "structure"
          && !selectedNodeKey
          && !touring;

        if (touring && !wasTouring) {
          preTourCamera.copy(camera.position);
          preTourTarget.copy(controls.target);
          preTourRootRotation.copy(root.rotation);
          depthSnapPending = false;
          depthGestureActive = false;
          depthTargetRef.current = depthProgressRef.current;
          activeTourLabelKeys.clear();
          tourLabelSelectionEpoch = -1;
          tourLabelFocusSignature = "";
          nodes.forEach((node) => {
            node.label!.style.opacity = "0";
          });
        }
        if (!touring && wasTouring) {
          camera.position.copy(preTourCamera);
          controls.target.copy(preTourTarget);
          root.rotation.copy(preTourRootRotation);
          root.updateMatrixWorld(true);
          activeTourLabelKeys.clear();
        }
        wasTouring = touring;

        if (depthSnapPending && now >= depthSnapAt) {
          depthTargetRef.current = Math.round(depthTargetRef.current);
          depthSnapPending = false;
        }
        const depthEase = 1 - Math.exp(-(depthSnapPending ? 6 : 4.2) * frameDelta);
        const depthGap = depthTargetRef.current - depthProgressRef.current;
        depthProgressRef.current = Math.abs(depthGap) < 0.001
          ? depthTargetRef.current
          : depthProgressRef.current + depthGap * depthEase;
        const depthProgress = depthProgressRef.current;
        if (depthGestureActive && !depthSnapPending && Math.abs(depthGap) < 0.012) {
          depthGestureActive = false;
        }

        let selectedLayer = activeLayerRef.current;
        if (structureDepthActive) {
          const nextLayer = activeLayerForDepth(depthProgress, selectedLayer);
          if (nextLayer !== selectedLayer) {
            selectedLayer = nextLayer;
            activeLayerRef.current = nextLayer;
            setActiveLayer(nextLayer);
            if (nextLayer > 0) setArrivalLayer(nextLayer);
          }
        }
        if (selectedLayer !== previousLayer) {
          previousLayer = selectedLayer;
          activationStart = time;
          if (structureDepthActive) {
            shellPulseLayer = Math.max(1, selectedLayer);
            shellPulseStart = time;
            depthVeil.style.setProperty(
              "--depth-color",
              LAYERS[shellPulseLayer - 1].color,
            );
          }
        }

        const rootMotionEase = 1 - Math.exp(-1.8 * frameDelta);
        const rootTargetX = touring && !reduceMotion
          ? -0.04 + Math.sin(tourSeconds * 0.19) * 0.035
          : -0.04;
        const rootTargetZ = touring && !reduceMotion
          ? 0.02 + Math.sin(tourSeconds * 0.14 + 0.8) * 0.022
          : 0.02;
        if (tourFrame) {
          root.rotation.x = rootTargetX;
          root.rotation.y = tourFrame.rootYaw;
          root.rotation.z = rootTargetZ;
        } else {
          root.rotation.x += (rootTargetX - root.rotation.x) * rootMotionEase;
          root.rotation.z += (rootTargetZ - root.rotation.z) * rootMotionEase;
        }
        root.updateMatrixWorld(true);

        const depthInteractionActive = depthGestureActive
          || (structureDepthActive && Math.abs(depthTargetRef.current - depthProgress) > 0.012);
        controls.enabled = !touring;
        controls.enableZoom = !structureDepthActive
          && !selectedNodeKey
          && !overviewResetPendingRef.current;
        controls.autoRotate = !touring
          && autoRotateRef.current
          && !reduceMotion
          && !selectedNodeKey
          && !depthInteractionActive;

        if (tourFrame) {
          const focusTarget = new THREE.Vector3();
          let focusWeight = 0;
          tourFrame.focusWeights.forEach((weight, key) => {
            const node = nodeByKey.get(key);
            if (!node) return;
            focusTarget.addScaledVector(node.pos, weight);
            focusWeight += weight;
          });
          if (focusWeight > 0) focusTarget.multiplyScalar(1 / focusWeight);
          focusTarget.applyMatrix4(root.matrixWorld).multiplyScalar(tourFrame.targetBias);
          const direction = new THREE.Vector3(
            Math.sin(tourFrame.azimuth) * Math.cos(tourFrame.elevation),
            Math.sin(tourFrame.elevation),
            Math.cos(tourFrame.azimuth) * Math.cos(tourFrame.elevation),
          );
          camera.position.copy(focusTarget).addScaledVector(direction, tourFrame.distance);
          controls.target.copy(focusTarget);
          camera.lookAt(focusTarget);
          tourVeil.style.opacity = String(tourFrame.fade);
        } else {
          controls.update();
          tourVeil.style.opacity = "0";
          const selectedDistance = selectedNodeKey
            ? DEPTH_CAMERA_DISTANCES[selectedLayer]
            : null;
          const controlledDistance = selectedDistance
            ?? (structureDepthActive || overviewResetPendingRef.current
              ? cameraDistanceForDepth(depthProgress)
              : null);
          if (controlledDistance !== null) {
            const cameraEase = 1 - Math.exp(-2.75 * frameDelta);
            camera.position.setLength(
              camera.position.length()
              + (controlledDistance - camera.position.length()) * cameraEase,
            );
          }
          if (
            overviewResetPendingRef.current
            && depthProgress < 0.002
            && Math.abs(camera.position.length() - DEPTH_CAMERA_DISTANCES[0]) < 0.025
          ) {
            overviewResetPendingRef.current = false;
          }
        }

        worldPos.set(0, 0, 0).applyMatrix4(root.matrixWorld);
        projected.copy(worldPos).project(camera);
        const coreScreenX = (projected.x * 0.5 + 0.5) * mount.clientWidth;
        const coreScreenY = (-projected.y * 0.5 + 0.5) * mount.clientHeight;
        coreLabel.style.transform =
          "translate(-50%, -50%) translate("
          + (coreScreenX - mount.clientWidth * 0.5)
          + "px,"
          + (coreScreenY - mount.clientHeight * 0.5)
          + "px)";

        coreRimMaterial.uniforms.uTime.value = motionTime;
        const coronaPulse = reduceMotion ? 1 : 1 + Math.sin(time * 0.34) * 0.018;
        coreCoronaOuter.scale.setScalar(3.55 * coronaPulse);
        coreCoronaInner.scale.setScalar(2.8 * (2 - coronaPulse));
        const outerCoronaMaterial = coreCoronaOuter.material as InstanceType<typeof THREE.SpriteMaterial>;
        const innerCoronaMaterial = coreCoronaInner.material as InstanceType<typeof THREE.SpriteMaterial>;
        if (!reduceMotion) {
          outerCoronaMaterial.rotation = 0.24 + time * 0.006;
          innerCoronaMaterial.rotation = -0.56 - time * 0.009;
          coreLensGroup.rotation.z = -0.13 + Math.sin(time * 0.17) * 0.018;
          coreLensGroup.rotation.y = 0.24 + Math.sin(time * 0.11) * 0.012;
        }
        lensArcMaterials.forEach((material, index) => {
          const baseOpacity = Number(material.userData.baseOpacity);
          material.opacity = baseOpacity * (
            reduceMotion ? 1 : 0.91 + Math.sin(time * (0.31 + index * 0.037) + index) * 0.09
          );
        });

        const pathMode = currentViewMode === "path";
        const pathVisible = pathMode && !selectedNodeKey && !touring;
        pathCore.visible = pathVisible;
        pathGlow.visible = pathVisible;
        flow.visible = pathVisible;
        if (pathVisible) {
          const phase = (time * 0.04) % 1;
          for (let i = 0; i < flowCount; i += 1) {
            const progress = (phase - i / flowCount + 1) % 1;
            const point = pathCurve.getPoint(progress);
            flowPositions.set([point.x, point.y, point.z], i * 3);
          }
          flowGeometry.attributes.position.needsUpdate = true;
        }

        const tourTrailVisible = Boolean(tourFrame && tourFrame.pathProgress > 0.015);
        tourTrail.visible = tourTrailVisible;
        tourTrailInsurance.visible = tourTrailVisible;
        tourHead.visible = tourTrailVisible;
        tourTrailParticles.visible = tourTrailVisible;
        if (tourFrame && tourTrailVisible) {
          const head = THREE.MathUtils.clamp(tourFrame.pathProgress, 0, 1);
          for (let i = 0; i < tourTrailCount; i += 1) {
            const progress = head * i / (tourTrailCount - 1);
            const point = pathCurve.getPoint(progress);
            tourTrailPositions.set([point.x, point.y, point.z], i * 3);
          }
          tourTrailGeometry.attributes.position.needsUpdate = true;
          const tail = Math.max(0, head - 0.046);
          for (let i = 0; i < tourHeadCount; i += 1) {
            const progress = THREE.MathUtils.lerp(tail, head, i / (tourHeadCount - 1));
            const point = pathCurve.getPoint(progress);
            tourHeadPositions.set([point.x, point.y, point.z], i * 3);
          }
          tourHeadGeometry.attributes.position.needsUpdate = true;
        }

        const shellPulseAge = time - shellPulseStart;
        const shellPulse = shellPulseAge >= 0 && shellPulseAge <= 0.26
          ? Math.sin(shellPulseAge / 0.26 * Math.PI)
          : 0;
        depthVeil.style.opacity = structureDepthActive && shellPulse > 0
          ? String(shellPulse * (reduceMotion ? 0.035 : 0.075))
          : "0";

        const sceneDepth = tourFrame?.depth ?? depthProgress;
        shells.forEach((shell, index) => {
          const material = shell.material as InstanceType<typeof THREE.MeshBasicMaterial>;
          if (currentViewMode === "path" && !touring) {
            material.opacity = index === 7 ? 0.04 : 0.006;
          } else {
            const layerDepth = index + 1;
            const layerFocus = Math.exp(-Math.pow((sceneDepth - layerDepth) / 0.62, 2));
            const overviewPresence = Math.max(0, 1 - sceneDepth / 0.7);
            const pulseBoost = shellPulseLayer === layerDepth ? shellPulse * 0.045 : 0;
            material.opacity = selectedNodeKey
              ? (layerDepth === selectedLayer ? (index === 7 ? 0.034 : 0.028) : 0.004)
              : Math.max(
                  index === 7 ? 0.012 : 0.004,
                  (index === 7 ? 0.068 : 0.011) * overviewPresence
                    + layerFocus * (index === 7 ? 0.025 : 0.024)
                    + pulseBoost,
                );
          }
          shell.scale.setScalar(
            !reduceMotion && structureDepthActive && shellPulseLayer === index + 1
              ? 1 + shellPulse * 0.014
              : 1,
          );
        });
        const edgeMaterial = edges.material as InstanceType<typeof THREE.ShaderMaterial>;
        edgeMaterial.uniforms.uOpacity.value = 0.105 * (
          1 - THREE.MathUtils.smoothstep(sceneDepth, 0.08, 0.68)
        );
        edges.visible = currentViewMode === "structure"
          && selectedLayer === 0
          && sceneDepth < 0.7
          && !selectedNodeKey
          && !touring;
        neighborEdges.visible = Boolean(selectedNodeKey);

        if (touring) {
          hover = null;
          renderer.domElement.style.cursor = "grab";
        } else {
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(hitTargets)[0];
          hover = hit ? nodeByKey.get(String(hit.object.userData.key)) ?? null : null;
          renderer.domElement.style.cursor = hover ? "pointer" : "grab";
        }

        const connected = new Set<string>();
        if (selectedNodeKey) {
          resolvedRelations.forEach(({ spec }) => {
            if (spec.source === selectedNodeKey) connected.add(spec.target);
            if (spec.target === selectedNodeKey) connected.add(spec.source);
          });
        }
        if (selectedNodeKey !== previousGraphSelection) {
          previousGraphSelection = selectedNodeKey;
          const points = selectedNodeKey
            ? resolvedRelations
                .filter(({ spec }) =>
                  spec.source === selectedNodeKey || spec.target === selectedNodeKey,
                )
                .flatMap(({ from, to }) => curvedRelationPoints(from, to, 18))
            : [];
          neighborGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(points, 3),
          );
        }

        const cameraDirection = camera.position.clone().normalize();
        const labelCandidates: Array<{
          node: NodeDatum;
          index: number;
          x: number;
          y: number;
          z: number;
          explicit: boolean;
          author: boolean;
          opacity: number;
          priority: number;
        }> = [];
        nodes.forEach((node, index) => {
          const inLayer = selectedLayer === 0 || selectedLayer === node.layer.id;
          const isSelected = selectedNodeKey === node.key;
          const isConnected = connected.has(node.key);
          const isHovered = hover === node;
          const pathVisible = pathMode && node.authorPath && !touring;
          const tourWeight = tourFrame?.focusWeights.get(node.key) ?? 0;
          const nodePathProgress = authorPathProgressByKey.get(node.key);
          const pathProximity = nodePathProgress === undefined || !tourFrame
            ? 0
            : Math.exp(-Math.pow(
                (nodePathProgress - tourFrame.pathProgress) / 0.055,
                2,
              ));
          const authorVisited = Boolean(
            touring
            && node.authorPath
            && nodePathProgress !== undefined
            && nodePathProgress <= (tourFrame?.pathProgress ?? 0) + 0.006,
          );
          const boundary = node.layer.id === 8;
          const stellarProfile = STELLAR_PROFILES[node.layer.id];
          const stellarSeed = Number(node.mesh!.userData.stellarSeed);
          const nodeMaterial = node.mesh!.material as InstanceType<typeof THREE.ShaderMaterial>;
          const haloMaterial = node.halo!.material as InstanceType<typeof THREE.SpriteMaterial>;
          const flareMaterial = node.flare!.material as InstanceType<typeof THREE.SpriteMaterial>;

          const layerCount = node.layer.terms.length;
          const waveDelay = node.order / Math.max(1, layerCount - 1) * 0.75;
          const wave = selectedLayer === node.layer.id
            ? THREE.MathUtils.clamp((time - activationStart - waveDelay) / 0.22, 0, 1)
            : 0;
          const breathe = 0.92 + Math.sin(motionTime * 1.65 + index * 0.37) * 0.08;
          worldPos.copy(node.pos).applyMatrix4(root.matrixWorld);
          projected.copy(worldPos).project(camera);
          const facing = worldPos.dot(cameraDirection) / (node.layer.radius + 0.35);
          const frontFacing = facing > -0.04;
          const overviewActive = currentViewMode === "structure"
            && selectedLayer === 0
            && !selectedNodeKey
            && (!touring || sceneDepth < 0.72);
          const overviewDepthCue = THREE.MathUtils.smoothstep(facing, -0.68, 0.78);
          const overviewLimbCue = Math.exp(-Math.pow(facing / 0.42, 2));
          const screenRadius = Math.hypot(projected.x, projected.y);
          const overviewSpaceCue = THREE.MathUtils.smoothstep(screenRadius, 0.18, 0.82);
          let stellarOpacity = 0.62;
          let stellarActivity = 0.16;

          if (touring) {
            const tourLayerPresence = Math.exp(
              -Math.pow((sceneDepth - node.layer.id) / 1.65, 2),
            );
            stellarOpacity = boundary
              ? 0.52 + tourWeight * 0.46
              : 0.16 + tourLayerPresence * 0.24 + tourWeight * 0.62;
            stellarActivity = 0.1 + tourLayerPresence * 0.18 + tourWeight * 0.72;
            haloMaterial.opacity = boundary
              ? 0.24 + tourWeight * 0.62
              : 0.038 + tourLayerPresence * 0.065 + tourWeight * 0.54;
          } else if (selectedNodeKey) {
            stellarOpacity = isSelected ? 1 : isConnected ? 0.9 : 0.055;
            stellarActivity = isSelected ? 1 : isConnected ? 0.52 : 0.08;
            haloMaterial.opacity = isSelected ? 0.9 : isConnected ? 0.44 : 0.018;
          } else if (currentViewMode === "path") {
            stellarOpacity = node.authorPath ? 0.94 : 0.11;
            stellarActivity = node.authorPath ? 0.58 : 0.07;
            haloMaterial.opacity = node.authorPath ? 0.27 : 0.014;
          } else if (selectedLayer > 0) {
            stellarOpacity = inLayer ? 0.66 + wave * 0.32 : 0.045;
            stellarActivity = inLayer ? 0.46 + wave * 0.44 : 0.06;
            haloMaterial.opacity = inLayer
              ? (boundary ? 0.34 : 0.12) + wave * (boundary ? 0.48 : 0.33)
              : 0.012;
          } else {
            stellarOpacity = pathVisible
              ? 0.9
              : boundary
                ? 0.9
                : 0.34 + overviewDepthCue * 0.38 + overviewLimbCue * 0.04;
            stellarActivity = pathVisible
              ? 0.42
              : boundary
                ? 0.24
                : 0.12 + overviewDepthCue * 0.16;
            haloMaterial.opacity = boundary
              ? 0.34
              : pathVisible
                ? 0.2
                : OVERVIEW_VOLUME.haloOpacityBack
                  + overviewDepthCue * (
                    OVERVIEW_VOLUME.haloOpacityFront - OVERVIEW_VOLUME.haloOpacityBack
                  )
                  + overviewLimbCue * OVERVIEW_VOLUME.haloOpacityLimb;
          }

          nodeMaterial.uniforms.uTime.value = motionTime;
          const authorMix = pathVisible
            ? 1
            : touring && node.authorPath
              ? Math.max(authorVisited ? 0.68 : 0, tourWeight)
              : 0;
          colorTarget
            .copy(layerColors.get(node.layer.id)!)
            .lerp(authorColor, authorMix);
          const colorEase = 1 - Math.exp(-7.5 * frameDelta);
          nodeMaterial.uniforms.uColor.value.lerp(colorTarget, colorEase);
          haloMaterial.color.lerp(colorTarget, colorEase);
          flareMaterial.color.lerp(colorTarget, colorEase);
          nodeMaterial.uniforms.uOpacity.value = stellarOpacity;
          nodeMaterial.uniforms.uActivity.value = stellarActivity;
          nodeMaterial.uniforms.uFocus.value = isSelected
            ? 1
            : isHovered
              ? 0.72
              : isConnected
                ? 0.34
                : tourWeight;
          nodeMaterial.uniforms.uOverview.value = overviewActive ? 1 : 0;
          nodeMaterial.uniforms.uDepthCue.value = overviewActive ? overviewDepthCue : 1;

          const overviewBodyScale = overviewActive && !boundary
            ? THREE.MathUtils.lerp(
                OVERVIEW_VOLUME.bodyScaleBack,
                OVERVIEW_VOLUME.bodyScaleFront,
                overviewDepthCue,
              )
            : 1;
          const modeScale = (pathVisible
              ? 1.12
              : boundary
                ? 1.035 * breathe
                : 1) * overviewBodyScale;
          node.mesh!.scale.setScalar(
            isSelected
              ? (boundary ? 1.42 : 2.25)
              : isHovered
                ? (boundary ? 1.28 : 1.8)
                : modeScale * (1 + tourWeight * (boundary ? 0.32 : 0.52)),
          );
          const baseHalo = Number(node.halo!.userData.haloSize);
          const activeScale = touring
            ? 1 + tourWeight * (boundary ? 0.28 : 0.5)
            : pathVisible
              ? 1.16
              : selectedLayer === node.layer.id
                ? 1 + wave * (boundary ? 0.34 : 0.65)
                : 1;
          const focusScale = isSelected
            ? (boundary ? 1.18 : 1.65)
            : isHovered
              ? (boundary ? 1.12 : 1.35)
              : 1;
          const overviewHaloScale = overviewActive && !boundary
            ? THREE.MathUtils.lerp(
                OVERVIEW_VOLUME.haloScaleCenter,
                OVERVIEW_VOLUME.haloScaleEdge,
                overviewSpaceCue,
              )
            : 1;
          node.halo!.scale.setScalar(
            baseHalo * breathe * activeScale * focusScale * overviewHaloScale,
          );
          if (!reduceMotion) {
            haloMaterial.rotation = stellarSeed * Math.PI * 2 + motionTime * stellarProfile.drift * 0.045;
          }

          const tourFlare = touring && tourWeight > 0.18;
          const flareFocused = isSelected || isHovered || tourFlare;
          const flarePulse = reduceMotion
            ? 0.34
            : THREE.MathUtils.clamp(
                (Math.sin(
                  motionTime * (0.65 + stellarProfile.pulse * 0.55) + stellarSeed * 19,
                ) - 0.36) / 0.64,
                0,
                1,
              );
          const ambientCycle = motionTime * 0.16 + node.layer.id * 0.41;
          const ambientIndex = Math.floor(ambientCycle) % layerCount;
          const ambientProgress = ambientCycle - Math.floor(ambientCycle);
          const ambientEnvelope = THREE.MathUtils.smoothstep(ambientProgress, 0, 0.22)
            * (1 - THREE.MathUtils.smoothstep(ambientProgress, 0.68, 1));
          const ambientFlare = currentViewMode === "structure"
            && selectedLayer === 0
            && !selectedNodeKey
            && !touring
            && !reduceMotion
            && node.order === ambientIndex
            && stellarProfile.flare > 0.14;
          node.flare!.visible = (flareFocused && stellarProfile.flare > 0.14) || ambientFlare;
          flareMaterial.opacity = node.flare!.visible
            ? tourFlare
              ? 0.24 * stellarProfile.flare * tourWeight
              : flareFocused
                ? (isSelected ? 0.34 : 0.18) * stellarProfile.flare * (0.42 + flarePulse * 0.58)
              : 0.12 * stellarProfile.flare * ambientEnvelope
            : 0;
          flareMaterial.rotation = stellarSeed * Math.PI * 2
            + (reduceMotion ? 0 : motionTime * (0.025 + stellarProfile.drift * 0.06));
          node.flare!.scale.setScalar(
            baseHalo * (isSelected ? 2.1 : tourFlare ? 1.92 : ambientFlare ? 1.82 : 1.65)
              * (1 + (flareFocused ? flarePulse : ambientEnvelope) * 0.28),
          );

          const onScreen =
            projected.z < 1 &&
            projected.z > -1 &&
            projected.x > -1.08 &&
            projected.x < 1.08 &&
            projected.y > -1.08 &&
            projected.y < 1.08;
          const x = (projected.x * 0.5 + 0.5) * mount.clientWidth;
          const y = (-projected.y * 0.5 + 0.5) * mount.clientHeight;
          const layerLabelReady = isSelected
            || isHovered
            || isConnected
            || selectedLayer === 0
            || time - activationStart > (reduceMotion ? 0.12 : 0.24);

          const currentLabel = localizedName(node.name, languageRef.current, node.key);
          if (node.label!.textContent !== currentLabel) node.label!.textContent = currentLabel;
          if (!touring) {
            node.label!.classList.remove(
              "tour-focus",
              "tour-context",
              "tour-path-context",
              "author-path",
            );
            node.label!.style.transform =
              "translate(-50%,10px) translate(" + x + "px," + y + "px)";
            node.label!.style.zIndex = String(Math.floor((1 - projected.z) * 100));
          }

          const explicitTourLabel = Boolean(tourFrame?.labelKeys.has(node.key));
          const pathOverviewLabel = pathMode && !selectedNodeKey && node.authorPath;

          if (
            onScreen
            && (touring || frontFacing)
            && (touring || layerLabelReady)
            && (touring || pathOverviewLabel)
          ) {
            const screenCenter = 1 - Math.min(1, Math.hypot(projected.x, projected.y));
            const tourDepthCue = THREE.MathUtils.clamp((1 - projected.z) * 0.5, 0, 1);
            const tourFacingCue = THREE.MathUtils.smoothstep(facing, -0.62, 0.72);
            const tourBackgroundOpacity = THREE.MathUtils.clamp(
              0.23
                + tourDepthCue * 0.13
                + (1 - screenCenter) * 0.025
                + tourFacingCue * 0.045,
              0.22,
              0.44,
            );
            labelCandidates.push({
              node,
              index,
              x,
              y,
              z: projected.z,
              explicit: explicitTourLabel,
              author: node.authorPath,
              opacity: explicitTourLabel
                ? 1
                : node.authorPath
                  ? touring
                    ? 0.36 + pathProximity * 0.26 + tourWeight * 0.2
                    : 0.68
                  : tourBackgroundOpacity,
              priority: explicitTourLabel
                ? 10000 + tourWeight * 1000
                : 300
                  + pathProximity * 920
                  + tourWeight * 520
                  + (node.authorPath ? 90 : 0)
                  + tourDepthCue * 120
                  + screenCenter * 90
                  + facing * 45
                  + seeded(node.order + node.layer.id * 83) * 8,
            });
          } else if (!touring && !(pathMode && !selectedNodeKey)) {
            const shouldLabel = shouldShowNodeLabel({
              activeLayer: selectedLayer,
              nodeLayer: node.layer.id,
              overviewLandmark: OVERVIEW_LANDMARK_KEYS.has(node.key),
              authorPath: node.authorPath,
              viewMode: currentViewMode,
              frontFacing,
              selected: isSelected,
              hovered: isHovered,
              connected: isConnected,
            });
            node.label!.style.opacity = onScreen && shouldLabel && layerLabelReady
              ? String(isSelected || isHovered ? 1 : frontFacing ? 0.88 : 0.32)
              : "0";
          } else if (!touring) {
            node.label!.style.opacity = "0";
          }
        });

        if (touring) {
          const labelLimit = THREE.MathUtils.clamp(
            Math.floor(Math.min(
              mount.clientWidth / 31,
              mount.clientHeight / 18,
            )),
            TOUR_LABEL_MINIMUM,
            TOUR_LABEL_MAXIMUM,
          );
          const selectionEpoch = Math.floor(tourSeconds / TOUR_LABEL_ROTATION_SECONDS);
          const focusSignature = languageRef.current + ":"
            + [...(tourFrame?.labelKeys ?? [])].sort().join("|");
          const activeOnScreen = labelCandidates.reduce(
            (count, candidate) => count + Number(activeTourLabelKeys.has(candidate.node.key)),
            0,
          );
          const selectionNeedsRefresh = activeTourLabelKeys.size === 0
            || selectionEpoch !== tourLabelSelectionEpoch
            || focusSignature !== tourLabelFocusSignature
            || activeOnScreen < Math.min(10, activeTourLabelKeys.size * 0.55);

          if (selectionNeedsRefresh) {
            const previousTourLabelKeys = activeTourLabelKeys;
            const nextTourLabelKeys = new Set<string>();
            const occupiedTourCells = new Set<string>();
            const cycleOffset = selectionEpoch * labelLimit;

            labelCandidates
              .sort((left, right) => {
                const leftRank = (
                  left.index * TOUR_LABEL_PERMUTATION_STRIDE - cycleOffset
                ) % nodes.length;
                const rightRank = (
                  right.index * TOUR_LABEL_PERMUTATION_STRIDE - cycleOffset
                ) % nodes.length;
                const normalizedLeftRank = leftRank < 0 ? leftRank + nodes.length : leftRank;
                const normalizedRightRank = rightRank < 0 ? rightRank + nodes.length : rightRank;
                const leftScore = left.priority + (nodes.length - normalizedLeftRank) * 4;
                const rightScore = right.priority + (nodes.length - normalizedRightRank) * 4;
                return rightScore - leftScore;
              })
              .forEach((candidate) => {
                if (!candidate.explicit && nextTourLabelKeys.size >= labelLimit) return;

                const textLength = candidate.node.label!.textContent?.length ?? 8;
                const width = THREE.MathUtils.clamp(
                  textLength * (languageRef.current === "zh" ? 9 : 5.8) + 18,
                  48,
                  candidate.explicit ? 190 : 152,
                );
                const height = candidate.explicit ? 24 : 17;
                const minCellX = Math.floor(
                  (candidate.x - width / 2 - 5) / TOUR_LABEL_GRID_WIDTH,
                );
                const maxCellX = Math.floor(
                  (candidate.x + width / 2 + 5) / TOUR_LABEL_GRID_WIDTH,
                );
                const minCellY = Math.floor(
                  (candidate.y + 5) / TOUR_LABEL_GRID_HEIGHT,
                );
                const maxCellY = Math.floor(
                  (candidate.y + height + 8) / TOUR_LABEL_GRID_HEIGHT,
                );
                const candidateCells: string[] = [];
                for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
                  for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
                    candidateCells.push(cellX + ":" + cellY);
                  }
                }
                const overlaps = candidateCells.some((cell) => occupiedTourCells.has(cell));
                if (!candidate.explicit && overlaps) return;

                nextTourLabelKeys.add(candidate.node.key);
                candidateCells.forEach((cell) => occupiedTourCells.add(cell));
              });

            previousTourLabelKeys.forEach((key) => {
              if (!nextTourLabelKeys.has(key)) {
                const node = nodeByKey.get(key);
                if (node?.label) node.label.style.opacity = "0";
              }
            });
            activeTourLabelKeys = nextTourLabelKeys;
            tourLabelSelectionEpoch = selectionEpoch;
            tourLabelFocusSignature = focusSignature;
          }

          const renderedTourLabelKeys = new Set<string>();
          labelCandidates.forEach((candidate) => {
            if (!activeTourLabelKeys.has(candidate.node.key)) return;
            renderedTourLabelKeys.add(candidate.node.key);
            candidate.node.label!.classList.toggle("tour-focus", candidate.explicit);
            candidate.node.label!.classList.toggle("tour-context", !candidate.explicit);
            candidate.node.label!.classList.toggle(
              "tour-path-context",
              !candidate.explicit && candidate.author,
            );
            candidate.node.label!.classList.remove("author-path");
            candidate.node.label!.style.transform =
              "translate(-50%,10px) translate(" + candidate.x + "px," + candidate.y + "px)";
            candidate.node.label!.style.opacity = String(candidate.opacity);
            candidate.node.label!.style.zIndex = String(
              candidate.explicit ? 1000 : Math.floor((1 - candidate.z) * 100),
            );
          });
          activeTourLabelKeys.forEach((key) => {
            if (!renderedTourLabelKeys.has(key)) {
              const node = nodeByKey.get(key);
              if (node?.label) node.label.style.opacity = "0";
            }
          });
        } else if (pathMode && !selectedNodeKey) {
          const labelBoxes: Array<{
            left: number;
            right: number;
            top: number;
            bottom: number;
          }> = [];
          const acceptedLabelKeys = new Set<string>();
          let contextualLabels = 0;
          labelCandidates
            .sort((left, right) => right.priority - left.priority)
            .forEach((candidate) => {
              const textLength = candidate.node.label!.textContent?.length ?? 8;
              const width = THREE.MathUtils.clamp(
                textLength * (languageRef.current === "zh" ? 9 : 5.8) + 18,
                48,
                152,
              );
              const box = {
                left: candidate.x - width / 2 - 5,
                right: candidate.x + width / 2 + 5,
                top: candidate.y + 5,
                bottom: candidate.y + 25,
              };
              const overlaps = labelBoxes.some((placed) => !(
                box.right < placed.left
                || box.left > placed.right
                || box.bottom < placed.top
                || box.top > placed.bottom
              ));
              if (contextualLabels >= 32 || overlaps) return;

              labelBoxes.push(box);
              acceptedLabelKeys.add(candidate.node.key);
              contextualLabels += 1;
              candidate.node.label!.classList.toggle("author-path", candidate.author);
              candidate.node.label!.style.opacity = String(candidate.opacity);
            });
          labelCandidates.forEach((candidate) => {
            if (!acceptedLabelKeys.has(candidate.node.key)) {
              candidate.node.label!.style.opacity = "0";
            }
          });
        }

        starField.rotation.y = touring ? tourSeconds * 0.0045 : time * 0.002;
        renderer.render(scene, camera);
      };
      animate();

      const resize = () => {
        const width = mount.clientWidth;
        const height = mount.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener("resize", resize);
      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", resize);
        renderer.domElement.removeEventListener("pointerdown", onPointerDown, true);
        renderer.domElement.removeEventListener("pointermove", onPointerMove);
        renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
        renderer.domElement.removeEventListener("pointerup", onPointerUp);
        renderer.domElement.removeEventListener("wheel", onWheel, true);
        controls.dispose();
        nodeCoronaTexture.dispose();
        coreCoronaTexture.dispose();
        flareTexture.dispose();
        renderer.dispose();
        if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
        labelRoot.innerHTML = "";
      };
    }).catch(() => {
      if (!disposed) setWebglFailed(true);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  // The renderer owns one mount-scoped lifetime; changing UI state is read via refs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
