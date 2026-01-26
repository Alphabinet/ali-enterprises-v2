"use client";

import { useState, useEffect, useMemo } from 'react';
import { ArrowUp, List } from 'lucide-react';

export default function TermsPage() {
    const [isTocOpen, setIsTocOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    // Memoize sections to avoid recreating the array on each render
    const sections = useMemo(() => [
        { id: 'pricing-taxes', title: '1. Pricing & Taxes' },
        { id: 'delivery-payment', title: '2. Delivery & Payment' },
        { id: 'dispatch-insurance', title: '3. Dispatch & Insurance' },
        { id: 'order-validity', title: '4. Order Validity' },
        { id: 'inspection', title: '5. Inspection' },
        { id: 'erection-commissioning', title: '6. Erection & Commissioning' },
        { id: 'warranty', title: '7. Warranty' },
        { id: 'jurisdiction', title: '8. Jurisdiction' },
    ], []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentSection = sections.find(section => {
                const element = document.getElementById(section.id);
                return element && element.getBoundingClientRect().top < 100;
            });
            if (currentSection) setActiveSection(currentSection.id);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sections]);

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-6 md:px-8 lg:px-12">
            {/* Mobile TOC Toggle Button */}
            <button
                onClick={() => setIsTocOpen(true)}
                className="fixed md:hidden bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
                aria-label="Open table of contents"
            >
                <List size={24} />
            </button>

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-4 left-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
                aria-label="Scroll to top"
            >
                <ArrowUp size={24} />
            </button>

            {/* Mobile TOC Overlay */}
            {isTocOpen && (
                <div className="fixed inset-0 bg-white z-50 overflow-y-auto p-6 md:hidden">
                    <h2 className="text-lg font-bold mb-4 text-gray-700">Table of Contents</h2>
                    <nav>
                        <ul className="space-y-2">
                            {sections.map((section) => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        className={`block px-3 py-2 rounded-lg transition-colors ${
                                            activeSection === section.id
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                        onClick={() => setIsTocOpen(false)}
                                    >
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <button onClick={() => setIsTocOpen(false)} className="mt-4 text-blue-600">
                        Close
                    </button>
                </div>
            )}

            <article className="mx-auto max-w-7xl bg-white rounded-xl shadow-2xl overflow-hidden flex">
                {/* Desktop TOC Sidebar */}
                <aside className="hidden md:block w-64 border-r border-gray-200">
                    <div className="sticky top-0 h-screen overflow-y-auto p-6">
                        <h2 className="text-lg font-bold mb-4 text-gray-700">Table of Contents</h2>
                        <nav>
                            <ul className="space-y-2">
                                {sections.map((section) => (
                                    <li key={section.id}>
                                        <a
                                            href={`#${section.id}`}
                                            className={`block px-3 py-2 rounded-lg transition-colors ${
                                                activeSection === section.id
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {section.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 p-6 md:p-8 lg:p-12">
                    <header className="mb-8">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 pb-4 border-b-2 border-blue-600">
                            Terms &amp; Conditions
                        </h1>
                        <div className="mt-4 text-sm text-gray-500">
                            <p>Effective: {new Date().toLocaleDateString()}</p>
                        </div>
                    </header>

                    <Section id="pricing-taxes" title="1. Pricing & Taxes">
                        <div className="space-y-4">
                            <div>
                                <strong className="block mb-2">Pricing Basis:</strong>
                                <p>All quoted prices are ex-works from our facility at:</p>
                                <address className="not-italic mt-2">
                                    Near Nahariya Dharm Kanta Budhana Road,<br />
                                    Khatauli, Muzaffarnagar<br />
                                    Uttar Pradesh 251201
                                </address>
                            </div>
                            <div>
                                <strong className="block mb-2">Price Variation:</strong>
                                <p>
                                    Prices are based on current market costs of components, raw materials, and labor.
                                    Manufacturer reserves the right to adjust prices according to market fluctuations.
                                </p>
                            </div>
                            <div>
                                <strong className="block mb-2">Taxes:</strong>
                                <p>
                                    Goods and Services Tax (GST) @18% applicable. Any changes in government levies,
                                    duties, or taxes at time of delivery will be borne by the Purchaser.
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section id="delivery-payment" title="2. Delivery & Payment">
                        <div className="space-y-6">
                            <div>
                                <strong className="block mb-2">Delivery Terms:</strong>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>6-8 weeks from receipt of clear order and advance payment</li>
                                    <li>Subject to raw material availability and force majeure</li>
                                    <li>Confirmed orders cannot be modified or canceled</li>
                                    <li>Excludes liquidated damages/penalties</li>
                                </ul>
                            </div>
                            <div>
                                <strong className="block mb-2">Payment Terms:</strong>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>50% non-refundable advance with order</li>
                                    <li>Balance payment against Proforma Invoice prior to dispatch</li>
                                    <li>
                                        Accepted payment methods:
                                        <ul className="list-circle pl-6 mt-2">
                                            <li>Demand Draft</li>
                                            <li>At Par Cheque</li>
                                            <li>NEFT/RTGS/IMPS</li>
                                        </ul>
                                    </li>
                                    <li>
                                        Payable to:
                                        <address className="not-italic mt-2 block">
                                            ICICI Bank, Khatauli G.T Road<br />
                                            Near Ghanta Ghar Road Branch
                                        </address>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Section>

                    <Section id="dispatch-insurance" title="3. Dispatch & Insurance">
                        <div className="space-y-4">
                            <div>
                                <strong className="block mb-2">Dispatch:</strong>
                                <p>
                                    All goods dispatched from our Muzaffarnagar facility. Purchaser assumes all
                                    transportation risks including damage/loss during transit.
                                </p>
                            </div>
                            <div>
                                <strong className="block mb-2">Insurance:</strong>
                                <p>Transit insurance must be arranged and funded by Purchaser.</p>
                            </div>
                        </div>
                    </Section>

                    <Section id="order-validity" title="4. Order Validity">
                        <p>
                            Quotations remain valid for 30 days from issue date unless expressly extended in writing.
                        </p>
                    </Section>

                    <Section id="inspection" title="5. Inspection">
                        <div className="space-y-4">
                            <p>
                                Purchaser must conduct inspection within 15 days of notification at Seller&apos;s premises,
                                at Purchaser&apos;s expense. Failure to inspect within stipulated period constitutes waiver
                                of inspection rights.
                            </p>
                            <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400">
                                <strong>Inspection Limitations:</strong>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Only visual inspection permitted</li>
                                    <li>No-load tests conducted at manufacturer&apos;s discretion</li>
                                </ul>
                            </div>
                        </div>
                    </Section>

                    <Section id="erection-commissioning" title="6. Erection & Commissioning">
                        <div className="space-y-4">
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Supervised by Ali Enterprises technicians</li>
                                <li>
                                    Customer provides:
                                    <ul className="list-circle pl-6 mt-2">
                                        <li>Lodging &amp; boarding for technicians</li>
                                        <li>Local transportation</li>
                                        <li>All necessary tools/equipment</li>
                                        <li>Skilled/unskilled labor</li>
                                    </ul>
                                </li>
                                <li>
                                    Additional charges:
                                    <ul className="list-circle pl-6 mt-2">
                                        <li>₹1,500 per man-day beyond agreed scope</li>
                                        <li>Travel expenses at actual cost</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </Section>

                    <Section id="warranty" title="7. Warranty">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="space-y-4">
                                <div>
                                    <strong className="block mb-2">Warranty Coverage (12 Months from Dispatch):</strong>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Defective materials</li>
                                        <li>Design flaws</li>
                                        <li>Workmanship defects</li>
                                        <li>Component warranties as per original manufacturers</li>
                                    </ul>
                                </div>
                                <div className="bg-red-50 p-4 rounded border border-red-200">
                                    <strong className="block mb-2 text-red-600">Warranty Exclusions:</strong>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Improper handling/storage</li>
                                        <li>Operational errors/overloading</li>
                                        <li>Normal wear and tear</li>
                                        <li>Unauthorized repairs/modifications</li>
                                        <li>Fabrication work</li>
                                        <li>Consequential damages</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section id="jurisdiction" title="8. Jurisdiction">
                        <div className="bg-gray-50 p-4 rounded border border-gray-200">
                            <p>All legal matters subject to exclusive jurisdiction of:</p>
                            <p className="mt-2 font-semibold">
                                Courts in Muzaffarnagar, Uttar Pradesh
                            </p>
                        </div>
                    </Section>

                    <footer className="mt-12 pt-8 border-t border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="text-gray-600">
                                <p className="font-semibold">Ali Enterprises</p>
                                <address className="not-italic text-sm">
                                    Near Nahariya Dharm Kanta Budhana Road<br />
                                    Khatauli, Muzaffarnagar<br />
                                    Uttar Pradesh 251201
                                </address>
                            </div>
                            <button
                                onClick={scrollToTop}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                            >
                                <ArrowUp size={16} />
                                <span>Back to Top</span>
                            </button>
                        </div>
                    </footer>
                </div>
            </article>
        </main>
    );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className="mb-8 scroll-mt-20">
            <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">{title}</h2>
            <div className="text-gray-600 space-y-4">{children}</div>
        </section>
    );
}
