"use client";

import { useCallback, useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { CONCEPT_BY_KEY, type Lang, type ViewMode } from "./cognition-model";

export type SphereReturnContext = {
  viewMode: ViewMode;
  layer: number;
  depth: number;
  autoRotate: boolean;
};

type ValueRef<T> = MutableRefObject<T>;

type SphereUrlBindings = {
  languageRef: ValueRef<Lang>;
  viewModeRef: ValueRef<ViewMode>;
  selectedKeyRef: ValueRef<string | null>;
  activeLayerRef: ValueRef<number>;
  depthTargetRef: ValueRef<number>;
  autoRotateRef: ValueRef<boolean>;
  overviewResetPendingRef: ValueRef<boolean>;
  relationReturnRef: ValueRef<SphereReturnContext | null>;
  setLanguage: Dispatch<SetStateAction<Lang>>;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  setSelectedKey: Dispatch<SetStateAction<string | null>>;
  setActiveLayer: Dispatch<SetStateAction<number>>;
  setAutoRotate: Dispatch<SetStateAction<boolean>>;
  setShowScrollHint: Dispatch<SetStateAction<boolean>>;
  setArrivalLayer: Dispatch<SetStateAction<number | null>>;
};

export type SphereUrlUpdate = Partial<Record<"concept" | "view" | "layer" | "lang", string | null>>;

export function useSphereUrlState({
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
}: SphereUrlBindings) {
  const updateUrl = useCallback((updates: SphereUrlUpdate, replace = false) => {
    const url = new URL(window.location.href);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    });
    window.history[replace ? "replaceState" : "pushState"]({}, "", url);
  }, []);

  useEffect(() => {
    const applyUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const language: Lang = params.get("lang") === "zh" ? "zh" : "en";
      const viewMode: ViewMode = params.get("view") === "path" ? "path" : "structure";
      const requestedLayer = Number(params.get("layer"));
      const layer = Number.isInteger(requestedLayer) && requestedLayer >= 1 && requestedLayer <= 8
        ? requestedLayer
        : 0;
      const conceptKey = params.get("concept");
      const concept = conceptKey ? CONCEPT_BY_KEY.get(conceptKey) ?? null : null;

      languageRef.current = language;
      setLanguage(language);
      viewModeRef.current = viewMode;
      setViewMode(viewMode);
      if (conceptKey || layer > 0 || viewMode === "path") setShowScrollHint(false);
      setArrivalLayer(null);

      if (concept) {
        relationReturnRef.current = {
          viewMode,
          layer,
          depth: layer,
          autoRotate: layer === 0,
        };
        selectedKeyRef.current = concept.key;
        setSelectedKey(concept.key);
        activeLayerRef.current = concept.layer.id;
        setActiveLayer(concept.layer.id);
        depthTargetRef.current = concept.layer.id;
        autoRotateRef.current = false;
        setAutoRotate(false);
        return;
      }

      relationReturnRef.current = null;
      selectedKeyRef.current = null;
      setSelectedKey(null);
      activeLayerRef.current = layer;
      setActiveLayer(layer);
      depthTargetRef.current = layer;
      autoRotateRef.current = layer === 0;
      setAutoRotate(layer === 0);
      overviewResetPendingRef.current = viewMode !== "structure";
    };

    applyUrlState();
    window.addEventListener("popstate", applyUrlState);
    return () => window.removeEventListener("popstate", applyUrlState);
    // All mutable scene values are intentionally supplied as stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return updateUrl;
}
