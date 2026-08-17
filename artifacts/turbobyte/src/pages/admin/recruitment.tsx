import { useMemo, useState } from 'react';
import { Show, useClerk, useUser } from '@clerk/react';
import { Link, Redirect } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAdminListJobs,
  useAdminCreateJob,
  useAdminUpdateJob,
  useAdminDeleteJob,
  useAdminListApplications,
  useAdminUpdateApplication,
  useAdminDeleteApplication,
  getAdminListJobsQueryKey,
  getListJobsQueryKey,
  getAdminListApplicationsQueryKey
} from '@workspace/api-client-react';
import type { Job, JobApplication, JobStatus, JobApplicationStatus, JobInputStatus } from '@workspace/api-client-react';
import { useSEO } from '@/hooks/use-seo';
import { basePath } from '@/lib/clerk';
import {
  Loader2, ShieldAlert, LogOut, MessageSquare, Rocket, Mail, Search, Download, FileSpreadsheet,
  Trash2, Pencil, Plus, ChevronDown, ChevronUp, FileText, BarChart3, Users, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
        {label}
      </span>
      <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
    </div>
  );
}

// -------------------------------------
// Job Management
// -------------------------------------
function JobManagementTab() {
  const queryClient = useQueryClient();
  const { data: jobs = [], isLoading } = useAdminListJobs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const [formData, setFormData] = useState({
    title: '', department: '', experience: '', employmentType: '', location: '',
    workMode: '', salary: '', description: '', requirements: '', responsibilities: '',
    skills: '', status: 'open' as JobInputStatus
  });

  const invalidateJobs = () => {
    queryClient.invalidateQueries({ queryKey: getAdminListJobsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
  };

  const createJob = useAdminCreateJob({ mutation: { onSuccess: () => { invalidateJobs(); setIsModalOpen(false); } } });
  const updateJob = useAdminUpdateJob({ mutation: { onSuccess: () => { invalidateJobs(); setIsModalOpen(false); } } });
  const deleteJob = useAdminDeleteJob({ mutation: { onSuccess: () => { invalidateJobs(); setIsDeleteOpen(false); } } });
  const toggleStatus = useAdminUpdateJob({ mutation: { onSuccess: () => invalidateJobs() } });

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setCurrentJob(job);
      setFormData({
        title: job.title, department: job.department, experience: job.experience,
        employmentType: job.employmentType, location: job.location, workMode: job.workMode,
        salary: job.salary || '', description: job.description, requirements: job.requirements || '',
        responsibilities: job.responsibilities || '', skills: job.skills || '', status: job.status as JobInputStatus
      });
    } else {
      setCurrentJob(null);
      setFormData({
        title: '', department: '', experience: '', employmentType: '', location: '',
        workMode: '', salary: '', description: '', requirements: '', responsibilities: '',
        skills: '', status: 'open'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const payload = {
      title: formData.title,
      department: formData.department,
      experience: formData.experience,
      employmentType: formData.employmentType,
      location: formData.location,
      workMode: formData.workMode,
      salary: formData.salary || null,
      description: formData.description,
      requirements: formData.requirements || null,
      responsibilities: formData.responsibilities || null,
      skills: formData.skills || null,
      status: formData.status
    };

    if (currentJob) {
      updateJob.mutate({ id: currentJob.id, data: payload });
    } else {
      createJob.mutate({ data: payload });
    }
  };

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold font-display">Job Listings</h2>
          <p className="text-sm text-muted-foreground">Manage open roles on the careers page.</p>
        </div>
        <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" /> Create Job</Button>
      </div>

      <div className="grid gap-4">
        {jobs.map(job => (
          <div key={job.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="bg-white/10 px-2 py-0.5 rounded">{job.department}</span>
                <span>•</span>
                <span>{job.location} ({job.workMode})</span>
                <span>•</span>
                <span>{job.experience} Exp</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                className={`text-xs px-3 py-1.5 rounded-full border outline-none cursor-pointer ${
                  job.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                  job.status === 'closed' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                  'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                }`}
                value={job.status}
                onChange={(e) => toggleStatus.mutate({ id: job.id, data: { status: e.target.value as JobStatus } })}
                disabled={toggleStatus.isPending}
              >
                <option value="open" className="bg-background text-foreground">Open</option>
                <option value="closed" className="bg-background text-foreground">Closed</option>
                <option value="archived" className="bg-background text-foreground">Archived</option>
              </select>

              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(job)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => { setCurrentJob(job); setIsDeleteOpen(true); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {jobs.length === 0 && <div className="text-center p-8 text-muted-foreground border border-white/10 rounded-xl bg-white/[0.02]">No jobs created yet.</div>}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentJob ? 'Edit Job' : 'Create Job'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Software Engineer" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Department *</label>
                  <Input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Engineering" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Status *</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as JobInputStatus})} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Experience *</label>
                  <Input value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="3-5 Years" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Employment Type *</label>
                  <Input value={formData.employmentType} onChange={e => setFormData({...formData, employmentType: e.target.value})} placeholder="Full-time" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Location *</label>
                  <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="New York, NY" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Work Mode *</label>
                  <Input value={formData.workMode} onChange={e => setFormData({...formData, workMode: e.target.value})} placeholder="Hybrid" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Salary</label>
                <Input value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="$100k - $120k" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description *</label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Requirements</label>
                <Textarea value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Responsibilities</label>
                <Textarea value={formData.responsibilities} onChange={e => setFormData({...formData, responsibilities: e.target.value})} rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Skills</label>
                <Textarea value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} rows={2} placeholder="React, Node.js, AWS..." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createJob.isPending || updateJob.isPending}>
              {(createJob.isPending || updateJob.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>Are you sure you want to delete this job? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => currentJob && deleteJob.mutate({ id: currentJob.id })} disabled={deleteJob.isPending}>
              {deleteJob.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// -------------------------------------
// Application Card
// -------------------------------------
const APP_STATUSES: { value: JobApplicationStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  { value: 'interview_scheduled', label: 'Interview Scheduled', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { value: 'selected', label: 'Selected', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
];

function ApplicationCard({ app }: { app: JobApplication }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(app.internalNotes || '');
  const [recruiter, setRecruiter] = useState(app.assignedRecruiter || '');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { mutate: updateApp, isPending: isUpdating } = useAdminUpdateApplication({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getAdminListApplicationsQueryKey() }) }
  });

  const { mutate: deleteApp, isPending: isDeleting } = useAdminDeleteApplication({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getAdminListApplicationsQueryKey() }) }
  });

  const handleSaveNotes = () => {
    if (notes === (app.internalNotes || '') && recruiter === (app.assignedRecruiter || '')) return;
    updateApp({ id: app.id, data: { internalNotes: notes || null, assignedRecruiter: recruiter || null } });
  };

  const statusColor = APP_STATUSES.find(s => s.value === app.status)?.color || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground bg-black/20 px-2 py-1 rounded">
            {app.referenceNumber}
          </span>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {app.fullName}
          </h2>
          <span className="text-sm text-primary font-medium px-2 py-0.5 rounded bg-primary/10">
            {app.preferredRole}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{formatDate(app.createdAt)}</span>
          <select
            value={app.status}
            disabled={isUpdating}
            onChange={e => updateApp({ id: app.id, data: { status: e.target.value as JobApplicationStatus } })}
            className={`rounded-full border px-3 py-1 text-xs font-medium outline-none cursor-pointer disabled:opacity-50 ${statusColor}`}
          >
            {APP_STATUSES.map(s => <option key={s.value} value={s.value} className="bg-background text-foreground">{s.label}</option>)}
          </select>
        </div>
      </header>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <a href={`mailto:${app.email}`} className="text-primary hover:underline">{app.email}</a>
        <a href={`tel:${app.phone.replace(/\s+/g, '')}`} className="hover:text-primary">{app.phone}</a>
        <span className="text-muted-foreground">{app.city}</span>
        <span className="text-muted-foreground">{app.experience || 'No experience spec.'}</span>
      </div>

      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
              <a href={`/api/storage${app.resumePath}`} target="_blank" rel="noopener noreferrer">
                <FileText className="w-3 h-3 mr-1.5" /> View Resume
              </a>
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:bg-destructive/10" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="w-3 h-3 mr-1.5" /> Delete
            </Button>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? "Hide Details" : "Show Full Details"}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-black/20 border border-white/5">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold border-b border-white/10 pb-2">Application Info</h4>
              <Field label="Qualification" value={app.qualification} />
              <Field label="College/University" value={`${app.college || 'N/A'} ${app.graduationYear ? `(${app.graduationYear})` : ''}`} />
              <Field label="Skills" value={app.skills} />
              <Field label="Expected Salary" value={app.expectedSalary} />
              <Field label="Availability" value={app.joiningAvailability} />
              <Field label="Links" value={[app.linkedin, app.github, app.portfolio].filter(Boolean).join('\n')} />
              <Field label="Cover Letter" value={app.coverLetter} />
              <Field label="IP Address" value={app.ipAddress} />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="text-sm font-semibold">Internal Notes & Assignment</h4>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSaveNotes} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Assigned Recruiter</label>
                <Input value={recruiter} onChange={e => setRecruiter(e.target.value)} placeholder="Name..." className="h-8 text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Internal Notes</label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Interview feedback..." className="text-sm min-h-[120px]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>Are you sure you want to delete {app.fullName}'s application? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteApp({ id: app.id })} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}

// -------------------------------------
// Applications List Tab
// -------------------------------------
function ApplicationsTab({ apps }: { apps: JobApplication[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobApplicationStatus | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'name'>('newest');

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toISOString().slice(0, 7);
    return {
      total: apps.length,
      today: apps.filter(a => a.createdAt.startsWith(today)).length,
      month: apps.filter(a => a.createdAt.startsWith(month)).length,
      shortlisted: apps.filter(a => a.status === 'shortlisted').length,
      interview: apps.filter(a => a.status === 'interview_scheduled').length,
      selected: apps.filter(a => a.status === 'selected').length,
      rejected: apps.filter(a => a.status === 'rejected').length,
    };
  }, [apps]);

  const filtered = useMemo(() => {
    let result = apps;
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.fullName.toLowerCase().includes(q) || 
        a.skills.toLowerCase().includes(q) || 
        (a.college && a.college.toLowerCase().includes(q)) || 
        a.preferredRole.toLowerCase().includes(q) ||
        (a.experience && a.experience.toLowerCase().includes(q)) ||
        a.referenceNumber.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.fullName.localeCompare(b.fullName);
    });
  }, [apps, search, statusFilter, sort]);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(i => ({
      "Ref": i.referenceNumber, "Status": i.status, "Date": formatDate(i.createdAt),
      "Name": i.fullName, "Email": i.email, "Phone": i.phone, "City": i.city,
      "Role": i.preferredRole, "Experience": i.experience || '', "Skills": i.skills,
      "Qualification": i.qualification, "College": i.college || '', "Grad Year": i.graduationYear || '',
      "LinkedIn": i.linkedin || '', "GitHub": i.github || '', "Portfolio": i.portfolio || '',
      "Expected Salary": i.expectedSalary || '', "Availability": i.joiningAvailability || '',
      "Recruiter": i.assignedRecruiter || '', "Notes": i.internalNotes || '', "IP": i.ipAddress || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    XLSX.writeFile(wb, "turbobyte_applications.xlsx");
  };

  const handleExportCSV = () => {
    const headers = ["Ref", "Status", "Date", "Name", "Email", "Phone", "Role", "Experience", "Skills", "Qualification", "Recruiter", "Notes"];
    const rows = filtered.map(i => [
      i.referenceNumber, i.status, formatDate(i.createdAt), i.fullName, i.email, i.phone, i.preferredRole, i.experience || '', i.skills, i.qualification, i.assignedRecruiter || '', i.internalNotes || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "turbobyte_applications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="text-2xl font-bold font-display text-primary mt-1">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Today</p>
          <p className="text-2xl font-bold font-display text-sky-400 mt-1">{stats.today}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold font-display text-foreground mt-1">{stats.month}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-amber-400/80">Shortlisted</p>
          <p className="text-2xl font-bold font-display text-amber-400 mt-1">{stats.shortlisted}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-purple-400/80">Interview</p>
          <p className="text-2xl font-bold font-display text-purple-400 mt-1">{stats.interview}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-emerald-400/80">Selected</p>
          <p className="text-2xl font-bold font-display text-emerald-400 mt-1">{stats.selected}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-red-400/80">Rejected</p>
          <p className="text-2xl font-bold font-display text-red-400 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-black/20 p-4 rounded-xl border border-white/5">
        <div className="flex-1 relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search name, skills, role, college..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 w-full"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            value={sort} 
            onChange={e => setSort(e.target.value as any)}
            className="h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none text-foreground"
          >
            <option value="newest" className="bg-background">Newest First</option>
            <option value="oldest" className="bg-background">Oldest First</option>
            <option value="name" className="bg-background">Sort by Name</option>
          </select>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-white/10 text-xs h-10" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button size="sm" variant="outline" className="border-white/10 text-xs h-10 text-emerald-400 hover:text-emerald-300" onClick={handleExportExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground mr-2">Filter Status:</span>
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === 'all' ? 'border-primary/50 bg-primary/20 text-primary' : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10'
          }`}
        >
          All ({apps.length})
        </button>
        {APP_STATUSES.map((s) => {
          const count = apps.filter(a => a.status === s.value).length;
          return (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s.value ? 'border-primary/50 bg-primary/20 text-primary' : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-12 text-center text-muted-foreground">
            No applications match your search.
          </div>
        ) : (
          filtered.map(app => <ApplicationCard key={app.id} app={app} />)
        )}
      </div>
    </div>
  );
}

// -------------------------------------
// Analytics Tab
// -------------------------------------
function AnalyticsTab({ apps }: { apps: JobApplication[] }) {
  const byRoleData = useMemo(() => {
    const counts: Record<string, number> = {};
    apps.forEach(a => counts[a.preferredRole] = (counts[a.preferredRole] || 0) + 1);
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 10);
  }, [apps]);

  const byMonthData = useMemo(() => {
    const counts: Record<string, number> = {};
    apps.forEach(a => {
      const m = a.createdAt.slice(0, 7); // YYYY-MM
      counts[m] = (counts[m] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a,b) => a.name.localeCompare(b.name));
  }, [apps]);

  const byExperienceData = useMemo(() => {
    const counts: Record<string, number> = {};
    apps.forEach(a => {
      const exp = a.experience || 'Not Specified';
      counts[exp] = (counts[exp] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [apps]);

  const funnelData = useMemo(() => {
    const newCount = apps.filter(a => a.status === 'new').length;
    const short = apps.filter(a => a.status === 'shortlisted').length;
    const interview = apps.filter(a => a.status === 'interview_scheduled').length;
    const selected = apps.filter(a => a.status === 'selected').length;
    return [
      { stage: 'New', count: newCount },
      { stage: 'Shortlisted', count: short },
      { stage: 'Interview', count: interview },
      { stage: 'Selected', count: selected }
    ];
  }, [apps]);

  const selectionRate = apps.length > 0 
    ? ((apps.filter(a => a.status === 'selected').length / apps.length) * 100).toFixed(1) 
    : '0.0';

  const COLORS = ['#7C3AED', '#A855F7', '#C084FC', '#38BDF8', '#10B981', '#FBBF24', '#F43F5E'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glassmorphism p-6 rounded-xl text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Total Applications</p>
          <p className="text-4xl font-display font-bold text-primary">{apps.length}</p>
        </div>
        <div className="glassmorphism p-6 rounded-xl text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Overall Selection Rate</p>
          <p className="text-4xl font-display font-bold text-emerald-400">{selectionRate}%</p>
        </div>
        <div className="glassmorphism p-6 rounded-xl text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Top Role</p>
          <p className="text-2xl font-display font-bold text-sky-400 mt-2 truncate">{byRoleData[0]?.name || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glassmorphism p-6 rounded-xl">
          <h3 className="font-semibold mb-6">Applications per Month</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byMonthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#ffffff20' }} />
                <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: '#7C3AED' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glassmorphism p-6 rounded-xl">
          <h3 className="font-semibold mb-6">Hiring Funnel (Current State)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#ffffff50" fontSize={12} />
                <YAxis dataKey="stage" type="category" stroke="#ffffff50" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#ffffff20' }} />
                <Bar dataKey="count" fill="#A855F7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glassmorphism p-6 rounded-xl">
          <h3 className="font-semibold mb-6">Applications by Role (Top 10)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byRoleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={10} tickLine={false} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#ffffff20' }} />
                <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glassmorphism p-6 rounded-xl">
          <h3 className="font-semibold mb-6">Experience Breakdown</h3>
          <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byExperienceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {byExperienceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#ffffff20' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend because recharts default legend can be tricky to style perfectly without extra code */}
            <div className="absolute right-6 top-20 flex flex-col gap-2">
              {byExperienceData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{entry.name}</span>
                  <span className="font-semibold ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------
// Main Page
// -------------------------------------
function RecruitmentContent() {
  const { signOut } = useClerk();
  const { data: apps = [], isLoading: appsLoading, error } = useAdminListApplications();
  const [activeTab, setActiveTab] = useState<'applications' | 'analytics' | 'jobs'>('applications');

  const status = (error as { status?: number } | null)?.status;

  if (status === 403) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-16 sm:px-6">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-amber-400" />
          <p className="text-foreground font-medium">This account isn't authorized to view recruitment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16 sm:px-6 min-h-screen flex flex-col">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Recruitment Admin
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage job postings and review applications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/leads">
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10">
              <MessageSquare className="h-4 w-4" /> Leads
            </button>
          </Link>
          <Link href="/admin/portfolio">
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10">
              <Rocket className="h-4 w-4" /> Portfolio
            </button>
          </Link>
          <Link href="/admin/subscribers">
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10">
              <Mail className="h-4 w-4" /> Subscribers
            </button>
          </Link>
          <button
            onClick={() => signOut({ redirectUrl: basePath || '/' })}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
        <Button 
          variant={activeTab === 'applications' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('applications')}
          className={activeTab === 'applications' ? 'glow-purple' : 'text-muted-foreground hover:text-foreground'}
        >
          <Users className="w-4 h-4 mr-2" /> Applications
        </Button>
        <Button 
          variant={activeTab === 'analytics' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('analytics')}
          className={activeTab === 'analytics' ? 'glow-purple' : 'text-muted-foreground hover:text-foreground'}
        >
          <BarChart3 className="w-4 h-4 mr-2" /> Analytics
        </Button>
        <Button 
          variant={activeTab === 'jobs' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('jobs')}
          className={activeTab === 'jobs' ? 'glow-purple' : 'text-muted-foreground hover:text-foreground'}
        >
          <Briefcase className="w-4 h-4 mr-2" /> Job Management
        </Button>
      </div>

      <div className="flex-1">
        {activeTab === 'jobs' && <JobManagementTab />}
        
        {(activeTab === 'applications' || activeTab === 'analytics') && (
          appsLoading ? (
            <div className="py-12 md:py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">Failed to load applications.</div>
          ) : (
            activeTab === 'applications' ? <ApplicationsTab apps={apps} /> : <AnalyticsTab apps={apps} />
          )
        )}
      </div>
    </div>
  );
}

export default function AdminRecruitmentPage() {
  useSEO('Admin — Recruitment', 'Private recruitment management for TurboByte Tech Solutions.', { noindex: true });
  return (
    <>
      <Show when="signed-in">
        <RecruitmentContent />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}
