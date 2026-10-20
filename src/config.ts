/**
 * One file drives the name, contact details, booking mode, vehicle facts and
 * credentials shown across the whole site. Change facts here, not in pages.
 *
 * Anything listed in PLACEHOLDERS is invented or unconfirmed. `npm run
 * check:launch` fails until every entry is replaced with a real value and
 * removed from the list.
 */

export type CredentialStatus = 'held' | 'applied' | 'pending';
export type BookingProvider = 'request' | 'bokun' | 'fareharbor';

export const site = {
  name: 'Three Tickets to Adventure',
  shortName: 'Three Tickets',
  legalName: 'Three Tickets to Adventure LLC',
  tagline: 'Private Northern Arizona trips in a Highlander Platinum, with a Flagstaff local at the wheel.',
  // Production domain. Not yet confirmed as purchased.
  url: 'https://threeticketstoadventure.com',
  // false = preview: every page is noindex, robots.txt blocks crawlers and a
  // preview banner shows. Flip to true only when `npm run check:launch` passes.
  launched: false,
  base: { city: 'Flagstaff', state: 'AZ', county: 'Coconino County' },
  timezone: 'America/Phoenix',

  contact: {
    phoneDisplay: '(928) 555-0142',
    phoneHref: '+19285550142',
    email: 'hello@threeticketstoadventure.com',
    bookingsEmail: 'bookings@threeticketstoadventure.com',
    mailingAddress: 'Mailing address to come, Flagstaff, AZ',
    hours: 'Calls and texts answered 7am to 8pm, Arizona time',
  },

  driver: {
    name: 'Your driver',
    bio: [
      'A Flagstaff local who drives these roads every week and knows which pullouts are worth the stop.',
      'Placeholder bio: replace with a few true sentences about the driver, in his own words.',
    ],
    languages: ['English'],
  },

  booking: {
    /**
     * 'request'    — the booking form sends a request; the driver confirms by
     *                email or text and takes payment afterwards. No card data.
     * 'bokun' | 'fareharbor' — the last step hands off to that platform's
     *                hosted checkout using each trip's `bookingUrl`.
     */
    provider: 'request' as BookingProvider,
    // Optional form backend (e.g. Formspree, Web3Forms). Empty = the form
    // opens the guest's email app with the request filled in.
    formEndpoint: '',
    minNoticeHours: 48,
    confirmWithinHours: 24,
    extraGuestDefault: 60,
    taxIncluded: true,
  },

  cancellation: {
    freeUntilHours: 72,
    lateRefundPercent: 50,
    noShowRefundPercent: 0,
  },

  vehicle: {
    model: '2021 Toyota Highlander Platinum Hybrid',
    drive: 'Front-wheel drive',
    seatsTotal: 7,
    maxGuests: 6,
    // Front passenger seat plus the two 2nd-row captain's chairs.
    bestSeats: 3,
    // Base price covers this many guests; more pay the extra-guest fee.
    baseGuests: 4,
    // Set true once the features below are checked against the actual car.
    verified: false,
    features: [
      'Leather seats, heated and ventilated up front',
      '2nd-row captain\'s chairs and rear climate controls',
      'Panoramic glass roof for red rock and night-sky views',
      'Hybrid drivetrain: quiet on the climbs, fewer fuel stops',
      'Phone chargers at every row',
      'Cold water and snacks on every trip',
    ],
    wheelchairAccessible: false,
  },

  /**
   * Only credentials with status 'held' are ever shown on the site.
   * The launch check requires the first three to be held.
   */
  credentials: [
    { key: 'adot', label: 'ADOT Vehicle for Hire permit', status: 'pending' as CredentialStatus, detail: '' },
    { key: 'auto', label: 'Commercial auto insurance', status: 'pending' as CredentialStatus, detail: '' },
    { key: 'tpt', label: 'Arizona TPT license', status: 'pending' as CredentialStatus, detail: '' },
    { key: 'gl', label: 'General liability insurance', status: 'pending' as CredentialStatus, detail: '' },
    { key: 'grca', label: 'Grand Canyon NP Commercial Use Authorization', status: 'pending' as CredentialStatus, detail: '' },
    { key: 'cpr', label: 'First aid and CPR certified driver', status: 'pending' as CredentialStatus, detail: '' },
  ],

  /**
   * Real-world readiness. Never shown on the site; the launch check blocks
   * until every item is true. The family's purchase research found four open
   * Toyota recalls on the 2021 Highlander Hybrid Platinum they were buying
   * (VIN ...4679): 23V865000 passenger airbag sensor, 26V128000 2nd-row seat
   * recliner, 23V720000 front bumper cover, 24V452000 20-inch accessory tires.
   * Check the actual car's VIN at nhtsa.gov/recalls.
   */
  readiness: {
    recallsCompleted: false,
    brakeTireInspection: false,
    driverBackgroundCheck: false,
    zeroTolerancePolicyAdopted: false,
    firstAidKitAndWater: false,
  },

  social: {
    instagram: '',
    facebook: '',
    googleBusiness: '',
  },
} as const;

/** Dotted paths in `site` that still hold invented or unconfirmed values. */
export const PLACEHOLDERS: string[] = [
  'url',
  'contact.phoneDisplay',
  'contact.phoneHref',
  'contact.email',
  'contact.bookingsEmail',
  'contact.mailingAddress',
  'driver.name',
  'driver.bio',
];

export const nav = [
  { href: '/trips/', label: 'Trips' },
  { href: '/the-car/', label: 'The car' },
  { href: '/three-tickets/', label: 'Three Tickets' },
  { href: '/about/', label: 'About' },
  { href: '/faq/', label: 'FAQ' },
];

export const legalPages = [
  { href: '/legal/terms/', label: 'Trip terms' },
  { href: '/legal/cancellation/', label: 'Cancellation and weather' },
  { href: '/legal/release/', label: 'Release and assumption of risk' },
  { href: '/legal/safety/', label: 'Safety and zero-tolerance policy' },
  { href: '/legal/privacy/', label: 'Privacy' },
  { href: '/legal/accessibility/', label: 'Accessibility' },
];

export const heldCredentials = () => site.credentials.filter((c) => c.status === 'held');
