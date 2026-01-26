"use client";

import React, { useState, useEffect } from 'react';

// Types
interface BrickMachine {
  id: string;
  name: string;
  description: string;
  price: string;
  images: string[];
  features: string[];
  specs: {
    [key: string]: string[];
  };
}

const BrickMachineLanding: React.FC = () => {
  const [machines, setMachines] = useState<BrickMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from JSON file
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/productsData.json');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setMachines(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-700 font-medium">Loading machines...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-teal-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.08),rgba(255,255,255,0))]"></div>

      <main className="relative">
        {/* Enhanced Hero Section with Responsive Images */}
        <section id="home" className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-cyan-600">
          <div className="relative aspect-[4/3] sm:aspect-[2/1] lg:aspect-[3/1] xl:aspect-[4/1]">
            {/* Responsive Images with different sources for different screen sizes */}
            <picture>
              {/* Mobile Image */}
              <source
                media="(max-width: 640px)"
                srcSet="hero/hero-mobile.jpg"
              />
              {/* Tablet Image */}
              <source
                media="(max-width: 1024px)"
                srcSet="hero/hero-tablet.jpg"
              />
              {/* Desktop Image */}
              <source
                media="(min-width: 1025px)"
                srcSet="hero/hero-desktop.jpg"
              />
              {/* Fallback Image */}
              <img
                src="hero/hero-desktop.jpg"
                alt="Modern Brick Manufacturing Equipment"
                className="w-full h-full object-cover object-center"
              />
            </picture>

            {/* Hero Content - Centered and Improved */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-4xl">
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 hidden sm:block">
                    <a
                      href="#machines"
                      className="bg-teal-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base hover:bg-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
                    >
                      View Machines
                    </a>
                    <a
                      href="#contact"
                      className="border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-sm sm:text-base hover:bg-white hover:text-teal-700 transition-all duration-300 transform hover:scale-105 text-center"
                    >
                      Get Quote
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Brick Machines Section */}
        <section id="machines" className="py-12 sm:py-16 md:py-20 relative">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                Our <span className="text-teal-600">Brick Machines</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                High-quality, efficient brick making machines designed for maximum productivity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
              {machines.map((machine) => (
                <div
                  key={machine.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
                >
                  {/* Machine Image */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    {machine.images && machine.images.length > 0 ? (
                      <img
                        src={machine.images[0]}
                        alt={machine.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                        <span className="text-teal-600 text-sm font-medium">Machine Image</span>
                      </div>
                    )}
                    {/* Price Badge */}
                    <div className="absolute top-3 right-3 bg-teal-600 text-white px-3 py-1 rounded-full font-bold text-xs sm:text-sm shadow-lg">
                      {machine.price}
                    </div>
                  </div>

                  {/* Content - Flex column to push button to bottom */}
                  <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    <div className="mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                        {machine.name}
                      </h3>
                      <div className="w-10 h-1 bg-teal-500 rounded-full mb-3"></div>
                    </div>

                    {/* Key Features */}
                    <div className="space-y-2 mb-6 flex-grow">
                      <h4 className="font-semibold text-gray-700 text-sm sm:text-base mb-2">Key Features:</h4>
                      {machine.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-4 h-4 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-2 h-2 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-gray-600 text-xs sm:text-sm leading-relaxed flex-grow">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button - Always at bottom */}
                    <button className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-teal-500/25 mt-auto flex items-center justify-center space-x-2">
                      <span>Get Quote</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* UPDATED Contact Section - Now uses Google Embedded Form */}
        <section id="contact" className="py-12 sm:py-16 md:py-20 bg-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(20,184,166,0.05),transparent_50%)]"></div>

          <div className="container mx-auto px-4 sm:px-6 relative">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                Contact <span className="text-teal-600">Us</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Get in touch for quotes, demonstrations, or any questions
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              {/* Contact Methods (Adopted from reference code) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {/* Direct Call */}
                <a
                  href="tel:+919756300040"
                  className="group bg-white border border-teal-100 rounded-2xl p-4 sm:p-6 text-center hover:border-teal-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-teal-200 transition-colors duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Call Us</h3>
                  <p className="text-teal-600 text-sm sm:text-base font-semibold mb-1">+91 9756300040</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Direct phone support</p>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/+919756300040"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white border border-teal-100 rounded-2xl p-4 sm:p-6 text-center hover:border-teal-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-teal-200 transition-colors duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10a8 8 0 1114.547 4.89l1.846 1.847a1 1 0 01-1.416 1.414l-1.848-1.846A8 8 0 012 10zm8-6a6 6 0 100 12A6 6 0 0010 4z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">WhatsApp</h3>
                  <p className="text-teal-600 text-sm sm:text-base font-semibold mb-1">Quick Chat</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Instant messaging</p>
                </a>

                {/* Email */}
                <a
                  href="mailto:alienterprises54@yahoo.com"
                  className="group bg-white border border-teal-100 rounded-2xl p-4 sm:p-6 text-center hover:border-teal-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-teal-200 transition-colors duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Email Us</h3>
                  <p className="text-teal-600 text-sm sm:text-base font-semibold mb-1">alienterprises54@yahoo.com</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Detailed inquiries</p>
                </a>
              </div>

              {/* Google Form Embed */}
              <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 border border-gray-100">
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Enquiry Form</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Submit your details and query through our secured form</p>
                </div>

                <div className="relative overflow-hidden rounded-xl">
                  <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSeeNf2W4VIeZu0es5H5O_OYfCeOYdc3osDGHh0-vuEzA4ckmQ/viewform?embedded=true"
                    className="w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] border-none"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    title="Contact Enquiry Form"
                  >
                    Loading…
                  </iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BrickMachineLanding;