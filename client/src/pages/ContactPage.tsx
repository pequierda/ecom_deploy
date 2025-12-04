import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  MessageSquare,
  ArrowRight,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactPage = () => {
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
                <MessageSquare className="w-4 h-4 mr-2" />
                Get In Touch
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">WeddingMart</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                We'd love to hear from you! Whether you have questions about our services or want to join as a vendor, our team is ready to help.
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
                  to="/vendors"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 border border-pink-200 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Vendor Inquiry
                </Link>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/20 to-purple-600/20 rounded-3xl transform rotate-6"></div>
              <img
                className="relative rounded-3xl shadow-2xl object-cover w-full h-[400px] lg:h-[500px]"
                src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Contact WeddingMart"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Card 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Email Us</h3>
              <p className="text-gray-600 mb-4">Send us your questions or inquiries</p>
              <a href="mailto:info@weddingmart.com" className="text-pink-600 font-medium hover:text-pink-700">
                info@weddingmart.com
              </a>
            </div>

            {/* Contact Card 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Call Us</h3>
              <p className="text-gray-600 mb-4">Available during business hours</p>
              <a href="tel:+639123456789" className="text-purple-600 font-medium hover:text-purple-700">
                +63 912 345 6789
              </a>
            </div>

            {/* Contact Card 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visit Us</h3>
              <p className="text-gray-600 mb-4">Our office in Kidapawan City</p>
              <p className="text-blue-600 font-medium">
                123 Wedding Avenue, Kidapawan City
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">Send Us a Message</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Have questions about our services or want to join as a vendor? Fill out the form and we'll get back to you within 24 hours.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-pink-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">Business Hours</p>
                    <p className="text-gray-700">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option>General Inquiry</option>
                    <option>Vendor Application</option>
                    <option>Service Questions</option>
                    <option>Feedback</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Send Message
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Connect With Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow us on social media for wedding inspiration, tips, and updates
            </p>
          </div>

          <div className="flex justify-center space-x-8">
            <a href="#" className="bg-pink-100 p-4 rounded-full hover:bg-pink-200 transition-colors duration-200">
              <Facebook className="w-8 h-8 text-pink-600" />
            </a>
            <a href="#" className="bg-pink-100 p-4 rounded-full hover:bg-pink-200 transition-colors duration-200">
              <Instagram className="w-8 h-8 text-pink-600" />
            </a>
            <a href="#" className="bg-pink-100 p-4 rounded-full hover:bg-pink-200 transition-colors duration-200">
              <Twitter className="w-8 h-8 text-pink-600" />
            </a>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="pb-20 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.925234372519!2d125.0899493153281!3d6.794407595093794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f80d5e2f9a8a3f%3A0x6ec3f091747a4c40!2sKidapawan%20City%2C%20Cotabato!5e0!3m2!1sen!2sph!4v1621234567890!5m2!1sen!2sph"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="WeddingMart Location"
            ></iframe>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-pink-600 via-pink-700 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Have more questions?
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Check out our FAQ page or contact our support team directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/faq"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Visit FAQ
            </Link>
            <Link
              to="/support"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Support Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;