import countries from "i18n-iso-countries";
import french from "i18n-iso-countries/langs/fr.json";

countries.registerLocale(french);

export const countryOptions = Object.entries(countries.getNames("fr", { select: "official" }))
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));