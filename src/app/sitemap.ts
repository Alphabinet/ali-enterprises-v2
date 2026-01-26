import { MetadataRoute } from 'next';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://alienterprises.in';

  // 1. Static Routes (Updated with new pages)
  const staticRoutes = [
    '',               // Home
    '/aboutus',       // About Us
    '/products',      // Product Catalog
    '/contactus',     // Contact
    '/service-centers', // Service Network
    '/gallery',       // Gallery
    '/comparison',    // Comparison (New)
    '/product-demo',  // Product Demos (New)
    '/terms',         // Terms & Conditions
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic Product Routes (Fetched from Firestore)
  let productRoutes: MetadataRoute.Sitemap = [];
  
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    
    productRoutes = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Handle Firestore Timestamp or fallback to current date
        const lastModified = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date();

        return {
            url: `${baseUrl}/products/${doc.id}`,
            lastModified: lastModified,
            changeFrequency: 'weekly',
            priority: 0.9, // Higher priority for products
        };
    });
  } catch (error) {
    console.error("Sitemap Error: Could not fetch products", error);
  }

  return [...staticRoutes, ...productRoutes];
}