import { useState, useRef, useEffect } from 'react';
import { useSubmitJobApplication, useRequestResumeUploadUrl } from '@workspace/api-client-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertCircle, UploadCloud, X, Loader2, ChevronDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

export interface ApplicationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobId?: number | null;
  defaultRole?: string;
}

const PREFERRED_ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'AI Engineer', 
  'Machine Learning Engineer', 'Python Developer', 'Java Developer', 'UI/UX Designer', 
  'DevOps Engineer', 'QA Engineer', 'Business Analyst', 'Data Analyst', 
  'Digital Marketing', 'Graphic Designer', 'Video Editor', 'Content Writer', 
  'Sales Executive', 'HR', 'Internship', 'Other'
];

export function ApplicationModal({ isOpen, onOpenChange, jobId, defaultRole }: ApplicationModalProps) {
  const [submittedData, setSubmittedData] = useState<{ referenceNumber?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', city: '', qualification: '',
    college: '', graduationYear: '', experience: '', skills: '',
    linkedin: '', github: '', portfolio: '', preferredRole: defaultRole || '',
    expectedSalary: '', joiningAvailability: '', resumePath: '', coverLetter: '', website: ''
  });

  const [roleOpen, setRoleOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Keep form data synced with defaultRole if modal reopens for a new job
  useEffect(() => {
    if (isOpen && defaultRole) {
      setFormData(prev => ({ ...prev, preferredRole: defaultRole }));
    }
  }, [isOpen, defaultRole]);

  // Combine standard roles with defaultRole if it's not already in the list
  const availableRoles = [...PREFERRED_ROLES];
  if (defaultRole && !availableRoles.includes(defaultRole)) {
    availableRoles.push(defaultRole);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestUploadUrl = useRequestResumeUploadUrl();
  const submitApplication = useSubmitJobApplication({
    mutation: {
      onSuccess: (data) => {
        setSubmittedData(data);
        setErrorMsg(null);
      },
      onError: (err: any) => {
        if (err?.status === 429) {
          setErrorMsg("Too many requests. Please try again later.");
        } else {
          setErrorMsg(err?.body?.error || "Something went wrong. Please try again.");
        }
      }
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg("Resume must be smaller than 10MB.");
      return;
    }
    
    // Validate type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMsg("Only PDF, DOC, or DOCX files are allowed.");
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!file) return null;
    try {
      setIsUploading(true);
      const res = await requestUploadUrl.mutateAsync({
        data: {
          fileName: file.name,
          fileSize: file.size
        }
      });
      
      const uploadRes = await fetch(res.uploadURL, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      
      if (!uploadRes.ok) {
        throw new Error('Failed to upload file to storage');
      }
      return res.objectPath;
    } catch (err: any) {
      setErrorMsg("Failed to upload resume. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic required fields check
    if (!formData.fullName || !formData.email || !formData.phone || !formData.city || 
        !formData.qualification || !formData.skills || !formData.preferredRole || !file) {
      setErrorMsg("Please fill in all required fields, including resume upload.");
      return;
    }

    let finalResumePath = formData.resumePath;
    
    // If there is a file selected but not yet uploaded
    if (file && !finalResumePath) {
      const uploadedPath = await uploadFile();
      if (!uploadedPath) return; // Error already set
      finalResumePath = uploadedPath;
    }

    submitApplication.mutate({
      data: {
        jobId: jobId || null,
        ...formData,
        resumePath: finalResumePath
      }
    });
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset state if it was successful, or keep it if they accidentally closed it?
      // Typically reset on close if successful.
      if (submittedData) {
        setSubmittedData(null);
        setFormData({
          fullName: '', email: '', phone: '', city: '', qualification: '',
          college: '', graduationYear: '', experience: '', skills: '',
          linkedin: '', github: '', portfolio: '', preferredRole: '',
          expectedSalary: '', joiningAvailability: '', resumePath: '', coverLetter: '', website: ''
        });
        setFile(null);
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto glassmorphism border-white/10 text-foreground p-5 sm:p-8">
        {submittedData ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2 font-display">✅ Application Submitted Successfully</h2>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 my-6 inline-block mx-auto min-w-[250px]">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Reference Number</p>
              <p className="text-xl font-mono text-primary font-bold">{submittedData.referenceNumber}</p>
            </div>
            <p className="text-muted-foreground mt-2">
              Our recruitment team will review your application.
            </p>
            <Button className="mt-8 glow-purple" onClick={() => handleClose(false)}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold font-display">Submit Your Profile</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                We're excited to learn more about you. Fill out the form below to apply.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4 border border-white/10 rounded-xl p-4 sm:p-5 bg-white/[0.02]">
                <h3 className="font-semibold text-lg font-display">Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
                    <Input required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email *</label>
                    <Input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Phone *</label>
                    <Input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 8900" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Current City *</label>
                    <Input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="San Francisco, CA" />
                  </div>
                </div>
              </div>

              {/* Education & Experience */}
              <div className="space-y-4 border border-white/10 rounded-xl p-4 sm:p-5 bg-white/[0.02]">
                <h3 className="font-semibold text-lg font-display">Education & Experience</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Highest Qualification *</label>
                    <Input required value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} placeholder="B.Tech in Computer Science" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">College/University</label>
                    <Input value={formData.college} onChange={(e) => setFormData({...formData, college: e.target.value})} placeholder="University Name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Graduation Year</label>
                    <Input type="number" min="1950" max="2030" value={formData.graduationYear} onChange={(e) => setFormData({...formData, graduationYear: e.target.value})} placeholder="2023" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Experience</label>
                    <select 
                      className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={formData.experience} 
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    >
                      <option value="" className="bg-background text-foreground">Select Experience</option>
                      <option value="0-1 Years" className="bg-background text-foreground">0-1 Years</option>
                      <option value="1-3 Years" className="bg-background text-foreground">1-3 Years</option>
                      <option value="3-5 Years" className="bg-background text-foreground">3-5 Years</option>
                      <option value="5+ Years" className="bg-background text-foreground">5+ Years</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium mb-1.5 block">Core Skills *</label>
                    <Input required value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="React, Node.js, Python, AWS (comma separated)" />
                  </div>
                </div>
              </div>

              {/* Role & Application Details */}
              <div className="space-y-4 border border-white/10 rounded-xl p-4 sm:p-5 bg-white/[0.02]">
                <h3 className="font-semibold text-lg font-display">Role & Application</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1.5 block">Preferred Role *</label>
                    <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={roleOpen}
                          className="w-full justify-between font-normal"
                        >
                          <span className="truncate">
                            {formData.preferredRole || "Select a role"}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 glassmorphism border-white/10" align="start">
                        <Command>
                          <CommandInput placeholder="Search roles..." />
                          <CommandList>
                            <CommandEmpty>No role found.</CommandEmpty>
                            <CommandGroup>
                              {availableRoles.map((role) => (
                                <CommandItem
                                  key={role}
                                  value={role}
                                  onSelect={(currentValue) => {
                                    const originalValue = availableRoles.find(
                                      (r) => r.toLowerCase() === currentValue.toLowerCase()
                                    ) || role;
                                    setFormData({ ...formData, preferredRole: originalValue });
                                    setRoleOpen(false);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", formData.preferredRole === role ? "opacity-100" : "opacity-0")} />
                                  {role}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Expected Salary</label>
                    <Input value={formData.expectedSalary} onChange={(e) => setFormData({...formData, expectedSalary: e.target.value})} placeholder="e.g. ₹12 LPA or $80k" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Available to Join</label>
                    <select 
                      className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={formData.joiningAvailability} 
                      onChange={(e) => setFormData({...formData, joiningAvailability: e.target.value})}
                    >
                      <option value="" className="bg-background text-foreground">Select Availability</option>
                      <option value="Immediately" className="bg-background text-foreground">Immediately</option>
                      <option value="15 Days" className="bg-background text-foreground">15 Days</option>
                      <option value="30 Days" className="bg-background text-foreground">30 Days</option>
                      <option value="60 Days" className="bg-background text-foreground">60 Days</option>
                      <option value="Other" className="bg-background text-foreground">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">LinkedIn</label>
                    <Input value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">GitHub</label>
                    <Input value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Portfolio</label>
                    <Input value={formData.portfolio} onChange={(e) => setFormData({...formData, portfolio: e.target.value})} placeholder="https://..." />
                  </div>
                </div>
              </div>

              {/* Resume & Cover Letter */}
              <div className="space-y-4 border border-white/10 rounded-xl p-4 sm:p-5 bg-white/[0.02]">
                <h3 className="font-semibold text-lg font-display">Resume & Cover Letter</h3>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Resume Upload * <span className="text-xs text-muted-foreground font-normal">(PDF, DOC, DOCX up to 10MB)</span></label>
                  <div className="flex items-center gap-4">
                    {file ? (
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex-1">
                        <UploadCloud className="w-5 h-5 text-primary" />
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button type="button" variant="ghost" size="icon" className="w-8 h-8 hover:text-destructive" onClick={() => { setFile(null); setFormData({...formData, resumePath: ''}); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full border-dashed border-2 py-8 bg-transparent hover:bg-white/5 hover:border-primary/50 text-muted-foreground"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <UploadCloud className="w-5 h-5 mr-2" />
                        Click to browse for resume
                      </Button>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Cover Letter (Optional)</label>
                  <Textarea value={formData.coverLetter} onChange={(e) => setFormData({...formData, coverLetter: e.target.value})} placeholder="Tell us why you'd be a great fit..." rows={4} />
                </div>
              </div>

              {/* Honeypot field */}
              <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
                <label htmlFor="app-website">Website</label>
                <input
                  id="app-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full glow-purple"
                disabled={submitApplication.isPending || isUploading}
              >
                {(submitApplication.isPending || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isUploading ? 'Uploading Resume...' : submitApplication.isPending ? 'Submitting Application...' : 'Submit Application'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
