export interface ServiceDetailConfig {
  name: string;
  formValue?: string;
  overview: {
    what: string;
    who: string;
    why: string;
    how: string;
  };
  problems: { title: string; desc: string }[];
  features: { title: string; desc: string }[];
  benefits: { title: string; desc: string }[];
  industries: string[];
  techStack: string[];
  faqs: { question: string; answer: string }[];
}

const defaultIndustries = [
  "Healthcare", "Education", "Finance", "Retail", "Manufacturing", 
  "Hospitality", "Real Estate", "Professional Services", "Startups", 
  "SMEs", "Enterprise Businesses"
];

const defaultFaqs = [
  { question: "How long does development take?", answer: "Timelines depend entirely on the scope and complexity of the project. We provide clear, transparent timelines after our initial discovery phase." },
  { question: "Can this integrate with existing systems?", answer: "Yes, our solutions are designed to integrate seamlessly with your existing software via APIs and custom integrations." },
  { question: "Do you provide maintenance?", answer: "Absolutely. We offer long-term support and maintenance after launch to ensure your systems remain secure, up-to-date, and continue to perform optimally as your business grows." },
  { question: "Can features be customized?", answer: "Yes, every service is fully customizable. We build solutions tailored exactly to your business goals, operational challenges, and brand identity." },
  { question: "What industries do you serve?", answer: "We serve a diverse range of industries including healthcare, education, finance, retail, manufacturing, hospitality, real estate, professional services, startups, SMEs, and enterprises." }
];

