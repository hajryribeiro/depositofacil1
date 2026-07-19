import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Check, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Package, 
  Database, 
  Zap, 
  Coins, 
  Store, 
  HelpCircle, 
  MessageSquare, 
  AlertTriangle, 
  X, 
  Menu, 
  ArrowUp, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Settings, 
  Play, 
  Calendar, 
  Clock, 
  ShoppingCart, 
  Smartphone, 
  Cloud, 
  Monitor, 
  Star, 
  ChevronDown, 
  Layers,
  ArrowUpRight,
  TrendingDown,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Edit,
  Eye,
  Upload
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import SaaSLogo from "./SaaSLogo";
import { 
  faqs, 
  dashboardStats, 
  problems, 
  features, 
  testimonials, 
  steps 
} from "./LandingPageData";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { dbFirestore } from "../firebase";

interface LandingPageProps {
  onEnterApp: () => void;
  onRegisterInterest: () => void;
  saasLogoUrl?: string;
}

export interface LandingPageCustomData {
  tagline: string;
  title: string;
  subtitle: string;
  heroImageUrl: string;
  heroImageUseUrl: boolean;
  btnCtaText: string;
  btnDemoText: string;
  badge1: string;
  badge2: string;
  badge3: string;
  problems: typeof problems;
  features: typeof features;
  testimonials: typeof testimonials;
  faqs: typeof faqs;
  steps: typeof steps;
  accentColor: "red" | "blue" | "green" | "purple" | "amber";
}

const themeColorMap = {
  red: {
    text: "text-red-500",
    textLight: "text-red-400",
    textMuted: "text-red-300",
    bg: "bg-red-600",
    bgHover: "hover:bg-red-700",
    bgMuted: "bg-red-950/30",
    border: "border-red-500/20",
    borderActive: "border-red-500",
    borderMuted: "border-red-950/20",
    shadow: "shadow-red-600/20",
    shadowHover: "hover:shadow-red-600/30",
    glow: "bg-red-950/30",
    pulseShadow: "shadow-[0_0_50px_rgba(239,68,68,0.15)]",
    pulseBorder: "border-red-500/25",
    accentBg: "bg-red-500",
    button: "bg-red-600 hover:bg-red-700 shadow-red-600/20 hover:shadow-red-600/30 border-red-500/10",
    outlineButton: "bg-slate-950 hover:bg-slate-900 border-red-950/40 text-slate-200"
  },
  blue: {
    text: "text-blue-500",
    textLight: "text-blue-400",
    textMuted: "text-blue-300",
    bg: "bg-blue-600",
    bgHover: "hover:bg-blue-700",
    bgMuted: "bg-blue-950/30",
    border: "border-blue-500/20",
    borderActive: "border-blue-500",
    borderMuted: "border-blue-950/20",
    shadow: "shadow-blue-600/20",
    shadowHover: "hover:shadow-blue-600/30",
    glow: "bg-blue-950/30",
    pulseShadow: "shadow-[0_0_50px_rgba(59,130,246,0.15)]",
    pulseBorder: "border-blue-500/25",
    accentBg: "bg-blue-500",
    button: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-blue-600/30 border-blue-500/10",
    outlineButton: "bg-slate-950 hover:bg-slate-900 border-blue-950/40 text-slate-200"
  },
  green: {
    text: "text-emerald-500",
    textLight: "text-emerald-400",
    textMuted: "text-emerald-300",
    bg: "bg-emerald-600",
    bgHover: "hover:bg-emerald-700",
    bgMuted: "bg-emerald-950/30",
    border: "border-emerald-500/20",
    borderActive: "border-emerald-500",
    borderMuted: "border-emerald-950/20",
    shadow: "shadow-emerald-600/20",
    shadowHover: "hover:shadow-emerald-600/30",
    glow: "bg-emerald-950/30",
    pulseShadow: "shadow-[0_0_50px_rgba(16,185,129,0.15)]",
    pulseBorder: "border-emerald-500/25",
    accentBg: "bg-emerald-500",
    button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-600/30 border-emerald-500/10",
    outlineButton: "bg-slate-950 hover:bg-slate-900 border-emerald-950/40 text-slate-200"
  },
  purple: {
    text: "text-purple-500",
    textLight: "text-purple-400",
    textMuted: "text-purple-300",
    bg: "bg-purple-600",
    bgHover: "hover:bg-purple-700",
    bgMuted: "bg-purple-950/30",
    border: "border-purple-500/20",
    borderActive: "border-purple-500",
    borderMuted: "border-purple-950/20",
    shadow: "shadow-purple-600/20",
    shadowHover: "hover:shadow-purple-600/30",
    glow: "bg-purple-950/30",
    pulseShadow: "shadow-[0_0_50px_rgba(168,85,247,0.15)]",
    pulseBorder: "border-purple-500/25",
    accentBg: "bg-purple-500",
    button: "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20 hover:shadow-purple-600/30 border-purple-500/10",
    outlineButton: "bg-slate-950 hover:bg-slate-900 border-purple-950/40 text-slate-200"
  },
  amber: {
    text: "text-amber-500",
    textLight: "text-amber-400",
    textMuted: "text-amber-300",
    bg: "bg-amber-600",
    bgHover: "hover:bg-amber-700",
    bgMuted: "bg-amber-950/30",
    border: "border-amber-500/20",
    borderActive: "border-amber-500",
    borderMuted: "border-amber-950/20",
    shadow: "shadow-amber-600/20",
    shadowHover: "hover:shadow-amber-600/30",
    glow: "bg-amber-950/30",
    pulseShadow: "shadow-[0_0_50px_rgba(245,158,11,0.15)]",
    pulseBorder: "border-amber-500/25",
    accentBg: "bg-amber-500",
    button: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20 hover:shadow-amber-600/30 border-amber-500/10",
    outlineButton: "bg-slate-950 hover:bg-slate-900 border-amber-950/40 text-slate-200"
  }
};

