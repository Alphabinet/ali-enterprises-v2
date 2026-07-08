import ProductsClient from "./ProductsClient";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// Optional: Revalidate cache every hour for faster performance
export const revalidate = 3600; 

export default async function ProductsPage() {
  const querySnapshot = await getDocs(collection(db, "products"));
  
  const initialProducts = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description || "Industrial grade machinery designed for high output and reliability.",
      modelSeries: data.category || "Industrial", 
      thumbnail: data.thumbnail || (data.images && data.images.length > 0 ? data.images[0] : "/machines/default.png"),
      images: data.images || [],
      features: data.features || ["High Efficiency", "Low Maintenance", "ISO Certified"],
    };
  });

  return <ProductsClient initialProducts={initialProducts} />;
}