export function getServiceDetails(serviceName: string, serviceAnchorSlug: string): ServiceDetailConfig {
  
  // Specific Overrides for the 13 Featured Services
  const overrides: Record<string, Partial<ServiceDetailConfig>> = {
    "ai-customer-support-chatbots": {
      overview: {
        what: "Intelligent, conversational AI assistants designed to handle customer support inquiries instantly across multiple channels.",
        who: "Customer-centric businesses, e-commerce platforms, service providers, and enterprises managing high query volumes.",
        why: "Customers demand instant resolutions. Delays in support lead to dissatisfaction and lost sales, while scaling human teams linearly is cost-prohibitive.",
        how: "We build custom, context-aware chatbots trained securely on your company data, integrated smoothly into your website and support platforms."
      },
      problems: [
        { title: "Slow Response Times", desc: "Customers abandoning purchases due to long wait times for basic inquiries." },
        { title: "High Support Costs", desc: "Rising operational expenses from hiring large tier-1 support teams." },
        { title: "Inconsistent Answers", desc: "Human errors leading to conflicting information given to customers." },
        { title: "Limited Availability", desc: "Losing potential leads outside of standard business hours." }
      ],
      features: [
        { title: "24/7 Availability", desc: "Provide uninterrupted support across all time zones." },
        { title: "Natural Language Processing", desc: "Understand context, intent, and sentiment like a human agent." },
        { title: "Human Handoff", desc: "Seamlessly escalate complex issues to human representatives." },
        { title: "Multi-Channel Integration", desc: "Deploy across website, WhatsApp, SMS, and social media." },
        { title: "Custom Knowledge Base", desc: "Train the bot exclusively on your FAQs and documents." },
        { title: "Analytics Dashboard", desc: "Track conversation metrics, resolution rates, and user satisfaction." }
      ],
      benefits: [
        { title: "Reduce Operational Costs", desc: "Automate routine inquiries so your team focuses on complex cases." },
        { title: "Instant Resolutions", desc: "Provide answers in seconds, improving customer satisfaction." },
        { title: "Scalable Support", desc: "Handle unlimited simultaneous conversations during traffic spikes." },
        { title: "Data-Driven Insights", desc: "Identify common customer pain points through chat analytics." },
        { title: "Higher Conversion Rates", desc: "Assist customers mid-purchase to prevent cart abandonment." },
        { title: "Consistent Brand Voice", desc: "Ensure every interaction aligns perfectly with your brand tone." }
      ],
      techStack: ["OpenAI", "Anthropic", "Python", "Node.js", "TypeScript", "React"],
    },
    "ai-voice-agents-virtual-receptionists": {
      overview: {
        what: "Lifelike AI voice assistants that answer incoming phone calls, route inquiries, and book appointments autonomously.",
        who: "Medical clinics, real estate firms, legal practices, and service businesses that receive high call volumes.",
        why: "Missed calls are missed revenue. Busy front desks often put callers on hold, leading to a poor first impression and lost business.",
        how: "We deploy advanced voice AI models that answer calls natively, understand natural speech, and interact directly with your calendar and CRM."
      },
      problems: [
        { title: "Missed Calls", desc: "Losing potential clients because the phone lines are busy or unanswered." },
        { title: "Overwhelmed Staff", desc: "Front desk employees distracted by answering basic questions." },
        { title: "Costly After-Hours Service", desc: "Paying premium rates for traditional human answering services." },
        { title: "Manual Data Entry", desc: "Typing caller details into CRMs and calendars repeatedly." }
      ],
      features: [
        { title: "Call Automation", desc: "Answer multiple incoming calls simultaneously without queues." },
        { title: "Appointment Booking", desc: "Check availability and schedule meetings directly into your calendar." },
        { title: "Voice AI", desc: "Ultra-realistic voices that sound professional and empathetic." },
        { title: "Professional Reception", desc: "Greet callers using your exact brand scripts and policies." },
        { title: "Call Routing", desc: "Transfer urgent or complex calls to the correct human department." },
        { title: "Automated Logging", desc: "Transcribe calls and log summaries directly into your CRM." }
      ],
      benefits: [
        { title: "Capture Every Lead", desc: "Never miss another call, even during peak hours or holidays." },
        { title: "Improve Customer Satisfaction", desc: "Eliminate hold times and provide instant, polite assistance." },
        { title: "Reduce Costs", desc: "Lower overhead compared to hiring dedicated reception staff." },
        { title: "Faster Response Times", desc: "Immediate call pick-up with zero queueing." },
        { title: "Increase Productivity", desc: "Allow in-house staff to focus on high-value tasks." },
        { title: "Business Growth", desc: "Turn after-hours inquiries into confirmed appointments." }
      ],
      techStack: ["OpenAI", "Node.js", "Python", "React", "PostgreSQL", "AWS"],
    },
    "ai-lead-generation-sales-assistants": {
      overview: {
        what: "Intelligent digital assistants that engage visitors, qualify prospects, and nurture leads automatically to accelerate the sales cycle.",
        who: "B2B companies, high-ticket service providers, SaaS platforms, and digital marketing agencies.",
        why: "Generating traffic is expensive, but converting it is difficult. Manual qualification is slow, allowing hot leads to go cold before sales reps can reach them.",
        how: "We implement AI agents that proactively engage website visitors, ask qualifying questions, and seamlessly hand off high-value prospects to your sales team."
      },
      problems: [
        { title: "Poor Lead Conversion", desc: "High website traffic failing to convert into actionable sales leads." },
        { title: "Slow Follow-Up", desc: "Leads cooling off because sales reps cannot respond instantly." },
        { title: "Unqualified Prospects", desc: "Sales teams wasting time on calls with poor-fit leads." },
        { title: "Manual Outreach", desc: "Inefficient, time-consuming manual emailing and follow-ups." }
      ],
      features: [
        { title: "Lead Qualification", desc: "Ask specific questions to score leads based on budget and need." },
        { title: "CRM Integration", desc: "Automatically create and update records in Hubspot, Salesforce, etc." },
        { title: "Sales Automation", desc: "Trigger personalized follow-up sequences based on user intent." },
        { title: "Proactive Engagement", desc: "Initiate conversations based on visitor behavior and time-on-page." },
        { title: "Meeting Scheduling", desc: "Book discovery calls directly onto sales reps' calendars." },
        { title: "Data Enrichment", desc: "Gather missing lead details by intelligently referencing data sources." }
      ],
      benefits: [
        { title: "Higher Conversion", desc: "Turn passive website visitors into active sales conversations." },
        { title: "Better Decision Making", desc: "Prioritize sales efforts on pre-qualified, high-intent leads." },
        { title: "Faster Response Times", desc: "Engage prospects at the exact moment of their highest interest." },
        { title: "Increase Productivity", desc: "Free sales teams from prospecting to focus on closing deals." },
        { title: "Business Growth", desc: "Scale outbound and inbound sales efforts without adding headcount." },
        { title: "Reduce Costs", desc: "Lower the overall customer acquisition cost." }
      ],
      techStack: ["Anthropic", "OpenAI", "Node.js", "TypeScript", "PostgreSQL", "React"],
    },
    "company-knowledge-base-assistants": {
      overview: {
        what: "Secure internal AI search tools that instantly retrieve accurate answers from your organization's scattered documents, policies, and wikis.",
        who: "Growing enterprises, remote teams, HR departments, and companies with extensive compliance or technical documentation.",
        why: "Employees spend hours searching for information across multiple platforms or repeatedly asking colleagues the same questions, causing massive productivity loss.",
        how: "We ingest your company data into secure vector databases, powering an AI assistant that cites exact sources for every answer it provides."
      },
      problems: [
        { title: "Low Productivity", desc: "Employees wasting hours weekly searching for internal information." },
        { title: "Disconnected Systems", desc: "Knowledge scattered across Google Drive, Notion, Slack, and emails." },
        { title: "Knowledge Silos", desc: "Critical information locked inside the minds of a few key personnel." },
        { title: "Slow Onboarding", desc: "New hires struggling to navigate complex company protocols." }
      ],
      features: [
        { title: "Instant Search", desc: "Find exact answers instead of just a list of related documents." },
        { title: "Document Intelligence", desc: "Process PDFs, Word docs, spreadsheets, and intranet wikis." },
        { title: "Knowledge Management", desc: "Identify gaps in your internal documentation automatically." },
        { title: "Source Citations", desc: "Provide direct links to the source documents for verification." },
        { title: "Enterprise Security", desc: "Strict access controls ensuring users only see what they are allowed to." },
        { title: "Multi-format Support", desc: "Extract insights from text, tables, and complex technical manuals." }
      ],
      benefits: [
        { title: "Employee Productivity", desc: "Reduce search time from hours to seconds." },
        { title: "Reduce Costs", desc: "Minimize time wasted on repetitive internal support requests." },
        { title: "Faster Response Times", desc: "Empower staff to resolve client issues instantly with accurate info." },
        { title: "Better Decision Making", desc: "Ensure decisions are based on the latest, approved company policies." },
        { title: "Scalable Infrastructure", desc: "Handle unlimited internal queries as your team grows." },
        { title: "Seamless Onboarding", desc: "Help new hires become productive faster." }
      ],
      techStack: ["Python", "PostgreSQL", "OpenAI", "Node.js", "AWS", "React"],
    },
    "business-workflow-automation": {
      overview: {
        what: "End-to-end automation of repetitive business processes, connecting disjointed software to eliminate manual data entry and human error.",
        who: "Operations managers, finance teams, logistics companies, and businesses scaling faster than their current processes can handle.",
        why: "Manual data transfer between systems is slow, expensive, and prone to errors. It prevents skilled employees from doing actual strategic work.",
        how: "We map your operational bottlenecks, design optimized workflows, and build custom scripts and API integrations to make the software do the work."
      },
      problems: [
        { title: "Manual Work", desc: "Copy-pasting data between CRMs, spreadsheets, and accounting tools." },
        { title: "Disconnected Systems", desc: "Software platforms that do not communicate natively." },
        { title: "High Operational Cost", desc: "Paying staff to perform repetitive, low-value administrative tasks." },
        { title: "Data Errors", desc: "Human mistakes in data entry causing downstream financial or operational issues." }
      ],
      features: [
        { title: "AI Automation", desc: "Incorporate intelligent routing and data extraction into workflows." },
        { title: "Easy Integration", desc: "Connect modern SaaS tools with legacy on-premise systems." },
        { title: "Analytics", desc: "Monitor workflow performance and catch bottlenecks in real time." },
        { title: "Custom Triggers", desc: "Initiate complex sequences based on specific business events." },
        { title: "Secure Architecture", desc: "Ensure sensitive data is encrypted during transfer." },
        { title: "Error Handling", desc: "Robust fallback mechanisms to alert staff if an automated step fails." }
      ],
      benefits: [
        { title: "Increase Productivity", desc: "Execute multi-step processes instantly and autonomously." },
        { title: "Reduce Costs", desc: "Eliminate the need for costly manual data entry roles." },
        { title: "Scalable Infrastructure", desc: "Process 10 or 10,000 transactions without additional overhead." },
        { title: "Faster Response Times", desc: "Accelerate order processing, approvals, and reporting." },
        { title: "Improve Customer Satisfaction", desc: "Deliver faster, error-free service to your end clients." },
        { title: "Better Decision Making", desc: "Ensure management is looking at up-to-the-minute, accurate data." }
      ],
      techStack: ["Node.js", "Python", "PostgreSQL", "AWS", "TypeScript", "MongoDB"],
    },
    "ai-powered-website-development": {
      overview: {
        what: "Premium, high-performance websites engineered for speed, SEO, and conversions, enhanced with intelligent AI features.",
        who: "Ambitious brands, tech companies, and enterprises needing a web presence that acts as a powerful growth engine.",
        why: "A slow, outdated website damages brand trust and costs you customers. Modern users expect fast loading, personalization, and seamless experiences.",
        how: "We build headless architectures using Next.js and React, combining stunning design with dynamic AI capabilities like personalization and smart search."
      },
      problems: [
        { title: "Poor Lead Conversion", desc: "High bounce rates caused by confusing navigation and slow load times." },
        { title: "Manual Work", desc: "Content management systems that are difficult for marketing teams to update." },
        { title: "Limited Scalability", desc: "Websites that crash or slow down significantly during traffic spikes." },
        { title: "Disconnected Systems", desc: "Web forms that fail to sync properly with backend sales systems." }
      ],
      features: [
        { title: "Fast Performance", desc: "Sub-second page loads engineered to pass Core Web Vitals." },
        { title: "Responsive Design", desc: "Pixel-perfect layouts across mobile, tablet, and ultra-wide screens." },
        { title: "Enterprise Grade", desc: "Robust headless CMS architectures for secure content management." },
        { title: "AI Automation", desc: "Smart content recommendations and dynamic personalization." },
        { title: "Analytics", desc: "Deep integration with tracking tools for complete user journey visibility." },
        { title: "Easy Integration", desc: "Seamless connections to your marketing, sales, and support stacks." }
      ],
      benefits: [
        { title: "Business Growth", desc: "Turn your website into an aggressive, automated lead generation tool." },
        { title: "Improve Customer Satisfaction", desc: "Deliver a smooth, premium digital experience to every visitor." },
        { title: "Increase Productivity", desc: "Empower marketing teams to publish changes without developer help." },
        { title: "Scalable Infrastructure", desc: "Host on edge networks capable of handling massive global traffic." },
        { title: "Reduce Costs", desc: "Lower server expenses through modern static and edge rendering." },
        { title: "Better Decision Making", desc: "Gather precise data on how users interact with your digital brand." }
      ],
      techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "Node.js"],
    },
    "custom-application-development": {
      overview: {
        what: "Bespoke, secure web and mobile applications designed from the ground up to solve your unique operational challenges.",
        who: "Startups building SaaS products, and enterprises replacing legacy software with modern custom solutions.",
        why: "Off-the-shelf software forces businesses to change their workflows to fit the tool. When generic tools fail, you need software built for your exact processes.",
        how: "We utilize clean architecture and scalable tech stacks to deliver custom software that is robust, maintainable, and perfectly aligned with your business logic."
      },
      problems: [
        { title: "Disconnected Systems", desc: "Relying on a patchwork of software tools that don't share data." },
        { title: "Limited Scalability", desc: "Current applications crashing under the weight of growing user bases." },
        { title: "Manual Work", desc: "Employees employing complex workarounds for missing software features." },
        { title: "High Operational Cost", desc: "Paying expensive recurring licensing fees for bloated enterprise software." }
      ],
      features: [
        { title: "Enterprise Grade", desc: "Microservices or robust monolith architectures designed for scale." },
        { title: "Secure Architecture", desc: "Implement rigorous authentication, authorization, and data encryption." },
        { title: "Cloud Ready", desc: "Built to deploy seamlessly on AWS, Google Cloud, or custom infrastructure." },
        { title: "Responsive Design", desc: "Interfaces that function powerfully on desktop and mobile browsers." },
        { title: "Easy Integration", desc: "Custom APIs built to communicate securely with third-party vendors." },
        { title: "Analytics", desc: "Custom administrative dashboards for deep operational visibility." }
      ],
      benefits: [
        { title: "Scalable Infrastructure", desc: "Grow your user base exponentially without major system rewrites." },
        { title: "Increase Productivity", desc: "Provide employees with software tailored exactly to their tasks." },
        { title: "Better Decision Making", desc: "Centralize your company's data into a single, reliable source of truth." },
        { title: "Reduce Costs", desc: "Eliminate expensive per-seat licenses of off-the-shelf platforms." },
        { title: "Business Growth", desc: "Launch new digital products and services rapidly." },
        { title: "Improve Customer Satisfaction", desc: "Deliver seamless digital portals for your end-clients." }
      ],
      techStack: ["React", "Node.js", "PostgreSQL", "Docker", "AWS", "TypeScript"],
    },
    "brand-identity-graphic-design": {
      overview: {
        what: "Comprehensive visual identity systems and premium graphic design that ensure your business looks as professional as the services it provides.",
        who: "New startups requiring a foundational identity, and established companies undergoing rebranding or modernization.",
        why: "Visual identity dictates market positioning. An inconsistent or amateur design language undermines trust and forces you to compete on price rather than value.",
        how: "We combine strategic brand positioning with premium aesthetics to create logos, typography systems, and marketing collateral that command respect."
      },
      problems: [
        { title: "Poor Lead Conversion", desc: "Losing potential clients because your visual presence fails to build trust." },
        { title: "Disconnected Systems", desc: "A chaotic mix of different fonts, colors, and styles across platforms." },
        { title: "Low Productivity", desc: "Teams wasting time recreating assets because no central design system exists." },
        { title: "Limited Scalability", desc: "A brand identity that worked locally but fails to translate to a larger market." }
      ],
      features: [
        { title: "Responsive Design", desc: "Logos and assets that adapt perfectly from mobile screens to billboards." },
        { title: "Enterprise Grade", desc: "Comprehensive brand guidelines ensuring consistency across all departments." },
        { title: "AI Automation", desc: "Leveraging generative tools to rapid-prototype visual concepts." },
        { title: "Easy Integration", desc: "Delivering assets optimized natively for all social and web platforms." },
        { title: "Visual Architecture", desc: "Structured typography and color systems that dictate hierarchy." },
        { title: "Custom Iconography", desc: "Unique graphic elements tailored to your specific industry." }
      ],
      benefits: [
        { title: "Business Growth", desc: "Command premium pricing by presenting a high-value corporate image." },
        { title: "Improve Customer Satisfaction", desc: "Create intuitive, visually pleasing touchpoints across the customer journey." },
        { title: "Increase Productivity", desc: "Empower marketing with ready-to-use, on-brand templates." },
        { title: "Reduce Costs", desc: "Minimize external agency fees by bringing a solid design system in-house." },
        { title: "Consistent Branding", desc: "Ensure marketing, sales, and product teams speak the same visual language." },
        { title: "Stronger Market Position", desc: "Stand out distinctly from competitors with a memorable identity." }
      ],
      techStack: ["Tailwind CSS", "React", "Next.js", "OpenAI"],
    },
    "ai-image-solutions": {
      overview: {
        what: "High-quality, bespoke visual assets generated through advanced AI models, offering studio-grade imagery without the traditional production costs.",
        who: "E-commerce brands, marketing agencies, content creators, and businesses requiring volume visual assets.",
        why: "Traditional photoshoots are expensive, slow, and inflexible. Relying on stock photography dilutes your brand and fails to capture your unique product narrative.",
        how: "We utilize advanced diffusion models and precise prompt engineering to generate, edit, and enhance hyper-realistic images and creative artwork."
      },
      problems: [
        { title: "High Operational Cost", desc: "Exorbitant fees for professional photographers, studios, and retouching." },
        { title: "Manual Work", desc: "Hours spent editing product backgrounds and correcting lighting." },
        { title: "Slow Response Times", desc: "Waiting weeks for visual assets needed for an immediate campaign." },
        { title: "Poor Lead Conversion", desc: "Generic stock images failing to capture audience attention." }
      ],
      features: [
        { title: "AI Automation", desc: "Generate variations of a core concept in seconds." },
        { title: "Enterprise Grade", desc: "High-resolution outputs suitable for both digital and print media." },
        { title: "Fast Performance", desc: "Rapid turnaround times from concept to finalized image." },
        { title: "Custom Training", desc: "Fine-tune models on your specific products to place them in any scenario." },
        { title: "Image Restoration", desc: "Enhance, upscale, and repair low-quality legacy assets." },
        { title: "Dynamic Backgrounds", desc: "Instantly swap environments for product photography." }
      ],
      benefits: [
        { title: "Reduce Costs", desc: "Cut visual production budgets by eliminating physical photoshoots." },
        { title: "Increase Productivity", desc: "Launch marketing campaigns faster with on-demand assets." },
        { title: "Business Growth", desc: "A/B test advertising creative aggressively with unlimited image variations." },
        { title: "Improve Customer Satisfaction", desc: "Provide clearer, highly aesthetic product representations." },
        { title: "Scalable Infrastructure", desc: "Generate thousands of catalog images without proportional effort." },
        { title: "Unique Branding", desc: "Stop using the same stock photos as your competitors." }
      ],
      techStack: ["OpenAI", "Python", "Docker", "AWS"],
    },
    "ai-video-cinematic-content": {
      overview: {
        what: "Compelling, AI-assisted video production and cinematic storytelling that elevates your brand's digital presence across platforms.",
        who: "Marketing teams, product companies, educators, and brands looking to dominate social media and advertising channels.",
        why: "Video is the highest-converting digital medium, but traditional video production is notoriously slow and budget-intensive, limiting how often you can publish.",
        how: "We blend AI video generation, automated editing, and intelligent motion graphics to produce cinematic content at a fraction of traditional timelines."
      },
      problems: [
        { title: "High Operational Cost", desc: "Prohibitive expenses associated with video agencies and film crews." },
        { title: "Manual Work", desc: "The tedious, time-consuming process of editing footage and adding subtitles." },
        { title: "Slow Response Times", desc: "Inability to react quickly to market trends with high-quality video." },
        { title: "Limited Scalability", desc: "Struggling to produce enough video content to feed modern social algorithms." }
      ],
      features: [
        { title: "AI Automation", desc: "Automated cutting, color grading, and subtitle generation." },
        { title: "Enterprise Grade", desc: "Cinematic 4K outputs optimized for professional broadcasting." },
        { title: "Fast Performance", desc: "Accelerated rendering and editing pipelines." },
        { title: "Dynamic Voiceovers", desc: "Studio-quality AI narration in multiple languages and accents." },
        { title: "Motion Graphics", desc: "Intelligent animations that bring static assets to life." },
        { title: "Format Adaptation", desc: "Automatically reframe videos for TikTok, YouTube, and LinkedIn." }
      ],
      benefits: [
        { title: "Reduce Costs", desc: "Achieve studio-quality production value on a digital budget." },
        { title: "Business Growth", desc: "Drive massive engagement through high-frequency video publishing." },
        { title: "Faster Response Times", desc: "Capitalize on emerging trends with rapid video deployment." },
        { title: "Increase Productivity", desc: "Free your marketing team from complex video editing software." },
        { title: "Improve Customer Satisfaction", desc: "Explain complex products simply through compelling visual storytelling." },
        { title: "Global Reach", desc: "Easily localize video content into multiple languages using AI dubbing." }
      ],
      techStack: ["OpenAI", "Anthropic", "Python", "AWS"],
    },
    "content-digital-marketing-creatives": {
      overview: {
        what: "Data-driven marketing collateral, compelling website copy, and ad creatives powered by AI to maximize engagement and return on ad spend.",
        who: "E-commerce brands, SaaS companies, and businesses aiming to scale their digital marketing efforts rapidly.",
        why: "Stagnant ad copy and repetitive creatives lead to ad fatigue and rising customer acquisition costs. Producing fresh, high-converting content consistently is a massive bottleneck.",
        how: "We use specialized AI models to analyze market trends, generate persuasive copy, and design high-impact visuals tailored to your audience."
      },
      problems: [
        { title: "Poor Lead Conversion", desc: "Marketing campaigns failing to resonate or drive measurable action." },
        { title: "Manual Work", desc: "Copywriters burning out trying to produce endless variations of ad text." },
        { title: "High Operational Cost", desc: "Spending heavily on agency retainers for routine social media management." },
        { title: "Disconnected Systems", desc: "Messaging that feels disjointed across email, social, and web channels." }
      ],
      features: [
        { title: "AI Automation", desc: "Generate dozens of ad copy variations for rapid A/B testing." },
        { title: "Analytics", desc: "Data-driven creative decisions based on historical performance." },
        { title: "Responsive Design", desc: "Creatives formatted perfectly for every specific ad network." },
        { title: "Enterprise Grade", desc: "High-quality, grammatically flawless, and brand-aligned writing." },
        { title: "SEO Optimization", desc: "Content structured intelligently to rank higher in search engines." },
        { title: "Campaign Strategy", desc: "Cohesive messaging mapped across the entire marketing funnel." }
      ],
      benefits: [
        { title: "Higher Conversion", desc: "Deploy scientifically structured copy designed to drive clicks." },
        { title: "Reduce Costs", desc: "Lower Cost Per Acquisition (CPA) through better creative relevance." },
        { title: "Increase Productivity", desc: "Generate a month's worth of content in a fraction of the time." },
        { title: "Business Growth", desc: "Scale ad spend confidently with winning creative combinations." },
        { title: "Faster Response Times", desc: "Launch new promotional campaigns overnight." },
        { title: "Consistent Brand Voice", desc: "Maintain absolute tonal consistency across thousands of assets." }
      ],
      techStack: ["OpenAI", "Anthropic", "Python", "React", "Next.js"],
    },
    "corporate-presentations-documentation": {
      overview: {
        what: "Premium, professionally crafted corporate presentations, pitch decks, and business documentation that communicate your value proposition clearly.",
        who: "Startups seeking funding, enterprises aligning stakeholders, and businesses communicating complex technical offerings.",
        why: "First impressions matter. Poorly designed documents obscure great ideas, cause confusion, and reduce credibility with investors and enterprise clients.",
        how: "We combine strategic content writing, clear information architecture, and premium graphic design to produce compelling, highly effective business collateral."
      },
      problems: [
        { title: "Manual Work", desc: "Executives wasting hours formatting slides instead of refining strategy." },
        { title: "Disconnected Systems", desc: "Disjointed visual identity across different company documents." },
        { title: "Poor Lead Conversion", desc: "Audiences losing interest or failing to understand complex proposals." },
        { title: "Low Productivity", desc: "Sales teams struggling to customize generic, unwieldy presentations." }
      ],
      features: [
        { title: "Responsive Design", desc: "Presentations optimized for boardroom screens and email attachments." },
        { title: "Enterprise Grade", desc: "Bespoke layouts tailored specifically to your corporate identity." },
        { title: "Data Visualization", desc: "Turning complex spreadsheets into clear, compelling infographics." },
        { title: "AI Automation", desc: "Assisted copywriting to refine messaging for maximum impact." },
        { title: "Information Architecture", desc: "Structuring content logically to support a strong narrative flow." },
        { title: "Reusable Assets", desc: "Delivering modular templates your team can easily adapt." }
      ],
      benefits: [
        { title: "Business Growth", desc: "Win more deals by presenting proposals that demonstrate premium quality." },
        { title: "Increase Productivity", desc: "Free up leadership time by outsourcing document formatting." },
        { title: "Better Decision Making", desc: "Communicate internal strategies clearly to align stakeholders." },
        { title: "Improve Customer Satisfaction", desc: "Ensure your core message is understood quickly and accurately." },
        { title: "Secure Funding", desc: "Arm your team with pitch decks that command investor confidence." },
        { title: "Elevate Brand Perception", desc: "Ensure every external touchpoint reflects enterprise excellence." }
      ],
      techStack: ["Tailwind CSS", "React"],
      faqs: [
        { question: "Can features be customized?", answer: "Yes, every service is fully customizable. We build solutions tailored exactly to your business goals, operational challenges, and brand identity." },
        { question: "Do you write the content or just design the slides?", answer: "We do both. We can refine your existing copy or write compelling new content based on your core business concepts." },
        { question: "What formats do you deliver?", answer: "We deliver in multiple formats including PDF, modern web-ready interactive formats, and source files." },
        { question: "How long does development take?", answer: "Timelines depend entirely on the scope and complexity of the project. We provide clear, transparent timelines after our initial discovery phase." }
      ]
    },
    "ai-consulting-custom-solutions": {
      overview: {
        what: "Strategic advisory and bespoke engineering for businesses looking to implement artificial intelligence to solve complex, highly specific operational challenges.",
        who: "Mid-market companies and enterprises that need more than off-the-shelf tools to gain a competitive advantage.",
        why: "Adopting AI without a clear strategy leads to wasted budgets and isolated experiments. Real ROI requires aligning AI capabilities directly with core business bottlenecks.",
        how: "We audit your operations, identify high-impact AI opportunities, and engineer custom, secure models and integrations tailored to your proprietary data."
      },
      problems: [
        { title: "Disconnected Systems", desc: "Data locked in legacy systems, preventing the deployment of modern AI." },
        { title: "High Operational Cost", desc: "Investing heavily in generic AI tools that don't solve specific problems." },
        { title: "Limited Scalability", desc: "Inability to scale complex internal processes without hiring massive teams." },
        { title: "Manual Work", desc: "Highly skilled employees performing cognitive tasks that could be automated." }
      ],
      features: [
        { title: "AI Automation", desc: "Custom machine learning models trained on your proprietary datasets." },
        { title: "Secure Architecture", desc: "Private AI deployments ensuring your data never trains public models." },
        { title: "Analytics", desc: "Comprehensive auditing to measure the exact ROI of AI implementations." },
        { title: "Cloud Ready", desc: "Deployments architected for AWS, GCP, or secure on-premise servers." },
        { title: "Easy Integration", desc: "Connecting new AI capabilities smoothly into your existing ERPs and CRMs." },
        { title: "Enterprise Grade", desc: "Rigorous testing to ensure AI outputs are accurate, safe, and reliable." }
      ],
      benefits: [
        { title: "Better Decision Making", desc: "Uncover hidden insights within your data using advanced analytics." },
        { title: "Reduce Costs", desc: "Automate complex cognitive workflows to drastically lower overhead." },
        { title: "Business Growth", desc: "Create entirely new revenue streams powered by proprietary AI features." },
        { title: "Increase Productivity", desc: "Supercharge your workforce with bespoke intelligent tools." },
        { title: "Scalable Infrastructure", desc: "Future-proof your business against rapid technological shifts." },
        { title: "Competitive Advantage", desc: "Operate with a level of efficiency your competitors cannot match." }
      ],
      techStack: ["Python", "Node.js", "AWS", "Docker", "OpenAI", "Anthropic", "PostgreSQL"],
    }
  };

  const override = overrides[serviceAnchorSlug];
  
  // Generic builder for fields not in override (serves as fallback for any 19 services not strictly overridden)
  return {
    name: serviceName,
    // Must exactly match a name in allServiceNames or form pre-selection is rejected.
    formValue: serviceName,
    overview: override?.overview || {
      what: `Professional ${serviceName.toLowerCase()} solutions designed to optimize your operations and drive growth.`,
      who: "Forward-thinking startups, SMEs, and enterprise businesses looking to modernize their technology stack.",
      why: "In today's fast-paced digital landscape, manual processes and outdated systems create bottlenecks that hinder scalability.",
      how: "We utilize cutting-edge AI and modern frameworks to deliver secure, scalable, and high-performance solutions."
    },
    problems: override?.problems || [
      { title: "Manual Workflows", desc: "Excessive time spent on repetitive tasks that drain employee productivity." },
      { title: "Disconnected Systems", desc: "Data silos preventing seamless information flow across the organization." },
      { title: "High Operational Costs", desc: "Inefficient processes driving up overhead expenses." },
      { title: "Limited Scalability", desc: "Legacy systems unable to handle increased user load or data volume." }
    ],
    features: override?.features || [
      { title: "AI Automation", desc: "Intelligent algorithms to handle routine decision-making." },
      { title: "Cloud Ready", desc: "Designed for seamless deployment on modern cloud infrastructure." },
      { title: "Fast Performance", desc: "Optimized code and architecture for lightning-fast response times." },
      { title: "Secure Architecture", desc: "Built with enterprise-grade security protocols from day one." },
      { title: "Responsive Design", desc: "Flawless user experience across all devices and screen sizes." },
      { title: "Easy Integration", desc: "Robust APIs to connect with your existing software ecosystem." }
    ],
    benefits: override?.benefits || [
      { title: "Increase Productivity", desc: "Free your team to focus on high-value strategic initiatives." },
      { title: "Reduce Costs", desc: "Lower operational expenses through intelligent automation." },
      { title: "Business Growth", desc: "Scale your operations effortlessly without linear cost increases." },
      { title: "Better Decision Making", desc: "Leverage real-time data and AI-driven insights." },
      { title: "Faster Response Times", desc: "Accelerate delivery and improve overall operational velocity." }
    ],
    industries: override?.industries || defaultIndustries,
    techStack: override?.techStack || ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS", "OpenAI", "Tailwind CSS"],
    faqs: override?.faqs || defaultFaqs
  };
}