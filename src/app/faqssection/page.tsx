"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    question: "What types of machinery do you offer?",
    answer: "We offer a wide range of premium industrial machinery including automatic brick makers, trenchers, pole erection machines, and mixers, designed for various construction and manufacturing needs.",
  },
  {
    question: "How can I book a product for purchase?",
    answer: "You can book a product directly through our website by clicking 'Contact Us', or call our sales team directly for a personalized consultation and quotation.",
  },
  {
    question: "Do you offer after-sales support?",
    answer: "Yes, we pride ourselves on our after-sales service. We provide full support including on-site maintenance, repairs, spare parts availability, and 24/7 customer service.",
  },
  {
    question: "Where are your products available?",
    answer: "Our products are available nationwide across India. We have a robust logistics network to ensure safe delivery to your specific site location.",
  },
  {
    question: "What is your warranty policy?",
    answer: "We offer a comprehensive standard warranty on all our machines covering manufacturing defects. Extended warranty packages are also available upon request.",
  },
];

const FAQsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // SEO: Structured Data for FAQPage (Google Rich Snippets)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <section id="faq" className="py-12 lg:py-20 bg-slate-50 relative overflow-hidden">
      
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Decorative Background (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-10 lg:mb-14">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-teal-600 mb-2"
          >
            <span className="w-6 h-0.5 bg-teal-600 rounded-full"></span>
            <span className="text-xs font-bold uppercase tracking-widest">Common Queries</span>
            <span className="w-6 h-0.5 bg-teal-600 rounded-full"></span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl font-extrabold text-slate-900"
          >
            Frequently Asked <span className="text-teal-600">Questions</span>
          </motion.h2>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3">
          {faqItems.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl overflow-hidden border transition-all duration-300 ${
                activeIndex === index 
                  ? "border-teal-500 shadow-md ring-1 ring-teal-500/10" 
                  : "border-slate-200 hover:border-teal-300"
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none focus:bg-slate-50 transition-colors"
                aria-expanded={activeIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className={`text-base sm:text-lg font-bold transition-colors pr-4 ${
                  activeIndex === index ? "text-teal-700" : "text-slate-700"
                }`}>
                  {faq.question}
                </span>
                <div className={`shrink-0 p-1.5 rounded-full transition-colors ${
                  activeIndex === index ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {activeIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {activeIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-5 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Support CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-500 text-sm mb-3">Still have questions?</p>
          <a 
            href="/contactus" 
            className="inline-flex items-center gap-2 text-teal-700 font-bold hover:text-teal-900 transition-colors border-b-2 border-teal-200 hover:border-teal-600 pb-0.5 text-sm sm:text-base"
          >
            <HelpCircle size={18} />
            Contact our Support Team
          </a>
        </motion.div>

      </div>
    </section>
  );
};

export default FAQsSection;