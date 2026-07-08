"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle, X, RefreshCcw, User,
  ChevronRight, Phone, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- Types ---
type Message = {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: number;
};

interface ChatNode {
  id: string;
  text: string;
  options?: Option[];
}

interface Option {
  text: string;
  nextNodeId?: string;
  action?: () => void;
  variant?: "primary" | "secondary" | "outline";
}

// --- Configuration ---
const COMPANY_NAME = "Ali Enterprises";
const CONTACT_NUMBER = "+919756300040";
const WHATSAPP_URL = `https://wa.me/919756300040`;
const GOOGLE_FORM_URL = "https://forms.gle/LQwMAdZdsjA54Ytn8";
const YOUTUBE_URL = "https://www.youtube.com/@alienterprises7509/videos";

// --- Static Initial Graph ---
const initialConfig: Record<string, ChatNode> = {
  root: {
    id: "root",
    text: `👋 Hi there! Welcome to ${COMPANY_NAME}. I'm your virtual assistant.\n\nI can help you with machine details, spare parts, or pricing. How can I assist you today?`,
    options: [
      { text: "🏭 Explore Machines", nextNodeId: "machines", variant: "primary" },
      { text: "⚙️ Buy Spare Parts", nextNodeId: "parts" },
      { text: "💰 Get a Price Quote", nextNodeId: "quotes" },
      { text: "📍 Location & Contact", nextNodeId: "contact" },
      { text: "👨‍💻 Talk to Support", nextNodeId: "support_fallback", variant: "outline" },
    ],
  },

  // "machines" node will be populated dynamically in useEffect
  machines: {
    id: "machines",
    text: "Loading our latest machinery list...",
    options: []
  },

  // --- Parts Branch ---
  parts: {
    id: "parts",
    text: "We stock 100% genuine spare parts (Motors, Dies, Belts, Panels). How would you like to order?",
    options: [
      {
        text: "Order via WhatsApp (Fastest)",
        action: () => window.open(`${WHATSAPP_URL}?text=Hi, I need spare parts for...`, "_blank")
      },
      { text: "📞 Call Parts Dept", action: () => window.open(`tel:${CONTACT_NUMBER}`) },
      { text: "⬅️ Main Menu", nextNodeId: "root" },
    ],
  },

  // --- Quotes Branch ---
  quotes: {
    id: "quotes",
    text: "Since our machines are customizable, prices vary based on motor power and automation level. What is the best way to send you a quote?",
    options: [
      {
        text: "📝 Fill Inquiry Form",
        action: () => window.open(GOOGLE_FORM_URL, "_blank")
      },
      {
        text: "💬 Chat with Sales",
        action: () => window.open(`${WHATSAPP_URL}?text=Hi, I want a price quote for...`, "_blank")
      },
      { text: "⬅️ Main Menu", nextNodeId: "root" },
    ],
  },

  // --- Contact Branch ---
  contact: {
    id: "contact",
    text: "We are located in Khatauli, Uttar Pradesh. Here are our details:",
    options: [
      { text: "📍 Open on Google Maps", action: () => window.open("https://maps.app.goo.gl/YourMapLinkHere", "_blank") },
      { text: "📞 Call Us Now", action: () => window.open(`tel:${CONTACT_NUMBER}`) },
      { text: "⬅️ Main Menu", nextNodeId: "root" },
    ],
  },

  // --- Fallback / Support ---
  support_fallback: {
    id: "support_fallback",
    text: "It seems I can't solve your specific query directly. Our human experts are available 9 AM - 7 PM to help you!",
    options: [
      {
        text: "💬 Chat on WhatsApp",
        action: () => window.open(`${WHATSAPP_URL}?text=I have a specific question not covered in the chatbot...`, "_blank")
      },
      { text: "📞 Call Support", action: () => window.open(`tel:${CONTACT_NUMBER}`) },
      { text: "⬅️ Main Menu", nextNodeId: "root" },
    ],
  },
};

