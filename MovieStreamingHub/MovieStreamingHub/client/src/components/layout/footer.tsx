import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-6 border-t border-[#2D2D2D]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-[#E50914] text-xl font-bold">StreamHub</h2>
            <p className="text-[#AAAAAA] text-sm mt-1">Upload, share, and stream your videos</p>
          </div>
          <div className="flex space-x-4">
            <Link href="#" className="text-[#AAAAAA] hover:text-[#E50914] transition">
              Terms
            </Link>
            <Link href="#" className="text-[#AAAAAA] hover:text-[#E50914] transition">
              Privacy
            </Link>
            <Link href="#" className="text-[#AAAAAA] hover:text-[#E50914] transition">
              Help
            </Link>
            <Link href="#" className="text-[#AAAAAA] hover:text-[#E50914] transition">
              About
            </Link>
          </div>
        </div>
        <div className="mt-6 text-center text-[#AAAAAA] text-xs">
          &copy; {new Date().getFullYear()} StreamHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
