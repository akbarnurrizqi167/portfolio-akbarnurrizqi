export const SHEET_ID = "1izLwzVdiS7OfNABNhA0WWYwxCQYC0mwyTp1ISjfIcsY";

export const SHEET_NAMES = [
  "site_settings",
  "profile",
  "navigation",
  "services",
  "projects",
  "experience",
  "education",
  "skills",
  "publications",
  "awards",
  "certifications",
  "social_links",
  "contact_items",
] as const;

export type SheetName = (typeof SHEET_NAMES)[number];
export type SheetRow = Record<string, string>;
export type PortfolioData = Record<SheetName, SheetRow[]>;

const isPublished = (value: string | undefined) =>
  value === undefined || value === "" || value.toLowerCase() === "true";

const hasIdentity = (row: SheetRow) => Boolean(row.id || row.key);

const sortRows = (rows: SheetRow[]) =>
  [...rows].sort(
    (a, b) => Number(a.sort_order || 999) - Number(b.sort_order || 999),
  );

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (character === "," && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  return rows;
}

function csvToRows(input: string): SheetRow[] {
  const matrix = parseCsv(input);
  const headers = (matrix[0] || []).map((header) => header.trim());

  return matrix.slice(1).map((cells) => {
    const record: SheetRow = {};
    headers.forEach((header, index) => {
      if (header) record[header] = (cells[index] || "").trim();
    });
    return record;
  });
}

async function fetchSheet(name: SheetName): Promise<SheetRow[]> {
  const endpoint = new URL(
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`,
  );
  endpoint.searchParams.set("tqx", "out:csv");
  endpoint.searchParams.set("headers", "1");
  endpoint.searchParams.set("sheet", name);

  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load ${name}`);

  const rows = csvToRows(await response.text()).filter(hasIdentity);
  return name === "site_settings"
    ? rows
    : sortRows(rows.filter((row) => isPublished(row.published)));
}

export async function fetchLivePortfolioData(): Promise<PortfolioData> {
  const results = await Promise.allSettled(
    SHEET_NAMES.map(async (name) => [name, await fetchSheet(name)] as const),
  );

  const nextData = { ...fallbackData };
  let successfulSheets = 0;
  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value[1].length > 0) {
      nextData[result.value[0]] = result.value[1];
      successfulSheets += 1;
    }
  });

  if (successfulSheets === 0) {
    throw new Error("Google Sheets portfolio data is unavailable");
  }

  return nextData;
}

