export const chatbotKnowledge = [
  {
    page: 'Intent',
    path: '/martech/intent',
    keywords: ['intent', 'status', 'buying signals', 'high-medium', 'high', 'medium', 'low'],
    description: 'View company intent status and buying signals. Shows account names with their intent levels (High, Medium, High-Medium).',
    dataFields: ['Account Name', 'Intent Status']
  },
  {
    page: 'Technographics',
    path: '/martech/technographics',
    keywords: ['technographics', 'technology', 'tech stack', 'software', 'tools'],
    description: 'View technology stack and tools used by companies.',
    dataFields: ['Account Name', 'Technologies']
  },
  {
    page: 'NTP',
    path: '/martech/ntp',
    keywords: ['ntp', 'next to purchase', 'purchase intent', 'buying cycle'],
    description: 'View Next-to-Purchase data showing companies likely to make purchases soon.',
    dataFields: ['Account Name', 'NTP Status']
  },
  {
    page: 'Buying Group',
    path: '/martech/buying-group',
    keywords: ['buying group', 'decision makers', 'stakeholders', 'team'],
    description: 'View buying groups and decision makers within companies.',
    dataFields: ['Account Name', 'Buying Group']
  },
  {
    page: 'Renewal Intelligence',
    path: '/martech/renewal-intelligence',
    keywords: ['renewal', 'contract renewal', 'renewal date', 'expiration'],
    description: 'Track contract renewals and expiration dates for accounts.',
    dataFields: ['Account Name', 'Renewal Date']
  },
  {
    page: 'Summary',
    path: '/martech/summary',
    keywords: ['summary', 'overview', 'dashboard', 'martech'],
    description: 'View summary and overview of all martech data.',
    dataFields: ['Account Name', 'Summary']
  },
  {
    page: 'Financial',
    path: '/market/financial',
    keywords: ['financial', 'revenue', 'earnings', 'financial data', 'stock'],
    description: 'View financial information and metrics for companies.',
    dataFields: ['Account Name', 'Financial Data']
  },
  {
    page: 'Stock Performance',
    path: '/market/stock-performance',
    keywords: ['stock', 'performance', 'price', 'market', 'trading'],
    description: 'View stock performance and market data.',
    dataFields: ['Account Name', 'Stock Price']
  },
  {
    page: 'Buyer Group',
    path: '/market/buyer-group',
    keywords: ['buyer group', 'market', 'buyers', 'purchasing'],
    description: 'View buyer group information in the market.',
    dataFields: ['Account Name', 'Buyer Group']
  }
];
