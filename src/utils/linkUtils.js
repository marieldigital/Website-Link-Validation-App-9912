/**
 * Enhanced link utilities for article content analysis
 */

/**
 * Extract links from article content, separating content links from navigation/footer links
 * @param {string} htmlContent - The HTML content to parse
 * @param {string} baseUrl - The base URL of the article
 * @returns {Object} Object containing categorized links
 */
export const extractLinksFromArticle = (htmlContent, baseUrl) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const baseDomain = new URL(baseUrl).hostname;
  const linksByType = {
    'content-internal': [],
    'content-external': [],
    'other-internal': [],
    'other-external': [],
    email: [],
    tel: [],
    anchor: [],
    javascript: []
  };

  // Define content selectors (main article content areas)
  const contentSelectors = [
    'article', 'main', '.content', '.post-content', '.entry-content',
    '.article-content', '.blog-content', '.post-body', '.article-body',
    '[role="main"]', '.main-content', '.page-content', '.story-content'
  ];

  // Define navigation/footer selectors (areas to exclude from content)
  const navigationSelectors = [
    'nav', 'header', 'footer', '.navigation', '.nav', '.menu',
    '.header', '.footer', '.sidebar', '.widget', '.aside',
    '.breadcrumb', '.pagination', '.author-bio', '.related-posts',
    '.comments', '.social-share', '.tags', '.categories'
  ];

  // Get all links
  const allLinks = doc.querySelectorAll('a[href]');
  
  // Identify content area
  let contentArea = null;
  for (const selector of contentSelectors) {
    contentArea = doc.querySelector(selector);
    if (contentArea) break;
  }

  // If no specific content area found, use body but exclude navigation areas
  if (!contentArea) {
    contentArea = doc.body;
  }

  allLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkData = {
      href: href.trim(),
      text: link.textContent.trim(),
      title: link.getAttribute('title') || ''
    };

    // Determine if link is in content area or navigation/footer
    const isInNavigation = navigationSelectors.some(selector => {
      const navElements = doc.querySelectorAll(selector);
      return Array.from(navElements).some(navEl => navEl.contains(link));
    });

    const isInContent = !isInNavigation && (
      contentArea.contains(link) || 
      // Additional heuristics for content detection
      isLikelyContentLink(link)
    );

    try {
      // Email links
      if (href.startsWith('mailto:')) {
        linksByType.email.push({ ...linkData, type: 'email' });
        return;
      }

      // Phone links
      if (href.startsWith('tel:')) {
        linksByType.tel.push({ ...linkData, type: 'tel' });
        return;
      }

      // JavaScript links
      if (href.startsWith('javascript:')) {
        linksByType.javascript.push({ ...linkData, type: 'javascript' });
        return;
      }

      // Anchor links
      if (href.startsWith('#')) {
        linksByType.anchor.push({ ...linkData, type: 'anchor' });
        return;
      }

      // Categorize based on domain and location
      let isInternal = false;
      if (href.startsWith('/')) {
        isInternal = true;
      } else if (href.startsWith('http://') || href.startsWith('https://')) {
        const linkUrl = new URL(href);
        isInternal = linkUrl.hostname === baseDomain;
      } else {
        // Relative URL
        isInternal = true;
      }

      // Assign to appropriate category
      if (isInternal) {
        if (isInContent) {
          linksByType['content-internal'].push({ ...linkData, type: 'content-internal' });
        } else {
          linksByType['other-internal'].push({ ...linkData, type: 'other-internal' });
        }
      } else {
        if (isInContent) {
          linksByType['content-external'].push({ ...linkData, type: 'content-external' });
        } else {
          linksByType['other-external'].push({ ...linkData, type: 'other-external' });
        }
      }
    } catch (e) {
      // Handle malformed URLs - assume internal
      if (isInContent) {
        linksByType['content-internal'].push({ ...linkData, type: 'content-internal' });
      } else {
        linksByType['other-internal'].push({ ...linkData, type: 'other-internal' });
      }
    }
  });

  // Remove duplicates within each category
  Object.keys(linksByType).forEach(type => {
    const seen = new Set();
    linksByType[type] = linksByType[type].filter(link => {
      const key = link.href.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

  const totalLinks = Object.values(linksByType).reduce((sum, links) => sum + links.length, 0);
  const contentLinks = [...linksByType['content-internal'], ...linksByType['content-external']];
  const otherLinks = [...linksByType['other-internal'], ...linksByType['other-external'], ...linksByType.email, ...linksByType.tel];

  return {
    linksByType,
    totalLinks,
    contentLinks,
    otherLinks,
    allLinks: Object.values(linksByType).flat()
  };
};

/**
 * Heuristic to determine if a link is likely in content vs navigation
 * @param {Element} link - The link element
 * @returns {boolean} Whether the link appears to be in content
 */
const isLikelyContentLink = (link) => {
  // Check parent elements for content indicators
  let parent = link.parentElement;
  let depth = 0;
  
  while (parent && depth < 5) {
    const tagName = parent.tagName.toLowerCase();
    const className = parent.className.toLowerCase();
    
    // Content indicators
    if (['p', 'div', 'span', 'section'].includes(tagName)) {
      if (className.includes('content') || className.includes('text') || className.includes('body')) {
        return true;
      }
    }
    
    // Navigation indicators
    if (['nav', 'header', 'footer'].includes(tagName) || 
        className.includes('nav') || className.includes('menu') || 
        className.includes('header') || className.includes('footer')) {
      return false;
    }
    
    parent = parent.parentElement;
    depth++;
  }
  
  // Check link text length (content links often have more descriptive text)
  const linkText = link.textContent.trim();
  if (linkText.length > 20) return true;
  
  // Check for common navigation patterns
  const navPatterns = ['home', 'about', 'contact', 'services', 'products', 'blog', 'login', 'signup'];
  if (navPatterns.some(pattern => linkText.toLowerCase().includes(pattern))) {
    return false;
  }
  
  return true; // Default to content if unsure
};

/**
 * Check if target links exist in the extracted links, with content/navigation distinction
 * @param {Array} targetLinks - Links to search for
 * @param {Object} linkAnalysis - Analysis results with categorized links
 * @returns {Array} Array of check results
 */
export const checkTargetLinksInArticle = (targetLinks, linkAnalysis) => {
  const { contentLinks, otherLinks, allLinks } = linkAnalysis;
  
  return targetLinks.map(targetLink => {
    const normalizedTarget = targetLink.toLowerCase().trim();
    
    // Check content links first
    const contentMatches = contentLinks.filter(link => {
      return matchesTarget(link.href, normalizedTarget);
    });
    
    // Check other links
    const otherMatches = otherLinks.filter(link => {
      return matchesTarget(link.href, normalizedTarget);
    });

    return {
      targetLink,
      foundInContent: contentMatches.length > 0,
      foundInOther: otherMatches.length > 0,
      contentMatches,
      otherMatches,
      exists: contentMatches.length > 0 || otherMatches.length > 0
    };
  });
};

/**
 * Helper function to check if a link matches the target
 * @param {string} linkHref - The link href to check
 * @param {string} normalizedTarget - The normalized target link
 * @returns {boolean} Whether the link matches the target
 */
const matchesTarget = (linkHref, normalizedTarget) => {
  const normalizedHref = linkHref.toLowerCase();
  
  // Exact match
  if (normalizedHref === normalizedTarget) return true;
  
  // Contains match
  if (normalizedHref.includes(normalizedTarget) || normalizedTarget.includes(normalizedHref)) {
    return true;
  }
  
  // Domain match for external links
  if (normalizedTarget.includes('://') && linkHref.includes('://')) {
    try {
      const targetDomain = new URL(normalizedTarget).hostname;
      const linkDomain = new URL(linkHref).hostname;
      return targetDomain === linkDomain;
    } catch (e) {
      return false;
    }
  }
  
  // Path match for internal links
  if (normalizedTarget.startsWith('/') && linkHref.includes(normalizedTarget)) {
    return true;
  }
  
  return false;
};

/**
 * Simulate article content fetching and analysis
 * @param {string} url - Article URL to analyze
 * @param {Array} targetLinks - Links to check for
 * @returns {Promise} Promise resolving to analysis results
 */
export const simulateArticleAnalysis = async (url, targetLinks) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  // Generate realistic mock article content
  const mockContent = generateMockArticleContent(url);
  const linkAnalysis = extractLinksFromArticle(mockContent.html, url);
  const checkResults = checkTargetLinksInArticle(targetLinks, linkAnalysis);
  
  // Calculate SEO analysis
  const seoAnalysis = {
    contentLinkCount: linkAnalysis.contentLinks.length,
    hasInternalContentLinks: linkAnalysis.linksByType['content-internal'].length > 0,
    hasExternalContentLinks: linkAnalysis.linksByType['content-external'].length > 0,
    linkDensity: linkAnalysis.contentLinks.length / Math.max(mockContent.wordCount, 1)
  };
  
  return {
    url,
    totalLinks: linkAnalysis.totalLinks,
    linksByType: linkAnalysis.linksByType,
    checkResults,
    seoAnalysis,
    contentLinks: linkAnalysis.contentLinks,
    otherLinks: linkAnalysis.otherLinks
  };
};

/**
 * Analyze multiple articles
 * @param {Array} urls - Array of article URLs
 * @param {Array} targetLinks - Links to check for
 * @returns {Promise} Promise resolving to comprehensive analysis results
 */
export const analyzeMultipleArticles = async (urls, targetLinks) => {
  const articles = [];

  // Process each article
  for (const url of urls) {
    try {
      const result = await simulateArticleAnalysis(url, targetLinks);
      articles.push(result);
    } catch (error) {
      articles.push({
        url,
        error: `Failed to analyze: ${error.message}`,
        totalLinks: 0,
        linksByType: {},
        checkResults: [],
        seoAnalysis: {},
        contentLinks: [],
        otherLinks: []
      });
    }
  }

  // Calculate summary statistics
  const summary = {
    totalContentLinks: articles.reduce((sum, article) => 
      sum + (article.contentLinks?.length || 0), 0),
    totalOtherLinks: articles.reduce((sum, article) => 
      sum + (article.otherLinks?.length || 0), 0),
    totalFoundInContent: articles.reduce((sum, article) => 
      sum + (article.checkResults?.filter(r => r.foundInContent).length || 0), 0),
    totalFoundInOther: articles.reduce((sum, article) => 
      sum + (article.checkResults?.filter(r => r.foundInOther && !r.foundInContent).length || 0), 0),
  };

  return {
    articles,
    summary,
    analyzedAt: new Date().toISOString(),
    targetLinksCount: targetLinks.length
  };
};

/**
 * Generate realistic mock article content for demonstration
 * @param {string} url - The article URL
 * @returns {Object} Mock HTML content and metadata
 */
const generateMockArticleContent = (url) => {
  const domain = new URL(url).hostname;
  const isArticle = url.includes('/article') || url.includes('/blog') || url.includes('/news');
  
  // Content area links (these should be found in article content)
  const contentInternalLinks = [
    '/related-article-1', '/category/technology', '/author/jane-smith',
    '/previous-post', '/next-post', '/similar-topics', '/resources'
  ];
  
  const contentExternalLinks = [
    'https://example-source.com/research', 'https://authority-site.com/study',
    'https://github.com/project/repo', 'https://documentation.com/api',
    'https://research-paper.com/study', 'https://official-site.com/announcement'
  ];
  
  // Navigation/footer links (these should NOT be in content)
  const navigationLinks = [
    '/', '/home', '/about', '/contact', '/services', '/products',
    '/blog', '/privacy', '/terms', '/sitemap', '/login', '/signup'
  ];
  
  const footerExternalLinks = [
    'https://facebook.com/' + domain, 'https://twitter.com/' + domain,
    'https://linkedin.com/company/' + domain, 'https://instagram.com/' + domain
  ];
  
  // Create realistic article structure
  const mockHtml = `
    <html>
      <head><title>Article Title</title></head>
      <body>
        <header>
          <nav class="navigation">
            ${navigationLinks.map(link => `<a href="${link}">Nav Link</a>`).join('\n')}
          </nav>
        </header>
        
        <main>
          <article class="article-content">
            <h1>Article Title</h1>
            <div class="post-content">
              <p>This is the main article content with <a href="${contentInternalLinks[0]}">internal reference</a> 
              and <a href="${contentExternalLinks[0]}">external source</a>.</p>
              
              <p>More content with <a href="${contentInternalLinks[1]}">related category</a> and 
              <a href="${contentExternalLinks[1]}">research study</a>.</p>
              
              <p>Additional paragraph mentioning <a href="${contentInternalLinks[2]}">author page</a> 
              and <a href="${contentExternalLinks[2]}">GitHub repository</a>.</p>
              
              <h2>Section Title</h2>
              <p>Section content with <a href="${contentInternalLinks[3]}">previous post</a> reference.</p>
              
              <p>For more information, see <a href="${contentExternalLinks[3]}">official documentation</a> 
              and <a href="${contentInternalLinks[4]}">next post</a>.</p>
            </div>
          </article>
          
          <aside class="sidebar">
            <div class="related-posts">
              <a href="/sidebar-link-1">Sidebar Link</a>
              <a href="/sidebar-link-2">Another Sidebar Link</a>
            </div>
          </aside>
        </main>
        
        <footer class="footer">
          ${footerExternalLinks.map(link => `<a href="${link}">Social Link</a>`).join('\n')}
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="mailto:contact@${domain}">Contact Email</a>
          <a href="tel:+1234567890">Phone Number</a>
        </footer>
      </body>
    </html>
  `;
  
  return { 
    html: mockHtml,
    wordCount: 500 // Approximate word count for SEO calculations
  };
};

/**
 * Real article analysis (would be used with a backend service)
 * @param {string} url - Article URL to analyze
 * @returns {Promise} Promise resolving to analysis results
 */
export const analyzeRealArticle = async (url) => {
  try {
    // Note: This would need a backend service in production due to CORS
    const response = await fetch(url);
    const htmlContent = await response.text();
    const linkAnalysis = extractLinksFromArticle(htmlContent, url);
    
    return {
      success: true,
      ...linkAnalysis
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};