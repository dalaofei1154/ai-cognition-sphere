export type TourBeat = {
  at: number;
  depth: number;
  distance: number;
  azimuth: number;
  elevation: number;
  rootYaw: number;
  targetBias: number;
  pathKey: string | null;
  focusKeys: string[];
  labelKeys: string[];
};

export type TourFrame = Omit<
  TourBeat,
  "at" | "pathKey" | "focusKeys" | "labelKeys"
> & {
  pathProgress: number;
  focusWeights: Map<string, number>;
  labelKeys: Set<string>;
  fade: number;
};

export const TOUR_DURATION = 60;

// One authored route powers both AUTHOR PATH and the guided tour. It records
// concepts encountered through practice rather than claiming formal mastery.
export const AUTHOR_PATH = [
  "1:CHATBOT",
  "1:LLM",
  "1:MULTIMODAL",
  "1:PROMPT",
  "1:IMAGE GENERATION",
  "1:DIFFUSION",
  "1:AI CODING",
  "1:VIBE CODING",
  "2:TEMPERATURE",
  "2:CONTEXT ENGINEERING",
  "2:API",
  "2:WORKFLOW",
  "2:AUTOMATION",
  "2:AGENT",
  "2:HUMAN IN LOOP",
  "3:TRANSFORMER",
  "3:LATENT SPACE",
  "3:LoRA",
  "3:QUANTIZATION",
  "3:RLHF",
  "4:LOCAL LLM",
  "4:EDGE AI",
  "4:GUARDRAILS",
  "4:MONITORING",
  "4:DATA QUALITY",
  "4:EVALUATION",
  "5:SENSOR",
  "5:STATE ESTIMATION",
  "5:PREDICTION",
  "5:DECISION",
  "5:ACTUATOR",
  "5:CONTROL",
  "5:CLOSED LOOP",
  "6:HALLUCINATION",
  "6:GROUNDING",
  "6:UNCERTAINTY",
  "6:GENERALIZATION",
  "6:SMALL DATA",
  "6:CONFOUNDING",
  "6:RELIABILITY",
  "7:PROBABILITY",
  "7:COMPLEXITY",
  "7:CAUSAL INFERENCE",
  "7:SYSTEMS THEORY",
  "7:CONTROL THEORY",
  "8:IDENTIFIABILITY",
  "8:OBSERVABILITY",
  "8:CONTROLLABILITY",
  "8:CAUSALITY",
  "8:UNDERSTANDING",
] as const;

export const AUTHOR_PATH_SET = new Set<string>(AUTHOR_PATH);
const AUTHOR_PATH_INDEX = new Map<string, number>(
  AUTHOR_PATH.map((key, index) => [key, index]),
);

export function authorPathProgress(key: string | null) {
  if (key === null) return 0;
  const index = AUTHOR_PATH_INDEX.get(key);
  return index === undefined ? 0 : index / (AUTHOR_PATH.length - 1);
}

