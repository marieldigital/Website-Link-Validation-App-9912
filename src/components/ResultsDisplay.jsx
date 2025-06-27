import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { format } from 'date-fns';

const { 
  FiCheckCircle, 
  FiXCircle, 
  FiLink, 
  FiExternalLink, 
  FiClock, 
  FiList, 
  FiFileText,
  FiMail,
  FiChevronDown,
  FiChevronRight,
  FiTarget,
  FiNavigation,
  FiAlertCircle,
  FiTrendingUp
} = FiIcons;

const LinkTypeIcon = ({ type }) => {
  switch (type) {
    case 'content-external':
      return <SafeIcon icon={FiExternalLink} className="text-blue-600" />;
    case 'content-internal':
      return <SafeIcon icon={FiFileText} className="text-green-600" />;
    case 'other-external':
      return <SafeIcon icon={FiExternalLink} className="text-gray-500" />;
    case 'other-internal':
      return <SafeIcon icon={FiNavigation} className="text-gray-500" />;
    case 'email':
      return <SafeIcon icon={FiMail} className="text-purple-600" />;
    case 'tel':
      return <SafeIcon icon={FiTarget} className="text-orange-600" />;
    default:
      return <SafeIcon icon={FiLink} className="text-gray-600" />;
  }
};

const LinkTypeLabel = ({ type }) => {
  const labels = {
    'content-external': 'Content External',
    'content-internal': 'Content Internal',
    'other-external': 'Other External',
    'other-internal': 'Other Internal',
    email: 'Email',
    tel: 'Phone',
    anchor: 'Anchor',
    javascript: 'JavaScript'
  };
  return labels[type] || 'Other';
};

const SEOScore = ({ article }) => {
  const { linksByType, seoAnalysis } = article;
  const contentLinks = (linksByType['content-internal']?.length || 0) + (linksByType['content-external']?.length || 0);
  const hasContentLinks = contentLinks > 0;
  const hasInternalLinks = (linksByType['content-internal']?.length || 0) > 0;
  const hasExternalLinks = (linksByType['content-external']?.length || 0) > 0;
  
  let score = 0;
  if (hasContentLinks) score += 25;
  if (hasInternalLinks) score += 25;
  if (hasExternalLinks) score += 25;
  if (contentLinks >= 3) score += 25;
  
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 75) return 'bg-green-50 border-green-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className={`border rounded-lg p-4 ${getScoreBackground(score)}`}>
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-semibold text-gray-800 flex items-center space-x-2">
          <SafeIcon icon={FiTrendingUp} />
          <span>SEO Link Score</span>
        </h5>
        <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {score}/100
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <SafeIcon 
            icon={hasContentLinks ? FiCheckCircle : FiXCircle} 
            className={hasContentLinks ? 'text-green-500' : 'text-red-500'} 
          />
          <span>Has links in content ({contentLinks} total)</span>
        </div>
        <div className="flex items-center space-x-2">
          <SafeIcon 
            icon={hasInternalLinks ? FiCheckCircle : FiXCircle} 
            className={hasInternalLinks ? 'text-green-500' : 'text-red-500'} 
          />
          <span>Has internal links in content</span>
        </div>
        <div className="flex items-center space-x-2">
          <SafeIcon 
            icon={hasExternalLinks ? FiCheckCircle : FiXCircle} 
            className={hasExternalLinks ? 'text-green-500' : 'text-red-500'} 
          />
          <span>Has external links in content</span>
        </div>
        <div className="flex items-center space-x-2">
          <SafeIcon 
            icon={contentLinks >= 3 ? FiCheckCircle : FiXCircle} 
            className={contentLinks >= 3 ? 'text-green-500' : 'text-red-500'} 
          />
          <span>Has sufficient links (3+) in content</span>
        </div>
      </div>
    </div>
  );
};

