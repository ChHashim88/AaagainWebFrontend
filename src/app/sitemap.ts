import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.bazarbeats.com';
  
  // Static core routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // Magically pull every live product from your DB to inform Google!
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.bazarbeats.com'}/api/products`);
    const products = await res.json();
    
    const productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    // Merge static pages and dynamic products!
    return [...routes, ...productRoutes];
  } catch (error) {
    // Graceful fallback if backend is asleep
    return routes;
  }
}
