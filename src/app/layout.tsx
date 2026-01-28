import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout"; // Import the component we made in Step 1

const inter = Inter({ subsets: ["latin"] });

// --- POWERFUL SEO METADATA ---
export const metadata: Metadata = {
  metadataBase: new URL('https://alienterprises.in'),
  title: {
    default: "Ali Enterprises | Brick Making Machine Manufacturer & Exporter",
    template: "%s | Ali Enterprises - Industrial Machinery",
  },
  description: "Leading manufacturer of Automatic Fly Ash Brick Machines, Paver Block Machines, Concrete Mixers, and Hydraulic Press Machinery in Khatauli, India. Exporting globally.",
  
  // 1. GLOBAL KEYWORDS (English + Hindi + Global)
  keywords: [
    // English (High Volume)
    "Brick Making Machine", "Fly Ash Brick Machine", "Paver Block Machine", 
    "Automatic Brick Plant", "Concrete Block Machine", "Interlocking Brick Machine",
    "Hydraulic Press Machine", "Vibrating Table", "Pan Mixer", "Red Brick Machine",
    
    // Hindi / Hinglish (Local Search)
    "Eent Banane Ki Machine", "Brick Machine Price India", "Fly Ash Machine Khatauli",
    "Paver Block Banane Ki Machine", "Cement Brick Machine",
    
    // Global/International (Spanish, French, Arabic - specific for exports)
    "Máquina de ladrillos (Spanish)", 
    "Machine à briques (French)", 
    "آلة الطوب (Arabic)",
    "Ziegelmaschine (German)", 
    "Станок для кирпича (Russian)",
    "Mašina za cigle (European)"
  ],
  
  // 2. ROBOTS (Allow everything)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 3. VERIFICATION (You need to get this code from Google Search Console)
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE_HERE", 
  },

  // 4. OPEN GRAPH (For WhatsApp/Facebook/LinkedIn sharing)
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://alienterprises.in",
    title: "Ali Enterprises - Brick Making Machinery",
    description: "Best Price & Quality Brick Making Machines. ISO Certified Manufacturer.",
    siteName: "Ali Enterprises",
    images: [
      {
        url: "/machines/default.png", 
        width: 1200,
        height: 630,
        alt: "Ali Enterprises Factory View",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon_io/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/favicon_io/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}