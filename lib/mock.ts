// Mock data for PatternVault — replace with DB queries once seeded

export interface MockPattern {
  id: string;
  patternId: number;
  skinName: string;
  weaponName: string;
  slug: string;
  imageUrl: string;
  tier: number;
  isBlueGem: boolean;
  bluePercent?: number;
  goldPercent?: number;
  fadePercent?: number;
  phase?: string;
  rarityScore: number;
  premiumMulti: number;
  lastSalePrice?: number;
  lastSaleDate?: string;
  description?: string;
  inspectLink?: string;
}

export const MOCK_PATTERNS: MockPattern[] = [
  // ── AK-47 Case Hardened Blue Gems ─────────────────────────────
  {
    id: "p-661", patternId: 661,
    skinName: "Case Hardened", weaponName: "AK-47",
    slug: "ak47-case-hardened-661",
    imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NVXIr9ZBwFvVtkb3kh6T0E15lqFJPcQuqW5gBXlHZzJgpNsv_pIwd3wfLYZG4k6sGxkNbbkqukY-uGxWkC6sAlj9CuvNihy1ez-kVhZzjyLa-WK1M6vFMO",
    tier: 5, isBlueGem: true,
    bluePercent: 97.2, goldPercent: 1.8,
    rarityScore: 99.8, premiumMulti: 15.0,
    lastSalePrice: 185000, lastSaleDate: "2024-08-12",
    description: "The crown jewel of all Case Hardened patterns. Pattern 661 features near-complete blue coverage on both sides.",
  },
  {
    id: "p-179", patternId: 179,
    skinName: "Case Hardened", weaponName: "AK-47",
    slug: "ak47-case-hardened-179",
    imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NVXIr9ZBwFvVtkb3kh6T0E15lqFJPcQuqW5gBXlHZzJgpNsv_pIwd3wfLYZG4k6sGxkNbbkqukY-uGxWkC6sAlj9CuvNihy1ez-kVhZzjyLa-WK1M6vFMO",
    tier: 5, isBlueGem: true,
    bluePercent: 95.1, goldPercent: 3.2,
    rarityScore: 99.2, premiumMulti: 12.0,
    lastSalePrice: 145000, lastSaleDate: "2024-06-20",
    description: "Pattern 179 is one of the most sought-after blue gems, known for its incredibly high blue coverage.",
  },
  {
    id: "p-760", patternId: 760,
    skinName: "Case Hardened", weaponName: "AK-47",
    slug: "ak47-case-hardened-760",
    imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NVXIr9ZBwFvVtkb3kh6T0E15lqFJPcQuqW5gBXlHZzJgpNsv_pIwd3wfLYZG4k6sGxkNbbkqukY-uGxWkC6sAlj9CuvNihy1ez-kVhZzjyLa-WK1M6vFMO",
    tier: 4, isBlueGem: true,
    bluePercent: 88.4, goldPercent: 8.1,
    rarityScore: 97.1, premiumMulti: 8.5,
    lastSalePrice: 62000, lastSaleDate: "2024-10-05",
  },
  {
    id: "p-387", patternId: 387,
    skinName: "Case Hardened", weaponName: "AK-47",
    slug: "ak47-case-hardened-387",
    imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NVXIr9ZBwFvVtkb3kh6T0E15lqFJPcQuqW5gBXlHZzJgpNsv_pIwd3wfLYZG4k6sGxkNbbkqukY-uGxWkC6sAlj9CuvNihy1ez-kVhZzjyLa-WK1M6vFMO",
    tier: 4, isBlueGem: false,
    bluePercent: 74.3, goldPercent: 18.2,
    rarityScore: 91.5, premiumMulti: 4.2,
    lastSalePrice: 18500, lastSaleDate: "2024-09-18",
  },
  // ── Karambit Fade ──────────────────────────────────────────────
  {
    id: "k-701", patternId: 701,
    skinName: "Fade", weaponName: "Karambit",
    slug: "karambit-fade-701",
    imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NVXIr9ZBwFvVtkb3kh6T0E15lqFJPcQuqW5gBXlHZzJgpNsv_pIwd3wfLYZG4k6sGxkNbbkqukY-uGxWkC6sAlj9CuvNihy1ez-kVhZzjyLa-WK1M6vFMO",
    tier: 5, isBlueGem: false,
    fadePercent: 100,
    rarityScore: 99.5, premiumMulti: 2.1,
    lastSalePrice: 4800, lastSaleDate: "2024-11-01",
    description: "100% Fade — maximum purple-to-yellow gradient on both sides. The rarest Karambit Fade pattern.",
  },
  {
    id: "k-490", patternId: 490,
    skinName: "Fade", weaponName: "Karambit",
    slug: "karambit-fade-490",
    imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NVXIr9ZBwFvVtkb3kh6T0E15lqFJPcQuqW5gBXlHZzJgpNsv_pIwd3wfLYZG4k6sGxkNbbkqukY-uGxWkC6sAlj9CuvNihy1ez-kVhZzjyLa-WK1M6vFMO",
    tier: 4, isBlueGem: false,
    fadePercent: 97.3,
    rarityScore: 95.2, premiumMulti: 1.6,
    lastSalePrice: 3200, lastSaleDate: "2024-10-22",
  },
  // ── Doppler ────────────────────────────────────────────────────
  {
    id: "d-sapphire", patternId: 415,
    skinName: "Doppler", weaponName: "Karambit",
    slug: "karambit-doppler-sapphire-415",
    imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NVXIr9ZBwFvVtkb3kh6T0E15lqFJPcQuqW5gBXlHZzJgpNsv_pIwd3wfLYZG4k6sGxkNbbkqukY-uGxWkC6sAlj9CuvNihy1ez-kVhZzjyLa-WK1M6vFMO",
    tier: 5, isBlueGem: false,
    phase: "Sapphire",
    rarityScore: 99.0, premiumMulti: 3.5,
    lastSalePrice: 12500, lastSaleDate: "2024-11-10",
    description: "Sapphire — the rarest Doppler phase, featuring a stunning all-blue finish.",
  },
  {
    id: "d-bp", patternId: 225,
    skinName: "Doppler", weaponName: "Karambit",
    slug: "karambit-doppler-blackpearl-225",
    imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NVXIr9ZBwFvVtkb3kh6T0E15lqFJPcQuqW5gBXlHZzJgpNsv_pIwd3wfLYZG4k6sGxkNbbkqukY-uGxWkC6sAlj9CuvNihy1ez-kVhZzjyLa-WK1M6vFMO",
    tier: 5, isBlueGem: false,
    phase: "Black Pearl",
    rarityScore: 98.5, premiumMulti: 3.2,
    lastSalePrice: 10800, lastSaleDate: "2024-10-15",
  },
  {
    id: "d-ruby", patternId: 568,
    skinName: "Doppler", weaponName: "Butterfly Knife",
    slug: "butterfly-doppler-ruby-568",
    imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NVXIr9ZBwFvVtkb3kh6T0E15lqFJPcQuqW5gBXlHZzJgpNsv_pIwd3wfLYZG4k6sGxkNbbkqukY-uGxWkC6sAlj9CuvNihy1ez-kVhZzjyLa-WK1M6vFMO",
    tier: 5, isBlueGem: false,
    phase: "Ruby",
    rarityScore: 98.0, premiumMulti: 2.8,
    lastSalePrice: 8200, lastSaleDate: "2024-09-28",
  },
  // ── Five-SeveN Case Hardened ───────────────────────────────────
  {
    id: "f-278", patternId: 278,
    skinName: "Case Hardened", weaponName: "Five-SeveN",
    slug: "fiveseven-case-hardened-278",
    imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NVXIr9ZBwFvVtkb3kh6T0E15lqFJPcQuqW5gBXlHZzJgpNsv_pIwd3wfLYZG4k6sGxkNbbkqukY-uGxWkC6sAlj9CuvNihy1ez-kVhZzjyLa-WK1M6vFMO",
    tier: 5, isBlueGem: true,
    bluePercent: 98.5, goldPercent: 1.2,
    rarityScore: 99.9, premiumMulti: 25.0,
    lastSalePrice: 48000, lastSaleDate: "2024-07-14",
    description: "The #1 Five-SeveN Blue Gem. Pattern 278 holds the record for the highest blue percentage on any Five-SeveN.",
  },
  {
    id: "f-690", patternId: 690,
    skinName: "Case Hardened", weaponName: "Five-SeveN",
    slug: "fiveseven-case-hardened-690",
    imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NVXIr9ZBwFvVtkb3kh6T0E15lqFJPcQuqW5gBXlHZzJgpNsv_pIwd3wfLYZG4k6sGxkNbbkqukY-uGxWkC6sAlj9CuvNihy1ez-kVhZzjyLa-WK1M6vFMO",
    tier: 5, isBlueGem: true,
    bluePercent: 94.7, goldPercent: 4.1,
    rarityScore: 98.8, premiumMulti: 18.0,
    lastSalePrice: 32000, lastSaleDate: "2024-08-02",
  },
];

export const TRENDING_PATTERNS = MOCK_PATTERNS.slice(0, 6);
export const BLUE_GEMS = MOCK_PATTERNS.filter(p => p.isBlueGem);
export const FADE_PATTERNS = MOCK_PATTERNS.filter(p => p.fadePercent != null);
export const DOPPLER_PATTERNS = MOCK_PATTERNS.filter(p => p.phase != null);

export const STATS = {
  totalPatterns: 12847,
  totalSkins: 1249,
  blueGems: 312,
  totalSales: 48291,
  avgPremium: "340%",
  lastUpdated: "2 minutes ago",
};
