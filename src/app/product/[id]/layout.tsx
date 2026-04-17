import { Metadata } from 'next';
import axios from 'axios';

type Props = {
  params: { id: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    // We use the same frontend fallback logic
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com';
    const { data } = await axios.get(`${apiUrl}/api/products/${id}`);
    
    // Cloudinary images normally shouldn't start with / if they're absolute, but we format it safely.
    const imageUrl = data.images && data.images.length > 0 
      ? (data.images[0].startsWith('http') ? data.images[0] : `${apiUrl}${data.images[0]}`) 
      : "";

    return {
      title: `${data.name} | Bazar Beats`,
      description: data.description?.substring(0, 160) || "Explore premium footwear at Bazar Beats.",
      openGraph: {
        title: `${data.name} | Bazar Beats`,
        description: data.description?.substring(0, 160),
        images: imageUrl ? [{ url: imageUrl }] : [],
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: `${data.name} | Bazar Beats`,
        description: data.description?.substring(0, 160),
        images: imageUrl ? [imageUrl] : [],
      }
    };
  } catch (error) {
    return {
      title: "Product | Bazar Beats",
      description: "Explore premium exclusives at Bazar Beats."
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
