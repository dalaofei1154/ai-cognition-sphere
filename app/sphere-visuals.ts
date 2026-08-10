import { LAYERS } from "./cognition-model";

export const DEPTH_MIN = 0;
export const DEPTH_MAX = 8;
export const DEPTH_SNAP_DELAY_MS = 150;
export const DEPTH_GESTURE_RESET_MS = 220;
export const DEPTH_GESTURE_RANGE = 1.4;
export const OVERVIEW_VOLUME = {
  bodyScaleBack: 1.14,
  bodyScaleFront: 1.24,
  haloOpacityBack: 0.052,
  haloOpacityFront: 0.205,
  haloOpacityLimb: 0.038,
  haloScaleCenter: 1.06,
  haloScaleEdge: 1.17,
};
export const DEPTH_CAMERA_DISTANCES = [
  22,
  ...LAYERS.map((layer) => Math.max(5.4, layer.radius * 1.32 + 3.3)),
];

export function clampDepth(value: number) {
  return Math.min(DEPTH_MAX, Math.max(DEPTH_MIN, value));
}

export function cameraDistanceForDepth(depth: number) {
  const clamped = clampDepth(depth);
  const outer = Math.floor(clamped);
  const inner = Math.min(DEPTH_MAX, outer + 1);
  const progress = clamped - outer;
  return DEPTH_CAMERA_DISTANCES[outer]
    + (DEPTH_CAMERA_DISTANCES[inner] - DEPTH_CAMERA_DISTANCES[outer]) * progress;
}

export function activeLayerForDepth(depth: number, currentLayer: number) {
  const clamped = clampDepth(depth);
  let nextLayer = Math.min(DEPTH_MAX, Math.max(DEPTH_MIN, currentLayer));
  while (nextLayer < DEPTH_MAX && clamped >= nextLayer + 0.58) nextLayer += 1;
  while (nextLayer > DEPTH_MIN && clamped <= nextLayer - 0.58) nextLayer -= 1;
  return nextLayer;
}

export type StellarProfile = {
  granulation: number;
  drift: number;
  turbulence: number;
  contrast: number;
  rim: number;
  pulse: number;
  flare: number;
};

// The layers share one visual universe, but each carries a distinct energy state.
// Values alter motion and surface structure rather than imitating literal star taxonomy.
export const STELLAR_PROFILES: Record<number, StellarProfile> = {
  1: { granulation: 6.8, drift: 0.34, turbulence: 0.18, contrast: 0.52, rim: 0.72, pulse: 1.28, flare: 0.30 },
  2: { granulation: 5.6, drift: 0.25, turbulence: 0.34, contrast: 0.58, rim: 0.64, pulse: 1.02, flare: 0.42 },
  3: { granulation: 4.7, drift: 0.16, turbulence: 0.58, contrast: 0.68, rim: 0.58, pulse: 0.78, flare: 0.34 },
  4: { granulation: 3.9, drift: 0.12, turbulence: 0.44, contrast: 0.56, rim: 0.54, pulse: 0.66, flare: 0.38 },
  5: { granulation: 5.1, drift: 0.28, turbulence: 0.70, contrast: 0.72, rim: 0.68, pulse: 1.12, flare: 0.72 },
  6: { granulation: 3.4, drift: 0.36, turbulence: 0.86, contrast: 0.88, rim: 0.76, pulse: 1.46, flare: 1.00 },
  7: { granulation: 4.2, drift: 0.09, turbulence: 0.22, contrast: 0.48, rim: 0.62, pulse: 0.48, flare: 0.22 },
  8: { granulation: 7.4, drift: 0.055, turbulence: 0.12, contrast: 0.66, rim: 0.94, pulse: 0.34, flare: 0.16 },
};