export const TOUR_BEATS: TourBeat[] = [
  {
    at: 0,
    depth: 0,
    distance: 22,
    azimuth: 0.08,
    elevation: 0.08,
    rootYaw: -0.08,
    targetBias: 0,
    pathKey: null,
    focusKeys: [],
    labelKeys: [],
  },
  {
    at: 5,
    depth: 0.35,
    distance: 20.6,
    azimuth: 0.3,
    elevation: 0.1,
    rootYaw: 0.04,
    targetBias: 0.16,
    pathKey: "1:MULTIMODAL",
    focusKeys: ["1:CHATBOT", "1:LLM", "1:MULTIMODAL"],
    labelKeys: ["1:CHATBOT", "1:LLM", "1:MULTIMODAL"],
  },
  {
    at: 9,
    depth: 0.78,
    distance: 18.9,
    azimuth: 0.51,
    elevation: 0.04,
    rootYaw: 0.18,
    targetBias: 0.26,
    pathKey: "1:DIFFUSION",
    focusKeys: ["1:IMAGE GENERATION", "1:DIFFUSION"],
    labelKeys: ["1:IMAGE GENERATION", "1:DIFFUSION"],
  },
  {
    at: 13.5,
    depth: 1.3,
    distance: 17.4,
    azimuth: 0.75,
    elevation: 0.08,
    rootYaw: 0.32,
    targetBias: 0.34,
    pathKey: "1:VIBE CODING",
    focusKeys: ["1:AI CODING", "1:VIBE CODING"],
    labelKeys: ["1:AI CODING", "1:VIBE CODING"],
  },
  {
    at: 18,
    depth: 1.95,
    distance: 15.7,
    azimuth: 0.98,
    elevation: 0.02,
    rootYaw: 0.48,
    targetBias: 0.46,
    pathKey: "2:AGENT",
    focusKeys: ["2:WORKFLOW", "2:AUTOMATION", "2:AGENT"],
    labelKeys: ["2:WORKFLOW", "2:AUTOMATION", "2:AGENT"],
  },
  {
    at: 22,
    depth: 2.85,
    distance: 14.1,
    azimuth: 1.18,
    elevation: 0.06,
    rootYaw: 0.63,
    targetBias: 0.48,
    pathKey: "3:QUANTIZATION",
    focusKeys: ["3:TRANSFORMER", "3:LATENT SPACE", "3:QUANTIZATION"],
    labelKeys: ["3:TRANSFORMER", "3:LATENT SPACE", "3:QUANTIZATION"],
  },
  {
    at: 26,
    depth: 3.75,
    distance: 12.5,
    azimuth: 1.4,
    elevation: -0.01,
    rootYaw: 0.79,
    targetBias: 0.58,
    pathKey: "4:EDGE AI",
    focusKeys: ["4:LOCAL LLM", "4:EDGE AI"],
    labelKeys: ["4:LOCAL LLM", "4:EDGE AI"],
  },
  {
    at: 30,
    depth: 4.15,
    distance: 11.25,
    azimuth: 1.62,
    elevation: 0.03,
    rootYaw: 0.92,
    targetBias: 0.64,
    pathKey: "4:EVALUATION",
    focusKeys: ["4:GUARDRAILS", "4:MONITORING", "4:DATA QUALITY"],
    labelKeys: ["4:GUARDRAILS", "4:MONITORING", "4:DATA QUALITY"],
  },
  {
    at: 34,
    depth: 4.72,
    distance: 10.15,
    azimuth: 1.84,
    elevation: 0.07,
    rootYaw: 1.05,
    targetBias: 0.7,
    pathKey: "5:PREDICTION",
    focusKeys: ["5:SENSOR", "5:STATE ESTIMATION", "5:PREDICTION"],
    labelKeys: ["5:SENSOR", "5:STATE ESTIMATION", "5:PREDICTION"],
  },
  {
    at: 39,
    depth: 5.08,
    distance: 9,
    azimuth: 2.08,
    elevation: 0.02,
    rootYaw: 1.18,
    targetBias: 0.7,
    pathKey: "5:CLOSED LOOP",
    focusKeys: ["5:DECISION", "5:CONTROL", "5:CLOSED LOOP"],
    labelKeys: ["5:DECISION", "5:CONTROL", "5:CLOSED LOOP"],
  },
  {
    at: 44,
    depth: 5.75,
    distance: 8.05,
    azimuth: 2.34,
    elevation: -0.04,
    rootYaw: 1.3,
    targetBias: 0.68,
    pathKey: "6:UNCERTAINTY",
    focusKeys: ["6:HALLUCINATION", "6:GROUNDING", "6:UNCERTAINTY"],
    labelKeys: ["6:HALLUCINATION", "6:GROUNDING", "6:UNCERTAINTY"],
  },
  {
    at: 48.5,
    depth: 6.25,
    distance: 7.2,
    azimuth: 2.58,
    elevation: 0.02,
    rootYaw: 1.42,
    targetBias: 0.66,
    pathKey: "6:RELIABILITY",
    focusKeys: ["6:SMALL DATA", "6:CONFOUNDING", "6:RELIABILITY"],
    labelKeys: ["6:SMALL DATA", "6:CONFOUNDING", "6:RELIABILITY"],
  },
  {
    at: 52.5,
    depth: 6.95,
    distance: 6.45,
    azimuth: 2.82,
    elevation: 0.05,
    rootYaw: 1.53,
    targetBias: 0.58,
    pathKey: "7:CONTROL THEORY",
    focusKeys: ["7:CAUSAL INFERENCE", "7:SYSTEMS THEORY", "7:CONTROL THEORY"],
    labelKeys: ["7:CAUSAL INFERENCE", "7:SYSTEMS THEORY", "7:CONTROL THEORY"],
  },
  {
    at: 55.5,
    depth: 7.82,
    distance: 5.65,
    azimuth: 3.06,
    elevation: 0.02,
    rootYaw: 1.64,
    targetBias: 0.42,
    pathKey: "8:CAUSALITY",
    focusKeys: [
      "8:IDENTIFIABILITY",
      "8:OBSERVABILITY",
      "8:CONTROLLABILITY",
      "8:CAUSALITY",
    ],
    labelKeys: [
      "8:IDENTIFIABILITY",
      "8:OBSERVABILITY",
      "8:CONTROLLABILITY",
      "8:CAUSALITY",
    ],
  },
  {
    at: 57.3,
    depth: 8,
    distance: 5.05,
    azimuth: 3.25,
    elevation: -0.02,
    rootYaw: 1.72,
    targetBias: 0.18,
    pathKey: "8:UNDERSTANDING",
    focusKeys: ["8:UNDERSTANDING"],
    labelKeys: ["8:UNDERSTANDING"],
  },
  {
    at: 58.4,
    depth: 0,
    distance: 22,
    azimuth: 0.08,
    elevation: 0.08,
    rootYaw: -0.08,
    targetBias: 0,
    pathKey: null,
    focusKeys: [],
    labelKeys: [],
  },
  {
    at: TOUR_DURATION,
    depth: 0,
    distance: 22,
    azimuth: 0.08,
    elevation: 0.08,
    rootYaw: -0.08,
    targetBias: 0,
    pathKey: null,
    focusKeys: [],
    labelKeys: [],
  },
];

