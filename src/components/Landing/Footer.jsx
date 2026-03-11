import { Facebook, Instagram, Twitter } from "lucide-react";
import { Image } from "../../assets/Image";

export const Footer = () => (
  <footer className="border-t border-gray-100 py-16 px-6 md:px-12 bg-yellow-50">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start text-center md:text-left">
      <div className="flex flex-col items-center md:items-start gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <img src={Image.Logo} alt="logo" />
        </div>
        <div>
          <p className="font-bold text-gray-900">Institute of Knowledge</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            2001 Heritage Street
            <br />
            New York, NY 10001
            <br />
            Knowledge 13-2023
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <p className="font-bold text-gray-900 mb-4">Contact Us</p>
        <div className="text-xs text-gray-500 space-y-2">
          <p>+01 (0) 123 456 789</p>
          <p>info@website.com</p>
        </div>
      </div>

      <div className="flex flex-col items-center md:items-end">
        <p className="font-bold text-gray-900 mb-4">Social Media Link</p>
        <div className="flex gap-4">
          <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-600 transition cursor-pointer" />
          <Instagram className="w-5 h-5 text-gray-400 hover:text-pink-500 transition cursor-pointer" />
          <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-400 transition cursor-pointer" />
        </div>
      </div>
    </div>
  </footer>
);
