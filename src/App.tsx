import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Search, 
  Send, 
  Sparkles, 
  HelpCircle, 
  Coins, 
  Calculator, 
  BookOpen, 
  Loader2, 
  TrendingUp, 
  ShieldCheck, 
  Info, 
  HeartHandshake,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Wallet,
  ShoppingCart,
  Menu,
  X,
  Sparkle,
  Trash2,
  Lightbulb
} from "lucide-react";
import { ChatMessage, AllocationResult } from "./types";
import { QUICK_PROMPTS } from "./data";
import { calculateAllocation } from "./calculations";
import APBNCharts from "./components/APBNCharts";
import TaxCalculator from "./components/TaxCalculator";

export default function App() {
  const [inputValue, setInputValue] = useState<string>("");
  const [chatInput, setChatInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"chat" | "calculator" | "data" | "about">("chat");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Single active state for the chat history, starts empty for pristine landing matching mockup
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  // Mobile responsive navbar toggler
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of the chat as replies progress
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const parseNominal = (query: string): number | null => {
    // Extract numbers
    const cleanedDigitsOnly = query.replace(/[^0-9]/g, "");
    if (!cleanedDigitsOnly) return null;
    
    let val = parseFloat(cleanedDigitsOnly);
    if (isNaN(val) || val <= 0) return null;
    
    // Check multiplier words
    if (/juta|jt/i.test(query)) {
      val = val * 1000000;
    } else if (/miliar|m/i.test(query)) {
      val = val * 1000000000;
    } else if (/ribu|rb/i.test(query) && val < 1000) {
      val = val * 1000;
    } else if (val < 10000) {
      // If someone types e.g. "pajak 5", assume 5 million
      val = val * 1000000;
    }
    return val;
  };

  // Handle all core conversational / nominal queries in the 1 unified room chat
  const handleUniversalSearch = async (overridePrompt?: string) => {
    const query = (overridePrompt || inputValue).trim();
    if (!query) return;

    setError(null);
    setLoading(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date()
    };

    // Parse if it was a numeric/tax nominal trigger
    const analyzedNominal = parseNominal(query);
    const isNominalQuery = analyzedNominal !== null && /pajak|gaji|potong|nominal|patungan|rupiah|uang|Rp|ribu|juta/i.test(query);

    let updatedHistory = [...chatHistory];
    
    // If we have an empty chat history, prepended default friendly assistant greeting to begin the 1 chat room flow smoothly
    if (updatedHistory.length === 0) {
      const welcome: ChatMessage = {
        id: "intro",
        role: "assistant",
        content: "Halo, Rakyat Pintar! Selamat datang di **Kepoin APBN**.\n\nGua ditenagai data resmi **LKPP 2024 Audited** buat nemenin kamu bedah-bedah anggaran negara secara transparan, netral, dan santai pake analogi asyik sehari-hari!\n\nKetik apa saja yang bikin kamu penasaran, atau masukkan nominal pajakmu buat kita bahas patunganmu larinya ke mana aja. Let's go!",
        timestamp: new Date()
      };
      updatedHistory.push(welcome);
    }

    updatedHistory.push(userMsg);
    setChatHistory(updatedHistory);
    setInputValue(""); // Clean main input box

    try {
      let calculationData: AllocationResult[] | undefined = undefined;

      // Fetch or compute precise percentages if it is a tax nominal
      if (isNominalQuery && analyzedNominal) {
        try {
          calculationData = calculateAllocation(analyzedNominal);
        } catch {
          calculationData = undefined;
        }
      }

      const formattedHistoryForAPI = updatedHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call assistant chat API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: isNominalQuery && analyzedNominal 
            ? `Pajak saya sebesar Rp ${analyzedNominal.toLocaleString("id-ID")}. Tolong jelaskan alokasi belanja negara secara proporsional berdasarkan data LKPP 2024 Audited dan berikan analogi gaulnya, sertakan juga detail kontribusinya!`
            : query,
          history: formattedHistoryForAPI.slice(0, -1) // Send history excluding the last prompt itself
        })
      });

      if (!res.ok) {
        let errMessage = `Error HTTP ${res.status}: Gagal memperoleh respon AI.`;
        try {
          const errData = await res.json();
          if (errData?.error) {
            errMessage = errData.error + (errData.details && errData.details !== errData.error ? ` [Detail: ${errData.details}]` : "");
          }
        } catch {
          if (res.status === 404) {
            errMessage = "Backend API (/api/chat) tidak ditemukan (404). Di Netlify, pastikan project dideploy via koneksi GitHub (bukan drag & drop folder dist), agar folder 'netlify/functions' ikut di-deploy.";
          } else if (res.status === 500) {
            errMessage = "Server backend mengembalikan status 500. Pastikan GEMINI_API_KEY sudah disetel di Netlify (Site configuration > Environment variables) dan lakukan 'Clear cache and deploy'!";
          } else {
            errMessage = `Server error HTTP ${res.status}: ${res.statusText || "Gagal menghubungi asisten AI."}`;
          }
        }
        throw new Error(errMessage);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date(),
        nominalCalculation: calculationData
      };

      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat Error:", err);
      setError(err?.message || "Koneksi ke asisten virtual terputus. Mohon periksa GEMINI_API_KEY di hosting Anda atau coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput;
    setChatInput("");
    await handleUniversalSearch(text);
  };

  const handleSuggestPrompt = async (prompt: string) => {
    setInputValue(prompt);
    setActiveTab("chat"); // Bring them back to the center 1 Chat room
    await handleUniversalSearch(prompt);
  };

  const resetChatSession = () => {
    setChatHistory([]);
    setError(null);
    setInputValue("");
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-paper text-obsidian flex flex-col font-sans selection:bg-ice selection:text-navy-deep">
      
      {/* HEADER NAVBAR (Styled exactly to match the mockup logo, layouts, active lines, and right button) */}
      <header className="bg-white border-b border-mist/30 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center" id="navbar-container">
          
          {/* Logo Brand on left with a precise, crisp CSS/SVG hybrid logo */}
          <div 
            onClick={() => { setActiveTab("chat"); resetChatSession(); }}
            className="flex items-center gap-2 cursor-pointer select-none notranslate"
            id="brand-logo-container"
            translate="no"
          >
            <div className="relative flex items-center select-none font-sans notranslate" id="logo-branding" translate="no">
              {/* Foreground Brand Text */}
              <div className="relative flex flex-col justify-center leading-none z-10 pl-1 notranslate" id="logo-text-group" translate="no">
                <div className="text-[20px] font-black tracking-tight text-[#185FA5] flex items-center leading-none font-sans notranslate" translate="no">
                  <span className="notranslate" translate="no">Kepo</span>
                  <span className="relative inline-block leading-none font-sans notranslate" translate="no">
                    ı
                    <span className="absolute left-[calc(50%-2.5px)] top-[-1.5px] w-[5.5px] h-[5.5px] rounded-full bg-[#639922]" />
                  </span>
                  <span className="notranslate" translate="no">n</span>
                </div>
                <span className="text-[26px] font-black tracking-tighter text-[#042C53] mt-[-3px] leading-none font-sans notranslate" translate="no">
                  APBN
                </span>
              </div>
            </div>
          </div>
          <div className="hidden">
            <img 
              src="data:image/png;base64,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" 
              id="logo-img" 
              alt="Kepoin APBN" 
              className="h-11 w-auto object-contain shrink-0" 
            />
          </div>

          {/* Center navigation links */}
          <nav className="hidden md:flex items-center gap-8 font-semibold">
            <button 
              onClick={() => setActiveTab("chat")} 
              className={`text-sm pb-1 relative transition-colors cursor-pointer ${
                activeTab === "chat" 
                  ? "text-navy-deep font-extrabold after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-[3.5px] after:bg-[#185FA5]" 
                  : "text-pebble hover:text-navy-deep"
              }`}
            >
              Beranda
            </button>
            <button 
              onClick={() => setActiveTab("calculator")} 
              className={`text-sm pb-1 relative transition-colors cursor-pointer ${
                activeTab === "calculator" 
                  ? "text-navy-deep font-extrabold after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-[3.5px] after:bg-[#185FA5]" 
                  : "text-pebble hover:text-navy-deep"
              }`}
            >
              Edukasi
            </button>
            <button 
              onClick={() => setActiveTab("data")} 
              className={`text-sm pb-1 relative transition-colors cursor-pointer ${
                activeTab === "data" 
                  ? "text-navy-deep font-extrabold after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-[3.5px] after:bg-[#185FA5]" 
                  : "text-pebble hover:text-navy-deep"
              }`}
            >
              Statistik
            </button>
            <button 
              onClick={() => setActiveTab("about")} 
              className={`text-sm pb-1 relative transition-colors cursor-pointer ${
                activeTab === "about" 
                  ? "text-navy-deep font-extrabold after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-[3.5px] after:bg-[#185FA5]" 
                  : "text-pebble hover:text-navy-deep"
              }`}
            >
              Tentang Kami
            </button>
          </nav>

          {/* Mobile hamburger toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 focus:outline-none text-navy-deep"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-mist/30 flex flex-col gap-3 font-semibold select-none animate-fadeIn">
            <button 
              onClick={() => { setActiveTab("chat"); setIsMobileMenuOpen(false); }}
              className={`text-sm text-left px-2 py-1.5 rounded-xl ${activeTab === "chat" ? "bg-ice text-navy-deep font-bold" : "text-pebble"}`}
            >
              Beranda
            </button>
            <button 
              onClick={() => { setActiveTab("calculator"); setIsMobileMenuOpen(false); }}
              className={`text-sm text-left px-2 py-1.5 rounded-xl ${activeTab === "calculator" ? "bg-ice text-navy-deep font-bold" : "text-pebble"}`}
            >
              Edukasi
            </button>
            <button 
              onClick={() => { setActiveTab("data"); setIsMobileMenuOpen(false); }}
              className={`text-sm text-left px-2 py-1.5 rounded-xl ${activeTab === "data" ? "bg-ice text-navy-deep font-bold" : "text-pebble"}`}
            >
              Statistik
            </button>
            <button 
              onClick={() => { setActiveTab("about"); setIsMobileMenuOpen(false); }}
              className={`text-sm text-left px-2 py-1.5 rounded-xl ${activeTab === "about" ? "bg-ice text-navy-deep font-bold" : "text-pebble"}`}
            >
              Tentang Kami
            </button>
          </div>
        )}
      </header>

      {/* CORE PAGES CONTENT */}
      <main className="flex-1 w-full flex flex-col">
        
        {/* VIEW 1: BERANDA / HOME / 1 INTEGRATED CHAT ROOM */}
        {activeTab === "chat" && (
          <div className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col flex-1">
            
            {/* HERO INTRODUCTION */}
            <div className="text-center mb-8 select-none">
              <h1 className="text-3xl md:text-5xl font-black text-navy-deep tracking-tight mb-3">
                Halo, Rakyat Pintar!
              </h1>
              <p className="text-xs md:text-sm text-pebble max-w-xl mx-auto font-semibold leading-relaxed">
                Tanya apa saja tentang APBN atau masukkan nominal pajak yang kamu bayar tahun ini buat lihat larinya ke mana aja.
              </p>
            </div>

            {/* INTERACTIVE CENTRAL CONTAINER BOX (Clean rounded input matching screenshot exactly) */}
            <div className="bg-white rounded-3xl p-5 border border-[#D3D1C7] shadow-sm relative overflow-hidden transition-all hover:border-[#888780]" id="universal-search-card">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleUniversalSearch();
                  }
                }}
                placeholder="Ketik rasa penasaranmu atau nominal pajakmu (contoh: Pajakku 5 juta)..."
                className="w-full pl-2 pr-2 pt-1 h-14 bg-transparent text-sm font-semibold text-obsidian border-0 outline-none focus:outline-none focus:ring-0 placeholder-[#888780] resize-none leading-relaxed"
                id="universal-input-box"
              />

              {/* Card Footer Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 pt-3 border-t border-mist/30 gap-3">
                
                {/* Oval pills tags on bottom-left */}
                <div className="flex flex-wrap gap-2 select-none">
                  <button 
                    onClick={() => {
                      setInputValue("Apa itu IKN?");
                      handleUniversalSearch("Apa itu IKN?");
                    }}
                    className="bg-[#F1EFE8]/70 hover:bg-[#E6F1FB] hover:text-navy-deep text-[11px] font-bold text-[#888780] px-4 py-2 rounded-full border border-mist/10 cursor-pointer transition-all active:scale-95"
                  >
                    Apa itu IKN?
                  </button>
                  <button 
                    onClick={() => {
                      setInputValue("Berapa hutang negara?");
                      handleUniversalSearch("Berapa hutang negara?");
                    }}
                    className="bg-[#F1EFE8]/70 hover:bg-[#E6F1FB] hover:text-navy-deep text-[11px] font-bold text-[#888780] px-4 py-2 rounded-full border border-mist/10 cursor-pointer transition-all active:scale-95"
                  >
                    Berapa hutang negara?
                  </button>
                </div>

                {/* Submit button on bottom-right */}
                <button
                  onClick={() => handleUniversalSearch()}
                  disabled={loading || !inputValue.trim()}
                  className="bg-[#8299ad] hover:bg-navy-deep text-white font-bold text-xs px-6 py-2.5 rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-45 shadow-xs select-none"
                  id="kepoin-btn"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span className="notranslate" translate="no">Kepoin Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* UNIFIED SINGLE ROOM CHAT TIMELINE STREAM */}
            {chatHistory.length > 0 ? (
              <div className="mt-8 bg-white/60 border border-mist/40 rounded-3xl p-4 md:p-6 shadow-xs flex flex-col space-y-4 animate-fadeIn">
                
                {/* Header Bar */}
                <div className="flex justify-between items-center pb-3 border-b border-mist/40 text-navy-deep select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-lime rounded-full animate-pulse shrink-0"></span>
                    <h3 className="text-xs font-black tracking-wider uppercase">Bahas Santai APBN Bareng AI</h3>
                  </div>
                  <button 
                    onClick={resetChatSession}
                    className="text-[10px] font-black hover:text-red-700 bg-paper hover:bg-red-50 px-2.5 py-1 rounded-lg border border-mist/20 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Bersihkan Chat</span>
                  </button>
                </div>

                {/* Messages stream */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {chatHistory.map((msg) => {
                    const isAssistant = msg.role === "assistant";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAssistant ? "justify-start animate-fadeIn" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs ${
                            isAssistant
                              ? "bg-white text-obsidian rounded-tl-none border border-mist/60 shadow-xs"
                              : "bg-cobalt text-white rounded-tr-none shadow-xs font-medium"
                          }`}
                        >
                          <span className={`text-[9px] font-black block mb-1 opacity-85 tracking-wider uppercase select-none ${isAssistant ? "text-cobalt" : "text-white/80"}`}>
                            {isAssistant ? "🤖 ASISTEN VIRTUAL" : "👤 KAMU"}
                          </span>
                          
                          {isAssistant ? (
                            <div className="markdown-body">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          )}

                          {/* INLINE SIMULASI PAJAK CARD inside the chat room! Highly integrated functionality */}
                          {isAssistant && msg.nominalCalculation && (
                            <div className="mt-4 p-4 rounded-xl bg-paper/70 border border-mist/30 text-obsidian select-none">
                              <div className="flex justify-between items-center pb-2 border-b border-mist/30 mb-3">
                                <span className="font-extrabold text-navy-deep text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                                  <Calculator className="w-3.5 h-3.5 text-cobalt" />
                                  Alokasi Kontribusi Pajakmu :
                                </span>
                                <span className="text-[9px] bg-cobalt text-white font-bold py-0.5 px-1.5 rounded-sm uppercase tracking-widest">PROPORSIONAL</span>
                              </div>
                              <div className="space-y-3 font-semibold text-[11px]">
                                {msg.nominalCalculation.map((item) => {
                                  const pctStr = (item.pct * 100).toFixed(1);
                                  return (
                                    <div key={item.key} className="space-y-1">
                                      <div className="flex justify-between items-baseline">
                                        <span className="text-navy-deep">{item.label}</span>
                                        <span className="font-mono text-pebble truncate">
                                          {formatRupiah(item.allocatedValue)} ({pctStr}%)
                                        </span>
                                      </div>
                                      <div className="w-full bg-mist/20 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-cobalt h-full rounded-full" style={{ width: `${pctStr}%` }}></div>
                                      </div>
                                      <p className="text-[10px] text-pebble font-medium leading-relaxed italic">{item.analogy}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          <span className="text-[8px] mt-1.5 opacity-60 block text-right select-none font-bold">
                            {msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {loading && (
                    <div className="flex justify-start animate-pulse">
                      <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-mist/40 shadow-xs text-xs max-w-[85%] flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-cobalt shrink-0" />
                        <span className="font-semibold text-pebble">Asisten sedang mengolah database APBN...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Followup Chat reply input bar inside the timeline container */}
                <form onSubmit={handleChatSubmit} className="p-2 border-t border-mist/45 flex gap-2 pt-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tanya lanjutan, misal: 'Apakah hutang ini memberatkan rakyat?'..."
                    className="flex-1 px-4 py-2.5 bg-paper rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt placeholder-pebble text-obsidian border-0"
                  />
                  <button
                    type="submit"
                    disabled={loading || !chatInput.trim()}
                    className="p-2.5 bg-navy-deep hover:bg-cobalt text-white rounded-xl cursor-pointer disabled:opacity-45 transition-colors shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>
            ) : (
              /* If no chat is active, show standard inspiration triggers beautifully layouted */
              <div className="mt-5 select-none animate-fadeIn">
                <span className="text-[10px] font-bold text-[#888780] uppercase tracking-wider flex items-center gap-1.5 mb-2 justify-center sm:justify-start">
                  <Lightbulb className="w-3.5 h-3.5 text-cobalt shrink-0" />
                  <span>Inspirasi Tanya Asisten AI Terpilih:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputValue(prompt.text);
                        handleUniversalSearch(prompt.text);
                      }}
                      className="bg-white hover:bg-ice hover:text-navy-deep hover:border-cobalt/35 text-[11px] px-3 py-2 text-left rounded-xl text-[#2C2C2A] font-bold border border-mist/30 transition-all cursor-pointer hover:shadow-2xs active:scale-97"
                    >
                      <span className="font-extrabold text-cobalt block mb-0.5">#{prompt.Category}</span>
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ERROR ALERTS BAR */}
            {error && (
              <div className="mt-4 p-3.5 bg-red-100 text-red-800 text-xs font-semibold rounded-2xl border border-red-200 flex items-center justify-between gap-3 animate-fadeIn">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="font-extrabold hover:text-red-950 uppercase">Tutup</button>
              </div>
            )}

            {/* SEPARATOR BORDER LINE BETWEEN INPUT AND SNAPSHOT */}
            <hr className="my-10 border-mist/30" />

            {/* SNAPSHOT APBN 2024 (Styled 100% exactly matching the layout of the mockup image) */}
            <div className="w-full">
              <h2 className="text-lg font-black text-navy-deep mb-5 tracking-tight select-none">
                Snapshot APBN 2024
              </h2>

              {/* 3 columns grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="snapshot-visual-grid">
                
                {/* 1. Total Pendapatan */}
                <div 
                  onClick={() => handleSuggestPrompt("Bagaimana rincian Pendapatan Negara sebesar Rp 2.850,60 Triliun, apa benar didominasi oleh pajak rakyat?")}
                  className="bg-white border border-[#D3D1C7]/70 hover:border-cobalt rounded-3xl p-5 shadow-xs flex items-center gap-4 transition-all hover:scale-101 cursor-pointer select-none"
                >
                  <div className="p-3.5 bg-ice rounded-2xl text-cobalt shrink-0">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#888780] block">Total Pendapatan</span>
                    <span className="text-[19px] font-black text-navy-deep block leading-tight mt-0.5">Rp 2.850,60 T</span>
                    <span className="text-[10px] text-pebble block mt-0.5">Pajak, bea cukai, & PNBP</span>
                  </div>
                </div>

                {/* 2. Total Belanja */}
                <div 
                  onClick={() => handleSuggestPrompt("Jelasin rincian Belanja Negara sebesar Rp 3.359,76 Triliun itu ditransfer ke mana aja dong dan bagi analogi gokilnya!")}
                  className="bg-white border border-[#D3D1C7]/70 hover:border-cobalt rounded-3xl p-5 shadow-xs flex items-center gap-4 transition-all hover:scale-101 cursor-pointer select-none"
                >
                  <div className="p-3.5 bg-red-50 rounded-2xl text-red-600 shrink-0">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#888780] block">Total Belanja</span>
                    <span className="text-[19px] font-black text-navy-deep block leading-tight mt-0.5">Rp 3.359,76 T</span>
                    <span className="text-[10px] text-pebble block mt-0.5">Pusat & Daerah</span>
                  </div>
                </div>

                {/* 3. Defisit */}
                <div 
                  onClick={() => handleSuggestPrompt("Mengapa anggaran APBN 2024 defisit Rp 509,16 Triliun? Berikan penjelasan netral dan objektif apakah aman.")}
                  className="bg-white border border-[#D3D1C7]/70 hover:border-cobalt rounded-3xl p-5 shadow-xs flex items-center gap-4 transition-all hover:scale-101 cursor-pointer select-none"
                >
                  <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0">
                    <TrendingUp className="w-6 h-6 rotate-180" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#888780] block">Defisit</span>
                    <span className="text-[19px] font-black text-navy-deep block leading-tight mt-0.5">2,30% PDB</span>
                    <span className="text-[10px] text-pebble block mt-0.5">Batas aman UU &lt; 3%</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: EDUKASI / PAJAK CALCULATOR */}
        {activeTab === "calculator" && (
          <div className="w-full max-w-4xl mx-auto px-6 py-12 animate-fadeIn flex-1">
            <div className="mb-6 select-none">
              <h1 className="text-3xl font-black text-navy-deep tracking-tight mb-2">Edukasi & Simulator</h1>
              <p className="text-sm text-pebble font-semibold">Takar, simulasikan kontribusi belanjamu dan pelajari presentasenya ke operasional negara.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-8">
                <TaxCalculator onSuggestPrompt={handleSuggestPrompt} />
              </div>
              
              <div className="md:col-span-4 bg-white rounded-3xl p-5 border border-mist shadow-xs text-xs space-y-4">
                <span className="font-extrabold text-navy-deep flex items-center gap-1.5 text-sm border-b border-mist/30 pb-2">
                  <Lightbulb className="w-4 h-4 text-cobalt shrink-0" />
                  <span>Tips Cepat:</span>
                </span>
                <p className="text-pebble leading-relaxed">
                  Apakah kamu tahu kalau <strong>Transfer ke Daerah (TKD) 25.7%</strong> merupakan porsi belanja terbesar pemerintah kita?
                </p>
                <p className="text-pebble leading-relaxed">
                  Masukan nominal pajakmu setahun di kartu simulasi, klik 'Kepoin', lalu tanyakan asisten AI di Beranda jika ada yang kurang jelas!
                </p>
                <button 
                  onClick={() => handleSuggestPrompt("Jelaskan kenapa transfer daerah ditunjuk sebagai alokasi terbesar dari pajak?")}
                  className="w-full py-2 bg-ice hover:bg-cobalt hover:text-white text-navy-deep text-xs font-bold rounded-xl transition-all cursor-pointer text-center block"
                >
                  Tanya AI Soal TKD
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: STATISTIK APBN */}
        {activeTab === "data" && (
          <div className="w-full max-w-4xl mx-auto px-6 py-12 animate-fadeIn flex-1">
            <div className="mb-6 select-none">
              <h1 className="text-3xl font-black text-navy-deep tracking-tight mb-2">Statistik APBN Resmi</h1>
              <p className="text-sm text-pebble font-semibold">Visualisasi realisasi dan sumber data lengkap dari iuran patungan negara (LKPP 2024 Audited).</p>
            </div>
            
            <APBNCharts />
          </div>
        )}

        {/* VIEW 4: TENTANG KAMI / ABOUT */}
        {activeTab === "about" && (
          <div className="w-full max-w-2xl mx-auto px-6 py-12 animate-fadeIn flex-1">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-mist shadow-xs space-y-6">
              
              <div className="border-b border-mist/30 pb-4 text-center select-none">
                <h1 className="text-2xl md:text-3xl font-black text-navy-deep tracking-tight">Kepoin APBN</h1>
                <p className="text-xs text-pebble font-bold uppercase tracking-wider mt-1">Mengawal Anggaran Negara Tanpa Drama</p>
              </div>

              <div className="text-xs text-obsidian leading-relaxed space-y-4 font-medium">
                <p>
                  <strong>Kepoin APBN</strong> adalah platform edukasi publik independen untuk mengenalkan bagaimana kas keuangan negara dikelola oleh pemerintah berdasarkan database <strong>LKPP (Laporan Keuangan Pemerintah Pusat) Tahun 2024 yang sudah diaudit oleh BPK (Badan Pemeriksa Keuangan)</strong>.
                </p>
                <p>
                  Situs ini dirancang untuk menjawab rasa ketakutan, fomo, dan ketidaktahuan generasi muda mengenai ke mana larinya uang pajak yang mereka bayarkan setiap bulan/tahun secara objektif, berimbang, dan netral.
                </p>
                <div className="bg-paper p-4 rounded-2xl border border-mist/35 text-pebble text-[11px] font-semibold">
                  <span className="text-navy-deep font-bold flex items-center gap-1.5 text-xs mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-cobalt shrink-0" /> Disclaimer Penting:
                  </span>
                  Data yang ditampilkan di sini murni bersumber dari laporan keuangan berwujud dokumen publik (LKPP 2024 Audited). Perhitungan asisten AI bersifat pembagi proporsional matematis murni. Seluruh sistem dirancang bebas dari kepentingan kelompok afiliasi politik apa pun.
                </div>
              </div>

              {/* Tidy Contact Form inside About panel */}
              <div className="pt-4 border-t border-mist/30">
                <h3 className="font-bold text-navy-deep text-sm mb-3">Hubungi Kami / Beri Masukan</h3>
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    alert("Terima kasih atas saran berhargamu! Kritik dan saranmu sangat membantu kami menyempurnakan platform edukasi ini."); 
                    (e.target as HTMLFormElement).reset();
                  }} 
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Nama Lengkap" required className="bg-paper p-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt placeholder-pebble w-full border-0" />
                    <input type="email" placeholder="Email" required className="bg-paper p-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt placeholder-pebble w-full border-0" />
                  </div>
                  <textarea placeholder="Pesan masukan atau saran untuk platform..." rows={3} required className="bg-paper p-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt placeholder-pebble w-full border-0 resize-none" />
                  <button type="submit" className="w-full bg-navy-deep hover:bg-cobalt text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer">Kirim Masukan Anda</button>
                </form>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER SECTION (Pristine grid layouts styled nicely as requested in the screenshot) */}
      <footer className="bg-white border-t border-mist/30 py-6 px-6 mt-12 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold select-none">
          
          {/* Left copyright and tagline */}
          <div className="text-center md:text-left text-[#888780] flex items-center justify-center md:justify-start gap-1">
            <span className="font-extrabold text-navy-deep text-sm mr-1.5">Kepoin APBN</span>
            <span>&copy; 2024 Kepoin APBN. Lacak Ke Mana Uang Pajak Kita Pergi</span>
            <Search className="w-3.5 h-3.5 text-[#888780] inline align-text-bottom" />
          </div>

          {/* Right footer legal links */}
          <div className="flex flex-wrap justify-center gap-6 text-[#888780]">
            <button onClick={() => alert("Halaman Kebijakan Privasi segera hadir!")} className="hover:text-navy-deep transition-colors">Kebijakan Privasi</button>
            <button onClick={() => alert("Halaman Syarat & Ketentuan segera hadir!")} className="hover:text-navy-deep transition-colors">Syarat & Ketentuan</button>
            <button onClick={() => setActiveTab("about")} className="hover:text-navy-deep transition-colors">Hubungi Kami</button>
          </div>

        </div>
      </footer>

    </div>
  );
}
