import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meraki – The Culinary Art Space · Dharamshala",
  description:
    "A cave-carved dining room in the heart of Dharamshala. Momos, thukpa, wood-fired pizza and mocktails near Fountain Chowk, Kotwali Bazar.",
};

export const viewport: Viewport = {
  themeColor: "#120c08",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
