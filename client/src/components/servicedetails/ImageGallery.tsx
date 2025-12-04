import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  thumbnail: string;
  title: string;
}

const ImageGallery = ({ images, thumbnail, title }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="h-96 rounded-xl overflow-hidden shadow-lg">
        <img
          src={
            images[selectedImage] ||
            thumbnail ||
            "/placeholder-image.jpg"
          }
          alt={title}
          className="w-full h-full object-cover object-center"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(index)}
              className={`rounded-lg overflow-hidden h-20 transition-all ${
                selectedImage === index
                  ? "ring-2 ring-pink-500 transform scale-105"
                  : "hover:opacity-75"
              }`}
            >
              <img
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;