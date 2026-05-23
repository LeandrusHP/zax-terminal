import type { Metadata } from "next";
import "./globals.css";
import "../../styles/pip-ui/index.scss";

export const metadata: Metadata = {
  title: "ZAX Terminal - Vault-Tec Industries",
  description: "Generalized Occupational Aptitude Test - Vault-Tec ZAX AI System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="pip-body pip-crt">
        {children}
      </body>
    </html>
  );
}
