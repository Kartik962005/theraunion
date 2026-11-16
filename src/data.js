const S = (d) => `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

export const ICONS = {
  dinner: S('<circle cx="24" cy="26" r="12"/><circle cx="24" cy="26" r="7.5" opacity=".6"/><path d="M6 10v9a3 3 0 0 0 3 3v18M9 10v8M12 10v9a3 3 0 0 1-3 3"/><path d="M40 10c-3 2-4 6-4 11h4v19"/>'),
  haldi: S('<path d="M8 26h32c0 8-7 14-16 14S8 34 8 26z"/><path d="M12 26c3-3 8-4 12-4s9 1 12 4"/><path d="M24 6c2 3 3 5 3 7a3 3 0 0 1-6 0c0-2 1-4 3-7z"/><path d="M14 12c1.5 2 2 3 2 4.5a2 2 0 0 1-4 0c0-1.5.5-2.5 2-4.5zM34 12c1.5 2 2 3 2 4.5a2 2 0 0 1-4 0c0-1.5.5-2.5 2-4.5z"/>'),
  carnival: S('<circle cx="24" cy="20" r="13"/><circle cx="24" cy="20" r="2.5"/><path d="M24 7v26M11 20h26M14.8 10.8l18.4 18.4M33.2 10.8L14.8 29.2"/><path d="M16 42l8-19 8 19M12 42h24"/>'),
  sangeet: S('<path d="M10 16c0-3 6-5 14-5s14 2 14 5v16c0 3-6 5-14 5s-14-2-14-5z"/><ellipse cx="24" cy="16" rx="14" ry="5"/><path d="M10 20l28 8M10 28l28-8"/><path d="M40 6l-6 8M8 6l6 8"/>'),
  mayra: S('<rect x="8" y="20" width="32" height="20" rx="2"/><path d="M6 14h36v6H6zM24 14v26"/><path d="M24 14c-3-6-11-7-11-2 0 3 6 2 11 2zM24 14c3-6 11-7 11-2 0 3-6 2-11 2z"/>'),
  baraat: S('<path d="M6 22C8 12 16 6 24 6s16 6 18 16z"/><path d="M6 22c3 2 6 2 9 0 3 2 6 2 9 0 3 2 6 2 9 0 3 2 6 2 9 0"/><path d="M24 6V3M24 22v20M20 42h8"/><circle cx="10" cy="27" r="1"/><circle cx="38" cy="27" r="1"/>'),
  varmala: S('<path d="M8 8c0 18 7 30 16 30S40 26 40 8"/><circle cx="9" cy="14" r="2.4"/><circle cx="11" cy="21" r="2.4"/><circle cx="14" cy="28" r="2.4"/><circle cx="19" cy="34" r="2.4"/><circle cx="24" cy="37" r="2.6"/><circle cx="29" cy="34" r="2.4"/><circle cx="34" cy="28" r="2.4"/><circle cx="37" cy="21" r="2.4"/><circle cx="39" cy="14" r="2.4"/><path d="M24 40v4"/>'),
  phere: S('<path d="M24 6c5 6 8 10 8 15a8 8 0 0 1-16 0c0-3 2-6 4-8 0 3 1 5 3 5-1-5 0-8 1-12z"/><path d="M8 32h32l-4 10H12z"/><path d="M6 32h36"/><path d="M14 37h20" opacity=".6"/>'),
  reception: S('<path d="M14 6h10l-1 12a4 4 0 0 1-8 0z"/><path d="M19 22v14M14 36h10"/><path d="M28 10l9.5 3-4 11a4 4 0 0 1-7.6-2.5z"/><path d="M29.5 26l-4 13M22 37l8 2.5"/><path d="M38 4l1 3M42 8l-3 1M35 6l-1-2"/>'),
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>'
};

// Source: "Apeksha & Raghav – Wedding Event Flow" (family schedule)
export const DAYS = [
  {
    date: '24', iso: '2026-11-24', weekday: 'Tuesday', title: 'The Welcome',
    events: [
      { name: 'Welcome Dinner', accent: '#f29a1f', icon: 'dinner', time: '5:30 PM onwards', start: '17:30', hours: 4, venue: 'Sunset Lawns',
        desc: 'Arrive, unwind and raise a toast as the sun sets over the Arabian Sea.' }
    ]
  },
  {
    date: '25', iso: '2026-11-25', weekday: 'Wednesday', title: 'Colour & Music',
    events: [
      { name: 'Haldi', accent: '#ffc61a', icon: 'haldi', time: '9:00 AM onwards', start: '09:00', hours: 3, venue: 'Cascade',
        desc: 'Turmeric, laughter and blessings — wear something you don’t mind turning yellow!' },
      { name: 'Carnival', accent: '#ff5fa2', icon: 'carnival', time: '12:00 PM onwards', start: '12:00', hours: 4, venue: 'Rooftop',
        desc: 'Games, treats and good fun under the Goan sky.' },
      { name: 'Tilak & Sangeet', accent: '#d63aa0', icon: 'sangeet', time: '6:00 PM onwards', start: '18:00', hours: 5, venue: 'Ballroom',
        desc: 'The Tilak blessing for the groom, followed by a night of music, dance and performances.', grand: true }
    ]
  },
  {
    date: '26', iso: '2026-11-26', weekday: 'Thursday', title: 'The Wedding',
    events: [
      { name: 'Mayra / Bhaat', accent: '#3fb27f', icon: 'mayra', time: '9:00 AM onwards', start: '09:00', hours: 2.5, venue: 'Cascade',
        desc: 'The bride’s maternal family arrives with gifts, love and blessings.' },
      { name: 'Korath & Baraat', accent: '#ff8a1f', icon: 'baraat', time: '12:30 PM onwards', start: '12:30', hours: 3, venue: 'Porch, next to PFA',
        desc: 'The groom’s family is welcomed and the baraat dances its way in with dhol and cheer.' },
      { name: 'Varmala', accent: '#ff6f91', icon: 'varmala', time: '5:00 PM onwards', start: '17:00', hours: 1, venue: 'Mandovi & Zuari Lawns',
        desc: 'The exchange of garlands.' },
      { name: 'Phere', accent: '#ff5a2c', icon: 'phere', time: '6:00 PM onwards', start: '18:00', hours: 2, venue: 'Mandovi & Zuari Lawns',
        desc: 'Seven vows around the sacred fire.', grand: true },
      { name: 'Reception', accent: '#e8c477', icon: 'reception', time: '8:00 PM onwards', start: '20:00', hours: 4, venue: 'Mandovi & Zuari Lawns',
        desc: 'An evening to celebrate Mr & Mrs — dinner, drinks and dancing.' }
    ]
  }
];

export const WEDDING_MOMENT = '2026-11-26T18:00:00+05:30';

export const VOWS = [
  { hi: 'प्रथम वचन', en: 'To nourish each other, and the home we build together.' },
  { hi: 'द्वितीय वचन', en: 'To grow strong together — in body, mind and spirit.' },
  { hi: 'तृतीय वचन', en: 'To share all that life gives us, and to build it honestly.' },
  { hi: 'चतुर्थ वचन', en: 'To fill our families with love, respect and joy.' },
  { hi: 'पंचम वचन', en: 'To care for the generations that come after us.' },
  { hi: 'षष्ठ वचन', en: 'To stand by each other in health, through every season.' },
  { hi: 'सप्तम वचन', en: 'To be best friends and companions, for this life and beyond.' }
];
