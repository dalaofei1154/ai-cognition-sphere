import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const TITLE = "AI Cognition Sphere | From Capabilities to Conditions";
const DESCRIPTION = "An interactive authorial map of AI concepts, systems, real-world action, failure conditions, foundations, and cognitive boundaries.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: TITLE,
    description: DESCRIPTION,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      title: TITLE,
      description: DESCRIPTION,
      images: [{ url: imageUrl, width: 1729, height: 910, alt: "AI Cognition Sphere" }],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
