import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '@/hooks/use-seo';
import { schemaGraph, webPageSchema, breadcrumbSchema } from '@/lib/schema';
import { Lightbulb, BookOpen, Users, Key, Target, Heart, Scale, TrendingUp, Cpu, Briefcase, Zap, Rocket, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { useListJobs } from '@workspace/api-client-react';
import { ApplicationModal } from '@/components/application-modal';
import { AmbientHero } from '@/components/ambient-hero';
import { MarketingImage } from '@/components/marketing-image';

export default function Careers() {
  const seoTitle = 'Careers | TurboByte Tech Solutions Private Limited';
  const seoDescription =
    'Explore careers at TurboByte Tech Solutions. Join our AI-first team to build innovative software, automation, and digital transformation projects.';
  useSEO(seoTitle, seoDescription, {
    absoluteTitle: true,
    jsonLd: schemaGraph(
      webPageSchema({ path: '/careers', title: seoTitle, description: seoDescription }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Careers', path: '/careers' },
      ]),
    ),
  });

  const { data: jobs = [], isLoading } = useListJobs();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleApply = (jobId: number | null, role: string) => {
    setSelectedJobId(jobId);
    setSelectedRole(role);
    setModalOpen(true);
  };

  const cultureValues = [
    { icon: Lightbulb, title: 'Innovation', desc: 'We encourage bold ideas and creative problem-solving.' },
    { icon: BookOpen, title: 'Continuous Learning', desc: 'Constant growth through exploring new technologies and AI advancements.' },
    { icon: Users, title: 'Team Collaboration', desc: 'Working together across disciplines to achieve shared goals.' },
    { icon: Key, title: 'Ownership', desc: 'Taking full responsibility for projects from ideation to delivery.' },
    { icon: Target, title: 'Problem Solving', desc: 'Tackling complex challenges with logical and effective solutions.' },
    { icon: Heart, title: 'Customer First', desc: 'Prioritizing user experience and business value above all.' },
    { icon: Scale, title: 'Work-Life Balance', desc: 'Valuing personal time to keep our team energized and focused.' },
    { icon: TrendingUp, title: 'Growth Opportunities', desc: 'Clear pathways for career progression and leadership.' },
  ];

  const whyJoinReasons = [
    { icon: BookOpen, title: 'Flexible Learning', desc: 'Access resources and time to upskill yourself.' },
    { icon: Briefcase, title: 'Real Projects', desc: 'Work on impactful applications used by active businesses.' },
    { icon: Zap, title: 'Modern Technologies', desc: 'Use the latest tools, frameworks, and cloud infrastructure.' },
    { icon: Cpu, title: 'AI-First Company', desc: 'Integrate intelligent AI solutions into daily development.' },
    { icon: TrendingUp, title: 'Career Growth', desc: 'Advance your role as the company rapidly expands.' },
    { icon: Users, title: 'Collaborative Environment', desc: 'A supportive, ego-free workspace focused on quality.' },
    { icon: Target, title: 'Mentorship', desc: 'Learn directly from experienced engineers and founders.' },
    { icon: Rocket, title: 'Professional Development', desc: 'Build a robust portfolio of real-world accomplishments.' },
  ];

  const scrollToJobs = () => {
    const el = document.getElementById('open-positions');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pt-20">
      <ApplicationModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        jobId={selectedJobId}
        defaultRole={selectedRole}
      />

      {/* Hero Section */}
      <section className="py-10 md:py-24 relative overflow-hidden">
        <AmbientHero />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 premium-gradient-text" style={{ fontFamily: 'var(--app-font-display)' }}>
              Build Your Career With TurboByte Tech Solutions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              Join our passionate team and help build intelligent digital solutions that shape the future of businesses through Artificial Intelligence and modern technology.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="glow-purple" onClick={scrollToJobs}>
                View Open Positions
              </Button>
              <Button size="lg" variant="outline" onClick={() => handleApply(null, '')}>
                Send Us Your Profile
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Company Culture */}
      <section className="py-10 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12 md:mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
                Our <span className="premium-gradient-text">Culture</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg">
                The principles that drive how we work, collaborate, and build.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <MarketingImage
                src="/images/marketing/team-culture.jpg"
                alt="Team culture and collaboration"
                aspectRatio="video"
              />
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {cultureValues.map((value, i) => (
              <motion.div
                key={i}
                className={i % 4 === 0 || i % 4 === 3 ? "md:col-span-7" : "md:col-span-5"}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 2) * 0.1 }}
              >
                <div className="group relative flex flex-col p-6 sm:p-8 md:p-10 rounded-[2rem] bg-white/[0.015] border border-white/5 hover:border-primary/20 transition-all duration-500 overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 mb-8">
                      <value.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-medium mb-3 tracking-tight text-white group-hover:text-primary transition-colors duration-300" style={{ fontFamily: 'var(--app-font-display)' }}>
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      {value.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-10 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
              Why <span className="premium-gradient-text">Join Us?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
              What you can expect when you become part of the TurboByte team.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto">
            {whyJoinReasons.map((reason, i) => (
              <motion.div
                key={i}
                className={i % 3 === 0 ? "md:col-span-12 lg:col-span-6" : "md:col-span-6 lg:col-span-3"}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1 }}
              >
                <div className="group relative flex flex-col p-8 rounded-[2rem] bg-card border border-white/5 hover:border-secondary/30 transition-all duration-500 overflow-hidden h-full">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                    <reason.icon className="w-24 h-24 text-secondary" strokeWidth={1} />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="mb-8">
                      <reason.icon className="w-8 h-8 text-secondary/70 group-hover:text-secondary mb-6 transition-colors duration-300" strokeWidth={1.5} />
                      <h3 className="text-xl font-medium mb-3 tracking-tight text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
                        {reason.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      {reason.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-10 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--app-font-display)' }}>
              Open <span className="premium-gradient-text">Positions</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
              Discover your next career move with us.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading open positions...</div>
            ) : jobs.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white/[0.015] border border-white/5 p-6 md:p-10 rounded-[2rem] text-center shadow-2xl">
                <p className="text-lg text-muted-foreground mb-8">
                  We're always looking for passionate and talented individuals. Share your profile with us and we'll contact you when a suitable opportunity becomes available.
                </p>
                <Button size="lg" className="glow-purple" onClick={() => handleApply(null, '')}>
                  Send Us Your Profile
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job, i) => (
                  <JobCard key={job.id} job={job} index={i} onApply={() => handleApply(job.id, job.title)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function JobCard({ job, index, onApply }: { job: any, index: number, onApply: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/[0.015] rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all duration-300 overflow-hidden group"
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        className="p-6 sm:p-8 md:p-10 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded-[2rem]"
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <div className="space-y-4">
          <h3 className="text-3xl font-medium tracking-tight group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--app-font-display)' }}>{job.title}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">{job.department}</span>
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">{job.experience} Experience</span>
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">{job.employmentType}</span>
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">{job.workMode}</span>
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">{job.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={(e) => { e.stopPropagation(); onApply(); }} className="rounded-full bg-white text-black hover:bg-white/90 shrink-0 font-medium px-8">
            Apply Now
          </Button>
          <div className="w-12 h-12 rounded-full border border-white/10 group-hover:border-primary/30 group-hover:bg-primary/5 flex items-center justify-center shrink-0 transition-all duration-300">
            {expanded ? <ChevronUp className="w-5 h-5 text-white/70" /> : <ChevronDown className="w-5 h-5 text-white/70" />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 overflow-hidden bg-black/20"
          >
            <div className="p-6 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:p-12">
              <div className="space-y-10">
                {job.description && (
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-4">Description</h4>
                    <p className="text-muted-foreground font-light leading-relaxed whitespace-pre-wrap">{job.description}</p>
                  </div>
                )}
                {job.responsibilities && (
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-4">Responsibilities</h4>
                    <p className="text-muted-foreground font-light leading-relaxed whitespace-pre-wrap">{job.responsibilities}</p>
                  </div>
                )}
              </div>
              <div className="space-y-10">
                {job.requirements && (
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-4">Requirements</h4>
                    <p className="text-muted-foreground font-light leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                )}
                {job.skills && (
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-4">Required Skills</h4>
                    <p className="text-muted-foreground font-light leading-relaxed whitespace-pre-wrap">{job.skills}</p>
                  </div>
                )}
                {job.salary && (
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-4">Salary Range</h4>
                    <p className="text-white font-medium">{job.salary}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
