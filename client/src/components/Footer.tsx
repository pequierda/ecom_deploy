import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">WeddingMart</h3>
            <p className="text-gray-300">Your one-stop platform for wedding planning services in Kidapawan City.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-white">Services</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/services/photography" className="text-gray-300 hover:text-white">Photography</Link></li>
              <li><Link to="/services/catering" className="text-gray-300 hover:text-white">Catering</Link></li>
              <li><Link to="/services/venue" className="text-gray-300 hover:text-white">Venue</Link></li>
              <li><Link to="/services/decoration" className="text-gray-300 hover:text-white">Decoration</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="text-gray-300 not-italic">
              <p>Makilala Institute of Science and Technology</p>
              <p>Kidapawan City, Philippines</p>
              <p>Email: info@weddingmart.com</p>
              <p>Phone: +63 123 456 7890</p>
            </address>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} WeddingMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;