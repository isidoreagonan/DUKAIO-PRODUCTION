import { useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, Copy, GripVertical, ImagePlus, Info, Package, Trash2 } from "lucide-react";
import {
  accentOptions,
  backgroundOptions,
  fontOptions,
  getShopTheme,
  moveSection,
  reorderSections,
  type SectionId,
  type ShopConfig,
} from "@/lib/shopConfig";

export type EditorPanelId = "content" | "hero" | "products" | "appearance" | "sections" | "seo";

interface PanelProps {
  config: ShopConfig;
  onChange: (config: ShopConfig) => void;
  onNavigate: (panel: EditorPanelId) => void;
}

export const panelTitles: Record<EditorPanelId, { title: string; description: string }> = {
  content: { title: "Ma boutique", description: "Les informations essentielles que vos clients verront." },
  hero: { title: "Bandeau d’accueil", description: "Personnalisez le premier élément visible de votre boutique." },
  products: { title: "Produits", description: "Choisissez les informations et outils affichés sur votre catalogue." },
  appearance: { title: "Apparence", description: "Une identité cohérente, appliquée instantanément à toute la boutique." },
  sections: { title: "Sections", description: "Affichez, masquez et réorganisez le contenu de votre page." },
  seo: { title: "Référencement & réseaux", description: "Préparez le partage de votre boutique et vos liens externes." },
};