// =====================================================================
// SIGNATURE ELEMENT — animated two-gear mark
// Built once, reused everywhere as the bot's "brand": header logo,
// message avatar, and the typing / loading indicator. This mirrors the
// client's actual product (brick & machine manufacturing) instead of a
// generic bot icon.
// =====================================================================
function gearPath(cx: number, cy: number, outerR: number, innerR: number, teeth: number): string {
  const pts: string[] = [];
  const step = (Math.PI * 2) / (teeth * 2);
  for (let i = 0; i < teeth * 2; i++) {
    const angle = i * step - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  pts.push("Z");
  return pts.join(" ");
}

const BIG_GEAR = gearPath(46, 60, 27, 20, 10);
const SMALL_GEAR = gearPath(80, 32, 17, 12, 8);

const GearMark = ({ size = 22, spinning = true }: { size?: number; spinning?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g
      style={{
        transformOrigin: "46px 60px",
        animation: spinning ? "gear-spin-cw 6s linear infinite" : undefined,
      }}
    >
      <path d={BIG_GEAR} fill="currentColor" className="text-teal-600" />
      <circle cx="46" cy="60" r="8" fill="white" />
    </g>
    <g
      style={{
        transformOrigin: "80px 32px",
        animation: spinning ? "gear-spin-ccw 4.2s linear infinite" : undefined,
      }}
    >
      <path d={SMALL_GEAR} fill="currentColor" className="text-teal-400" />
      <circle cx="80" cy="32" r="5" fill="white" />
    </g>
    <style jsx>{`
      @keyframes gear-spin-cw {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes gear-spin-ccw {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
      }
    `}</style>
  </svg>
);

// --- Helper Components ---
const ChatBubble = ({ message }: { message: Message }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={`flex w-full mb-4 ${message.isBot ? "justify-start" : "justify-end"}`}
    >
      <div className={`flex max-w-[85%] ${message.isBot ? "flex-row" : "flex-row-reverse"} items-end gap-2`}>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${message.isBot ? "bg-teal-50 ring-1 ring-teal-100" : "bg-slate-200 text-slate-600"}`}>
          {message.isBot ? <GearMark size={18} spinning={false} /> : <User size={14} />}
        </div>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm text-sm whitespace-pre-line leading-relaxed ${
            message.isBot
              ? "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
              : "bg-teal-600 text-white rounded-br-none"
          }`}
        >
          {message.content}
          <div className={`text-[10px] mt-1 opacity-70 ${message.isBot ? "text-slate-400" : "text-teal-100"}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ChatBot = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);

  // State for dynamic configuration
  const [chatConfig, setChatConfig] = useState<Record<string, ChatNode>>(initialConfig);
  const [currentNode, setCurrentNode] = useState<ChatNode>(initialConfig.root);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // --- DYNAMIC DATA FETCHING ---
  useEffect(() => {
    const fetchProductsForChat = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

        const productOptions: Option[] = products.map(product => ({
          text: product.name,
          nextNodeId: `product_${product.id}`,
          variant: 'secondary'
        }));

        const newProductNodes: Record<string, ChatNode> = {};
        products.forEach(product => {
          newProductNodes[`product_${product.id}`] = {
            id: `product_${product.id}`,
            text: `**${product.name}**\n\n${product.description ? product.description.slice(0, 120) + "..." : "High quality brick making machine."}\n\nWould you like to see full specs or get a price?`,
            options: [
              {
                text: "📄 View Full Details",
                action: () => {
                  router.push(`/products/${product.id}`);
                  onClose();
                },
                variant: 'primary'
              },
              { text: "💰 Get Best Price", nextNodeId: "quotes" },
              { text: "⬅️ Back to Machines", nextNodeId: "machines" }
            ]
          };
        });

        setChatConfig(prev => ({
          ...prev,
          ...newProductNodes,
          machines: {
            id: "machines",
            text: "We manufacture a wide range of Fly Ash Brick Machines. Which model are you interested in?",
            options: [
              ...productOptions,
              { text: "📺 Watch Demo Videos", action: () => window.open(YOUTUBE_URL, "_blank") },
              { text: "⬅️ Main Menu", nextNodeId: "root", variant: "outline" },
            ]
          }
        }));
      } catch (error) {
        console.error("Error fetching products for chatbot:", error);
        setChatConfig(prev => ({
          ...prev,
          machines: {
            id: "machines",
            text: "Could not load products at the moment. Please contact support directly.",
            options: [
              { text: "📞 Call Support", action: () => window.open(`tel:${CONTACT_NUMBER}`) },
              { text: "⬅️ Main Menu", nextNodeId: "root" }
            ]
          }
        }));
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProductsForChat();
  }, [router, onClose]);

  // If the user is sitting on the "machines" node when the catalog finishes
  // loading, refresh what's on screen instead of leaving stale text.
  useEffect(() => {
    if (currentNode.id === "machines" && chatConfig.machines.text !== currentNode.text) {
      setCurrentNode(chatConfig.machines);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatConfig]);

  // --- Auto-Scroll Logic ---
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  // --- Initial Load ---
  useEffect(() => {
    if (messages.length === 0) {
      addBotMessage(currentNode.text);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Escape to close + focus the panel on open ---
  useEffect(() => {
    panelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // --- Handlers ---
  const addBotMessage = (text: string) => {
    setIsBotTyping(true);
    timeoutRef.current = setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: text,
        isBot: true,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setIsBotTyping(false);
    }, 600);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isBot: false,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleOptionSelect = (option: Option) => {
    addUserMessage(option.text);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (option.action) {
      setTimeout(() => {
        option.action?.();
      }, 500);
    }

    if (option.nextNodeId) {
      const nextNode = chatConfig[option.nextNodeId] || chatConfig.support_fallback;
      setCurrentNode(nextNode);
      addBotMessage(nextNode.text);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentNode(chatConfig.root);
    addBotMessage(chatConfig.root.text);
  };

  const optionListVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  };
  const optionItemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={panelRef}
      tabIndex={-1}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${COMPANY_NAME} chat assistant`}
      className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full h-[85vh] sm:h-auto sm:w-[400px] sm:max-h-[620px] bg-slate-50 shadow-2xl rounded-t-3xl sm:rounded-[28px] border border-slate-200/80 overflow-hidden flex flex-col z-50 font-sans outline-none"
    >
      {/* --- HEADER --- */}
      <div className="relative bg-gradient-to-r from-teal-700 via-teal-600 to-teal-600 text-white p-4 flex items-center justify-between shadow-md shrink-0 overflow-hidden">
        {/* faint background gear for industrial texture */}
        <div className="pointer-events-none absolute -right-6 -top-8 opacity-10">
          <GearMark size={130} />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 bg-white/90 rounded-full flex items-center justify-center shadow-inner">
              <GearMark size={26} />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-teal-700 rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base leading-tight">Ali Assistant</h3>
            <span className="text-[10px] sm:text-xs text-teal-100 opacity-90 flex items-center gap-1">
              <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span> Online now
            </span>
          </div>
        </div>
        <div className="relative flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-teal-100 hover:text-white"
            title="Restart Conversation"
            aria-label="Restart conversation"
          >
            <RefreshCcw size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-teal-100 hover:text-white"
            title="Close"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* --- CHAT AREA --- */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50 scroll-smooth custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {isBotTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-slate-400 text-xs ml-1 mb-2"
          >
            <div className="w-7 h-7 rounded-full bg-teal-50 ring-1 ring-teal-100 flex items-center justify-center shrink-0">
              <GearMark size={16} spinning />
            </div>
            <span className="italic">Ali Assistant is typing...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* --- OPTIONS AREA --- */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2 ml-1 flex items-center gap-1.5">
          {currentNode.id === "machines" && isLoadingProducts ? (
            <>
              <GearMark size={12} spinning />
              Fetching machine catalog
            </>
          ) : (
            "Suggested Options"
          )}
        </div>
        <motion.div
          variants={optionListVariants}
          initial="hidden"
          animate="show"
          key={currentNode.id}
          className="grid grid-cols-1 gap-2 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar"
        >
          {currentNode.options?.map((option, index) => (
            <motion.button
              key={index}
              variants={optionItemVariants}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleOptionSelect(option)}
              disabled={isBotTyping}
              className={`
                group relative w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border flex items-center justify-between
                ${option.variant === 'primary'
                  ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 hover:shadow-sm'
                  : option.variant === 'outline'
                  ? 'bg-transparent text-slate-600 border-dashed border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-700 hover:shadow-sm'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center gap-2">
                {option.text.includes("WhatsApp") && <MessageCircle size={14} className="text-green-500" />}
                {option.text.includes("Call") && <Phone size={14} className="text-blue-500" />}
                {option.text.includes("Map") && <MapPin size={14} className="text-red-500" />}
                <span>{option.text}</span>
              </div>
              <ChevronRight size={14} className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${option.variant === 'primary' ? 'text-teal-500' : 'text-slate-400'}`} />
            </motion.button>
          ))}
        </motion.div>

        <div className="mt-3 flex justify-center">
          <p className="text-[10px] text-slate-300 flex items-center gap-1">
            Made by Jayant Chaudhary
          </p>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(13, 148, 136, 0.25);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(13, 148, 136, 0.45);
        }
        @media (prefers-reduced-motion: reduce) {
          .custom-scrollbar * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ChatBot;