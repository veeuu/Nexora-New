import { FaCloud, FaDatabase, FaRobot, FaQuestionCircle } from "react-icons/fa";

// Comprehensive tech icon mapping for all variations
export const getTechIconMap = () => {
  return {
    // FA icons (already imported)
    faIcons: {
      "ai": "FaRobot",
      "ai/ml": "FaRobot",
      "aiml": "FaRobot",
      "artificial intelligence": "FaRobot",
      "artificial intelligence (ai)": "FaRobot",
      "machine learning": "FaRobot",
      "machine learningmachnine learning": "FaRobot",
      "deep learning": "FaRobot",
      "nlp": "FaRobot",
      "natural language processing": "FaRobot",
      "computer vision": "FaRobot",
      "gen ai": "FaRobot",
      "genai": "FaRobot",
      "generative ai": "FaRobot",
      "llm": "FaRobot",
      "pytorch": "FaRobot",
      "cloud": "FaCloud",
      "cloud | aws": "FaCloud",
      "cloud computing": "FaCloud",
      "boost crm": "FaCloud",
      "avature crm": "FaCloud",
      "veeva crm": "FaCloud",
      "sugarcrm": "FaCloud",
      "rackspace cloud": "FaCloud",
      "lumen cloud": "FaCloud",
      "intuit mailchimp": "FaCloud",
      "ibm cloud": "FaCloud",
      "hive": "FaDatabase",
      "on prem": "FaDatabase",
      "on-prem": "FaDatabase",
      "not detected": "FaQuestionCircle",
      "not detectedNot detected": "FaQuestionCircle",
    },
    
    // SI icons mapping
    siIcons: {
      // AWS variations
      "aws": "SiAmazonaws",
      "amazon aws": "SiAmazonaws",
      "aws rds": "SiAmazonaws",
      "amazon rds": "SiAmazonaws",
      "amazon relational database service (rds)": "SiAmazonaws",
      "amazon aurora": "SiAmazonaws",
      "amazon dynamodb": "SiAmazonaws",
      "amazon dynamodbAmazon Dynamodb": "SiAmazonaws",
      "amazon q": "SiAmazonaws",
      "amazon redshift": "SiAmazonaws",
      "rds": "SiAmazonaws",
      "aws | cloud computing": "SiAmazonaws",
      
      // Azure variations
      "azure": "SiMicrosoftazure",
      "microsoft azure": "SiMicrosoftazure",
      "azure sql": "SiMicrosoftazure",
      "azure sql database": "SiMicrosoftazure",
      "azure cosmos db": "SiMicrosoftazure",
      "azure databricks": "SiMicrosoftazure",
      "azure openai": "SiMicrosoftazure",
      "sql azure": "SiMicrosoftazure",
      
      // GCP variations
      "gcp": "SiGooglecloud",
      "google cloud platform": "SiGooglecloud",
      "google cloud": "SiGooglecloud",
      
      // AI/ML variations
      "openai": "SiOpenai",
      "chatgpt": "SiOpenai",
      "gemini": "SiGoogle",
      "claude": "SiAnthropic",
      "copilot": "SiMicrosoft",
      "mlflow": "SiApache",
      
      // CRM variations
      "salesforce": "SiSalesforce",
      "salesforce crm": "SiSalesforce",
      "salesforce.com": "SiSalesforce",
      "salesforce.": "SiSalesforce",
      "salesforce sales cloud": "SiSalesforce",
      "salesforce cpq": "SiSalesforce",
      "salesforce lightning": "SiSalesforce",
      "salesforce crmSalesforce": "SiSalesforce",
      "hubspot": "SiHubspot",
      "hubspot crm": "SiHubspot",
      "hubsot crm": "SiHubspot",
      "hubspot crm": "SiHubspot",
      "zoho": "SiZoho",
      "zoho crm": "SiZoho",
      "pipedrive": "SiPipedrive",
      "dynamics crm": "SiMicrosoftazure",
      "microsoft dynamics crm": "SiMicrosoftazure",
      "microsoft dynamics 365": "SiMicrosoftazure",
      "microsoft dynamics 365 crm": "SiMicrosoftazure",
      "oracle crm": "SiOracle",
      "siebel": "SiOracle",
      "sap crm": "SiSap",
      "peoplesoft crm": "SiOracle",
      
      // Database variations
      "mongodb": "SiMongodb",
      "mongodbMongodb": "SiMongodb",
      "mysql": "SiMysql",
      "mysql database": "SiMysql",
      "mysq": "SiMysql",
      "postgresql": "SiPostgresql",
      "postgre sql": "SiPostgresql",
      "postgres": "SiPostgresql",
      "redis": "SiRedis",
      "snowflake": "SiSnowflake",
      "snowflake cloud": "SiSnowflake",
      "snowflakecloud": "SiSnowflake",
      "oracle database": "SiOracle",
      "oracle sql": "SiOracle",
      "oracle cloud": "SiOracle",
      "oracle database administration": "SiOracle",
      "ms sql": "SiMicrosoftazure",
      "mysql": "SiMicrosoftazure",
      "sql server": "SiMicrosoftazure",
      "sql azure": "SiMicrosoftazure",
      "ibm db2": "SiIbm",
      
      // Cloud Providers
      "digitalocean": "SiDigitalocean",
      "vmware": "SiVmware",
      "vmware | aws | google cloud platform": "SiVmware",
      "firebase": "SiFirebase",
      "alibaba cloud": "SiAlibaba",
      
      // Other
      "adobe": "SiAdobe",
      "adobe experience cloud": "SiAdobe",
      "tableau": "SiTableau",
      "tableau crm": "SiTableau",
      "sap analytics cloud": "SiSap",
      "sap": "SiSap",
      "sap crmsciex cloud": "SiSap",
    }
  };
};

// Simple mapping - returns icon component directly
export const getTechIcon = async (techName) => {
  if (!techName) return FaQuestionCircle;
  
  const normalized = techName.toLowerCase().trim();
  const maps = getTechIconMap();
  
  // Check FA icons first
  if (maps.faIcons[normalized]) {
    return maps.faIcons[normalized];
  }
  
  // SI icons - dynamically import
  try {
    const siModule = await import("react-icons/si");
    
    const iconName = maps.siIcons[normalized];
    if (iconName && siModule[iconName]) {
      return siModule[iconName];
    }
    
    // Check for partial matches
    for (const [key, name] of Object.entries(maps.siIcons)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        if (siModule[name]) {
          return siModule[name];
        }
      }
    }
  } catch (e) {
    console.warn("Failed to load SI icons:", e);
  }
  
  return FaQuestionCircle;
};
