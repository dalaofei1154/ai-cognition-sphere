"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CONCEPTS, localizedName, type Lang } from "./cognition-model";
import { CONCEPT_NOTES } from "./concept-notes";

type ConceptSearchProps = {
  language: Lang;
  onClose: () => void;
  onSelect: (key: string) => void;
};

export default function ConceptSearch({
  language,
  onClose,
  onSelect,
}: ConceptSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];

    return CONCEPTS
      .map((concept) => {
        const english = concept.name.toLocaleLowerCase();
        const chinese = localizedName(concept.name, "zh", concept.key).toLocaleLowerCase();
        const preferred = localizedName(concept.name, language, concept.key).toLocaleLowerCase();
        const aliases = CONCEPT_NOTES[concept.key]?.aliases;
        const aliasList = [...(aliases?.zh ?? []), ...(aliases?.en ?? [])]
          .map((alias) => alias.toLocaleLowerCase());
        const searchable = `${english} ${chinese} ${aliasList.join(" ")}`;
        let score = 0;
        if (preferred === normalized || english === normalized || chinese === normalized || aliasList.includes(normalized)) score += 100;
        if (preferred.startsWith(normalized) || english.startsWith(normalized) || chinese.startsWith(normalized) || aliasList.some((alias) => alias.startsWith(normalized))) score += 40;
        if (searchable.includes(normalized)) score += 15;
        return { concept, score };
      })
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score || left.concept.layer.id - right.concept.layer.id)
      .slice(0, 12)
      .map(({ concept }) => concept);
  }, [language, query]);

  const selectAt = (index: number) => {
    const concept = results[index];
    if (!concept) return;
    onSelect(concept.key);
    onClose();
  };

  return (
    <div
      className="search-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="search-palette" role="dialog" aria-modal="true" aria-label={language === "zh" ? "搜索概念" : "Search concepts"}>
        <div className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" && results.length > 0) {
                event.preventDefault();
                setActiveIndex((index) => Math.min(results.length - 1, index + 1));
              }
              if (event.key === "ArrowUp" && results.length > 0) {
                event.preventDefault();
                setActiveIndex((index) => Math.max(0, index - 1));
              }
              if (event.key === "Enter") {
                event.preventDefault();
                selectAt(activeIndex);
              }
              if (event.key === "Escape") onClose();
            }}
            placeholder={language === "zh" ? "搜索 RAG、幻觉、因果……" : "Search RAG, hallucination, causality…"}
            aria-label={language === "zh" ? "输入概念名称" : "Enter a concept name"}
            aria-controls="concept-search-results"
            aria-activedescendant={results[activeIndex] ? `search-${results[activeIndex].key.replace(/[^a-zA-Z0-9]/g, "-")}` : undefined}
          />
          <button type="button" onClick={onClose} aria-label={language === "zh" ? "关闭搜索" : "Close search"}>ESC</button>
        </div>

        <div id="concept-search-results" className="search-results" role="listbox">
          {!query.trim() ? (
            <p>{language === "zh" ? "输入中英文概念名，回车后镜头会进入它的局部关系图。" : "Type a concept in Chinese or English, then press Enter to open its local relation map."}</p>
          ) : results.length ? (
            results.map((concept, index) => (
              <button
                id={`search-${concept.key.replace(/[^a-zA-Z0-9]/g, "-")}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={index === activeIndex ? "active" : ""}
                key={concept.key}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectAt(index)}
              >
                <span>
                  <i style={{ background: concept.layer.color }} />
                  <b>{localizedName(concept.name, language, concept.key)}</b>
                  {language === "zh" && <em>{concept.name}</em>}
                </span>
                <small>LAYER 0{concept.layer.id}</small>
              </button>
            ))
          ) : (
            <p>{language === "zh" ? "没有匹配概念。可以尝试更短的关键词。" : "No concept matched. Try a shorter term."}</p>
          )}
        </div>
      </section>
    </div>
  );
}
