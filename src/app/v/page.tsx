import ShareLinkLoader from "@/components/ShareLinkLoader";

export default async function ShareLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const params = await searchParams;
  return <ShareLinkLoader encoded={params.d ?? null} />;
}
