import React from "react";
import { Settings } from "lucide-react"; // Using Lucide Settings as our Gear

// --- Section Components ---
import HeroSection from "./herosection/page";
import ProductSection from "./productsection/page";
import ComparisonSection from "./comparison/page";
import AboutUsSection from "./aboutussection/page";
import TestimonialSection from "./testimonialsection/page";
import ServiceCenterSection from "./servicecentersection/page";
import FaqsSection from "./faqssection/page";
import GrowthGraph from "./growthgraphsection/page"; // Standard import

const HomePage = () => {
  // --- MECHANICAL BACKGROUND COMPONENT ---
  const MechanicalBackground = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#0f766e 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Floating Mechanical Gears */}
      <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite]">
        <Settings size={200} className="text-teal-900 opacity-[0.05]" strokeWidth={0.5} />
      </div>
      <div className="absolute top-[40%] right-[-5%] animate-[spin_30s_linear_infinite_reverse]">
        <Settings size={300} className="text-teal-900 opacity-[0.04]" strokeWidth={0.5} />
      </div>
      <div className="absolute bottom-[10%] left-[20%] animate-[spin_25s_linear_infinite]">
        <Settings size={150} className="text-teal-900 opacity-[0.06]" strokeWidth={0.5} />
      </div>
      
      {/* Decorative mechanical bars */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-900/20 to-transparent"></div>
    </div>
  );

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "ManufacturingBusiness",
    "name": "Ali Enterprises",
    "url": "https://alienterprises.in",
    "logo": "https://alienterprises.in/logo.png",
    "description": "Leading manufacturer of Automatic Fly Ash Brick Making Machines, Paver Block Machines, and Concrete Mixers in India.",
    "telephone": "+91-9756300040",
    "priceRange": "₹₹₹",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Near Nahariya Dharm Kanta, Budhana Road",
      "addressLocality": "Khatauli",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "251201",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 29.2811, 
      "longitude": 77.7299
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://www.facebook.com/AliEnterprises",
      "https://www.youtube.com/@alienterprises7509"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9756300040",
      "contactType": "sales",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-50">
      {/* Inject background behind everything */}
      <MechanicalBackground />
      
      {/* Content wrapper relative to bg */}
      <div className="relative z-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        <HeroSection />
        <ProductSection />
        <ComparisonSection />
        <AboutUsSection />
        <TestimonialSection />
        <ServiceCenterSection />
        <FaqsSection />
        <GrowthGraph />
      </div>
    </main>
  );
};

export default HomePage;