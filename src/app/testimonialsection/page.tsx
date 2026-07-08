import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import TestimonialsSection from "./TestimonialsSection";

export const revalidate = 3600; // Cache for 1 hour

export default async function Page() {
  const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  
  // FIX: Map the Firestore data to a plain JavaScript object.
  // We explicitly extract strings and numbers to prevent passing 
  // complex Firebase Timestamp objects to the Client Component.
  const testimonials = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "",
      image: data.image || "",
      quote: data.quote || "",
      role: data.role || "",
      rating: data.rating || 5, 
    };
  });

  return <TestimonialsSection testimonials={testimonials} />;
}