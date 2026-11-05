import { useState, type CSSProperties } from "react";
import pCours from "@/dukaio-site/assets/p-cours.jpg";
import pFichiers from "@/dukaio-site/assets/p-fichiers.jpg";
import pServices from "@/dukaio-site/assets/p-services.jpg";
import pLicences from "@/dukaio-site/assets/p-licences.jpg";

const people = [
  {
    who: "Créatifs", type: "Fichiers", img: pFichiers, pos: "object-[50%_25%]",
    text: "Vendez vos ebooks, templates, presets ou packs graphiques. Le fichier est livré automatiquement à l’acheteur, juste après son paiement.",
    ex: ["Ebooks & guides", "Templates", "Packs graphiques"],
  },
  {
    who: "Formateurs", type: "Cours", img: pCours, pos: "object-[50%_20%]",
    text: "Transformez votre méthode en formation vidéo organisée en modules. Vos élèves accèdent à leur cours dès que le paiement est validé.",
    ex: ["Formations vidéo", "Masterclass", "Programmes"],
  },
  {
    who: "Consultants", type: "Services", img: pServices, pos: "object-[50%_20%]",
    text: "Proposez un coaching, un audit ou une prestation sur mesure. Votre client paie en ligne, vous vous concentrez sur votre travail.",
    ex: ["Coaching", "Audits", "Prestations"],
  },
  {
    who: "Développeurs", type: "Licences", img: pLicences, pos: "object-[55%_15%]",
    text: "Vendez l’accès à vos logiciels, plugins et outils. Chaque acheteur reçoit sa clé de licence sans que vous ayez à intervenir.",
    ex: ["Logiciels", "Plugins", "Accès privés"],
  },
];

export function Personas() {
  const [active, setActive] = useState(1);
  const cur = people[active]!;

  return (
    <section id="pour-qui" className="wrap pt-28 md:pt-40">
      <div className="mx-auto max-w-2xl text-center">
        <p data-reveal="" className="eyebrow">Pour qui ?</p>
        <h2 data-reveal="" style={{ "--d": "80ms" } as CSSProperties} className="font-display mt-3 text-[clamp(2rem,4.4vw,3.2rem)]">
          Pensé pour tous ceux<br />qui vendent leur talent
        </h2>
      </div>

      {/* Desktop accordion */}
      <div data-reveal="" className="mt-14 hidden h-[25rem] gap-4 md:flex">
        {people.map((p, i) => {
          const on = i === active;
          return (
            <button
              key={p.who}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="group flex min-w-0 flex-col text-left transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ flexGrow: on ? 3.6 : 1, flexBasis: 0 }}
            >
              <div
                className="relative min-h-0 flex-1 overflow-hidden rounded-2xl transition-colors duration-500"
                style={{ background: on ? "var(--grad-dark)" : "var(--muted)" }}
              >
                <img
                  src={p.img}
                  alt={`${p.who} qui vendent des ${p.type.toLowerCase()} avec Dukaio`}
                  loading="lazy"
                  width={768}
                  height={1024}
                  className={`absolute top-0 h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${p.pos} ${
                    on ? "left-3 top-3 h-[calc(100%-1.5rem)] w-[36%] rounded-xl" : "left-0 w-full grayscale group-hover:grayscale-0"
                  }`}
                />
                <div className={`absolute inset-y-0 right-0 flex w-[60%] flex-col justify-between p-6 pl-2 text-ink-foreground transition-opacity duration-500 ${on ? "opacity-100 delay-200" : "pointer-events-none opacity-0"}`}>
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-foreground/55">Ils vendent des {p.type.toLowerCase()}</p>
                    <p className="mt-4 text-[1.02rem] leading-relaxed">{p.text}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.ex.map((e) => (
                      <span key={e} className="rounded-full border border-ink-foreground/20 px-2.5 py-1 text-[0.7rem]">{e}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[0.85rem] font-semibold">{p.who}</p>
              <p className={`text-[0.78rem] text-muted-foreground transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`}>{p.type}</p>
            </button>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="mt-10 md:hidden">
        <div className="grid grid-cols-4 gap-2">
          {people.map((p, i) => (
            <button key={p.who} onClick={() => setActive(i)} className="text-left">
              <span className={`block aspect-[3/4] overflow-hidden rounded-xl ring-2 transition ${i === active ? "ring-highlight" : "ring-transparent"}`}>
                <img src={p.img} alt={p.who} loading="lazy" className={`h-full w-full object-cover ${p.pos} ${i === active ? "" : "grayscale"}`} />
              </span>
              <span className="mt-1.5 block text-[0.7rem] font-semibold">{p.type}</span>
            </button>
          ))}
        </div>
        <div key={active} className="fade-up mt-4 rounded-2xl p-5 text-ink-foreground" style={{ background: "var(--grad-dark)" }}>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-foreground/55">{cur.who} · {cur.type}</p>
          <p className="mt-3 text-[0.95rem] leading-relaxed">{cur.text}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {cur.ex.map((e) => <span key={e} className="rounded-full border border-ink-foreground/20 px-2.5 py-1 text-[0.7rem]">{e}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}
