"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

// --- Section Components ---
import HeroSection from "./herosection/page";
import ProductSection from "./productsection/page";
import ComparisonSection from "./comparison/page"; // <--- Imported New Section
import AboutUsSection from "./aboutussection/page";
import TestimonialSection from "./testimonialsection/page";
import ServiceCenterSection from "./servicecentersection/page";
import FaqsSection from "./faqssection/page";

// --- Dynamic Imports ---
const GrowthGraph = dynamic(() => import("./growthgraphsection/page"), {
  ssr: false,
  loading: () => <div className="py-12 text-center text-gray-500">Loading metrics...</div>,
});

const HomePage = () => {
  // --- SEO: ORGANIZATION SCHEMA ---
  // This tells Google this website belongs to a real physical business
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
    <main className="relative overflow-x-hidden min-h-screen bg-gray-50">
      {/* Inject Schema for Google Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <HeroSection />
      
      <ProductSection />
      
      {/* New Comparison Section added here */}
      <ComparisonSection />

      <AboutUsSection />
      <TestimonialSection />
      <ServiceCenterSection />
      <FaqsSection />
      
      <Suspense fallback={null}>
        <GrowthGraph />
      </Suspense>

    </main>
  );
};

export default HomePage;