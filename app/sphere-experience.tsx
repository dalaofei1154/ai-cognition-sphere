"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CONCEPTS,
  CONCEPT_BY_KEY,
  LAYERS,
  RELATIONS,
  localizedName,
  relationLabel,
  relationsFor,
  type Lang,
  type ViewMode,
} from "./cognition-model";
import ConceptEvidence from "./concept-evidence";
import { CONCEPT_NOTES } from "./concept-notes";
import ConceptSearch from "./concept-search";
import { clampDepth } from "./sphere-visuals";
import { useSphereScene } from "./use-sphere-scene";
import { useSphereUrlState, type SphereReturnContext } from "./use-sphere-url-state";

type SphereExperienceProps = {
  offlineMode?: boolean;
};

export default function SphereExperience({ offlineMode = false }: SphereExperienceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const coreLabelRef = useRef<HTMLDivElement>(null);
  const depthVeilRef = useRef<HTMLDivElement>(null);
  const tourVeilRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<Lang>("en");
  const [activeLayer, setActiveLayer] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("structure");
  const [webglFailed, setWebglFailed] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [arrivalLayer, setArrivalLayer] = useState<number | null>(null);
  const [showModelNote, setShowModelNote] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isTouring, setIsTouring] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const activeLayerRef = useRef(0);
  const autoRotateRef = useRef(true);
  const viewModeRef = useRef<ViewMode>("structure");
  const selectedKeyRef = useRef<string | null>(null);
  const languageRef = useRef<Lang>("en");
  const depthTargetRef = useRef(0);
  const depthProgressRef = useRef(0);
  const overviewResetPendingRef = useRef(false);
  const isTouringRef = useRef(false);
  const tourStartedAtRef = useRef(0);
  const tourTriggerRef = useRef<HTMLButtonElement>(null);
  const tourExitRef = useRef<HTMLButtonElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const tourReturnRef = useRef<SphereReturnContext | null>(null);
  const relationReturnRef = useRef<SphereReturnContext | null>(null);
  const updateUrl = useSphereUrlState({
    languageRef,
    viewModeRef,
    selectedKeyRef,
    activeLayerRef,
    depthTargetRef,
    autoRotateRef,
    overviewResetPendingRef,
    relationReturnRef,
    setLanguage,
    setViewMode,
    setSelectedKey,
    setActiveLayer,
    setAutoRotate,
    setShowScrollHint,
    setArrivalLayer,
  });

  useEffect(() => { activeLayerRef.current = activeLayer; }, [activeLayer]);
  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);
  useEffect(() => { selectedKeyRef.current = selectedKey; }, [selectedKey]);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => {
    if (arrivalLayer === null) return;
    const timer = window.setTimeout(() => setArrivalLayer(null), 1800);
    return () => window.clearTimeout(timer);
  }, [arrivalLayer]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!isTouring) {
          setShowModelNote(false);
          setSearchOpen(true);
        }
      }
      if (event.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        window.requestAnimationFrame(() => searchTriggerRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isTouring, searchOpen]);

  const selectedConcept = selectedKey ? CONCEPT_BY_KEY.get(selectedKey) ?? null : null;
  const selectedRelations = useMemo(
    () => selectedKey ? relationsFor(selectedKey) : null,
    [selectedKey],
  );
  const selectedNote = selectedKey ? CONCEPT_NOTES[selectedKey] ?? null : null;
  const textIndexHref = offlineMode
    ? language === "zh" ? "read.html?lang=zh" : "read.html"
    : language === "zh" ? "/read?lang=zh" : "/read";

  const chooseConcept = (key: string) => {
    const concept = CONCEPT_BY_KEY.get(key);
    if (!concept) return;
    setArrivalLayer(null);
    if (!selectedKeyRef.current) {
      relationReturnRef.current = {
        viewMode: viewModeRef.current,
        layer: activeLayerRef.current,
        depth: depthTargetRef.current,
        autoRotate: autoRotateRef.current,
      };
    }
    selectedKeyRef.current = key;
    setSelectedKey(key);
    activeLayerRef.current = concept.layer.id;
    setActiveLayer(concept.layer.id);
    depthTargetRef.current = concept.layer.id;
    autoRotateRef.current = false;
    setAutoRotate(false);
    updateUrl({ concept: key });
  };

  const chooseViewMode = (mode: ViewMode) => {
    relationReturnRef.current = null;
    setShowScrollHint(false);
    setArrivalLayer(null);
    viewModeRef.current = mode;
    setViewMode(mode);
    selectedKeyRef.current = null;
    setSelectedKey(null);
    activeLayerRef.current = 0;
    setActiveLayer(0);
    depthTargetRef.current = 0;
    overviewResetPendingRef.current = mode !== "structure";
    updateUrl({ concept: null, layer: null, view: mode === "path" ? "path" : null });
  };

  const navigateToLayer = (layer: number) => {
    relationReturnRef.current = null;
    setShowScrollHint(false);
    setArrivalLayer(null);
    viewModeRef.current = "structure";
    setViewMode("structure");
    selectedKeyRef.current = null;
    setSelectedKey(null);
    depthTargetRef.current = clampDepth(layer);
    overviewResetPendingRef.current = false;
    if (layer > 0) {
      autoRotateRef.current = false;
      setAutoRotate(false);
    }
    updateUrl({ concept: null, view: null, layer: layer > 0 ? String(layer) : null });
  };

  const closeRelationMap = () => {
    const returnContext = relationReturnRef.current;
    relationReturnRef.current = null;
    selectedKeyRef.current = null;
    setSelectedKey(null);
    updateUrl({ concept: null });
    if (!returnContext) return;
    viewModeRef.current = returnContext.viewMode;
    setViewMode(returnContext.viewMode);
    activeLayerRef.current = returnContext.layer;
    setActiveLayer(returnContext.layer);
    depthTargetRef.current = returnContext.depth;
    autoRotateRef.current = returnContext.autoRotate;
    setAutoRotate(returnContext.autoRotate);
    overviewResetPendingRef.current = returnContext.viewMode === "path";
  };

  const closeSearch = () => {
    setSearchOpen(false);
    window.requestAnimationFrame(() => searchTriggerRef.current?.focus());
  };

  const changeLanguage = (nextLanguage: Lang) => {
    languageRef.current = nextLanguage;
    setLanguage(nextLanguage);
    updateUrl({ lang: nextLanguage === "zh" ? "zh" : null }, true);
  };

  const shareCurrentView = async () => {
    const url = window.location.href;
    const title = selectedConcept
      ? localizedName(selectedConcept.name, language, selectedConcept.key)
      : language === "zh" ? "AI 认知边界球体" : "AI Cognition Sphere";
    try {
      if (navigator.share) await navigator.share({ title, url });
      else await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus("idle"), 1800);
    } catch {
      // Cancelling the native share sheet should leave the interface unchanged.
    }
  };

  const enterTour = () => {
    const relationContext = relationReturnRef.current;
    tourReturnRef.current = relationContext ?? {
      viewMode: viewModeRef.current,
      layer: activeLayerRef.current,
      depth: depthTargetRef.current,
      autoRotate: autoRotateRef.current,
    };
    relationReturnRef.current = null;
    selectedKeyRef.current = null;
    setSelectedKey(null);
    setShowScrollHint(false);
    setArrivalLayer(null);
    setShowModelNote(false);
    setSearchOpen(false);
    viewModeRef.current = "structure";
    setViewMode("structure");
    activeLayerRef.current = 0;
    setActiveLayer(0);
    depthTargetRef.current = 0;
    isTouringRef.current = true;
    setIsTouring(true);
    window.requestAnimationFrame((startedAt) => {
      tourStartedAtRef.current = startedAt;
      tourExitRef.current?.focus();
      window.setTimeout(() => tourExitRef.current?.blur(), 1400);
    });
  };

  const exitTour = () => {
    const returnContext = tourReturnRef.current;
    tourReturnRef.current = null;
    isTouringRef.current = false;
    setIsTouring(false);
    if (returnContext) {
      viewModeRef.current = returnContext.viewMode;
      setViewMode(returnContext.viewMode);
      activeLayerRef.current = returnContext.layer;
      setActiveLayer(returnContext.layer);
      depthTargetRef.current = returnContext.depth;
      autoRotateRef.current = returnContext.autoRotate;
      setAutoRotate(returnContext.autoRotate);
      overviewResetPendingRef.current = returnContext.viewMode === "path";
    }
    window.requestAnimationFrame(() => tourTriggerRef.current?.focus());
  };

  useEffect(() => {
    if (!isTouring) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      exitTour();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isTouring]);

  useSphereScene({
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
  });

  const selectedLayer = activeLayer ? LAYERS[activeLayer - 1] : null;
  const copy = {
    zh: {
      count: "概念节点",
      relations: "条语义关系",
      eyebrow: "从表象到边界 · 认知结构原型",
      titleA: "AI 不是一条",
      titleB: "越来越难的直线",
      ledeA: "向内，不是变得“高级”，而是不断追问能力成立的条件。",
      ledeB: "点击任一节点，展开它的局部认知路径。",
      layerColor: "颜色：认知层级",
      nodeSize: "大小：结构地位",
      glow: "辉光：激活状态",
      radius: "认知半径",
      direction: "外 → 内",
      all: "全部结构",
      localMap: "局部关系图",
      reading: "概念阅读 · 局部关系",
      close: "关闭关系图",
      what: "是什么",
      why: "为什么",
      utility: "有什么用",
      inquiry: "继续追问",
      relatedConcepts: "相关概念",
      inwardRelation: "↓ 向内延伸",
      sameLayerRelation: "→ 同层关联",
      outwardRelation: "↑ 返回外层",
      from: "外层关联",
      onward: "同层 / 内层关联",
      noUpstream: "暂无外层关联",
      noDownstream: "暂无同层或内层关联",
      relationNote: "球体仅高亮作者定义的一阶邻接；点击关系节点可连续导航。",
      share: "分享当前视图",
      copied: "链接已复制",
      textIndex: "文字索引",
      webglFallback: "当前环境无法显示三维球体。",
      openTextIndex: "打开可阅读文字版",
      modelNote: "模型说明",
      modelNoteTitle: "这是一种认知模型，不是唯一分类体系",
      modelNoteA: "层级与关系围绕“AI 能力成立需要什么条件”组织，其中包含作者判断。",
      modelNoteB: "当前地图聚焦能力形成、生产系统、现实行动、失效条件、基础理论与认知边界；它不是完整的 AI 社会影响地图。",
      modelNoteC: "关系采用作者定义的一阶语义连接，后续版本将继续审查其方向、依据与争议。",
      closeModelNote: "关闭模型说明",
      search: "搜索",
      structure: "结构",
      structureTitle: "半径表示认知深度，连线表示已定义关系。",
      structureText: "角度区分探索分支；恒星辉光显示当前被唤醒的区域。",
      nodes: "个候选概念 · 镜头已进入该认知半径",
      branches: ["生成", "构建", "模型", "产品", "现实", "失效", "理论", "边界"],
      pause: "暂停旋转",
      rotate: "自动旋转",
      tour: "开始漫游",
      exitTour: "退出漫游",
      viewMode: "视图模式",
      structureMode: "结构",
      pathMode: "作者路径",
      pathTitle: "一条作者路径从概念结构中独立显影。",
      pathText: "它记录作者从实践问题持续向内追问的轨迹，不是推荐学习顺序。",
      scrollHint: "向内滚动，追问能力成立的条件",
      boundaryHint: "接近认知边界 · 继续滚动",
      arrivals: [
        "",
        "你首先看到的，只是能力的表象。",
        "一次生成，开始被组织成可重复的能力。",
        "继续向内：能力来自模型、数据与优化。",
        "模型可以工作，不等于系统可以可靠运行。",
        "当系统接触现实，输出必须变成判断与行动。",
        "行动进入现实，失效条件便无法再被忽略。",
        "工程问题继续向下，显露出概率、因果、控制与认识论。",
        "你抵达的不是最终答案，而是解释开始失去确定性的边界。",
      ],
      controls: "拖拽旋转 · 滚轮深入 · 悬停读名 · 点击节点",
      zoomControls: "拖拽旋转 · 滚轮缩放 · 悬停读名 · 点击节点",
      relationControls: "关系展开中 · 关闭后恢复深度导航",
      center: "未知核心",
    },
    en: {
      count: "CONCEPT NODES",
      relations: "SEMANTIC RELATIONS",
      eyebrow: "FROM SURFACE TO BOUNDARY · COGNITION PROTOTYPE",
      titleA: "AI is not a line",
      titleB: "that simply gets harder",
      ledeA: "Moving inward means asking what conditions make capability possible.",
      ledeB: "Select any node to unfold its local cognitive path.",
      layerColor: "COLOR: COGNITIVE LAYER",
      nodeSize: "SIZE: STRUCTURAL ROLE",
      glow: "GLOW: ACTIVE FOCUS",
      radius: "COGNITIVE RADIUS",
      direction: "OUT → IN",
      all: "ALL STRUCTURE",
      localMap: "LOCAL RELATION MAP",
      reading: "CONCEPT READING · LOCAL MAP",
      close: "Close relation map",
      what: "WHAT IT IS",
      why: "WHY IT MATTERS",
      utility: "WHAT IT ENABLES",
      inquiry: "KEEP QUESTIONING",
      relatedConcepts: "RELATED CONCEPTS",
      inwardRelation: "↓ MOVE INWARD",
      sameLayerRelation: "→ SAME LAYER",
      outwardRelation: "↑ RETURN OUTWARD",
      from: "OUTER LINKS",
      onward: "SAME / INNER LINKS",
      noUpstream: "NO OUTER LINKS",
      noDownstream: "NO SAME OR INNER LINKS",
      relationNote: "Only author-defined first-order links are highlighted. Select a relation to continue.",
      share: "SHARE CURRENT VIEW",
      copied: "LINK COPIED",
      textIndex: "TEXT INDEX",
      webglFallback: "The 3D sphere is unavailable in this environment.",
      openTextIndex: "OPEN THE READABLE TEXT VERSION",
      modelNote: "MODEL NOTE",
      modelNoteTitle: "A cognitive model, not the only taxonomy",
      modelNoteA: "Layers and relations are organized around the conditions that make AI capability possible. They include authorial judgment.",
      modelNoteB: "The map focuses on capability formation, production systems, real-world action, failure, theory, and cognitive boundaries. It is not a complete map of AI's social impacts.",
      modelNoteC: "Relations are author-defined first-order semantic links. Their direction, basis, and contested status will continue to be reviewed.",
      closeModelNote: "Close model note",
      search: "SEARCH",
      structure: "STRUCTURE",
      structureTitle: "Radius encodes cognitive depth; lines encode defined relations.",
      structureText: "Angle separates paths; stellar glow reveals the currently awakened region.",
      nodes: "candidate concepts · camera entered this cognitive radius",
      branches: ["GENERATE", "BUILD", "MODEL", "PRODUCT", "REALITY", "FAILURE", "THEORY", "BOUNDARY"],
      pause: "PAUSE",
      rotate: "AUTO ROTATE",
      tour: "START TOUR",
      exitTour: "EXIT TOUR",
      viewMode: "VIEW MODE",
      structureMode: "STRUCTURE",
      pathMode: "AUTHOR PATH",
      pathTitle: "The author path separates from the concept structure.",
      pathText: "It records one route inward from practical questions, not a prescribed learning order.",
      scrollHint: "SCROLL INWARD · ASK WHAT MAKES CAPABILITY POSSIBLE",
      boundaryHint: "COGNITIVE BOUNDARY AHEAD · KEEP SCROLLING",
      arrivals: [
        "",
        "What you first encounter is only the surface of capability.",
        "A single generation begins to become a repeatable capability.",
        "Further inward: capability emerges from models, data, and optimization.",
        "A working model does not yet make a reliable system.",
        "When systems meet reality, outputs must become judgments and actions.",
        "Once action enters reality, failure conditions can no longer be ignored.",
        "Engineering questions reveal probability, causality, control, and epistemology beneath them.",
        "You reach no final answer, but a boundary where explanation begins to lose certainty.",
      ],
      controls: "DRAG ROTATE · SCROLL DEPTH · HOVER NAME · SELECT NODE",
      zoomControls: "DRAG ROTATE · SCROLL ZOOM · HOVER NAME · SELECT NODE",
      relationControls: "RELATION MAP OPEN · CLOSE TO RESUME DEPTH",
      center: "UNKNOWN CORE",
    },
  }[language];
  const viewLabel = viewMode === "structure" ? copy.structureMode : copy.pathMode;
  const overviewTitle = viewMode === "structure"
    ? copy.structureTitle
    : copy.pathTitle;
  const overviewText = viewMode === "structure"
    ? copy.structureText
    : copy.pathText;

  return (
    <main
      className={isTouring ? "experience touring" : "experience"}
      lang={language === "zh" ? "zh-CN" : "en"}
    >
      <div
        ref={mountRef}
        className="scene"
        aria-label={language === "zh" ? "可旋转、可点击的 AI 认知概念球体" : "Interactive AI cognition sphere"}
      >
        {webglFailed && (
          <div className="webgl-fallback" role="status">
            <div className="fallback-sphere" aria-hidden="true">
              {LAYERS.slice().reverse().map((layer) => (
                <i
                  key={layer.id}
                  style={{
                    "--ring": layer.color,
                    "--size": String(12 + layer.id * 8) + "%",
                  } as React.CSSProperties}
                />
              ))}
              <b>BOUNDARY</b>
            </div>
            <p>{copy.webglFallback}</p>
            <a href={textIndexHref}>{copy.openTextIndex}</a>
          </div>
        )}
      </div>
      <div ref={labelsRef} className="labels" aria-hidden="true" />
      <div className="atmosphere" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div ref={depthVeilRef} className="depth-veil" aria-hidden="true" />
      <div ref={tourVeilRef} className="tour-veil" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          AI COGNITION SPHERE
          <em>v1.0</em>
        </div>
        <div className="top-actions">
          <div className="counter">
            <b>{CONCEPTS.length}</b> {copy.count} · <b>{RELATIONS.length}</b> {copy.relations}
          </div>
          <button
            ref={searchTriggerRef}
            className="search-trigger"
            onClick={() => {
              setShowModelNote(false);
              setSearchOpen(true);
            }}
            aria-expanded={searchOpen}
          >
            {copy.search}<kbd>⌘K</kbd>
          </button>
          <a className="text-index-link" href={textIndexHref}>{copy.textIndex}</a>
          <button
            className="model-note-trigger"
            onClick={() => setShowModelNote((value) => !value)}
            aria-expanded={showModelNote}
          >
            {copy.modelNote}
          </button>
          <div className="language-switch" aria-label="Language">
            <button
              className={language === "zh" ? "active" : ""}
              onClick={() => changeLanguage("zh")}
              aria-pressed={language === "zh"}
            >
              中文
            </button>
            <button
              className={language === "en" ? "active" : ""}
              onClick={() => changeLanguage("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {searchOpen && (
        <ConceptSearch
          language={language}
          onClose={closeSearch}
          onSelect={chooseConcept}
        />
      )}

      {showModelNote && (
        <aside className="model-note-panel">
          <div className="model-note-head">
            <span>{copy.modelNote}</span>
            <button onClick={() => setShowModelNote(false)} aria-label={copy.closeModelNote}>×</button>
          </div>
          <h2>{copy.modelNoteTitle}</h2>
          <p>{copy.modelNoteA}</p>
          <p>{copy.modelNoteB}</p>
          <p>{copy.modelNoteC}</p>
        </aside>
      )}

      <section className={activeLayer > 0 || selectedKey ? "intro compact" : "intro"}>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.titleA}<br />{copy.titleB}</h1>
        <p className="lede">{copy.ledeA}<br />{copy.ledeB}</p>
        <div className="legend">
          <span><i className="dot cyan" />{copy.layerColor}</span>
          <span><i className="dot large" />{copy.nodeSize}</span>
          <span><i className="dot glow" />{copy.glow}</span>
        </div>
      </section>

      {showScrollHint && viewMode === "structure" && activeLayer === 0 && !selectedKey && (
        <div className="scroll-hint">
          <i aria-hidden="true">↓</i>
          <span>{copy.scrollHint}</span>
        </div>
      )}
      {viewMode === "structure" && activeLayer === 7 && !selectedKey && (
        <div className="boundary-hint">{copy.boundaryHint}</div>
      )}

      {selectedConcept && selectedRelations ? (
        <aside className="relation-panel">
          <div className="relation-head">
            <span>{selectedNote ? copy.reading : copy.localMap}</span>
            <div className="relation-actions">
              <button
                className="share-view"
                onClick={shareCurrentView}
                aria-label={copy.share}
              >
                {shareStatus === "copied" ? copy.copied : copy.share}
              </button>
              <button
                onClick={closeRelationMap}
                aria-label={copy.close}
              >
                ×
              </button>
            </div>
          </div>
          <span className="share-status" aria-live="polite">
            {shareStatus === "copied" ? copy.copied : ""}
          </span>
          <div className="concept-meta">
            <i style={{ background: selectedConcept.layer.color }} />
            LAYER 0{selectedConcept.layer.id} · {selectedConcept.layer.short[language]}
          </div>
          <h2>{localizedName(selectedConcept.name, language, selectedConcept.key)}</h2>
          {selectedNote ? (
            <div className="concept-reading">
              <section>
                <small>{copy.what}</small>
                <p>{selectedNote.definition[language]}</p>
              </section>
              <section>
                <small>{copy.why}</small>
                <p>{selectedNote.why[language]}</p>
              </section>
              <section>
                <small>{copy.utility}</small>
                <p>{selectedNote.utility[language]}</p>
              </section>
              <section className="concept-inquiry">
                <small>{copy.inquiry}</small>
                <p>{selectedNote.inquiry[language]}</p>
                <small className="related-concepts-heading">{copy.relatedConcepts}</small>
                <div className="deeper-links">
                  {selectedNote.deeper.map((key) => {
                    const concept = CONCEPT_BY_KEY.get(key);
                    if (!concept) return null;
                    const layerDelta = concept.layer.id - selectedConcept.layer.id;
                    const layerDirection = layerDelta > 0
                      ? "inward"
                      : layerDelta < 0
                        ? "outward"
                        : "same";
                    const directionLabel = layerDirection === "inward"
                      ? copy.inwardRelation
                      : layerDirection === "outward"
                        ? copy.outwardRelation
                        : copy.sameLayerRelation;
                    return (
                      <button
                        key={key}
                        data-layer-direction={layerDirection}
                        onClick={() => chooseConcept(key)}
                      >
                        <i style={{ background: concept.layer.color }} />
                        <span className="relation-depth-tag">{directionLabel}</span>
                        <span>{localizedName(concept.name, language, concept.key)}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : (
            <p>{selectedConcept.layer.question[language]}</p>
          )}
          {selectedNote && <ConceptEvidence language={language} note={selectedNote} />}
          <div className="relation-flow">
            <div className="relation-column">
              <small>{copy.from}</small>
              {selectedRelations.outward.length ? (
                selectedRelations.outward.map(({ relation, concept, direction }) => (
                  <button
                    key={relation.source + "-" + relation.target}
                    onClick={() => chooseConcept(concept.key)}
                  >
                    <b>{localizedName(concept.name, language, concept.key)}</b>
                    <em>{relationLabel(relation.type, direction, language)}</em>
                  </button>
                ))
              ) : (
                <span className="empty">{copy.noUpstream}</span>
              )}
            </div>
            <div className="current-node">
              <span>{localizedName(selectedConcept.name, language, selectedConcept.key)}</span>
            </div>
            <div className="relation-column">
              <small>{copy.onward}</small>
              {selectedRelations.inward.length ? (
                selectedRelations.inward.map(({ relation, concept, direction }) => (
                  <button
                    key={relation.source + "-" + relation.target}
                    onClick={() => chooseConcept(concept.key)}
                  >
                    <b>{localizedName(concept.name, language, concept.key)}</b>
                    <em>{relationLabel(relation.type, direction, language)}</em>
                  </button>
                ))
              ) : (
                <span className="empty">{copy.noDownstream}</span>
              )}
            </div>
          </div>
          <div className="relation-note">{copy.relationNote}</div>
        </aside>
      ) : (
        <aside className="layer-panel">
          <div className="panel-heading">
            <span>{copy.radius}</span>
            <small>{copy.direction}</small>
          </div>
          <button
            className={activeLayer === 0 ? "layer active" : "layer"}
            onClick={() => navigateToLayer(0)}
          >
            <b>00</b><span>{copy.all}</span><em>ALL</em>
          </button>
          {LAYERS.map((layer) => (
            <button
              key={layer.id}
              className={activeLayer === layer.id ? "layer active" : "layer"}
              onClick={() => navigateToLayer(layer.id)}
              style={{ "--accent": layer.color } as React.CSSProperties}
            >
              <b>0{layer.id}</b>
              <span>{layer.short[language]} · {layer.title[language]}</span>
              <em>{layer.terms.length}</em>
            </button>
          ))}
        </aside>
      )}

      <section className="insight-card">
        <span className="card-index">
          {selectedLayer ? "LAYER 0" + selectedLayer.id : viewLabel}
        </span>
        <h2 className={arrivalLayer ? "arrival" : ""}>
          {arrivalLayer ? copy.arrivals[arrivalLayer] : selectedLayer ? selectedLayer.question[language] : overviewTitle}
        </h2>
        <p>
          {arrivalLayer
            ? selectedLayer?.question[language]
            : selectedLayer
            ? selectedLayer.terms.length + " " + copy.nodes
            : overviewText}
        </p>
      </section>

      <nav className="branches" aria-label="Exploration branches">
        {copy.branches.map((branch, index) => (
          <span key={branch}>
            <i style={{ background: LAYERS[index].color }} />
            {branch}
          </span>
        ))}
      </nav>

      <div className="controls">
        <button onClick={() => setAutoRotate((value) => {
          autoRotateRef.current = !value;
          return !value;
        })}>
          {autoRotate ? copy.pause : copy.rotate}
        </button>
        <div className="mode-switch" role="group" aria-label={copy.viewMode}>
          {([
            ["structure", copy.structureMode],
            ["path", copy.pathMode],
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              data-mode={mode}
              className={viewMode === mode ? "on" : ""}
              aria-pressed={viewMode === mode}
              onClick={() => chooseViewMode(mode)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          ref={tourTriggerRef}
          className="tour-trigger"
          onClick={enterTour}
          aria-pressed={isTouring}
        >
          {copy.tour}
        </button>
        <span>
          {selectedKey
            ? copy.relationControls
            : viewMode === "structure"
              ? copy.controls
              : copy.zoomControls}
        </span>
      </div>

      {isTouring && (
        <button
          ref={tourExitRef}
          className="tour-exit"
          onClick={exitTour}
        >
          <span>{copy.exitTour}</span>
          <small>ESC</small>
        </button>
      )}

      <div ref={coreLabelRef} className="center-label">
        <small>{copy.center}</small>
        <b>BOUNDARY</b>
      </div>
    </main>
  );
}
