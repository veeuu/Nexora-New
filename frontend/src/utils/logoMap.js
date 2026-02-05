import * as SiIcons from 'react-icons/si';
import { FaCloud, FaDatabase, FaRobot, FaQuestionCircle } from 'react-icons/fa';

// Logo mapping - only for technologies that have actual logo images
export const getLogoPath = (techName) => {
  if (!techName) return null;
  
  const normalized = techName.toLowerCase().trim();
  
  // Only include technologies that have actual logo files
  const logoMap = {
    // Cloud Providers - AWS
    "aws": "AWS.png",
    "amazon aws": "AWS.png",
    "amazon": "AWS.png",
    "dynamodb": "AmazonDynamoDB.png",
    "amazon dynamodb": "AmazonDynamoDB.png",
    "amazon dynamodbAmazon Dynamodb": "AmazonDynamoDB.png",
    "aws dynamodb": "AmazonDynamoDB.png",
    "aws rds": "Amazon Relational Database Service (RDS).png",
    "amazon rds": "Amazon Relational Database Service (RDS).png",
    "amazon relational database service (rds)": "Amazon Relational Database Service (RDS).png",
    "amazon aurora": "AmazonAurora.png",
    "amazon q": "AWS.png",
    "amazon redshift": "AWS.png",
    "rds": "Amazon Relational Database Service (RDS).png",
    "aws | cloud computing": "AWS.png",
    
    // Microsoft Azure & Services
    "azure": "microsoft.png",
    "microsoft azure": "microsoft.png",
    "azure sql": "microsoft.png",
    "azure sql database": "microsoft.png",
    "azure cosmos db": "microsoft.png",
    "azure databricks": "microsoft.png",
    "azure openai": "microsoft.png",
    "sql azure": "microsoft.png",
    "copilot": "microsoft.png",
    "microsoft": "microsoft.png",
    "microsoft dynamics crm": "microsoft.png",
    "microsoft dynamics 365": "microsoft.png",
    "microsoft dynamics 365 crm": "microsoft.png",
    "dynamics crm": "microsoft.png",
    "ms sql": "microsoft.png",
    "sql server": "microsoft.png",
    
    // GCP
    "gcp": "GCP.png",
    "google cloud platform": "GCP.png",
    "google cloud": "GCP.png",
    "google cloud sql": "Google Cloud SQL.png",
    "google cloud spanner": "GoogleCloudSpanner.png",
    "google firestore": "GoogleFirestore.png",
    
    // AI Models (specific branded ones only)
    "openai": "OpenAI.png",
    "chatgpt": "ChatGPT.png",
    "meta ai": "Meta AI.png",
    "perplexity ai": "PerplexityAI.png",
    "reka core": "RekaCore.png",
    "lamini ai": "LaminiAI.png",
    "leena ai": "LeenaAI.png",
    "notion ai": "NotionAI.png",
    "pytorch": "pytorch.png",
    
    // CRM
    "crm": "CRM.png",
    "salesforce": "SalesforceCRM.png",
    "salesforce crm": "SalesforceCRM.png",
    "salesforce.com": "SalesforceCRM.png",
    "salesforce.": "SalesforceCRM.png",
    "salesforce sales cloud": "SalesforceCRM.png",
    "salesforce cpq": "SalesforceCRM.png",
    "salesforce lightning": "SalesforceCRM.png",
    "salesforce crmSalesforce": "SalesforceCRM.png",
    "salesforce partner": "Salesforce Partner.png",
    "pipedrive": "pipedrive.png",
    "boost crm": "Boost CRM.png",
    "sugar crm": "Sugar CRM.webp",
    "sugarcrm": "Sugar CRM.webp",
    "veeva crm": "Veeva CRM.png",
    "veevcrm": "Veeva CRM.png",
    "peoplesoft crm": "PeopleSoft CRM.png",
    "oracle crm": "Oracle EBS CRM.png",
    "oracle ebs crm": "Oracle EBS CRM.png",
    "siebel": "OracleSiebel.png",
    "sap crm": "SAPCRM.png",
    "sap r3 crm": "SAPR3CRM.png",
    "omni-channel crm": "Omni-Channel CRM (Generic).png",
    "on-premise crm": "On-Premise CRM (Generic).png",
    
    // Databases
    "mongodb": "MongoDB.png",
    "mongodbMongodb": "MongoDB.png",
    "mysql": "MySQL.png",
    "mysql database": "MySQL.png",
    "mysq": "MySQL.png",
    "postgresql": "PostgreSQL.png",
    "postgre sql": "PostgreSQL.png",
    "postgres": "PostgreSQL.png",
    "oracle database": "Oracle Database.png",
    "oracle sql": "Oracle Database.png",
    "oracle cloud": "Oracle Database.png",
    "oracle database administration": "Oracle Database.png",
    "ibm db2": "IBM Db2.png",
    "ibm db2": "IBMDb2.png",
    "hive": "Hive.png",
    "firebase": "Firebase.png",
    "amazon documentdb": "AmazonDocumentDB.png",
    
    // Cloud Services
    "ibm cloud": "IBM Cloud.png",
    "lumen cloud": "Lumen Cloud.jpg",
    "rackspace cloud": "Rackspace Cloud.jpg",
    "sciex cloud": "Sciex Cloud.png",
    "alibaba cloud": "Alibaba Cloud.png",
    
    // Generic/Fallback
    "on prem": "Database(GenericSymbol).png",
    "on-prem": "Database(GenericSymbol).png",
    "not detected": "Database(GenericSymbol).png",
    "not detectedNot detected": "Database(GenericSymbol).png",
    "database": "Database(GenericSymbol).png",
  };
  
  // Try exact match first
  if (logoMap[normalized]) {
    return `/src/logos/${logoMap[normalized]}`;
  }
  
  // Try partial matches - check if any key is contained in the normalized text
  // Sort by key length (longest first) to match more specific terms first
  const sortedKeys = Object.keys(logoMap).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    if (normalized.includes(key) && key.length > 2) {
      return `/src/logos/${logoMap[key]}`;
    }
  }
  
  // Return null if no logo found - will use icon instead
  return null;
};

