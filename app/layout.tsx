import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Octocat Generator",
  description: "Transform your photo into a personalized GitHub Octocat avatar",
  icons: {
    icon: "/favicon.svg",
  },
};

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
