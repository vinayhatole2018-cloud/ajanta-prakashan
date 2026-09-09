/**
 * One-time / re-runnable seed script.
 *
 * Populates Firestore with:
 *  - settings/site
 *  - two real conferences (with fixed IDs, so re-running this script upserts
 *    rather than duplicating), sourced from the brochures in _source_assets/
 *  - each conference's committee members
 *  - media URL records for each conference
 *
 * This does NOT touch Firebase Storage (none is used anywhere in this app).
 * All banner/poster/brochure/QR URLs point to files already committed under
 * /public — swap them for real hosted HTTPS URLs from /admin/media once you
 * have them; nothing else in the app needs to change.
 *
 * Usage:
 *   1. Download a service account key (Firebase Console > Project Settings >
 *      Service Accounts > Generate new private key) and save it as
 *      serviceAccountKey.json in the project root (already gitignored), or
 *      point FIREBASE_SERVICE_ACCOUNT_PATH at it in .env.local.
 *   2. npm run seed
 */
import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const usingEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

if (!getApps().length) {
  if (usingEmulator) {
    // Talking to the local Firestore emulator — no real credentials needed.
    initializeApp({ projectId: process.env.GCLOUD_PROJECT || "demo-ajanta-prakashan" });
  } else {
    const serviceAccountPath = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json");
    if (!existsSync(serviceAccountPath)) {
      console.error(
        `Service account key not found at ${serviceAccountPath}.\n` +
          "Download one from Firebase Console > Project Settings > Service Accounts, " +
          "save it there (or set FIREBASE_SERVICE_ACCOUNT_PATH), then re-run: npm run seed"
      );
      process.exit(1);
    }
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
    initializeApp({ credential: cert(serviceAccount) });
  }
}
const db = getFirestore();

async function upsert(collection: string, id: string, data: Record<string, unknown>) {
  await db.collection(collection).doc(id).set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  console.log(`  ✓ ${collection}/${id}`);
}

