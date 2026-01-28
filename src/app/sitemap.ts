import { MetadataRoute } from 'next';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://alienterprises.in';

  // 1. Static Routes
  // We define these explicitly to give key pages (like Products) higher priority than others.
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // Highest priority
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9, // High priority (Hub page)
    },
    {
      url: `${baseUrl}/contactus`,
      lastModified: new Date(),
      changeFrequency: 'yearly', // Doesn't change often
      priority: 0.8,
    },
    {
      url: `${baseUrl}/aboutus`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/service-centers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/product-demo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/comparison`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5, // Lowest priority
    },
  ];

  // 2. Dynamic Product Routes (Fetched from Firestore)
  let productRoutes: MetadataRoute.Sitemap = [];
  
  try {
    // Order by creation date to keep the sitemap stable
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    productRoutes = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Handle Firestore Timestamp or fallback to current date
        // If you have an 'updatedAt' field in Firebase, use that. Otherwise 'createdAt' or new Date().
        const lastModified = data.updatedAt?.toDate 
            ? data.updatedAt.toDate() 
            : (data.createdAt?.toDate ? data.createdAt.toDate() : new Date());

        return {
            url: `${baseUrl}/products/${doc.id}`,
            lastModified: lastModified,
            changeFrequency: 'weekly',
            priority: 0.8, // Individual machines are important
        };
    });
  } catch (error) {
    console.error("Sitemap Error: Could not fetch products", error);
  }

  return [...staticRoutes, ...productRoutes];
}