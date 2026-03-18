import * as SiIcons from 'react-icons/si';
import { FaCloud, FaDatabase, FaQuestionCircle } from 'react-icons/fa';

// Dynamic logo import
const logoModules = import.meta.glob('../logos/*.{png,jpg,jpeg,webp,svg,avif}', { eager: true });

// Create a map of logo filenames to their paths
const logoPathMap = {};
Object.keys(logoModules).forEach(path => {
  const filename = path.split('/').pop();
  logoPathMap[filename.toLowerCase()] = logoModules[path].default;
});

// Debug logging
console.log('🎨 Logo modules loaded:', Object.keys(logoModules).length, 'files');
console.log('📦 Logo path map keys:', Object.keys(logoPathMap).slice(0, 10), '... and', Object.keys(logoPathMap).length - 10, 'more');

// Logo mapping - maps technology names to logo filenames
export const getLogoPath = (techName) => {
  if (!techName) return null;
  
  const normalized = techName.toLowerCase().trim();
  
  // AI/ML Concepts - prioritize these logos over robot icon
  const aimlConceptLogos = {
    "ai": "AI.png",
    "ai/ml": "AIML.png",
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
    "model training": "Model Training.png",
  };
  
  // Check AI/ML concepts first
  if (aimlConceptLogos[normalized]) {
    const logoFile = aimlConceptLogos[normalized].toLowerCase();
    if (logoPathMap[logoFile]) {
      console.log(`✅ Found AI/ML logo for "${techName}":`, logoFile);
      return logoPathMap[logoFile];
    } else {
      console.warn(`⚠️ AI/ML logo file not found in map: "${logoFile}"`);
    }
  }
  
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
    "aws aurora postgresql": "Amazon Aurora.png",
    "aws aurora": "Amazon Aurora.png",
    "aws aurora oracle": "Amazon Aurora.png",
    
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
    "microsoft fabric": "Microsoft Fabric.png",
    
    // GCP Services
    "gcp": "GCP.png",
    "google cloud platform": "GCP.png",
    "google cloud": "Google Cloud.png",
    "google cloud sql": "Google Cloud SQL.png",
    "cloud sql": "GCP SQL.png",
    "gcp sql": "GCP SQL.png",
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
    "firebase": "Firebase.png",
    
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
    "bson": "BSON.png",
    "key-value database": "Redis.png",
    "in-memory database": "Redis.png",
    "managed database services": "Database.webp",
    
    // AI/ML Models & Platforms
    "openai": "OpenAI.png",
    "chatgpt": "ChatGPT.png",
    "gpt-4": "ChatGPT.png",
    "gpt-5": "ChatGPT.png",
    "whisper": "Whisper.png",
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
    "H2O.ai": "h2o.png",
    "h2o": "h2o.png",
    "replicate": "Replicate.png",
    "pytorch": "PyTorch.png",
    "pytorch lightning": "PyTorch Lightning.png",
    "tensorflow": "TensorFlow.png",
    "keras": "Keras.png",
    "jax": "JAX.avif",
    "scikit-learn": "Scikit-learn.png",
    "xgboost": "XGBoost.png",
    "onnx": "ONNX.png",
    "mlflow": "mlflow.png",
    "ML flow": "mlflow.png",
    "prefect": "Prefect.svg",
    "airflow": "Apache Airflow.png",
    "kubeflow": "Kubeflow.png",
    "datarobot": "DataRobot.webp",
    "watsonx": "watsonx.jpg",
    "ibm watson": "IBM Watson Machine Learning.png",
    "ibm watson machine learning": "IBM Watson Machine Learning.png",
    "langchain": "LangChain.png",
    "llamaindex": "LlamaIndex.svg",
    "chroma": "chroma1.png",
    "milvus": "Milvus.png",
    "pinecone": "Pinecone.webp",
    "weaviate": "Weaviate.webp",
    "qdrant": "Qdrant.png",
    "vectara": "Vectara.png",
    "jasper ai": "Jasper AI.png",
    "midjourney": "Mid Journey.png",
    "mid journey": "Mid Journey.png",
    "stable diffusion": "Stable Diffusion.png",
    "alphafold": "AlphaFold.png",
    "notion ai": "Notion AI.png",
    "copilot": "Copilot.png",
    "microsoft copilot": "Microsoft Copilot.png",
    "github copilot": "Copilot.png",
    "fastai": "Fastai.png",
    "Adobe Sensei": "Adobe Sensei AI.png",
    "adobe sensei ai": "Adobe Sensei AI.png",
    "adobe sensei ai cloud platform": "Adobe Sensei AI.png",
    "adobe": "Adobe.png",
    "leena ai": "Leena AI.png",
    "salesforce einstein": "Salesforce Einstein.png",
    "sap ai": "SAP AI.png",
    "splunk ai": "Splunk AI.webp",
    "servicenow ai": "ServiceNow AI.png",
    "cisco ai": "Cisco AI.png",
    "microsoft fabric": "Microsoft Fabric.png",
    
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
    "SuiteCRM": "SuiteCRM.png",
    "suite crm": "SuiteCRM.png",
    "workday": "Workday.jpg",
    "whatsapp crm": "Whatsapp CRM.png",
    "real estate crm": "Real Estate CRM.png",
    "healthcare crm": "Healthcare CRM.png",
    "customer engagement platform": "Customer Engagement Platform.png",
    "open source crm": "Open Source CRM.png",
    "on-premise crm": "On-Premise CRM.png",
    "unified customer view": "Unified Customer View.png",
    
    // Cloud Platforms
    "ibm cloud": "IBM Cloud.png",
    "ibm": "IBM.png",
    "digitalocean": "DigitalOcean.png",
    "linode": "Linode.png",
    "vultr": "Vultr.svg",
    "heroku": "Heroku.png",
    "heroku dynos": "Heroku.png",
    "heroku postgres": "Heroku Postgres.png",
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
    "Hyperconverged Infrastructure": "Hyperconverged Infrastructure.jpg",
    "hci": "Hyperconverged Infrastructure.jpg",
    "gpu cloud": "GPU Cloud.png",
    "edge computing": "Edge Computing.png",
    "Virtual Private Cloud": "Virtual Private Cloud.webp",
    "vpc": "Virtual Private Cloud.webp",
    "itar": "ITAR.png",
    "fedramp": "FedRAMP.webp",
    "government cloud": "Government Cloud.png",
    "ai cloud platform": "AI Cloud Platform.png",
    "ai infrastructure": "AI Infrastructure.png",
    "ai orchestration": "AI Orchestration.png",
    
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
    "dax": "DAX.png",
    "ml ops": "ML Ops.png",
    "mlops": "ML Ops.png",
    "model serving": "Model Serving.png",
    "inference engine": "Inference Engine.png",
    "model inference": "Model Inference.png",
    "feature store": "Feature Store.png",
    "nvidia hgx": "Nvidia HGX.png",
    
    // Analytics & BI
    "tableau": "Tableau.png",
    "sap analytics": "SAP AI.webp",
    "sap ai": "SAP AI.webp",
    "splunk": "Splunk AI.webp",
    "splunk ai": "Splunk AI.webp",
    "databricks": "Databricks.png",
    "apache spark": "Apache Spark.png",
    "spark": "Apache Spark.png",
    "apache hadoop": "Apache Hadoop.png",
    "hadoop": "Apache Hadoop.png",
    "apache hive": "Apache Hive.webp",
    "hive": "Apache Hive.webp",
    "apache mxnet": "Apache MXNet.png",
    "mxnet": "Apache MXNet.png",
    "application platform": "Application Platform.png",
    "Data Warehouse": "Data Warehouse.webp",
    "large language models": "Large Language Models.png",
    "nlp": "NLP.png",
    "rag": "RAG.png",
    "transformers": "Transformers.png",
    "inference engine": "Inference Engine.png",
    "model serving": "Model Serving.png",
    "model inference": "Model Inference.png",
    "feature store": "Feature Store.png",
    "explainable ai": "Explainable AI.png",
    "transfer learning": "Transfer Learning.png",
    "generative ai": "Generative AI.png",
    "machine learning": "Machine Learning.png",
    
    // Additional CRM Systems
    "aeon crm": "Aeon CRM.png",
    "agile crm": "Agile CRM.jpg",
    "aim crm": "AIM CRM.png",
    "backstop crm": "Backstop CRM.jpg",
    "basix crm": "BASIX CRM.jpg",
    "bespoke crm": "Bespoke CRM.avif",
    "bigin crm": "Bigin CRM.png",
    "bitrix24 crm": "Bitrix24 CRM.jpg",
    "bloomtools crm": "Bloomtools CRM.jpg",
    "brevo crm": "Brevo CRM.png",
    "brokadesk mt4 crm": "Brokadesk MT4 CRM.png",
    "converse crm": "Converse CRM.webp",
    "daxrm crm": "DAXRM CRM.png",
    "dealersocket crm": "DealerSocket CRM.png",
    "ecollat crm": "Ecollat CRM.png",
    "engagebay": "Engagebay.png",
    "ensivo crm": "Ensivo CRM.jpg",
    "ezee crm": "Ezee CRM.png",
    "focus crm": "Focus CRM.png",
    "freshworks crm": "Freshworks CRM.png",
    "got sales crm": "Got Sales CRM.png",
    "insightly crm": "Insightly CRM.png",
    "intuit crm": "Intuit CRM.jpg",
    "jetpack crm": "Jetpack CRM.svg",
    "kapture crm": "Kapture CRM.jpg",
    "leadsquared sales crm": "LeadSquared Sales CRM.avif",
    "lozics crm": "LOZICS CRM.png",
    "magenta crm": "Magenta CRM.png",
    "monday.com crm": "monday.com CRM.png",
    "myflow": "Myflow.png",
    "odoo crm": "Odoo CRM.png",
    "panda crm": "Panda CRM.svg",
    "poco crm": "POCO CRM.png",
    "scale crm": "SCALE CRM.png",
    "sugar crm": "Sugar CRM.webp",
    "tableau crm": "Tableau CRM.png",
    "vtiger crm": "Vtiger CRM.jpg",
    "zendesk crm": "Zendesk CRM.webp",
    
    // Additional Cloud & Infrastructure
    "e2e networks": "E2E Networks.png",
    "exabytes": "Exabytes.png",
    "hetzner": "Hetzner.png",
    "inap": "INAP.png",
    "ionos": "IONOS.png",
    "kt cloud": "KT Cloud.png",
    "leaseweb": "Leaseweb.jpg",
    "liquid web": "Liquid Web.png",
    "lumen": "Lumen.png",
    "lyve": "Lyve.png",
    "open telekom": "Open Telekom.png",
    "ovh cloud": "OVH Cloud.png",
    "rackcorp secure": "RackCorp Secure.png",
    "sciex cloud": "Sciex Cloud.png",
    "shinjiru": "Shinjiru.png",
    "sitehost": "SiteHost.jpg",
    "statushub": "StatusHub.jpg",
    "tm one cloud alpha": "TM One Cloud Alpha.png",
    "tencent": "Tencent.avif",
    "huawei": "Huawei.png",
    "aruba": "Aruba.jpg",
    "cisco": "Cisco.png",
    "nexon": "Nexon.svg",
    "iseek": "iseek.png",
    "iver": "Iver.png",
    "hotjar": "Hotjar.png",
    "cursor ai": "Cursor AI.avif",
    
    // Additional AI/ML & Data
    "neural networks": "Neural Networks.png",
    "predictive analytics": "Predictive Analytics.png",
    "graph database": "Graph Database.png",
    "key value database": "Key Value Database.png",
    "key-value database": "Key-Value Database.png",
    "nosql database": "NoSQL Database.png",
    "sqlite": "SQLite.jpg",
    "sybase": "Sybase.png",
    "maxdb": "MaxDB.jpg",
    "ravendb": "RavenDB.png",
    "data foundry": "Data Foundry.png",
    "app platform": "App Platform.png",
    "enterprise ai": "Enterprise AI.png",
    "on-premise": "On-Premise.png",
    "on premise": "On-Premise.png",
    "cmc": "CMC.png",
    "ml": "ML.png",
    "perplexity": "Perplexity.png",
    "perplexity ai": "Perplexity AI.png",
    "clara": "Clara.png",
    "triblio": "Triblio.png",
    "mailchimp": "MailChimp.png",
    "odoo": "Odoo.png",
    "zendesk": "Zendesk.webp",
    "whatsapp crm": "Whatsapp CRM.webp",
    "real estate crm": "Real Estate CRM.png",
    "healthcare crm": "Healthcare CRM.png",
    "customer engagement platform": "Customer Engagement Platform.png",
    "open source crm": "Open Source CRM.png",
    "on-premise crm": "On-Premise CRM.png",
    "unified customer view": "Unified Customer View.png",
    "ais": "AIS.png",
    "ais business": "AIS Business.png",
    "ai cloud platform": "AI Cloud Platform.png",
    "ai infrastructure": "AI Infrastructure.png",
    "ai orchestration": "AI Orchestration.png",
    "bson": "BSON.png",
    "cassandra": "Cassandra.png",
    "clara": "Clara.png",
    "cosmos bd": "Cosmos BD.png",
    "couchbase": "Couchbase.png",
    "creatio": "Creatio.png",
    "crmnext": "CRMNext.png",
    "leadsquared": "LeadSquared.png",
    "nimble crm": "Nimble CRM.png",
    "suitcrm": "Suitecrm.png",
    "suite crm": "Suitecrm.png",
    "workday": "Workday.jpg",
    "influxdb": "InfluxDB.svg",
    "in-memory database": "In-Memory Database.png",
    "managed database services": "Managed Database Services.png",
    "vector database": "Vector Database.avif",
    "opencv": "OpenCV.webp",
    "nvidia hgx": "Nvidia HGX.png",
    "nvidia": "Nvidia.png",
    "timescaledb": "TimescaleDB.png",
    "triblio": "Triblio.png",
    "veeva crm": "Veeva CRM.png",
    "virtual private cloud": "Virtual Private Cloud.webp",
    "vmware vsphere": "VMware vSphere.jpg",
    "vmware vcloud": "VMware vCloud.jpg",
    "vmware": "VMware.png",
    "watsonx": "watsonx.jpg",
    "xgboost": "XGBoost.png",
    
    // Generic/Fallback
    "database": "Database.webp",
    "cloud": "Cloud.webp",
    "cloud computing": "Cloud.webp",
    "crm": "CRM.png",
    "on prem": "Database.png",
    "on-prem": "Database.png",
    "not detected": null,
  };
  
  // Try exact match first
  if (logoMap[normalized]) {
    const logoFile = logoMap[normalized];
    if (logoFile === null) {
      console.log(`ℹ️ Logo explicitly set to null for "${techName}"`);
      return null;
    }
    const logoFileLower = logoFile.toLowerCase();
    if (logoPathMap[logoFileLower]) {
      console.log(`✅ Found exact match logo for "${techName}":`, logoFile);
      return logoPathMap[logoFileLower];
    } else {
      console.warn(`⚠️ Exact match logo file not found in map: "${logoFile}" (looking for: "${logoFileLower}")`);
    }
  }
  
  // Try partial matches - check if any key is contained in the normalized text
  const sortedKeys = Object.keys(logoMap).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    if (normalized.includes(key) && key.length > 3) {
      const logoFile = logoMap[key];
      if (logoFile === null) continue;
      const logoFileLower = logoFile.toLowerCase();
      if (logoPathMap[logoFileLower]) {
        console.log(`✅ Found partial match logo for "${techName}" (matched key: "${key}"):`, logoFile);
        return logoPathMap[logoFileLower];
      }
    }
  }
  
  console.warn(`❌ No logo found for "${techName}" (normalized: "${normalized}")`);
  return null;
};

