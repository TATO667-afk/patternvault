import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://patternvault.gg";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${baseUrl}/opportunities`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  try {
    const skins = await prisma.skin.findMany({
      select: { id: true, updatedAt: true },
      take: 1000,
      orderBy: { updatedAt: "desc" },
    });

    const skinPages: MetadataRoute.Sitemap = skins.map((skin) => ({
      url: `${baseUrl}/skin/${skin.id}`,
      lastModified: skin.updatedAt,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...skinPages];
  } catch {
    return staticPages;
  }
}
