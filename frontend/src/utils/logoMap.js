import * as SiIcons from 'react-icons/si';
import { FaCloud, FaDatabase, FaRobot, FaQuestionCircle } from 'react-icons/fa';

// Logo mapping - maps technology names to logo filenames
export const getLogoPath = (techName) => {
  if (!techName) return null;
  
  const normalized = techName.toLowerCase().trim();
  
  const logoMap = {
    // AWS Services
    "aws": "AWS.png",
    "amazon aws": "AWS.png",
    "amazon": "AWS.png",
    "amazon web services": "AWS.png",
    "aws lambda": "AWS Lambda.png",
    "aws sagemaker": "AWS SageMaker.webp",
    "aws rds": "AWS RDS.png",
    "aws ebs": "AWS EBS.png",
    "aws efs": "AWS EFS.png",
    "amazon dynamodb": "Amazon DynamoDB.png",
    "dynamodb": "Amazon DynamoDB.png",
    "amazon rds": "Amazon RDS.png",
    "rds": "Amazon RDS.png",
    "amazon aurora": "Amazon Aurora.png",
    "aurora": "Amazon Aurora.png",
    "amazon s3": "Amazon S3.png",
    "s3": "Amazon S3.png",
    "amazon ec2": "Amazon EC2.png",
    "ec2": "Amazon EC2.png",
    "amazon ecs": "Amazon ECS.png",
    "ecs": "Amazon ECS.png",
    "amazon eks": "Amazon EKS.png",
    "eks": "Amazon EKS.png",
    "amazon efs": "Amazon Elastic File System.png",
    "amazon elasticache": "Amazon ElastiCache.png",
    "elasticache": "Amazon ElastiCache.png",
    "amazon cloudfront": "Amazon CloudFront.png",
    "cloudfront": "Amazon CloudFront.png",
    "amazon bedrock": "Amazon Bedrock.webp",
    "bedrock": "Amazon Bedrock.webp",
    "amazon q": "Amazon Q.png",
    "amazon redshift": "Amazon Redshift.png",
    "redshift": "Amazon Redshift.png",
    "amazon documentdb": "Amazon DocumentDB.jpg",
    "documentdb": "Amazon DocumentDB.jpg",
    "amazon opensearch": "Amazon OpenSearch.webp",
    "opensearch": "Amazon OpenSearch.webp",
    "amazon vpc": "Amazon VPC.png",
    "vpc": "Amazon VPC.png",
    
    // Azure Services
    "azure": "Azure.png",
    "microsoft azure": "Microsoft Azure.png",
    "azure sql": "Azure SQL.png",
    "azure sql database": "Azure SQL.png",
    "azure cosmos db": "Azure Cosmos DB.png",
    "cosmos db": "Azure Cosmos DB.png",
    "azure openai": "Azure OpenAI.png",
    "azure functions": "Azure Functions.png",
    "azure app service": "Azure App Service.png",
    "azure devops": "Azure DevOps.png",
    "azure machine learning": "Azure Machine Learning.webp",
    "azure vm": "Azure VM.png",
    "azure data lake storage": "Azure Data Lake Storage.png",
    "azure synapse analytics": "Azure Synapse Analytics.png",
    "azure cognitive services": "Azure Cognitive Services.png",
    "azure kubernetes service": "Microsoft Azure Kubernetes Service.png",
    "aks": "Microsoft Azure Kubernetes Service.png",
    
    // GCP Services
    "gcp": "GCP.png",
    "google cloud platform": "GCP.png",
    "google cloud": "Google Cloud.png",
    "google cloud sql": "Google Cloud SQL.png",
    "cloud sql": "GCP SQL.png",
    "google cloud spanner": "Google Cloud Spanner.png",
    "google firestore": "Firestore.png",
    "firestore": "Firestore.png",
    "google kubernetes engine": "Google Cloud.png",
    "gke": "Google Cloud.png",
    "google cloud storage": "Google Cloud Storage.png",
    "google bigquery": "Google BigQuery.png",
    "bigquery": "Google BigQuery.png",
    "google bigtable": "Google Bigtable.png",
    "google cloud run": "Google Cloud Run.png",
    "google gemini": "Google Gemini.png",
    "gemini": "Google Gemini.png",
    "google ai": "Google AI.png",
    "google": "Google.png",
    
    // Databases
    "mongodb": "MongoDB.png",
    "mongo db": "MongoDB.png",
    "mysql": "MySQL.png",
    "postgresql": "PostgreSQL.png",
    "postgres": "PostgreSQL.png",
    "postgis": "PostGIS.png",
    "mariadb": "MariaDB.png",
    "oracle database": "Oracle Database.png",
    "oracle": "Oracle.png",
    "oracle autonomous database": "Oracle Autonomous Database.png",
    "oracle cloud": "Oracle Cloud.png",
    "oracle cx": "Oracle CX.png",
    "oracle crm": "Oracle CRM.png",
    "ibm db2": "IBM Db2.png",
    "db2": "IBM Db2.png",
    "snowflake": "Snowflake.png",
    "redis": "Redis.png",
    "elasticsearch": "Elastic Search.png",
    "kafka": "Apache Kafka.png",
    "cassandra": "Apache Cassandra.png",
    "couchbase": "Couchbase.png",
    "neo4j": "Neo4j.png",
    "clickhouse": "ClickHouse.png",
    "teradata": "Teradata.png",
    "teradata vantage": "Teradata Vantage.png",
    "timescaledb": "TimescaleDB.png",
    "marklogic": "MarkLogic.png",
    "firebase": "Firebase.png",
    
    // AI/ML Models & Platforms
    "openai": "OpenAI.png",
    "chatgpt": "ChatGPT.png",
    "gpt-4": "ChatGPT.png",
    "gpt-5": "ChatGPT.png",
    "claude": "Claude.png",
    "anthropic": "Anthropic.png",
    "cohere": "Cohere.png",
    "mistral": "Mistral AI.png",
    "mistral ai": "Mistral AI.png",
    "deepseek": "DeepSeek.png",
    "grok": "Grok.png",
    "meta ai": "Meta AI.png",
    "meta llama": "Meta Llama 3.png",
    "llama": "Meta Llama 3.png",
    "perplexity ai": "Perplexity AI.png",
    "hugging face": "Hugging Face.png",
    "h2o ai": "H2O.ai.png",
    "replicate": "Replicate.png",
    "pytorch": "PyTorch.png",
    "pytorch lightning": "PyTorch Lightning.png",
    "tensorflow": "TensorFlow.png",
    "keras": "Keras.png",
    "jax": "JAX.avif",
    "scikit-learn": "Scikit-learn.png",
    "xgboost": "XGBoost.png",
    "onnx": "ONNX.png",
    "mlflow": "ML flow.png",
    "prefect": "Prefect.svg",
    "airflow": "Apache Airflow.png",
    "kubeflow": "Kubeflow.png",
    "datarobot": "DataRobot.webp",
    "watsonx": "watsonx.jpg",
    "ibm watson": "IBM Watson Machine Learning.png",
    "langchain": "LangChain.png",
    "llamaindex": "LlamaIndex.svg",
    "chroma": "Chroma.png",
    "milvus": "Milvus.png",
    "pinecone": "Pinecone.webp",
    "weaviate": "Weaviate.webp",
    "qdrant": "Qdrant.png",
    "vectara": "Vectara.png",
    "jasper ai": "Jasper AI.png",
    "midjourney": "Mid Journey.png",
    "stable diffusion": "Stable Diffusion.png",
    "alphafold": "AlphaFold.png",
    "notion ai": "Notion AI.png",
    "copilot": "Copilot.png",
    "microsoft copilot": "Microsoft Copilot.png",
    "github copilot": "Copilot.png",
    
    // CRM Systems
    "salesforce": "Salesforce.png",
    "salesforce crm": "Salesforce.png",
    "salesforce einstein": "Salesforce Einstein.png",
    "salesforce lightning": "Salesforce Lightning.png",
    "hubspot": "HubSpot.png",
    "hubspot crm": "HubSpot.png",
    "zoho": "Zoho.png",
    "zoho crm": "Zoho CRM.png",
    "zoho desk": "Zoho Desk.png",
    "zoho one": "Zoho One.png",
    "pipedrive": "Pipedrive.png",
    "netsuite crm": "NetSuite CRM.png",
    "servicenow": "ServiceNow.png",
    "servicenow ai": "ServiceNow AI.png",
    "dynamics 365": "Microsoft Dynamics 365.webp",
    "microsoft dynamics 365": "Microsoft Dynamics 365.webp",
    "dynamics crm": "Microsoft Dynamics 365.webp",
    "microsoft dynamics crm": "Microsoft Dynamics 365.webp",
    "sap crm": "SAP CRM.webp",
    "sap sales cloud": "SAP Sales Cloud.webp",
    "sap customer experience": "SAP Customer Experience.webp",
    "veeva crm": "Veeva CRM.png",
    "peoplesoft crm": "PeopleSoft CRM.png",
    "sage crm": "Sage CRM.png",
    "sprinklr": "Sprinklr.png",
    "copper": "Copper.png",
    "creatio": "Creatio.png",
    "crmnext": "CRMNext.png",
    "leadsquared": "LeadSquared.png",
    "nimble crm": "Nimble CRM.png",
    "suitcrm": "SuiteCRM.png",
    "workday": "Workday.jpg",
    
    // Cloud Platforms
    "ibm cloud": "IBM Cloud.png",
    "ibm": "IBM.png",
    "digitalocean": "DigitalOcean.png",
    "linode": "Linode.png",
    "vultr": "Vultr.svg",
    "heroku": "Heroku.png",
    "coreweave": "CoreWeave.png",
    "vmware": "VMware.png",
    "vmware vsphere": "VMware vSphere.jpg",
    "vmware vcloud": "VMware vCloud.jpg",
    "nutanix": "Nutanix.png",
    "openstack": "OpenStack.svg",
    "openshift": "openshift.png",
    "red hat openshift": "openshift.png",
    "alibaba cloud": "Alibaba Cloud.png",
    "rackspace cloud": "Rackspace Cloud.jpg",
    "akamai": "Akamai.png",
    "cloudflare": "Cloudflare.png",
    "cloudflare workers": "Cloudflare Workers.png",
    "cloudflare cdn": "Cloudflare CDN.png",
    
    // Infrastructure & DevOps
    "docker": "Docker.png",
    "kubernetes": "Kubernetes.png",
    "jenkins": "Jenkins.png",
    "git": "Git.png",
    "github": "GitHub.png",
    "gitlab": "GitLab.png",
    "terraform": "Terraform.png",
    "nginx": "Nginx.png",
    "apache": "Apache.svg",
    "linux": "Linux.png",
    "windows": "Windows.png",
    "sql server": "SQL Server.png",
    "mssql": "SQL Server.png",
    "ms sql": "SQL Server.png",
    "t-sql": "SQL Server.png",
    
    // Analytics & BI
    "tableau": "Tableau.png",
    "sap analytics": "SAP AI.webp",
    "splunk": "Splunk AI.webp",
    "databricks": "Databricks.png",
    "apache spark": "Apache Spark.png",
    "spark": "Apache Spark.png",
    "apache hadoop": "Apache Hadoop.png",
    "hadoop": "Apache Hadoop.png",
    "apache hive": "Apache Hive.webp",
    "hive": "Apache Hive.webp",
    "apache mxnet": "Apache MXNet.png",
    "mxnet": "Apache MXNet.png",
    
    // AI/ML Concepts
    "ai": "AI.png",
    "artificial intelligence": "AI.png",
    "machine learning": "Machine Learning.png",
    "deep learning": "Machine Learning.png",
    "nlp": "NLP.png",
    "natural language processing": "NLP.png",
    "computer vision": "Machine Learning.png",
    "gen ai": "Generative AI.png",
    "genai": "Generative AI.png",
    "generative ai": "Generative AI.png",
    "llm": "LLM.png",
    "large language model": "Large Language Models.png",
    "foundation models": "Large Language Models.png",
    "rag": "RAG.png",
    "transfer learning": "Transfer Learning.png",
    "transformers": "Transformers.png",
    "inference engine": "Inference Engine.png",
    "model serving": "Model Serving.png",
    "model inference": "Model Inference.png",
    "feature store": "Feature Store.png",
    "explainable ai": "Explainable AI.png",
    "aiml": "AIML.png",
    
    // Generic/Fallback
    "database": "Database.png",
    "cloud": "Cloud.webp",
    "cloud computing": "Cloud.webp",
    "crm": "CRM.png",
    "on prem": "Database.png",
    "on-prem": "Database.png",
    "not detected": null,
  };
  
  // Try exact match first
  if (logoMap[normalized]) {
    return `/src/logos/${logoMap[normalized]}`;
  }
  
  // Try partial matches - check if any key is contained in the normalized text
  const sortedKeys = Object.keys(logoMap).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    if (normalized.includes(key) && key.length > 3) {
      return `/src/logos/${logoMap[key]}`;
    }
  }
  
  return null;
};

