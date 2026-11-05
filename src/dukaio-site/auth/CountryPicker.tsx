import { useState, type ComponentType } from "react";
import * as flags from "country-flag-icons/react/3x2";
import { Check, ChevronsUpDown, Globe2 } from "lucide-react";
import { Button } from "@/dukaio-site/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/dukaio-site/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/dukaio-site/ui/command";
import { countryOptions } from "@/dukaio-site/lib/countries";

function Flag({ code }: { code: string }) {
  const Icon = (flags as unknown as Record<string, ComponentType<{ className?: string; "aria-hidden"?: boolean }>>)[code];
  return Icon ? <Icon aria-hidden className="h-4 w-6 shrink-0 rounded-sm object-cover" /> : <Globe2 className="h-4 w-6 shrink-0 text-muted-foreground" />;
}

export function CountryPicker({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = countryOptions.find((c) => c.code === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id="country" type="button" role="combobox" aria-label="Pays de résidence" aria-expanded={open} variant="outline" className="h-12 w-full justify-between bg-background px-3 font-normal shadow-none hover:bg-muted hover:text-foreground">
          <span className="flex min-w-0 items-center gap-3">{selected ? <Flag code={selected.code} /> : <Globe2 className="h-4 w-4 text-muted-foreground" />}<span className="truncate">{selected?.name ?? "Sélectionnez votre pays"}</span></span>
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2.5rem)] p-0">
        <Command>
          <CommandInput placeholder="Rechercher un pays…" aria-label="Rechercher un pays" />
          <CommandList className="max-h-64">
            <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
            <CommandGroup>
              {countryOptions.map((c) => <CommandItem key={c.code} value={`${c.name} ${c.code}`} onSelect={() => { onChange(c.code); setOpen(false); }} className="gap-3 py-2.5 data-[selected=true]:bg-muted data-[selected=true]:text-foreground"><Flag code={c.code} /><span className="min-w-0 flex-1">{c.name}</span>{c.code === value && <Check className="text-primary" />}</CommandItem>)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}