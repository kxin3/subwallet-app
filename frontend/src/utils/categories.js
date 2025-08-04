// frontend/src/utils/categories.js - Comprehensive subscription categories

export const SUBSCRIPTION_CATEGORIES = [
  'all',
  'Entertainment & Media',
  'Software & Productivity', 
  'Health & Fitness',
  'Web Services & Hosting',
  'Gaming',
  'Education & Learning',
  'Food & Delivery',
  'Transportation',
  'Finance & Banking',
  'Communication',
  'News & Magazines',
  'Music & Audio',
  'Video & Streaming',
  'Design & Creative',
  'Business & Professional',
  'Security & Privacy',
  'Storage & Cloud',
  'Shopping & Retail',
  'Utilities & Services',
  'Travel & Tourism',
  'Sports & Recreation',
  'Other'
];

// Comprehensive service mapping for automatic categorization
export const SERVICE_CATEGORY_MAPPING = {
  // Entertainment & Media
  'netflix': 'Entertainment & Media',
  'disney': 'Entertainment & Media',
  'hulu': 'Entertainment & Media',
  'prime video': 'Entertainment & Media',
  'amazon prime': 'Entertainment & Media',
  'paramount': 'Entertainment & Media',
  'peacock': 'Entertainment & Media',
  'hbo': 'Entertainment & Media',
  'showtime': 'Entertainment & Media',
  'starz': 'Entertainment & Media',
  'crunchyroll': 'Entertainment & Media',
  
  // Music & Audio
  'spotify': 'Music & Audio',
  'apple music': 'Music & Audio',
  'youtube music': 'Music & Audio',
  'pandora': 'Music & Audio',
  'tidal': 'Music & Audio',
  'soundcloud': 'Music & Audio',
  'audible': 'Music & Audio',
  'podcast': 'Music & Audio',
  
  // Software & Productivity
  'microsoft': 'Software & Productivity',
  'office 365': 'Software & Productivity',
  'adobe': 'Software & Productivity',
  'notion': 'Software & Productivity',
  'slack': 'Software & Productivity',
  'zoom': 'Software & Productivity',
  'teams': 'Software & Productivity',
  'asana': 'Software & Productivity',
  'trello': 'Software & Productivity',
  'monday': 'Software & Productivity',
  'clickup': 'Software & Productivity',
  'airtable': 'Software & Productivity',
  'zapier': 'Software & Productivity',
  'calendly': 'Software & Productivity',
  
  // Design & Creative
  'canva': 'Design & Creative',
  'figma': 'Design & Creative',
  'sketch': 'Design & Creative',
  'invision': 'Design & Creative',
  'framer': 'Design & Creative',
  'creative cloud': 'Design & Creative',
  'photoshop': 'Design & Creative',
  'illustrator': 'Design & Creative',
  
  // Web Services & Hosting
  'namecheap': 'Web Services & Hosting',
  'godaddy': 'Web Services & Hosting',
  'bluehost': 'Web Services & Hosting',
  'hostgator': 'Web Services & Hosting',
  'cloudflare': 'Web Services & Hosting',
  'aws': 'Web Services & Hosting',
  'google cloud': 'Web Services & Hosting',
  'azure': 'Web Services & Hosting',
  'digitalocean': 'Web Services & Hosting',
  'linode': 'Web Services & Hosting',
  'heroku': 'Web Services & Hosting',
  'vercel': 'Web Services & Hosting',
  'netlify': 'Web Services & Hosting',
  'webflow': 'Web Services & Hosting',
  'squarespace': 'Web Services & Hosting',
  'wix': 'Web Services & Hosting',
  'wordpress': 'Web Services & Hosting',
  'cdn': 'Web Services & Hosting',
  
  // Storage & Cloud
  'dropbox': 'Storage & Cloud',
  'google drive': 'Storage & Cloud',
  'icloud': 'Storage & Cloud',
  'onedrive': 'Storage & Cloud',
  'box': 'Storage & Cloud',
  'mega': 'Storage & Cloud',
  'backblaze': 'Storage & Cloud',
  
  // Gaming
  'steam': 'Gaming',
  'xbox': 'Gaming',
  'playstation': 'Gaming',
  'nintendo': 'Gaming',
  'epic games': 'Gaming',
  'origin': 'Gaming',
  'ubisoft': 'Gaming',
  'blizzard': 'Gaming',
  'twitch': 'Gaming',
  'discord nitro': 'Gaming',
  
  // Health & Fitness
  'puregym': 'Health & Fitness',
  'peloton': 'Health & Fitness',
  'fitbit': 'Health & Fitness',
  'myfitnesspal': 'Health & Fitness',
  'strava': 'Health & Fitness',
  'headspace': 'Health & Fitness',
  'calm': 'Health & Fitness',
  'noom': 'Health & Fitness',
  'gym': 'Health & Fitness',
  'fitness': 'Health & Fitness',
  'yoga': 'Health & Fitness',
  'meditation': 'Health & Fitness',
  
  // Education & Learning
  'coursera': 'Education & Learning',
  'udemy': 'Education & Learning',
  'skillshare': 'Education & Learning',
  'masterclass': 'Education & Learning',
  'linkedin learning': 'Education & Learning',
  'pluralsight': 'Education & Learning',
  'codecademy': 'Education & Learning',
  'khan academy': 'Education & Learning',
  'duolingo': 'Education & Learning',
  'babbel': 'Education & Learning',
  'rosetta stone': 'Education & Learning',
  
  // Communication
  'whatsapp': 'Communication',
  'telegram': 'Communication',
  'signal': 'Communication',
  'discord': 'Communication',
  'skype': 'Communication',
  
  // Food & Delivery
  'uber eats': 'Food & Delivery',
  'doordash': 'Food & Delivery',
  'grubhub': 'Food & Delivery',
  'postmates': 'Food & Delivery',
  'deliveroo': 'Food & Delivery',
  'zomato': 'Food & Delivery',
  'talabat': 'Food & Delivery',
  'careem food': 'Food & Delivery',
  'meal kit': 'Food & Delivery',
  'hellofresh': 'Food & Delivery',
  'blue apron': 'Food & Delivery',
  
  // Transportation
  'uber': 'Transportation',
  'lyft': 'Transportation',
  'careem': 'Transportation',
  'lime': 'Transportation',
  'bird': 'Transportation',
  'zipcar': 'Transportation',
  
  // Finance & Banking
  'mint': 'Finance & Banking',
  'ynab': 'Finance & Banking',
  'quickbooks': 'Finance & Banking',
  'freshbooks': 'Finance & Banking',
  'wave': 'Finance & Banking',
  'stripe': 'Finance & Banking',
  'paypal': 'Finance & Banking',
  'square': 'Finance & Banking',
  
  // Security & Privacy
  'nordvpn': 'Security & Privacy',
  'expressvpn': 'Security & Privacy',
  'surfshark': 'Security & Privacy',
  'protonvpn': 'Security & Privacy',
  'lastpass': 'Security & Privacy',
  '1password': 'Security & Privacy',
  'bitwarden': 'Security & Privacy',
  'dashlane': 'Security & Privacy',
  'malwarebytes': 'Security & Privacy',
  'norton': 'Security & Privacy',
  'mcafee': 'Security & Privacy',
  
  // News & Magazines
  'new york times': 'News & Magazines',
  'wall street journal': 'News & Magazines',
  'washington post': 'News & Magazines',
  'the guardian': 'News & Magazines',
  'medium': 'News & Magazines',
  'substack': 'News & Magazines',
  'economist': 'News & Magazines',
  'bloomberg': 'News & Magazines',
  
  // Business & Professional
  'salesforce': 'Business & Professional',
  'hubspot': 'Business & Professional',
  'mailchimp': 'Business & Professional',
  'constant contact': 'Business & Professional',
  'surveymoneky': 'Business & Professional',
  'typeform': 'Business & Professional',
  'intercom': 'Business & Professional',
  'zendesk': 'Business & Professional',
  'freshdesk': 'Business & Professional',
  
  // AI & Development
  'anthropic': 'Software & Productivity',
  'openai': 'Software & Productivity',
  'github': 'Software & Productivity',
  'gitlab': 'Software & Productivity',
  'bitbucket': 'Software & Productivity',
  'leonardo': 'Design & Creative',
  'fal': 'Software & Productivity',
  'runway': 'Design & Creative',
  'midjourney': 'Design & Creative',
  
  // Shopping & Retail
  'amazon prime membership': 'Shopping & Retail',
  'costco': 'Shopping & Retail',
  'walmart': 'Shopping & Retail',
  'target': 'Shopping & Retail',
  'instacart': 'Shopping & Retail',
  'shipt': 'Shopping & Retail',
  
  // Travel & Tourism
  'airbnb': 'Travel & Tourism',
  'booking': 'Travel & Tourism',
  'expedia': 'Travel & Tourism',
  'hotels': 'Travel & Tourism',
  'tripadvisor': 'Travel & Tourism',
  'kayak': 'Travel & Tourism'
};