// Get colored React icon for technologies without logos
export const getTechIcon = (techName) => {
  if (!techName) return null;
  
  const normalized = techName.toLowerCase().trim();
  
  const faIcons = {
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
    console.log(`✅ Found FA icon for "${techName}"`);
    return { component: IconComponent, color };
  }
  
  for (const [key, iconData] of Object.entries(faIcons)) {
    if ((normalized.includes(key) || key.includes(normalized)) && key.length > 2) {
      console.log(`✅ Found FA icon (partial match) for "${techName}" (matched key: "${key}")`);
      return { component: iconData.component, color: iconData.color };
    }
  }
  
  const siIconData = siIcons[normalized];
  if (siIconData) {
    const IconComponent = SiIcons[siIconData.name];
    if (IconComponent) {
      console.log(`✅ Found SI icon for "${techName}"`);
      return { component: IconComponent, color: siIconData.color };
    } else {
      console.warn(`⚠️ SI icon component not found: "${siIconData.name}"`);
    }
  }
  
  for (const [key, iconData] of Object.entries(siIcons)) {
    if ((normalized.includes(key) || key.includes(normalized)) && key.length > 2) {
      const IconComponent = SiIcons[iconData.name];
      if (IconComponent) {
        console.log(`✅ Found SI icon (partial match) for "${techName}" (matched key: "${key}")`);
        return { component: IconComponent, color: iconData.color };
      }
    }
  }
  
  console.warn(`❌ No icon found for "${techName}" (normalized: "${normalized}")`);
  return null;
};
