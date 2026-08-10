import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const uiSource = await readFile(new URL("../app/sphere-experience.tsx", import.meta.url), "utf8");
const sceneSource = await readFile(new URL("../app/use-sphere-scene.ts", import.meta.url), "utf8");
const modelSource = await readFile(new URL("../app/cognition-model.ts", import.meta.url), "utf8");
const visualSource = await readFile(new URL("../app/sphere-visuals.ts", import.meta.url), "utf8");
const searchSource = await readFile(new URL("../app/concept-search.tsx", import.meta.url), "utf8");
const conceptNotesSource = await readFile(new URL("../app/concept-notes.ts", import.meta.url), "utf8");
const conceptSourcesSource = await readFile(new URL("../app/concept-sources.ts", import.meta.url), "utf8");
const conceptEvidenceSource = await readFile(new URL("../app/concept-evidence.tsx", import.meta.url), "utf8");
const readablePageSource = await readFile(new URL("../app/read/page.tsx", import.meta.url), "utf8");
const readableComponentSource = await readFile(new URL("../app/readable-index.tsx", import.meta.url), "utf8");
const readableIndexSource = [readablePageSource, readableComponentSource].join("\n");
const urlStateSource = await readFile(new URL("../app/use-sphere-url-state.ts", import.meta.url), "utf8");
const packageManifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const readmeSource = await readFile(new URL("../README.md", import.meta.url), "utf8");
const licenseSource = await readFile(new URL("../LICENSE.md", import.meta.url), "utf8");
const mitLicenseSource = await readFile(new URL("../LICENSES/MIT.txt", import.meta.url), "utf8");
const contentLicenseSource = await readFile(new URL("../LICENSES/CC-BY-4.0.txt", import.meta.url), "utf8");
const citationSource = await readFile(new URL("../CITATION.cff", import.meta.url), "utf8");
const contributingSource = await readFile(new URL("../CONTRIBUTING.md", import.meta.url), "utf8");
const trademarksSource = await readFile(new URL("../TRADEMARKS.md", import.meta.url), "utf8");
const offlineBuildSource = await readFile(new URL("../scripts/build-offline.mjs", import.meta.url), "utf8");
const offlinePackageSource = await readFile(new URL("../scripts/package-offline.mjs", import.meta.url), "utf8");
const source = [modelSource, visualSource, uiSource, sceneSource].join("\n");
const tourSource = await readFile(new URL("../app/cognition-tour.ts", import.meta.url), "utf8");
const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const layerBlock = source.match(/const LAYERS:[\s\S]*?\n\];/)?.[0] ?? "";
const relationBlock = source.match(/const RELATIONS:[\s\S]*?\n\];/)?.[0] ?? "";
const relationDefinitionBlock = source.match(/const RELATION_DEFINITIONS:[\s\S]*?\n};/)?.[0] ?? "";
const landmarkBlock = source.match(/const OVERVIEW_LANDMARKS_BY_LAYER:[\s\S]*?\n};/)?.[0] ?? "";
const overrideBlock = source.match(/const NODE_NAME_OVERRIDES:[\s\S]*?\n};/)?.[0] ?? "";
const translationBlock = source.match(/const ZH_NAMES:[\s\S]*?\n\};/)?.[0] ?? "";
const stellarProfileBlock = source.match(/const STELLAR_PROFILES:[\s\S]*?\n};/)?.[0] ?? "";
const overviewVolumeBlock = source.match(/const OVERVIEW_VOLUME = \{([\s\S]*?)\n\};/)?.[1] ?? "";
const valueFromOverview = (name) => Number(
  overviewVolumeBlock.match(new RegExp(`${name}:\\s*([0-9.]+)`))?.[1],
);

const concepts = new Set();
for (const layer of layerBlock.matchAll(/\{\s*id:\s*(\d+),[\s\S]*?terms:\s*\[([^\]]*)\]/g)) {
  for (const term of layer[2].matchAll(/"([^"]+)"/g)) concepts.add(`${layer[1]}:${term[1]}`);
}

const relations = [...relationBlock.matchAll(/source:"([^"]+)", target:"([^"]+)", type:"([^"]+)"/g)]
  .map((match) => ({ source:match[1], target:match[2], type:match[3] }));
