import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiChevronDown, FiChevronRight, FiExternalLink, FiLink, FiShare2 } = FiIcons;

const CollapsibleSection = ({ count, items, type, label }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (count === 0) {
    return <span className="text-gray-400">0</span>;
  }

  const displayItems = items.slice(0, 10);
  const hasMore = items.length > 10;

  const getIcon = (linkType) => {
    switch (linkType) {
      case 'external':
        return <SafeIcon icon={FiExternalLink} className="text-blue-500 text-xs" />;
      case 'social':
        return <SafeIcon icon={FiShare2} className="text-purple-500 text-xs" />;
      default:
        return <SafeIcon icon={FiLink} className="text-gray-500 text-xs" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'menu':
        return 'text-blue-600 hover:text-blue-800';
      case 'footer':
        return 'text-gray-600 hover:text-gray-800';
      case 'social':
        return 'text-purple-600 hover:text-purple-800';
      case 'other':
        return 'text-green-600 hover:text-green-800';
      default:
        return 'text-gray-600 hover:text-gray-800';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors ${getTypeColor()}`}
      >
        <SafeIcon 
          icon={isExpanded ? FiChevronDown : FiChevronRight} 
          className="text-xs" 
        />
        <span className="font-medium">
          {count}
          {hasMore && '+'}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 z-10 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            <div className="p-3">
              <div className="text-sm font-semibold text-gray-700 mb-2 border-b pb-2">
                {label} ({count})
              </div>
              <div className="space-y-2">
                {displayItems.map((item, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs">
                    {getIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-gray-600 break-all">
                        {item.href}
                      </div>
                      {item.text && item.text !== item.href && (
                        <div className="text-gray-500 mt-1 break-words">
                          "{item.text}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {hasMore && (
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Showing first 10 of {count} links
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleSection;