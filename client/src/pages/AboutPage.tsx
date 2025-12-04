import { 
  Heart, 
  Sparkles,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Our Story
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">WeddingMart</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                WeddingMart was born from a passion for creating unforgettable wedding experiences. 
                We're dedicated to making wedding planning seamless, enjoyable, and stress-free for couples in Kidapawan City.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Explore Services
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/20 to-purple-600/20 rounded-3xl transform rotate-6"></div>
              <img
                className="relative rounded-3xl shadow-2xl object-cover w-full h-[400px] lg:h-[500px]"
                src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Wedding planning team"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Our Mission */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                className="rounded-3xl shadow-xl w-full h-auto"
                src="https://images.unsplash.com/photo-1527525443983-6e60c75fff46?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Our mission"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-100 p-3 rounded-full">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">1000+ Happy Couples</p>
                    <p className="text-sm text-gray-600">Since 2025</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">Our Mission</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                To revolutionize wedding planning by providing a centralized platform that connects couples with the best local vendors, 
                making the process efficient, transparent, and enjoyable.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-pink-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">
                    Simplify the wedding planning process with our all-in-one platform
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-pink-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">
                    Support local wedding businesses and showcase their talents
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-pink-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">
                    Create memorable experiences that couples will cherish forever
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind WeddingMart
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: 'Wengilen Manib',
                role: 'Co-Founder & CEO',
                bio: 'Wedding industry expert with 10+ years of experience in event planning',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
              },
              {
                name: 'Analy Fruta',
                role: 'Co-Founder & CTO',
                bio: 'Tech enthusiast dedicated to creating seamless digital experiences',
                image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
              },
              {
                name: 'Lope Quimco',
                role: 'BPLO Liaison',
                bio: 'Ensures all vendors meet local business standards and regulations',
                image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
              },
              {
                name: 'Jay Tarife',
                role: 'Vendor Relations',
                bio: 'Connects couples with the best wedding service providers in the region',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
              },
            ].map((member) => (
              <div key={member.name} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img
                  className="w-full h-64 object-cover"
                  src={member.image}
                  alt={member.name}
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-pink-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              What drives us to deliver exceptional wedding planning experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Excellence',
                description: 'We strive for perfection in every detail of the wedding planning process',
                icon: Sparkles,
                color: 'text-pink-600',
              },
              {
                title: 'Trust',
                description: 'Building relationships based on transparency and reliability',
                icon: CheckCircle,
                color: 'text-purple-600',
              },
              {
                title: 'Community',
                description: 'Supporting local vendors and celebrating love in our community',
                icon: Users,
                color: 'text-blue-600',
              },
            ].map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className={`w-12 h-12 ${value.color} mb-6`}>
                    <Icon className="w-full h-full" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-pink-600 via-pink-700 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to start planning your dream wedding?
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join our community of happy couples and trusted vendors today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <Heart className="mr-2 w-5 h-5" />
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;