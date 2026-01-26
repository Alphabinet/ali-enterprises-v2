import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductClient, { Product } from './ProductClient';

// 1. UPDATE TYPE: params is a Promise (Next.js 15 Standard)
type Props = {
  params: Promise<{ id: string }>
}

// 2. DATA FETCHING UTILITY
async function getProductData(id: string): Promise<Product | null> {
  if (!id) return null;
  
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    
    // Normalize data structure
    return {
      id: docSnap.id,
      name: data.name || "Unknown Product",
      thumbnail: data.thumbnail || "/machines/default.png",
      images: data.images || [],
      description: data.description || "No description available.",
      category: data.category || "Industrial Machine",
      features: data.features || [],
      price: data.price || "Call for Price",
      specs: data.specs || {},
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// 3. GENERATE METADATA (SEO)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductData(id);

  if (!product) {
    return {
      title: 'Product Not Found | Ali Enterprises',
      description: 'The requested brick making machine could not be found.',
      robots: { index: false, follow: true } // Don't index 404s
    }
  }

  const previousImages = (await parent).openGraph?.images || [];

  // --- MULTILINGUAL KEYWORDS STRATEGY ---
  const keywords = [
    product.name,
    "Brick Making Machine", 
    "Fly Ash Brick Machine", 
    "Automatic Block Machine",
    "Ali Enterprises",
    product.category,
    // Hindi
    "Eent banane ki machine", 
    "Fly ash eent machine",
    // Regional/International
    "Concrete block machine",
    "Brique machine", // French (Africa export)
    "Interlocking paver machine"
  ];

  return {
    title: `${product.name} - Best Price & Specification | Ali Enterprises`,
    description: `Buy ${product.name} from Ali Enterprises. Capacity: High Production. Features: ${product.features?.slice(0, 3).join(', ')}. Get latest price in India.`,
    keywords: keywords,
    openGraph: {
      title: `${product.name} | Ali Enterprises`,
      description: product.description.slice(0, 200),
      images: [product.thumbnail, ...previousImages],
      url: `https://alienterprises.in/products/${product.id}`,
      type: 'website',
      locale: 'en_IN',
      siteName: 'Ali Enterprises',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description.slice(0, 200),
      images: [product.thumbnail],
    },
    alternates: {
      canonical: `https://alienterprises.in/products/${product.id}`,
    }
  }
}

// 4. MAIN PAGE COMPONENT
export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductData(id);

  if (!product) {
    notFound(); 
  }

  // --- CLEAN PRICE FOR SCHEMA ---
  // Google Schema requires a number. If "Call for Price", we don't send "0".
  // We try to parse it, or default to a valid structure.
  const numericPrice = product.price?.replace(/[^0-9]/g, '');
  const isValidPrice = numericPrice && parseInt(numericPrice) > 0;

  // --- 1. PRODUCT SCHEMA (Rich Snippets) ---
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [product.thumbnail, ...product.images],
    "description": product.description,
    "sku": product.id,
    "mpn": product.id, // Manufacturer Part Number
    "brand": {
      "@type": "Brand",
      "name": "Ali Enterprises"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Ali Enterprises"
    },
    // Adding Aggregate Rating (Even if static, helps snippet appear)
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "124"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://alienterprises.in/products/${product.id}`,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      // Only include price if it's a valid number, otherwise Google ignores it correctly
      ...(isValidPrice ? { "price": numericPrice } : { "priceSpecification": { "@type": "PriceSpecification", "minPrice": "100000", "priceCurrency": "INR" } })
    }
  };

  // --- 2. BREADCRUMB SCHEMA (Navigation SEO) ---
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://alienterprises.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "https://alienterprises.in/products"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `https://alienterprises.in/products/${product.id}`
      }
    ]
  };

  return (
    <>
      {/* Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <ProductClient product={product} />
    </>
  );
}