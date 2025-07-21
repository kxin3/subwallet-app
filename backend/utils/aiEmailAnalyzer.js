// backend/utils/aiEmailAnalyzer.js - Enhanced OpenAI-powered email analysis for subscription detection

const OpenAI = require('openai');

class AIEmailAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    if (!process.env.OPENAI_API_KEY) {
      console.warn('Warning: OPENAI_API_KEY not found in environment variables');
    }
  }

  // Enhanced system prompt with detailed examples and logic
  getSystemPrompt() {
    return `You are an expert email analyzer specializing in subscription and billing email detection. You must accurately identify legitimate subscription payments and extract precise financial information.

CRITICAL ANALYSIS REQUIREMENTS:
1. You MUST analyze the FULL email content thoroughly 
2. Look for specific payment amounts, billing statements, and subscription confirmations
3. Only identify CONFIRMED subscription payments with actual monetary transactions
4. Extract exact amounts from payment confirmations, receipts, and billing statements
5. Distinguish between promotional emails and actual payment confirmations

SUBSCRIPTION IDENTIFICATION CRITERIA:
✅ MARK AS SUBSCRIPTION IF:
- Contains payment confirmation with specific amount ($X.XX, AED X.XX, etc.)
- Shows billing statement or invoice with charges
- Receipt for recurring service payment
- Membership fee payment confirmation (even if amount in attachment)
- Subscription renewal notifications (even for paid services without showing amount)
- Auto-payment confirmation for services
- Monthly/annual membership invoices (gym, software, hosting)
- Service top-ups or credits for subscription services
- Recurring billing notifications from known subscription services

✅ SPECIAL CASES - MARK AS SUBSCRIPTION EVEN WITHOUT VISIBLE AMOUNT:
- Gym membership invoices that reference "invoice in attachments"
- Hosting/domain renewal notices from providers (Namecheap, etc.)
- Subscription service payment confirmations
- Monthly membership fee notifications
- Service billing statements

❌ MARK AS NOT SUBSCRIPTION IF:
- Free trial offers or promotional emails
- Marketing emails about subscription services
- Generic bank payment notifications without service context
- Job alerts, newsletters, social media notifications
- One-time purchase confirmations
- Security notifications or password resets

AMOUNT EXTRACTION PRIORITY:
1. Payment confirmation amounts: "Charged $X.XX", "Payment of AED X.XX"
2. Invoice/bill amounts: "Total: $X.XX", "Amount due: $X.XX"  
3. Receipt amounts: "You paid $X.XX", "Transaction amount: $X.XX"
4. Subscription fee statements: "Monthly fee: $X.XX", "Membership: AED X.XX"
5. Top-up amounts: "topped up your balance by $X.XX"

SPECIAL AMOUNT HANDLING:
- If invoice is in attachment, estimate based on service type:
  * Gym memberships: 100-200 AED/month typical
  * Basic hosting/CDN: 0.99-9.99 USD/month typical
  * Premium hosting: 10-50 USD/month typical
  * Software services: 10-100 USD/month typical
  * AI/API services: 5-50 USD/month typical
- For "Free" subscriptions that auto-renew to paid, estimate minimal amounts (0.99-4.99)
- For renewal notices without amounts, use service-specific estimates
- Always prefer actual amounts when available

RESPONSE FORMAT (JSON ONLY):
{
  "isSubscription": boolean,
  "type": "subscription" | "cancellation" | "receipt" | "renewal" | null,
  "serviceName": string | null,
  "amount": number | null,
  "currency": "USD" | "EUR" | "GBP" | "AED" | null,
  "nextRenewalDate": "YYYY-MM-DD" | null,
  "renewalDay": number | null,
  "category": "Entertainment & Media" | "Software & Productivity" | "Health & Fitness" | "Web Services & Hosting" | "Gaming" | "Education & Learning" | "Food & Delivery" | "Transportation" | "Finance & Banking" | "Communication" | "News & Magazines" | "Music & Audio" | "Video & Streaming" | "Design & Creative" | "Business & Professional" | "Security & Privacy" | "Storage & Cloud" | "Shopping & Retail" | "Utilities & Services" | "Travel & Tourism" | "Sports & Recreation" | "Other" | null,
  "confidence": number (1-10),
  "isMonthlyCharge": boolean,
  "description": string | null,
  "reasons": [array of strings explaining the decision]
}

REAL-WORLD EXAMPLES:

EXAMPLE 1 - GYM MEMBERSHIP WITH AMOUNT (SUBSCRIPTION):
Subject: "PureGym membership invoice"
Content: "Your monthly membership fee of AED 129.00 has been charged to your card ending in 1234. Membership valid until next month."
→ isSubscription: true, amount: 129.00, currency: "AED", serviceName: "PureGym"

EXAMPLE 2 - GYM MEMBERSHIP IN ATTACHMENT (SUBSCRIPTION):
Subject: "PureGym membership invoice"
Content: "Deduction notification from Pure Gym Dear Hussain, Please see your invoice in the attachments. If you have any questions about your subscription or billing, please get in touch."
→ isSubscription: true, amount: 150.00, currency: "AED", serviceName: "PureGym" (estimated gym fee)

EXAMPLE 3 - HOSTING RENEWAL (SUBSCRIPTION):
Subject: "Your CDN Free subscription will be renewed in 3 days"
Content: "You have an upcoming renewal for one of your subscriptions. Hello Hussain, You have an upcoming renewal for CDN service."
→ isSubscription: true, amount: 0.99, currency: "USD", serviceName: "Namecheap CDN" (estimated basic hosting fee)

EXAMPLE 4 - SERVICE TOP-UP (SUBSCRIPTION):
Subject: "Payment Confirmation"
Content: "Hi Hussain! You have successfully topped up your balance by $10.00. Best regards, team fal"
→ isSubscription: true, amount: 10.00, currency: "USD", serviceName: "fal.ai"

EXAMPLE 5 - LEONARDO SUBSCRIPTION (SUBSCRIPTION):
Subject: "Your subscription to Leonardo Interactive PTY LTD"
Content: "Your subscription confirmation. Thank you for choosing Leonardo Interactive PTY LTD! Your subscription will renew."
→ isSubscription: true, amount: 9.45, currency: "USD", serviceName: "Leonardo Interactive"

EXAMPLE 6 - WEBFLOW SUBSCRIPTION (SUBSCRIPTION):
Subject: "Your Webflow plan has been renewed"
Content: "Thank you for your payment. Your Webflow Site plan subscription of $14/month has been renewed and is active."
→ isSubscription: true, amount: 14.00, currency: "USD", serviceName: "Webflow", category: "Web Services & Hosting"

EXAMPLE 7 - ANTHROPIC CLAUDE (SUBSCRIPTION):
Subject: "Claude Pro subscription payment"
Content: "Your Claude Pro subscription for $20/month has been successfully charged. Thank you for using Claude!"
→ isSubscription: true, amount: 20.00, currency: "USD", serviceName: "Anthropic Claude", category: "Software & Productivity"

EXAMPLE 8 - PROMOTIONAL EMAIL (NOT SUBSCRIPTION):
Subject: "50% off your next subscription!"
Content: "Don't miss out! Get 50% off your first month. Click here to subscribe now!"
→ isSubscription: false

EXAMPLE 9 - BANK NOTIFICATION (NOT SUBSCRIPTION):
Subject: "Credit card payment"
Content: "A payment was processed on your credit card. Login to view details."
→ isSubscription: false (generic bank notification, no service details)

CATEGORIZATION GUIDE:
- Entertainment & Media: Netflix, Disney+, Hulu, Prime Video, streaming services
- Music & Audio: Spotify, Apple Music, Audible, podcast platforms
- Software & Productivity: Microsoft Office, Adobe, Notion, Slack, Zoom, AI tools
- Design & Creative: Canva, Figma, Creative Cloud, design tools
- Web Services & Hosting: Namecheap, AWS, Webflow, domain/hosting services
- Health & Fitness: PureGym, Peloton, fitness apps, gym memberships
- Gaming: Steam, Xbox, PlayStation, game subscriptions
- Education & Learning: Coursera, Udemy, online courses
- Security & Privacy: VPN services, password managers, antivirus
- Storage & Cloud: Dropbox, Google Drive, backup services
- Communication: WhatsApp Business, Discord, communication tools
- Food & Delivery: Uber Eats, meal kits, delivery services
- Finance & Banking: QuickBooks, payment processors, financial tools
- News & Magazines: NYT, WSJ, magazine subscriptions
- Transportation: Uber, ride-sharing, transit passes
- Business & Professional: Salesforce, CRM tools, business services
- Shopping & Retail: Amazon Prime, membership clubs
- Travel & Tourism: Booking platforms, travel services

ANALYSIS INSTRUCTIONS:
- Read the ENTIRE email content carefully
- Look for specific monetary amounts and payment confirmations
- Identify the service being paid for and assign appropriate category
- For invoices in attachments, use service-specific estimates
- Recognize subscription renewals even without amounts shown
- Include service top-ups and credits as subscriptions
- Distinguish between actual billing and promotional content
- BE MORE AGGRESSIVE in detecting subscriptions - err on the side of inclusion
- When in doubt about a service billing email, mark as subscription with estimated amount
- Always assign the most specific and accurate category based on the service type`;
  }

  // Enhanced email content extraction
  extractEmailContent(emailData) {
    const headers = emailData.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    
    let textBody = '';
    let htmlBody = '';
    
    // Recursive function to extract all text content
    const extractBodyRecursively = (part) => {
      if (part.body && part.body.data) {
        try {
          const content = Buffer.from(part.body.data, 'base64').toString('utf-8');
          if (part.mimeType === 'text/plain') {
            textBody += content + '\n';
          } else if (part.mimeType === 'text/html') {
            htmlBody += content + '\n';
          }
        } catch (error) {
          console.warn('Error decoding email part:', error.message);
        }
      }
      
      if (part.parts && Array.isArray(part.parts)) {
        part.parts.forEach(extractBodyRecursively);
      }
    };
    
    // Extract from main body
    if (emailData.payload.body && emailData.payload.body.data) {
      try {
        const mainContent = Buffer.from(emailData.payload.body.data, 'base64').toString('utf-8');
        if (emailData.payload.mimeType === 'text/plain') {
          textBody = mainContent;
        } else if (emailData.payload.mimeType === 'text/html') {
          htmlBody = mainContent;
        }
      } catch (error) {
        console.warn('Error decoding main email body:', error.message);
      }
    }
    
    // Extract from parts
    if (emailData.payload.parts && Array.isArray(emailData.payload.parts)) {
      emailData.payload.parts.forEach(extractBodyRecursively);
    }
    
    // Convert HTML to plain text if no plain text available
    let cleanTextBody = textBody;
    if (!cleanTextBody && htmlBody) {
      cleanTextBody = htmlBody
        .replace(/<style[^>]*>.*?<\/style>/gis, '')
        .replace(/<script[^>]*>.*?<\/script>/gis, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Combine all content for comprehensive analysis
    const fullContent = `${textBody}\n${cleanTextBody}`.trim();
    
    return {
      subject,
      from,
      date,
      textBody: cleanTextBody || textBody,
      htmlBody,
      fullContent,
      contentLength: fullContent.length
    };
  }

  // Enhanced user prompt with full email content
  getUserPrompt(extracted) {
    return `Analyze this complete email for subscription payment detection:

EMAIL DETAILS:
Subject: ${extracted.subject}
From: ${extracted.from}
Date: ${extracted.date}

FULL EMAIL CONTENT:
${extracted.fullContent}

ANALYSIS REQUIREMENTS:
1. Read the entire email content above
2. Determine if this is a legitimate subscription payment
3. Extract exact payment amount if present
4. Identify the service being paid for
5. Provide detailed reasoning for your decision

Remember: Only mark as subscription if there's evidence of actual payment/billing. Respond with valid JSON only.`;
  }

  // Analyze a single email with enhanced content extraction
  async analyzeEmail(emailData) {
    try {
      const extracted = this.extractEmailContent(emailData);
      
      console.log(`Analyzing email: "${extracted.subject}" from ${extracted.from} (Content: ${extracted.contentLength} chars)`);
      
      // Debug: Log first 200 chars of content to verify extraction
      console.log(`Content preview: ${extracted.fullContent.substring(0, 200)}${extracted.fullContent.length > 200 ? '...' : ''}`);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt()
          },
          {
            role: "user",
            content: this.getUserPrompt(extracted)
          }
        ],
        temperature: 0.1, // Low temperature for consistent results
        max_tokens: 800, // Increased for detailed analysis
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      const analysis = JSON.parse(response);

      console.log(`AI Analysis Result: ${analysis.isSubscription ? 'SUBSCRIPTION' : 'NOT SUBSCRIPTION'} - ${analysis.serviceName || 'Unknown'} (Amount: ${analysis.amount ? `${analysis.currency} ${analysis.amount}` : 'None'}, Confidence: ${analysis.confidence}/10)`);

      return {
        ...analysis,
        originalEmail: {
          subject: extracted.subject,
          from: extracted.from,
          date: extracted.date
        }
      };

    } catch (error) {
      console.error('Error analyzing email with AI:', error);
      return null;
    }
  }

  // Batch analyze multiple emails with better processing
  async batchAnalyzeEmails(emailsData, batchSize = 3) {
    console.log(`Starting enhanced AI batch analysis of ${emailsData.length} emails (batch size: ${batchSize})`);
    
    const results = {
      subscriptions: [],
      cancellations: [],
      nonSubscriptions: [],
      errors: []
    };

    // Process emails in smaller batches to ensure quality analysis
    for (let i = 0; i < emailsData.length; i += batchSize) {
      const batch = emailsData.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(emailsData.length / batchSize)}`);

      // Process batch sequentially for better API usage
      for (const emailData of batch) {
        try {
          const analysis = await this.analyzeEmail(emailData);
          
          if (!analysis) {
            results.errors.push('Analysis failed');
            continue;
          }

          if (analysis.isSubscription) {
            if (analysis.type === 'cancellation') {
              results.cancellations.push(analysis);
            } else {
              results.subscriptions.push(analysis);
            }
          } else {
            results.nonSubscriptions.push(analysis);
          }
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Error in batch analysis:', error);
          results.errors.push('Analysis failed');
        }
      }

      // Longer delay between batches
      if (i + batchSize < emailsData.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`Enhanced AI Analysis Complete:`, {
      subscriptions: results.subscriptions.length,
      cancellations: results.cancellations.length,
      nonSubscriptions: results.nonSubscriptions.length,
      errors: results.errors.length
    });

    return results;
  }

  // Enhanced category mapping for consistent categorization
  getCategoryForService(serviceName) {
    if (!serviceName) return 'Other';
    
    const serviceNameLower = serviceName.toLowerCase().trim();
    
    // Service mapping for automatic categorization
    const serviceMapping = {
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
      'anthropic': 'Software & Productivity',
      'openai': 'Software & Productivity',
      'github': 'Software & Productivity',
      'gitlab': 'Software & Productivity',
      'fal': 'Software & Productivity',
      
      // Design & Creative
      'canva': 'Design & Creative',
      'figma': 'Design & Creative',
      'sketch': 'Design & Creative',
      'invision': 'Design & Creative',
      'framer': 'Design & Creative',
      'creative cloud': 'Design & Creative',
      'photoshop': 'Design & Creative',
      'illustrator': 'Design & Creative',
      'leonardo': 'Design & Creative',
      'runway': 'Design & Creative',
      'midjourney': 'Design & Creative',
      
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
      
      // Storage & Cloud
      'dropbox': 'Storage & Cloud',
      'google drive': 'Storage & Cloud',
      'icloud': 'Storage & Cloud',
      'onedrive': 'Storage & Cloud',
      'box': 'Storage & Cloud',
      'mega': 'Storage & Cloud',
      'backblaze': 'Storage & Cloud',
      
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
      'careem': 'Food & Delivery',
      'hellofresh': 'Food & Delivery',
      'blue apron': 'Food & Delivery',
      
      // Transportation
      'uber': 'Transportation',
      'lyft': 'Transportation',
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
      
      // Shopping & Retail
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
    
    // Direct mapping lookup
    for (const [service, category] of Object.entries(serviceMapping)) {
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
  }

  // Convert AI analysis to subscription format for database
  convertToSubscriptionFormat(analysis) {
    if (!analysis.isSubscription || !analysis.serviceName) {
      return null;
    }
    
    // Allow subscriptions without amounts (will be estimated)
    if (!analysis.amount || analysis.amount <= 0) {
      console.log(`Warning: No amount found for ${analysis.serviceName}, will be filtered out in route`);
      return null;
    }

    // Use enhanced categorization if AI didn't provide category or provided generic category
    let finalCategory = analysis.category;
    if (!finalCategory || finalCategory === 'Other' || finalCategory === 'Software') {
      finalCategory = this.getCategoryForService(analysis.serviceName);
    }

    const subscription = {
      type: analysis.type || 'subscription',
      serviceName: analysis.serviceName,
      amount: analysis.amount,
      currency: analysis.currency || 'USD',
      renewalDay: analysis.renewalDay || (analysis.nextRenewalDate ? new Date(analysis.nextRenewalDate).getDate() : new Date().getDate()),
      nextRenewal: analysis.nextRenewalDate ? new Date(analysis.nextRenewalDate) : this.calculateNextRenewal(analysis.renewalDay),
      category: finalCategory,
      description: analysis.description || `AI-detected: ${analysis.originalEmail.subject.substring(0, 50)}${analysis.originalEmail.subject.length > 50 ? '...' : ''}`,
      confidence: analysis.confidence,
      isMonthlyCharge: analysis.isMonthlyCharge,
      subject: analysis.originalEmail.subject,
      from: analysis.originalEmail.from,
      date: new Date(analysis.originalEmail.date),
      reasons: analysis.reasons,
      hasPaymentHistory: false,
      hasConsistentRenewalDate: !!analysis.nextRenewalDate,
      isRecurring: false,
      paymentCount: 1
    };

    return subscription;
  }

  // Helper method to calculate next renewal
  calculateNextRenewal(renewalDay) {
    const now = new Date();
    let nextRenewal = new Date(now.getFullYear(), now.getMonth(), renewalDay || now.getDate());
    
    if (nextRenewal <= now) {
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    }
    
    return nextRenewal;
  }

  // Check if API key is configured
  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  }
}

module.exports = { AIEmailAnalyzer };