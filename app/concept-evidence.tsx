import type { Lang } from "./cognition-model";
import type { ConceptNote } from "./concept-notes";
import { CONCEPT_SOURCES } from "./concept-sources";

const COPY = {
  zh: {
    evidence: "内容依据",
    contentType: "内容性质",
    reviewed: "最近复核",
    sources: "参考来源",
    sourceKinds: { paper: "论文", standard: "标准", official: "官方资料", book: "著作" },
    statusLabels: { established: "基础概念", authorial: "作者解释", boundary: "边界命题" },
  },
  en: {
    evidence: "EVIDENCE",
    contentType: "CONTENT TYPE",
    reviewed: "LAST REVIEWED",
    sources: "SOURCES",
    sourceKinds: { paper: "PAPER", standard: "STANDARD", official: "OFFICIAL", book: "BOOK" },
    statusLabels: { established: "ESTABLISHED CONCEPT", authorial: "AUTHORIAL INTERPRETATION", boundary: "BOUNDARY PROPOSITION" },
  },
} as const;

type ConceptEvidenceProps = {
  language: Lang;
  note: ConceptNote;
};

export default function ConceptEvidence({ language, note }: ConceptEvidenceProps) {
  const copy = COPY[language];
  const sources = note.sources.map((key) => ({ key, ...CONCEPT_SOURCES[key] }));

  return (
    <section className="concept-evidence" aria-label={copy.evidence}>
      <div className="evidence-meta">
        <span>
          <small>{copy.contentType}</small>
          <b data-status={note.status}>{copy.statusLabels[note.status]}</b>
        </span>
        <span>
          <small>{copy.reviewed}</small>
          <b>{note.reviewedAt}</b>
        </span>
      </div>
      <div className="source-list">
        <small>{copy.sources} · {sources.length}</small>
        {sources.map((source) => (
          <a key={source.key} href={source.url} target="_blank" rel="noreferrer">
            <span>{source.title}</span>
            <em>{copy.sourceKinds[source.kind]} ↗</em>
          </a>
        ))}
      </div>
    </section>
  );
}
