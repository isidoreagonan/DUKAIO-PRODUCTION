import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Video, Users, PlayCircle, CheckCircle2, Menu, Globe, Zap, ShieldCheck, CreditCard, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FAQ } from "@/components/marketing/FAQ";
import SEOHead from "@/components/SEOHead";

export default function Cours() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-white text-ink font-sans selection:bg-purple-200 selection:text-purple-900 overflow-x-hidden">
      <SEOHead 
        title="Vendre des formations vidéo" 
        description="Hébergez et vendez vos vidéos de formation facilement. Dukaio gère les paiements et sécurise l'accès à vos vidéos." 
        canonicalPath="/cours" 
      />
      <Navbar />

      <main className="pt-24 md:pt-32">
        {/* 1. HERO SECTION */}
        <section className="text-center mb-20">
          <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 mb-8 border border-purple-100"
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase">Dukaio Formations</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-ink tracking-tight leading-[1.05] mb-6"
            >
              Vendez vos <span className="font-serif italic text-purple-600">Formations Vidéo</span> Simplement.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate max-w-2xl mx-auto leading-relaxed font-sans mb-10"
            >
              Uploadez vos vidéos, fixez votre prix et commencez à vendre. Dukaio protège votre contenu et gère les paiements Mobile Money et Cartes Bancaires.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Créer une boutique gratuite
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          {/* Hero Mockup: Simple Course Upload Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-20 w-full max-w-[1400px] mx-auto relative px-4 sm:px-6 lg:px-8"
          >
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-[2rem] shadow-2xl flex overflow-hidden h-[400px] sm:h-[600px] text-left">
              {/* Sidebar */}
              <div className="w-16 sm:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col">
                <div className="h-16 flex items-center justify-center sm:justify-start px-4 sm:px-6 border-b border-slate-100">
                  <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">D</div>
                  <span className="ml-3 font-bold text-ink hidden sm:block">Dukaio</span>
                </div>
                <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
                  <div className="p-2 sm:px-4 sm:py-2.5 text-slate-500 rounded-lg flex items-center justify-center sm:justify-start">
                    <Zap className="w-5 h-5 shrink-0" />
                    <span className="ml-3 font-medium text-sm hidden sm:block">Tableau de bord</span>
                  </div>
                  <div className="p-2 sm:px-4 sm:py-2.5 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center sm:justify-start">
                    <Video className="w-5 h-5 shrink-0" />
                    <span className="ml-3 font-medium text-sm hidden sm:block">Produits</span>
                  </div>
                  <div className="p-2 sm:px-4 sm:py-2.5 text-slate-500 rounded-lg flex items-center justify-center sm:justify-start">
                    <CreditCard className="w-5 h-5 shrink-0" />
                    <span className="ml-3 font-medium text-sm hidden sm:block">Ventes</span>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 bg-white p-6 sm:p-10 overflow-hidden flex flex-col">
                <div className="max-w-3xl mx-auto w-full">
                  <h2 className="text-2xl font-bold text-ink mb-6">Ajouter des vidéos</h2>
                  
                  <div className="border-2 border-dashed border-purple-200 bg-purple-50 rounded-xl p-10 flex flex-col items-center justify-center text-center mb-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                       <Play className="w-8 h-8 text-purple-500 ml-1" />
                    </div>
                    <p className="font-bold text-ink mb-1">Uploadez vos vidéos de formation</p>
                    <p className="text-sm text-slate mb-4">Formats acceptés : MP4, MOV. Taille max : 5GB par vidéo.</p>
                    <button className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold">Parcourir les fichiers</button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-ink text-sm">Vidéos importées (2)</h3>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-slate-900 rounded flex items-center justify-center text-white">
                          <PlayCircle className="w-6 h-6 opacity-50" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-ink">1. Les bases du business</p>
                          <p className="text-xs text-slate">MP4 • 125 MB</p>
                        </div>
                      </div>
                      <div className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">Terminé</div>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-slate-900 rounded flex items-center justify-center text-white">
                          <PlayCircle className="w-6 h-6 opacity-50" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-ink">2. La stratégie de vente</p>
                          <p className="text-xs text-slate">MP4 • 342 MB</p>
                        </div>
                      </div>
                      <div className="text-blue-500 text-xs font-bold bg-blue-50 px-2 py-1 rounded">Téléversement 85%...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 2. STATS BAR */}
        <section className="border-y border-hair bg-white py-10 mb-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-hair">
            {[
              { value: "+5 000", label: "FORMATEURS" },
              { value: "0%", label: "FRAIS FIXES" },
              { value: "Instant", label: "ACCÈS VIDÉO" },
              { value: "Sécurisé", label: "ANTI-TÉLÉCHARGEMENT" }
            ].map((stat, i) => (
              <div key={i} className="text-center px-4">
                <p className="font-serif text-3xl text-ink mb-1">{stat.value}</p>
                <p className="font-sans text-xs font-medium text-slate uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. ZIG-ZAG SECTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-32">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl sm:text-5xl font-normal text-ink tracking-tight mb-4">
              La façon la plus simple <br className="hidden sm:inline" />
              de vendre des vidéos
            </h2>
          </div>

          <div className="space-y-24 md:space-y-32">
            {/* Block 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6">
                <h3 className="font-serif text-3xl font-medium text-ink">Importez et organisez vos vidéos</h3>
                <p className="text-slate text-lg leading-relaxed">
                  Pas besoin de compétences techniques ni de plateformes complexes. Hébergez directement vos vidéos sur Dukaio. Renommez-les et organisez-les dans l'ordre que vous souhaitez.
                </p>
                <ul className="space-y-3 pt-2">
                  {["Upload ultra-rapide", "Hébergement vidéo sécurisé inclus", "Organisation simple par liste"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-ink font-medium">
                      <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center">
                        <Video className="w-3 h-3 text-purple-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full relative group">
                <div className="absolute inset-0 bg-purple-100 rounded-3xl transform lg:translate-x-6 lg:translate-y-6 -z-10 transition-transform group-hover:translate-x-0 group-hover:translate-y-0"></div>
                {/* Mockup: Simple Video List */}
                <div className="w-full bg-white border border-slate-100 rounded-2xl p-6 shadow-xl relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-ink">Contenu de la formation</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <div className="p-3 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Play className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-bold text-purple-900">Vidéo 1 : Introduction</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white flex items-center justify-between border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Play className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">Vidéo 2 : Le Mindset</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Play className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">Vidéo 3 : La Stratégie Finale</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 2 */}
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 w-full relative group">
                <div className="absolute inset-0 bg-blue-100 rounded-[2.5rem] transform lg:-translate-x-6 lg:translate-y-6 -z-10 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0"></div>
                {/* Mockup: Video Player */}
                <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative z-10 text-white border border-slate-800">
                  <div className="aspect-video relative bg-black flex items-center justify-center group/video">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <PlayCircle className="w-16 h-16 text-white/90 hover:text-white hover:scale-110 transition-transform cursor-pointer z-10" />
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover/video:opacity-100 transition-opacity">
                      <div className="h-1 bg-white/30 rounded-full mb-3 cursor-pointer">
                        <div className="h-full bg-blue-500 w-1/3 rounded-full relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs font-medium">
                        <div className="flex gap-4">
                          <span>04:12 / 12:30</span>
                        </div>
                        <div className="flex gap-4">
                          <span>1080p</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-900">
                    <h4 className="font-bold text-lg mb-1">Vidéo 1 : Introduction au Business</h4>
                    <p className="text-sm text-slate-400 mb-4">Formation E-commerce Pro</p>
                    <div className="flex flex-col space-y-2">
                       <div className="bg-slate-800 p-3 rounded-lg flex items-center justify-between opacity-50">
                         <span className="text-sm">Vidéo précédente</span>
                       </div>
                       <div className="bg-blue-600 p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-blue-500 transition-colors">
                         <span className="text-sm font-semibold">Vidéo suivante</span>
                         <ArrowRight className="w-4 h-4" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <h3 className="font-serif text-3xl font-medium text-ink">Un lecteur vidéo privé et sécurisé</h3>
                <p className="text-slate text-lg leading-relaxed">
                  Vos clients accèdent à leurs vidéos sur une interface épurée et professionnelle. Pas de distractions, pas de publicités, juste votre contenu en haute qualité.
                </p>
                <ul className="space-y-3 pt-2">
                  {["Visionnage fluide (1080p)", "Interface moderne sans publicité", "Protection contre le téléchargement illégal"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-ink font-medium">
                      <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Block 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6">
                <h3 className="font-serif text-3xl font-medium text-ink">Acceptez des paiements mondiaux</h3>
                <p className="text-slate text-lg leading-relaxed">
                  Ne limitez plus vos ventes. Dukaio encaisse vos clients via Mobile Money en Afrique et par Carte Bancaire à l'international, puis leur donne accès instantanément à la formation.
                </p>
                <ul className="space-y-3 pt-2">
                  {["Mobile Money & Cartes bancaires", "Accès débloqué automatiquement après achat", "Vos revenus disponibles immédiatement"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-ink font-medium">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Globe className="w-3 h-3 text-emerald-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full relative group">
                <div className="absolute inset-0 bg-emerald-100 rounded-3xl transform lg:translate-x-6 lg:translate-y-6 -z-10 transition-transform group-hover:translate-x-0 group-hover:translate-y-0"></div>
                {/* Mockup: Success Payment */}
                <div className="w-full bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xl relative z-10 text-center">
                   <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                     <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                   </div>
                   <h3 className="font-bold text-xl text-ink mb-1">Paiement Réussi !</h3>
                   <p className="text-sm text-slate mb-6">Transaction Mobile Money validée.</p>
                   
                   <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6">
                     <p className="font-bold text-ink">Formation E-commerce Pro</p>
                     <p className="text-sm text-slate">Accès illimité aux vidéos</p>
                   </div>

                   <button className="w-full py-3 bg-ink text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                     Commencer à regarder
                   </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FEATURES GRID */}
        <section className="bg-slate-50 border-y border-hair py-24 mb-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-4">Tout pour vendre vos vidéos</h2>
              <p className="text-slate max-w-2xl mx-auto">Des outils simples et efficaces, sans la complexité des plateformes de cours lourdes.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Video, title: "Hébergement inclus", desc: "Plus besoin de payer des abonnements vidéo externes. Hébergez vos MP4 directement sur Dukaio." },
                { icon: Globe, title: "Paiements sans frontières", desc: "Acceptez les paiements par Wave, Orange Money, MTN, et Cartes Bancaires." },
                { icon: ShieldCheck, title: "Contenu protégé", desc: "Vos vidéos sont protégées. Seuls vos acheteurs peuvent y accéder via un lien sécurisé." },
                { icon: Users, title: "Espace visionnage", desc: "Vos clients accèdent à une page claire pour regarder vos vidéos, l'une après l'autre." },
                { icon: Zap, title: "Livraison instantanée", desc: "Dès que le client paie, il reçoit un email avec son lien d'accès unique." },
                { icon: CreditCard, title: "Paiements directs", desc: "Pas de retenue d'argent prolongée. Recevez vos gains directement sur votre compte." }
              ].map((f, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-ink mb-2">{f.title}</h4>
                  <p className="text-sm text-slate leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-10">
              <h2 className="font-serif text-4xl sm:text-5xl font-medium text-ink">Comment ça marche ?</h2>
              
              <div className="space-y-8">
                {[
                  { step: "1", title: "Uploadez vos vidéos", desc: "Glissez vos vidéos depuis votre ordinateur vers Dukaio. Elles sont hébergées instantanément." },
                  { step: "2", title: "Ajoutez un prix", desc: "Définissez à combien vous souhaitez vendre l'accès à vos vidéos." },
                  { step: "3", title: "Partagez et encaissez", desc: "Partagez votre lien de vente. Vos clients paient et accèdent aux vidéos, vous touchez l'argent." },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveStep(i)}
                    className={`flex gap-4 cursor-pointer transition-all duration-300 p-4 rounded-xl hover:bg-slate-50 ${activeStep === i ? 'bg-slate-50 border border-purple-100 shadow-sm' : 'opacity-60'}`}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors ${activeStep === i ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {item.step}
                    </div>
                    <div>
                      <h4 className={`font-sans font-bold text-xl mb-2 transition-colors ${activeStep === i ? 'text-purple-600' : 'text-ink'}`}>{item.title}</h4>
                      <p className="text-slate leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full">
              {/* Interactive Mockups based on active step */}
              {activeStep === 0 && (
                <div className="aspect-[4/3] w-full max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-2xl shadow-lg relative overflow-hidden flex flex-col">
                   <div className="bg-white border-b border-slate-100 p-3 font-bold text-sm">Gestion des vidéos</div>
                   <div className="p-4 space-y-3 flex-1 flex flex-col justify-center">
                     <div className="border-2 border-dashed border-purple-300 bg-purple-50 rounded-xl flex-1 flex flex-col items-center justify-center text-purple-600">
                        <Video className="w-10 h-10 mb-2 opacity-80" />
                        <span className="text-sm font-medium">Glissez vos vidéos MP4 ici</span>
                     </div>
                   </div>
                </div>
              )}
              {activeStep === 1 && (
                <div className="aspect-[4/3] w-full max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-2xl shadow-lg relative overflow-hidden flex flex-col">
                   <div className="bg-white border-b border-slate-100 p-3 font-bold text-sm">Tarification</div>
                   <div className="p-4 flex-1 flex flex-col items-center justify-center">
                     <div className="w-full max-w-xs bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Prix d'accès</label>
                        <div className="relative">
                          <input type="text" value="25 000" readOnly className="w-full p-3 font-bold text-lg border border-slate-200 rounded-lg bg-slate-50 text-right pr-12" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">FCFA</span>
                        </div>
                     </div>
                   </div>
                </div>
              )}
              {activeStep === 2 && (
                <div className="aspect-[4/3] w-full max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-2xl shadow-lg relative overflow-hidden flex flex-col">
                   <div className="bg-white border-b border-slate-100 p-3 font-bold text-sm">Prêt à vendre</div>
                   <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                     <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                       <Zap className="w-8 h-8" />
                     </div>
                     <h4 className="font-bold text-lg mb-1">C'est en ligne !</h4>
                     <div className="mt-4 flex items-center justify-between w-full bg-white border border-slate-200 p-2 rounded-lg">
                       <span className="text-xs text-slate-500 truncate ml-2">dukaio.com/p/formation-video</span>
                       <button className="bg-purple-600 text-white px-3 py-1.5 rounded text-xs font-bold">Copier</button>
                     </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
