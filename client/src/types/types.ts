export interface WeddingPlanner {
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
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  weddingDate: string;
  comment: string;
}

export interface WeddingPackage {
  id: number;
  name: string;
  description: string;
  detailedDescription: string;
  price: string;
  numericPrice: number;
  rating: number;
  reviewCount: number;
  planner: WeddingPlanner;
  images: string[];
  inclusions: string[];
  reviews: Review[];
}