export default function LandingPage({ onEnterApp, onRegisterInterest, saasLogoUrl }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [useHeroFallback, setUseHeroFallback] = useState(false);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [heroImageError, setHeroImageError] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState<"visao" | "estoque" | "vendas" | "financeiro" | "clientes" | "nanobanana">("nanobanana");
  const [nanoRestockCount, setNanoRestockCount] = useState(1250);
  const [isNanoScanning, setIsNanoScanning] = useState(true);
  const [nanoEfficiency, setNanoEfficiency] = useState(99.98);
  const [nanoLogs, setNanoLogs] = useState<string[]>([
    "✔ [CONECTADO] Coletor de dados sem fio ativo na rede do depósito",
    "→ [SINC] Sincronização em tempo real ativa com o painel principal",
    "→ [MONITORAMENTO] Varredura inteligente de fardos em andamento",
    "✔ [ESTOQUE] Heineken fardos normalizados (mínimo de segurança respeitado)"
  ]);

  // Visual Editor CMS states
  const [isEditMode, setIsEditMode] = useState(false);
  const [cmsTab, setCmsTab] = useState<"geral" | "hero" | "problemas" | "recursos" | "onboarding" | "depoimentos" | "faq">("geral");
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (key: keyof LandingPageCustomData, value: any) => {
    setCustomData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, etc).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 850; // optimized size for hero dashboard preview

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Clear rect just to make sure the background is fully transparent
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          // Se o arquivo original for PNG ou WEBP, mantemos para preservar a transparência (sem fundo preto)
          const isTransparent = file.type === "image/png" || file.type === "image/webp" || file.type === "image/gif";
          const exportType = isTransparent ? file.type : "image/jpeg";
          const compressedBase64 = isTransparent 
            ? canvas.toDataURL(exportType) 
            : canvas.toDataURL("image/jpeg", 0.75);

          setCustomData(prev => ({
            ...prev,
            heroImageUrl: compressedBase64,
            heroImageUseUrl: true
          }));
        }
      };
    };
    reader.readAsDataURL(file);
  };
  const [customData, setCustomData] = useState<LandingPageCustomData>(() => {
    const saved = localStorage.getItem("df_custom_landing_page");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Automatically upgrade standard defaults to the high-impact format from screenshot
        if (parsed.tagline === "SaaS Líder para Depósitos de Bebidas" || parsed.title === "Seu depósito de bebidas organizado de verdade.") {
          parsed.tagline = "Saas Líder em controle financeiro";
          parsed.title = "Controle de estoque e gastos com inteligência real.";
          parsed.subtitle = "Organize seu negócio, reduza perdas e tenha controle total do que entra, sai e lucra.";
          parsed.btnDemoText = "Ver demonstração";
          parsed.badge3 = "Backup diário e ilimitado";
          localStorage.setItem("df_custom_landing_page", JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return {
      tagline: "Saas Líder em controle financeiro",
      title: "Controle de estoque e gastos com inteligência real.",
      subtitle: "Organize seu negócio, reduza perdas e tenha controle total do que entra, sai e lucra.",
      heroImageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
      heroImageUseUrl: false,
      btnCtaText: "Testar 7 dias grátis",
      btnDemoText: "Ver demonstração",
      badge1: "Sem fidelidade",
      badge2: "Suporte via WhatsApp",
      badge3: "Backup diário e ilimitado",
      problems: problems,
      features: features,
      testimonials: testimonials,
      faqs: faqs,
      steps: steps,
      accentColor: "red"
    };
  });

  const theme = themeColorMap[customData.accentColor] || themeColorMap.red;

  // Reset image flags when URL changes
  useEffect(() => {
    setHeroImageError(false);
    setHeroImageLoaded(false);
  }, [customData.heroImageUrl, customData.heroImageUseUrl]);

  // Load from Firebase
  useEffect(() => {
    const loadFirebaseLandingPage = async () => {
      try {
        const docRef = doc(dbFirestore, "configurations", "landing_page");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data() as LandingPageCustomData;
          setCustomData(prev => ({ ...prev, ...cloudData }));
          localStorage.setItem("df_custom_landing_page", JSON.stringify(cloudData));
        }
      } catch (err) {
        console.warn("Could not load landing page custom config from Firestore:", err);
      }
    };
    loadFirebaseLandingPage();
  }, []);

  // Save to Firebase
  const handleSaveCustomData = async (updatedData: LandingPageCustomData) => {
    setCustomData(updatedData);
    localStorage.setItem("df_custom_landing_page", JSON.stringify(updatedData));
    
    setIsSaving(true);
    try {
      const docRef = doc(dbFirestore, "configurations", "landing_page");
      await setDoc(docRef, updatedData, { merge: true });
      alert("Alterações salvas com sucesso em nuvem Firestore!");
    } catch (err) {
      console.error("Error saving data to Firestore:", err);
      alert("Salvo localmente! (Erro ao salvar na nuvem: " + (err as Error).message + ")");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (window.confirm("Deseja realmente redefinir a página para as configurações originais?")) {
      const defaultData: LandingPageCustomData = {
        tagline: "Saas Líder em controle financeiro",
        title: "Controle de estoque e gastos com inteligência real.",
        subtitle: "Organize seu negócio, reduza perdas e tenha controle total do que entra, sai e lucra.",
        heroImageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
        heroImageUseUrl: false,
        btnCtaText: "Testar 7 dias grátis",
        btnDemoText: "Ver demonstração",
        badge1: "Sem fidelidade",
        badge2: "Suporte via WhatsApp",
        badge3: "Backup diário e ilimitado",
        problems: problems,
        features: features,
        testimonials: testimonials,
        faqs: faqs,
        steps: steps,
        accentColor: "red"
      };
      handleSaveCustomData(defaultData);
    }
  };

  // Scroll visibility for Back to Top
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Icon mapping for features
  const renderFeatureIcon = (iconName: string) => {
    const props = { className: `w-6 h-6 ${theme.text}` };
    switch (iconName) {
      case "Package": return <Package {...props} />;
      case "Database": return <Database {...props} />;
      case "Zap": return <Zap {...props} />;
      case "Coins": return <Coins {...props} />;
      case "Store": return <Store {...props} />;
      case "Users": return <Users {...props} />;
      case "BarChart3": return <BarChart3 {...props} />;
      case "ShieldCheck": return <ShieldCheck {...props} />;
      default: return <Package {...props} />;
    }
  };

  return (
    <div className="bg-[#020205] text-slate-100 min-h-screen selection:bg-red-600 selection:text-white font-sans relative overflow-x-hidden antialiased">
      
      {/* Red Ambient Light Halo Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full filter blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[60%] h-[60%] bg-red-900/5 rounded-full filter blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-red-950/10 rounded-full filter blur-[120px] pointer-events-none z-0" />

      {/* Subtle Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111119_1px,transparent_1px),linear-gradient(to_bottom,#111119_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none z-0" />

      {/* 1. HEADER / TOPO */}
      <header className={`sticky top-0 z-50 backdrop-blur-md bg-[#020205]/75 border-b ${theme.borderMuted} px-4 sm:px-8 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <SaaSLogo size={36} logoUrl={saasLogoUrl} />
            <span className="font-extrabold text-slate-100 text-xl tracking-tight block font-sans">
              Depósito <span className={theme.text}>Fácil</span>
            </span>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#problemas" className={`hover:${theme.text} transition-colors`}>Problemas</a>
            <a href="#recursos" className={`hover:${theme.text} transition-colors`}>Recursos</a>
            <a href="#como-funciona" className={`hover:${theme.text} transition-colors`}>Como Funciona</a>
            <a href="#diferencial" className={`hover:${theme.text} transition-colors`}>Diferencial</a>
            <a href="#depoimentos" className={`hover:${theme.text} transition-colors`}>Depoimentos</a>
            <a href="#planos" className={`hover:${theme.text} transition-colors`}>Planos</a>
            <a href="#faq" className={`hover:${theme.text} transition-colors`}>FAQ</a>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* Visual Editor (CMS) Button */}
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <Settings className={`w-3.5 h-3.5 ${theme.text} ${isEditMode ? 'animate-spin' : ''}`} />
              {isEditMode ? "Fechar Editor" : "Editar Página (CMS)"}
            </button>

            <button 
              onClick={onEnterApp}
              className={`text-xs font-bold text-slate-300 hover:${theme.text} px-3.5 py-2.5 transition-all cursor-pointer`}
            >
              Entrar
            </button>
            <button 
              onClick={onRegisterInterest}
              className={`${theme.bg} ${theme.bgHover} text-white text-xs font-extrabold px-4.5 py-3 rounded-xl transition-all shadow-[0_4px_14px_rgba(0,0,0,0.25)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
            >
              Começar agora
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className="bg-slate-900 border border-slate-800 text-slate-300 p-2 rounded-lg text-xs"
              title="CMS Editor"
            >
              <Settings className={`w-4 h-4 ${theme.text}`} />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-slate-100 p-1"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className={`md:hidden mt-3 pt-4 pb-3 border-t ${theme.borderMuted} flex flex-col gap-4 text-sm font-medium text-slate-400 animate-in slide-in-from-top-4 duration-200`}>
            <a href="#problemas" onClick={() => setMobileMenuOpen(false)} className={`hover:${theme.text} px-2 py-1`}>Problemas</a>
            <a href="#recursos" onClick={() => setMobileMenuOpen(false)} className={`hover:${theme.text} px-2 py-1`}>Recursos</a>
            <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className={`hover:${theme.text} px-2 py-1`}>Como Funciona</a>
            <a href="#diferencial" onClick={() => setMobileMenuOpen(false)} className={`hover:${theme.text} px-2 py-1`}>Diferencial</a>
            <a href="#depoimentos" onClick={() => setMobileMenuOpen(false)} className={`hover:${theme.text} px-2 py-1`}>Depoimentos</a>
            <a href="#planos" onClick={() => setMobileMenuOpen(false)} className={`hover:${theme.text} px-2 py-1`}>Planos</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className={`hover:${theme.text} px-2 py-1`}>FAQ</a>
            <div className={`flex flex-col gap-2 pt-3 border-t ${theme.borderMuted} px-2`}>
              <button 
                onClick={() => { setMobileMenuOpen(false); onEnterApp(); }}
                className="w-full text-center bg-slate-900 border border-slate-800 text-slate-200 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-800 transition-all"
              >
                Entrar
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onRegisterInterest(); }}
                className={`w-full text-center ${theme.bg} text-white font-bold py-2.5 rounded-xl text-sm hover:brightness-110 transition-all shadow-md`}
              >
                Começar agora
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-16 sm:pb-28 px-4 sm:px-8 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading and description */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {isEditMode && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold animate-pulse">
                <Edit className="w-3 h-3" />
                Modo Edição Ativo (Use o painel CMS)
              </div>
            )}

            {/* Elegant Dynamic Tagline */}
            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#050508]/60 border ${theme.border} ${theme.textLight} rounded-full text-xs font-semibold tracking-wide block w-fit shadow-[0_0_15px_rgba(239,68,68,0.03)]`}>
              <BarChart3 className={`w-3.5 h-3.5 ${theme.text} animate-pulse`} />
              <span className="text-slate-300">{customData.tagline}</span>
            </span>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-[54px] font-black tracking-tight text-slate-100 leading-[1.12] font-sans">
              {customData.title === "Controle de estoque e gastos com inteligência real." || (customData.title.includes("Controle de estoque") && customData.title.includes("inteligência")) ? (
                <>
                  Controle de estoque <br />
                  e gastos com <br />
                  <span className={`${theme.text} relative inline-block`}>
                    inteligência
                    <span className="absolute bottom-1.5 left-0 w-full h-[6px] bg-red-500/10 -skew-x-12" />
                  </span> real.
                </>
              ) : customData.title.includes("de bebidas") ? (
                <>
                  Seu depósito <br />
                  de bebidas <span className={`${theme.text} relative inline-block`}>
                    organizado
                    <span className="absolute bottom-1 left-0 w-full h-[6px] bg-amber-500/10 -skew-x-12" />
                  </span> de verdade.
                </>
              ) : (
                customData.title
              )}
            </h1>

            {/* Description */}
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              {customData.subtitle === "Organize seu negócio, reduza perdas e tenha controle total do que entra, sai e lucra." || customData.subtitle.includes("controle total") ? (
                <>
                  Organize seu negócio, reduza perdas e tenha{" "}
                  <span className={`${theme.text} font-bold`}>controle total</span> do que entra, sai e lucra.
                </>
              ) : (
                customData.subtitle
              )}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={onRegisterInterest}
                className={`${theme.bg} ${theme.bgHover} text-white font-extrabold py-4 px-8 rounded-xl shadow-lg ${theme.shadow} ${theme.shadowHover} hover:scale-[1.01] transform transition-all flex items-center justify-center gap-2.5 cursor-pointer text-xs uppercase tracking-wider`}
              >
                <Calendar className="w-4 h-4 text-white" />
                {customData.btnCtaText}
                <ArrowRight className="w-4 h-4 text-white ml-0.5" />
              </button>
              <button 
                onClick={onEnterApp}
                className="bg-slate-950/40 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer text-xs uppercase tracking-wider"
              >
                <BarChart3 className={`w-4 h-4 ${theme.text}`} />
                {customData.btnDemoText}
              </button>
            </div>

            {/* Three check items */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-xs text-slate-300 font-semibold pt-3.5">
              <span className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${theme.text}`} />
                {customData.badge1}
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${theme.text}`} />
                {customData.badge2}
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${theme.text}`} />
                {customData.badge3}
              </span>
            </div>

          </div>

          {/* Right Column: High-fidelity Interactive Visual Concept of the Nano Banana Robot in a Modern Automated Warehouse */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            
            {/* Visual halo backing shadow */}
            <div className={`absolute inset-0 bg-${customData.accentColor === 'green' ? 'emerald' : customData.accentColor}-600/10 rounded-3xl filter blur-[80px] pointer-events-none -z-10`} />

            {/* Clean, beautiful product stage representation without telemetry/logs/scanner shell */}
            <div className="relative w-full min-h-[440px] flex items-center justify-center z-10 overflow-visible py-6">
              
              {/* Attempt to render the user's uploaded PNG image or custom URL if present */}
              {!heroImageError && (
                <div className={`relative w-full h-full flex items-center justify-center z-20 ${heroImageLoaded ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                  {/* Glowing themed neon circle/halo backing the image */}
                  <div className={`absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] rounded-full border-4 ${theme.border} shadow-[0_0_40px_rgba(${customData.accentColor === 'red' ? '239,68,68' : customData.accentColor === 'blue' ? '59,130,246' : customData.accentColor === 'green' ? '16,185,129' : customData.accentColor === 'purple' ? '168,85,247' : '245,158,11'},0.3),inset_0_0_40px_rgba(${customData.accentColor === 'red' ? '239,68,68' : customData.accentColor === 'blue' ? '59,130,246' : customData.accentColor === 'green' ? '16,185,129' : customData.accentColor === 'purple' ? '168,85,247' : '245,158,11'},0.15)] animate-pulse pointer-events-none -z-10`} />
                  
                  <img 
                    src={customData.heroImageUseUrl ? customData.heroImageUrl : "/hero_banner.png"} 
                    alt="Depósito Fácil Dashboard Mockup" 
                    className={`max-w-full max-h-[380px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-700 ${heroImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute pointer-events-none'}`}
                    onLoad={() => {
                      setHeroImageLoaded(true);
                    }}
                    onError={() => {
                      setHeroImageError(true);
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Fallback to high-fidelity interactive 3D CSS render if PNG is not uploaded yet or fails to load */}
              {(!heroImageLoaded || heroImageError) && (
                <div className="relative w-full h-[400px] flex items-center justify-center">
                  
                  {/* Glowing red neon circle/halo backing the visual */}
                  <div className={`absolute w-[240px] sm:w-[320px] h-[240px] sm:h-[320px] rounded-full border-4 ${theme.border} shadow-[0_0_50px_rgba(${customData.accentColor === 'red' ? '239,68,68' : customData.accentColor === 'blue' ? '59,130,246' : customData.accentColor === 'green' ? '16,185,129' : customData.accentColor === 'purple' ? '168,85,247' : '245,158,11'},0.45),inset_0_0_30px_rgba(${customData.accentColor === 'red' ? '239,68,68' : customData.accentColor === 'blue' ? '59,130,246' : customData.accentColor === 'green' ? '16,185,129' : customData.accentColor === 'purple' ? '168,85,247' : '245,158,11'},0.25)] animate-pulse pointer-events-none z-0`} />

                  {/* Stage: Metallic circular platform/podium with bright red neon-lit outer edge */}
                  <div className="absolute bottom-[20px] w-[320px] sm:w-[420px] h-[70px] rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.95)] z-10 flex items-center justify-center pointer-events-none">
                    {/* Metallic base rim */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 rounded-full border border-slate-600 shadow-inner" />
                    {/* Red neon outer ring border */}
                    <div className={`absolute inset-1 rounded-full border-[3px] ${theme.border} shadow-[0_0_25px_rgba(${customData.accentColor === 'red' ? '239,68,68' : customData.accentColor === 'blue' ? '59,130,246' : customData.accentColor === 'green' ? '16,185,129' : customData.accentColor === 'purple' ? '168,85,247' : '245,158,11'},0.9),inset_0_0_15px_rgba(${customData.accentColor === 'red' ? '239,68,68' : customData.accentColor === 'blue' ? '59,130,246' : customData.accentColor === 'green' ? '16,185,129' : customData.accentColor === 'purple' ? '168,85,247' : '245,158,11'},0.6)] animate-pulse`} />
                    {/* Inner metallic reflection plate */}
                    <div className="absolute inset-2 bg-gradient-to-tr from-slate-400 via-slate-600 to-slate-500 rounded-full opacity-90 border border-slate-500" />
                  </div>

                  {/* Stack of boxes on pallet (Left of Podium) */}
                  <div className="absolute bottom-[55px] left-[5%] sm:left-[10%] z-20 flex flex-col items-center">
                    {/* Pallet bottom */}
                    <div className="w-[120px] sm:w-[150px] h-[8px] sm:h-[10px] bg-slate-900 border border-slate-800 rounded" />
                    
                    <div className="relative w-[100px] sm:w-[130px] h-[75px] sm:h-[100px] mt-0.5">
                      {/* Main box 1 */}
                      <div className="absolute bottom-0 left-0 w-[60px] sm:w-[80px] h-[50px] sm:h-[65px] bg-amber-800/90 border border-amber-700/50 rounded shadow flex flex-col justify-between p-1.5 text-left font-sans text-slate-100">
                        <div className="flex justify-between items-start">
                          <span className="w-4 h-0.5 bg-amber-950/40 rounded-sm" />
                          <span className="text-[6px] sm:text-[8px]">📦</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="w-8 sm:w-12 h-0.5 bg-amber-900/40 rounded-sm" />
                          <div className="w-5 sm:w-8 h-0.5 bg-amber-900/40 rounded-sm" />
                        </div>
                      </div>

                      {/* Main box 2 (stacked on top of Box 1) */}
                      <div className="absolute bottom-[32px] sm:bottom-[45px] left-[8px] sm:left-[12px] w-[45px] sm:w-[60px] h-[40px] sm:h-[55px] bg-amber-700/95 border border-amber-600/50 rounded shadow flex flex-col justify-between p-1.5 text-left font-sans text-slate-100">
                        <div className="flex justify-between items-start">
                          <span className="w-3 h-0.5 bg-amber-950/40 rounded-sm" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="w-6 sm:w-10 h-0.5 bg-amber-800/50 rounded-sm" />
                        </div>
                      </div>

                      {/* Box 3 (side box) */}
                      <div className="absolute bottom-0 right-0 w-[42px] sm:w-[55px] h-[38px] sm:h-[50px] bg-amber-900/80 border border-amber-800/40 rounded shadow flex flex-col justify-between p-1">
                        <span className="w-3 h-0.5 bg-amber-950/30 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Barcode scanner standing upright & Receipt (Left-Front) */}
                  <div className="absolute bottom-[50px] left-[40%] sm:left-[45%] z-30 flex flex-col items-center">
                    <div className="w-[30px] sm:w-[38px] h-[55px] sm:h-[70px] bg-gradient-to-b from-slate-800 via-slate-900 to-black rounded-lg border border-slate-700 shadow-2xl relative flex flex-col items-center p-0.5">
                      {/* Scanner nozzle */}
                      <div className="w-5 sm:w-6 h-1.5 bg-red-600 rounded-sm border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] flex items-center justify-center">
                        <div className="w-3 sm:w-4 h-[1px] bg-red-400 animate-pulse" />
                      </div>
                      {/* Handle */}
                      <div className="w-2.5 sm:w-3 h-7 sm:h-9 bg-slate-900 mt-1 rounded border border-slate-800" />
                    </div>

                    {/* Hanging thermal receipt */}
                    <div className="w-[22px] sm:w-[28px] h-[40px] sm:h-[50px] bg-slate-100 border border-slate-300 shadow-md rounded-b-sm p-1 flex flex-col items-center justify-between text-slate-800 -mt-0.5 z-10 origin-top">
                      <div className="w-full space-y-0.5">
                        <div className="w-full h-[1px] bg-slate-400" />
                        <div className="w-3 h-[1px] bg-slate-400" />
                        <div className="w-4 h-[1px] bg-slate-400" />
                      </div>
                      <span className="text-red-600 font-bold text-[9px] font-mono leading-none">$</span>
                    </div>
                  </div>

                  {/* Futuristic Tablet Display (Right Side of Stage) */}
                  <div className="absolute bottom-[50px] right-[5%] sm:right-[10%] w-[180px] sm:w-[220px] h-[125px] sm:h-[150px] bg-[#050508]/98 border border-slate-800 rounded-lg p-2.5 shadow-2xl flex flex-col justify-between text-left z-20 backdrop-blur-sm">
                    {/* Tablet Header */}
                    <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                      <span className="text-[6px] sm:text-[7px] font-mono font-bold text-slate-400 tracking-wider">ESTOQUE ATUAL</span>
                      <span className="text-[6px] sm:text-[7px] text-red-500 font-mono flex items-center gap-0.5">
                        <span className="w-0.5 h-0.5 rounded-full bg-red-500 animate-ping" />
                        LIVE
                      </span>
                    </div>

                    {/* Metrics Content */}
                    <div className="grid grid-cols-2 gap-1 items-center mt-1">
                      <div className="space-y-0.5">
                        <span className="text-base sm:text-lg font-black text-white block leading-none">1.250</span>
                        <span className="text-[7px] sm:text-[8px] text-slate-400 font-semibold block leading-none font-sans">itens</span>
                      </div>
                      <div className="flex justify-end relative">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-900 flex items-center justify-center relative">
                          <div className="absolute inset-0 rounded-full border-2 border-t-red-500 border-r-red-500 border-b-red-500 border-l-transparent animate-spin" style={{ animationDuration: '6s' }} />
                          <span className="text-[6px] sm:text-[7px] font-black text-red-400 font-mono">+18%</span>
                        </div>
                      </div>
                    </div>

                    {/* Entradas & Saídas Grid */}
                    <div className="grid grid-cols-2 gap-1.5 border-t border-slate-900 pt-1.5 mt-1">
                      <div className="bg-slate-900/50 rounded p-1 border border-slate-900/80">
                        <span className="text-[5px] sm:text-[6px] text-slate-500 font-mono block font-bold leading-none">ENTRADAS</span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-white block leading-none mt-0.5">320</span>
                        <div className="w-full h-1.5 flex items-end gap-[0.5px] mt-1">
                          <div className="w-1 h-0.5 bg-red-500/40 rounded-t-sm" />
                          <div className="w-1 h-1 bg-red-500/60 rounded-t-sm" />
                          <div className="w-1 h-0.5 bg-red-500/40 rounded-t-sm" />
                          <div className="w-1 h-1 bg-red-500 rounded-t-sm animate-pulse" />
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-1 border border-slate-900/80">
                        <span className="text-[5px] sm:text-[6px] text-slate-500 font-mono block font-bold leading-none">SAÍDAS</span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-white block leading-none mt-0.5">210</span>
                        <div className="w-full h-1.5 flex items-end gap-[0.5px] mt-1">
                          <div className="w-1 h-1 bg-slate-700 rounded-t-sm" />
                          <div className="w-1 h-0.5 bg-slate-700 rounded-t-sm" />
                          <div className="w-1 h-1 bg-slate-700 rounded-t-sm" />
                          <div className="w-1 h-0.5 bg-slate-600 rounded-t-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Glassmorphic Card (Gastos do Mês) */}
                  <div className="absolute bottom-[30px] left-[38%] w-[120px] sm:w-[140px] bg-slate-950/90 border border-red-500/25 rounded-lg p-2 shadow-2xl z-40 backdrop-blur-md text-left flex flex-col gap-0.5 animate-bounce" style={{ animationDuration: '5s' }}>
                    <span className="text-[6px] sm:text-[7px] text-slate-500 font-mono tracking-wider block leading-none">GASTOS DO MÊS</span>
                    <span className="text-xs sm:text-sm font-black text-slate-100 block leading-none">R$ 8.450,00</span>
                    <span className="text-[6px] sm:text-[7px] font-bold text-red-500 font-sans leading-none">↓ -7% vs mês anterior</span>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </section>
          
      {/* 3. PROBLEMAS SECTION (As dores de cabeça do depósito) */}
      <section id="problemas" className={`py-20 sm:py-28 px-4 sm:px-8 bg-[#05050a] w-full z-10 relative border-y ${theme.borderMuted}`}>
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Section heading */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className={`${theme.text} text-xs font-bold uppercase tracking-wider block`}>
              OS DESAFIOS DO RAMO
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100 font-sans">
              Por que os depósitos tradicionais perdem dinheiro?
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Se você se identifica com mais de dois destes problemas, seu negócio está vazando faturamento e desperdiçando seu tempo de descanso.
            </p>
          </div>

          {/* Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customData.problems.map((prob, idx) => (
              <div 
                key={idx} 
                className={`bg-[#0b0b12]/60 border ${theme.borderMuted} rounded-2xl p-6 hover:${theme.border} hover:shadow-[0_8px_30px_rgba(239,68,68,0.01)] transition-all text-left space-y-4 group`}
              >
                <div className={`w-12 h-12 rounded-xl overflow-hidden relative border ${theme.borderMuted} shrink-0`}>
                  <img 
                    src={prob.img} 
                    alt={prob.t} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute inset-0 ${theme.bgMuted} group-hover:bg-transparent transition-colors`} />
                </div>
                <div className="space-y-2">
                  <h3 className={`font-bold text-sm text-slate-100 uppercase tracking-wide group-hover:${theme.textLight} transition-colors`}>
                    {prob.t}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {prob.d}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. RECURSOS SECTION */}
      <section id="recursos" className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full z-10 relative">
        <div className="space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className={`${theme.text} text-xs font-bold uppercase tracking-wider block`}>
              MÓDULOS COMPLETOS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100 font-sans">
              Um arsenal de ferramentas para organizar o seu depósito
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Desenvolvemos recursos focados em resolver de vez as peculiaridades do mercado de bebidas.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {customData.features.map((feat, idx) => (
              <div 
                key={idx} 
                className={`bg-[#0b0b12]/40 border ${theme.borderMuted} rounded-2xl p-6 hover:${theme.border} hover:bg-[#0b0b12] transition-all text-left flex flex-col justify-between space-y-6`}
              >
                <div className="space-y-4">
                  <div className={`w-10 h-10 rounded-xl ${theme.bgMuted} border ${theme.border} flex items-center justify-center`}>
                    {renderFeatureIcon(feat.iconName)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
                      {feat.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                {/* Sub items checking */}
                <ul className={`space-y-2 border-t ${theme.borderMuted} pt-4 text-[11px] text-slate-400 font-medium`}>
                  {feat.items.map((subItem, sIdx) => (
                    <li key={sIdx} className="flex items-center gap-2">
                      <Check className={`w-3.5 h-3.5 ${theme.text} shrink-0`} />
                      <span>{subItem}</span>
                    </li>
                  ))}
                </ul>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION (Timeline Onboarding) */}
      <section id="como-funciona" className={`py-20 sm:py-28 px-4 sm:px-8 bg-[#05050a] w-full z-10 relative border-y ${theme.borderMuted}`}>
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className={`${theme.text} text-xs font-bold uppercase tracking-wider block`}>
              FACILIDADE ABSOLUTA
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100 font-sans">
              Quatro passos simples para começar a usar
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Você não precisa saber nada de computadores. O sistema é tão simples que você começa a registrar faturamento no primeiro dia.
            </p>
          </div>

          {/* Timeline steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {customData.steps.map((step, idx) => (
              <div 
                key={idx} 
                className={`bg-[#0b0b12] p-6 rounded-2xl border ${theme.borderMuted} text-left space-y-4 relative group`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${theme.text} uppercase font-mono ${theme.bgMuted} px-2 py-0.5 rounded border ${theme.border}`}>
                    {step.s}
                  </span>
                  <div className={`w-8 h-8 rounded-full ${theme.accentBg} text-white font-bold flex items-center justify-center text-xs`}>
                    {idx + 1}
                  </div>
                </div>
                <div>
                  <h4 className={`font-extrabold text-sm text-slate-100 uppercase tracking-wide group-hover:${theme.textLight} transition-colors`}>
                    {step.t}
                  </h4>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    {step.d}
                  </p>
                </div>
              </div>
            ))}

          </div>

          <div className="pt-6 text-center">
            <button 
              onClick={onRegisterInterest}
              className={`${theme.bg} ${theme.bgHover} text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg ${theme.shadow} cursor-pointer text-sm`}
            >
              Criar minha conta grátis agora
            </button>
          </div>

        </div>
      </section>

      {/* 6. COMPARATIVE TABLE (Why choose us) */}
      <section id="diferencial" className="py-20 sm:py-28 px-4 sm:px-8 max-w-4xl mx-auto w-full z-10 relative">
        <div className="space-y-12 text-center">
          
          <div className="space-y-3">
            <span className={`${theme.text} text-xs font-bold uppercase tracking-wider block`}>
              DIFERENCIAL EXCLUSIVO
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 font-sans">
              Por que somos melhores que cadernos e planilhas?
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Compare as ferramentas e veja como o Depósito Fácil devolve o controle do negócio para as suas mãos.
            </p>
          </div>

          {/* Comparison Table */}
          <div className={`bg-[#0b0b12] rounded-2xl border ${theme.borderMuted} shadow-2xl overflow-hidden text-left`}>
            <div className={`grid grid-cols-12 border-b ${theme.borderMuted} bg-[#06060a] p-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500`}>
              <div className="col-span-6">Diferenciais e Recursos</div>
              <div className={`col-span-3 text-center ${theme.text}`}>Depósito Fácil</div>
              <div className="col-span-3 text-center">Outros Sistemas / Excel</div>
            </div>
            
            <div className={`divide-y ${theme.borderMuted}`}>
              {[
                { name: "Sincronização instantânea estoque-PDV", yes: true },
                { name: "Controle especializado de engradados retornáveis", yes: true },
                { name: "Gestão inteligente de fiado com limites", yes: true },
                { name: "Acesso por celular / tablet do estoque", yes: true },
                { name: "Fechamento de caixa com conferência em 2 min", yes: true },
                { name: "Backups automáticos na nuvem", yes: true },
                { name: "Suporte humanizado por WhatsApp em minutos", yes: true }
              ].map((feat, idx) => (
                <div key={idx} className="grid grid-cols-12 p-4 items-center text-xs sm:text-sm">
                  <div className="col-span-6 font-semibold text-slate-300">{feat.name}</div>
                  
                  {/* Depósito Fácil */}
                  <div className="col-span-3 flex justify-center">
                    <div className={`w-5 h-5 rounded-full ${theme.accentBg} flex items-center justify-center text-white`}>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  
                  {/* Others crosses */}
                  <div className="col-span-3 flex justify-center text-slate-600 font-bold text-xs">
                    ✕
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section id="depoimentos" className={`py-20 sm:py-28 px-4 sm:px-8 bg-[#05050a] w-full z-10 relative border-y ${theme.borderMuted}`}>
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className={`${theme.text} text-xs font-bold uppercase tracking-wider block`}>
              QUEM USA RECOMENDA
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 font-sans">
              Depósitos de Bebidas que mudaram de vida
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Veja depoimentos reais de donos de depósitos e distribuidoras que aposentaram a caderneta física e as tabelas complicadas.
            </p>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {customData.testimonials.map((test, idx) => (
              <div 
                key={idx} 
                className={`bg-[#0b0b12] border ${theme.borderMuted} p-8 rounded-2xl flex flex-col justify-between hover:${theme.border} transition-all text-left space-y-6`}
              >
                <div className="space-y-4">
                  <div className="flex gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    {test.quote}
                  </p>
                </div>
                <div className={`flex items-center gap-3.5 border-t ${theme.borderMuted} pt-4`}>
                  <div className={`w-10 h-10 rounded-full bg-slate-900 border ${theme.borderMuted} overflow-hidden shrink-0 flex items-center justify-center`}>
                    <img 
                      src={test.img} 
                      alt={test.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-slate-100 block">{test.name}</span>
                    <span className={`text-[11px] ${theme.textLight} block`}>{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. PRICING SECTION */}
      <section id="planos" className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full z-10 relative">
        <div className="space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className={`${theme.text} text-xs font-bold uppercase tracking-wider block`}>
              TABELA DE PLANOS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100 font-sans">
              O plano perfeito para o tamanho do seu negócio
            </h2>
            <p className="text-slate-400 text-sm">
              Sem taxas ocultas, contratos ou multas. Mude de plano ou cancele quando quiser.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-xs font-semibold ${!isAnnual ? "text-slate-200" : "text-slate-500"}`}>Mensal</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className={`w-12 h-6 ${theme.bgMuted} border ${theme.border} rounded-full relative p-0.5 transition-colors focus:outline-none`}
              >
                <div className={`w-4 h-4 ${theme.accentBg} rounded-full transition-transform transform ${isAnnual ? "translate-x-6" : "translate-x-0"}`} />
              </button>
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? theme.textLight : "text-slate-500"}`}>
                Anual
                <span className={`bg-[#05050a] ${theme.text} text-[9px] px-1.5 py-0.25 rounded font-bold uppercase tracking-wider border ${theme.border}`}>
                  Salva R$ 600+
                </span>
              </span>
            </div>

          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Plan 1: Básico */}
            <div className={`bg-[#0b0b12]/40 border ${theme.borderMuted} p-8 rounded-2xl flex flex-col justify-between text-left relative hover:${theme.border} transition-all`}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide">Plano Básico</h3>
                  <p className="text-slate-400 text-xs mt-1">Ideal para pequenos depósitos em expansão inicial</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-400">R$</span>
                  <span className="text-5xl font-black text-slate-100">{isAnnual ? "65" : "79"}</span>
                  <span className="text-slate-500 text-xs">/mês</span>
                </div>
                <button 
                  onClick={onRegisterInterest}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold py-3.5 px-4 rounded-xl text-xs transition-all border border-slate-800"
                >
                  Começar com Plano Básico
                </button>
                <ul className={`space-y-3.5 text-xs text-slate-400 font-medium pt-2 border-t ${theme.borderMuted}`}>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span>1 Unidade inclusa</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span>Até 2 usuários de acesso</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span>Frente de Caixa (PDV) ultra rápido</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span>Controle de estoque inteligente</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span>Relatórios de faturamento básicos</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Plan 2: Profissional */}
            <div className={`bg-[#0b0b12] border-2 ${theme.borderActive} p-8 rounded-2xl flex flex-col justify-between text-left relative shadow-lg ${theme.shadow} transform lg:scale-[1.03]`}>
              
              {/* Popular Tag */}
              <span className={`absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 ${theme.accentBg} text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md`}>
                MAIS VENDIDO
              </span>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    Plano Profissional
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">O controle completo para crescer e faturar mais</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-400">R$</span>
                  <span className="text-5xl font-black text-slate-100">{isAnnual ? "124" : "149"}</span>
                  <span className="text-slate-500 text-xs">/mês</span>
                </div>
                <button 
                  onClick={onRegisterInterest}
                  className={`w-full ${theme.bg} ${theme.bgHover} text-white font-extrabold py-3.5 px-4 rounded-xl text-xs transition-all shadow-lg ${theme.shadow}`}
                >
                  Começar com Plano Profissional
                </button>
                <ul className={`space-y-3.5 text-xs text-slate-300 font-semibold pt-2 border-t ${theme.borderMuted}`}>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span className="text-white">Até 3 unidades integradas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span className="text-white">Até 10 usuários simultâneos</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span>Tudo do Plano Básico</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span className="text-white">Gestão Financeira e Contas a pagar</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span className="text-white">Controle de Fiados & Limite de Crédito</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span>Kanban de Pedidos e Entregas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span>Suporte prioritário por WhatsApp</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Plan 3: Premium */}
            <div className={`bg-[#0b0b12]/40 border ${theme.borderMuted} p-8 rounded-2xl flex flex-col justify-between text-left relative hover:${theme.border} transition-all`}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide">Plano Premium</h3>
                  <p className="text-slate-400 text-xs mt-1">Solução corporativa ilimitada para grandes operações</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-400">R$</span>
                  <span className="text-5xl font-black text-slate-100">{isAnnual ? "249" : "299"}</span>
                  <span className="text-slate-500 text-xs">/mês</span>
                </div>
                <button 
                  onClick={onRegisterInterest}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold py-3.5 px-4 rounded-xl text-xs transition-all border border-slate-800"
                >
                  Começar com Plano Premium
                </button>
                <ul className={`space-y-3.5 text-xs text-slate-400 font-medium pt-2 border-t ${theme.borderMuted}`}>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span className="text-slate-200">Unidades ILIMITADAS</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span className="text-slate-200">Usuários de acesso ILIMITADOS</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span>Tudo do Plano Profissional</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span>Personalização de marca (White-label)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span>Painéis personalizados e Integração por API</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 ${theme.text} shrink-0`} />
                    <span className="text-slate-200">Gerente de conta e suporte 24/7</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 9. FAQ ACCORDION SECTION */}
      <section id="faq" className={`py-16 sm:py-20 px-4 sm:px-8 bg-[#09090c]/40 border-y ${theme.borderMuted} w-full z-10 relative`}>
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className={`${theme.text} text-xs font-bold uppercase tracking-wider block`}>
              DÚVIDAS FREQUENTES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 font-sans">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {customData.faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`bg-[#0b0b12] border ${theme.borderMuted} rounded-2xl overflow-hidden transition-all duration-200`}
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className={`w-full text-left p-6 flex items-center justify-between text-slate-100 hover:${theme.textLight} transition-colors gap-4`}
                >
                  <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${activeFaq === index ? `rotate-180 ${theme.text}` : ""}`} />
                </button>
                {activeFaq === index && (
                  <div className={`px-6 pb-6 text-xs sm:text-sm text-slate-400 leading-relaxed border-t ${theme.borderMuted} pt-4 animate-in fade-in duration-200`}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. FINAL CTA BANNER */}
      <section className="py-24 sm:py-32 px-4 sm:px-8 relative z-10">
        <div className={`max-w-5xl mx-auto bg-gradient-to-r from-slate-900/40 via-slate-950 to-[#05050a] border ${theme.border} rounded-3xl p-8 sm:p-16 text-center space-y-8 relative overflow-hidden`}>
          
          <div className={`absolute top-0 right-0 w-64 h-64 bg-${customData.accentColor === 'green' ? 'emerald' : customData.accentColor}-600/5 rounded-full filter blur-[80px] pointer-events-none -z-10`} />
          
          <div className="max-w-2xl mx-auto space-y-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${theme.bgMuted} border ${theme.border} ${theme.textLight} rounded-full text-xs font-semibold tracking-wide`}>
              Experimente sem medo
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-100 leading-tight">
              Diga adeus ao papel e controle seu depósito hoje
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Junte-se a dezenas de donos de depósitos e distribuidoras que já simplificaram suas rotinas, economizaram horas de trabalho e evitam faturamento perdido.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto pt-4">
            <button 
              onClick={onRegisterInterest}
              className={`${theme.bg} ${theme.bgHover} text-white font-extrabold py-4 px-8 rounded-xl shadow-lg ${theme.shadow} hover:scale-[1.01] transition-all cursor-pointer text-sm`}
            >
              Começar teste gratuito de 7 dias
            </button>
            <button 
              onClick={onEnterApp}
              className={`bg-slate-950 hover:bg-slate-900 border ${theme.borderMuted} text-slate-300 font-semibold py-4 px-8 rounded-xl transition-all cursor-pointer text-sm`}
            >
              Entrar no sistema
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Não é necessário cartão de crédito para testar. Configuração em 2 minutos.
          </p>

        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className={`bg-[#020205] border-t ${theme.borderMuted} py-12 px-4 sm:px-8 relative z-10 text-xs text-slate-500`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <SaaSLogo size={28} logoUrl={saasLogoUrl} />
            <span className="font-extrabold text-slate-300 tracking-tight text-sm">
              Depósito <span className={theme.text}>Fácil</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#problemas" className={`hover:${theme.textLight} transition-colors`}>Problemas</a>
            <a href="#recursos" className={`hover:${theme.textLight} transition-colors`}>Recursos</a>
            <a href="#como-funciona" className={`hover:${theme.textLight} transition-colors`}>Como funciona</a>
            <a href="#planos" className={`hover:${theme.textLight} transition-colors`}>Planos</a>
            <a href="#faq" className={`hover:${theme.textLight} transition-colors`}>FAQ</a>
          </div>

          <div>
            <p>&copy; {new Date().getFullYear()} Depósito Fácil SaaS. Todos os direitos reservados.</p>
          </div>

        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button 
          onClick={scrollToTop}
          className={`${theme.bg} ${theme.bgHover} text-white p-3.5 rounded-full shadow-xl hover:${theme.shadow} hover:scale-115 transition-all cursor-pointer animate-in fade-in duration-200 fixed bottom-6 right-6 z-50`}
          title="Voltar ao topo"
        >
          <ArrowUp className="w-5 h-5 text-white" />
        </button>
      )}

      {/* 12. FLOATING CMS EDITOR PANEL */}
      {isEditMode && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-slate-950/98 border-l border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.85)] z-50 flex flex-col animate-in slide-in-from-right duration-300 backdrop-blur-md">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <Settings className={`w-5 h-5 ${theme.text} animate-spin`} style={{ animationDuration: '6s' }} />
              <div>
                <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wide">Editor Visual (CMS)</h3>
                <p className="text-[10px] text-slate-400">Personalize o texto, imagem e estilo em tempo real</p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditMode(false)}
              className="text-slate-400 hover:text-slate-200 p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950 text-[10px] uppercase font-black tracking-wider overflow-x-auto scrollbar-none shrink-0">
            {[
              { id: "geral", label: "Geral" },
              { id: "hero", label: "Hero" },
              { id: "problemas", label: "Problemas" },
              { id: "recursos", label: "Módulos" },
              { id: "onboarding", label: "Passos" },
              { id: "depoimentos", label: "Depoimentos" },
              { id: "faq", label: "FAQ" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCmsTab(tab.id as any)}
                className={`px-4.5 py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${cmsTab === tab.id ? `${theme.borderActive} ${theme.text} bg-slate-900/40` : "border-transparent text-slate-500 hover:text-slate-300"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content (Scrollable Form) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-left text-xs text-slate-300">
            
            {/* GERAL TAB */}
            {cmsTab === "geral" && (
              <div className="space-y-5">
                {/* Theme Color Picker */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cor de Destaque (Tema)</label>
                  <p className="text-[10px] text-slate-500 mb-1">Muda instantaneamente todas as luzes, botões, bordas e glows do site.</p>
                  <div className="flex gap-2.5 pt-1">
                    {(["red", "blue", "green", "purple", "amber"] as const).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateField("accentColor", color)}
                        className={`w-8 h-8 rounded-full transition-all border-2 relative flex items-center justify-center ${
                          color === "red" ? "bg-red-600 shadow-red-600/30" :
                          color === "blue" ? "bg-blue-600 shadow-blue-600/30" :
                          color === "green" ? "bg-emerald-600 shadow-emerald-600/30" :
                          color === "purple" ? "bg-purple-600 shadow-purple-600/30" :
                          "bg-amber-600 shadow-amber-600/30"
                        } ${customData.accentColor === color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}
                      >
                        {customData.accentColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tagline */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tagline do Topo</label>
                  <input
                    type="text"
                    value={customData.tagline}
                    onChange={(e) => updateField("tagline", e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-slate-700"
                  />
                </div>

                {/* Badges */}
                <div className="space-y-3.5 border-t border-slate-900 pt-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selos de Confiança (Badges)</h4>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Selo 1</label>
                    <input
                      type="text"
                      value={customData.badge1}
                      onChange={(e) => updateField("badge1", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Selo 2</label>
                    <input
                      type="text"
                      value={customData.badge2}
                      onChange={(e) => updateField("badge2", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Selo 3</label>
                    <input
                      type="text"
                      value={customData.badge3}
                      onChange={(e) => updateField("badge3", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HERO TAB */}
            {cmsTab === "hero" && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título Principal (Hero)</label>
                  <textarea
                    rows={2}
                    value={customData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-slate-700 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subtítulo Descritivo</label>
                  <textarea
                    rows={4}
                    value={customData.subtitle}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-slate-700 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-900 pt-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Texto Botão Principal</label>
                    <input
                      type="text"
                      value={customData.btnCtaText}
                      onChange={(e) => updateField("btnCtaText", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-slate-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Texto Botão Demo</label>
                    <input
                      type="text"
                      value={customData.btnDemoText}
                      onChange={(e) => updateField("btnDemoText", e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-slate-700"
                    />
                  </div>
                </div>

                {/* Hero Image CMS */}
                <div className="space-y-3.5 border-t border-slate-900 pt-3.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Imagem do Banner / Protótipo</h4>
                  
                  <div className="flex items-center gap-2.5 py-1.5 bg-slate-900/50 rounded-xl px-3.5 border border-slate-900">
                    <input
                      type="checkbox"
                      id="useUrlCheck"
                      checked={customData.heroImageUseUrl}
                      onChange={(e) => updateField("heroImageUseUrl", e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 text-red-500 bg-slate-900 focus:ring-0"
                    />
                    <label htmlFor="useUrlCheck" className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wide cursor-pointer">
                      Usar imagem customizada para o topo
                    </label>
                  </div>

                  {/* Local PC Upload Section */}
                  <div className="space-y-2 p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fazer upload do seu PC</label>
                    <div className="relative border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group bg-slate-950/20">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLocalImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload className={`w-5 h-5 text-slate-500 group-hover:${theme.text} transition-colors`} />
                      <div className="text-center">
                        <span className="text-xs font-bold text-slate-300 block">Clique ou arraste um arquivo do seu PC</span>
                        <span className="text-[9px] text-slate-500">Suporta PNG, JPG ou WEBP (Otimizado automaticamente)</span>
                      </div>
                    </div>

                    {customData.heroImageUrl && customData.heroImageUrl.startsWith("data:") && (
                      <div className="flex items-center justify-between py-1 px-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] text-emerald-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Imagem carregada do computador!
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            updateField("heroImageUrl", "");
                            updateField("heroImageUseUrl", false);
                          }}
                          className="text-slate-400 hover:text-red-400 font-bold hover:underline cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">URL da Imagem (Ex: link da internet)</label>
                    <input
                      type="text"
                      value={customData.heroImageUrl}
                      onChange={(e) => updateField("heroImageUrl", e.target.value)}
                      placeholder="https://..."
                      disabled={!customData.heroImageUseUrl}
                      className="w-full bg-slate-900 border border-slate-800 disabled:opacity-50 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-slate-700"
                    />
                    <p className="text-[9px] text-slate-500">
                      Substitui a animação 3D padrão. Você pode enviar do PC acima ou colar um link de imagem diretamente aqui.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PROBLEMAS TAB */}
            {cmsTab === "problemas" && (
              <div className="space-y-5">
                <p className="text-[10px] text-slate-500">Aqui você pode editar os 4 cartões de dor do cliente na seção de problemas.</p>
                {customData.problems.map((prob, i) => (
                  <div key={i} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                      <span className="font-extrabold text-[10px] text-slate-400 uppercase">Cartão Dor #{i + 1}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase">Título</label>
                      <input
                        type="text"
                        value={prob.t}
                        onChange={(e) => {
                          const updated = [...customData.problems];
                          updated[i] = { ...updated[i], t: e.target.value };
                          updateField("problems", updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase">Descrição</label>
                      <textarea
                        rows={2}
                        value={prob.d}
                        onChange={(e) => {
                          const updated = [...customData.problems];
                          updated[i] = { ...updated[i], d: e.target.value };
                          updateField("problems", updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase">URL Imagem Decorativa</label>
                      <input
                        type="text"
                        value={prob.img}
                        onChange={(e) => {
                          const updated = [...customData.problems];
                          updated[i] = { ...updated[i], img: e.target.value };
                          updateField("problems", updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FEATURES TAB */}
            {cmsTab === "recursos" && (
              <div className="space-y-5">
                <p className="text-[10px] text-slate-500">Customize os 4 blocos de módulos/recursos do Depósito Fácil.</p>
                {customData.features.map((feat, i) => (
                  <div key={i} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                      <span className="font-extrabold text-[10px] text-slate-400 uppercase">Módulo #{i + 1}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase">Título</label>
                      <input
                        type="text"
                        value={feat.title}
                        onChange={(e) => {
                          const updated = [...customData.features];
                          updated[i] = { ...updated[i], title: e.target.value };
                          updateField("features", updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase">Descrição</label>
                      <textarea
                        rows={2}
                        value={feat.desc}
                        onChange={(e) => {
                          const updated = [...customData.features];
                          updated[i] = { ...updated[i], desc: e.target.value };
                          updateField("features", updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                      />
                    </div>

                    <div className="space-y-2 pt-1 border-t border-slate-900">
                      <label className="text-[9px] text-slate-500 uppercase block">Lista de Benefícios (Filtros)</label>
                      {feat.items.map((sub, sIdx) => (
                        <input
                          key={sIdx}
                          type="text"
                          value={sub}
                          onChange={(e) => {
                            const updated = [...customData.features];
                            const updatedItems = [...updated[i].items];
                            updatedItems[sIdx] = e.target.value;
                            updated[i] = { ...updated[i], items: updatedItems };
                            updateField("features", updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-100 text-[11px] mb-1"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ONBOARDING STEPS TAB */}
            {cmsTab === "onboarding" && (
              <div className="space-y-5">
                <p className="text-[10px] text-slate-500">Configure os 4 passos do Onboarding na linha do tempo.</p>
                {customData.steps.map((step, i) => (
                  <div key={i} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                      <span className="font-extrabold text-[10px] text-slate-400 uppercase">Passo #{i + 1}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase">Tag Superior</label>
                        <input
                          type="text"
                          value={step.s}
                          onChange={(e) => {
                            const updated = [...customData.steps];
                            updated[i] = { ...updated[i], s: e.target.value };
                            updateField("steps", updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase">Título</label>
                        <input
                          type="text"
                          value={step.t}
                          onChange={(e) => {
                            const updated = [...customData.steps];
                            updated[i] = { ...updated[i], t: e.target.value };
                            updateField("steps", updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase">Instruções</label>
                      <textarea
                        rows={2}
                        value={step.d}
                        onChange={(e) => {
                          const updated = [...customData.steps];
                          updated[i] = { ...updated[i], d: e.target.value };
                          updateField("steps", updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TESTIMONIALS TAB */}
            {cmsTab === "depoimentos" && (
              <div className="space-y-5">
                <p className="text-[10px] text-slate-500">Mude os 3 depoimentos e rostos exibidos.</p>
                {customData.testimonials.map((test, i) => (
                  <div key={i} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                      <span className="font-extrabold text-[10px] text-slate-400 uppercase">Depoimento #{i + 1}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase">Citação</label>
                      <textarea
                        rows={3}
                        value={test.quote}
                        onChange={(e) => {
                          const updated = [...customData.testimonials];
                          updated[i] = { ...updated[i], quote: e.target.value };
                          updateField("testimonials", updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase">Nome</label>
                        <input
                          type="text"
                          value={test.name}
                          onChange={(e) => {
                            const updated = [...customData.testimonials];
                            updated[i] = { ...updated[i], name: e.target.value };
                            updateField("testimonials", updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase">Papel / Empresa</label>
                        <input
                          type="text"
                          value={test.role}
                          onChange={(e) => {
                            const updated = [...customData.testimonials];
                            updated[i] = { ...updated[i], role: e.target.value };
                            updateField("testimonials", updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase">URL da Foto</label>
                      <input
                        type="text"
                        value={test.img}
                        onChange={(e) => {
                          const updated = [...customData.testimonials];
                          updated[i] = { ...updated[i], img: e.target.value };
                          updateField("testimonials", updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FAQ TAB */}
            {cmsTab === "faq" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500">Adicione, exclua ou edite as perguntas e respostas do site.</p>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...customData.faqs, { q: "NOVA PERGUNTA", a: "Nova resposta customizada." }];
                      updateField("faqs", updated);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-bold ${theme.text}`}
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-3.5">
                  {customData.faqs.map((faq, i) => (
                    <div key={i} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2.5 relative">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = customData.faqs.filter((_, idx) => idx !== i);
                          updateField("faqs", updated);
                        }}
                        className="absolute top-3.5 right-3.5 text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Excluir Pergunta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1 pr-6">
                        <label className="text-[9px] text-slate-500 uppercase font-bold">Pergunta #{i + 1}</label>
                        <input
                          type="text"
                          value={faq.q}
                          onChange={(e) => {
                            const updated = [...customData.faqs];
                            updated[i] = { ...updated[i], q: e.target.value };
                            updateField("faqs", updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase font-bold">Resposta</label>
                        <textarea
                          rows={2.5}
                          value={faq.a}
                          onChange={(e) => {
                            const updated = [...customData.faqs];
                            updated[i] = { ...updated[i], a: e.target.value };
                            updateField("faqs", updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center gap-3 shrink-0">
            <button
              onClick={handleResetDefault}
              className="flex items-center gap-1.5 px-3.5 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              title="Restaurar originais"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resetar
            </button>
            <button
              onClick={() => handleSaveCustomData(customData)}
              disabled={isSaving}
              className={`flex-1 flex items-center justify-center gap-2 ${theme.bg} ${theme.bgHover} disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-lg ${theme.shadow}`}
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Salvando..." : "Salvar na Nuvem"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