const landmarks = [];
for (const layer of landmarkBlock.matchAll(/^\s*(\d+):\s*\[([^\]]+)\]/gm)) {
  for (const term of layer[2].matchAll(/"([^"]+)"/g)) landmarks.push(`${layer[1]}:${term[1]}`);
}
const authorPathBlock = tourSource.match(/export const AUTHOR_PATH = \[[\s\S]*?\n\] as const;/)?.[0] ?? "";
const authorPath = [...authorPathBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
const tourBeatBlock = tourSource.match(/export const TOUR_BEATS:[\s\S]*?\n\];/)?.[0] ?? "";
const tourBeatKeys = [...tourBeatBlock.matchAll(/"(\d+:[^"]+)"/g)].map((match) => match[1]);
const translatedNames = new Set(
  [...translationBlock.matchAll(/^\s*"([^"]+)":/gm)].map((match) => match[1]),
);

test("every semantic relation references an existing concept", () => {
  const invalid = relations.filter(({ source, target }) => !concepts.has(source) || !concepts.has(target));
  assert.deepEqual(invalid, []);
  assert.equal(relations.length, 215);
});

test("the graph uses the intended high-confidence relation semantics", () => {
  const typeFor = (source, target) => relations.find(
    (relation) => relation.source === source && relation.target === target,
  )?.type;

  assert.equal(typeFor("2:INFERENCE", "1:LLM"), "RUNS_MODEL");
  assert.equal(typeFor("3:MIXTURE OF EXPERTS", "4:MODEL ROUTING"), undefined);
  assert.equal(typeFor("3:SCALING LAW", "1:FOUNDATION MODEL"), "DESCRIBES");
  assert.equal(typeFor("5:STATE ESTIMATION", "5:STATE"), "ESTIMATES");
  assert.equal(typeFor("5:SYSTEM ID", "5:DYNAMICS"), "ESTIMATES");
  assert.equal(typeFor("6:OUT OF DISTRIBUTION", "6:DISTRIBUTION SHIFT"), "ASSOCIATED_WITH");
  assert.equal(typeFor("7:CAUSAL INFERENCE", "8:IDENTIFIABILITY"), "CONVERGES_TO");
  assert.match(overrideBlock, /"8:CAUSALITY": \{ zh: "因果本体问题", en: "THE PROBLEM OF CAUSALITY" \}/);
});

test("high-confidence bridges make the complete cognition graph traversable", () => {
  const adjacency = new Map([...concepts].map((key) => [key, new Set()]));
  for (const relation of relations) {
    adjacency.get(relation.source).add(relation.target);
    adjacency.get(relation.target).add(relation.source);
  }
  const [first] = concepts;
  const visited = new Set([first]);
  const pending = [first];
  while (pending.length) {
    const current = pending.pop();
    for (const neighbor of adjacency.get(current)) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      pending.push(neighbor);
    }
  }
  assert.equal(visited.size, concepts.size);

  const edgeKeys = new Set(relations.map(({ source, target }) => `${source}>${target}`));
  for (const bridge of [
    "2:EMBEDDING>3:EMBEDDING SPACE",
    "3:REPRESENTATION>1:MULTIMODAL",
    "4:DATASET>3:PRETRAINING",
    "4:MONITORING>6:RELIABILITY",
    "6:SPURIOUS CORRELATION>6:GENERALIZATION",
    "6:UNCERTAINTY>7:PROBABILITY",
    "7:COMPLEXITY>7:LEARNING THEORY",
  ]) assert.ok(edgeKeys.has(bridge), `missing bridge ${bridge}`);
});

test("every relation type has bilingual forward and reverse labels", () => {
  const usedTypes = new Set(relations.map(({ type }) => type));
  for (const type of usedTypes) {
    const definition = relationDefinitionBlock.match(
      new RegExp(`${type}:\\s*\\{([\\s\\S]*?)\\n\\s*\\},`),
    )?.[1] ?? "";
    assert.match(definition, /forward:\s*\{\s*zh:\s*"[^"]+",\s*en:\s*"[^"]+"\s*\}/);
    assert.match(definition, /reverse:\s*\{\s*zh:\s*"[^"]+",\s*en:\s*"[^"]+"\s*\}/);
  }
});

test("overview landmarks are valid, balanced and connected", () => {
  assert.equal(landmarks.length, 29);
  assert.deepEqual(landmarks.filter((key) => !concepts.has(key)), []);

  const degree = new Map([...concepts].map((key) => [key, 0]));
  for (const { source, target } of relations) {
    degree.set(source, (degree.get(source) ?? 0) + 1);
    degree.set(target, (degree.get(target) ?? 0) + 1);
  }
  assert.deepEqual(landmarks.filter((key) => (degree.get(key) ?? 0) < 2), []);
  for (let layer = 1; layer <= 8; layer += 1) {
    assert.ok(landmarks.filter((key) => key.startsWith(`${layer}:`)).length >= 3);
  }
  assert.match(source, /overviewLandmark: OVERVIEW_LANDMARK_KEYS\.has\(node\.key\)/);
});

