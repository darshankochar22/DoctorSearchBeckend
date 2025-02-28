"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";

const normalizeProductData = (item) => {
  if (!item || !item.objects || !item.objects[0]) return null;
  
  const product = item.objects[0];
  const validImages = product.images?.filter(img => {
    const url = img.url;
    return url && !url.includes('akam') && !url.includes('pixel');
  }) || [];
  return {
    title: product.title || "Unknown Product",
    image_src: validImages.length > 0 
    ? validImages[0].url 
    : "/placeholder.png",
    offerPrice: product.offerPrice || 
                product.offerPriceDetails?.text || 
                product.specs?.january_7_2020 || 
                "Price not available",
    availability: product.availability || false,
    category: product.category || product.categories?.[0]?.name || "Uncategorized",
    text: product.text || "No description available",
    pageUrl: product.pageUrl || "#",
    brand: product.brand || product.specs?.brand || 
           (product.title?.includes("Sennheiser") ? "Sennheiser" : "Unknown Brand"),
    specs: product.specs || {},
    additional_details: {
      weight: product.specs?.weight || "N/A",
      model: product.specs?.["238g"] || "N/A",
      release_date: product.specs?.product_release_date || "N/A",
    }
  };
};

export function JsonCarousel({ jsonData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const normalizedData = jsonData
    .map(normalizeProductData)
    .filter(item => item !== null);

  const nextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % normalizedData.length);
  };

  const prevCard = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + normalizedData.length) % normalizedData.length
    );
  };

  if (normalizedData.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No product data available</p>
        </CardContent>
      </Card>
    );
  }

  const currentItem = normalizedData[currentIndex];

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">{currentItem.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full flex justify-center">
            {currentItem.image_src ? (
             <div className="relative w-[200px] h-[200px]">
             <Image
               src={currentItem.image_src}
               alt={currentItem.title || "Product Image"}
               fill
               className="rounded-md object-contain"
               onError={(e) => {
                 console.log("Image failed to load:", e.target.src);
                 e.target.src = "/placeholder.png";
               }}
               priority={true}  // Add this to prioritize loading
             />
           </div>
            ) : (
              <p className="text-center text-gray-500">No Image Available</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-semibold">{currentItem.offerPrice}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Brand</p>
              <p className="font-semibold">{currentItem.brand}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-semibold">{currentItem.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Availability</p>
              <p
                className={`font-semibold ${
                  currentItem.availability ? "text-green-600" : "text-red-600"
                }`}
              >
                {currentItem.availability ? "In Stock" : "Out of Stock"}
              </p>
            </div>
          </div>

          {Object.entries(currentItem.additional_details).some(([_, value]) => value !== "N/A") && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(currentItem.additional_details).map(([key, value]) => 
                value !== "N/A" ? (
                  <div key={key}>
                    <p className="text-sm text-gray-500">{key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.slice(1)}</p>
                    <p className="font-semibold">{value}</p>
                  </div>
                ) : null
              )}
            </div>
          )}

          <div className="pt-4">
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-sm mt-1">{currentItem.text}</p>
          </div>

          <a
            href={currentItem.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-500 hover:text-blue-700 mt-4"
          >
            View Product <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      <Button
        variant="ghost"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 h-8 w-8 p-0"
        onClick={prevCard}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 h-8 w-8 p-0"
        onClick={nextCard}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="absolute -bottom-6 left-0 right-0 flex justify-center space-x-2">
        {normalizedData.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-blue-500" : "bg-gray-300"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