/**
 * Get category for a service name using intelligent matching
 * @param {string} serviceName - Name of the service
 * @returns {string} Category name
 */
export const getCategoryForService = (serviceName) => {
  if (!serviceName) return 'Other';
  
  const serviceNameLower = serviceName.toLowerCase().trim();
  
  // Direct mapping lookup
  for (const [service, category] of Object.entries(SERVICE_CATEGORY_MAPPING)) {
    if (serviceNameLower.includes(service.toLowerCase())) {
      return category;
    }
  }
  
  // Keyword-based categorization for services not in mapping
  const keywords = {
    'Entertainment & Media': ['tv', 'movie', 'film', 'entertainment', 'media', 'streaming', 'video'],
    'Music & Audio': ['music', 'audio', 'sound', 'radio', 'podcast', 'song'],
    'Software & Productivity': ['software', 'app', 'tool', 'productivity', 'api', 'ai', 'analytics'],
    'Health & Fitness': ['health', 'fitness', 'gym', 'workout', 'exercise', 'medical', 'wellness'],
    'Gaming': ['game', 'gaming', 'play', 'esports'],
    'Education & Learning': ['education', 'learning', 'course', 'training', 'tutorial', 'study'],
    'Food & Delivery': ['food', 'delivery', 'restaurant', 'meal', 'recipe', 'cooking'],
    'Transportation': ['transport', 'ride', 'taxi', 'car', 'bike', 'scooter'],
    'Finance & Banking': ['bank', 'finance', 'money', 'payment', 'accounting', 'invoice'],
    'Security & Privacy': ['security', 'privacy', 'vpn', 'password', 'antivirus', 'protection'],
    'News & Magazines': ['news', 'magazine', 'journal', 'newspaper', 'article', 'publication'],
    'Web Services & Hosting': ['hosting', 'domain', 'web', 'server', 'cloud', 'infrastructure', 'cdn'],
    'Design & Creative': ['design', 'creative', 'art', 'photo', 'image', 'graphics', 'logo'],
    'Storage & Cloud': ['storage', 'backup', 'sync', 'drive', 'cloud'],
    'Communication': ['chat', 'message', 'call', 'video', 'communication', 'meeting']
  };
  
  for (const [category, categoryKeywords] of Object.entries(keywords)) {
    if (categoryKeywords.some(keyword => serviceNameLower.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
};

/**
 * Get all available categories
 * @returns {Array} Array of category strings
 */
export const getAllCategories = () => SUBSCRIPTION_CATEGORIES;

/**
 * Get categories for dropdown (excluding 'all')
 * @returns {Array} Array of category strings for forms
 */
export const getFormCategories = () => SUBSCRIPTION_CATEGORIES.filter(cat => cat !== 'all');

const categoriesExport = {
  SUBSCRIPTION_CATEGORIES,
  SERVICE_CATEGORY_MAPPING,
  getCategoryForService,
  getAllCategories,
  getFormCategories
};

export default categoriesExport;