function easeInOutCubic(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

export function tourFrameAt(seconds: number): TourFrame {
  const wrapped = ((seconds % TOUR_DURATION) + TOUR_DURATION) % TOUR_DURATION;
  const index = Math.min(
    TOUR_BEATS.length - 2,
    Math.max(0, TOUR_BEATS.findIndex((beat) => beat.at > wrapped) - 1),
  );
  const current = TOUR_BEATS[index];
  const next = TOUR_BEATS[index + 1];
  const progress = easeInOutCubic((wrapped - current.at) / (next.at - current.at));
  const focusWeights = new Map<string, number>();

  current.focusKeys.forEach((key) => focusWeights.set(key, 1 - progress));
  next.focusKeys.forEach((key) => {
    focusWeights.set(key, Math.max(focusWeights.get(key) ?? 0, progress));
  });

  const openingFade = 1 - Math.min(1, Math.max(0, wrapped / 0.85));
  const closeIn = Math.min(1, Math.max(0, (wrapped - 57.25) / 1.15));
  const closeOut = 1 - Math.min(1, Math.max(0, (wrapped - 58.4) / 1.05));
  const closingFade = wrapped >= 57.25 ? Math.min(closeIn, closeOut) : 0;
  const fade = Math.max(openingFade, closingFade);

  return {
    depth: lerp(current.depth, next.depth, progress),
    distance: lerp(current.distance, next.distance, progress),
    azimuth: lerp(current.azimuth, next.azimuth, progress),
    elevation: lerp(current.elevation, next.elevation, progress),
    rootYaw: lerp(current.rootYaw, next.rootYaw, progress),
    targetBias: lerp(current.targetBias, next.targetBias, progress),
    pathProgress: lerp(
      authorPathProgress(current.pathKey),
      authorPathProgress(next.pathKey),
      progress,
    ),
    focusWeights,
    labelKeys: new Set(progress < 0.54 ? current.labelKeys : next.labelKeys),
    fade,
  };
}
