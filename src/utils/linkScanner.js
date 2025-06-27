/**
 * Link Scanner Utilities
 * Comprehensive link analysis and categorization
 */

/**
 * Social media domains for detection
 */
const SOCIAL_MEDIA_DOMAINS = [
  'facebook.com', 'fb.com', 'twitter.com', 'x.com', 'linkedin.com',
  'instagram.com', 'youtube.com', 'pinterest.com', 'tiktok.com',
  'snapchat.com', 'reddit.com', 'tumblr.com', 'discord.com',
  'telegram.org', 'whatsapp.com', 'wechat.com'
];

/**
 * Extract and categorize all links from HTML content
 * @param {string} htmlContent - The HTML content to parse
 * @param {string} baseUrl - The base URL of the page
 * @returns {Object} Categorized links object
 */
export const extractAndCategorizeLinks = (htmlContent, baseUrl) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const baseDomain = new URL(baseUrl).hostname;

  const categorizedLinks = {
    menuLinks: [],
    footerLinks: [],
    socialMediaLinks: [],
    emailAddresses: [],
    otherLinks: {
      internal: [],
      external: []
    },
    allLinks: []
  };

  // Get all anchor tags
  const allAnchorTags = doc.querySelectorAll('a[href]');
  const usedLinks = new Set(); // Track links to avoid duplicates across categories

  // Extract menu/navigation links
  const menuSelectors = [
    'nav a[href]',
    '.nav a[href]',
    '.navigation a[href]',
    '.menu a[href]',
    '.navbar a[href]',
    'ul.menu a[href]',
    'ul.nav a[href]',
    '.main-nav a[href]',
    '.primary-nav a[href]',
    'header nav a[href]'
  ];

  menuSelectors.forEach(selector => {
    const menuLinks = doc.querySelectorAll(selector);
    menuLinks.forEach(link => {
      const linkData = extractLinkData(link, baseDomain);
      if (linkData && !usedLinks.has(linkData.href)) {
        categorizedLinks.menuLinks.push(linkData);
        usedLinks.add(linkData.href);
      }
    });
  });

  // Extract footer links
  const footerLinks = doc.querySelectorAll('footer a[href], .footer a[href]');
  footerLinks.forEach(link => {
    const linkData = extractLinkData(link, baseDomain);
    if (linkData && !usedLinks.has(linkData.href)) {
      categorizedLinks.footerLinks.push(linkData);
      usedLinks.add(linkData.href);
    }
  });

  // Extract social media links (with priority over other categories)
  allAnchorTags.forEach(link => {
    const linkData = extractLinkData(link, baseDomain);
    if (linkData && isSocialMediaLink(linkData.href)) {
      if (!usedLinks.has(linkData.href)) {
        categorizedLinks.socialMediaLinks.push(linkData);
        usedLinks.add(linkData.href);
      }
    }
  });

  // Extract email addresses
  const emailLinks = doc.querySelectorAll('a[href^="mailto:"]');
  const emailSet = new Set();
  
  emailLinks.forEach(link => {
    const email = link.href.replace('mailto:', '').split('?')[0]; // Remove query params
    emailSet.add(email);
  });

  // Also look for email addresses in plain text
  const textContent = doc.body.textContent || '';
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const textEmails = textContent.match(emailRegex) || [];
  textEmails.forEach(email => emailSet.add(email));

  categorizedLinks.emailAddresses = Array.from(emailSet);

  // Categorize remaining links as internal/external "other" links
  allAnchorTags.forEach(link => {
    const linkData = extractLinkData(link, baseDomain);
    if (linkData && !usedLinks.has(linkData.href) && !linkData.href.startsWith('mailto:') && !linkData.href.startsWith('tel:')) {
      if (linkData.isInternal) {
        categorizedLinks.otherLinks.internal.push(linkData);
      } else {
        categorizedLinks.otherLinks.external.push(linkData);
      }
      usedLinks.add(linkData.href);
    }
  });

  // Store all links for reference
  allAnchorTags.forEach(link => {
    const linkData = extractLinkData(link, baseDomain);
    if (linkData) {
      categorizedLinks.allLinks.push(linkData);
    }
  });

  // Remove duplicates and limit to 10 items per category (except emails)
  categorizedLinks.menuLinks = removeDuplicateLinks(categorizedLinks.menuLinks);
  categorizedLinks.footerLinks = removeDuplicateLinks(categorizedLinks.footerLinks);
  categorizedLinks.socialMediaLinks = removeDuplicateLinks(categorizedLinks.socialMediaLinks);
  categorizedLinks.otherLinks.internal = removeDuplicateLinks(categorizedLinks.otherLinks.internal);
  categorizedLinks.otherLinks.external = removeDuplicateLinks(categorizedLinks.otherLinks.external);

  return categorizedLinks;
};

