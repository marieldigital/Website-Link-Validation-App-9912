import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHeart, FiCode } = FiIcons;

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="bg-gray-50 border-t border-gray-200 py-8 mt-16"
    >
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <span>Made with</span>
          <SafeIcon icon={FiHeart} className="text-red-500" />
          <span>and</span>
          <SafeIcon icon={FiCode} className="text-blue-500" />
          <span>for better link analysis</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Note: This demo uses mock data. In production, a backend service would handle website fetching due to CORS restrictions.
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;