import {
  getCountries,
  getAllRegions,
  getPlantingByMonth,
  type PlantingHit,
} from "@/server/country";
import { GrowThisMonthClient } from "./GrowThisMonthClient";

/**
 * Homepage "What to Grow This Month" — server half.
 *
 * Previously this component read the FD_COUNTRY / FD_REGION cookies via
 * cookies() on the server, which forced the whole homepage into dynamic
 * SSR on every request (and the same pattern crashed the country×crop
 * pages). Now the server pre-computes the current month's verified
 * planting hits for EVERY region — paid once per ISR regeneration of the
 * homepage, not per visitor — and GrowThisMonthClient picks the visitor's
 * saved country/region from the cookies in the browser.
 * Verified data only, as before.
 */
export async function GrowThisMonth({ locale }: { locale: string }) {
  const countries = await getCountries();
  const regions = await getAllRegions();
  const month = new Date().getMonth() + 1;

  const hitsByRegion: Record<string, PlantingHit[]> = {};
  await Promise.all(
    regions.map(async (r) => {
      hitsByRegion[r.slug] = await getPlantingByMonth({
        regionSlug: r.slug,
        month,
        limit: 6,
        locale,
      }).catch(() => []);
    })
  );

  return (
    <GrowThisMonthClient
      locale={locale}
      month={month}
      countries={countries}
      regions={regions}
      hitsByRegion={hitsByRegion}
    />
  );
}
