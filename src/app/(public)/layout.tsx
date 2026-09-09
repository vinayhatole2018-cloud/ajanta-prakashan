import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { OfflineBanner } from "@/components/public/OfflineBanner";
import { InstallPromptBanner } from "@/components/common/InstallPromptBanner";
import { FloatingWhatsAppButton } from "@/components/public/FloatingWhatsAppButton";
import { PublicAuthProvider } from "@/contexts/PublicAuthContext";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicAuthProvider>
      <div className="flex min-h-screen flex-col pb-16">
        <OfflineBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsAppButton />
        <InstallPromptBanner />
      </div>
    </PublicAuthProvider>
  );
}