/**
 * Extract link data from anchor element
 * @param {Element} linkElement - The anchor element
 * @param {string} baseDomain - The base domain for internal/external classification
 * @returns {Object|null} Link data object or null if invalid
 */
const extractLinkData = (linkElement, baseDomain) => {
  const href = linkElement.getAttribute('href');
  if (!href || href.trim() === '' || href.startsWith('javascript:') || href === '#') {
    return null;
  }

  let text = linkElement.textContent.trim();
  
  // Handle image links
  const img = linkElement.querySelector('img');
  if (img && !text) {
    text = img.getAttribute('alt') || 'Image Link';
  }

  // If text is empty, use href
  if (!text) {
    text = href;
  }

  let isInternal = false;
  let fullUrl = href;

  try {
    if (href.startsWith('http://') || href.startsWith('https://')) {
      const linkUrl = new URL(href);
      isInternal = linkUrl.hostname === baseDomain;
      fullUrl = href;
    } else if (href.startsWith('/')) {
      isInternal = true;
      fullUrl = href; // Keep relative for internal links
    } else if (!href.startsWith('mailto:') && !href.startsWith('tel:')) {
      isInternal = true;
      fullUrl = href; // Relative link
    } else {
      fullUrl = href;
    }
  } catch (e) {
    // Handle malformed URLs
    isInternal = true;
    fullUrl = href;
  }

  return {
    href: fullUrl,
    text: text,
    isInternal: isInternal,
    title: linkElement.getAttribute('title') || ''
  };
};

/**
 * Check if a URL is a social media link
 * @param {string} url - The URL to check
 * @returns {boolean} True if it's a social media link
 */
const isSocialMediaLink = (url) => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '');
    return SOCIAL_MEDIA_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch (e) {
    return false;
  }
};

/**
 * Remove duplicate links based on href
 * @param {Array} links - Array of link objects
 * @returns {Array} Deduplicated array
 */