export const STELLAR_VERTEX_SHADER = `
  varying vec3 vSurface;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;

  void main() {
    vSurface = normalize(position);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -viewPosition.xyz;
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewPosition;
  }
`;
export const STELLAR_FRAGMENT_SHADER = `
  precision highp float;

  uniform vec3 uColor;
  uniform float uTime;
  uniform float uSeed;
  uniform float uOpacity;
  uniform float uActivity;
  uniform float uFocus;
  uniform float uGranulation;
  uniform float uDrift;
  uniform float uTurbulence;
  uniform float uContrast;
  uniform float uRim;
  uniform float uOverview;
  uniform float uDepthCue;

  varying vec3 vSurface;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;

  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float value = noise3(p) * 0.64;
    value += noise3(p * 2.03 + 7.17) * 0.26;
    value += noise3(p * 4.09 + 19.41) * 0.10;
    return value;
  }

  void main() {
    float motion = uTime * uDrift;
    float granulationScale = mix(
      uGranulation,
      max(2.2, uGranulation * 0.58),
      uOverview
    );
    vec3 p = vSurface * granulationScale + vec3(
      motion + uSeed * 7.1,
      -motion * 0.61 + uSeed * 3.7,
      motion * 0.37
    );
    float cells = fbm(p);
    float current = 0.5 + 0.5 * sin(
      (vSurface.y * 3.4 + vSurface.x * 1.7 + cells * 1.55) * 6.2831 + motion * 2.0
    );
    float surface = mix(cells, current, uTurbulence * 0.48);
    surface = smoothstep(0.22, 0.82, surface);

    vec3 viewDirection = normalize(vViewPosition);
    float facing = clamp(dot(normalize(vViewNormal), viewDirection), 0.0, 1.0);
    float limb = pow(1.0 - facing, 2.15);
    float granulation = (surface - 0.5) * uContrast * (0.38 + uActivity * 0.62);
    float body = 0.72 + granulation + limb * uRim * (0.48 + uActivity * 0.34);
    float hotCells = pow(max(surface - 0.54, 0.0), 2.0) * (0.72 + uFocus * 1.25);

    vec3 coolColor = uColor * vec3(0.42, 0.52, 0.68);
    vec3 hotColor = mix(uColor, vec3(1.0, 0.965, 0.82), 0.36 + uFocus * 0.16);
    vec3 color = mix(coolColor, uColor, clamp(body, 0.0, 1.0));
    color += hotColor * hotCells;
    color += hotColor * limb * uRim * (0.34 + uFocus * 0.42);

    float keyLight = smoothstep(
      -0.24,
      0.9,
      dot(normalize(vViewNormal), normalize(vec3(-0.42, 0.58, 0.7)))
    );
    float volumeShade = mix(0.84, 1.14, keyLight);
    color *= mix(1.0, volumeShade, uOverview * 0.82);
    color += hotColor * pow(keyLight, 5.0) * uOverview * 0.16;
    float farCooling = uOverview * (1.0 - uDepthCue) * 0.24;
    color = mix(color, color * vec3(0.62, 0.74, 0.9), farCooling);

    float alpha = uOpacity * (0.88 + limb * 0.12);
    gl_FragColor = vec4(color, alpha);
  }
`;
export const PROTECTED_LINE_VERTEX_SHADER = `
  varying vec3 vLocalPosition;

  void main() {
    vLocalPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const PROTECTED_LINE_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uProtectionInner;
  uniform float uProtectionOuter;
  varying vec3 vLocalPosition;

  void main() {
    float protection = smoothstep(
      uProtectionInner,
      uProtectionOuter,
      length(vLocalPosition)
    );
    gl_FragColor = vec4(uColor, uOpacity * protection);
  }
`;

export const CORE_RIM_VERTEX_SHADER = `
  uniform float uTime;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;
  varying float vDistortion;

  void main() {
    float longitude = atan(position.y, position.x);
    float latitude = atan(position.z, length(position.xy));
    float wave = sin(longitude * 13.0 + uTime * 0.18) * 0.55
      + sin(latitude * 17.0 - uTime * 0.11) * 0.30
      + sin((longitude + latitude) * 29.0) * 0.15;
    vec3 displaced = position + normal * wave * 0.008;
    vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
    vViewPosition = -viewPosition.xyz;
    vViewNormal = normalize(normalMatrix * normal);
    vDistortion = wave * 0.5 + 0.5;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const CORE_RIM_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;
  varying float vDistortion;

  void main() {
    float facing = clamp(dot(normalize(vViewNormal), normalize(vViewPosition)), 0.0, 1.0);
    float rim = pow(1.0 - facing, 3.2);
    float brokenEdge = smoothstep(0.12, 0.88, vDistortion);
    float alpha = uOpacity * rim * (0.42 + brokenEdge * 0.94);
    gl_FragColor = vec4(uColor * (0.72 + brokenEdge * 0.52), alpha);
  }
`;
