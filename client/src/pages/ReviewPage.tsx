// ReviewPage.tsx
import { useState, useEffect } from "react";
import {
  Star,
  MapPin,
  Users,
  ChevronLeft,
  Filter,
  Calendar,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

// Mock data for the planner
const mockPlanner = {
  id: 2,
  name: "Sarah Johnson",
  businessName: "Elegant Weddings Co.",
  profilePicture: "/placeholder-avatar.jpg",
  location: "Manila, Philippines",
  averageRating: 4.7,
  totalReviews: 42,
  completedWeddings: 78,
  experienceYears: 8,
};

// Mock reviews data with planner replies
const mockReviews = [
  {
    id: 1,
    author: "Maria Rodriguez",
    rating: 5,
    comment: "Sarah was absolutely amazing! She made our wedding day perfect and handled every detail with care. We couldn't have asked for a better planner.",
    weddingDate: "October 15, 2023",
    date: "Nov 2, 2023",
    packageName: "Premium Wedding Package",
    plannerReply: {
      comment: "Thank you so much, Maria! It was an absolute pleasure working with you and Carlos. Your wedding was beautiful, and I'm so happy I could help make your special day everything you dreamed of. Wishing you both a lifetime of happiness!",
      date: "Nov 3, 2023",
    }
  },
  {
    id: 2,
    author: "James Wilson",
    rating: 4,
    comment: "Professional and organized. Sarah made the planning process smooth and stress-free. Would recommend her services to anyone.",
    weddingDate: "September 8, 2023",
    date: "Sep 20, 2023",
    packageName: "Standard Wedding Package",
    plannerReply: {
      comment: "Thank you for your kind words, James! I'm glad I could help make your wedding planning experience stress-free. It was wonderful working with you and Emily. Best wishes for your marriage!",
      date: "Sep 21, 2023",
    }
  },
  {
    id: 3,
    author: "Sophia Chen",
    rating: 5,
    comment: "Exceeded all our expectations! Sarah's attention to detail is incredible. She transformed our vision into reality and handled all the vendors perfectly.",
    weddingDate: "August 22, 2023",
    date: "Sep 5, 2023",
    packageName: "Luxury Wedding Package"
  },
  {
    id: 4,
    author: "Michael Thompson",
    rating: 5,
    comment: "Sarah is a true professional. She managed our destination wedding flawlessly and solved every problem before we even knew about them.",
    weddingDate: "July 30, 2023",
    date: "Aug 15, 2023",
    packageName: "Destination Wedding Package",
    plannerReply: {
      comment: "Michael, thank you for your wonderful review! Destination weddings come with their unique challenges, but your positive attitude and clear vision made everything easier. So happy you and Sarah enjoyed your special day in Boracay!",
      date: "Aug 16, 2023",
    }
  },
  {
    id: 5,
    author: "Lisa Garcia",
    rating: 4,
    comment: "Great experience overall. Sarah was responsive and creative. The only reason for 4 stars instead of 5 was a minor miscommunication with one vendor.",
    weddingDate: "June 17, 2023",
    date: "Jul 2, 2023",
    packageName: "Standard Wedding Package",
    plannerReply: {
      comment: "Thank you for your feedback, Lisa. I appreciate you bringing the vendor communication issue to my attention - I've since implemented a new system to ensure better coordination with all our partners. I'm glad you still enjoyed your overall experience and wish you and Mark all the best!",
      date: "Jul 3, 2023",
    }
  },
  {
    id: 6,
    author: "Robert Martinez",
    rating: 5,
    comment: "Absolutely perfect! Sarah went above and beyond to make our special day memorable. Her coordination skills are exceptional.",
    weddingDate: "May 12, 2023",
    date: "May 28, 2023",
    packageName: "Premium Wedding Package",
    plannerReply: {
      comment: "Robert, your wedding was truly special! The cultural elements you incorporated made it unique and memorable. Thank you for trusting me with your special day. Wishing you and Anna a lifetime of love and happiness!",
      date: "May 29, 2023",
    }
  },
  {
    id: 7,
    author: "Jennifer Lee",
    rating: 3,
    comment: "Sarah did a decent job but there were some issues with timing on the wedding day. Some things started later than planned.",
    weddingDate: "April 8, 2023",
    date: "Apr 22, 2023",
    packageName: "Basic Wedding Package",
    plannerReply: {
      comment: "Jennifer, I appreciate your honest feedback. I apologize for the timing issues during your wedding day. I've reviewed our processes and have added additional time buffers in our schedules to prevent similar issues in the future. Thank you for helping me improve my services.",
      date: "Apr 23, 2023",
    }
  },
  {
    id: 8,
    author: "David Brown",
    rating: 5,
    comment: "Worth every penny! Sarah handled everything perfectly and made our wedding day stress-free. Highly recommend!",
    weddingDate: "March 19, 2023",
    date: "Apr 3, 2023",
    packageName: "Luxury Wedding Package",
    plannerReply: {
      comment: "David, thank you for your generous review! Your wedding at the Manila Hotel was absolutely stunning. I'm so happy I could contribute to making your day stress-free and memorable. Best wishes to you and Stephanie!",
      date: "Apr 4, 2023",
    }
  },
  {
    id: 9,
    author: "Amanda White",
    rating: 4,
    comment: "Sarah was great to work with. She understood our vision and executed it well. The day was beautiful and mostly went according to plan.",
    weddingDate: "February 14, 2023",
    date: "Feb 28, 2023",
    packageName: "Valentine's Special Package"
  },
  {
    id: 10,
    author: "Christopher Taylor",
    rating: 5,
    comment: "Exceptional service from start to finish. Sarah's expertise and calm demeanor made the entire process enjoyable.",
    weddingDate: "January 7, 2023",
    date: "Jan 22, 2023",
    packageName: "New Year Wedding Package",
    plannerReply: {
      comment: "Christopher, it was a pleasure working with you and Melissa! Your attention to detail and clear communication made the planning process smooth and enjoyable for me as well. Wishing you both a wonderful journey together!",
      date: "Jan 23, 2023",
    }
  }
];

const ReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [planner, setPlanner] = useState(mockPlanner);
  const [reviews, setReviews] = useState(mockReviews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate loading if needed
  useEffect(() => {
    if (id && id !== "2") {
      setError("Planner not found");
    }
  }, [id]);

  const renderStars = (rating: number, size: string = "h-5 w-5") => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${size} ${
          rating > index ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const sortAndFilterReviews = () => {
    let filteredReviews = reviews;
    
    // Filter by rating if selected
    if (filterRating !== null) {
      filteredReviews = filteredReviews.filter(review => review.rating === filterRating);
    }
    
    // Sort based on selection
    switch (sortBy) {
      case "newest":
        return [...filteredReviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "highest":
        return [...filteredReviews].sort((a, b) => b.rating - a.rating);
      case "lowest":
        return [...filteredReviews].sort((a, b) => a.rating - b.rating);
      default:
        return filteredReviews;
    }
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });
    
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error Loading Reviews</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!planner) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">Planner Not Found</div>
          <p className="text-gray-600 mb-4">
            The planner you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/services")}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  const sortedAndFilteredReviews = sortAndFilterReviews();

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-pink-600 hover:text-pink-700 font-medium"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>

        {/* Planner info */}
        <div className="flex items-start space-x-4 mb-8">
          <img
            src={planner.profilePicture}
            alt={planner.name}
            className="h-16 w-16 rounded-full object-cover ring-4 ring-white shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {planner.name}
            </h1>
            <p className="text-lg text-pink-600 font-medium">
              {planner.businessName}
            </p>
            <div className="flex items-center mt-1 space-x-4">
              <div className="flex items-center">
                <div className="flex">
                  {renderStars(planner.averageRating, "h-4 w-4")}
                </div>
                <span className="ml-1 text-sm text-gray-500">
                  {planner.averageRating} ({planner.totalReviews} reviews)
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                {planner.location}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                {planner.completedWeddings} weddings
              </div>
            </div>
          </div>
        </div>

        {/* Rating summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {planner.averageRating}
              </div>
              <div className="flex justify-center mt-2">
                {renderStars(planner.averageRating)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Average rating
              </div>
            </div>

            <div className="col-span-2">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                  const percentage = planner.totalReviews > 0 
                    ? (count / planner.totalReviews) * 100 
                    : 0;
                  
                  return (
                    <div key={rating} className="flex items-center">
                      <div className="w-10 text-sm text-gray-600">
                        {rating} star
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                        <div
                          className="h-2 bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-10 text-sm text-gray-600 text-right">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Response rate indicator */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8 flex items-center">
          <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm text-blue-800">
            <strong>Response rate: 80%</strong> - Sarah typically replies to reviews within 24 hours
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
            All Reviews ({sortedAndFilteredReviews.length})
          </h2>
          
          <div className="flex space-x-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "highest" | "lowest")}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
              <Filter className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={filterRating || ""}
                onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <Star className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Reviews list */}
        {sortedAndFilteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No reviews found</div>
            <p className="text-gray-500">
              {filterRating ? `No ${filterRating} star reviews available` : "No reviews available yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedAndFilteredReviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-pink-600 font-medium text-sm">
                        {review.author.split(" ")[0][0]}
                        {review.author.split(" ")[1] ? review.author.split(" ")[1][0] : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {review.author}
                        </h4>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {renderStars(review.rating, "h-4 w-4")}
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            {review.date}
                          </span>
                        </div>
                      </div>
                      {review.packageName && (
                        <div className="mt-2 sm:mt-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                            {review.packageName}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {review.weddingDate && (
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Wedding Date: {review.weddingDate}
                      </div>
                    )}
                    
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                      {review.comment}
                    </p>

                    {/* Planner Reply */}
                    {review.plannerReply && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-pink-500">
                        <div className="flex items-start">
                          <img
                            src={planner.profilePicture}
                            alt={planner.name}
                            className="h-8 w-8 rounded-full object-cover mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h5 className="text-sm font-medium text-pink-700">
                                Response from {planner.name}
                              </h5>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {review.plannerReply.date}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-700">
                              {review.plannerReply.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;