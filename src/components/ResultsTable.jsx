import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import CollapsibleSection from './CollapsibleSection';
import { format } from 'date-fns';

const { 
  FiCheckCircle, 
  FiXCircle, 
  FiExternalLink, 
  FiMail,
  FiAlertCircle,
  FiClock,
  FiDownload
} = FiIcons;

const ResultsTable = ({ results }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (rowId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const exportResults = () => {
    const csvContent = generateCSV(results);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `link-scan-results-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (results) => {
    const headers = [
      'Page URL',
      'Target Link',
      'Target Found',
      'Anchor Text',
      'Menu Links Count',
      'Footer Links Count',
      'Social Media Links Count',
      'Email Addresses',
      'Other Links Count'
    ];

    const rows = results.scanResults.map(result => [
      result.pageUrl,
      result.targetLink,
      result.targetFound ? 'Yes' : 'No',
      result.anchorText || 'N/A',
      result.menuLinks.length,
      result.footerLinks.length,
      result.socialMediaLinks.length,
      result.emailAddresses.join(', ') || 'N/A',
      result.otherLinks.internal.length + result.otherLinks.external.length
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Scan Results</h3>
            <p className="opacity-90">
              Analyzed {results.scanResults.length} URL{results.scanResults.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{results.summary.totalLinksFound}</div>
            <div className="text-sm opacity-90">Total Links Found</div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2 text-sm opacity-75">
            <SafeIcon icon={FiClock} />
            <span>Scanned at {format(new Date(results.scannedAt), 'PPp')}</span>
          </div>
          <button
            onClick={exportResults}
            className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiDownload} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {results.summary.targetsFound}
            </div>
            <div className="text-sm text-gray-600">Targets Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {results.summary.totalMenuLinks}
            </div>
            <div className="text-sm text-gray-600">Menu Links</div>
          </div>
          <div className="text-2xl font-bold text-purple-600 text-center">
            {results.summary.totalSocialLinks}
            <div className="text-sm text-gray-600">Social Links</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {results.summary.totalEmailAddresses}
            </div>
            <div className="text-sm text-gray-600">Email Addresses</div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-64">Page URL</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-48">Target Link</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 w-24">Found?</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-48">Anchor Text</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 w-32">Menu Links</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 w-32">Footer Links</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 w-32">Social Links</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 w-48">Email Addresses</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 w-32">Other Links</th>
            </tr>
          </thead>
          <tbody>
            {results.scanResults.map((result, index) => (
              <React.Fragment key={index}>
                <motion.tr
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`border-b hover:bg-gray-50 ${result.error ? 'bg-red-50' : ''}`}
                >
                  <td className="py-3 px-4">
                    <div className="max-w-64">
                      <div className="truncate font-medium text-gray-900" title={result.pageUrl}>
                        {result.pageUrl}
                      </div>
                      {result.error && (
                        <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                          <SafeIcon icon={FiAlertCircle} className="text-xs" />
                          <span className="truncate">{result.error}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-48 truncate text-gray-700" title={result.targetLink}>
                      {result.targetLink}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {result.error ? (
                      <SafeIcon icon={FiXCircle} className="text-gray-400 text-xl mx-auto" />
                    ) : result.targetFound ? (
                      <SafeIcon icon={FiCheckCircle} className="text-green-500 text-xl mx-auto" />
                    ) : (
                      <SafeIcon icon={FiXCircle} className="text-red-500 text-xl mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-48">
                      {result.error ? (
                        <span className="text-gray-400">N/A</span>
                      ) : result.anchorText ? (
                        <div className="truncate text-gray-700" title={result.anchorText}>
                          {result.anchorText}
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {result.error ? (
                      <span className="text-gray-400">N/A</span>
                    ) : (
                      <CollapsibleSection
                        count={result.menuLinks.length}
                        items={result.menuLinks}
                        type="menu"
                        label="Menu Links"
                      />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {result.error ? (
                      <span className="text-gray-400">N/A</span>
                    ) : (
                      <CollapsibleSection
                        count={result.footerLinks.length}
                        items={result.footerLinks}
                        type="footer"
                        label="Footer Links"
                      />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {result.error ? (
                      <span className="text-gray-400">N/A</span>
                    ) : (
                      <CollapsibleSection
                        count={result.socialMediaLinks.length}
                        items={result.socialMediaLinks}
                        type="social"
                        label="Social Links"
                      />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {result.error ? (
                      <span className="text-gray-400">N/A</span>
                    ) : result.emailAddresses.length > 0 ? (
                      <div className="space-y-1">
                        {result.emailAddresses.slice(0, 2).map((email, emailIndex) => (
                          <div key={emailIndex} className="flex items-center space-x-1 text-sm">
                            <SafeIcon icon={FiMail} className="text-purple-500 text-xs" />
                            <span className="truncate max-w-32" title={email}>{email}</span>
                          </div>
                        ))}
                        {result.emailAddresses.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{result.emailAddresses.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {result.error ? (
                      <span className="text-gray-400">N/A</span>
                    ) : (
                      <CollapsibleSection
                        count={result.otherLinks.internal.length + result.otherLinks.external.length}
                        items={[
                          ...result.otherLinks.internal.map(link => ({ ...link, type: 'internal' })),
                          ...result.otherLinks.external.map(link => ({ ...link, type: 'external' }))
                        ]}
                        type="other"
                        label="Other Links"
                      />
                    )}
                  </td>
                </motion.tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;