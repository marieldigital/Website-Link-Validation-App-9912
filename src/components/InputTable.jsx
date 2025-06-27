import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiGlobe, FiTarget, FiX, FiLoader } = FiIcons;

const InputTable = ({ scanRows, updateRow, removeRow, addRow, isScanning }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700 w-8">#</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-80">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiGlobe} className="text-indigo-600" />
                <span>Page URL to Scan</span>
                <span className="text-red-500">*</span>
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-80">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiTarget} className="text-green-600" />
                <span>Target Link to Find</span>
                <span className="text-red-500">*</span>
              </div>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-700 w-16">Action</th>
          </tr>
        </thead>
        <tbody>
          {scanRows.map((row, index) => (
            <motion.tr
              key={row.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`border-b border-gray-100 hover:bg-gray-50 ${
                !row.isValid ? 'bg-red-50' : ''
              }`}
            >
              <td className="py-3 px-4 text-gray-600 font-medium">
                {index + 1}
              </td>
              <td className="py-3 px-4">
                <div className="relative">
                  <input
                    type="url"
                    value={row.pageUrl}
                    onChange={(e) => updateRow(row.id, 'pageUrl', e.target.value)}
                    placeholder="https://example.com/page-to-scan"
                    disabled={isScanning}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      !row.isValid && !row.pageUrl.trim() 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {isScanning && row.pageUrl.trim() && (
                    <SafeIcon 
                      icon={FiLoader} 
                      className="absolute right-3 top-3 text-indigo-500 animate-spin" 
                    />
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <input
                  type="text"
                  value={row.targetLink}
                  onChange={(e) => updateRow(row.id, 'targetLink', e.target.value)}
                  placeholder="https://target-site.com or /internal-page"
                  disabled={isScanning}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    !row.isValid && !row.targetLink.trim() 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
              </td>
              <td className="py-3 px-4 text-center">
                {scanRows.length > 1 && (
                  <button
                    onClick={() => removeRow(row.id)}
                    disabled={isScanning}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove row"
                  >
                    <SafeIcon icon={FiX} />
                  </button>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {scanRows.length < 10 && (
        <div className="mt-4 text-center">
          <button
            onClick={addRow}
            disabled={isScanning}
            className="inline-flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-200 hover:border-indigo-300"
          >
            <SafeIcon icon={FiGlobe} />
            <span>Add Another URL Pair ({scanRows.length}/10)</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default InputTable;