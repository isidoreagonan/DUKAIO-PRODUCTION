import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Store, Paintbrush, FileText, Hash, Phone,
  ArrowRight, ArrowLeft, Check, Sparkles, Rocket,
} from "lucide-react";

const BRAND_COLORS = [
  { name: "Indigo", value: "#6366F1" },
  { name: "Bleu", value: "#3B82F6" },
  { name: "Émeraude", value: "#10B981" },
  { name: "Orange", value: "#F97316" },
  { name: "Rose", value: "#EC4899" },
  { name: "Jaune", value: "#EAB308" },
  { name: "Rouge", value: "#EF4444" },
  { name: "Violet", value: "#8B5CF6" },
];

const STEPS = [
  { icon: Store, title: "Nom de votre boutique", subtitle: "Comment vos clients vont vous connaître" },
  { icon: Paintbrush, title: "Couleur de votre marque", subtitle: "Choisissez la couleur qui représente votre marque" },
  { icon: FileText, title: "Décrivez votre boutique", subtitle: "Une brève description de ce que vous proposez" },
  { icon: Hash, title: "Mots-clés", subtitle: "Aidez les clients à vous trouver plus facilement" },
  { icon: Phone, title: "Votre WhatsApp", subtitle: "Pour que vos clients puissent vous contacter" },
];

const Onboarding = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form data
  const [storeName, setStoreName] = useState("");
  const [brandColor, setBrandColor] = useState("#6366F1");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const canNext = () => {
    switch (step) {
      case 0: return storeName.trim().length >= 2;
      case 1: return !!brandColor;
      case 2: return description.trim().length >= 5;
      case 3: return true; // optional
      case 4: return true; // optional
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleFinish();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    const slug = storeName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const { error } = await supabase.from("profiles").update({
      display_name: storeName.trim(),
      store_slug: slug,
      store_brand_color: brandColor,
      store_description: description.trim(),
      store_keywords: keywords.trim() || null,
      contact: whatsapp.trim() || null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    } as any).eq("id", user.id);

    setSaving(false);

    if (error) {
      if (error.message.includes("unique")) {
        toast.error("Ce nom de boutique est déjà pris, essayez un autre");
      } else {
        toast.error("Erreur lors de la configuration");
      }
      return;
    }

    toast.success("Votre boutique est prête ! 🎉");
    await refreshProfile();
    navigate("/dashboard");
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const StepIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-secondary">
        <motion.div
          className="h-full"
          style={{ backgroundColor: brandColor }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: brandColor }}>
            <span className="text-xs font-extrabold text-white">E</span>
          </div>
          <span className="text-sm font-bold text-foreground">Dukaio</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Étape {step + 1} sur {STEPS.length}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step header */}
              <div className="text-center mb-8">
                <div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
                  style={{ backgroundColor: `${brandColor}15` }}
                >
                  <StepIcon className="h-7 w-7" style={{ color: brandColor }} />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-1">{STEPS[step].title}</h1>
                <p className="text-sm text-muted-foreground">{STEPS[step].subtitle}</p>
              </div>

              {/* Step content */}
              <div className="space-y-4">
                {step === 0 && (
                  <div className="space-y-3">
                    <Input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Ex: Digital Store, Tech Academy..."
                      className="text-center text-lg h-14"
                      maxLength={50}
                      autoFocus
                    />
                    {storeName.trim() && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-center text-muted-foreground"
                      >
                        Votre boutique sera accessible à :{" "}
                        <span className="font-medium" style={{ color: brandColor }}>
                          {window.location.origin}/store/{storeName.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")}
                        </span>
                      </motion.p>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {BRAND_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setBrandColor(c.value)}
                          className={cn(
                            "h-12 w-12 rounded-full transition-all ring-2 ring-offset-2 ring-offset-background",
                            brandColor === c.value ? "ring-foreground scale-110" : "ring-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        >
                          {brandColor === c.value && (
                            <Check className="h-5 w-5 text-white mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-muted-foreground">Couleur personnalisée :</span>
                      <label className="h-8 w-8 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors overflow-hidden">
                        <div className="h-full w-full rounded-full" style={{ backgroundColor: brandColor }} />
                        <input
                          type="color"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-2">
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: Découvrez nos formations et outils numériques pour booster votre business en ligne..."
                      className="min-h-[120px] text-center"
                      maxLength={200}
                      autoFocus
                    />
                    <p className="text-xs text-right text-muted-foreground">{description.length}/200</p>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <Input
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="Ex: formation, marketing digital, ebook, design..."
                      className="text-center h-14"
                      maxLength={150}
                      autoFocus
                    />
                    <p className="text-xs text-center text-muted-foreground">
                      Séparez les mots-clés par des virgules (optionnel)
                    </p>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-3">
                    <Input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Ex: +229 97 00 00 00"
                      className="text-center h-14"
                      maxLength={20}
                      autoFocus
                    />
                    <p className="text-xs text-center text-muted-foreground">
                      Vos clients pourront vous contacter via WhatsApp (optionnel)
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canNext() || saving}
              className="gap-2 text-white min-w-[160px]"
              style={{ backgroundColor: brandColor }}
            >
              {saving ? (
                "Configuration..."
              ) : step === STEPS.length - 1 ? (
                <>
                  <Rocket className="h-4 w-4" />
                  Lancer ma boutique
                </>
              ) : (
                <>
                  Continuer
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