test("overview structure uses a representative landmark backbone", () => {
  const landmarkKeys = new Set(landmarks);
  const backbone = relations.filter(
    ({ source, target }) => landmarkKeys.has(source) && landmarkKeys.has(target),
  );
  assert.equal(backbone.length, 16);
  assert.match(source, /const overviewRelations = resolvedRelations\.filter/);
  assert.match(source, /curvedRelationPoints\(from, to\)/);
});

test("no concept is left as an unexplained isolated node", () => {
  const connected = new Set(relations.flatMap(({ source, target }) => [source, target]));
  assert.deepEqual([...concepts].filter((key) => !connected.has(key)), []);
});

test("boundary concepts have explicit layer-specific bilingual names", () => {
  for (const name of [
    "GENERALIZATION", "IDENTIFIABILITY", "OBSERVABILITY", "CONTROLLABILITY",
    "CAUSALITY", "COMPUTABILITY", "ALIGNMENT", "UNDERSTANDING",
  ]) {
    assert.match(overrideBlock, new RegExp(`"8:${name}": \\{ zh: "[^"]+", en: "[^"]+" \\}`));
  }
});

test("the single authored path spans all eight layers and references real concepts", () => {
  assert.equal(authorPath.length, 50);
  assert.deepEqual(authorPath.filter((key) => !concepts.has(key)), []);
  assert.deepEqual(
    [...new Set(authorPath.map((key) => Number(key.split(":", 1)[0])))],
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
  assert.match(source, /import \{ AUTHOR_PATH, AUTHOR_PATH_SET, tourFrameAt \}/);
  assert.doesNotMatch(source, /const PERSONAL_PATH/);
  assert.doesNotMatch(tourSource, /export const TOUR_PATH/);
});

test("every concept node has an explicit Chinese name", () => {
  const names = [...concepts].map((key) => key.replace(/^\d+:/, ""));
  assert.deepEqual(names.filter((name) => !translatedNames.has(name)), []);
});

test("label policy separates overview, path and active-layer reading", () => {
  const policyStart = modelSource.indexOf("function shouldShowNodeLabel");
  const policy = modelSource.slice(policyStart);
  assert.match(policy, /if \(selected \|\| hovered \|\| connected\) return true/);
  assert.match(policy, /if \(!frontFacing\) return false/);
  assert.match(policy, /if \(viewMode === "path"\) return authorPath/);
  assert.match(policy, /if \(activeLayer === 0\) return overviewLandmark/);
  assert.match(policy, /return activeLayer === nodeLayer/);
});

test("structure and author path are the only public view modes", () => {
  assert.match(source, /type ViewMode = "structure" \| "path"/);
  assert.doesNotMatch(source, /type ViewMode[^\n]+stellar/);
  assert.match(source, /const \[viewMode, setViewMode\] = useState<ViewMode>\("structure"\)/);
  assert.match(source, /const chooseViewMode = \(mode: ViewMode\)/);
  assert.match(source, /edges\.visible = currentViewMode === "structure"/);
  assert.match(source, /const pathMode = currentViewMode === "path"/);
  assert.match(source, /\["path", copy\.pathMode\]/);
  assert.match(uiSource, /pathMode: "作者路径"/);
  assert.match(uiSource, /pathMode: "AUTHOR PATH"/);
  assert.doesNotMatch(uiSource, /ONE PATH|探索路径/);
  assert.doesNotMatch(source, /\["stellar", copy\.stellarMode\]/);
  assert.doesNotMatch(source, /pathOn|setPathOn/);
});

test("path and relation views do not compete and closing restores entry context", () => {
  assert.match(source, /const pathVisible = pathMode && !selectedNodeKey/);
  assert.match(source, /pathCore\.visible = pathVisible/);
  assert.match(source, /relationReturnRef = useRef/);
  assert.match(source, /if \(!selectedKeyRef\.current\)/);
  assert.match(source, /const returnContext = relationReturnRef\.current/);
  assert.match(source, /setViewMode\(returnContext\.viewMode\)/);
  assert.match(source, /setActiveLayer\(returnContext\.layer\)/);
  assert.match(source, /depthTargetRef\.current = returnContext\.depth/);
});

test("onboarding and epistemic framing are explicit but restrained", () => {
  assert.match(source, /向内滚动，追问能力成立的条件/);
  assert.match(source, /接近认知边界 · 继续滚动/);
  assert.match(source, /不是推荐学习顺序/);
  assert.match(source, /这是一种认知模型，不是唯一分类体系/);
  assert.match(source, /它不是完整的 AI 社会影响地图/);
  assert.match(source, /setShowScrollHint\(false\)/);
  assert.match(source, /className=\{activeLayer > 0 \|\| selectedKey \? "intro compact"/);
});

test("structure view owns a bounded continuous cognitive-depth navigator", () => {
  assert.match(source, /const DEPTH_MIN = 0/);
  assert.match(source, /const DEPTH_MAX = 8/);
  assert.match(source, /const DEPTH_SNAP_DELAY_MS = 150/);
  assert.match(source, /const DEPTH_GESTURE_RANGE = 1\.4/);
  assert.match(source, /function cameraDistanceForDepth\(depth: number\)/);
  assert.match(source, /function activeLayerForDepth\(depth: number, currentLayer: number\)/);
  assert.match(source, /clamped >= nextLayer \+ 0\.58/);
  assert.match(source, /clamped <= nextLayer - 0\.58/);
  assert.match(source, /depthTargetRef\.current = Math\.round\(depthTargetRef\.current\)/);
  assert.match(source, /viewModeRef\.current !== "structure" \|\| selectedKeyRef\.current/);
  assert.match(source, /passive: false/);
  assert.match(source, /capture: true/);
});

test("depth navigation separates structure scrolling from ordinary zoom", () => {
  assert.match(source, /const structureDepthActive = currentViewMode === "structure"/);
  assert.match(source, /&& !touring/);
  assert.match(source, /controls\.enabled = !touring/);
  assert.match(source, /controls\.enableZoom = !structureDepthActive/);
  assert.match(source, /!structureDepthActive/);
  assert.match(source, /overviewResetPendingRef\.current = mode !== "structure"/);
  assert.match(source, /const boundaryResistance = THREE\.MathUtils\.smoothstep/);
  assert.match(source, /depthDelta \*= 1 - boundaryResistance \* 0\.72/);
  assert.match(source, /controls\.autoRotate = !touring/);
  assert.match(source, /&& autoRotateRef\.current/);
  assert.match(source, /&& !depthInteractionActive/);
});

test("shell crossing feedback is restrained and reduced-motion aware", () => {
  assert.match(source, /shellPulseAge <= 0\.26/);
  assert.match(source, /depthVeil\.style\.opacity/);
  assert.match(source, /reduceMotion \? 0\.035 : 0\.075/);
  assert.match(source, /!reduceMotion && structureDepthActive && shellPulseLayer/);
  assert.match(source, /time - activationStart > \(reduceMotion \? 0\.12 : 0\.24\)/);
});

test("author-path particles are evenly distributed along the full curve", () => {
  assert.match(source, /const flowCount = 40/);
  assert.match(source, /const progress = \(phase - i \/ flowCount \+ 1\) % 1/);
  assert.match(source, /pathCore\.renderOrder = 6/);
  assert.match(source, /flow\.renderOrder = 7/);
});

test("all eight cognitive layers define a distinct stellar energy profile", () => {
  const profiles = [...stellarProfileBlock.matchAll(/^\s*(\d+):\s*\{([^}]+)\}/gm)];
  assert.deepEqual(profiles.map((match) => Number(match[1])), [1, 2, 3, 4, 5, 6, 7, 8]);
  for (const [, , profile] of profiles) {
    for (const property of [
      "granulation", "drift", "turbulence", "contrast", "rim", "pulse", "flare",
    ]) {
      assert.match(profile, new RegExp(`${property}:\\s*[0-9.]+`));
    }
  }
});

test("stellar node surfaces add depth grading and bounded ambient flares", () => {
  assert.match(source, /fragmentShader: STELLAR_FRAGMENT_SHADER/);
  assert.match(source, /uGranulation:/);
  assert.match(source, /uTurbulence:/);
  assert.match(source, /const flareFocused = isSelected \|\| isHovered \|\| tourFlare/);
  assert.match(source, /node\.order === ambientIndex/);
  assert.match(source, /const ambientEnvelope = THREE\.MathUtils\.smoothstep/);
  assert.match(source, /currentViewMode === "structure"/);
  assert.match(source, /selectedLayer === 0/);
  assert.equal(source.match(/renderer\.setPixelRatio/g)?.length, 1);
  assert.match(source, /Math\.min\(window\.devicePixelRatio, 1\.8\)/);
});

test("overview volume strengthens real spheres without copying boundary halos", () => {
  const volumeBlock = source.match(/const OVERVIEW_VOLUME = \{([\s\S]*?)\n\};/)?.[1] ?? "";
  const value = (name) => Number(volumeBlock.match(new RegExp(`${name}:\\s*([0-9.]+)`))?.[1]);

  assert.ok(value("bodyScaleBack") >= 1.1 && value("bodyScaleBack") <= 1.2);
  assert.ok(value("bodyScaleFront") > value("bodyScaleBack"));
  assert.ok(value("bodyScaleFront") <= 1.3);
  assert.ok(value("haloOpacityBack") >= 0.02 && value("haloOpacityBack") <= 0.06);
  assert.ok(value("haloOpacityFront") >= 0.12 && value("haloOpacityFront") < 0.25);
  assert.ok(value("haloScaleCenter") > 1 && value("haloScaleCenter") <= 1.12);
  assert.ok(value("haloScaleEdge") > value("haloScaleCenter"));
  assert.ok(value("haloScaleEdge") <= 1.2);
  assert.match(source, /const overviewActive = currentViewMode === "structure"/);
  assert.match(source, /&& selectedLayer === 0/);
  assert.match(source, /&& !selectedNodeKey/);
  assert.match(source, /const overviewDepthCue = THREE\.MathUtils\.smoothstep\(facing/);
  assert.match(source, /const overviewLimbCue = Math\.exp/);
  assert.match(source, /uOverview/);
  assert.match(source, /uDepthCue/);
  assert.match(source, /float keyLight = smoothstep/);
});

test("ordinary nodes carry an external, perceptible and density-bounded corona", () => {
  assert.match(source, /const irregularity = 0\.43/);
  assert.match(source, /\(radius - irregularity\) \/ 0\.058/);
  assert.ok(valueFromOverview("haloOpacityBack") >= 0.045);
  assert.ok(valueFromOverview("haloOpacityFront") >= 0.18);
  assert.match(source, /const overviewSpaceCue = THREE\.MathUtils\.smoothstep/);
  assert.match(source, /OVERVIEW_VOLUME\.haloScaleCenter/);
  assert.match(source, /OVERVIEW_VOLUME\.haloScaleEdge/);
  assert.equal(source.match(/const halo = new THREE\.Sprite/g)?.length, 1);
});

test("guided tour is deterministic, reversible and separate from public view modes", () => {
  assert.deepEqual(authorPath.filter((key) => !concepts.has(key)), []);
  assert.deepEqual(tourBeatKeys.filter((key) => !concepts.has(key)), []);
  assert.match(tourSource, /export const TOUR_DURATION = 60/);
  assert.match(tourSource, /export function tourFrameAt\(seconds: number\)/);
  assert.match(tourSource, /seconds % TOUR_DURATION/);
  assert.match(tourSource, /focusWeights: Map<string, number>/);
  assert.match(tourSource, /pathKey: string \| null/);
  assert.match(tourSource, /export function authorPathProgress/);
  assert.match(tourSource, /authorPathProgress\(current\.pathKey\)/);
  assert.match(source, /const \[isTouring, setIsTouring\] = useState\(false\)/);
  assert.match(source, /className=\{isTouring \? "experience touring" : "experience"\}/);
  assert.match(source, /tourReturnRef = useRef/);
  assert.match(source, /requestAnimationFrame\(\(startedAt\) =>/);
  assert.match(source, /tourStartedAtRef\.current = startedAt/);
  assert.match(source, /const tourFrame = touring/);
  assert.match(source, /event\.key !== "Escape"/);
  assert.match(source, /className="tour-exit"/);
  assert.match(source, /if \(isTouringRef\.current\)/);
  assert.match(source, /preTourCamera\.copy\(camera\.position\)/);
  assert.match(source, /camera\.position\.copy\(preTourCamera\)/);
  assert.match(source, /Math\.floor\(tourSeconds \/ 4\) \* 4/);
  assert.doesNotMatch(source, /type ViewMode[^\n]+tour/);
  assert.match(styles, /\.experience\.touring \.topbar/);
  assert.doesNotMatch(styles, /\.experience\.touring \.labels/);
  assert.match(styles, /\.node-label\.tour-focus/);
});

test("tour trail accumulates the visited author path and keeps a visible active head", () => {
  assert.match(source, /const tourTrailCount = 320/);
  assert.match(source, /const progress = head \* i \/ \(tourTrailCount - 1\)/);
  assert.match(source, /const tourHeadCount = 48/);
  assert.match(source, /const tail = Math\.max\(0, head - 0\.046\)/);
  assert.match(source, /const tourTrailInsurance = new THREE\.Line/);
  assert.match(source, /tourTrailInsurance\.visible = tourTrailVisible/);
  assert.match(source, /depthTest: false/);
  assert.doesNotMatch(source, /head - 0\.115/);
});

test("tour labels rotate a bounded semantic field while preserving authored hierarchy", () => {
  assert.doesNotMatch(source, /tourLabelBudget/);
  assert.match(source, /const labelCandidates:/);
  assert.match(source, /&& \(touring \|\| layerLabelReady\)/);
  assert.match(source, /&& \(touring \|\| pathOverviewLabel\)/);
  assert.match(source, /const TOUR_LABEL_ROTATION_SECONDS = 1\.35/);
  assert.match(source, /const TOUR_LABEL_MINIMUM = 30/);
  assert.match(source, /const TOUR_LABEL_MAXIMUM = 46/);
  assert.match(source, /let activeTourLabelKeys = new Set<string>\(\)/);
  assert.match(source, /const occupiedTourCells = new Set<string>\(\)/);
  assert.match(source, /candidateCells\.some\(\(cell\) => occupiedTourCells\.has\(cell\)\)/);
  assert.match(source, /if \(!activeTourLabelKeys\.has\(candidate\.node\.key\)\) return/);
  assert.doesNotMatch(source, /overlapFade/);
  assert.match(styles, /\.node-label\.tour-context/);
  assert.match(styles, /\.node-label\.tour-path-context/);
});

test("author membership changes color only inside path and tour experiences", () => {
  assert.match(source, /uColor: \{ value: new THREE\.Color\(layer\.color\) \}/);
  assert.match(source, /const authorMix = pathVisible/);
  assert.match(source, /touring && node\.authorPath/);
  assert.match(source, /nodeMaterial\.uniforms\.uColor\.value\.lerp/);
  assert.doesNotMatch(source, /personal \? 0xe6f8ff/);
});

test("the first-scroll cue is legible, luminous and reduced-motion aware", () => {
  const hintBlock = styles.match(/\.scroll-hint \{([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.match(hintBlock, /color: rgba\(225, 248, 255, \.96\)/);
  assert.match(hintBlock, /text-shadow:/);
  assert.match(hintBlock, /animation: hint-breathe 2s/);
  assert.match(styles, /font: 700 10px\/1/);
  assert.match(styles, /\.scroll-hint[^\n]+\.tour-exit \{ animation: none; \}/);
});

test("unknown core combines an irregular corona with partial lensing arcs", () => {
  assert.match(source, /const coreCoronaTexture = makeProceduralTexture\(256/);
  assert.match(source, /const rearUpperLens = createLensArc/);
  assert.match(source, /const rearLowerLens = createLensArc/);
  assert.match(source, /const frontLensBand = createLensArc/);
  assert.match(uiSource, /ref=\{coreLabelRef\} className="center-label"/);
  assert.match(sceneSource, /worldPos\.set\(0, 0, 0\)\.applyMatrix4\(root\.matrixWorld\)/);
  assert.match(sceneSource, /const coreScreenX =/);
  assert.match(styles, /\.experience\.touring \.center-label \{[\s\S]*?visibility: visible;/);
  const touringHiddenUi = styles.match(
    /\.experience\.touring \.topbar,[\s\S]*?transition: opacity \.55s ease, visibility 0s linear \.55s;\n\}/,
  )?.[0] ?? "";
  assert.doesNotMatch(touringHiddenUi, /\.experience\.touring \.center-label/);
  assert.doesNotMatch(source, /new THREE\.TorusGeometry/);
});

test("core protection fades crossing relations and caps boundary-node focus scale", () => {
  assert.match(source, /length\(vLocalPosition\)/);
  assert.match(source, /uProtectionInner/);
  assert.match(source, /boundary \? 1\.42 : 2\.25/);
  assert.match(source, /boundary \? 1\.18 : 1\.65/);
});

test("the scene, model, visuals, search and UI have explicit module boundaries", () => {
  assert.match(uiSource, /useSphereScene\(\{/);
  assert.doesNotMatch(uiSource, /new THREE\.WebGLRenderer/);
  assert.match(sceneSource, /new THREE\.WebGLRenderer/);
  assert.match(modelSource, /export const RELATIONS/);
  assert.match(visualSource, /export const STELLAR_FRAGMENT_SHADER/);
  assert.match(searchSource, /CONCEPTS/);
  assert.match(uiSource, /<ConceptEvidence language=\{language\} note=\{selectedNote\} \/>/);
  assert.match(uiSource, /useSphereUrlState\(\{/);
  assert.ok(uiSource.split("\n").length <= 820);
});

test("readable-content stable covers every concept in the cognition graph", () => {
  const expected = [...concepts].sort();
  const noteKeys = [...conceptNotesSource.matchAll(/^  "([^"]+)": note\(\{/gm)]
    .map((match) => match[1]);
  assert.equal(noteKeys.length, 179);
  assert.deepEqual(noteKeys.slice().sort(), expected);

  const directEdges = new Set(
    relations.flatMap(({ source, target }) => [`${source}>${target}`, `${target}>${source}`]),
  );
  const sourceKeys = new Set(
    [...conceptSourcesSource.matchAll(/^  ([A-Za-z][A-Za-z0-9]+): \{/gm)].map((match) => match[1]),
  );
  noteKeys.forEach((key, index) => {
    const start = conceptNotesSource.indexOf(`  "${key}": note({`);
    const end = index + 1 < noteKeys.length
      ? conceptNotesSource.indexOf(`  "${noteKeys[index + 1]}": note({`, start)
      : conceptNotesSource.indexOf("\n};", start);
    const note = conceptNotesSource.slice(start, end);
    for (const field of ["definition", "why", "utility", "inquiry"]) {
      assert.match(note, new RegExp(`${field}: \\["[^"]+", "[^"]+"\\]`));
    }
    assert.match(note, /aliases: \{[\s\S]*?zh: \[[^\]]+\],[\s\S]*?en: \[[^\]]+\]/);
    const deeper = [...(note.match(/deeper: \[([^\]]+)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)]
      .map((match) => match[1]);
    assert.ok(deeper.length >= 1 && deeper.length <= 3, `${key} should offer one to three deeper links`);
    for (const target of deeper) {
      assert.ok(concepts.has(target), `${key} points to unknown concept ${target}`);
      assert.ok(directEdges.has(`${key}>${target}`), `${key} and ${target} need a direct semantic relation`);
    }

    const sources = [...(note.match(/sources: \[([^\]]+)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)]
      .map((match) => match[1]);
    assert.ok(sources.length >= 1, `${key} should preserve at least one source record`);
    for (const sourceKey of sources) {
      assert.ok(sourceKeys.has(sourceKey), `${key} points to unknown source ${sourceKey}`);
    }
  });
  assert.match(conceptNotesSource, /reviewedAt: "2026-08-06"/);
  assert.match(conceptSourcesSource, /satisfies Record<string, ConceptSource>/);
});

test("readable concept notes keep the four-step sequence visible", () => {
  assert.match(uiSource, /what: "是什么"/);
  assert.match(uiSource, /why: "为什么"/);
  assert.match(uiSource, /utility: "有什么用"/);
  assert.match(uiSource, /inquiry: "继续追问"/);
  assert.match(uiSource, /relatedConcepts: "相关概念"/);
  assert.match(uiSource, /inwardRelation: "↓ 向内延伸"/);
  assert.match(uiSource, /sameLayerRelation: "→ 同层关联"/);
  assert.match(uiSource, /outwardRelation: "↑ 返回外层"/);
  assert.match(uiSource, /selectedNote\.definition\[language\]/);
  assert.match(uiSource, /selectedNote\.why\[language\]/);
  assert.match(uiSource, /selectedNote\.utility\[language\]/);
  assert.match(uiSource, /selectedNote\.inquiry\[language\]/);
  assert.match(uiSource, /concept\.layer\.id - selectedConcept\.layer\.id/);
  assert.match(uiSource, /data-layer-direction=\{layerDirection\}/);
  assert.match(uiSource, /className="deeper-links"/);
  assert.match(uiSource, /className="relation-depth-tag"/);
  assert.match(styles, /\.concept-reading/);
  assert.match(styles, /\.concept-inquiry/);
  assert.match(styles, /\.relation-depth-tag/);
});

test("sources, editorial status and review dates are visible to readers", () => {
  assert.match(conceptEvidenceSource, /CONCEPT_SOURCES\[key\]/);
  assert.match(conceptEvidenceSource, /copy\.statusLabels\[note\.status\]/);
  assert.match(conceptEvidenceSource, /note\.reviewedAt/);
  assert.match(conceptEvidenceSource, /target="_blank" rel="noreferrer"/);
  assert.match(readableIndexSource, /STATUS_LABELS\[language\]\[note\.status\]/);
  assert.match(readableIndexSource, /SOURCE_KIND_LABELS\[language\]\[source\.kind\]/);
  assert.match(styles, /\.concept-evidence/);
  assert.match(styles, /\.reading-page/);
});

test("concept, view, layer and language states have shareable URLs", () => {
  assert.match(urlStateSource, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(urlStateSource, /params\.get\("concept"\)/);
  assert.match(urlStateSource, /params\.get\("view"\) === "path"/);
  assert.match(urlStateSource, /params\.get\("layer"\)/);
  assert.match(urlStateSource, /params\.get\("lang"\) === "zh"/);
  assert.match(urlStateSource, /window\.addEventListener\("popstate"/);
  assert.match(urlStateSource, /window\.history\[replace \? "replaceState" : "pushState"\]/);
  assert.match(uiSource, /useState<Lang>\("en"\)/);
  assert.match(uiSource, /useRef<Lang>\("en"\)/);
  assert.match(uiSource, /nextLanguage === "zh" \? "zh" : null/);
  assert.match(readablePageSource, /params\?\.lang === "zh" \? "zh" : "en"/);
  assert.match(uiSource, /navigator\.clipboard\.writeText\(url\)/);
  assert.match(readableComponentSource, /new URLSearchParams\(\{ concept: concept\.key \}\)/);
});

test("public version stays consistent across public surfaces", () => {
  assert.equal(packageManifest.version, "1.0.0");
  assert.match(uiSource, /<em>v1\.0<\/em>/);
  assert.match(uiSource, /AI COGNITION SPHERE/);
  assert.doesNotMatch([uiSource, readableIndexSource].join("\n"), /atlas/i);
  assert.match(readmeSource, /`v1\.0\.0` is the first public baseline/);
  assert.match(offlineBuildSource, /AI-Cognition-Sphere-v1\.0\.0\.html/);
  assert.match(offlineBuildSource, /read\.html/);
  assert.match(offlineBuildSource, /path\.join\(projectRoot, "dist", outputFileName\)/);
  assert.match(offlineBuildSource, /var process = \{ env: \{ NODE_ENV: "production" \} \};/);
  assert.match(offlineBuildSource, /React\.createElement\(SphereExperience, \{ offlineMode: true \}\)/);
  assert.match(offlineBuildSource, /React\.createElement\(ReadableIndex, \{ language, offlineMode: true \}\)/);
  assert.match(uiSource, /\? language === "zh" \? "read\.html\?lang=zh" : "read\.html"/);
  assert.match(readableComponentSource, /offlineMode \? "AI-Cognition-Sphere-v1\.0\.0\.html" : "\/"/);
  assert.equal(packageManifest.scripts["build:offline"], "npm run build && node scripts/build-offline.mjs");
  assert.equal(packageManifest.scripts["package:offline"], "npm run build:offline && node scripts/package-offline.mjs");
  assert.match(offlinePackageSource, /SHA256SUMS\.txt/);
  assert.match(offlinePackageSource, /START-HERE\.txt/);
  assert.match(offlinePackageSource, /path\.join\(projectRoot, "public", "readme"\)/);
  assert.match(sceneSource, /Math\.min\(window\.devicePixelRatio, 1\.8\)/);
});

test("public licensing consistently separates code, content, and marks", () => {
  assert.equal(packageManifest.license, "SEE LICENSE IN LICENSE.md");
  assert.match(licenseSource, /MIT License/);
  assert.match(licenseSource, /Creative Commons Attribution 4\.0 International/);
  assert.match(licenseSource, /conceptual, textual, and visual content/);
  assert.match(mitLicenseSource, /^MIT License/);
  assert.match(contentLicenseSource, /Creative Commons Attribution 4\.0 International/);
  assert.match(contentLicenseSource, /creativecommons\.org\/licenses\/by\/4\.0\/legalcode/);
  assert.match(citationSource, /^license: "MIT"$/m);
  assert.match(contributingSource, /MIT License for software/);
  assert.match(contributingSource, /CC BY 4\.0 license/);
  assert.match(trademarksSource, /Nothing in the software or content licenses grants trademark rights/);

  const currentLicenseSurfaces = [licenseSource, citationSource, contributingSource].join("\n");
  assert.doesNotMatch(currentLicenseSurfaces, /AGPL|CC BY-SA|CC-BY-SA|AGPL-3\.0/);
});

test("concept search supports bilingual lookup and keyboard selection", () => {
  assert.match(uiSource, /event\.key\.toLowerCase\(\) === "k"/);
  assert.match(searchSource, /localizedName\(concept\.name, "zh"/);
  assert.match(searchSource, /CONCEPT_NOTES\[concept\.key\]\?\.aliases/);
  assert.match(searchSource, /event\.key === "ArrowDown"/);
  assert.match(searchSource, /event\.key === "ArrowUp"/);
  assert.match(searchSource, /event\.key === "Enter"/);
  assert.match(searchSource, /role="listbox"/);
  assert.match(styles, /\.search-palette/);
});
