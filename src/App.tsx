import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Video,
  UserRound,
  LayoutDashboard,
  Code2,
  ChevronRight,
  Zap,
  ShieldCheck,
  Cpu,
  Globe,
  Lock,
  Sparkles,
  ArrowUpRight,
  Terminal,
  Activity
} from 'lucide-react';

const translations = {
  en: {
    heroTitle: "The Future of Infrastructure.",
    heroSubtitle: "Experience five neural-grade applications in one unified ecosystem. Local performance, absolute privacy, and total control.",
    privacy: "Encrypted",
    speed: "Quantized",
    local: "Deep Local",
    apps: [
      { id: 'chat', title: "Nexus-Prime AI", desc: "Local LLM for secure document analysis.", icon: UserRound, color: "#6366f1", path: "/chat" },
      { id: 'clipper', title: "Viral Studio", desc: "Neural video extraction & viral optimization.", icon: Video, color: "#f43f5e", path: "/clipper" },
      { id: 'job', title: "Career-Engine AI", desc: "ATS-optimized career rewriting & strategy.", icon: FileText, color: "#10b981", path: "/job" },
      { id: 'freelance', title: "Finance-OS", desc: "Enterprise-grade asset & expense ledger.", icon: LayoutDashboard, color: "#3b82f6", path: "/freelance" },
      { id: 'builder', title: "Architect-AI", desc: "Design-to-Code neural synthesis engine.", icon: Code2, color: "#a855f7", path: "/builder" }
    ],
    footer: "SYSTEM_VERSION: 3.1.2-STABLE // ALL DATA PERSISTED LOCALLY"
  },
  fr: {
    heroTitle: "Le Futur de l'Infrastructure.",
    heroSubtitle: "Cinq applications de niveau neuronal dans un écosystème unifié. Performance locale, confidentialité absolue, contrôle total.",
    privacy: "Chiffré",
    speed: "Quantifié",
    local: "Local Profond",
    apps: [
      { id: 'chat', title: "IA Nexus-Prime", desc: "LLM local pour l'analyse sécurisée de documents.", icon: UserRound, color: "#6366f1", path: "/chat" },
      { id: 'clipper', title: "Viral Studio", desc: "Extraction vidéo neurale & optimisation virale.", icon: Video, color: "#f43f5e", path: "/clipper" },
      { id: 'job', title: "IA Career-Engine", desc: "Réécriture de carrière & stratégie optimisée ATS.", icon: FileText, color: "#10b981", path: "/job" },
      { id: 'freelance', title: "Finance-OS", desc: "Gestion d'actifs & grand livre d'entreprise.", icon: LayoutDashboard, color: "#3b82f6", path: "/freelance" },
      { id: 'builder', title: "IA Architecte", desc: "Moteur de synthèse neurale Design-to-Code.", icon: Code2, color: "#a855f7", path: "/builder" }
    ],
    footer: "VERSION_SYSTÈME: 3.1.2-STABLE // DONNÉES PERSISTÉES LOCALEMENT"
  }
};

export default function App() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'en' | 'fr'>(() => {
    return (localStorage.getItem('app_lang') as 'en' | 'fr') || 'en';
  });

  const t = translations[lang];

  const switchLanguage = (newLang: 'en' | 'fr') => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-outfit overflow-x-hidden relative selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        <div className="absolute inset-0 bg-[#0A0A0B] opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-50 px-8 py-6 flex items-center justify-between max-w-[1800px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter italic mr-2 uppercase">ANDRO</span>
            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest border border-indigo-500/20 px-2 py-0.5 rounded-full">OS v3</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
            <button
              onClick={() => switchLanguage('en')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all cursor-pointer uppercase ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-white'}`}
            >
              EN
            </button>
            <button
              onClick={() => switchLanguage('fr')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all cursor-pointer uppercase ${lang === 'fr' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-white'}`}
            >
              FR
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 pt-20 pb-10 px-8 max-w-[1200px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <Sparkles size={12} />
            NEURAL_OS_READY_FOR_ENGAGEMENT
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic leading-none mb-8 uppercase">
            {t.heroTitle.split(' ').map((word, i) => (
              <span key={i} className={i % 2 === 1 ? "text-indigo-500" : ""}>{word} </span>
            ))}
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-12 mb-24 opacity-40">
            <div className="flex items-center gap-3"><Lock size={16} /> <span className="text-xs font-black uppercase tracking-widest">{t.privacy}</span></div>
            <div className="flex items-center gap-3"><Zap size={16} /> <span className="text-xs font-black uppercase tracking-widest">{t.speed}</span></div>
            <div className="flex items-center gap-3"><Cpu size={16} /> <span className="text-xs font-black uppercase tracking-widest">{t.local}</span></div>
          </div>
        </motion.div>

        {/* App Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left mb-20 px-4 md:px-0">
          <AnimatePresence mode="popLayout">
            {t.apps.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => navigate(app.path)}
                className="group relative bg-[#0D0D0F] border border-white/5 rounded-[48px] p-10 hover:border-indigo-500/30 transition-all cursor-pointer shadow-3xl flex flex-col justify-between min-h-[320px] active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-white/[0.03] flex items-center justify-center group-hover:bg-indigo-600 transition-all shadow-inner border border-white/5">
                      <app.icon className="text-white" size={30} />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-indigo-500 transition-all">
                      <ChevronRight size={24} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight mb-3 group-hover:text-indigo-400 transition-colors">{app.title}</h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed">{app.desc}</p>
                </div>

                <div className="relative z-10 pt-8 border-t border-white/5 flex items-center justify-between opacity-30 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{app.id === 'job' ? 'Career' : app.id === 'chat' ? 'Neural' : 'System'}</span>
                  <ArrowUpRight size={16} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="pt-20 pb-10 flex flex-col md:flex-row items-center justify-between border-t border-white/5">
          <div className="flex items-center gap-4 text-gray-700 text-[10px] font-black uppercase tracking-[0.3em] mb-6 md:mb-0 italic font-mono">
            <Terminal size={14} className="text-indigo-500/50" />
            {t.footer}
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">
            <span className="hover:text-indigo-500 transition-colors cursor-pointer">Security Protocol</span>
            <span className="hover:text-indigo-500 transition-colors cursor-pointer">Hardware Metrics</span>
          </div>
        </div>
      </main>
    </div>
  );
}