const ArticleResults = ({ article, isExpanded, onToggle }) => {
  const { url, totalLinks, linksByType, checkResults, error, seoAnalysis } = article;
  
  if (error) {
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiXCircle} className="text-red-600 text-xl" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-800 truncate">{url}</h4>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const contentLinks = (linksByType['content-internal']?.length || 0) + (linksByType['content-external']?.length || 0);
  const otherLinks = (linksByType['other-internal']?.length || 0) + (linksByType['other-external']?.length || 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div 
        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SafeIcon 
              icon={isExpanded ? FiChevronDown : FiChevronRight} 
              className="text-gray-500" 
            />
            <SafeIcon icon={FiFileText} className="text-indigo-600" />
            <div>
              <h4 className="font-semibold text-gray-800 truncate max-w-md">{url}</h4>
              <p className="text-sm text-gray-600">
                {contentLinks} content links • {otherLinks} other links
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-700">{contentLinks}</div>
              <div className="text-xs text-gray-600">Content</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">{otherLinks}</div>
              <div className="text-xs text-gray-600">Other</div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-200"
        >
          <div className="p-4 space-y-6">
            {/* SEO Score */}
            <SEOScore article={article} />

            {/* Check Results */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                <SafeIcon icon={FiTarget} />
                <span>Target Link Results</span>
              </h5>
              <div className="space-y-2">
                {checkResults.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 ${
                      result.foundInContent 
                        ? 'border-green-200 bg-green-50' 
                        : result.foundInOther 
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <SafeIcon
                        icon={result.foundInContent ? FiCheckCircle : result.foundInOther ? FiAlertCircle : FiXCircle}
                        className={`text-lg mt-0.5 ${
                          result.foundInContent ? 'text-green-600' : result.foundInOther ? 'text-yellow-600' : 'text-red-600'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <code className="bg-white px-2 py-1 rounded text-sm font-mono">
                            {result.targetLink}
                          </code>
                        </div>
                        <div className={`text-sm mt-1 ${
                          result.foundInContent ? 'text-green-700' : result.foundInOther ? 'text-yellow-700' : 'text-red-700'
                        }`}>
                          {result.foundInContent 
                            ? `✓ Found in article content (${result.contentMatches.length} match${result.contentMatches.length > 1 ? 'es' : ''})` 
                            : result.foundInOther 
                            ? `⚠ Found in navigation/footer only (${result.otherMatches.length} match${result.otherMatches.length > 1 ? 'es' : ''})`
                            : '✗ Not found anywhere'
                          }
                        </div>
                        {(result.contentMatches?.length > 0 || result.otherMatches?.length > 0) && (
                          <div className="mt-2 space-y-1">
                            {result.contentMatches?.slice(0, 2).map((match, i) => (
                              <div key={i} className="flex items-center space-x-2">
                                <LinkTypeIcon type={match.type} />
                                <code className="block bg-white px-2 py-1 rounded text-xs font-mono text-gray-600">
                                  {match.href}
                                </code>
                                <span className="text-xs text-green-600 font-medium">
                                  In Content
                                </span>
                              </div>
                            ))}
                            {result.otherMatches?.slice(0, 2).map((match, i) => (
                              <div key={i} className="flex items-center space-x-2">
                                <LinkTypeIcon type={match.type} />
                                <code className="block bg-white px-2 py-1 rounded text-xs font-mono text-gray-600">
                                  {match.href}
                                </code>
                                <span className="text-xs text-yellow-600 font-medium">
                                  In Navigation/Footer
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Links by Category */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">All Links Found</h5>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Content Links */}
                <div className="space-y-3">
                  <h6 className="font-medium text-green-700 flex items-center space-x-2">
                    <SafeIcon icon={FiFileText} />
                    <span>Content Links (SEO Important)</span>
                  </h6>
                  {['content-internal', 'content-external'].map(type => {
                    const links = linksByType[type] || [];
                    if (links.length === 0) return null;
                    
                    return (
                      <div key={type} className="border border-green-200 rounded-lg bg-green-50">
                        <div className="bg-green-100 px-3 py-2 border-b border-green-200">
                          <div className="flex items-center space-x-2">
                            <LinkTypeIcon type={type} />
                            <span className="font-medium">{LinkTypeLabel({ type })}</span>
                            <span className="text-sm text-green-600">({links.length})</span>
                          </div>
                        </div>
                        <div className="p-3 max-h-32 overflow-y-auto">
                          <div className="space-y-1">
                            {links.slice(0, 5).map((link, index) => (
                              <code
                                key={index}
                                className="block bg-white px-2 py-1 rounded text-xs font-mono text-gray-700 hover:bg-green-100 transition-colors"
                              >
                                {link.href}
                              </code>
                            ))}
                            {links.length > 5 && (
                              <p className="text-xs text-green-600 pt-1">
                                +{links.length - 5} more links
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Other Links */}
                <div className="space-y-3">
                  <h6 className="font-medium text-gray-600 flex items-center space-x-2">
                    <SafeIcon icon={FiNavigation} />
                    <span>Other Links (Navigation/Footer)</span>
                  </h6>
                  {['other-internal', 'other-external', 'email', 'tel'].map(type => {
                    const links = linksByType[type] || [];
                    if (links.length === 0) return null;
                    
                    return (
                      <div key={type} className="border border-gray-200 rounded-lg">
                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                          <div className="flex items-center space-x-2">
                            <LinkTypeIcon type={type} />
                            <span className="font-medium">{LinkTypeLabel({ type })}</span>
                            <span className="text-sm text-gray-600">({links.length})</span>
                          </div>
                        </div>
                        <div className="p-3 max-h-32 overflow-y-auto">
                          <div className="space-y-1">
                            {links.slice(0, 5).map((link, index) => (
                              <code
                                key={index}
                                className="block bg-gray-50 px-2 py-1 rounded text-xs font-mono text-gray-600 hover:bg-blue-50 transition-colors"
                              >
                                {link.href}
                              </code>
                            ))}
                            {links.length > 5 && (
                              <p className="text-xs text-gray-500 pt-1">
                                +{links.length - 5} more links
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const ResultsDisplay = ({ results }) => {
  const [expandedSites, setExpandedSites] = useState(new Set([0])); // First site expanded by default
  
  const { articles, summary, analyzedAt } = results;
  
  const toggleSiteExpansion = (index) => {
    const newExpanded = new Set(expandedSites);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSites(newExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Article Content Analysis Results</h3>
            <p className="opacity-90">
              Analyzed {articles.length} article{articles.length > 1 ? 's' : ''} for SEO link optimization
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{summary.totalContentLinks}</div>
            <div className="text-sm opacity-90">Content Links Found</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4 text-sm opacity-75">
          <SafeIcon icon={FiClock} />
          <span>Analyzed at {format(new Date(analyzedAt), 'PPp')}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
          >
            <SafeIcon icon={FiFileText} className="text-2xl text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">{summary.totalContentLinks}</div>
            <div className="text-sm text-green-600">Content Links</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center"
          >
            <SafeIcon icon={FiNavigation} className="text-2xl text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{summary.totalOtherLinks}</div>
            <div className="text-sm text-gray-600">Other Links</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
          >
            <SafeIcon icon={FiCheckCircle} className="text-2xl text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">{summary.totalFoundInContent}</div>
            <div className="text-sm text-blue-600">Found in Content</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center"
          >
            <SafeIcon icon={FiAlertCircle} className="text-2xl text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-800">{summary.totalFoundInOther}</div>
            <div className="text-sm text-yellow-600">Found in Nav/Footer Only</div>
          </motion.div>
        </div>

        {/* Article Results */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <SafeIcon icon={FiList} />
            <span>Article Analysis Results</span>
          </h4>
          <div className="space-y-4">
            {articles.map((article, index) => (
              <ArticleResults
                key={index}
                article={article}
                isExpanded={expandedSites.has(index)}
                onToggle={() => toggleSiteExpansion(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsDisplay;