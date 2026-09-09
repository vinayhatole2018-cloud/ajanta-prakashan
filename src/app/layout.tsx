import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ToastProvider } from "@/contexts/ToastContext";
import { ServiceWorkerRegistration } from "@/components/common/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ajanta Prakashan | Academic Conferences & Publications",
    template: "%s | Ajanta Prakashan",
  },
  description:
    "Ajanta Prakashan organizes and publishes peer-reviewed national and international academic conferences, seminars and workshops across disciplines.",
  manifest: "/manifest.webmanifest",
  applicationName: "Ajanta Prakashan",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ajanta Prakashan",
  },
  icons: {
    icon: [{ url: "/images/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/images/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#b5651d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Script id="pwa-install-capture" strategy="beforeInteractive">
          {`
            window.addEventListener("beforeinstallprompt", function (e) {
              e.preventDefault();
              window.__pwaInstallEvent = e;
              window.dispatchEvent(new Event("pwa-install-available"));
            });
          `}
        </Script>
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
