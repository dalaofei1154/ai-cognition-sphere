import type { CSSProperties } from "react";
import { CONCEPT_NOTES, type ConceptNoteStatus } from "./concept-notes";
import { CONCEPT_SOURCES } from "./concept-sources";
import { CONCEPTS, LAYERS, localizedName, type Lang } from "./cognition-model";

const COPY = {
  en: {
    back: "← Back to 3D Sphere",
    title: "AI Cognition Sphere",
    subtitle: "Readable Index",
    intro: "This reading path does not depend on WebGL or spatial interaction. It moves through eight layers, from visible capabilities to cognitive boundaries, while distinguishing established concepts from authorial interpretations and boundary propositions.",
    layerNav: "Cognitive layers",
    reviewed: "Reviewed",
    what: "WHAT IT IS",
    why: "WHY IT MATTERS",
    utility: "WHAT IT IS USEFUL FOR",
    inquiry: "A QUESTION TO CARRY FORWARD",
    sources: "REFERENCES",
    open: "Open in the 3D sphere ↗",
  },
  zh: {
    back: "← 返回三维球体",
    title: "AI 认知边界球体",
    subtitle: "文字索引",
    intro: "这是不依赖 WebGL 和空间操作的阅读入口。内容按从能力表象到认知边界的八层结构组织；“作者解释”与“边界命题”明确标出，不与已建立概念混同。",
    layerNav: "认知层级",
    reviewed: "复核",
    what: "是什么",
    why: "为什么",
    utility: "有什么用",
    inquiry: "继续追问",
    sources: "参考来源",
    open: "在三维球体中打开 ↗",
  },
} as const;

const STATUS_LABELS: Record<Lang, Record<ConceptNoteStatus, string>> = {
  en: {
    established: "Established concept",
    authorial: "Authorial interpretation",
    boundary: "Boundary proposition",
  },
  zh: {
    established: "基础概念",
    authorial: "作者解释",
    boundary: "边界命题",
  },
};

const SOURCE_KIND_LABELS: Record<Lang, Record<"paper" | "standard" | "official" | "book", string>> = {
  en: { paper: "Paper", standard: "Standard", official: "Official source", book: "Book" },
  zh: { paper: "论文", standard: "标准", official: "官方资料", book: "著作" },
};

type ReadableIndexProps = {
  language: Lang;
  offlineMode?: boolean;
};

function conceptId(key: string) {
  return `concept-${key.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

export default function ReadableIndex({ language, offlineMode = false }: ReadableIndexProps) {
  const copy = COPY[language];
  const sphereFile = offlineMode ? "AI-Cognition-Sphere-v1.0.0.html" : "/";
  const languageQuery = language === "zh" ? "lang=zh" : "";
  const sphereHomeHref = languageQuery ? `${sphereFile}?${languageQuery}` : sphereFile;

  return (
    <main className="reading-page" lang={language === "zh" ? "zh-CN" : "en"}>
      <div className="reading-shell">
        <header className="reading-header">
          <a className="reading-back" href={sphereHomeHref}>
            {copy.back}
          </a>
          <h1>{copy.title}<br />{copy.subtitle}</h1>
          <p>{copy.intro}</p>
          <nav className="reading-nav" aria-label={copy.layerNav}>
            {LAYERS.map((layer) => (
              <a key={layer.id} href={`#layer-${layer.id}`}>
                0{layer.id} · {layer.short[language]}
              </a>
            ))}
          </nav>
        </header>

        {LAYERS.map((layer) => {
          const layerConcepts = CONCEPTS.filter((concept) => concept.layer.id === layer.id);
          return (
            <section
              id={`layer-${layer.id}`}
              className="reading-layer"
              key={layer.id}
              style={{ "--layer-color": layer.color } as CSSProperties}
            >
              <div className="reading-layer-head">
                <span>0{layer.id}</span>
                <div>
                  <h2>{layer.short[language]} · {layer.title[language]}</h2>
                  <p>{layer.question[language]}</p>
                </div>
              </div>

              <div className="reading-concepts">
                {layerConcepts.map((concept) => {
                  const note = CONCEPT_NOTES[concept.key];
                  if (!note) return null;
                  const sources = note.sources.map((key) => ({ key, ...CONCEPT_SOURCES[key] }));
                  const conceptQuery = new URLSearchParams({ concept: concept.key });
                  if (languageQuery) conceptQuery.set("lang", "zh");
                  return (
                    <details className="reading-concept" id={conceptId(concept.key)} key={concept.key}>
                      <summary>
                        <span>
                          <b>{localizedName(concept.name, language, concept.key)}</b>
                          <em>{localizedName(concept.name, language === "zh" ? "en" : "zh", concept.key)}</em>
                        </span>
                        <small>{STATUS_LABELS[language][note.status]} · {copy.reviewed} {note.reviewedAt}</small>
                      </summary>
                      <div className="reading-content">
                        <div className="reading-copy">
                          <section><small>{copy.what}</small><p>{note.definition[language]}</p></section>
                          <section><small>{copy.why}</small><p>{note.why[language]}</p></section>
                          <section><small>{copy.utility}</small><p>{note.utility[language]}</p></section>
                          <section><small>{copy.inquiry}</small><p>{note.inquiry[language]}</p></section>
                        </div>
                        <div className="reading-sources">
                          <small>{copy.sources} · {sources.length}</small>
                          {sources.map((source) => (
                            <a href={source.url} key={source.key} target="_blank" rel="noreferrer">
                              {source.title} · {SOURCE_KIND_LABELS[language][source.kind]} ↗
                            </a>
                          ))}
                        </div>
                        <a className="open-in-sphere" href={`${sphereFile}?${conceptQuery.toString()}`}>
                          {copy.open}
                        </a>
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
