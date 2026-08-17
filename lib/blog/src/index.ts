// Central registry for all published blog articles.
// Add new entries here; the blog listing and article pages consume this list.
// Keep entries ordered newest-first.

export interface BlogPost {
  slug: string;
  title: string;
  /** ISO date string, e.g. '2026-07-18' */
  date: string;
  /** Short summary shown on the listing page and used for SEO */
  summary: string;
  /** Category badge */
  category: string;
  /** Estimated read time, e.g. '6 min read' */
  readTime: string;
  author: string;
  authorRole: string;
  /** Full article body. Paragraphs separated by blank lines.
   * Supports: '## ' headings, '- ' bullet lists, and **bold** inline. */
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-create-a-website-for-your-business-in-india',
    title: 'How to Create a Website for Your Business in India: A Practical 2026 Guide',
    date: '2026-08-14',
    summary:
      'Want a website for your business but not sure where to start? This guide walks through the real decisions — domain, design, content, and cost — so you know exactly what to ask for before you spend a rupee.',
    category: 'Website Design',
    readTime: '7 min read',
    author: 'TurboByte Engineering',
    authorRole: 'Engineering Team',
    content: `If you have been telling yourself "I need a website for my business" for months, this guide is for you. We build websites for a living, so we obviously have a bias — but the advice below applies whether you hire us, hire someone else, or do it yourself.

## Start with the one question that decides everything

Before templates, colors, or price quotes, answer this: **what should a visitor do after landing on your site?** Call you? Fill an enquiry form? Buy a product? Book an appointment?

Everything else flows from that answer. A site built to generate phone calls looks different from a store built to take payments. Businesses that skip this question end up with an expensive online brochure that does nothing.

## The pieces you actually need

- **A domain name.** Your address on the internet, like yourbusiness.com. It costs roughly ₹800–1,500 a year. Buy it in your own name — never let an agency register it under theirs, or you will not truly own your website.
- **Hosting.** The computer that serves your site to visitors. Modern hosting for a business site is inexpensive and should include an SSL certificate (the padlock in the browser) by default.
- **Design and content.** This is where budgets vary wildly. The design matters less than most owners think; the words matter more. Clear services, real photos, your actual phone number, and answers to the questions customers always ask will outperform a beautiful site with vague text.
- **A way to be found.** Google Business Profile (free), basic on-page SEO, and a site that loads fast on a phone. In India, the majority of your visitors will be on mobile — if your site is slow on a mid-range phone on 4G, it is broken.

## What websites really cost in India

Prices range from a few thousand rupees for a template job to several lakhs for custom software. The honest rule of thumb: a professional small-business website with custom design, mobile performance, contact forms, and basic SEO typically lands in the tens of thousands of rupees. Anyone quoting dramatically less is reselling a template; anyone quoting lakhs for five pages should be able to explain exactly why.

Ask every vendor these questions before paying:

- Who owns the domain, hosting account, and source code when we are done?
- What happens after launch — is there a monthly fee, and what does it cover?
- Will you show me the site running on a real phone before launch?
- How will enquiries reach me — email, WhatsApp, a dashboard?

## DIY builders vs hiring a developer

Website builders like Wix or Shopify are genuinely fine for simple needs, and we tell people that honestly. Hire a professional when you need custom functionality (bookings, quotes, integrations), when your site must rank against established competitors, or when your time is worth more than the learning curve.

## Our approach

At TurboByte we build business websites with custom design and code — no page builders — and hand over full ownership of domain, hosting, and source. If you want a website for your business and would rather talk it through with a human first, reach out through our contact page. The first conversation costs nothing and you will leave with a clearer plan either way.`,
  },
  {
    slug: 'how-much-does-a-website-cost-in-india',
    title: 'How Much Does a Website Cost in India? An Honest Breakdown',
    date: '2026-08-05',
    summary:
      'Website quotes in India range from ₹5,000 to ₹5,00,000 for what sounds like the same thing. Here is what actually drives the price, what recurring costs to expect, and the questions that expose a bad quote.',
    category: 'Website Design',
    readTime: '6 min read',
    author: 'TurboByte Engineering',
    authorRole: 'Engineering Team',
    content: `"How much does a website cost?" is the first question every business owner asks, and the industry answers it terribly. Quotes for a "5-page business website" in India genuinely range from ₹5,000 to ₹5,00,000. Both quotes can be legitimate. This post explains what changes between them.

## The four things you are actually paying for

- **Design: template or custom?** A template job means your site looks like thousands of others and inherits their bloat. Custom design means someone thought about *your* customers. This is the single biggest price driver.
- **Functionality.** A contact form is trivial. Online payments, booking systems, customer logins, and admin dashboards are software — priced like software.
- **Content.** Who writes the words and takes the photos? "Client will provide content" is the most common cause of stalled website projects. If the vendor writes it, that effort is in the price.
- **What happens after launch.** Updates, backups, security patches, and small changes. A cheap build with an expensive mandatory maintenance contract can cost more over two years than an honest fixed price.

## Recurring costs nobody mentions upfront

Even after the site is built, expect: domain renewal (₹800–1,500/year), hosting (from a few hundred rupees a month for a typical business site), and email on your own domain if you want name@yourbusiness.com. Ask for these numbers in writing before you sign anything.

## Red flags in a quote

- The domain is registered in the agency's name. You now rent your own brand.
- No mention of mobile performance. Most Indian traffic is mobile; a site that scores poorly on a mid-range phone will quietly lose you customers.
- "SEO included" with no specifics. Real SEO work is describable: page titles, descriptions, structured data, sitemap, loading speed. "We will do SEO" is not a deliverable.
- No handover terms. When the relationship ends, do you get the code, the hosting login, and the domain? Get it in writing.

## So what should you budget?

For a professionally designed, mobile-fast business website with contact forms and proper SEO groundwork: budget in the tens of thousands of rupees as a starting point, more if you need e-commerce or custom features. Below that range, you are buying a template with your logo on it — which is sometimes fine, as long as you know that is what you are buying.

We quote fixed prices after one scoping conversation, and every quote itemizes exactly what you get and what you own. If you are comparing quotes right now, feel free to send us the other one — we will tell you honestly if it is good.`,
  },
  {
    slug: 'does-my-small-business-really-need-a-website',
    title: 'Does My Small Business Really Need a Website When I Have Instagram and WhatsApp?',
    date: '2026-07-28',
    summary:
      'Plenty of Indian businesses run entirely on Instagram, WhatsApp, and Google Maps. Sometimes that is enough. Here is the honest test for when a website starts paying for itself — and when it does not.',
    category: 'Business',
    readTime: '5 min read',
    author: 'TurboByte Engineering',
    authorRole: 'Engineering Team',
    content: `We build websites, so you would expect us to say everyone needs one. The truth is more useful: **some businesses genuinely do not need a website yet**, and knowing which side you are on saves real money.

## When Instagram and WhatsApp are genuinely enough

If you are a local, visual, walk-in business — a bakery, a salon, a boutique — and your customers find you through Maps and word of mouth, a Google Business Profile plus an active Instagram can carry you surprisingly far. The platforms are free, your customers are already there, and WhatsApp closes the sale.

If that is working for you, do not let anyone scare you into a website with vague talk about "credibility."

## The moments a website starts paying for itself

- **People search for what you sell.** If potential customers type "interior designer in Bengaluru" or "CA for small business" into Google, only a website can rank for that search. Instagram posts do not.
- **You are explaining the same things repeatedly on WhatsApp.** Prices, services, process, portfolio — a website answers these at 2 a.m. without you.
- **You need trust before the first call.** For higher-value services — consulting, software, healthcare, education — buyers research before they contact. A business that appears only as a social handle loses those comparisons to competitors who look established.
- **The platform owns your audience.** One algorithm change or account block and your Instagram following is gone. Your website and your customer list are the only online assets you actually own.
- **You want to sell online.** DMs-and-bank-transfer commerce stops scaling quickly. A proper store with payments, inventory, and order tracking is a website.

## The in-between step most businesses skip

You do not have to jump from "no website" to a ten-page site. A single well-made page — what you do, who it is for, photos of real work, prices or starting prices, and a WhatsApp button — often converts better than a bloated site, and it gives Google something to rank.

## The honest test

Ask yourself: *"In the last month, did I lose a customer because they could not find me, could not verify me, or could not buy from me outside working hours?"* If yes, the website will likely pay for itself. If no, keep your money and revisit the question in six months.

And if you are on the fence, ask us. We have told more than one business owner they did not need us yet — they tend to come back when they do.`,
  },
  {
    slug: 'website-loading-speed-why-it-decides-your-google-ranking',
    title: 'Your Website Speed Is Costing You Customers: What Slow Sites Lose and How to Fix It',
    date: '2026-07-21',
    summary:
      'Google measures your site the way an impatient visitor on a mid-range phone experiences it. Here is what actually makes business websites slow in India, and the fixes that matter most.',
    category: 'Web Performance',
    readTime: '6 min read',
    author: 'TurboByte Engineering',
    authorRole: 'Engineering Team',
    content: `Every business owner checks their website on their own phone, on their own WiFi, and concludes it is fast. Google disagrees — because Google measures what your *median visitor* experiences: a mid-range Android phone, on mobile data, several kilometres from the nearest tower.

That gap between how your site feels to you and how it performs for a real visitor is where rankings and customers quietly leak away.

## Why speed matters twice

Speed hits you in two separate places. First, **ranking**: Google's Core Web Vitals are an explicit ranking signal — a slow site starts the race behind faster competitors. Second, **conversion**: visitors on slow connections abandon pages that take more than a few seconds to become usable. They do not complain; they just tap back and call the next business in the results.

## What actually makes business websites slow

After auditing many small-business sites, the same culprits appear in almost every one:

- **Enormous images.** A 4 MB photo straight from a phone camera, displayed at the size of a postage stamp. This is the number one issue, and fixing it is nearly free.
- **Page-builder bloat.** Drag-and-drop themes ship the code for every feature you might ever use, on every page, whether you use it or not.
- **Too many third-party scripts.** Chat widgets, five analytics tools, social feeds, popups — each one is a tax every visitor pays.
- **Cheap shared hosting.** When the server itself takes two seconds to respond, nothing you do on the page can save you.

## The fixes, in order of impact

- Compress and resize every image; serve modern formats (WebP/AVIF).
- Remove scripts and plugins you do not actively use. Be ruthless.
- Use caching and a CDN so repeat visits and distant visitors are fast.
- If you are on a heavy theme, the honest fix is often a rebuild with clean code — bolting speed plugins onto a bloated theme has a ceiling.

## How to check where you stand

Run your site through Google's free PageSpeed Insights tool and look at the *mobile* score — not desktop. Look up your real pages, not just the homepage. If your mobile score is deep in the red, you now know why the phone rings less than it should.

Every site we build is tested on real mid-range phones before launch, because that is where your customers are. If your current site fails the test above and you want a straight answer about whether it can be fixed or should be rebuilt, send it to us — the audit costs nothing.`,
  },
  {
    slug: 'why-we-start-every-ai-automation-project-with-a-failure-budget',
    title: 'Why We Start Every AI Automation Project with a Failure Budget',
    date: '2026-07-15',
    summary:
      'Most AI automation projects fail not because the model is bad, but because nobody decided upfront what an acceptable error looks like. Here is the framework we use with every client before writing a line of code.',
    category: 'AI Automation',
    readTime: '6 min read',
    author: 'TurboByte Engineering',
    authorRole: 'Engineering Team',
    content: `When a client asks us to automate a document-heavy workflow with AI, the first question we ask is never "which model should we use?" It is: **"what happens when it gets one wrong?"**

That question makes some people uncomfortable, because it admits upfront that the system *will* get things wrong. But every production AI system has a non-zero error rate, and pretending otherwise is how automation projects end up quietly abandoned six months after launch. The teams that succeed are the ones who decide — before any code is written — how much error is acceptable, where it is acceptable, and what the system should do when it is not confident.

We call this the **failure budget**, and it has become the backbone of how we scope AI automation work.

## What a failure budget actually is

A failure budget is a short, written agreement between us and the client that answers four questions:

- **What is the cost of a single error?** A mis-keyed invoice line item might cost a few minutes of reconciliation. A mis-routed legal document might cost a client relationship. These deserve very different architectures.
- **What error rate does the current manual process have?** This number is almost always higher than people assume. Humans doing repetitive data entry typically run 1–4% error rates. Beating the human baseline is usually the real target, not perfection.
- **Which errors must never happen?** Some categories — payment amounts, regulatory filings, anything customer-facing — get routed to a human whenever the system's confidence drops, no matter how rarely that happens.
- **Who reviews the exceptions, and how fast?** An automation that produces a review queue nobody owns is just a slower manual process with extra steps.

## How it changes the architecture

Once those answers are on paper, the technical design mostly writes itself. Take a hypothetical invoice-processing project: the failure budget would tell you that extraction accuracy on *totals and account codes* has to exceed the human baseline, while vendor-name typos are tolerable. So you build a validation layer that cross-checks extracted totals against line-item sums and flags mismatches for review — and you do not spend a single engineering hour making vendor-name extraction perfect.

The result of that discipline: accuracy effort concentrated where it matters, a review queue small enough for a human to actually work through, and a finance team that trusts the system because they know exactly which decisions it is allowed to make on its own.

## The conversation to have before your next AI project

If you are considering automating a workflow, try writing your own failure budget before talking to any vendor — including us. If you cannot answer what a single error costs, the project is not ready. If you can, you will be able to tell within one meeting whether a vendor is designing for your risk profile or just demoing a model.

We publish posts like this as we work — follow along here, or reach out if you want a second opinion on an automation you are scoping.`,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
