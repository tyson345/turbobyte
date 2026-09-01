import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { Link, Redirect } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useAdminListProjects, 
  useAdminCreateProject, 
  useAdminUpdateProject, 
  useAdminDeleteProject,
  useAdminAddProjectImage,
  useAdminDeleteProjectImage,
  useListProjectCategories,
  useAdminCreateProjectCategory,
  useAdminDeleteProjectCategory,
  getAdminListProjectsQueryKey,
  getListProjectsQueryKey,
  getListProjectCategoriesQueryKey,
  getGetProjectQueryKey
} from '@workspace/api-client-react';
import type { Project, ProjectCategory, ProjectImageKind } from '@workspace/api-client-react';
import { useSEO } from '@/hooks/use-seo';
import { useUpload } from '@workspace/object-storage-web';
import { 
  Loader2, Mail, ShieldAlert, LogOut, MessageSquare, Rocket, Plus, Search, 
  Pencil, Trash2, X, Image as ImageIcon, UploadCloud, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function AdminPortfolioContent() {
  const queryClient = useQueryClient();
  const { signOut, user } = useAuth();
  const { uploadFile, isUploading } = useUpload();

  const { data: projects = [], isLoading, error } = useAdminListProjects();
  const { data: categories = [] } = useListProjectCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    slug: '', title: '', category: '', shortDescription: '', overview: '',
    clientIndustry: '', challenge: '', solution: '', techStack: '', processNotes: '',
    results: '', lessonsLearned: '', completedAt: '', seoTitle: '', seoDescription: '',
    thumbnailPath: '', liveUrl: ''
  });

  const invalidateQueries = (slug?: string) => {
    queryClient.invalidateQueries({ queryKey: getAdminListProjectsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    if (slug) queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(slug) });
  };

  const createProject = useAdminCreateProject({
    mutation: { onSuccess: () => { invalidateQueries(); setIsProjectModalOpen(false); } }
  });
  
  const updateProject = useAdminUpdateProject({
    mutation: { onSuccess: (data) => { invalidateQueries(data.slug); setIsProjectModalOpen(false); } }
  });

  const deleteProject = useAdminDeleteProject({
    mutation: { onSuccess: () => { invalidateQueries(); setIsDeleteModalOpen(false); } }
  });

  const togglePublish = useAdminUpdateProject({
    mutation: { onSuccess: (data) => invalidateQueries(data.slug) }
  });

  const createCategory = useAdminCreateProjectCategory({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProjectCategoriesQueryKey() }) }
  });
  
  const deleteCategory = useAdminDeleteProjectCategory({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProjectCategoriesQueryKey() }) }
  });

  const addImage = useAdminAddProjectImage({
    mutation: { onSuccess: (data) => {
      if (currentProject) {
        setCurrentProject({ ...currentProject, images: [...currentProject.images, data] });
      }
      invalidateQueries(currentProject?.slug);
    }}
  });

  const removeImage = useAdminDeleteProjectImage({
    mutation: { onSuccess: (_, variables) => {
      if (currentProject) {
        setCurrentProject({ ...currentProject, images: currentProject.images.filter(img => img.id !== variables.id) });
      }
      invalidateQueries(currentProject?.slug);
    }}
  });

  const status = (error as { status?: number } | null)?.status;

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, filterCategory]);

  const handleOpenProjectModal = (project?: Project) => {
    if (project) {
      setCurrentProject(project);
      setFormData({
        slug: project.slug, title: project.title, category: project.category,
        shortDescription: project.shortDescription, overview: project.overview,
        clientIndustry: project.clientIndustry || '', challenge: project.challenge,
        solution: project.solution, techStack: project.techStack.join(', '),
        processNotes: project.processNotes || '', results: project.results || '',
        lessonsLearned: project.lessonsLearned || '', completedAt: project.completedAt ? project.completedAt.split('T')[0] : '',
        seoTitle: project.seoTitle || '', seoDescription: project.seoDescription || '',
        thumbnailPath: project.thumbnailPath || '', liveUrl: project.liveUrl || ''
      });
    } else {
      setCurrentProject(null);
      setFormData({
        slug: '', title: '', category: categories.length > 0 ? categories[0].name : '',
        shortDescription: '', overview: '', clientIndustry: '', challenge: '',
        solution: '', techStack: '', processNotes: '', results: '', lessonsLearned: '',
        completedAt: '', seoTitle: '', seoDescription: '', thumbnailPath: '', liveUrl: ''
      });
    }
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = () => {
    const payload = {
      slug: formData.slug || generateSlug(formData.title),
      title: formData.title,
      category: formData.category,
      liveUrl: formData.liveUrl || null,
      shortDescription: formData.shortDescription,
      overview: formData.overview,
      clientIndustry: formData.clientIndustry || null,
      challenge: formData.challenge,
      solution: formData.solution,
      techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
      processNotes: formData.processNotes || null,
      results: formData.results || null,
      lessonsLearned: formData.lessonsLearned || null,
      completedAt: formData.completedAt ? new Date(formData.completedAt).toISOString() : null,
      seoTitle: formData.seoTitle || null,
      seoDescription: formData.seoDescription || null,
      thumbnailPath: formData.thumbnailPath || null
    };

    if (currentProject) {
      updateProject.mutate({ id: currentProject.id, data: payload });
    } else {
      createProject.mutate({ data: payload });
    }
  };

  const [newCategoryName, setNewCategoryName] = useState('');
  const [imageUploadKind, setImageUploadKind] = useState<ProjectImageKind>('desktop');
  const [imageAltText, setImageAltText] = useState('');

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const res = await uploadFile(e.target.files[0]);
    if (res) {
      setFormData(prev => ({ ...prev, thumbnailPath: res.objectPath }));
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !currentProject) return;
    const res = await uploadFile(e.target.files[0]);
    if (res) {
      addImage.mutate({
        id: currentProject.id,
        data: {
          imagePath: res.objectPath,
          kind: imageUploadKind,
          altText: imageAltText || undefined,
          sortOrder: currentProject.images.length
        }
      });
      setImageAltText('');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16 sm:px-6">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Portfolio Admin
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage projects, case studies, and categories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/leads">
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10">
              <MessageSquare className="h-4 w-4" /> Leads
            </button>
          </Link>
          <Link href="/admin/subscribers">
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10">
              <Mail className="h-4 w-4" /> Subscribers
            </button>
          </Link>
          <Link href="/admin/recruitment">
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10">
              <Building2 className="h-4 w-4" /> Recruitment
            </button>
          </Link>
          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      {status === 403 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center mb-8">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-amber-400" />
          <p className="text-foreground font-medium">This account isn't authorized to view portfolio admin.</p>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {user?.email}.</p>
        </div>
      )}

      {error && status !== 403 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-foreground mb-8">
          Couldn't load projects. Please try again.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search projects..." 
              className="pl-9 bg-card"
            />
          </div>
          <select 
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="h-10 rounded-md border border-input bg-card px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((c: ProjectCategory) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsCategoriesModalOpen(true)}>
            Categories
          </Button>
          <Button onClick={() => handleOpenProjectModal()}>
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{filteredProjects.length} projects found.</p>
          <div className="grid gap-4">
            {filteredProjects.map(p => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                  {p.thumbnailPath ? (
                    <img src={`/api/storage${p.thumbnailPath}`} alt="" className="w-16 h-12 object-cover rounded bg-black/50" />
                  ) : (
                    <div className="w-16 h-12 rounded bg-white/10 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="px-2 py-0.5 rounded bg-primary/20 text-primary">{p.category}</span>
                      <span>/{p.slug}</span>
                      <span>{p.images?.length || 0} images</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => togglePublish.mutate({ id: p.id, data: { published: !p.published }})}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${p.published ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}
                  >
                    {p.published ? 'Published' : 'Draft'}
                  </button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setCurrentProject(p); setIsImagesModalOpen(true); }} title="Manage Images">
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenProjectModal(p)} title="Edit Project">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => { setCurrentProject(p); setIsDeleteModalOpen(true); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Form Modal */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentProject ? 'Edit Project' : 'New Project'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
                <Input value={formData.title} onChange={e => {
                  setFormData(prev => ({ 
                    ...prev, 
                    title: e.target.value,
                    slug: currentProject ? prev.slug : generateSlug(e.target.value)
                  }));
                }} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Slug *</label>
                <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category *</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.map((c: ProjectCategory) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Short Description *</label>
                <Textarea value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Client Industry</label>
                <Input value={formData.clientIndustry} onChange={e => setFormData({ ...formData, clientIndustry: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Live Website URL</label>
                <Input type="url" value={formData.liveUrl} onChange={e => setFormData({ ...formData, liveUrl: e.target.value })} placeholder="https://example.com/" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Completed At</label>
                <Input type="date" value={formData.completedAt} onChange={e => setFormData({ ...formData, completedAt: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Thumbnail Image</label>
                <div className="flex items-center gap-4">
                  {formData.thumbnailPath && (
                    <img src={`/api/storage${formData.thumbnailPath}`} alt="Thumbnail" className="w-16 h-16 object-cover rounded border" />
                  )}
                  <Button variant="outline" type="button" className="relative overflow-hidden cursor-pointer" disabled={isUploading}>
                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                    Upload Thumbnail
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleThumbnailUpload} />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Overview *</label>
                <Textarea value={formData.overview} onChange={e => setFormData({ ...formData, overview: e.target.value })} rows={4} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Challenge *</label>
                <Textarea value={formData.challenge} onChange={e => setFormData({ ...formData, challenge: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Solution *</label>
                <Textarea value={formData.solution} onChange={e => setFormData({ ...formData, solution: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tech Stack (comma separated) *</label>
                <Input value={formData.techStack} onChange={e => setFormData({ ...formData, techStack: e.target.value })} />
              </div>
              
              <details className="group border border-white/10 rounded-lg p-3">
                <summary className="text-sm font-medium cursor-pointer flex items-center justify-between">
                  Optional Fields (Results, Lessons, SEO)
                </summary>
                <div className="pt-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Results</label>
                    <Textarea value={formData.results} onChange={e => setFormData({ ...formData, results: e.target.value })} rows={2} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Process Notes</label>
                    <Textarea value={formData.processNotes} onChange={e => setFormData({ ...formData, processNotes: e.target.value })} rows={2} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Lessons Learned</label>
                    <Textarea value={formData.lessonsLearned} onChange={e => setFormData({ ...formData, lessonsLearned: e.target.value })} rows={2} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">SEO Title</label>
                    <Input value={formData.seoTitle} onChange={e => setFormData({ ...formData, seoTitle: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">SEO Description</label>
                    <Textarea value={formData.seoDescription} onChange={e => setFormData({ ...formData, seoDescription: e.target.value })} rows={2} />
                  </div>
                </div>
              </details>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsProjectModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProject} disabled={createProject.isPending || updateProject.isPending}>
              {(createProject.isPending || updateProject.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categories Modal */}
      <Dialog open={isCategoriesModalOpen} onOpenChange={setIsCategoriesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Categories</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex gap-2">
              <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="New category name..." />
              <Button onClick={() => { if(newCategoryName) { createCategory.mutate({ data: { name: newCategoryName }}); setNewCategoryName(''); }}}>
                Add
              </Button>
            </div>
            <div className="border border-white/10 rounded-lg divide-y divide-white/10">
              {categories.map((c: ProjectCategory) => (
                <div key={c.id} className="flex justify-between items-center p-3 text-sm">
                  <span>{c.name}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCategory.mutate({ id: c.id })}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {categories.length === 0 && <div className="p-4 text-center text-muted-foreground text-sm">No categories yet.</div>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentProject?.title}"? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => currentProject && deleteProject.mutate({ id: currentProject.id })} disabled={deleteProject.isPending}>
              {deleteProject.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Images Modal */}
      <Dialog open={isImagesModalOpen} onOpenChange={setIsImagesModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Images: {currentProject?.title}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="md:col-span-1 space-y-4 p-4 border border-white/10 rounded-lg bg-card/50">
              <h4 className="font-medium text-sm">Add New Image</h4>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Image Kind</label>
                <select value={imageUploadKind} onChange={e => setImageUploadKind(e.target.value as ProjectImageKind)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="feature">Feature</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Alt Text</label>
                <Input value={imageAltText} onChange={e => setImageAltText(e.target.value)} placeholder="Description..." className="h-9" />
              </div>
              <Button className="w-full relative overflow-hidden" disabled={isUploading}>
                {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                Choose File
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleGalleryUpload} />
              </Button>
            </div>
            
            <div className="md:col-span-2 space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {currentProject?.images && currentProject.images.length > 0 ? (
                currentProject.images.sort((a,b) => a.sortOrder - b.sortOrder).map((img) => (
                  <div key={img.id} className="flex gap-4 p-3 border border-white/10 rounded-lg bg-white/[0.02] items-center">
                    <img src={`/api/storage${img.imagePath}`} alt="" className="w-24 h-16 object-cover rounded bg-black" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/20 text-primary">{img.kind}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{img.altText || 'No alt text'}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeImage.mutate({ id: img.id })} disabled={removeImage.isPending}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground text-sm border border-dashed border-white/20 rounded-lg">
                  No images uploaded yet.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImagesModalOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPortfolioPage() {
  useSEO('Admin — Portfolio', 'Manage portfolio projects and case studies.', { noindex: true });
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

  return <AdminPortfolioContent />;
}
