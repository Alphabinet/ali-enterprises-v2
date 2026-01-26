"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  MessageCircle, X, RefreshCcw, Bot, User, 
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
      { text: "📍 Open on Google Maps", action: () => window.open("https://maps.app.goo.gl/YourMapLinkHere", "_blank") }, // Update with real map link if available
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

// --- Helper Components ---
const ChatBubble = ({ message }: { message: Message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex w-full mb-4 ${message.isBot ? "justify-start" : "justify-end"}`}
    >
      <div className={`flex max-w-[85%] ${message.isBot ? "flex-row" : "flex-row-reverse"} items-end gap-2`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${message.isBot ? "bg-teal-100 text-teal-600" : "bg-slate-200 text-slate-600"}`}>
          {message.isBot ? <Bot size={14} /> : <User size={14} />}
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
  
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- DYNAMIC DATA FETCHING ---
  useEffect(() => {
    const fetchProductsForChat = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

            // 1. Create Options for the "machines" node
            const productOptions: Option[] = products.map(product => ({
                text: product.name,
                nextNodeId: `product_${product.id}`, // Unique ID for each product node
                variant: 'secondary'
            }));

            // 2. Create a new Node for EACH product
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
                                onClose(); // Close chat when navigating
                            },
                            variant: 'primary'
                        },
                        { 
                            text: "💰 Get Best Price", 
                            nextNodeId: "quotes" 
                        },
                        { 
                            text: "⬅️ Back to Machines", 
                            nextNodeId: "machines" 
                        }
                    ]
                };
            });

            // 3. Update Configuration State
            setChatConfig(prev => ({
                ...prev,
                ...newProductNodes, // Inject dynamic nodes
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
            // Fallback if fetch fails
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
        }
    };

    fetchProductsForChat();
  }, [router, onClose]);


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
  }, []);

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
    
    // Look up next node in the DYNAMIC config
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      role="dialog"
      aria-modal="true"
      className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full h-[85vh] sm:h-auto sm:w-[400px] sm:max-h-[600px] bg-slate-50 shadow-2xl rounded-t-3xl sm:rounded-2xl border border-slate-200 overflow-hidden flex flex-col z-50 font-sans"
    >
      {/* --- HEADER --- */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white p-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot size={20} className="text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-teal-700 rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base leading-tight">Ali Assistant</h3>
            <span className="text-[10px] sm:text-xs text-teal-100 opacity-90 flex items-center gap-1">
              <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span> Online
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleReset} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-teal-100 hover:text-white"
            title="Restart Conversation"
          >
            <RefreshCcw size={16} />
          </button>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-teal-100 hover:text-white"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* --- CHAT AREA --- */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50 scroll-smooth"
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
            className="flex items-center gap-2 text-slate-400 text-xs ml-8"
          >
            <span className="flex space-x-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            </span>
            Typing...
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* --- OPTIONS AREA --- */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2 ml-1">
          Suggested Options
        </div>
        <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
          {currentNode.options?.map((option, index) => (
            <button
              key={index}
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
                {option.text.includes("WhatsApp") && <MessageCircle size={14} className="text-green-500"/>}
                {option.text.includes("Call") && <Phone size={14} className="text-blue-500"/>}
                {option.text.includes("Map") && <MapPin size={14} className="text-red-500"/>}
                <span>{option.text}</span>
              </div>
              <ChevronRight size={14} className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${option.variant === 'primary' ? 'text-teal-500' : 'text-slate-400'}`} />
            </button>
          ))}
        </div>
        
        <div className="mt-3 flex justify-center">
          <p className="text-[10px] text-slate-300 flex items-center gap-1">
             Made by Alphabinet.com
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBot;