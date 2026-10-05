import { getCountries, getSelectedCountryCode } from "@/server/country";
import { CountrySelectorClient } from "./CountrySelectorClient";

/** Server wrapper: fetches countries once, renders the interactive dropdown. */
export async function CountrySelector() {
  const [countries, selected] = await Promise.all([
    getCountries(),
    getSelectedCountryCode(),
  ]);
  if (countries.length === 0) return null;
  return <CountrySelectorClient countries={countries} selectedCode={selected} />;
}
