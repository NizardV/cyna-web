import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Galerie d'images produit avec grande image principale et miniatures cliquables.
 *
 * @param {{
 *   images: string[],
 *   productName: string
 * }} props
 */
export function ProductGallery({ images, productName }) {
  const [mainImage, setMainImage] = useState(images?.[0]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full md:w-1/2 bg-gray-100 rounded-2xl h-96 flex items-center justify-center">
        <p className="text-gray-400">Aucune image disponible</p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/2">
      <div className="bg-cynaDark rounded-2xl h-96 flex items-center justify-center relative overflow-hidden shadow-lg border border-gray-200 group">
        <img
          src={mainImage}
          alt={productName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-cynaDark/10" />
      </div>

      <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(img)}
            className={cn(
              "h-20 w-1/3 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
              mainImage === img ? "border-cynaPurple ring-2 ring-cynaPurple/20" : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <img
              src={img}
              alt={`${productName} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}