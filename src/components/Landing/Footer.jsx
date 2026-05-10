import { Facebook, Instagram, Twitter } from "lucide-react";
import { Image } from "../../assets/Image";

export const Footer = () => (
  <footer className="border-t border-border py-16 px-6 md:px-12 bg-card">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start text-center md:text-left">
      <div className="flex flex-col items-center md:items-start gap-3">
        <div className="w-12 h-12 bg-foreground/5 rounded-lg flex items-center justify-center p-2">
          <img
            src={Image.Logo}
            alt="logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <p className="font-bold text-foreground">Institute of Knowledge</p>
          <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
            Bidhan sarani street
            <br />
            Kolkata, 7000001
            <br />
            Knowledge {new Date().getDate() + "-" + new Date().getFullYear()}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <p className="font-bold text-foreground mb-4">Contact Us</p>
        <div className="text-xs text-foreground/60 space-y-2">
          <p>+01 (0) 123 456 789</p>
          <p>institute-of-knowledge.in</p>
        </div>
      </div>

      <div className="flex flex-col items-center md:items-end">
        <p className="font-bold text-foreground mb-4">Social Media Link</p>
        <div className="flex gap-4">
          <Facebook className="w-5 h-5 text-foreground/40 hover:text-blue-600 transition cursor-pointer" />
          <Instagram className="w-5 h-5 text-foreground/40 hover:text-pink-500 transition cursor-pointer" />
          <Twitter className="w-5 h-5 text-foreground/40 hover:text-blue-400 transition cursor-pointer" />
        </div>
      </div>
    </div>
  </footer>
);
