import type { Metadata } from "next";
import ShareLinkLoader from "@/components/ShareLinkLoader";

const TITLE = "Shared trace";
const DESCRIPTION = "Open this link to watch the exact code and trace someone shared with you, byte for byte.";

// Explicit openGraph/twitter (rather than relying on the root layout's
// inherited defaults) since this is the one route people actually paste
// as a link into chat/social — it should preview as itself, not as the
// generic landing page.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default async function ShareLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const params = await searchParams;
  return <ShareLinkLoader encoded={params.d ?? null} />;
}