const removeDuplicateLinks = (links) => {
  const seen = new Set();
  return links.filter(link => {
    const key = link.href.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

/**
 * Check if target link exists in the page
 * @param {string} targetLink - The target link to search for
 * @param {Object} categorizedLinks - The categorized links object
 * @returns {Object} Result object with found status and anchor text
 */
export const checkTargetLink = (targetLink, categorizedLinks) => {
  const normalizedTarget = targetLink.toLowerCase().trim();
  
  // Search through all links
  for (const link of categorizedLinks.allLinks) {
    if (matchesTarget(link.href, normalizedTarget)) {
      return {
        found: true,
        anchorText: link.text,
        matchedHref: link.href
      };
    }
  }

  return {
    found: false,
    anchorText: null,
    matchedHref: null
  };
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
  if (normalizedHref === normalizedTarget) {
    return true;
  }
  
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
 * Simulate scanning a single URL (mock implementation)
 * @param {string} pageUrl - The page URL to scan
 * @param {string} targetLink - The target link to search for
 * @returns {Promise<Object>} Scan result object
 */
export const scanSingleUrl = async (pageUrl, targetLink) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  try {
    // Validate URLs
    new URL(pageUrl);
    
    // Generate mock HTML content for demonstration
    const mockHtml = generateMockPageContent(pageUrl, targetLink);
    
    // Extract and categorize links
    const categorizedLinks = extractAndCategorizeLinks(mockHtml, pageUrl);
    
    // Check if target link exists
    const targetResult = checkTargetLink(targetLink, categorizedLinks);
    
    return {
      pageUrl,
      targetLink,
      targetFound: targetResult.found,
      anchorText: targetResult.anchorText,
      menuLinks: categorizedLinks.menuLinks,
      footerLinks: categorizedLinks.footerLinks,
      socialMediaLinks: categorizedLinks.socialMediaLinks,
      emailAddresses: categorizedLinks.emailAddresses,
      otherLinks: categorizedLinks.otherLinks,
      error: null
    };
  } catch (error) {
    return {
      pageUrl,
      targetLink,
      targetFound: false,
      anchorText: null,
      menuLinks: [],
      footerLinks: [],
      socialMediaLinks: [],
      emailAddresses: [],
      otherLinks: { internal: [], external: [] },
      error: `Failed to scan: ${error.message}`
    };
  }
};

/**
 * Scan multiple URLs
 * @param {Array} scanRows - Array of scan row objects with pageUrl and targetLink
 * @returns {Promise<Object>} Complete scan results
 */
export const scanMultipleUrls = async (scanRows) => {
  const scanResults = [];
  
  // Process each URL
  for (const row of scanRows) {
    if (row.pageUrl.trim() && row.targetLink.trim()) {
      const result = await scanSingleUrl(row.pageUrl.trim(), row.targetLink.trim());
      scanResults.push(result);
    }
  }
  
  // Calculate summary statistics
  const summary = {
    totalScanned: scanResults.length,
    targetsFound: scanResults.filter(r => r.targetFound).length,
    totalLinksFound: scanResults.reduce((sum, r) => 
      sum + r.menuLinks.length + r.footerLinks.length + r.socialMediaLinks.length + 
      r.otherLinks.internal.length + r.otherLinks.external.length, 0),
    totalMenuLinks: scanResults.reduce((sum, r) => sum + r.menuLinks.length, 0),
    totalFooterLinks: scanResults.reduce((sum, r) => sum + r.footerLinks.length, 0),
    totalSocialLinks: scanResults.reduce((sum, r) => sum + r.socialMediaLinks.length, 0),
    totalEmailAddresses: scanResults.reduce((sum, r) => sum + r.emailAddresses.length, 0),
    totalOtherLinks: scanResults.reduce((sum, r) => 
      sum + r.otherLinks.internal.length + r.otherLinks.external.length, 0),
    errorCount: scanResults.filter(r => r.error).length
  };
  
  return {
    scanResults,
    summary,
    scannedAt: new Date().toISOString()
  };
};

/**
 * Generate mock HTML content for demonstration
 * @param {string} pageUrl - The page URL
 * @param {string} targetLink - The target link to potentially include
 * @returns {string} Mock HTML content
 */
const generateMockPageContent = (pageUrl, targetLink) => {
  const domain = new URL(pageUrl).hostname;
  const shouldIncludeTarget = Math.random() > 0.3; // 70% chance to include target
  
  // Generate various types of links
  const menuLinks = [
    '/', '/about', '/services', '/products', '/contact', '/blog'
  ];
  
  const footerLinks = [
    '/privacy', '/terms', '/sitemap', '/careers', '/support'
  ];
  
  const socialLinks = [
    `https://facebook.com/${domain.replace('.', '')}`,
    `https://twitter.com/${domain.replace('.', '')}`,
    `https://linkedin.com/company/${domain.replace('.', '')}`,
    `https://instagram.com/${domain.replace('.', '')}`,
  ];
  
  const otherInternalLinks = [
    '/news', '/resources', '/downloads', '/faq', '/help'
  ];
  
  const otherExternalLinks = [
    'https://example.com/partner',
    'https://authority-site.com/reference',
    'https://documentation.com/api',
    'https://github.com/project/repo'
  ];
  
  const emails = [
    `contact@${domain}`,
    `info@${domain}`,
    `support@${domain}`
  ];
  
  // Build HTML content
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sample Page - ${domain}</title>
    </head>
    <body>
      <header>
        <nav class="main-nav">
          <ul class="menu">
            ${menuLinks.map(link => `<li><a href="${link}">Menu Item</a></li>`).join('')}
          </ul>
        </nav>
      </header>
      
      <main>
        <article>
          <h1>Main Content</h1>
          <p>This is the main content area with various links.</p>
          
          ${shouldIncludeTarget ? `<p>Here is a link to <a href="${targetLink}">target content</a> that you're looking for.</p>` : ''}
          
          <p>Some other content links:</p>
          <ul>
            ${otherInternalLinks.map(link => `<li><a href="${link}">Internal Link</a></li>`).join('')}
            ${otherExternalLinks.map(link => `<li><a href="${link}">External Reference</a></li>`).join('')}
          </ul>
          
          <p>Contact us at <a href="mailto:${emails[0]}">${emails[0]}</a> for more information.</p>
        </article>
        
        <aside>
          <div class="social-media">
            <h3>Follow Us</h3>
            ${socialLinks.map(link => `<a href="${link}">Social Link</a>`).join(' | ')}
          </div>
        </aside>
      </main>
      
      <footer class="footer">
        <div class="footer-links">
          ${footerLinks.map(link => `<a href="${link}">Footer Link</a>`).join(' | ')}
        </div>
        <div class="contact-info">
          <p>Email: ${emails[1]} | Phone: <a href="tel:+1234567890">+1-234-567-890</a></p>
          <p>Additional contact: <a href="mailto:${emails[2]}">${emails[2]}</a></p>
        </div>
        <div class="social-footer">
          ${socialLinks.slice(0, 2).map(link => `<a href="${link}">Social</a>`).join(' | ')}
        </div>
      </footer>
    </body>
    </html>
  `;
  
  return htmlContent;
};

/**
 * Real URL scanning (would be used with a backend service in production)
 * @param {string} pageUrl - The page URL to scan
 * @returns {Promise<string>} HTML content
 */
export const fetchRealPageContent = async (pageUrl) => {
  try {
    // Note: This would need a backend service in production due to CORS
    const response = await fetch(pageUrl, {
      mode: 'cors',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkScanner/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch page: ${error.message}`);
  }
};