// Get colored React icon for technologies without logos
export const getTechIcon = (techName) => {
  if (!techName) return null;
  
  const normalized = techName.toLowerCase().trim();
  
  const faIcons = {
    "ai": { component: FaRobot, color: "#8B5CF6" },
    "ai/ml": { component: FaRobot, color: "#8B5CF6" },
    "aiml": { component: FaRobot, color: "#8B5CF6" },
    "artificial intelligence": { component: FaRobot, color: "#8B5CF6" },
    "machine learning": { component: FaRobot, color: "#8B5CF6" },
    "deep learning": { component: FaRobot, color: "#8B5CF6" },
    "nlp": { component: FaRobot, color: "#8B5CF6" },
    "natural language processing": { component: FaRobot, color: "#8B5CF6" },
    "computer vision": { component: FaRobot, color: "#8B5CF6" },
    "gen ai": { component: FaRobot, color: "#8B5CF6" },
    "genai": { component: FaRobot, color: "#8B5CF6" },
    "generative ai": { component: FaRobot, color: "#8B5CF6" },
    "llm": { component: FaRobot, color: "#8B5CF6" },
    "pytorch": { component: FaRobot, color: "#8B5CF6" },
    "cloud": { component: FaCloud, color: "#4A90E2" },
    "cloud computing": { component: FaCloud, color: "#4A90E2" },
    "on prem": { component: FaDatabase, color: "#7ED321" },
    "on-prem": { component: FaDatabase, color: "#7ED321" },
    "not detected": { component: FaQuestionCircle, color: "#999999" },
  };
  
  const siIcons = {
    "azure": { name: "SiMicrosoftazure", color: "#0078D4" },
    "microsoft azure": { name: "SiMicrosoftazure", color: "#0078D4" },
    "azure sql": { name: "SiMicrosoftazure", color: "#0078D4" },
    "gemini": { name: "SiGoogle", color: "#4285F4" },
    "claude": { name: "SiAnthropic", color: "#000000" },
    "copilot": { name: "SiMicrosoft", color: "#00A4EF" },
    "mlflow": { name: "SiApache", color: "#13C127" },
    "hubspot": { name: "SiHubspot", color: "#FF7A59" },
    "zoho": { name: "SiZoho", color: "#1F73E7" },
    "pipedrive": { name: "SiPipedrive", color: "#1FD15F" },
    "dynamics crm": { name: "SiMicrosoftazure", color: "#0078D4" },
    "redis": { name: "SiRedis", color: "#DC382D" },
    "snowflake": { name: "SiSnowflake", color: "#29B5E8" },
    "ms sql": { name: "SiMicrosoftazure", color: "#0078D4" },
    "sql server": { name: "SiMicrosoftazure", color: "#0078D4" },
    "digitalocean": { name: "SiDigitalocean", color: "#0080FF" },
    "vmware": { name: "SiVmware", color: "#231F20" },
    "alibaba cloud": { name: "SiAlibaba", color: "#FF6A00" },
    "adobe": { name: "SiAdobe", color: "#FF0000" },
    "tableau": { name: "SiTableau", color: "#E97627" },
    "sap": { name: "SiSap", color: "#0CCEF7" },
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
    "mailchimp": { name: "SiMailchimp", color: "#FFE01B" },
  };
  
  if (faIcons[normalized]) {
    const { component: IconComponent, color } = faIcons[normalized];
    return { component: IconComponent, color };
  }
  
  for (const [key, iconData] of Object.entries(faIcons)) {
    if ((normalized.includes(key) || key.includes(normalized)) && key.length > 2) {
      return { component: iconData.component, color: iconData.color };
    }
  }
  
  if (normalized.includes("artificial") || normalized.includes("machine")) {
    return { component: FaRobot, color: "#8B5CF6" };
  }
  
  const siIconData = siIcons[normalized];
  if (siIconData) {
    const IconComponent = SiIcons[siIconData.name];
    if (IconComponent) {
      return { component: IconComponent, color: siIconData.color };
    }
  }
  
  for (const [key, iconData] of Object.entries(siIcons)) {
    if ((normalized.includes(key) || key.includes(normalized)) && key.length > 2) {
      const IconComponent = SiIcons[iconData.name];
      if (IconComponent) {
        return { component: IconComponent, color: iconData.color };
      }
    }
  }
  
  return null;
};
