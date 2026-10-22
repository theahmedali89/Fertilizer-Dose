import { getCountries } from "@/server/country";
import { CountrySelectorClient } from "./CountrySelectorClient";

/**
 * Server wrapper: fetches countries once, renders the interactive dropdown.
 *
 * The selected country is deliberately NOT read here. This component sits in
 * the [locale] layout (every page), and reading cookies() on the server makes
 * statically generated pages bail out with DYNAMIC_SERVER_USAGE — which is a
 * production 500 on on-demand ISR routes such as /[country]/[crop]. The
 * FD_COUNTRY cookie is set via document.cookie (never httpOnly), so the
 * client component reads it after mount instead; see CountrySelectorClient.
 */
export async function CountrySelector() {
  const countries = await getCountries();
  if (countries.length === 0) return null;
  return <CountrySelectorClient countries={countries} />;
}
