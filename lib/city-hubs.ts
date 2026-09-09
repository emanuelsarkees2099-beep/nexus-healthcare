/**
 * AXVO — City hub page config
 *
 * The 10 cities selected for dedicated local landing pages (/search/[state]/[city]).
 *
 * METHODOLOGY, STATED HONESTLY: this is not pulled from a keyword-volume tool
 * (no Google Ads Keyword Planner / Ahrefs / SEMrush access) -- there is no
 * such thing as a verified "top 10 cities that search 'free clinics'" list
 * without one. This uses the best defensible public proxy instead: large
 * metro population combined with documented uninsured rate/population, since
 * that combination is what actually drives real search demand for "free
 * clinic" queries. Sources:
 *   - valuepenguin.com/uninsured-rates-metros-study (2023 ACS data via Census) --
 *     the five large metros with the highest uninsured rates are all in
 *     Texas, led by McAllen (25.3%), El Paso (21.8%), Houston (18.1%).
 *   - beckerspayer.com/payer/most-uninsured-cities-in-america/
 * Combined with sheer population size (LA, NYC, Chicago have huge absolute
 * uninsured populations even at a lower rate than the Texas metros).
 *
 * If real search-volume or analytics data becomes available later (Search
 * Console query data, once enough traffic accumulates), replace this list
 * with that instead of the population/rate proxy.
 */
export type CityHub = {
  stateSlug: string   // URL segment, e.g. 'tx'
  citySlug: string    // URL segment, e.g. 'houston'
  city: string        // matches public.clinics.city values
  state: string       // 2-letter, matches public.clinics.state values
  stateName: string
  context: string     // one honest, sourced sentence -- no invented per-city numbers
}

export const CITY_HUBS: CityHub[] = [
  { stateSlug: 'tx', citySlug: 'houston',      city: 'Houston',      state: 'TX', stateName: 'Texas',       context: "Houston's uninsured rate (18.1%) is among the highest of any large U.S. metro — Texas has never expanded Medicaid under the ACA." },
  { stateSlug: 'ca', citySlug: 'los-angeles',  city: 'Los Angeles',  state: 'CA', stateName: 'California',  context: 'Los Angeles County has one of the largest uninsured populations in the country by sheer size, even though California expanded Medicaid.' },
  { stateSlug: 'az', citySlug: 'phoenix',      city: 'Phoenix',      state: 'AZ', stateName: 'Arizona',     context: "Arizona was the last state to adopt Medicaid at all (1982), and Phoenix's uninsured rate still reflects that history." },
  { stateSlug: 'tx', citySlug: 'dallas',       city: 'Dallas',       state: 'TX', stateName: 'Texas',       context: 'Texas has led the nation in uninsured residents for over a decade — Dallas is no exception.' },
  { stateSlug: 'tx', citySlug: 'san-antonio',  city: 'San Antonio',  state: 'TX', stateName: 'Texas',       context: "San Antonio sits in the same non-expansion state as Houston, Dallas, and El Paso." },
  { stateSlug: 'il', citySlug: 'chicago',      city: 'Chicago',      state: 'IL', stateName: 'Illinois',    context: "Even in a Medicaid-expansion state, Chicago's population size means a substantial uninsured community." },
  { stateSlug: 'ny', citySlug: 'new-york',     city: 'New York',     state: 'NY', stateName: 'New York',    context: "New York's uninsured rate is lower than the Texas metros, but the city's size means a large number of people still go without coverage." },
  { stateSlug: 'fl', citySlug: 'miami',        city: 'Miami',        state: 'FL', stateName: 'Florida',     context: 'Florida is one of ten states that has not expanded Medicaid, leaving a wide coverage gap that Miami residents fall into.' },
  { stateSlug: 'tx', citySlug: 'el-paso',      city: 'El Paso',      state: 'TX', stateName: 'Texas',       context: "El Paso's uninsured rate (21.8%) is the second-highest of any large U.S. metro, behind only McAllen." },
  { stateSlug: 'ga', citySlug: 'atlanta',      city: 'Atlanta',      state: 'GA', stateName: 'Georgia',     context: "Georgia has not expanded Medicaid, and Atlanta's uninsured population reflects that policy gap." },
]

export function findCityHub(stateSlug: string, citySlug: string): CityHub | undefined {
  return CITY_HUBS.find(c => c.stateSlug === stateSlug && c.citySlug === citySlug)
}
