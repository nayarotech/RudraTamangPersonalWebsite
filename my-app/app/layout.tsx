import type { Metadata } from "next";
import { Mukta, Noto_Serif_Devanagari, Public_Sans, Source_Serif_4 } from "next/font/google";
import { getLang } from "@/lib/lang";
import "./globals.css";

const serifLatin = Source_Serif_4({ variable: "--font-serif-latin", subsets: ["latin"], style: ["normal", "italic"] });
const serifDeva = Noto_Serif_Devanagari({ variable: "--font-serif-deva", subsets: ["devanagari"], weight: ["400", "500", "600"] });
const sansLatin = Public_Sans({ variable: "--font-sans-latin", subsets: ["latin"] });
const sansDeva = Mukta({ variable: "--font-sans-deva", subsets: ["devanagari"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html
      lang={lang === "np" ? "ne" : "en"}
      data-scroll-behavior="smooth"
      className={`${serifLatin.variable} ${serifDeva.variable} ${sansLatin.variable} ${sansDeva.variable} antialiased`}
    >
      <body className="min-h-screen" suppressHydrationWarning>{children}</body>
    </html>
  );
}
