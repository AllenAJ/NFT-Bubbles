import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";

// Import styles
import "@/app/ui/globals.scss";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/md-dark-deeppurple/theme.css";

// Import components
import { PrimeReactProviders } from "./providers";
import Header from "./ui/Header";

// Configure font
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400"],
  display: 'swap'
});

// Get base URL dynamically
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

// Metadata configuration
export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "NFTBubbles | Analyse NFTs!",
    template: `%s | NFTBubbles`,
  },
  description: "Interactive NFT Collection Analytics",
  icons: {
    icon: '/favicon.ico',
  },
};

// Viewport configuration (separated from metadata)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.className} bg-zinc-900 text-white min-h-screen`}>
        <Header />
        <main className="mt-2">
          <PrimeReactProviders>{children}</PrimeReactProviders>
        </main>
      </body>
    </html>
  );
}