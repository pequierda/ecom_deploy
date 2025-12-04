export interface WeddingPackage {
  id: number;
  name: string;
  description: string;
  detailedDescription: string;
  price: string;
  numericPrice: number;
  rating: number;
  reviewCount: number;
  planner: {
    id: string;
    name: string;
    businessName: string;
    location: string;
    rating: number;
    packageCount: number;
    yearsOfExperience: number;
    specialties: string[];
    image: string;
    coverImage: string;
    phone: string;
    email: string;
    bio: string;
    completedWeddings: number;
  };
  images: string[];
  inclusions: string[];
  reviews: {
    id: number;
    author: string;
    rating: number;
    date: string;
    comment: string;
    weddingDate: string;
  }[];
}
