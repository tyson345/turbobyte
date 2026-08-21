import { useMemo, useState } from 'react';
import { Link, Redirect } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  useListInquiries,
  useUpdateInquiryStatus,
  useUpdateInquiry,
  getListInquiriesQueryKey,
} from '@workspace/api-client-react';
import type { Inquiry, InquiryStatusProperty } from '@workspace/api-client-react';
import { useSEO } from '@/hooks/use-seo';
import { useAuth } from '@/lib/auth';
import { basePath } from '@/lib/paths';
import {
  Loader2, Mail, Phone, Building2, Calendar, MessageSquare, Rocket, 
  ShieldAlert, LogOut, ChevronDown, ChevronUp, Download, FileSpreadsheet, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import * as XLSX from 'xlsx';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
    </div>
  );
}

const STATUSES: { value: InquiryStatusProperty; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

const STATUS_STYLES: Record<InquiryStatusProperty, string> = {
  new: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  contacted: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  closed: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};

function StatusSelect({ inquiry }: { inquiry: Inquiry }) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useUpdateInquiryStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListInquiriesQueryKey() });
      },
    },
  });

  return (
    <select
      value={inquiry.status}
      disabled={isPending}
      onChange={(e) =>
        mutate({
          id: inquiry.id,
          data: { status: e.target.value as InquiryStatusProperty },
        })
      }
      aria-label={`Status for ${inquiry.name}`}
      className={`rounded-full border px-3 py-1 text-xs font-medium outline-none cursor-pointer disabled:opacity-50 ${STATUS_STYLES[inquiry.status]}`}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value} className="bg-background text-foreground">
          {s.label}
        </option>
      ))}
    </select>
  );
}

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const isProject = inquiry.type === 'project';
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  
  const [notes, setNotes] = useState(inquiry.internalNotes || '');
  const [assignedTo, setAssignedTo] = useState(inquiry.assignedTo || '');

  const { mutate: updateInquiry, isPending: isUpdating } = useUpdateInquiry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListInquiriesQueryKey() });
      }
    }
  });

  const handleSaveNotes = () => {
    if (notes === (inquiry.internalNotes || '') && assignedTo === (inquiry.assignedTo || '')) return;
    updateInquiry({
      id: inquiry.id,
      data: {
        internalNotes: notes || null,
        assignedTo: assignedTo || null,
      }
    });
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              isProject
                ? 'bg-primary/20 text-primary'
                : 'bg-emerald-500/15 text-emerald-400'
            }`}
          >
            {isProject ? <Rocket className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
            {isProject ? 'Project Inquiry' : 'Contact Message'}
          </span>
          {inquiry.referenceNumber && (
            <span className="font-mono text-xs text-muted-foreground bg-black/20 px-2 py-1 rounded">
              {inquiry.referenceNumber}
            </span>
          )}
          <h2 className="font-display text-lg font-semibold text-foreground">
            {inquiry.name}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(inquiry.createdAt)}
          </span>
          <StatusSelect inquiry={inquiry} />
        </div>
      </header>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <a
          href={`mailto:${inquiry.email}`}
          className="flex items-center gap-1.5 text-primary hover:underline break-all"
        >
          <Mail className="h-3.5 w-3.5 flex-shrink-0" /> {inquiry.email}
        </a>
        {inquiry.phone && (
          <a
            href={`tel:${inquiry.phone.replace(/\s+/g, '')}`}
            className="flex items-center gap-1.5 text-foreground hover:text-primary break-all"
          >
            <Phone className="h-3.5 w-3.5 flex-shrink-0" /> {inquiry.phone}
          </a>
        )}
        {inquiry.company && (
          <span className="flex items-center gap-1.5 text-muted-foreground break-words">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" /> {inquiry.company}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {isProject ? (
          <>
            <Field label="Project Name" value={inquiry.projectName} />
            <Field label="Industry" value={inquiry.industry} />
            <Field label="Services" value={inquiry.services} />
            <Field label="Timeline" value={inquiry.timeline} />
            <Field label="Budget" value={inquiry.budget} />
            <div className="sm:col-span-2">
              <Field label="Description" value={inquiry.description} />
            </div>
          </>
        ) : (
          <>
            <Field label="Service" value={inquiry.service} />
            <Field label="Budget" value={inquiry.budget} />
            <div className="sm:col-span-2">
              <Field label="Message" value={inquiry.message} />
            </div>
          </>
        )}
      </div>

      <div className="pt-4 border-t border-white/5">
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? "Hide Internal Details" : "Show Internal Details"}
        </button>

        {expanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-black/20 border border-white/5">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground border-b border-white/10 pb-2">Technical Info</h4>
              <Field label="IP Address" value={inquiry.ipAddress} />
              <Field label="Browser" value={inquiry.browser} />
              <Field label="Device" value={inquiry.device} />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="text-sm font-semibold text-foreground">Internal Notes & Assignment</h4>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSaveNotes} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              </div>
              
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Assigned To</label>
                <Input 
                  value={assignedTo} 
                  onChange={(e) => setAssignedTo(e.target.value)} 
                  placeholder="e.g. John Doe"
                  className="h-8 text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Internal Notes</label>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Add private notes about this lead..."
                  className="text-sm min-h-[100px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function LeadsContent() {
  const { data, isLoading, error } = useListInquiries();
  const { signOut, user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<InquiryStatusProperty | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'contact' | 'project'>('all');
  const [search, setSearch] = useState('');

  const status = (error as { status?: number } | null)?.status;

  const counts = useMemo(() => {
    const c: Record<InquiryStatusProperty, number> = { new: 0, contacted: 0, closed: 0 };
    for (const i of data ?? []) c[i.status] += 1;
    return c;
  }, [data]);

  const stats = useMemo(() => {
    if (!data) return { total: 0, unread: 0, today: 0, month: 0 };
    const todayStr = new Date().toISOString().split('T')[0];
    const monthStr = new Date().toISOString().slice(0, 7);
    return {
      total: data.length,
      unread: data.filter(i => i.status === 'new').length,
      today: data.filter(i => i.createdAt.startsWith(todayStr)).length,
      month: data.filter(i => i.createdAt.startsWith(monthStr)).length
    };
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((i) => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      if (typeFilter !== 'all' && i.type !== typeFilter) return false;
      
      if (search) {
        const q = search.toLowerCase();
        const searchable = [
          i.name, i.email, i.company, i.service, i.referenceNumber, i.projectName, i.description
        ].filter(Boolean).map(s => s!.toLowerCase());
        
        if (!searchable.some(s => s.includes(q))) return false;
      }
      return true;
    });
  }, [data, statusFilter, typeFilter, search]);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(i => ({
      "Reference": i.referenceNumber || '',
      "Type": i.type,
      "Status": i.status,
      "Date": formatDate(i.createdAt),
      "Name": i.name,
      "Email": i.email,
      "Phone": i.phone || '',
      "Company": i.company || '',
      "Service/Project": i.service || i.projectName || '',
      "Budget": i.budget || '',
      "Industry": i.industry || '',
      "Assigned To": i.assignedTo || '',
      "Notes": i.internalNotes || '',
      "IP Address": i.ipAddress || '',
      "Browser": i.browser || '',
      "Device": i.device || '',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "turbobyte_leads.xlsx");
  };

  const handleExportCSV = () => {
    const headers = ["Reference", "Type", "Status", "Date", "Name", "Email", "Phone", "Company", "Service/Project", "Budget", "Industry", "Assigned To", "Notes", "IP Address", "Browser", "Device"];
    const rows = filtered.map(i => [
      i.referenceNumber || '', i.type, i.status, formatDate(i.createdAt), i.name, i.email, i.phone || '', i.company || '', i.service || i.projectName || '', i.budget || '', i.industry || '', i.assignedTo || '', i.internalNotes || '', i.ipAddress || '', i.browser || '', i.device || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "turbobyte_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-16 sm:px-6">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Incoming Leads
          </h1>
          <p className="mt-2 text-muted-foreground">
            All contact messages and project inquiries, newest first.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/portfolio">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
              data-testid="link-admin-portfolio"
            >
              <Rocket className="h-4 w-4" /> Portfolio
            </button>
          </Link>
          <Link href="/admin/subscribers">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
              data-testid="link-admin-subscribers"
            >
              <Mail className="h-4 w-4" /> Subscribers
            </button>
          </Link>
          <Link href="/admin/recruitment">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
              data-testid="link-admin-recruitment"
            >
              <Building2 className="h-4 w-4" /> Recruitment
            </button>
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center py-12 md:py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {status === 403 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-amber-400" />
          <p className="text-foreground font-medium">
            This account isn&apos;t authorized to view leads.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {user?.email}. Only
            company admin accounts can access this page.
          </p>
        </div>
      )}

      {error && status !== 403 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-foreground">
          Couldn&apos;t load leads. Please try again.
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-12 text-center text-muted-foreground">
          No inquiries yet. New leads from the contact form and project wizard
          will appear here.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold font-display text-primary mt-1">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Unread (New)</p>
              <p className="text-2xl font-bold font-display text-sky-400 mt-1">{stats.unread}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Today</p>
              <p className="text-2xl font-bold font-display text-foreground mt-1">{stats.today}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold font-display text-foreground mt-1">{stats.month}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-black/20 p-4 rounded-xl border border-white/5">
            <div className="flex-1 relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search name, email, ref..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 w-full"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1 border border-white/10 rounded-lg p-1 bg-white/5">
                <button
                  type="button"
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${typeFilter === 'all' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  All Types
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('contact')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${typeFilter === 'contact' ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Contact
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('project')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${typeFilter === 'project' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Project
                </button>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-white/10 text-xs h-8" onClick={handleExportCSV}>
                  <Download className="w-3 h-3 mr-1.5" /> CSV
                </Button>
                <Button size="sm" variant="outline" className="border-white/10 text-xs h-8 text-emerald-400 hover:text-emerald-300" onClick={handleExportExcel}>
                  <FileSpreadsheet className="w-3 h-3 mr-1.5" /> Excel
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground mr-2">Filter Status:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'border-primary/50 bg-primary/20 text-primary'
                  : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              All ({data.length})
            </button>
            {STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatusFilter(s.value)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s.value
                    ? 'border-primary/50 bg-primary/20 text-primary'
                    : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10'
                }`}
              >
                {s.label} ({counts[s.value]})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-12 text-center text-muted-foreground">
              No leads match your search and filters.
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Showing {filtered.length} {filtered.length === 1 ? 'lead' : 'leads'}
              </p>
              {filtered.map((inquiry) => (
                <InquiryCard key={inquiry.id} inquiry={inquiry} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminLeadsPage() {
  useSEO('Admin — Leads', 'Private lead management for TurboByte Tech Solutions.', { noindex: true });
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Redirect to="/sign-in" />;
  }

  return <LeadsContent />;
}