export function EditorCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <h2 className="text-sm font-semibold tracking-[-0.01em]">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-5 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] leading-4 text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputClassName =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-2 focus:ring-foreground/5";
export const textareaClassName =
  "min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-2 focus:ring-foreground/5";

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
        checked ? "border-foreground bg-foreground" : "border-input bg-muted"
      }`}
    >
      <span
        className={`absolute left-[2px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-background transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0 last:pb-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function ChoiceButton({
  selected,
  onClick,
  children,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={`relative min-w-0 rounded-lg border p-3 text-left transition-colors ${
        selected ? "border-foreground bg-secondary" : "border-border bg-background hover:border-muted-foreground/50"
      }`}
    >
      {selected && (
        <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-foreground text-background">
          <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
        </span>
      )}
      {children}
    </button>
  );
}

function ContentPanel({ config, onChange }: PanelProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState("");

  function copyAddress() {
    void navigator.clipboard?.writeText(`dukaio.com/${config.slug}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function readLogo(file?: File) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Choisissez une image de moins de 2 Mo.");
      return;
    }
    setImageError("");
    const reader = new FileReader();
    reader.onload = () => onChange({ ...config, logo: String(reader.result) });
    reader.readAsDataURL(file);
  }

  return (
    <>
      <EditorCard title="Adresse de la boutique" description="Une adresse courte, facile à retenir et à partager.">
        <Field label="Adresse publique" hint="Utilisez des lettres minuscules, des chiffres ou des tirets.">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <div className="flex h-10 min-w-0 items-center rounded-lg border border-input bg-background focus-within:border-foreground">
              <span className="hidden shrink-0 pl-3 text-sm text-muted-foreground sm:inline">dukaio.com/</span>
              <input
                aria-label="Nom de l’adresse publique"
                value={config.slug}
                onChange={(event) =>
                  onChange({
                    ...config,
                    slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  })
                }
                className="h-full w-full min-w-0 bg-transparent px-3 text-sm outline-none"
              />
            </div>
            <button
              type="button"
              onClick={copyAddress}
              className="flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-muted"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copié" : "Copier"}</span>
            </button>
          </div>
        </Field>
      </EditorCard>

      <EditorCard title="Présentation" description="Ces informations identifient votre boutique auprès des clients.">
        <Field label="Logo" hint="Format carré recommandé, 512 × 512 pixels, 2 Mo maximum.">
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-muted font-display text-lg font-semibold">
              {config.logo ? (
                <img src={config.logo} alt="Logo actuel" className="h-full w-full object-cover" />
              ) : (
                config.name.charAt(0) || "D"
              )}
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => readLogo(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted"
            >
              <ImagePlus className="h-4 w-4" /> Choisir un logo
            </button>
            {config.logo && (
              <button
                type="button"
                aria-label="Supprimer le logo"
                onClick={() => onChange({ ...config, logo: null })}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {imageError && <span className="mt-2 block text-xs text-destructive">{imageError}</span>}
        </Field>
        <Field label="Nom de la boutique">
          <input
            value={config.name}
            maxLength={40}
            onChange={(event) => onChange({ ...config, name: event.target.value })}
            className={inputClassName}
          />
        </Field>
        <Field label="Quelques mots sur vous" hint={`${config.description.length}/160 caractères.`}>
          <textarea
            value={config.description}
            maxLength={160}
            onChange={(event) => onChange({ ...config, description: event.target.value })}
            className={textareaClassName}
          />
        </Field>
        <Field label="Numéro WhatsApp" hint="Format international recommandé, par exemple +225 07 00 00 00 00.">
          <input
            value={config.whatsapp}
            onChange={(event) => onChange({ ...config, whatsapp: event.target.value })}
            className={inputClassName}
          />
        </Field>
      </EditorCard>

      <EditorCard title="Suivre la boutique" description="Le formulaire affiché dans la section d’inscription à vos nouveautés.">
        <Field label="Titre">
          <input
            value={config.newsletter.title}
            maxLength={60}
            onChange={(event) =>
              onChange({ ...config, newsletter: { ...config.newsletter, title: event.target.value } })
            }
            className={inputClassName}
          />
        </Field>
        <Field label="Description">
          <textarea
            value={config.newsletter.description}
            maxLength={220}
            onChange={(event) =>
              onChange({ ...config, newsletter: { ...config.newsletter, description: event.target.value } })
            }
            className={textareaClassName}
          />
        </Field>
        <Field label="Texte du bouton">
          <input
            value={config.newsletter.buttonLabel}
            maxLength={24}
            onChange={(event) =>
              onChange({ ...config, newsletter: { ...config.newsletter, buttonLabel: event.target.value } })
            }
            className={inputClassName}
          />
        </Field>
      </EditorCard>
    </>
  );
}

function HeroPanel({ config, onChange }: PanelProps) {
  return (
    <EditorCard
      title="Contenu du bandeau"
      description="Un bandeau volontairement court pour laisser rapidement place à vos produits."
    >
      <Field label="Nom affiché" hint="Les deux dernières lettres reprennent automatiquement votre couleur d’accent.">
        <input
          value={config.hero.title}
          maxLength={30}
          onChange={(event) => onChange({ ...config, hero: { ...config.hero, title: event.target.value } })}
          className={inputClassName}
        />
      </Field>
      <div>
        <span className="mb-2 block text-xs font-semibold">Hauteur du bandeau</span>
        <div className="grid grid-cols-2 gap-3">
          <ChoiceButton
            label="Bandeau compact"
            selected={config.hero.height === "compact"}
            onClick={() => onChange({ ...config, hero: { ...config.hero, height: "compact" } })}
          >
            <div className="flex h-12 items-center rounded-md bg-slate-900 px-3 text-white">
              <span className="h-2 w-16 rounded-full bg-white/70" />
            </div>
            <span className="mt-2 block text-xs font-medium">Compact</span>
          </ChoiceButton>
          <ChoiceButton
            label="Bandeau standard"
            selected={config.hero.height === "regular"}
            onClick={() => onChange({ ...config, hero: { ...config.hero, height: "regular" } })}
          >
            <div className="flex h-16 items-center rounded-md bg-slate-900 px-3 text-white">
              <span className="h-2 w-16 rounded-full bg-white/70" />
            </div>
            <span className="mt-2 block text-xs font-medium">Standard</span>
          </ChoiceButton>
        </div>
      </div>
      <div className="flex gap-2 rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" /> Le bandeau reste épuré : uniquement votre nom, sans texte secondaire ni badge.
      </div>
    </EditorCard>
  );
}

function ProductsPanel({ config, onChange }: PanelProps) {
  return (
    <>
      <EditorCard title="Titre du catalogue">
        <Field label="Titre de la section">
          <input
            value={config.products.title}
            maxLength={50}
            onChange={(event) =>
              onChange({ ...config, products: { ...config.products, title: event.target.value } })
            }
            className={inputClassName}
          />
        </Field>
      </EditorCard>
      <EditorCard title="Options d’affichage" description="Allégez la page ou donnez plus de repères à vos visiteurs.">
        <div>
          <ToggleRow
            label="Barre de recherche"
            description="Permettre de retrouver un produit par son nom."
            checked={config.products.search}
            onChange={(checked) =>
              onChange({ ...config, products: { ...config.products, search: checked } })
            }
          />
          <ToggleRow
            label="Filtres par catégorie"
            description="Afficher les catégories au-dessus du catalogue."
            checked={config.products.categories}
            onChange={(checked) =>
              onChange({ ...config, products: { ...config.products, categories: checked } })
            }
          />
          <ToggleRow
            label="Notes des produits"
            description="Montrer la note moyenne sur chaque fiche."
            checked={config.products.showRatings}
            onChange={(checked) =>
              onChange({ ...config, products: { ...config.products, showRatings: checked } })
            }
          />
          <ToggleRow
            label="Nombre de ventes"
            description="Afficher le volume de ventes à côté de la note."
            checked={config.products.showSales}
            onChange={(checked) =>
              onChange({ ...config, products: { ...config.products, showSales: checked } })
            }
          />
        </div>
      </EditorCard>
    </>
  );
}

function AppearancePanel({ config, onChange }: PanelProps) {
  const theme = getShopTheme(config);
  return (
    <>
      <EditorCard title="Typographie" description="Le style des titres et du texte est appliqué à toute la page.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {fontOptions.map((font) => (
            <ChoiceButton
              key={font.id}
              label={`Police ${font.name}`}
              selected={config.appearance.font === font.id}
              onClick={() =>
                onChange({ ...config, appearance: { ...config.appearance, font: font.id } })
              }
            >
              <span className="block pr-4 text-2xl leading-none" style={{ fontFamily: font.display }}>
                Aa
              </span>
              <span className="mt-3 block truncate text-[11px] text-muted-foreground">{font.name}</span>
            </ChoiceButton>
          ))}
        </div>
      </EditorCard>

      <EditorCard title="Couleurs" description="Des fonds doux et un accent net pour guider l’attention.">
        <div>
          <span className="mb-2 block text-xs font-semibold">Fond de la boutique</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {backgroundOptions.map((background) => (
              <ChoiceButton
                key={background.id}
                label={`Fond ${background.name}`}
                selected={config.appearance.background === background.id}
                onClick={() =>
                  onChange({
                    ...config,
                    appearance: { ...config.appearance, background: background.id },
                  })
                }
              >
                <span
                  className="flex h-10 items-center justify-center rounded-md border border-border"
                  style={{ backgroundColor: background.background }}
                >
                  <span
                    className="h-3 w-12 rounded-xs border border-black/5"
                    style={{ backgroundColor: background.surface }}
                  />
                  <span
                    className="ml-1 h-3 w-3 rounded-xs"
                    style={{ backgroundColor: background.hero }}
                  />
                </span>
                <span className="mt-2 block text-[11px] text-muted-foreground">{background.name}</span>
              </ChoiceButton>
            ))}
          </div>
        </div>

        <div className="pt-3">
          <span className="mb-2 block text-xs font-semibold">Couleur d’accent</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {accentOptions.map((accent) => (
              <button
                key={accent.id}
                type="button"
                aria-label={`Accent ${accent.name}`}
                aria-pressed={config.appearance.accent === accent.id}
                onClick={() =>
                  onChange({ ...config, appearance: { ...config.appearance, accent: accent.id } })
                }
                className={`flex min-w-0 flex-col items-center gap-2 rounded-lg border px-2 py-3 transition-colors ${
                  config.appearance.accent === accent.id
                    ? "border-foreground bg-secondary"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <span
                  className="grid h-6 w-6 place-items-center rounded-full"
                  style={{ backgroundColor: accent.color }}
                >
                  {config.appearance.accent === accent.id && (
                    <Check className="h-3.5 w-3.5" style={{ color: accent.foreground }} />
                  )}
                </span>
                <span className="w-full truncate text-[10px] text-muted-foreground">{accent.name}</span>
              </button>
            ))}
          </div>
        </div>
      </EditorCard>

      <EditorCard title="Formes & boutons">
        <div>
          <span className="mb-2 block text-xs font-semibold">Coins arrondis</span>
          <div className="grid grid-cols-4 gap-2">
            {([0, 8, 14, 20] as const).map((radius) => (
              <button
                key={radius}
                type="button"
                aria-pressed={config.appearance.radius === radius}
                onClick={() =>
                  onChange({ ...config, appearance: { ...config.appearance, radius } })
                }
                className={`flex h-16 flex-col items-center justify-center gap-2 rounded-lg border text-[11px] ${
                  config.appearance.radius === radius ? "border-foreground bg-secondary" : "border-border"
                }`}
              >
                <span
                  className="h-4 w-8 border-2 border-foreground"
                  style={{ borderRadius: Math.min(radius, 10) }}
                />
                {radius === 0 ? "Aucun" : radius === 8 ? "Petit" : radius === 14 ? "Moyen" : "Grand"}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3">
          <span className="mb-2 block text-xs font-semibold">Style des boutons produit</span>
          <div className="grid grid-cols-2 gap-3">
            <ChoiceButton
              label="Boutons contour"
              selected={config.appearance.buttons === "outline"}
              onClick={() =>
                onChange({ ...config, appearance: { ...config.appearance, buttons: "outline" } })
              }
            >
              <span className="flex h-9 items-center justify-center rounded-full border border-foreground text-xs font-semibold">
                Obtenir
              </span>
              <span className="mt-2 block text-center text-[11px] text-muted-foreground">Contour</span>
            </ChoiceButton>
            <ChoiceButton
              label="Boutons pleins"
              selected={config.appearance.buttons === "solid"}
              onClick={() =>
                onChange({ ...config, appearance: { ...config.appearance, buttons: "solid" } })
              }
            >
              <span
                className="flex h-9 items-center justify-center rounded-full text-xs font-semibold shadow-xs"
                style={{ backgroundColor: theme.accent.color, color: theme.accent.foreground }}
              >
                Obtenir
              </span>
              <span className="mt-2 block text-center text-[11px] text-muted-foreground">Plein</span>
            </ChoiceButton>
          </div>
        </div>
      </EditorCard>
    </>
  );
}

function SectionsPanel({ config, onChange, onNavigate }: PanelProps) {
  const [dragged, setDragged] = useState<SectionId | null>(null);
  const relatedPanel: Record<SectionId, EditorPanelId> = {
    hero: "hero",
    products: "products",
    newsletter: "content",
    about: "content",
  };

  return (
    <>
      <EditorCard
        title="Organisation de la page"
        description="Glissez une section ou utilisez les flèches. Les changements sont visibles immédiatement."
      >
        <div className="space-y-2">
          {config.sections.map((section, index) => (
            <div
              key={section.id}
              draggable
              onDragStart={() => setDragged(section.id)}
              onDragEnd={() => setDragged(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragged) onChange(reorderSections(config, dragged, section.id));
                setDragged(null);
              }}
              className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-background p-3 transition-colors ${
                dragged === section.id ? "border-foreground opacity-50" : "border-border"
              }`}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" aria-hidden="true" />
              <button
                type="button"
                onClick={() => onNavigate(relatedPanel[section.id])}
                className="min-w-0 text-left"
              >
                <span className="block truncate text-sm font-medium">{section.label}</span>
                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                  {section.description}
                </span>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <div className="hidden flex-col sm:flex">
                  <button
                    type="button"
                    aria-label={`Monter ${section.label}`}
                    disabled={index === 0}
                    onClick={() => onChange(moveSection(config, section.id, -1))}
                    className="grid h-5 w-6 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-25"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Descendre ${section.label}`}
                    disabled={index === config.sections.length - 1}
                    onClick={() => onChange(moveSection(config, section.id, 1))}
                    className="grid h-5 w-6 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-25"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
                <Toggle
                  checked={section.visible}
                  label={`Afficher ${section.label}`}
                  onChange={(checked) =>
                    onChange({
                      ...config,
                      sections: config.sections.map((item) =>
                        item.id === section.id ? { ...item, visible: checked } : item
                      ),
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </EditorCard>

      <EditorCard
        title="Contenu du texte libre"
        description="Activez la section « À propos » ci-dessus pour l’afficher."
      >
        <Field label="Titre">
          <input
            value={config.about.title}
            onChange={(event) =>
              onChange({ ...config, about: { ...config.about, title: event.target.value } })
            }
            className={inputClassName}
          />
        </Field>
        <Field label="Texte">
          <textarea
            value={config.about.text}
            onChange={(event) =>
              onChange({ ...config, about: { ...config.about, text: event.target.value } })
            }
            className={textareaClassName}
          />
        </Field>
      </EditorCard>
    </>
  );
}

function SeoPanel({ config, onChange }: PanelProps) {
  return (
    <>
      <EditorCard
        title="Aperçu dans les moteurs de recherche"
        description="Ces informations apparaissent lorsque votre boutique est partagée sur les réseaux ou recherchée sur Google."
      >
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="truncate text-xs text-muted-foreground">dukaio.com/{config.slug || "boutique"}</p>
          <p className="mt-1 line-clamp-1 text-base font-semibold text-primary">
            {config.seo.title || config.name}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {config.seo.description || config.description}
          </p>
        </div>
        <Field label="Titre de la page" hint={`${config.seo.title.length}/70 caractères recommandés.`}>
          <input
            value={config.seo.title}
            maxLength={100}
            onChange={(event) =>
              onChange({ ...config, seo: { ...config.seo, title: event.target.value } })
            }
            className={inputClassName}
          />
        </Field>
        <Field label="Description" hint={`${config.seo.description.length}/320 caractères.`}>
          <textarea
            value={config.seo.description}
            maxLength={320}
            onChange={(event) =>
              onChange({ ...config, seo: { ...config.seo, description: event.target.value } })
            }
            className={textareaClassName}
          />
        </Field>
      </EditorCard>

      <EditorCard
        title="Réseaux sociaux"
        description="Seuls les liens renseignés apparaîtront dans le pied de page."
      >
        <Field label="Instagram">
          <input
            type="url"
            value={config.socials.instagram}
            placeholder="https://instagram.com/votrecompte"
            onChange={(event) =>
              onChange({ ...config, socials: { ...config.socials, instagram: event.target.value } })
            }
            className={inputClassName}
          />
        </Field>
        <Field label="TikTok">
          <input
            type="url"
            value={config.socials.tiktok}
            placeholder="https://tiktok.com/@votrecompte"
            onChange={(event) =>
              onChange({ ...config, socials: { ...config.socials, tiktok: event.target.value } })
            }
            className={inputClassName}
          />
        </Field>
        <Field label="YouTube">
          <input
            type="url"
            value={config.socials.youtube}
            placeholder="https://youtube.com/@votrechaine"
            onChange={(event) =>
              onChange({ ...config, socials: { ...config.socials, youtube: event.target.value } })
            }
            className={inputClassName}
          />
        </Field>
      </EditorCard>
    </>
  );
}

export function EditorPanels(props: PanelProps & { activePanel: EditorPanelId }) {
  const { activePanel } = props;
  return (
    <div className="space-y-4">
      {activePanel === "content" && <ContentPanel {...props} />}
      {activePanel === "hero" && <HeroPanel {...props} />}
      {activePanel === "products" && <ProductsPanel {...props} />}
      {activePanel === "appearance" && <AppearancePanel {...props} />}
      {activePanel === "sections" && <SectionsPanel {...props} />}
      {activePanel === "seo" && <SeoPanel {...props} />}
    </div>
  );
}