async function seedSettings() {
  console.log("Seeding settings/site...");
  await db
    .collection("settings")
    .doc("site")
    .set(
      {
        websiteName: "Ajanta Prakashan",
        description:
          "Ajanta Prakashan organizes and publishes peer-reviewed national and international academic conferences, seminars and workshops across disciplines, in partnership with colleges and universities across India.",
        logoUrl: "/images/logo.png",
        contactEmail: "ajantaprakashan1@gmail.com",
        contactPhone: "9579260877",
        address: "Ajanta Prakashan, Jaisingpura, Near University Gate, Aurangabad (M.S.) - 431004",
        whatsappUrl: null,
        socialLinks: {},
        footerText: `© ${new Date().getFullYear()} Ajanta Prakashan. All rights reserved.`,
        privacyPolicy:
          "Ajanta Prakashan collects only the details you provide during conference registration (name, mobile, email, city, designation and institution) to send you updates about conferences and events. We do not sell or share your information with third parties.",
        terms:
          "Registration fees, paper submission guidelines and important dates are specific to each conference and are published on that conference's page. Fees once paid are non-refundable unless the conference is cancelled by the organizer.",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  console.log("  ✓ settings/site\n");
}

const BJCC_ID = "bjcc-apcc-national-conference-2026";
const TMV_ID = "tmv-lokmanya-tilak-law-conference-2026";

async function seedBjccConference() {
  console.log("Seeding BJCC & APCC conference...");
  await upsert("conferences", BJCC_ID, {
    title: "Atmanirbhar Bharat: Cultivating Resilience Through Startups and Sustainable Development",
    theme: "Atmanirbhar Bharat: Cultivating Resilience Through Startups and Sustainable Development",
    description:
      "The vision of Atmanirbhar Bharat emphasises building a self-reliant and resilient India through innovation, entrepreneurship, and sustainable growth. Startups play a transformative role in this mission by developing indigenous technologies, generating employment opportunities, and strengthening local industries. By integrating sustainable development practices, these ventures ensure economic progress while protecting environmental and social well-being. The synergy between startups and sustainability encourages responsible innovation that addresses both national and global challenges. Through the collaborative efforts of policymakers, entrepreneurs, and academia, Atmanirbhar Bharat can foster a resilient economy capable of driving inclusive and sustainable development.",

    date: "2026-04-25",
    startTime: "10:00 AM",
    endTime: "",

    venue: "The Byramjee Jeejeebhoy College of Commerce, Mumbai",
    address: "33, Maharishi Karve Marg (M.K. Road), Opposite Charni Road Railway Station, Mumbai - 400004, Maharashtra.",
    city: "Mumbai",
    state: "Maharashtra",

    mode: "hybrid",

    organizer: "The Byramjee Jeejeebhoy College of Commerce, Mumbai",
    coOrganizer: "Anjuman-I-Islam's Akbar Peerbhoy College of Commerce and Economics",

    // Explicitly deleted (removed from the app in a later revision): the
    // field-level FieldValue.delete() is required here because upsert()
    // merges — a plain omission would leave these stale on documents that
    // were seeded before this revision.
    subtitle: FieldValue.delete(),
    bannerUrl: FieldValue.delete(),
    posterUrl: FieldValue.delete(),

    brochureUrl: "/documents/bjcc-apcc-conference-2026-brochure.pdf",

    registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSexKDD5ERGjw5mHSN0OvL4CAhEy8y55wa0dG6lPgSNy3oA5sw/viewform",
    paperSubmissionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSexKDD5ERGjw5mHSN0OvL4CAhEy8y55wa0dG6lPgSNy3oA5sw/viewform",
    whatsappUrl: "https://chat.whatsapp.com/EYnR3jQ9CR85XyQkIj7f8m",
    whatsappNumber: "918976036046",
    websiteUrl: null,

    contactEmail: "conference2026.apc.bjcc@gmail.com",
    contactPhone: null,

    objectives: [
      "To examine the role of startups in promoting the vision of Atmanirbhar Bharat by fostering innovation, employment generation, and strengthening indigenous industries.",
      "To analyse the contribution of sustainable development practices in startup ecosystems and their impact on long-term economic resilience and environmental responsibility.",
      "To evaluate the challenges, opportunities, and policy support required for startups to effectively contribute to self-reliant and sustainable economic growth in India.",
    ],

    tracks: [
      { id: "track-1", title: "Business, Commerce, Finance and Entrepreneurship", disciplines: ["Accountancy", "Finance", "Management", "Entrepreneurship"] },
      { id: "track-2", title: "Economic Policy, Governance and Law, Economics", disciplines: ["Public Policy", "Political Science", "Law"] },
      { id: "track-3", title: "Society, Culture and Human Development", disciplines: ["Sociology", "Human Resource / Industrial Relations", "Social Entrepreneurship"] },
      { id: "track-4", title: "Regional Development, History and Sustainability", disciplines: ["Geography", "History", "Rural Development", "Environmental Studies"] },
      { id: "track-5", title: "Science, Technology and Digital Innovation", disciplines: ["Technology", "Information Technology", "Innovation Systems"] },
    ],

    subThemes: [
      {
        id: "st-commerce",
        category: "Commerce & Trade",
        items: [
          "Atmanirbhar Bharat and Transformation of Indian Trade and Commerce",
          "Startups and Domestic Supply Chains",
          "MSMEs and Startups - Self-Reliant Economy",
          "Export Promotion, Import Substitution, and Trade Competitiveness",
          "E-Commerce and Digital Trade in an Atmanirbhar India",
        ],
      },
      {
        id: "st-accountancy",
        category: "Accountancy & Finance",
        items: [
          "Financial Reporting and Sustainability Accounting for Startups",
          "Role of Accounting Standards in Strengthening Startup Governance",
          "Financial Inclusion, FinTech, and Startup Growth",
          "Cost Management and Pricing Strategies for Sustainable Startups",
          "Green Accounting and ESG Reporting in the Atmanirbhar Framework",
          "Startup Financing: Venture Capital and Government Support",
        ],
      },
      {
        id: "st-management",
        category: "Management & Entrepreneurship",
        items: [
          "Startups and Entrepreneurship in Atmanirbhar Bharat",
          "Strategic Management for Sustainable and Scalable Startups",
          "Innovation Management and Business Model Sustainability",
          "Human Resource Practices in Startups for Long-Term Growth",
          "Leadership, Ethics, and Corporate Governance in Startups",
          "Marketing Strategies for Indigenous Brands and Products",
          "Women Entrepreneurship and Inclusive Startup Growth",
          "Dalit and Minority Entrepreneurship - Stand Up India",
        ],
      },
      {
        id: "st-economics",
        category: "Economics & Public Policy",
        items: [
          "Atmanirbhar Bharat: Economic Resilience and Growth Perspectives",
          "Role of Startups in Employment Generation and Economic Development",
          "Startup-Led Innovation and Productivity Growth",
          "Sustainable Development Goals and Economic Policy",
          "Fiscal and Monetary Policies Supporting Startups",
          "Regional Development and Rural Startups in India",
          "Impact of Globalisation on India's Atmanirbhar Vision",
        ],
      },
      {
        id: "st-sociology",
        category: "Sociology",
        items: [
          "Social Entrepreneurship and Community-Based Self-Reliance",
          "Changing Work Culture in Indian Startups: A Sociological Perspective",
          "Digital Divide, Social Inequality, and Inclusive Atmanirbhar Growth",
          "Role of Youth and Social Capital in India's Startup Movement",
          "Caste, Gender, and Social Mobility through Entrepreneurship",
          "Rural-Urban Social Transformation under Atmanirbhar Bharat",
          "Informal Economy, Gig Workers, and Social Security Challenges",
          "IRS and Social Sustainability",
          "Social entrepreneurship and impact",
        ],
      },
      {
        id: "st-law",
        category: "Law",
        items: [
          "Startup Regulatory Framework and Ease of Doing Business in India",
          "Intellectual Property Rights (IPR) and Innovation Protection",
          "Labour Laws and Workforce Protection in the Startup Economy",
          "Environmental Laws and Sustainable Business Compliance",
          "Contract Law and Dispute Resolution for Startups",
          "Consumer Protection Laws in Digital and Platform Economies",
          "Legal Challenges in MSME Formalization",
        ],
      },
      {
        id: "st-hr",
        category: "Human Resource / Industrial Relations",
        items: [
          "Changing Employment Relations in Startups",
          "Talent Retention, Skill Development, and Future Workforce",
          "Gig Economy, Platform Workers, and HR Challenges",
          "Workplace Diversity, Equity, and Inclusion (DEI)",
          "Occupational Health, Safety, and Mental Well-being in Startups",
          "Remote Work Culture and Organizational Flexibility",
          "Ethical HR Practices in High-Growth Startups",
        ],
      },
      {
        id: "st-history",
        category: "History",
        items: [
          "Evolution of Indigenous Industries and Swadeshi Movements",
          "Historical Roots of Self-Reliance in Indian Economic Thought",
          "Traditional Crafts, Cottage Industries, and Modern Revival",
          "Post-Independence Industrial Policies and Lessons for Atmanirbhar Bharat",
        ],
      },
      {
        id: "st-polsci",
        category: "Political Science",
        items: [
          "Atmanirbhar Bharat as a National Policy Vision",
          "Centre-State Relations and Startup Policy Implementation",
          "Political Economy of Industrial and Startup Policies",
          "Public Administration Reforms and Digital Governance",
          "Role of Local Governments in Promoting Entrepreneurship",
          "Democratic Accountability and Policy Effectiveness",
        ],
      },
      {
        id: "st-geography",
        category: "Geography",
        items: [
          "Regional Disparities and Balanced Economic Development",
          "Urbanisation, Smart Cities, and Startup Growth",
          "Rural Geography and Agro-Based Startups",
          "Resource Geography and Sustainable Industrial Location",
          "Infrastructure, Connectivity, and Regional Competitiveness",
          "Climate, Environment, and Sustainable Regional Planning",
        ],
      },
      {
        id: "st-science",
        category: "Science & Technology",
        items: [
          "Scientific Innovation and Indigenous Technology Development",
          "Research & Development (R&D) Ecosystem for Startup Growth",
          "Biotechnology and Healthcare Innovations in Atmanirbhar India",
          "Space Technology, Defence Research, and Strategic Self-Reliance",
          "Renewable Energy Technologies and Sustainable Development",
          "Agricultural Science and Agri-Tech Innovations",
          "Climate Science, Environmental Technology, and Green Innovation",
          "Indigenous Knowledge Systems (IKS) and Scientific Integration",
          "Deep-Tech Startups and National Competitiveness",
          "Public-Private Partnerships in Scientific Research",
        ],
      },
      {
        id: "st-it",
        category: "Information Technology & Digital Innovation",
        items: [
          "Digital India and Technological Self-Reliance",
          "Artificial Intelligence (AI) and Machine Learning in Startup Ecosystems",
          "Cybersecurity and Data Sovereignty",
          "Blockchain Technology and Digital Trust Systems",
          "Cloud Computing and Indigenous Digital Infrastructure",
          "Internet of Things (IoT) and Smart Manufacturing",
          "Semiconductor Development and Electronics Manufacturing",
          "5G/6G Technology and Digital Connectivity",
          "FinTech, EdTech, HealthTech and Platform-Based Innovation",
          "Digital Public Infrastructure (DPI) and Startup Opportunities",
          "Industry 4.0 and Smart Production Systems",
          "IT for Sustainable Development and Green Computing",
          "Digital Inclusion and Bridging the Technology Divide",
          "Startups in Robotics, Automation, and Advanced Manufacturing",
        ],
      },
    ],

    registrationFees: [
      { category: "Academicians / Industrial Delegates", amount: 800, currency: "INR", notes: "" },
      { category: "Research Scholars", amount: 600, currency: "INR", notes: "" },
      { category: "Attendee (No Publication)", amount: 300, currency: "INR", notes: "" },
    ],

    importantDates: [
      { label: "Last date for submission of full paper", date: "2026-04-10" },
      { label: "Notification of acceptance", date: "2026-04-15" },
      { label: "Conference Date", date: "2026-04-25" },
    ],

    paperGuidelines: {
      font: "Times New Roman",
      fontSize: "12pt",
      lineSpacing: "1.5",
      fileFormat: "MS Word (.doc/.docx)",
      marginLeft: "1.5 inch",
      marginRight: "1 inch",
      maxWords: "2000",
      requiredFields: ["Title", "Author name(s)", "Mailing address", "Email address", "Contact number"],
      referenceStyle: "APA (with URL if available)",
      plagiarismLimit: "Below 10%",
      submissionNote: "A soft copy of the research paper should be sent by email or submitted through the online submission form (same link as registration).",
      awards: "The conference will honour exceptional research through Best Paper and Runner-Up awards.",
      journalName: "AJANTA",
      journalIssn: "2277-5730",
      journalImpactFactor: "8.172",
    },

    paymentInformation: {
      accountName: "The Byramjee Jeejeebhoy College of Commerce",
      accountNumber: "20101304109",
      bank: "Bank of Maharashtra",
      branch: "Thakurdwar Branch",
      ifsc: "MAHB0000161",
      paymentQrUrl: null,
      notes: "",
    },

    status: "published",
    createdAt: FieldValue.serverTimestamp(),
  });

  const bjccCommittee: { name: string; designation: string; institution: string; category: string; displayOrder: number }[] = [
    { name: "Padma Shri Dr Zahir Kazi", designation: "Hon. President", institution: "Anjuman-I-Islam's Akbar Peerbhoy College", category: "Patrons", displayOrder: 1 },
    { name: "Mr Rustom N. Jeejeebhoy", designation: "Trustee", institution: "Byramjee Jeejeebhoy College of Commerce, Mumbai", category: "Patrons", displayOrder: 2 },

    { name: "Dr. Ravindra Bambardekar", designation: "Dean, Faculty of Commerce", institution: "", category: "Advisory Committee", displayOrder: 1 },
    { name: "Dr. Kishori Bhagat", designation: "Associate Dean, Faculty of Commerce", institution: "", category: "Advisory Committee", displayOrder: 2 },
    { name: "Dr Gurudutta Japee", designation: "Professor & Head, Advanced Business Studies", institution: "Gujarat University", category: "Advisory Committee", displayOrder: 3 },
    { name: "Dr Jitendra Aherkar", designation: "Dean of Humanities and Social Sciences", institution: "Atmiya University, Rajkot, Gujarat", category: "Advisory Committee", displayOrder: 4 },
    { name: "Dr. Atul Salunke", designation: "Principal", institution: "KES Dr C.D. Deshmukh Com. & Sau. K. G. Tamhane Arts College, Pingalsai, Raigad", category: "Advisory Committee", displayOrder: 5 },
    { name: "Dr Raj Ankush Shoshte", designation: "Principal", institution: "NSS College, Mumbai", category: "Advisory Committee", displayOrder: 6 },
    { name: "Dr. Kuldeep S. Sharma", designation: "Asst. Professor & Secretary ICA", institution: "K.P.B Hinduja College", category: "Advisory Committee", displayOrder: 7 },

    { name: "Prof. Dr Shaukat Ali", designation: "Principal", institution: "AI's Akbar Peerbhoy College", category: "Conference Chairperson", displayOrder: 1 },
    { name: "Prof. Nilesh Ghonasgi", designation: "I/C Principal", institution: "Byramjee Jeejibhoy College", category: "Conference Chairperson", displayOrder: 2 },

    { name: "Prof. Kirti Menghani", designation: "IQAC Coordinator", institution: "", category: "IQAC Coordinators", displayOrder: 1 },
    { name: "Dr Jay Mamtora", designation: "IQAC Coordinator", institution: "", category: "IQAC Coordinators", displayOrder: 2 },

    { name: "Prof. Hemanth Jonnala", designation: "Conference Coordinator", institution: "", category: "Conference Coordinators", displayOrder: 1 },
    { name: "Dr Vaishali Nadkarni", designation: "Conference Coordinator", institution: "", category: "Conference Coordinators", displayOrder: 2 },

    { name: "Dr. Rajesh Bhoite", designation: "Conference Secretary (8976036046)", institution: "", category: "Conference Secretary", displayOrder: 1 },
    { name: "Dr. Balram Gowda", designation: "Conference Secretary (9820304986)", institution: "", category: "Conference Secretary", displayOrder: 2 },

    { name: "Dr Hanif Lakdawala", designation: "Director, Professional Section", institution: "AP College", category: "Organising Committee", displayOrder: 1 },
    { name: "Mrs Vaishali Mhatre", designation: "Administrative Head", institution: "BJCC College", category: "Organising Committee", displayOrder: 2 },
    { name: "Dr. Mohd. Anzar", designation: "", institution: "", category: "Organising Committee", displayOrder: 3 },
    { name: "Prof. Mohd. Arif", designation: "", institution: "", category: "Organising Committee", displayOrder: 4 },
    { name: "Mrs Amita Kulkarni", designation: "", institution: "BJCC College", category: "Organising Committee", displayOrder: 5 },
    { name: "Miss Parinaz Masalawala", designation: "", institution: "", category: "Organising Committee", displayOrder: 6 },
    { name: "Mrs Parizad Bhesania", designation: "", institution: "", category: "Organising Committee", displayOrder: 7 },

    { name: "Dr. Ahtesham Shaikh", designation: "", institution: "", category: "Technical Committee", displayOrder: 1 },
    { name: "Dr. Abdul Sadique", designation: "", institution: "", category: "Technical Committee", displayOrder: 2 },
    { name: "Mr. Altaf Chaugule", designation: "", institution: "", category: "Technical Committee", displayOrder: 3 },
    { name: "Mr. Numan Khan", designation: "", institution: "", category: "Technical Committee", displayOrder: 4 },
    { name: "Vaishali Pawar", designation: "", institution: "", category: "Technical Committee", displayOrder: 5 },
    { name: "Prof. Hussain Ali", designation: "", institution: "", category: "Technical Committee", displayOrder: 6 },
    { name: "Prof Shahid Parvez", designation: "", institution: "", category: "Technical Committee", displayOrder: 7 },
    { name: "Yunus Gangat", designation: "", institution: "", category: "Technical Committee", displayOrder: 8 },

    { name: "Dr Basuki Nath Jha", designation: "", institution: "", category: "Editorial Committee", displayOrder: 1 },
    { name: "Dr Salim Khan", designation: "", institution: "", category: "Editorial Committee", displayOrder: 2 },
    { name: "Prof. Sameer Naik", designation: "", institution: "", category: "Editorial Committee", displayOrder: 3 },
    { name: "Prof. Kashish Malik", designation: "", institution: "", category: "Editorial Committee", displayOrder: 4 },
    { name: "Miss Khyatee Lakhani", designation: "", institution: "", category: "Editorial Committee", displayOrder: 5 },
    { name: "Dr Bhalchandra Karbhari", designation: "", institution: "", category: "Editorial Committee", displayOrder: 6 },
    { name: "Dr. Abbas Rizvi", designation: "", institution: "", category: "Editorial Committee", displayOrder: 7 },
    { name: "Dr Kirtikumar Pimpliskar", designation: "", institution: "", category: "Editorial Committee", displayOrder: 8 },
    { name: "Dr. Smita Salunke", designation: "", institution: "", category: "Editorial Committee", displayOrder: 9 },
    { name: "Prof. Vaishali Bankar", designation: "", institution: "", category: "Editorial Committee", displayOrder: 10 },
    { name: "Prof. Haya Shaikh", designation: "", institution: "", category: "Editorial Committee", displayOrder: 11 },
    { name: "Prof. Sadaf Shaikh", designation: "", institution: "", category: "Editorial Committee", displayOrder: 12 },
  ];

  for (const member of bjccCommittee) {
    const id = `${BJCC_ID}-${member.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${member.displayOrder}`;
    await upsert("committees", id, { ...member, conferenceId: BJCC_ID, createdAt: FieldValue.serverTimestamp() });
  }

  await upsert("media", `${BJCC_ID}-poster`, { title: "BJCC & APCC Conference Poster", type: "poster", url: "/images/bjcc-apcc-conference-poster.jpg", conferenceId: BJCC_ID, createdAt: FieldValue.serverTimestamp() });
  await upsert("media", `${BJCC_ID}-brochure`, { title: "BJCC & APCC Conference Brochure", type: "brochure", url: "/documents/bjcc-apcc-conference-2026-brochure.pdf", conferenceId: BJCC_ID, createdAt: FieldValue.serverTimestamp() });
  console.log("");
}

async function seedTmvConference() {
  console.log("Seeding TMV Lokmanya Tilak Law College conference...");
  await upsert("conferences", TMV_ID, {
    title: "Emerging Dimensions of Human Rights and Constitutionalism",
    theme: "Emerging Dimensions of Human Rights and Constitutionalism",
    description:
      "The rapid transformation of society, governance, and technology has led to the continuous evolution of human rights and constitutional principles. Contemporary challenges such as digital surveillance, social inequality, environmental degradation, gender justice, access to justice, and democratic accountability demand a renewed understanding of constitutionalism rooted in human dignity, liberty, and equality. The theme explores how constitutional frameworks respond to changing social realities while safeguarding fundamental rights and the rule of law, encouraging critical engagement with evolving interpretations of constitutional morality, judicial activism, participatory democracy, and the expanding scope of human rights in both national and international contexts. This conference aims to provide an interdisciplinary platform for scholars, legal practitioners, and academicians to discuss contemporary human rights concerns and the dynamic role of constitutionalism in ensuring justice, inclusivity, and accountable governance in a rapidly changing world.",

    date: "2026-02-28",
    startTime: "",
    endTime: "",

    venue: "3rd Floor, Seminar Hall, Tilak Maharashtra Vidyapeeth",
    address: "Tilak Maharashtra Vidyapeeth, Kharghar, Navi Mumbai - 410210",
    city: "Navi Mumbai",
    state: "Maharashtra",

    mode: "hybrid",

    organizer: "TMV's Lokmanya Tilak Law College, Kharghar, Navi Mumbai",
    coOrganizer: "Tilak Maharashtra Vidyapeeth (Deemed to be University)",

    subtitle: FieldValue.delete(),
    bannerUrl: FieldValue.delete(),
    posterUrl: FieldValue.delete(),

    brochureUrl: "/documents/tmv-lokmanya-tilak-law-conference-2026-brochure.pdf",

    registrationUrl: "https://forms.gle/x5YymmUovMqiY88e6",
    paperSubmissionUrl: null,
    whatsappUrl: "https://chat.whatsapp.com/BDaYrm5KdN74tJTv4d3Y5R",
    whatsappNumber: "918390984760",
    websiteUrl: null,

    contactEmail: "tmvlawconference2026@gmail.com",
    contactPhone: "8291968765",

    objectives: [],
    tracks: [],

    subThemes: [
      {
        id: "st-sessions",
        category: "Session Themes (Panel Discussion)",
        items: [
          "Constitutional Morality and Democratic Governance",
          "Evolving Interpretation of Fundamental Rights",
          "Human Rights in the Digital and Technological Era",
          "Access to Justice and Protection of Vulnerable Groups",
          "Environmental Constitutionalism and Human Rights",
          "Judicial Role in Strengthening Constitutionalism",
        ],
      },
      {
        id: "st-cfp",
        category: "Call for Papers (Sub-Themes)",
        items: [
          "Rights of Women, Children, and LGBTQ+ Communities",
          "Judicial Activism vs. Judicial Restraint in Protecting Fundamental Rights",
          "Minority Rights and Social Justice in a Diverse Democracy",
          "International Human Rights Norms and India's Commitment",
          "Same-Sex Marriage and Recognition of Queer Relationships in India",
          "Citizenship, Migration, and Refugee Rights in Contemporary India",
          "Hate Speech, Freedom of Expression, and Constitutional Limits",
          "Digital Surveillance, Artificial Intelligence (AI), and Human Rights Concerns",
          "Rights of Persons with Disabilities: Accessibility and Inclusion",
          "Sustainable Development and Social Justice",
          "Medical Negligence as violation of the right to life & health",
          "Impact of Bio medical waste on environment degradation",
          "Mental health parity laws: Improving access to mental health services",
          "Shifting perspective towards gender laws",
          "Bioethics, Health Policy, and the Right to Health",
          "Human Rights Education and Social Empowerment",
          "International Human Rights Regimes and Global Constitutionalism",
          "Youth, Digital Culture, and Human Rights Awareness",
          "Criminal Justice Reforms and Human Rights",
          "Gender, Sexuality, and Evolving Human Rights Discourse",
          "Freedom of Expression in the Digital Era",
        ],
      },
      {
        id: "st-health-policy",
        category: "For Political Science, Social Science, Psychology, Public Policy, and Health Sciences",
        items: [
          "Public Health Policies, Human Rights, and the Constitution (Role of public health governance)",
          "Role of Civil Society and NGOs in Protecting Human Rights (Community-based interventions, grassroots human rights activism)",
          "Gender-Sensitive Healthcare and Reproductive Rights (Access to reproductive health services, abortion rights, menstrual health rights)",
          "Ageing Population, Elder Rights, and Social Security Laws (Welfare schemes, elder abuse laws, pension rights)",
          "Substance Abuse, Rehabilitation Rights, and Public Welfare (Human rights approach to addiction, decriminalisation debates)",
          "Intersectionality and Inclusive Policy-Making (Caste, gender, disability, class, and identity-based discrimination)",
          "Right to Health and Affordable Medicine: Constitutional Perspectives (Drug pricing, essential medicines, generic drug policies)",
          "Human Rights in Disaster Management and Climate-Induced Migration (NDMA policies, rights during evacuation, relief)",
        ],
      },
    ],

    registrationFees: [
      { category: "Academicians / Research Scholars / Faculty", amount: 1400, currency: "INR", notes: "Including publication charges" },
      { category: "Student", amount: 400, currency: "INR", notes: "Only for attendance" },
      { category: "Only Offline Presentation", amount: 800, currency: "INR", notes: "" },
    ],

    importantDates: [
      { label: "Last date of submission of full research paper", date: "2026-02-19" },
      { label: "Conference Date", date: "2026-02-28" },
    ],

    paperGuidelines: {
      font: "Times New Roman (English); APS-DV-Priyanka / DVBW-TTSurekh (ISM V6) / Unicode / Mangal / Kokila (Marathi or Hindi)",
      fontSize: "12pt (footnotes 10pt)",
      lineSpacing: "1.5",
      fileFormat: "Microsoft Word",
      marginLeft: "Standard",
      marginRight: "Standard",
      maxWords: "2000 to 2500 (including abstract)",
      requiredFields: ["Title", "Author name(s)", "Mobile number", "Email ID"],
      referenceStyle: "APA",
      plagiarismLimit: "",
      submissionNote:
        "The manuscript must be original and not published earlier in any form, and submitted exclusively for this conference to tmvlawconference2026@gmail.com.",
      awards: "",
      journalName: "GENIUS",
      journalIssn: "2278-0489",
      journalImpactFactor: "7.508 (UGC-listed, Journal No. 47100)",
    },

    paymentInformation: {
      accountName: "Ajanta Prakashan",
      accountNumber: "32856592267",
      bank: "State Bank of India",
      branch: "Samarth Nagar, Chhatrapati Sambhajinagar, Maharashtra",
      ifsc: "SBIN0007919",
      paymentQrUrl: "/images/tmv-payment-qr.png",
      upiMobile: "9822620877",
      notes: "Google Pay / PhonePe accepted at 9822620877 (Ajanta Prakashan). For paper publication and payment queries, call Mr Gaurav Kumawat - 8390984760.",
    },

    status: "published",
    createdAt: FieldValue.serverTimestamp(),
  });

  const tmvCommittee: { name: string; designation: string; institution: string; category: string; displayOrder: number }[] = [
    { name: "Dr. Rohit Tilak", designation: "Hon'ble President", institution: "Tilak Maharashtra Vidyapeeth Trust, Pune", category: "Patrons", displayOrder: 1 },
    { name: "Dr. Geetali Tilak", designation: "Hon'ble Vice-Chancellor", institution: "Tilak Maharashtra Vidyapeeth Trust, Pune", category: "Patrons", displayOrder: 2 },
    { name: "Dr. Pranati Tilak", designation: "Hon'ble Vice-President", institution: "Tilak Maharashtra Vidyapeeth Trust, Pune", category: "Patrons", displayOrder: 3 },
    { name: "Adv. Harshad Nimbalkar", designation: "Dean, Law Department, TMV; Chairman, Bar Council of Maharashtra and Goa", institution: "Tilak Maharashtra Vidyapeeth, Pune", category: "Patrons", displayOrder: 4 },
    { name: "Dr. Ketki Dalvi", designation: "Co-Patron; I/C Principal & HOD", institution: "Lokmanya Tilak Law College, TMV, Pune", category: "Patrons", displayOrder: 5 },

    { name: "Asso. Prof. Varsha Badwe", designation: "Convener, Coordinator", institution: "TMV's Lokmanya Tilak Law College", category: "Conference Chairperson", displayOrder: 1 },
    { name: "Asso. Prof. Dr. Gauri Kala", designation: "Co-Convener, LLM Coordinator", institution: "TMV's Lokmanya Tilak Law College", category: "Conference Chairperson", displayOrder: 2 },

    { name: "Asst. Prof. Sonali Sharma", designation: "Conference Coordinator (9967009879)", institution: "", category: "Conference Coordinators", displayOrder: 1 },
    { name: "Asst. Prof. Kalichand Govardhan", designation: "Conference Coordinator (8692063678)", institution: "", category: "Conference Coordinators", displayOrder: 2 },

    { name: "Asst. Prof. Smita Bansode", designation: "Faculty Committee", institution: "", category: "Organising Committee", displayOrder: 1 },
    { name: "Asst. Prof. Sapana Jaiswal", designation: "Faculty Committee", institution: "", category: "Organising Committee", displayOrder: 2 },
    { name: "Asst. Prof. Disha Sharma", designation: "Faculty Committee", institution: "", category: "Organising Committee", displayOrder: 3 },
    { name: "Asst. Prof. Mayuri Raut", designation: "Faculty Committee", institution: "", category: "Organising Committee", displayOrder: 4 },
    { name: "Asst. Prof. Prajakta Balveer", designation: "Faculty Committee", institution: "", category: "Organising Committee", displayOrder: 5 },
  ];

  for (const member of tmvCommittee) {
    const id = `${TMV_ID}-${member.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${member.displayOrder}`;
    await upsert("committees", id, { ...member, conferenceId: TMV_ID, createdAt: FieldValue.serverTimestamp() });
  }

  await upsert("media", `${TMV_ID}-poster`, { title: "TMV Law Conference Poster", type: "poster", url: "/images/tmv-law-conference-poster.jpg", conferenceId: TMV_ID, createdAt: FieldValue.serverTimestamp() });
  await upsert("media", `${TMV_ID}-brochure`, { title: "TMV Law Conference Brochure", type: "brochure", url: "/documents/tmv-lokmanya-tilak-law-conference-2026-brochure.pdf", conferenceId: TMV_ID, createdAt: FieldValue.serverTimestamp() });
  await upsert("media", `${TMV_ID}-payment-qr`, { title: "TMV Conference Payment QR", type: "payment_qr", url: "/images/tmv-payment-qr.png", conferenceId: TMV_ID, createdAt: FieldValue.serverTimestamp() });
  console.log("");
}

async function main() {
  await seedSettings();
  await seedBjccConference();
  await seedTmvConference();
  console.log("Seed complete. Remember: this seeds Firestore only — no Firebase Storage was used.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
