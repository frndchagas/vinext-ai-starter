import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Vinext AI Starter for Laravel",
  description:
    "A serious starting point for AI software, with Vinext, Laravel, typed contracts, queues and realtime.",
  openGraph: {
    description:
      "A serious starting point for AI software, with Vinext, Laravel, typed contracts, queues and realtime.",
    title: "Vinext AI Starter for Laravel",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
