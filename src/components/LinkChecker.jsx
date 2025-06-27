import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import LoadingSpinner from './LoadingSpinner';
import ResultsDisplay from './ResultsDisplay';
import { analyzeMultipleArticles } from '../utils/linkUtils';

const { FiSearch, FiFileText, FiLink2, FiPlus, FiX, FiExternalLink, FiTarget } = FiIcons;

const LinkChecker = () => {
  const [articleUrls, setArticleUrls] = useState(['']);
  const [targetLinks, setTargetLinks] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const addArticleUrl = () => {
    setArticleUrls([...articleUrls, '']);
  };

  const removeArticleUrl = (index) => {
    if (articleUrls.length > 1) {
      setArticleUrls(articleUrls.filter((_, i) => i !== index));
    }
  };

  const updateArticleUrl = (index, value) => {
    const newUrls = [...articleUrls];
    newUrls[index] = value;
    setArticleUrls(newUrls);
  };

  const addTargetLink = () => {
    setTargetLinks([...targetLinks, '']);
  };

  const removeTargetLink = (index) => {
    if (targetLinks.length > 1) {
      setTargetLinks(targetLinks.filter((_, i) => i !== index));
    }
  };

  const updateTargetLink = (index, value) => {
    const newLinks = [...targetLinks];
    newLinks[index] = value;
    setTargetLinks(newLinks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validUrls = articleUrls.filter(url => url.trim());
    
    if (validUrls.length === 0) {
      setError('Please enter at least one article URL');
      return;
    }

    const validTargetLinks = targetLinks.filter(link => link.trim());
    if (validTargetLinks.length === 0) {
      setError('Please enter at least one target link to check');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const analysisResults = await analyzeMultipleArticles(validUrls, validTargetLinks);
      setResults(analysisResults);
    } catch (err) {
      setError('Failed to analyze articles. Please check the URLs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <SafeIcon icon={FiFileText} className="text-2xl text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">Article Content Link Analysis</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiTarget} className="text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">SEO-Focused Analysis</h3>
              <p className="text-sm text-blue-700">
                This tool analyzes links specifically within article content, separating them from navigation/footer links. 
                Perfect for checking if important SEO links are properly placed in your article content.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Article URLs Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article URLs to Analyze
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Enter specific article or blog post URLs (not homepage URLs)
            </p>
            <div className="space-y-3">
              {articleUrls.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="relative flex-1">
                    <SafeIcon icon={FiFileText} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateArticleUrl(index, e.target.value)}
                      placeholder="https://example.com/blog/article-title"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="flex space-x-2">
                    {index === articleUrls.length - 1 && (
                      <button
                        type="button"
                        onClick={addArticleUrl}
                        className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Add another article"
                      >
                        <SafeIcon icon={FiPlus} />
                      </button>
                    )}
                    {articleUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArticleUrl(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove article"
                      >
                        <SafeIcon icon={FiX} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Target Links Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Links to Check For
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Links you want to verify are present in the article content (not in navigation/footer)
            </p>
            <div className="space-y-3">
              {targetLinks.map((link, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="relative flex-1">
                    <SafeIcon icon={FiLink2} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={link}
                      onChange={(e) => updateTargetLink(index, e.target.value)}
                      placeholder="e.g., /related-article, https://external-site.com, /products/xyz"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="flex space-x-2">
                    {index === targetLinks.length - 1 && (
                      <button
                        type="button"
                        onClick={addTargetLink}
                        className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Add another target link"
                      >
                        <SafeIcon icon={FiPlus} />
                      </button>
                    )}
                    {targetLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTargetLink(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove target link"
                      >
                        <SafeIcon icon={FiX} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* SEO Tips */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">SEO Best Practices</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>Internal Links:</strong> Link to related articles and important pages within your content</li>
              <li>• <strong>External Links:</strong> Reference authoritative sources to build credibility</li>
              <li>• <strong>Anchor Text:</strong> Use descriptive, keyword-rich anchor text</li>
              <li>• <strong>Link Placement:</strong> Place important links early in the article content</li>
            </ul>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Analyzing {articleUrls.filter(url => url.trim()).length} Article{articleUrls.filter(url => url.trim()).length > 1 ? 's' : ''}...</span>
              </>
            ) : (
              <>
                <SafeIcon icon={FiSearch} />
                <span>Analyze Article Content</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      <AnimatePresence>
        {results && (
          <ResultsDisplay results={results} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LinkChecker;