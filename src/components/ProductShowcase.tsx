import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FileText, GraduationCap, Key, Upload, Play, Shield, Layers,
  Video, Lock, CheckCircle, Eye, DollarSign,
  TrendingUp, Copy, RefreshCw, GripVertical,
  Zap, Clock, Monitor,
  ChevronRight
} from "lucide-react";

const tabs = [
  { id: "files", emoji: "📁", label: "Fichiers", icon: FileText },
  { id: "courses", emoji: "🎓", label: "Cours", icon: GraduationCap },
  { id: "licenses", emoji: "🔑", label: "Licences", icon: Key },
];

/* ─────────────────────── FICHIERS ─────────────────────── */
const FilesMockup = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 3), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      {/* Mini sidebar + content */}
      <div className="flex gap-3">
        {/* Sidebar */}
        <div className="w-[100px] shrink-0 space-y-1.5 hidden sm:block">
          {["Tableau de bord", "Produits", "Ventes", "Clients"].map((item, i) => (
            <div
              key={item}
              className={`rounded-md px-2 py-1.5 text-[9px] font-medium truncate ${
                i === 1 ? "bg-blue/10 text-blue" : "text-slate"
              }`}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-3">
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {["Upload", "Détails", "Publier"].map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                  i <= step ? "bg-blue text-blue-foreground" : "bg-slate-200 text-slate"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-[9px] font-medium ${i <= step ? "text-ink" : "text-slate"}`}>{s}</span>
                {i < 2 && <div className={`w-6 h-px ${i < step ? "bg-blue" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="rounded-lg border-2 border-dashed border-blue/30 bg-blue/5 p-4 text-center">
                  <Upload className="h-6 w-6 text-blue mx-auto mb-1.5" />
                  <p className="text-[10px] font-semibold text-ink">Glissez vos fichiers ici</p>
                  <p className="text-[8px] text-slate mt-0.5">PDF, ZIP, MP4, MP3… jusqu'à 500 MB</p>
                </div>
                <div className="mt-2 space-y-1.5">
                  {[
                    { name: "Formation_Marketing.pdf", size: "12.4 MB", progress: 100 },
                    { name: "Templates_Pro.zip", size: "45.2 MB", progress: 78 },
                  ].map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-center gap-2 rounded-md border border-hair bg-slate-50 p-2"
                    >
                      <FileText className="h-3.5 w-3.5 text-blue shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-semibold text-ink truncate">{f.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${f.progress}%` }}
                              transition={{ duration: 1.5, delay: i * 0.3 }}
                              className="h-full bg-blue rounded-full"
                            />
                          </div>
                          <span className="text-[8px] text-slate">{f.size}</span>
                        </div>
                      </div>
                      {f.progress === 100 && <CheckCircle className="h-3 w-3 text-blue shrink-0" />}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-semibold text-ink">Titre du produit</label>
                  <div className="rounded-md border border-hair bg-white px-2.5 py-1.5 text-[10px] text-ink">
                    Formation Marketing Digital Complète
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-ink">Prix</label>
                    <div className="rounded-md border border-hair bg-white px-2.5 py-1.5 text-[10px] font-bold text-blue">
                      15 000 FCFA
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-ink">Prix barré</label>
                    <div className="rounded-md border border-hair bg-white px-2.5 py-1.5 text-[10px] text-slate line-through">
                      25 000 FCFA
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-ink">Description</label>
                  <div className="rounded-md border border-hair bg-white px-2.5 py-2 text-[9px] text-slate leading-relaxed h-12">
                    Apprenez les stratégies marketing les plus efficaces pour développer votre audience...
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="publish" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                <div className="rounded-lg bg-blue/5 border border-blue/20 p-3 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <CheckCircle className="h-8 w-8 text-blue mx-auto mb-1.5" />
                  </motion.div>
                  <p className="text-xs font-bold text-ink">Produit publié ! 🎉</p>
                  <p className="text-[9px] text-slate mt-0.5">Votre fichier est maintenant en vente</p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Vues", value: "0", icon: Eye },
                    { label: "Ventes", value: "0", icon: DollarSign },
                    { label: "Revenus", value: "0 F", icon: TrendingUp },
                  ].map((s) => (
                    <div key={s.label} className="rounded-md border border-hair bg-slate-50 p-2 text-center">
                      <s.icon className="h-3 w-3 text-blue mx-auto mb-0.5" />
                      <p className="text-[10px] font-bold text-ink">{s.value}</p>
                      <p className="text-[7px] text-slate">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────── COURS ─────────────────────── */
const CoursesMockup = () => {
  const [activeLesson, setActiveLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveLesson((s) => (s + 1) % 4);
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const lessons = [
    { title: "Introduction au marketing", duration: "12:30", completed: true },
    { title: "Stratégie de contenu", duration: "28:15", completed: true },
    { title: "Publicités Facebook Ads", duration: "18:45", completed: false },
    { title: "Analyse des résultats", duration: "22:00", completed: false },
  ];

  return (
    <div className="space-y-3">
      {/* Video player mockup */}
      <div className="rounded-lg bg-foreground/90 aspect-video relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={isPlaying ? { scale: [1, 1.2, 0], opacity: [1, 0.8, 0] } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-10 w-10 rounded-full bg-blue/90 flex items-center justify-center cursor-pointer"
          >
            <Play className="h-4 w-4 text-blue-foreground ml-0.5" />
          </motion.div>
        </div>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/30">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: isPlaying ? "35%" : "0%" }}
            transition={{ duration: 2 }}
            className="h-full bg-blue"
          />
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <span className="text-[8px] text-white/70">
            {lessons[activeLesson]?.title}
          </span>
          <span className="text-[8px] text-white/70">{lessons[activeLesson]?.duration}</span>
        </div>
      </div>

      {/* Lesson list with drag handles */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-ink">Modules • 4 leçons</p>
          <span className="text-[8px] text-blue font-semibold">50% complété</span>
        </div>
        {lessons.map((lesson, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-center gap-2 rounded-md border p-2 cursor-pointer transition-all ${
              i === activeLesson
                ? "border-blue bg-blue/5"
                : "border-hair bg-slate-50 hover:border-blue/20"
            }`}
            onClick={() => setActiveLesson(i)}
          >
            <GripVertical className="h-3 w-3 text-slate/40 shrink-0" />
            <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
              lesson.completed
                ? "bg-blue text-blue-foreground"
                : i === activeLesson
                  ? "bg-blue/20 text-blue"
                  : "bg-slate-200 text-slate"
            }`}>
              {lesson.completed ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <span className="text-[8px] font-bold">{i + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-semibold text-ink truncate">{lesson.title}</p>
              <p className="text-[8px] text-slate flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" /> {lesson.duration}
              </p>
            </div>
            {i === activeLesson && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="h-1.5 w-1.5 rounded-full bg-blue"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────── LICENCES ─────────────────────── */
const LicensesMockup = () => {
  const [generatingKey, setGeneratingKey] = useState(false);
  const [keys, setKeys] = useState([
    { key: "ECRV-A8KF-29DX-MN47", status: "active", activations: 2, max: 5, device: "MacBook Pro" },
    { key: "ECRV-B3LP-71QZ-WT82", status: "active", activations: 1, max: 3, device: "iPhone 15" },
    { key: "ECRV-C6RS-04HJ-YU19", status: "expired", activations: 3, max: 3, device: "Windows PC" },
  ]);

  useEffect(() => {
    const t = setInterval(() => {
      setGeneratingKey(true);
      setTimeout(() => setGeneratingKey(false), 2000);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: "Licences actives", value: "24", trend: "+3", icon: Key },
          { label: "Activations", value: "67/120", trend: "56%", icon: Monitor },
          { label: "Revenus", value: "360K", trend: "+12%", icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-hair bg-slate-50 p-2">
            <div className="flex items-center gap-1 mb-1">
              <s.icon className="h-2.5 w-2.5 text-blue" />
              <span className="text-[7px] text-slate">{s.label}</span>
            </div>
            <p className="text-[11px] font-extrabold text-ink">{s.value}</p>
            <span className="text-[8px] font-semibold text-blue">{s.trend}</span>
          </div>
        ))}
      </div>

      {/* License keys table */}
      <div className="rounded-lg border border-hair overflow-hidden">
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-secondary/50 border-b border-hair">
          <span className="text-[9px] font-bold text-ink">Clés de licence</span>
          <motion.button
            animate={generatingKey ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: generatingKey ? Infinity : 0, ease: "linear" }}
            className="flex items-center gap-1 text-[8px] font-semibold text-blue"
          >
            <RefreshCw className="h-2.5 w-2.5" />
            {generatingKey ? "Génération..." : "Nouvelle clé"}
          </motion.button>
        </div>

        <div className="divide-y divide-border">
          {keys.map((license, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 px-2.5 py-2 bg-slate-50 hover:bg-secondary/30 transition-colors"
            >
              <Lock className={`h-3 w-3 shrink-0 ${
                license.status === "active" ? "text-blue" : "text-slate"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-mono font-bold text-ink truncate">{license.key}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${
                    license.status === "active"
                      ? "bg-blue/10 text-blue"
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {license.status === "active" ? "Active" : "Expirée"}
                  </span>
                  <span className="text-[7px] text-slate flex items-center gap-0.5">
                    <Monitor className="h-2 w-2" /> {license.activations}/{license.max}
                  </span>
                  <span className="text-[7px] text-slate">{license.device}</span>
                </div>
              </div>
              <Copy className="h-3 w-3 text-slate hover:text-blue cursor-pointer shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Activation animation */}
      <AnimatePresence>
        {generatingKey && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="rounded-md border border-blue/30 bg-blue/5 p-2.5 flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="h-3.5 w-3.5 text-blue" />
            </motion.div>
            <div>
              <p className="text-[9px] font-bold text-blue">Nouvelle licence générée !</p>
              <p className="text-[8px] font-mono text-ink">ECRV-D9WK-53BN-PL06</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const mockupComponents: Record<string, React.FC> = {
  files: FilesMockup,
  courses: CoursesMockup,
  licenses: LicensesMockup,
};

const tabDescriptions = {
  files: {
    title: "Vendez vos fichiers digitaux instantanément",
    description: "Uploadez vos e-books, PDFs, templates et fichiers audio/vidéo. Suivez les ventes depuis votre dashboard et gérez la livraison automatique.",
  },
  courses: {
    title: "Créez des formations professionnelles",
    description: "Organisez vos leçons par glisser-déposer, intégrez des vidéos YouTube/Vimeo, et suivez la progression de vos élèves en temps réel.",
  },
  licenses: {
    title: "Vendez des licences logicielles",
    description: "Génération automatique de clés uniques, gestion des activations par appareil, suivi en temps réel et révocation instantanée.",
  },
};

const ProductShowcase = () => {
  const [active, setActive] = useState(0);
  const currentTab = tabs[active];
  const desc = tabDescriptions[currentTab.id as keyof typeof tabDescriptions];
  const MockupComponent = mockupComponents[currentTab.id];

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-[10px] font-mono text-slate mb-3 uppercase tracking-wider">Produits</p>
          <h2 className="text-3xl md:text-5xl font-serif text-ink mb-4 tracking-tight font-normal leading-[1.1]">
            Vendez vos produits digitaux instantanément
          </h2>
          <p className="text-slate text-lg max-w-2xl mx-auto">
            Uploadez vos contenus, fixez vos prix. Dukaio gère les paiements, la livraison et vos clients.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                active === i
                  ? "bg-blue text-blue-foreground shadow-lg shadow-primary/25"
                  : "bg-slate-50 border border-hair text-ink hover:border-blue/30"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            <div className="rounded-2xl border border-hair bg-slate-50 shadow-2xl overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-hair px-4 py-3 bg-secondary/50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-blueTint/60" />
                  <div className="h-3 w-3 rounded-full bg-blue/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="rounded-md bg-white border border-hair px-4 py-1.5 text-xs text-slate text-center">
                    dashboard.dukaio.com/{currentTab.id === "files" ? "products/create" : currentTab.id === "courses" ? "products/lessons" : currentTab.id === "licenses" ? "licenses" : "products/bundle"}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-0">
                {/* Left: description */}
                <div className="p-8 md:p-10 flex flex-col justify-center border-r border-hair">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue/10">
                    <currentTab.icon className="h-6 w-6 text-blue" />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl text-ink font-medium mb-3 tracking-tight">
                    {desc.title}
                  </h3>
                  <p className="text-sm text-slate leading-relaxed mb-6">
                    {desc.description}
                  </p>
                  <a href="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-blue hover:underline">
                    Commencer maintenant →
                  </a>
                </div>

                {/* Right: animated mockup */}
                <div className="p-5 md:p-6 bg-white/50 overflow-hidden">
                  <MockupComponent />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProductShowcase;