// Get colored React icon for technologies without logos
export const getTechIcon = (techName) => {
  if (!techName) return null;
  
  const normalized = techName.toLowerCase().trim();
  
  // FA icons mapping
  const faIcons = {
    "ai": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "ai/ml": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "aiml": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "artificial intelligence": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "artificial intelligence (ai)": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "machine learning": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "machine learningmachnine learning": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "deep learning": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "nlp": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "natural language processing": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "computer vision": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "gen ai": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "genai": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "generative ai": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "llm": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "pytorch": { component: FaRobot, color: "#8B5CF6", strokeWidth: 1.5 },
    "cloud": { component: FaCloud, color: "#4A90E2" },
    "cloud | aws": { component: FaCloud, color: "#4A90E2" },
    "cloud computing": { component: FaCloud, color: "#4A90E2" },
    "hive": { component: FaDatabase, color: "#F5A623" },
    "on prem": { component: FaDatabase, color: "#7ED321" },
    "on-prem": { component: FaDatabase, color: "#7ED321" },
    "not detected": { component: FaQuestionCircle, color: "#999999" },
    "not detectedNot detected": { component: FaQuestionCircle, color: "#999999" },
  };
  
  // SI icons mapping with colors
  const siIcons = {
    "azure": { name: "SiMicrosoftazure", color: "#0078D4" },
    "microsoft azure": { name: "SiMicrosoftazure", color: "#0078D4" },
    "azure sql": { name: "SiMicrosoftazure", color: "#0078D4" },
    "azure sql database": { name: "SiMicrosoftazure", color: "#0078D4" },
    "azure cosmos db": { name: "SiMicrosoftazure", color: "#0078D4" },
    "azure databricks": { name: "SiMicrosoftazure", color: "#0078D4" },
    "azure openai": { name: "SiMicrosoftazure", color: "#0078D4" },
    "sql azure": { name: "SiMicrosoftazure", color: "#0078D4" },
    "gemini": { name: "SiGoogle", color: "#4285F4" },
    "claude": { name: "SiAnthropic", color: "#000000" },
    "copilot": { name: "SiMicrosoft", color: "#00A4EF" },
    "mlflow": { name: "SiApache", color: "#13C127" },
    "hubspot": { name: "SiHubspot", color: "#FF7A59" },
    "hubspot crm": { name: "SiHubspot", color: "#FF7A59" },
    "hubsot crm": { name: "SiHubspot", color: "#FF7A59" },
    "zoho": { name: "SiZoho", color: "#1F73E7" },
    "zoho crm": { name: "SiZoho", color: "#1F73E7" },
    "pipedrive": { name: "SiPipedrive", color: "#1FD15F" },
    "dynamics crm": { name: "SiMicrosoftazure", color: "#0078D4" },
    "microsoft dynamics crm": { name: "SiMicrosoftazure", color: "#0078D4" },
    "microsoft dynamics 365": { name: "SiMicrosoftazure", color: "#0078D4" },
    "microsoft dynamics 365 crm": { name: "SiMicrosoftazure", color: "#0078D4" },
    "redis": { name: "SiRedis", color: "#DC382D" },
    "snowflake": { name: "SiSnowflake", color: "#29B5E8" },
    "snowflake cloud": { name: "SiSnowflake", color: "#29B5E8" },
    "snowflakecloud": { name: "SiSnowflake", color: "#29B5E8" },
    "ms sql": { name: "SiMicrosoftazure", color: "#0078D4" },
    "sql server": { name: "SiMicrosoftazure", color: "#0078D4" },
    "digitalocean": { name: "SiDigitalocean", color: "#0080FF" },
    "vmware": { name: "SiVmware", color: "#231F20" },
    "vmware | aws | google cloud platform": { name: "SiVmware", color: "#231F20" },
    "alibaba cloud": { name: "SiAlibaba", color: "#FF6A00" },
    "adobe": { name: "SiAdobe", color: "#FF0000" },
    "adobe experience cloud": { name: "SiAdobe", color: "#FF0000" },
    "tableau": { name: "SiTableau", color: "#E97627" },
    "tableau crm": { name: "SiTableau", color: "#E97627" },
    "sap analytics cloud": { name: "SiSap", color: "#0CCEF7" },
    "sap": { name: "SiSap", color: "#0CCEF7" },
    "sap crmsciex cloud": { name: "SiSap", color: "#0CCEF7" },
    "docker": { name: "SiDocker", color: "#2496ED" },
    "kubernetes": { name: "SiKubernetes", color: "#326CE5" },
    "jenkins": { name: "SiJenkins", color: "#D33C27" },
    "git": { name: "SiGit", color: "#F1502F" },
    "github": { name: "SiGithub", color: "#181717" },
    "gitlab": { name: "SiGitlab", color: "#FCA121" },
    "python": { name: "SiPython", color: "#3776AB" },
    "java": { name: "SiJava", color: "#007396" },
    "javascript": { name: "SiJavascript", color: "#F7DF1E" },
    "react": { name: "SiReact", color: "#61DAFB" },
    "nodejs": { name: "SiNodedotjs", color: "#339933" },
    "node.js": { name: "SiNodedotjs", color: "#339933" },
    "elasticsearch": { name: "SiElasticsearch", color: "#005571" },
    "kafka": { name: "SiApachekafka", color: "#231F20" },
    "spark": { name: "SiApachespark", color: "#E25A1C" },
    "hadoop": { name: "SiApachehadoop", color: "#66CCFF" },
    "tensorflow": { name: "SiTensorflow", color: "#FF6F00" },
    "linux": { name: "SiLinux", color: "#FCC624" },
    "windows": { name: "SiWindows", color: "#0078D4" },
    "macos": { name: "SiApple", color: "#000000" },
    "ios": { name: "SiApple", color: "#000000" },
    "android": { name: "SiAndroid", color: "#3DDC84" },
    "nginx": { name: "SiNginx", color: "#009639" },
    "apache": { name: "SiApache", color: "#D70015" },
    "tomcat": { name: "SiApachetomcat", color: "#F8DC75" },
    // Additional CRM and services
    "mailchimp": { name: "SiMailchimp", color: "#FFE01B" },
    "intuit mailchimp": { name: "SiMailchimp", color: "#FFE01B" },
    "boost crm": { name: "SiMicrosoft", color: "#00A4EF" },
    "sugar crm": { name: "SiSalesforce", color: "#00A1E0" },
    "sugarcrm": { name: "SiSalesforce", color: "#00A1E0" },
    "veeva crm": { name: "SiSalesforce", color: "#00A1E0" },
    "peoplesoft crm": { name: "SiOracle", color: "#F80000" },
    "rackspace cloud": { name: "SiRackspace", color: "#C40022" },
    "lumen cloud": { name: "SiCenturylink", color: "#0066CC" },
    "sciex cloud": { name: "SiSap", color: "#0CCEF7" },
  };
  
  // Check FA icons first
  if (faIcons[normalized]) {
    const { component: IconComponent, color } = faIcons[normalized];
    return { component: IconComponent, color };
  }
  
  // Check SI icons
  const siIconData = siIcons[normalized];
  if (siIconData) {
    const IconComponent = SiIcons[siIconData.name];
    if (IconComponent) {
      return { component: IconComponent, color: siIconData.color };
    }
  }
  
  // Check for partial matches in SI icons
  for (const [key, iconData] of Object.entries(siIcons)) {
    if (normalized.includes(key) && key.length > 2) {
      const IconComponent = SiIcons[iconData.name];
      if (IconComponent) {
        return { component: IconComponent, color: iconData.color };
      }
    }
  }
  
  return null;
};