export const fallbackData: PortfolioData = {
  site_settings: [
    { key: "site_title", value: "Akbar Nur Rizqi — Data & AI Portfolio" },
    {
      key: "site_description",
      value: "Data Analyst, Machine Learning & AI Engineer Portfolio",
    },
    { key: "site_language", value: "en" },
    { key: "copyright_text", value: "© 2026 Akbar Nur Rizqi." },
    { key: "footer_quote", value: "Data-driven solutions." },
    { key: "footer_quote_author", value: "Akbar Nur Rizqi" },
    { key: "show_experience", value: "TRUE" },
    { key: "show_publications", value: "TRUE" },
    { key: "show_awards", value: "TRUE" },
    { key: "show_certifications", value: "TRUE" },
    { key: "show_resume", value: "FALSE" },
    { key: "default_projects_limit", value: "6" },
  ],
  profile: [
    {
      id: "prof_01",
      full_name: "Akbar Nur Rizqi",
      short_name: "Akbar",
      eyebrow: "Data & AI Enthusiast",
      headline: "Data Analyst, Machine Learning & AI Engineer",
      rotating_titles:
        "Data Analyst | Machine Learning Engineer | Computer Vision Engineer | AI Engineer",
      summary:
        "Information Systems graduate with hands-on experience in data analytics, machine learning, computer vision, and AI development across industry, research, and educational programs. Developed data- and AI-driven solutions using Python, SQL, deep learning, OCR, data visualization, and cloud-based tools.",
      location: "Sleman, Daerah Istimewa Yogyakarta",
      email: "akbarnurrizqi167@gmail.com",
      photo_url: "",
      resume_url: "",
      availability_text: "Open to Opportunities",
      primary_cta_label: "View Projects",
      primary_cta_url: "#projects",
      secondary_cta_label: "Contact Me",
      secondary_cta_url: "#contact",
      published: "TRUE",
    },
  ],
  navigation: [
    { id: "nav_1", label: "Expertise", section_id: "services", sort_order: "1", published: "TRUE" },
    { id: "nav_2", label: "Projects", section_id: "projects", sort_order: "2", published: "TRUE" },
    { id: "nav_3", label: "Experience", section_id: "experience", sort_order: "3", published: "TRUE" },
    { id: "nav_4", label: "Education", section_id: "education", sort_order: "4", published: "TRUE" },
    { id: "nav_5", label: "Skills", section_id: "skills", sort_order: "5", published: "TRUE" },
    { id: "nav_6", label: "Contact", section_id: "contact", sort_order: "6", published: "TRUE" },
  ],
  services: [
    {
      id: "srv_1",
      title: "Data Analytics & Business Intelligence",
      icon_key: "chart-bar",
      short_description:
        "Processing, validating, and analyzing large datasets to build clear dashboards and decision-ready business metrics.",
      sort_order: "1",
      published: "TRUE",
    },
    {
      id: "srv_2",
      title: "Machine Learning & AI Engineering",
      icon_key: "cpu",
      short_description:
        "Developing and deploying predictive models, hyperparameter tuning systems, and practical AI integrations.",
      sort_order: "2",
      published: "TRUE",
    },
    {
      id: "srv_3",
      title: "Computer Vision & OCR",
      icon_key: "eye",
      short_description:
        "Building script transliteration systems and image classifiers with YOLOv8, CRNN, and ConvNeXt-Tiny.",
      sort_order: "3",
      published: "TRUE",
    },
  ],
  projects: [
    {
      id: "project_001",
      slug: "javanese-transliteration",
      title: "Javanese Script Transliteration",
      category: "computer-vision",
      short_description: "Automated script-to-text recognition using YOLOv8 and CRNN.",
      long_description:
        "Developed a Javanese script transliteration system using YOLOv8 for word detection and CRNN for text recognition.",
      tech_tags: "YOLOv8 | CRNN | Computer Vision | Python",
      project_date: "2024-11",
      featured: "TRUE",
      sort_order: "1",
      published: "TRUE",
    },
    {
      id: "project_002",
      slug: "sundanese-classifier",
      title: "Sundanese Script Classifier",
      category: "computer-vision",
      short_description: "ConvNeXt-Tiny classifier trained on more than 2,000 labeled images.",
      long_description:
        "Built a Sundanese script classifier with 99.55% validation accuracy and deployed it through FastAPI on Hugging Face.",
      tech_tags: "ConvNeXt-Tiny | FastAPI | Hugging Face",
      project_date: "2025-03",
      featured: "TRUE",
      sort_order: "2",
      published: "TRUE",
    },
    {
      id: "project_003",
      slug: "big-data-kimia-farma",
      title: "Big Data Analytics — Kimia Farma",
      category: "data-analytics",
      short_description: "Centralized analysis of more than 600,000 business records.",
      long_description:
        "Integrated transaction, product, inventory, and branch data in BigQuery, then built business metrics and a Looker Studio dashboard.",
      tech_tags: "BigQuery | SQL | Looker Studio",
      project_date: "2025-12",
      featured: "TRUE",
      sort_order: "3",
      published: "TRUE",
    },
    {
      id: "project_004",
      slug: "hypermeta-dashboard",
      title: "HyperMeta Tuning Dashboard",
      category: "machine-learning",
      short_description: "A machine learning hyperparameter tuning dashboard.",
      long_description:
        "Developed experiment tracking and visualization features with metaheuristic optimization and a Docker-based GCP deployment pipeline.",
      tech_tags: "Docker | GCP | Machine Learning",
      project_date: "2024-11",
      featured: "TRUE",
      sort_order: "4",
      published: "TRUE",
    },
    {
      id: "project_005",
      slug: "home-credit-scoring",
      title: "Credit Scoring Model",
      category: "machine-learning",
      short_description: "Random Forest model for customer repayment risk.",
      long_description:
        "Prepared credit data through missing-value handling, outlier detection, feature selection, encoding, and class balancing.",
      tech_tags: "Random Forest | Python | EDA",
      project_date: "2023-11",
      featured: "FALSE",
      sort_order: "5",
      published: "TRUE",
    },
    {
      id: "project_006",
      slug: "telkom-akses-dashboard",
      title: "Operational Dashboard — Telkom Akses",
      category: "data-analytics",
      short_description: "Construction monitoring across more than 900 operational records.",
      long_description:
        "Built Looker Studio dashboards with EDA, pivot analysis, metric engineering, and geospatial visualizations.",
      tech_tags: "Looker Studio | Excel | Geospatial",
      project_date: "2025-09",
      featured: "FALSE",
      sort_order: "6",
      published: "TRUE",
    },
  ],
  experience: [
    {
      id: "exp_1",
      job_title: "Computer Vision Staff",
      company: "PT. Data Sorcerers Indonesia",
      employment_type: "Full-time",
      location: "Indonesia",
      start_date: "2024-11",
      end_date: "",
      is_current: "TRUE",
      summary: "Computer vision research and internal knowledge sharing.",
      achievements:
        "Developed a Javanese script transliteration system using YOLOv8 and CRNN.\nDesigned technical modules for the HoDS Computer Vision team.\nDelivered knowledge-sharing sessions through Sorcery Talks and Sorcery Gathering.",
      sort_order: "1",
      published: "TRUE",
    },
    {
      id: "exp_2",
      job_title: "Artificial Intelligence Facilitator",
      company: "PT Dicoding Akademi Indonesia",
      employment_type: "Contract",
      location: "Indonesia",
      start_date: "2026-02",
      end_date: "2026-07",
      is_current: "FALSE",
      summary: "Facilitated learners in Coding Camp 2026.",
      achievements:
        "Facilitated 20+ learners through 14 ILT sessions and 16 weekly consultations.\nGuided AI/ML capstone projects.\nAchieved a 4.81/5.00 satisfaction rating and an 88% graduation rate.",
      sort_order: "2",
      published: "TRUE",
    },
    {
      id: "exp_3",
      job_title: "Project-Based Virtual Intern — Big Data Analytics",
      company: "Kimia Farma × Rakamin Academy",
      employment_type: "Internship",
      location: "Indonesia",
      start_date: "2025-12",
      end_date: "2025-12",
      is_current: "FALSE",
      summary: "Big data analytics and visualization.",
      achievements:
        "Integrated 600,000+ records into BigQuery.\nDeveloped SQL-based sales, profit, margin, and discount metrics.\nBuilt a Looker Studio dashboard spanning 30+ provinces.",
      sort_order: "3",
      published: "TRUE",
    },
    {
      id: "exp_4",
      job_title: "Machine Learning Mentor",
      company: "PT Dicoding Akademi Indonesia",
      employment_type: "Contract",
      location: "Indonesia",
      start_date: "2025-08",
      end_date: "2026-01",
      is_current: "FALSE",
      summary: "Mentoring in the Asah 2025 program.",
      achievements:
        "Mentored 40+ learners through ILT and weekly consultations.\nLed 30+ mentoring sessions.\nSupported a 95% graduation rate with a 4.8+ satisfaction rating.",
      sort_order: "4",
      published: "TRUE",
    },
    {
      id: "exp_5",
      job_title: "AI Engineer",
      company: "Arutala Aksara",
      employment_type: "Contract",
      location: "Indonesia",
      start_date: "2025-03",
      end_date: "2026-01",
      is_current: "FALSE",
      summary: "AI engineering for script classification and OCR.",
      achievements:
        "Built a ConvNeXt-Tiny classifier with 99.55% validation accuracy.\nDeployed an open inference API using FastAPI on Hugging Face.\nBenchmarked OCR approaches for Nusantara script recognition.",
      sort_order: "5",
      published: "TRUE",
    },
    {
      id: "exp_6",
      job_title: "Data Support Project",
      company: "PT. Telkom Akses",
      employment_type: "Project-based",
      location: "Indonesia",
      start_date: "2025-09",
      end_date: "2025-11",
      is_current: "FALSE",
      summary: "Data processing and dashboard development.",
      achievements:
        "Processed and validated 900+ operational records.\nBuilt Looker Studio dashboards with metric engineering.\nProduced geospatial visualizations and 50+ project documents.",
      sort_order: "6",
      published: "TRUE",
    },
    {
      id: "exp_7",
      job_title: "Data Entry Specialist",
      company: "MSM DigiTech Ireland",
      employment_type: "Contract",
      location: "Ireland · Remote",
      start_date: "2025-09",
      end_date: "2025-11",
      is_current: "FALSE",
      summary: "E-commerce data enrichment and scraping.",
      achievements:
        "Managed more than 1,000 product records.\nBuilt a Python comparison pipeline that identified 300+ new products.\nEnriched 400+ items per upload cycle.",
      sort_order: "7",
      published: "TRUE",
    },
    {
      id: "exp_8",
      job_title: "Dataset Preprocessing Team",
      company: "Arutala Aksara",
      employment_type: "Project-based",
      location: "Indonesia",
      start_date: "2024-12",
      end_date: "2025-03",
      is_current: "FALSE",
      summary: "OCR dataset preparation.",
      achievements:
        "Preprocessed 6,000+ Javanese script images.\nPrepared sentence-level datasets through systematic labeling.\nValidated dataset quality throughout the pipeline.",
      sort_order: "8",
      published: "TRUE",
    },
    {
      id: "exp_9",
      job_title: "Machine Learning Engineer",
      company: "PT. Algonacci Sobat Nusantara",
      employment_type: "Project-based",
      location: "Indonesia",
      start_date: "2024-11",
      end_date: "2024-12",
      is_current: "FALSE",
      summary: "HyperMeta development.",
      achievements:
        "Developed a hyperparameter tuning dashboard.\nBuilt a Docker and GCP deployment pipeline.\nEarned Best Capstone Team recognition in the Bangkit Company Track.",
      sort_order: "9",
      published: "TRUE",
    },
    {
      id: "exp_10",
      job_title: "Project-Based Virtual Intern — Data Scientist",
      company: "Home Credit Indonesia × Rakamin Academy",
      employment_type: "Internship",
      location: "Indonesia",
      start_date: "2023-11",
      end_date: "2023-12",
      is_current: "FALSE",
      summary: "Credit scoring modeling.",
      achievements:
        "Developed a Random Forest repayment-risk model.\nPrepared credit data through feature engineering and class balancing.\nAnalyzed customer risk patterns through EDA and visualization.",
      sort_order: "10",
      published: "TRUE",
    },
  ],
  education: [
    {
      id: "edu_1",
      institution: "Alma Ata University",
      degree: "Bachelor of Computer Science (S.Kom)",
      major: "Information Systems",
      start_year: "2022",
      end_year: "2026",
      gpa: "3.95",
      description: "155 credits completed.",
      thesis_title:
        "Word Detection and Text Recognition Using YOLOv8 and CRNN for Javanese Transliteration",
      sort_order: "1",
      published: "TRUE",
    },
  ],
  skills: [
    "Python|Programming Language",
    "SQL|Programming Language",
    "Bash|Programming Language",
    "Data Analytics|Data Analytics",
    "Data Preprocessing|Data Analytics",
    "EDA|Data Analytics",
    "Data Validation|Data Analytics",
    "Machine Learning|Machine Learning",
    "Model Evaluation|Machine Learning",
    "Generative AI|Machine Learning",
    "Deep Learning|Deep Learning",
    "Computer Vision|Computer Vision",
    "OCR|Computer Vision",
    "NLP|NLP",
    "BigQuery|Cloud & Deployment",
    "Google Cloud Platform (GCP)|Cloud & Deployment",
    "Docker|Cloud & Deployment",
    "FastAPI|Cloud & Deployment",
    "Looker Studio|Visualization",
    "Hugging Face|Tools & Platforms",
    "Git/GitHub|Tools & Platforms",
  ].map((entry, index) => {
    const [skill_name, skill_group] = entry.split("|");
    return {
      id: `sk_${index + 1}`,
      skill_name,
      skill_group,
      sort_order: String(index + 1),
      published: "TRUE",
    };
  }),
  publications: [
    {
      id: "pub_1",
      title:
        "Public Service Quality Assessment in Smart Applications Through SVM-Based Sentiment Analysis",
      authors:
        "Nur Rachman Dzakiyullah | Abdulsatar Abduljabbar Sultan | Akbar Nur Rizqi | Shakila Amalia Pratiwi | Mutiara Puspita Maharani | Asti Ratnasari",
      venue:
        "9th International Conference on New Trends in Information and Communications Technology Applications (NTICT 2025), Springer",
      publication_year: "2026",
      sort_order: "1",
      published: "TRUE",
    },
    {
      id: "pub_2",
      title:
        "Penggunaan dan Niat Perilaku Menggunakan Sistem Informasi Desa di antara Pemerintah Kalurahan Murtigading dengan Pendekatan Model UTAUT-2",
      authors:
        "Dadang Heksaputra | Ragil Satria Wicaksana | Dhina Puspasari Wijaya | Vega Lavenia | Akbar Nur Rizqi",
      venue: "Indonesian Journal of Business Intelligence (IJUBI), Vol. 7 No. 2",
      publication_year: "2024",
      sort_order: "2",
      published: "TRUE",
    },
  ],
  awards: [
    {
      id: "awd_1",
      title: "Best Team, Bangkit Company Track Capstone Project",
      issuer: "Bangkit Academy × Braincore",
      award_date: "2025-01",
      description:
        "Developed HyperMeta and earned Best Team recognition in the Company Track Capstone Project.",
      sort_order: "1",
      published: "TRUE",
    },
    {
      id: "awd_2",
      title: "Best Participant, MariBelajar Scholarship",
      issuer: "MariBelajar",
      award_date: "2024-04",
      description: "Named Best Participant in the Data Analyst and AI program.",
      sort_order: "2",
      published: "TRUE",
    },
    {
      id: "awd_3",
      title: "Outstanding Student, Information Systems Program",
      issuer: "Universitas Alma Ata",
      award_date: "2024-01",
      description:
        "Recognized as an Outstanding Student for the 2023/2024 academic year.",
      sort_order: "3",
      published: "TRUE",
    },
    {
      id: "awd_4",
      title: "Winner, PKM Idea Competition 2023",
      issuer: "Universitas Alma Ata",
      award_date: "2023-01",
      description:
        "Proposed JAYATANI.ID to improve agricultural product marketing and farmer empowerment.",
      sort_order: "4",
      published: "TRUE",
    },
  ],
  certifications: [
    "HCIA-AI|Huawei × Digital Talent Scholarship|2025",
    "Fundamentals of Deep Learning|NVIDIA Deep Learning Institute|2025",
    "Building Transformer-Based NLP Applications|NVIDIA Deep Learning Institute|2025",
    "Machine Learning Path|Bangkit Academy|2025",
    "Machine Learning Specialization|DeepLearning.AI & Stanford University|2024",
    "TensorFlow Developer Professional Certificate|DeepLearning.AI|2024",
    "Database Foundations|Oracle × Digital Talent Scholarship|2023",
    "Cloud Practitioner Essentials|AWS × Dicoding Indonesia|2022",
  ].map((entry, index) => {
    const [name, issuer, issue_year] = entry.split("|");
    return {
      id: `cert_${index + 1}`,
      name,
      issuer,
      issue_year,
      sort_order: String(index + 1),
      published: "TRUE",
    };
  }),
  social_links: [
    {
      id: "soc_1",
      platform: "LinkedIn",
      label: "LinkedIn",
      url: "https://linkedin.com/in/akbarnurrizqi",
      sort_order: "1",
      published: "TRUE",
    },
    {
      id: "soc_5",
      platform: "Email",
      label: "Email",
      url: "mailto:akbarnurrizqi167@gmail.com",
      sort_order: "5",
      published: "TRUE",
    },
  ],
  contact_items: [
    {
      id: "cnt_1",
      contact_type: "Location",
      label: "Based in",
      value: "Sleman, Daerah Istimewa Yogyakarta",
      sort_order: "1",
      published: "TRUE",
    },
    {
      id: "cnt_2",
      contact_type: "Email",
      label: "Email",
      value: "akbarnurrizqi167@gmail.com",
      url: "mailto:akbarnurrizqi167@gmail.com",
      sort_order: "2",
      published: "TRUE",
    },
    {
      id: "cnt_3",
      contact_type: "LinkedIn",
      label: "LinkedIn",
      value: "akbarnurrizqi",
      url: "https://linkedin.com/in/akbarnurrizqi",
      sort_order: "3",
      published: "TRUE",
    },
  ],
};
