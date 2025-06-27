import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import InputTable from './InputTable';
import ResultsTable from './ResultsTable';
import { scanMultipleUrls } from '../utils/linkScanner';

const { FiSearch, FiPlus, FiTrash2, FiSettings } = FiIcons;

const LinkScanner = () => {
  const [scanRows, setScanRows] = useState([
    { id: 1, pageUrl: '', targetLink: '', isValid: true }
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const addRow = () => {
    if (scanRows.length < 10) {
      const newId = Math.max(...scanRows.map(row => row.id)) + 1;
      setScanRows([...scanRows, { id: newId, pageUrl: '', targetLink: '', isValid: true }]);
    }
  };

  const removeRow = (id) => {
    if (scanRows.length > 1) {
      setScanRows(scanRows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id, field, value) => {
    setScanRows(scanRows.map(row => 
      row.id === id ? { ...row, [field]: value, isValid: true } : row
    ));
  };

  const validateInputs = () => {
    let isValid = true;
    const updatedRows = scanRows.map(row => {
      const pageUrlValid = row.pageUrl.trim() !== '';
      const targetLinkValid = row.targetLink.trim() !== '';
      const rowValid = pageUrlValid && targetLinkValid;
      
      if (!rowValid) isValid = false;
      
      return { ...row, isValid: rowValid };
    });
    
    setScanRows(updatedRows);
    return isValid;
  };

  const handleScanAll = async () => {
    if (!validateInputs()) {
      setError('Please fill in all required fields');
      return;
    }

    const validRows = scanRows.filter(row => row.pageUrl.trim() && row.targetLink.trim());
    if (validRows.length === 0) {
      setError('Please add at least one valid URL pair');
      return;
    }

    setIsScanning(true);
    setError('');
    setResults(null);

    try {
      const scanResults = await scanMultipleUrls(validRows);
      setResults(scanResults);
    } catch (err) {
      setError('Failed to scan URLs. Please check your inputs and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const clearAll = () => {
    setScanRows([{ id: 1, pageUrl: '', targetLink: '', isValid: true }]);
    setResults(null);
    setError('');
  };

  return (
    <div className="space-y-8">
      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiSettings} className="text-2xl text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-800">Link Scanner Configuration</h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{scanRows.length}/10 rows</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">How to Use:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Page URL:</strong> The webpage you want to scan and analyze</li>
            <li>• <strong>Target Link:</strong> The specific link you want to check for on that page</li>
            <li>• <strong>Maximum:</strong> You can analyze up to 10 URL pairs simultaneously</li>
            <li>• <strong>Results:</strong> Get detailed categorization of all links found on each page</li>
          </ul>
        </div>

        {/* Input Table */}
        <InputTable
          scanRows={scanRows}
          updateRow={updateRow}
          removeRow={removeRow}
          addRow={addRow}
          isScanning={isScanning}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={clearAll}
            disabled={isScanning}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <SafeIcon icon={FiTrash2} />
            <span>Clear All</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={addRow}
              disabled={scanRows.length >= 10 || isScanning}
              className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SafeIcon icon={FiPlus} />
              <span>Add Row</span>
            </button>

            <button
              onClick={handleScanAll}
              disabled={isScanning || scanRows.every(row => !row.pageUrl.trim())}
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition-colors"
            >
              <SafeIcon icon={FiSearch} />
              <span>{isScanning ? 'Scanning...' : 'Scan All URLs'}</span>
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </motion.div>

      {/* Results Table */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ResultsTable results={results} />
        </motion.div>
      )}
    </div>
  );
};

export default LinkScanner;