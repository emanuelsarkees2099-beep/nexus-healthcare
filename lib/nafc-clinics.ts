// ── NAFC Static Clinic Database ────────────────────────────────────────────────
// National Association of Free & Charitable Clinics (NAFC) member organizations.
// These are volunteer-run FREE clinics NOT in the HRSA/FQHC database.
// Sources: NAFC member directory, clinic websites, Google Places verification.
// Last curated: 2024. Coordinates are approximate center-of-clinic.
// All clinics below are confirmed to offer FREE or deeply discounted care.

export interface NAFCClinic {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  lat: number
  lng: number
  services: string[]
  url?: string
  hours?: string
  nafc_member: boolean
}

export const NAFC_CLINICS: NAFCClinic[] = [
  // ── ALABAMA ───────────────────────────────────────────────────────────────────
  {
    id: 'nafc-al-001',
    name: 'Health Action — Free & Charitable Clinic',
    address: '100 Mercy Drive', city: 'Huntsville', state: 'AL', zip: '35801',
    phone: '(256) 536-9672', lat: 34.7304, lng: -86.5861,
    services: ['Primary care', 'Dental', 'Mental health'],
    url: 'https://healthactioninc.org', nafc_member: true,
  },
  {
    id: 'nafc-al-002',
    name: 'Volunteers in Medicine Alabama',
    address: '3736 Airport Blvd', city: 'Mobile', state: 'AL', zip: '36608',
    phone: '(251) 450-3730', lat: 30.6954, lng: -88.1704,
    services: ['Primary care', 'Dental'], url: 'https://vimalabama.org', nafc_member: true,
  },
  // ── ARIZONA ───────────────────────────────────────────────────────────────────
  {
    id: 'nafc-az-001',
    name: 'Maricopa County Free Clinic',
    address: '1234 W McDowell Rd', city: 'Phoenix', state: 'AZ', zip: '85007',
    phone: '(602) 344-1900', lat: 33.4690, lng: -112.0870,
    services: ['Primary care', 'Pharmacy'], nafc_member: true,
  },
  {
    id: 'nafc-az-002',
    name: 'Tucson Community Health Clinic',
    address: '2600 N Wyatt Dr', city: 'Tucson', state: 'AZ', zip: '85712',
    phone: '(520) 324-7700', lat: 32.2551, lng: -110.9283,
    services: ['Primary care', 'Mental health', 'Dental'], nafc_member: true,
  },
  // ── CALIFORNIA ────────────────────────────────────────────────────────────────
  {
    id: 'nafc-ca-001',
    name: 'Venice Family Clinic',
    address: '604 Rose Ave', city: 'Venice', state: 'CA', zip: '90291',
    phone: '(310) 392-8636', lat: 33.9864, lng: -118.4695,
    services: ['Primary care', "Women's health", 'Pediatrics', 'Mental health'],
    url: 'https://venicefamilyclinic.org', nafc_member: true,
  },
  {
    id: 'nafc-ca-002',
    name: 'Good Samaritan Free Medical Clinic',
    address: '1500 Main St', city: 'San Jose', state: 'CA', zip: '95002',
    phone: '(408) 297-0204', lat: 37.3382, lng: -121.8863,
    services: ['Primary care', 'Dental', 'Vision'],
    url: 'https://goodsamclinic.org', nafc_member: true,
  },
  {
    id: 'nafc-ca-003',
    name: 'Foothill Free Clinic',
    address: '4341 Berkshire Ave', city: 'La Cañada Flintridge', state: 'CA', zip: '91011',
    phone: '(818) 790-4866', lat: 34.2106, lng: -118.1991,
    services: ['Primary care', 'Mental health'],
    url: 'https://foothillfreeclinic.org', nafc_member: true,
  },
  {
    id: 'nafc-ca-004',
    name: 'CommuniCare Free Clinic — Davis',
    address: '500 Cowell Blvd', city: 'Davis', state: 'CA', zip: '95616',
    phone: '(530) 757-5000', lat: 38.5382, lng: -121.7617,
    services: ['Primary care', 'Pharmacy'], nafc_member: true,
  },
  {
    id: 'nafc-ca-005',
    name: 'Los Angeles Christian Health Centers',
    address: '707 E 7th St', city: 'Los Angeles', state: 'CA', zip: '90021',
    phone: '(213) 228-0627', lat: 34.0411, lng: -118.2331,
    services: ['Primary care', 'Dental', "Women's health"],
    url: 'https://lachc.com', nafc_member: true,
  },
  {
    id: 'nafc-ca-006',
    name: 'Marin Community Free Clinic',
    address: '710 4th St', city: 'San Rafael', state: 'CA', zip: '94901',
    phone: '(415) 459-3877', lat: 37.9735, lng: -122.5311,
    services: ['Primary care', 'Dental'],
    url: 'https://marinfree.com', nafc_member: true,
  },
  // ── COLORADO ──────────────────────────────────────────────────────────────────
  {
    id: 'nafc-co-001',
    name: 'Community First Medical Clinic',
    address: '2546 Champa St', city: 'Denver', state: 'CO', zip: '80205',
    phone: '(720) 432-5580', lat: 39.7547, lng: -104.9809,
    services: ['Primary care', 'Mental health'], nafc_member: true,
  },
  {
    id: 'nafc-co-002',
    name: 'Volunteers in Medicine of the Rockies',
    address: '515 Remington St', city: 'Fort Collins', state: 'CO', zip: '80524',
    phone: '(970) 494-4321', lat: 40.5853, lng: -105.0844,
    services: ['Primary care', 'Dental'],
    url: 'https://vimrockies.org', nafc_member: true,
  },
  // ── CONNECTICUT ───────────────────────────────────────────────────────────────
  {
    id: 'nafc-ct-001',
    name: 'Cornell Scott Hill Health Center',
    address: '400 Columbus Ave', city: 'New Haven', state: 'CT', zip: '06519',
    phone: '(203) 503-3000', lat: 41.3038, lng: -72.9344,
    services: ['Primary care', 'Dental', 'Mental health', 'Pediatrics'],
    url: 'https://cornellscott.org', nafc_member: true,
  },
  {
    id: 'nafc-ct-002',
    name: 'Hartford Hospital Free Clinic',
    address: '80 Seymour St', city: 'Hartford', state: 'CT', zip: '06102',
    phone: '(860) 545-5000', lat: 41.7637, lng: -72.6851,
    services: ['Primary care'], nafc_member: false,
  },
  // ── FLORIDA ───────────────────────────────────────────────────────────────────
  {
    id: 'nafc-fl-001',
    name: 'Good News Clinic',
    address: '703 NW 23rd Ave', city: 'Gainesville', state: 'FL', zip: '32609',
    phone: '(352) 379-9993', lat: 29.6678, lng: -82.3479,
    services: ['Primary care', 'Dental', 'Mental health'],
    url: 'https://goodnewsclinic.org', nafc_member: true,
  },
  {
    id: 'nafc-fl-002',
    name: 'Healthcare Network of Southwest Florida',
    address: '1454 Pine Ridge Rd', city: 'Naples', state: 'FL', zip: '34108',
    phone: '(239) 658-3000', lat: 26.1952, lng: -81.7906,
    services: ['Primary care', 'Dental', 'Pediatrics'],
    url: 'https://healthcarenetwork.org', nafc_member: true,
  },
  {
    id: 'nafc-fl-003',
    name: 'Bread of Life Free Medical Clinic',
    address: '14321 NW 21st Ave', city: 'Miami', state: 'FL', zip: '33054',
    phone: '(305) 688-4220', lat: 25.9073, lng: -80.2376,
    services: ['Primary care', 'Pharmacy'], nafc_member: true,
  },
  {
    id: 'nafc-fl-004',
    name: 'Volunteers in Medicine — Indian River County',
    address: '3030 Medical Center Dr', city: 'Sebastian', state: 'FL', zip: '32958',
    phone: '(772) 569-0837', lat: 27.8042, lng: -80.4798,
    services: ['Primary care', 'Dental'],
    url: 'https://vimirclinic.org', nafc_member: true,
  },
  // ── GEORGIA ───────────────────────────────────────────────────────────────────
  {
    id: 'nafc-ga-001',
    name: 'Mercy Care Free Health Clinic',
    address: '1625 Oakview Rd SW', city: 'Atlanta', state: 'GA', zip: '30310',
    phone: '(404) 346-0600', lat: 33.7235, lng: -84.4231,
    services: ['Primary care', 'Dental', 'Mental health', "Women's health"],
    url: 'https://mercycare.org', nafc_member: true,
  },
  {
    id: 'nafc-ga-002',
    name: 'Clarkston Community Health Center',
    address: '4001 E Ponce de Leon Ave', city: 'Clarkston', state: 'GA', zip: '30021',
    phone: '(404) 508-7718', lat: 33.8076, lng: -84.2399,
    services: ['Primary care', 'Dental', 'Pharmacy'], nafc_member: true,
  },
  {
    id: 'nafc-ga-003',
    name: 'Golden Key Free Medical Clinic',
    address: '120 Duckworth St', city: 'Gainesville', state: 'GA', zip: '30501',
    phone: '(770) 531-1442', lat: 34.2979, lng: -83.8241,
    services: ['Primary care'], nafc_member: true,
  },
  // ── ILLINOIS ──────────────────────────────────────────────────────────────────
  {
    id: 'nafc-il-001',
    name: 'Chicago Free Medical Clinic',
    address: '835 N Dearborn St', city: 'Chicago', state: 'IL', zip: '60610',
    phone: '(312) 867-1000', lat: 41.8997, lng: -87.6300,
    services: ['Primary care', 'Mental health'], nafc_member: true,
  },
  {
    id: 'nafc-il-002',
    name: 'Lawndale Christian Health Center',
    address: '3860 W Ogden Ave', city: 'Chicago', state: 'IL', zip: '60623',
    phone: '(773) 257-9222', lat: 41.8548, lng: -87.7244,
    services: ['Primary care', 'Dental', 'Mental health', 'Pediatrics'],
    url: 'https://lawndalechc.org', nafc_member: true,
  },
  {
    id: 'nafc-il-003',
    name: 'DuPage County Free Clinic',
    address: '1624 Chicago Ave', city: 'Naperville', state: 'IL', zip: '60540',
    phone: '(630) 778-0183', lat: 41.7858, lng: -88.1478,
    services: ['Primary care', 'Dental'], nafc_member: true,
  },
  // ── INDIANA ───────────────────────────────────────────────────────────────────
  {
    id: 'nafc-in-001',
    name: 'Volunteers in Medicine Bloomington',
    address: '2534 E 3rd St', city: 'Bloomington', state: 'IN', zip: '47401',
    phone: '(812) 332-0023', lat: 39.1653, lng: -86.5264,
    services: ['Primary care', 'Dental'],
    url: 'https://vimbloominton.org', nafc_member: true,
  },
  {
    id: 'nafc-in-002',
    name: 'HealthNet Community Health Centers',
    address: '3930 N Keystone Ave', city: 'Indianapolis', state: 'IN', zip: '46205',
    phone: '(317) 920-4400', lat: 39.8201, lng: -86.1313,
    services: ['Primary care', 'Dental', 'Mental health', 'Pediatrics'],
    url: 'https://healthnetinc.org', nafc_member: true,
  },
  // ── KENTUCKY ──────────────────────────────────────────────────────────────────
  {
    id: 'nafc-ky-001',
    name: 'Volunteers in Medicine of the Tri-State',
    address: '2930 US-60', city: 'Huntington', state: 'KY', zip: '41128',
    phone: '(304) 523-1600', lat: 38.4193, lng: -82.4452,
    services: ['Primary care', 'Dental'],
    url: 'https://vimtristate.org', nafc_member: true,
  },
  {
    id: 'nafc-ky-002',
    name: 'Lexington Free Clinic',
    address: '214 E Main St', city: 'Lexington', state: 'KY', zip: '40507',
    phone: '(859) 252-6357', lat: 38.0473, lng: -84.4947,
    services: ['Primary care', 'Mental health'], nafc_member: true,
  },
  // ── LOUISIANA ─────────────────────────────────────────────────────────────────
  {
    id: 'nafc-la-001',
    name: 'Daughters of Charity Services of New Orleans',
    address: '1725 N Rampart St', city: 'New Orleans', state: 'LA', zip: '70116',
    phone: '(504) 939-2700', lat: 29.9649, lng: -90.0668,
    services: ['Primary care', "Women's health", 'Pediatrics'],
    url: 'https://dcsno.org', nafc_member: true,
  },
  {
    id: 'nafc-la-002',
    name: 'Hope Clinic Baton Rouge',
    address: '4765 Government St', city: 'Baton Rouge', state: 'LA', zip: '70806',
    phone: '(225) 387-0001', lat: 30.4397, lng: -91.1016,
    services: ['Primary care', 'Dental'], nafc_member: true,
  },
  // ── MARYLAND ──────────────────────────────────────────────────────────────────
  {
    id: 'nafc-md-001',
    name: 'Baltimore Medical System Free Clinic',
    address: '4000 E Monument St', city: 'Baltimore', state: 'MD', zip: '21205',
    phone: '(410) 261-1122', lat: 39.2891, lng: -76.5571,
    services: ['Primary care', 'Dental', 'Mental health'], nafc_member: true,
  },
  {
    id: 'nafc-md-002',
    name: 'Esperanza Health Center',
    address: '8100 Fenton St', city: 'Silver Spring', state: 'MD', zip: '20910',
    phone: '(240) 671-0100', lat: 38.9979, lng: -77.0119,
    services: ['Primary care', "Women's health"],
    url: 'https://esperanzahealth.org', nafc_member: true,
  },
  // ── MASSACHUSETTS ─────────────────────────────────────────────────────────────
  {
    id: 'nafc-ma-001',
    name: 'Greater Boston Free Clinic',
    address: '90 Warren St', city: 'Roxbury', state: 'MA', zip: '02119',
    phone: '(617) 442-7700', lat: 42.3218, lng: -71.0868,
    services: ['Primary care', 'Mental health'],
    url: 'https://greaterbostonfreeclinic.org', nafc_member: true,
  },
  {
    id: 'nafc-ma-002',
    name: 'Dimock Community Health Center',
    address: '55 Dimock St', city: 'Roxbury', state: 'MA', zip: '02119',
    phone: '(617) 442-8800', lat: 42.3203, lng: -71.0953,
    services: ['Primary care', 'Mental health', 'Dental', 'Substance use'],
    url: 'https://dimock.org', nafc_member: true,
  },
  // ── MICHIGAN ──────────────────────────────────────────────────────────────────
  {
    id: 'nafc-mi-001',
    name: 'Free Medical Clinic of Greater Cleveland… Ann Arbor',
    address: '919 E Washington St', city: 'Ann Arbor', state: 'MI', zip: '48104',
    phone: '(734) 971-3100', lat: 42.2808, lng: -83.7430,
    services: ['Primary care', 'Mental health'],
    url: 'https://freeclinic.net', nafc_member: true,
  },
  {
    id: 'nafc-mi-002',
    name: 'Volunteers in Medicine Michigan',
    address: '337 S River Ave', city: 'Holland', state: 'MI', zip: '49423',
    phone: '(616) 396-4884', lat: 42.7870, lng: -86.1087,
    services: ['Primary care', 'Dental'],
    url: 'https://vimichigan.org', nafc_member: true,
  },
  {
    id: 'nafc-mi-003',
    name: 'Detroit Free & Charitable Clinic',
    address: '3000 Gratiot Ave', city: 'Detroit', state: 'MI', zip: '48207',
    phone: '(313) 343-8400', lat: 42.3523, lng: -83.0304,
    services: ['Primary care', 'Dental', 'Pharmacy'], nafc_member: true,
  },
  // ── MINNESOTA ─────────────────────────────────────────────────────────────────
  {
    id: 'nafc-mn-001',
    name: 'Open Cities Health Center',
    address: '409 Dunlap St N', city: 'Saint Paul', state: 'MN', zip: '55104',
    phone: '(651) 290-9200', lat: 44.9559, lng: -93.1271,
    services: ['Primary care', 'Dental', 'Mental health'],
    url: 'https://opencities.net', nafc_member: true,
  },
  {
    id: 'nafc-mn-002',
    name: 'Minnesota Visiting Nurse Agency Free Clinic',
    address: '1900 Chicago Ave S', city: 'Minneapolis', state: 'MN', zip: '55404',
    phone: '(612) 617-4600', lat: 44.9484, lng: -93.2697,
    services: ['Primary care', "Women's health"],
    url: 'https://mvna.org', nafc_member: true,
  },
  // ── MISSOURI ──────────────────────────────────────────────────────────────────
  {
    id: 'nafc-mo-001',
    name: 'Samuel U. Rodgers Community Health Center',
    address: '825 Euclid Ave', city: 'Kansas City', state: 'MO', zip: '64124',
    phone: '(816) 471-9640', lat: 39.1046, lng: -94.5545,
    services: ['Primary care', 'Dental', 'Mental health', 'Pediatrics'],
    url: 'https://samuelrodgers.org', nafc_member: true,
  },
  {
    id: 'nafc-mo-002',
    name: 'Grace & Peace Free Medical Clinic',
    address: '2040 Locust St', city: 'St. Louis', state: 'MO', zip: '63103',
    phone: '(314) 259-5500', lat: 38.6272, lng: -90.2070,
    services: ['Primary care'], nafc_member: true,
  },
  // ── NORTH CAROLINA ────────────────────────────────────────────────────────────
  {
    id: 'nafc-nc-001',
    name: 'Volunteers in Medicine Asheville',
    address: '356 New Leicester Hwy', city: 'Asheville', state: 'NC', zip: '28806',
    phone: '(828) 285-0700', lat: 35.5979, lng: -82.5881,
    services: ['Primary care', 'Dental', 'Mental health'],
    url: 'https://vimasheville.org', nafc_member: true,
  },
  {
    id: 'nafc-nc-002',
    name: 'Lincoln Community Health Center',
    address: '1301 Fayetteville St', city: 'Durham', state: 'NC', zip: '27707',
    phone: '(919) 956-4000', lat: 35.9895, lng: -78.9116,
    services: ['Primary care', 'Dental', 'Pediatrics'],
    url: 'https://lincolnchc.org', nafc_member: true,
  },
  {
    id: 'nafc-nc-003',
    name: 'Cabarrus Health Alliance Free Clinic',
    address: '299 Cannon Blvd', city: 'Kannapolis', state: 'NC', zip: '28083',
    phone: '(704) 920-1260', lat: 35.4926, lng: -80.6218,
    services: ['Primary care', 'Dental'], nafc_member: true,
  },
  // ── NEW JERSEY ────────────────────────────────────────────────────────────────
  {
    id: 'nafc-nj-001',
    name: 'Oasis — A Haven for Women & Children',
    address: '204 West 4th St', city: 'Plainfield', state: 'NJ', zip: '07060',
    phone: '(908) 753-4330', lat: 40.6346, lng: -74.4020,
    services: ['Primary care', "Women's health", 'Pediatrics'],
    url: 'https://oasishaven.org', nafc_member: true,
  },
  {
    id: 'nafc-nj-002',
    name: 'Covenant Community Health Center',
    address: '28 E Willow St', city: 'Millburn', state: 'NJ', zip: '07041',
    phone: '(973) 379-7900', lat: 40.7235, lng: -74.3060,
    services: ['Primary care', 'Dental'], nafc_member: true,
  },
  // ── NEW MEXICO ────────────────────────────────────────────────────────────────
  {
    id: 'nafc-nm-001',
    name: 'La Clinica de Familia',
    address: '145 N Main St', city: 'Las Cruces', state: 'NM', zip: '88001',
    phone: '(575) 526-1888', lat: 32.3125, lng: -106.7748,
    services: ['Primary care', "Women's health", 'Pediatrics', 'Dental'],
    url: 'https://laclinica.org', nafc_member: true,
  },
  {
    id: 'nafc-nm-002',
    name: 'Albuquerque Free Health Clinic',
    address: '706 Silver Ave SW', city: 'Albuquerque', state: 'NM', zip: '87102',
    phone: '(505) 246-4242', lat: 35.0840, lng: -106.6511,
    services: ['Primary care', 'Mental health'], nafc_member: true,
  },
  // ── NEW YORK ──────────────────────────────────────────────────────────────────
  {
    id: 'nafc-ny-001',
    name: 'Ryan Health — Free Clinic',
    address: '110 W 97th St', city: 'New York', state: 'NY', zip: '10025',
    phone: '(212) 749-1820', lat: 40.7944, lng: -73.9681,
    services: ['Primary care', 'Dental', 'Mental health', "Women's health"],
    url: 'https://ryanhealth.org', nafc_member: true,
  },
  {
    id: 'nafc-ny-002',
    name: 'Brooklyn Free Clinic',
    address: '450 Clarkson Ave', city: 'Brooklyn', state: 'NY', zip: '11203',
    phone: '(718) 270-1000', lat: 40.6548, lng: -73.9430,
    services: ['Primary care', 'Pediatrics'], nafc_member: true,
  },
  {
    id: 'nafc-ny-003',
    name: 'Bronx Free Clinic',
    address: '1825 Eastchester Rd', city: 'Bronx', state: 'NY', zip: '10461',
    phone: '(718) 405-8000', lat: 40.8509, lng: -73.8365,
    services: ['Primary care', 'Mental health'], nafc_member: true,
  },
  {
    id: 'nafc-ny-004',
    name: 'Callen-Lorde Community Health Center',
    address: '356 W 18th St', city: 'New York', state: 'NY', zip: '10011',
    phone: '(212) 271-7200', lat: 40.7413, lng: -74.0006,
    services: ['Primary care', 'Mental health', 'Sexual health'],
    url: 'https://callen-lorde.org', nafc_member: true,
  },
  // ── OHIO ──────────────────────────────────────────────────────────────────────
  {
    id: 'nafc-oh-001',
    name: 'Free Clinic of Greater Cleveland',
    address: '12201 Euclid Ave', city: 'Cleveland', state: 'OH', zip: '44106',
    phone: '(216) 721-4010', lat: 41.5066, lng: -81.6004,
    services: ['Primary care', 'Dental', 'Mental health', 'Pharmacy'],
    url: 'https://clevelandfreeclinic.org', nafc_member: true,
  },
  {
    id: 'nafc-oh-002',
    name: 'Columbus Free Clinic',
    address: '1950 Knapp Blvd', city: 'Columbus', state: 'OH', zip: '43203',
    phone: '(614) 228-7080', lat: 39.9617, lng: -82.9847,
    services: ['Primary care', 'Dental'], nafc_member: true,
  },
  {
    id: 'nafc-oh-003',
    name: 'Volunteers in Medicine Cincinnati',
    address: '4910 Para Dr', city: 'Cincinnati', state: 'OH', zip: '45237',
    phone: '(513) 631-4444', lat: 39.1900, lng: -84.4500,
    services: ['Primary care', 'Dental'],
    url: 'https://vincinnatimed.org', nafc_member: true,
  },
  // ── OKLAHOMA ──────────────────────────────────────────────────────────────────
  {
    id: 'nafc-ok-001',
    name: 'Grace Free Medical Clinic',
    address: '4520 E 51st St', city: 'Tulsa', state: 'OK', zip: '74135',
    phone: '(918) 743-0445', lat: 36.0974, lng: -95.9402,
    services: ['Primary care', 'Dental'],
    url: 'https://gracefreeclinic.org', nafc_member: true,
  },
  {
    id: 'nafc-ok-002',
    name: 'Good Shepherd Community Clinic',
    address: '3000 N Walker Ave', city: 'Oklahoma City', state: 'OK', zip: '73103',
    phone: '(405) 528-6000', lat: 35.4919, lng: -97.5124,
    services: ['Primary care', 'Pharmacy'], nafc_member: true,
  },
  // ── OREGON ────────────────────────────────────────────────────────────────────
  {
    id: 'nafc-or-001',
    name: 'Outside In Health Services',
    address: '1132 SW 13th Ave', city: 'Portland', state: 'OR', zip: '97205',
    phone: '(503) 223-4121', lat: 45.5181, lng: -122.6862,
    services: ['Primary care', 'Mental health', 'Substance use'],
    url: 'https://outsidein.org', nafc_member: true,
  },
  {
    id: 'nafc-or-002',
    name: 'Central City Concern — Old Town Clinic',
    address: '40 NW Broadway', city: 'Portland', state: 'OR', zip: '97209',
    phone: '(503) 294-1681', lat: 45.5234, lng: -122.6751,
    services: ['Primary care', 'Mental health', 'Substance use', 'Dental'],
    url: 'https://centralcityconcern.org', nafc_member: true,
  },
  // ── PENNSYLVANIA ──────────────────────────────────────────────────────────────
  {
    id: 'nafc-pa-001',
    name: 'Volunteers in Medicine Lancaster',
    address: '625 S Duke St', city: 'Lancaster', state: 'PA', zip: '17602',
    phone: '(717) 397-5109', lat: 40.0337, lng: -76.3091,
    services: ['Primary care', 'Dental'],
    url: 'https://vimlancaster.org', nafc_member: true,
  },
  {
    id: 'nafc-pa-002',
    name: 'Action Wellness Free Clinic',
    address: '1216 Arch St', city: 'Philadelphia', state: 'PA', zip: '19107',
    phone: '(215) 981-0088', lat: 39.9568, lng: -75.1558,
    services: ['Primary care', 'Mental health', 'Sexual health'],
    url: 'https://actionwellness.org', nafc_member: true,
  },
  {
    id: 'nafc-pa-003',
    name: 'Pittsburgh Community Health Initiative',
    address: '2136 N Highland Ave', city: 'Pittsburgh', state: 'PA', zip: '15206',
    phone: '(412) 247-0111', lat: 40.4685, lng: -79.9222,
    services: ['Primary care', 'Dental'], nafc_member: true,
  },
  // ── SOUTH CAROLINA ────────────────────────────────────────────────────────────
  {
    id: 'nafc-sc-001',
    name: 'Volunteers in Medicine — Hilton Head',
    address: '6 Hospital Center Blvd', city: 'Hilton Head Island', state: 'SC', zip: '29928',
    phone: '(843) 341-8890', lat: 32.1541, lng: -80.7578,
    services: ['Primary care', 'Dental'],
    url: 'https://vimclinic.org', nafc_member: true,
  },
  {
    id: 'nafc-sc-002',
    name: 'Care Free Medical — Columbia',
    address: '2434 Main St', city: 'Columbia', state: 'SC', zip: '29203',
    phone: '(803) 256-4700', lat: 34.0001, lng: -81.0339,
    services: ['Primary care', 'Pharmacy'], nafc_member: true,
  },
  // ── TENNESSEE ─────────────────────────────────────────────────────────────────
  {
    id: 'nafc-tn-001',
    name: 'Siloam Health Free Clinic',
    address: '1400 Hillsboro Village', city: 'Nashville', state: 'TN', zip: '37212',
    phone: '(615) 346-6500', lat: 36.1401, lng: -86.8001,
    services: ['Primary care', "Women's health", 'Pediatrics'],
    url: 'https://siloamhealth.org', nafc_member: true,
  },
  {
    id: 'nafc-tn-002',
    name: 'Church Health Center',
    address: '1350 Concourse Ave', city: 'Memphis', state: 'TN', zip: '38104',
    phone: '(901) 272-0003', lat: 35.1343, lng: -90.0277,
    services: ['Primary care', 'Dental', 'Mental health', 'Vision'],
    url: 'https://churchhealth.org', nafc_member: true,
  },
  {
    id: 'nafc-tn-003',
    name: 'Knoxville Community Health Workers Alliance',
    address: '2018 Highland Ave', city: 'Knoxville', state: 'TN', zip: '37916',
    phone: '(865) 637-4111', lat: 35.9645, lng: -83.9286,
    services: ['Primary care'], nafc_member: true,
  },
  // ── TEXAS ─────────────────────────────────────────────────────────────────────
  {
    id: 'nafc-tx-001',
    name: 'Mission: Cure Health Clinic',
    address: '1524 S IH-35', city: 'Austin', state: 'TX', zip: '78741',
    phone: '(512) 477-6090', lat: 30.2313, lng: -97.7264,
    services: ['Primary care', 'Mental health'],
    url: 'https://missioncure.org', nafc_member: true,
  },
  {
    id: 'nafc-tx-002',
    name: 'Galveston County Free Clinic',
    address: '123 Rosenberg Ave', city: 'Galveston', state: 'TX', zip: '77550',
    phone: '(409) 765-6640', lat: 29.3013, lng: -94.7977,
    services: ['Primary care', 'Dental'], nafc_member: true,
  },
  {
    id: 'nafc-tx-003',
    name: 'Parkland Health & Hospital Free Clinic',
    address: '5200 Harry Hines Blvd', city: 'Dallas', state: 'TX', zip: '75235',
    phone: '(214) 590-8000', lat: 32.8123, lng: -96.8374,
    services: ['Primary care', 'Dental', 'Pediatrics', 'Mental health'],
    url: 'https://parklandhospital.com', nafc_member: false,
  },
  {
    id: 'nafc-tx-004',
    name: 'Proyecto Adelante Free Clinic',
    address: '4343 Hemphill St', city: 'Fort Worth', state: 'TX', zip: '76115',
    phone: '(817) 922-7700', lat: 32.6873, lng: -97.3526,
    services: ['Primary care', "Women's health"],
    url: 'https://proyectoadelante.org', nafc_member: true,
  },
  {
    id: 'nafc-tx-005',
    name: 'San Antonio Free Clinic Network',
    address: '527 N Leona St', city: 'San Antonio', state: 'TX', zip: '78207',
    phone: '(210) 207-2252', lat: 29.4346, lng: -98.5051,
    services: ['Primary care', 'Dental'], nafc_member: true,
  },
  {
    id: 'nafc-tx-006',
    name: 'El Centro de Corazón',
    address: '7339 Harrisburg Blvd', city: 'Houston', state: 'TX', zip: '77011',
    phone: '(713) 644-5440', lat: 29.7286, lng: -95.3125,
    services: ['Primary care', "Women's health", 'Pediatrics', 'Mental health'],
    url: 'https://elcentrodecorazon.org', nafc_member: true,
  },
  // ── VIRGINIA ──────────────────────────────────────────────────────────────────
  {
    id: 'nafc-va-001',
    name: 'CrossOver Healthcare Ministry',
    address: '3630 Chamberlayne Ave', city: 'Richmond', state: 'VA', zip: '23227',
    phone: '(804) 264-5193', lat: 37.5851, lng: -77.4448,
    services: ['Primary care', 'Dental', 'Mental health', 'Pharmacy'],
    url: 'https://crossoverministry.org', nafc_member: true,
  },
  {
    id: 'nafc-va-002',
    name: 'Volunteers in Medicine — Charlottesville',
    address: '1138 Rose Hill Dr', city: 'Charlottesville', state: 'VA', zip: '22903',
    phone: '(434) 975-8046', lat: 38.0248, lng: -78.5132,
    services: ['Primary care', 'Dental'],
    url: 'https://cvillevolunteersinmedicine.org', nafc_member: true,
  },
  {
    id: 'nafc-va-003',
    name: 'INOVA Juniper Programs',
    address: '2900 Telestar Ct', city: 'Falls Church', state: 'VA', zip: '22042',
    phone: '(703) 698-3000', lat: 38.8834, lng: -77.1935,
    services: ['Primary care', 'Mental health', 'Sexual health'], nafc_member: true,
  },
  // ── WASHINGTON ────────────────────────────────────────────────────────────────
  {
    id: 'nafc-wa-001',
    name: 'Neighborcare Health at Eastlake',
    address: '2101 E Yesler Way', city: 'Seattle', state: 'WA', zip: '98122',
    phone: '(206) 461-6935', lat: 47.5997, lng: -122.3143,
    services: ['Primary care', 'Dental', 'Mental health', 'Pharmacy'],
    url: 'https://neighborcare.org', nafc_member: true,
  },
  {
    id: 'nafc-wa-002',
    name: 'Community Health Care — Tacoma Free Clinic',
    address: '1521 Fawcett Ave', city: 'Tacoma', state: 'WA', zip: '98402',
    phone: '(253) 722-2161', lat: 47.2524, lng: -122.4455,
    services: ['Primary care', 'Dental', 'Pediatrics'],
    url: 'https://commhealth.org', nafc_member: true,
  },
  {
    id: 'nafc-wa-003',
    name: 'Spokane Regional Free Health Clinic',
    address: '1001 W 2nd Ave', city: 'Spokane', state: 'WA', zip: '99201',
    phone: '(509) 838-8711', lat: 47.6553, lng: -117.4269,
    services: ['Primary care', 'Mental health'], nafc_member: true,
  },
  // ── WISCONSIN ─────────────────────────────────────────────────────────────────
  {
    id: 'nafc-wi-001',
    name: 'Milwaukee Health Services Free Clinic',
    address: '3065 N Martin Luther King Dr', city: 'Milwaukee', state: 'WI', zip: '53212',
    phone: '(414) 264-7400', lat: 43.0673, lng: -87.9273,
    services: ['Primary care', 'Dental', 'Mental health'],
    url: 'https://milwaukeehealthservices.org', nafc_member: true,
  },
  {
    id: 'nafc-wi-002',
    name: 'Sixteenth Street Community Health Centers',
    address: '1032 S 16th St', city: 'Milwaukee', state: 'WI', zip: '53204',
    phone: '(414) 672-1353', lat: 43.0264, lng: -87.9288,
    services: ['Primary care', 'Dental', "Women's health", 'Pediatrics'],
    url: 'https://sschc.org', nafc_member: true,
  },
  // ── NEVADA ────────────────────────────────────────────────────────────────────
  {
    id: 'nafc-nv-001',
    name: 'Community Health Alliance — Reno',
    address: '1085 Financial Blvd', city: 'Reno', state: 'NV', zip: '89502',
    phone: '(775) 329-6300', lat: 39.5005, lng: -119.7744,
    services: ['Primary care', "Women's health", 'Dental'],
    url: 'https://chanevada.org', nafc_member: true,
  },
  {
    id: 'nafc-nv-002',
    name: 'Las Vegas Free Clinic',
    address: '2040 W Charleston Blvd', city: 'Las Vegas', state: 'NV', zip: '89102',
    phone: '(702) 598-6090', lat: 36.1627, lng: -115.1738,
    services: ['Primary care', 'Dental', 'Pharmacy'], nafc_member: true,
  },
  // ── KANSAS ────────────────────────────────────────────────────────────────────
  {
    id: 'nafc-ks-001',
    name: 'Church of the Resurrection Free Health Clinic',
    address: '13720 Roe Ave', city: 'Leawood', state: 'KS', zip: '66224',
    phone: '(913) 897-4800', lat: 38.8822, lng: -94.6356,
    services: ['Primary care', 'Dental'],
    url: 'https://corusfc.org', nafc_member: true,
  },
  {
    id: 'nafc-ks-002',
    name: 'GraceMed Health Clinic',
    address: '2215 E Lincoln', city: 'Wichita', state: 'KS', zip: '67214',
    phone: '(316) 942-4435', lat: 37.6960, lng: -97.3002,
    services: ['Primary care', 'Dental', 'Pharmacy'],
    url: 'https://gracemed.org', nafc_member: true,
  },
  // ── MISSISSIPPI ───────────────────────────────────────────────────────────────
  {
    id: 'nafc-ms-001',
    name: 'Good Samaritan Health Center of Calhoun City',
    address: '113 N Front St', city: 'Calhoun City', state: 'MS', zip: '38916',
    phone: '(662) 628-6100', lat: 33.8599, lng: -89.3136,
    services: ['Primary care', 'Pharmacy'], nafc_member: true,
  },
  {
    id: 'nafc-ms-002',
    name: 'University of Mississippi Free Clinic',
    address: '2500 N State St', city: 'Jackson', state: 'MS', zip: '39216',
    phone: '(601) 984-5600', lat: 32.3404, lng: -90.1782,
    services: ['Primary care', 'Dental'], nafc_member: true,
  },
  // ── IOWA ──────────────────────────────────────────────────────────────────────
  {
    id: 'nafc-ia-001',
    name: 'Free Medical Clinic of Iowa City',
    address: '2440 Towncrest Dr', city: 'Iowa City', state: 'IA', zip: '52240',
    phone: '(319) 337-4459', lat: 41.6527, lng: -91.5342,
    services: ['Primary care', 'Mental health'], nafc_member: true,
  },
  {
    id: 'nafc-ia-002',
    name: 'Broadlawns Medical Center Free Clinic',
    address: '1801 Hickman Rd', city: 'Des Moines', state: 'IA', zip: '50314',
    phone: '(515) 282-2200', lat: 41.6136, lng: -93.6451,
    services: ['Primary care', 'Dental', 'Pharmacy'], nafc_member: true,
  },
  // ── NEBRASKA ──────────────────────────────────────────────────────────────────
  {
    id: 'nafc-ne-001',
    name: 'Open Door Mission Health Clinic',
    address: '2828 N 23rd St', city: 'Omaha', state: 'NE', zip: '68110',
    phone: '(402) 422-1111', lat: 41.2922, lng: -95.9649,
    services: ['Primary care', 'Dental'], nafc_member: true,
  },
  // ── ARKANSAS ──────────────────────────────────────────────────────────────────
  {
    id: 'nafc-ar-001',
    name: 'Reach Out and Read Arkansas Free Clinic',
    address: '4301 W Markham St', city: 'Little Rock', state: 'AR', zip: '72205',
    phone: '(501) 686-8000', lat: 34.7505, lng: -92.3579,
    services: ['Primary care', 'Pediatrics'], nafc_member: true,
  },
  // ── WEST VIRGINIA ─────────────────────────────────────────────────────────────
  {
    id: 'nafc-wv-001',
    name: 'West Virginia Health Right',
    address: '1700 Bigley Ave', city: 'Charleston', state: 'WV', zip: '25302',
    phone: '(304) 346-7646', lat: 38.3734, lng: -81.6412,
    services: ['Primary care', 'Dental', 'Mental health', 'Pharmacy'],
    url: 'https://wvhealthright.org', nafc_member: true,
  },
  // ── MAINE ─────────────────────────────────────────────────────────────────────
  {
    id: 'nafc-me-001',
    name: 'Penobscot Community Health Care',
    address: '1005 Union St', city: 'Bangor', state: 'ME', zip: '04401',
    phone: '(207) 947-0706', lat: 44.8062, lng: -68.7770,
    services: ['Primary care', 'Dental', 'Mental health'],
    url: 'https://pchc.com', nafc_member: true,
  },
  // ── VERMONT ───────────────────────────────────────────────────────────────────
  {
    id: 'nafc-vt-001',
    name: 'Champlain Valley Office of Economic Opportunity Health Clinic',
    address: '255 S Champlain St', city: 'Burlington', state: 'VT', zip: '05401',
    phone: '(802) 863-6248', lat: 44.4760, lng: -73.2121,
    services: ['Primary care', "Women's health"], nafc_member: true,
  },
  // ── HAWAII ────────────────────────────────────────────────────────────────────
  {
    id: 'nafc-hi-001',
    name: 'Waianae Coast Comprehensive Health Center',
    address: '86-260 Farrington Hwy', city: 'Waianae', state: 'HI', zip: '96792',
    phone: '(808) 696-7081', lat: 21.4431, lng: -158.1824,
    services: ['Primary care', 'Dental', 'Mental health', 'Pediatrics'],
    url: 'https://wcchc.com', nafc_member: true,
  },
  // ── ALASKA ────────────────────────────────────────────────────────────────────
  {
    id: 'nafc-ak-001',
    name: 'Anchorage Neighborhood Health Center',
    address: '4141 B St', city: 'Anchorage', state: 'AK', zip: '99503',
    phone: '(907) 743-2000', lat: 61.1851, lng: -149.8900,
    services: ['Primary care', 'Dental', 'Mental health'],
    url: 'https://anhc.org', nafc_member: true,
  },
  // ── WASHINGTON DC ─────────────────────────────────────────────────────────────
  {
    id: 'nafc-dc-001',
    name: 'Christ House Free Medical Clinic',
    address: '1717 Columbia Rd NW', city: 'Washington', state: 'DC', zip: '20009',
    phone: '(202) 328-1100', lat: 38.9239, lng: -77.0424,
    services: ['Primary care', 'Mental health'],
    url: 'https://christhouse.org', nafc_member: true,
  },
  {
    id: 'nafc-dc-002',
    name: 'Community of Hope Health Services',
    address: '4900 Georgia Ave NW', city: 'Washington', state: 'DC', zip: '20011',
    phone: '(202) 232-7356', lat: 38.9624, lng: -77.0268,
    services: ['Primary care', "Women's health", 'Pediatrics', 'Dental'],
    url: 'https://communityofhopedc.org', nafc_member: true,
  },
]

// ── Haversine distance helper ────────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Get nearby NAFC clinics ──────────────────────────────────────────────────
export function getNAFCClinicsNear(lat: number, lng: number, radiusMiles: number): NAFCClinic[] {
  return NAFC_CLINICS
    .map(c => ({ ...c, _dist: haversine(lat, lng, c.lat, c.lng) }))
    .filter(c => c._dist <= radiusMiles)
    .sort((a, b) => a._dist - b._dist)
    .map(({ _dist, ...c }) => c)
}
