import { Metadata } from "next";
import SkinDetailClient from "./client";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  return { title: `Skin ${id} | PatternVault` };
}

export default async function SkinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SkinDetailClient id={id} />;
}
