import type { Metadata } from "next";
import ReadableIndex from "../readable-index";
import type { Lang } from "../cognition-model";

export const metadata: Metadata = {
  title: "Readable Index | AI Cognition Sphere",
  description: "A non-WebGL reading path through 179 AI concepts, authorial explanations, and references across eight cognitive layers.",
};

type ReadableSpherePageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

export default async function ReadableSpherePage({ searchParams }: ReadableSpherePageProps) {
  const params = await searchParams;
  const language: Lang = params?.lang === "zh" ? "zh" : "en";
  return <ReadableIndex language={language} />;
}
