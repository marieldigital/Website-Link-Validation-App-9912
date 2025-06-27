import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSearch, FiLink, FiTarget, FiGlobe } = FiIcons;

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-sm border-b border-gray-100"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center space-x-2 text-indigo-600">
            <SafeIcon icon={FiGlobe} className="text-2xl" />
            <SafeIcon icon={FiSearch} className="text-xl" />
            <SafeIcon icon={FiLink} className="text-lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            URL Link Scanner
          </h1>
        </div>
        <p className="text-center text-gray-600 mt-2 max-w-4xl mx-auto">
          Scan web pages for specific target links and analyze all links categorized by type. 
          Get comprehensive insights into page structure, navigation, social media presence, and link distribution.
        </p>
      </div>
    </motion.header>
  );
};

export default Header;