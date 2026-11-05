import type { CSSProperties } from "react";
import { APP_URL } from "@/dukaio-site/site/Header";

const COLS = 12;
const ROWS = 5;
const icons: Record<string, string> = {
  "0-3": "whatsapp", "0-9": "telegram", "1-6": "instagram", "1-11": "threads",
  "2-0": "facebook", "2-10": "tiktok", "3-2": "youtube", "4-8": "snapchat",
  "4-1": "x", "3-11": "pinterest", "4-5": "gmail", "0-0": "messenger",
};

export function Share() {
  return (
    <section className="wrap pt-28 md:pt-40">
      <div className="relative">
        <div className="grid grid-cols-6 gap-2 md:grid-cols-12 md:gap-3">
          {Array.from({ length: ROWS * COLS }).map((_, i) => {
            const r = Math.floor(i / COLS);
            const c = i % COLS;
            const ic = icons[`${r}-${c}`];
            return (
              <div key={i} className={`${c >= 6 ? "hidden md:grid" : "grid"} aspect-square place-items-center rounded-lg md:rounded-xl ${ic ? "bg-card shadow-[var(--shadow-soft)]" : "bg-muted/70"}`}>
                {ic && (
                  <img
                    data-reveal=""
                    style={{ "--d": `${(r + c) * 40}ms` } as CSSProperties}
                    src={`https://cdn.simpleicons.org/${ic}`}
                    alt={ic}
                    loading="lazy"
                    className="h-[45%] w-[45%] object-contain"
                  />
                )}
              </div>
            );
          })}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(42%_60%_at_50%_55%,var(--background)_35%,transparent_100%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--background),transparent_14%,transparent_86%,var(--background))]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h2 data-reveal="" className="font-display text-[clamp(1.6rem,4.4vw,3.2rem)]">
            Un seul lien, partout<br />où sont vos clients
          </h2>
          <p data-reveal="" style={{ "--d": "80ms" } as CSSProperties} className="mt-3 hidden max-w-sm text-[0.9rem] text-muted-foreground sm:block">
            Partagez votre boutique sur WhatsApp, Instagram, TikTok ou Facebook. Vos clients achètent directement depuis le lien.
          </p>
          <div data-reveal="" style={{ "--d": "140ms" } as CSSProperties} className="mt-5">
            <a href={APP_URL} className="btn btn-primary">Créer mon lien de boutique</a>
          </div>
        </div>
      </div>
    </section>
  );
}
