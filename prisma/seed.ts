import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const POPULAR_SKINS = [
  { weapon: "AK-47", skinName: "Case Hardened", rarity: "Classified", type: "Rifle" },
  { weapon: "AK-47", skinName: "Fire Serpent", rarity: "Covert", type: "Rifle" },
  { weapon: "AK-47", skinName: "Asiimov", rarity: "Covert", type: "Rifle" },
  { weapon: "AWP", skinName: "Dragon Lore", rarity: "Covert", type: "Sniper Rifle" },
  { weapon: "AWP", skinName: "Medusa", rarity: "Covert", type: "Sniper Rifle" },
  { weapon: "AWP", skinName: "Asiimov", rarity: "Covert", type: "Sniper Rifle" },
  { weapon: "M4A1-S", skinName: "Printstream", rarity: "Covert", type: "Rifle" },
  { weapon: "M4A4", skinName: "Howl", rarity: "Contraband", type: "Rifle" },
  { weapon: "Desert Eagle", skinName: "Blaze", rarity: "Restricted", type: "Pistol" },
  { weapon: "Glock-18", skinName: "Fade", rarity: "Classified", type: "Pistol" },
  { weapon: "Karambit", skinName: "Doppler", rarity: "Covert", type: "Knife" },
  { weapon: "Karambit", skinName: "Fade", rarity: "Covert", type: "Knife" },
  { weapon: "Butterfly Knife", skinName: "Doppler", rarity: "Covert", type: "Knife" },
  { weapon: "Sport Gloves", skinName: "Pandora's Box", rarity: "Extraordinary", type: "Gloves" },
];

const WEARS = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];

async function main() {
  console.log("🌱 Seeding database...");

  const marketplaces = await Promise.all([
    prisma.marketplace.upsert({
      where: { slug: "steam" },
      create: { slug: "steam", name: "steam", displayName: "Steam Market", baseUrl: "https://steamcommunity.com/market", feePercent: 15 },
      update: {},
    }),
    prisma.marketplace.upsert({
      where: { slug: "csfloat" },
      create: { slug: "csfloat", name: "csfloat", displayName: "CSFloat", baseUrl: "https://csfloat.com", feePercent: 2 },
      update: {},
    }),
    prisma.marketplace.upsert({
      where: { slug: "skinport" },
      create: { slug: "skinport", name: "skinport", displayName: "Skinport", baseUrl: "https://skinport.com", feePercent: 12 },
      update: {},
    }),
    prisma.marketplace.upsert({
      where: { slug: "buff" },
      create: { slug: "buff", name: "buff", displayName: "Buff Market", baseUrl: "https://buff.163.com", feePercent: 2.5 },
      update: {},
    }),
    prisma.marketplace.upsert({
      where: { slug: "dmarket" },
      create: { slug: "dmarket", name: "dmarket", displayName: "DMarket", baseUrl: "https://dmarket.com", feePercent: 5 },
      update: {},
    }),
    prisma.marketplace.upsert({
      where: { slug: "gamerpay" },
      create: { slug: "gamerpay", name: "gamerpay", displayName: "GamerPay", baseUrl: "https://gamerpay.gg", feePercent: 5 },
      update: {},
    }),
  ]);

  // Seed skins
  for (const s of POPULAR_SKINS) {
    for (const wear of WEARS) {
      const marketHashName = `${s.weapon} | ${s.skinName} (${wear})`;
      await prisma.skin.upsert({
        where: { marketHashName },
        create: {
          marketHashName,
          name: `${s.weapon} | ${s.skinName}`,
          weapon: s.weapon,
          skin: s.skinName,
          rarity: s.rarity,
          type: s.type,
        },
        update: {},
      });
    }
  }

  console.log("✅ Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
