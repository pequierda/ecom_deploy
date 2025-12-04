import {
  Calendar,
  Camera,
  ChefHat,
  MapPin,
  Star,
  ArrowRight,
  CheckCircle,
  Heart,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

// Type definitions
type ServiceColor = "pink" | "purple" | "blue" | "green";

interface ServiceItem {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: ServiceColor;
}

interface FeatureItem {
  name: string;
  description: string;
  step: string;
}

interface TestimonialItem {
  name: string;
  review: string;
  rating: number;
  avatar: string;
}

const HomePage = () => {
  // Services data
  const services: ServiceItem[] = [
    {
      name: "Wedding Planning",
      description: "Full-service wedding planning to make your day perfect",
      icon: Calendar,
      color: "pink",
    },
    {
      name: "Photography",
      description: "Capture your special moments with professional photographers",
      icon: Camera,
      color: "purple",
    },
    {
      name: "Catering",
      description: "Delicious food options for your wedding reception",
      icon: ChefHat,
      color: "blue",
    },
    {
      name: "Venue Booking",
      description: "Find and book the perfect venue for your ceremony",
      icon: MapPin,
      color: "green",
    },
  ];

  // Features data
  const features: FeatureItem[] = [
    {
      name: "Register & Browse",
      description:
        "Create an account and browse our selection of wedding planners and services",
      step: "01",
    },
    {
      name: "Book Services",
      description:
        "Select the services you need and book appointments with our verified planners",
      step: "02",
    },
    {
      name: "Enjoy Your Day",
      description:
        "Relax and enjoy your special day while we handle all the details",
      step: "03",
    },
  ];

  // Testimonials data
  const testimonials: TestimonialItem[] = [
    {
      name: "Sarah & Michael",
      review:
        "WeddingMart made planning our wedding so easy! We found all our vendors in one place.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      name: "Jessica & David",
      review:
        "The photography services we booked through WeddingMart were amazing. Our photos are beautiful!",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      name: "Emily & James",
      review:
        "The venue booking process was seamless. We got exactly what we wanted for our special day.",
      rating: 4,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ];

  // Color classes mapping
  const colorClasses: Record<ServiceColor, string> = {
    pink: "bg-pink-500 group-hover:bg-pink-600",
    purple: "bg-purple-500 group-hover:bg-purple-600",
    blue: "bg-blue-500 group-hover:bg-blue-600",
    green: "bg-green-500 group-hover:bg-green-600",
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh] py-16">
            {/* Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Trusted by 1000+ Couples
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Plan Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 block">
                  Perfect Wedding
                </span>
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                WeddingMart connects you with the best wedding planners and
                vendors in Kidapawan City. Browse services, book appointments,
                and manage everything seamlessly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Browse Services
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 font-semibold rounded-2xl shadow-md hover:shadow-lg border border-pink-200 hover:bg-pink-50 transition-all duration-200"
                >
                  <Heart className="mr-2 w-5 h-5" />
                  Sign Up Free
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/20 to-purple-600/20 rounded-3xl transform rotate-6"></div>
              <img
                className="relative rounded-3xl shadow-2xl object-cover w-full h-[500px] lg:h-[600px]"
                src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Happy couple getting married"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      5000+ Happy Couples
                    </p>
                    <p className="text-sm text-gray-600">Successfully married</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Services */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Featured Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for your special day, curated by experts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.name} className="group">
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 h-full">
                    <div
                      className={`inline-flex p-4 rounded-2xl ${
                        colorClasses[service.color]
                      } transition-colors duration-300 mb-6`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How WeddingMart Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to plan your perfect wedding
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div key={feature.name} className="relative text-center">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl text-white font-bold text-xl mb-6">
                    {feature.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Connection Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-12 w-12 lg:w-24 h-0.5 bg-gradient-to-r from-pink-300 to-purple-300 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What Couples Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from couples who planned their weddings with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  "{testimonial.review}"
                </p>

                <div className="flex items-center">
                  <img
                    className="w-12 h-12 rounded-full object-cover mr-4"
                    src={testimonial.avatar}
                    alt={testimonial.name}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">Verified Couple</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-pink-600 via-pink-700 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to plan your dream wedding?
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of couples who have made their wedding planning
            stress-free with our platform.
          </p>
          <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
            <Heart className="mr-2 w-5 h-5" />
            Sign up for free
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48"></div>
      </div>
    </div>
  );
};

export default HomePage;