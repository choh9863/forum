const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <div className="text-sm text-gray-300 mb-4 md:mb-0">
            &copy; {currentYear} Community Forum. All rights reserved.
          </div>

          {/* Links */}
          <div className="flex space-x-6">
            <a
              href="/about"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              About
            </a>
            <a
              href="/privacy"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/contact"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
