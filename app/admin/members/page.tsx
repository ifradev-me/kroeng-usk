'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Check,
  X,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Mail,
  Building2,
  Calendar,
  Phone,
  Link as LinkIcon,
  Plus,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase, Member, Division } from '@/lib/supabase';
import { toast } from 'sonner';

type MemberApplication = {
  id: string;
  profile_id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  nim: string | null;
  division_id: string | null;
  position: string;
  year: string | null;
  division_reason: string | null;
  skills: string[] | null;
  experience: string | null;
  motivation: string | null;
  portfolio_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejected_reason: string | null;
  created_at: string;
  division?: Division;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
};

type MemberWithDivision = Member & {
  division?: Division;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    role: 'guest' | 'user' | 'admin' | null;
  };
};

export default function AdminMembersPage() {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState<MemberApplication[]>([]);
  const [members, setMembers] = useState<MemberWithDivision[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  // Dialog states
  const [selectedApplication, setSelectedApplication] = useState<MemberApplication | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Edit member dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberWithDivision | null>(null);
  const [editForm, setEditForm] = useState({
    division_id: '',
    position: '',
    is_core_team: false,
    is_admin: false,
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Add member by email dialog
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({
    name: '',
    email: '',
    division_id: '',
    position: '',
    year: '',
    is_core_team: false,
  });
  const [addingMember, setAddingMember] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch divisions
      const { data: divisionsData } = await supabase
        .from('divisions')
        .select('*')
        .order('order_index');
      if (divisionsData) setDivisions(divisionsData);

      // Fetch applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('member_applications')
        .select('*, division:divisions(*), profile:profiles!member_applications_profile_id_fkey(full_name, avatar_url)')
        .order('created_at', { ascending: false });
      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        toast.error('Gagal memuat applications: ' + applicationsError.message);
      }
      if (applicationsData) setApplications(applicationsData);

      // Fetch members
      const { data: membersData } = await supabase
        .from('members')
        .select('*, division:divisions(*), profile:profiles(full_name, avatar_url, email, role)')
        .order('is_core_team', { ascending: false })
        .order('order_index');
      if (membersData) setMembers(membersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // Approve application
  async function handleApprove(application: MemberApplication) {
    setProcessing(true);
    try {
      // Create member record
      const { error: memberError } = await supabase.from('members').insert({
        profile_id: application.profile_id,
        name: application.name,
        position: application.position,
        division_id: application.division_id,
        year: application.year,
        is_core_team: false,
        order_index: 999,
        skills: application.skills ?? [],
      });

      if (memberError) throw memberError;

      // Update application status
      const { error: appError } = await supabase
        .from('member_applications')
        .update({ status: 'approved' })
        .eq('id', application.id);

      if (appError) throw appError;

      // Update profile with division info
      if (application.profile_id) {
        await supabase
          .from('profiles')
          .update({
            division: application.division?.name || null,
            position: application.position,
          })
          .eq('id', application.profile_id);
      }

      toast.success(`${application.name} has been approved as a member!`);
      fetchData();
      setViewDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve application');
    } finally {
      setProcessing(false);
    }
  }

  // Reject application
  async function handleReject() {
    if (!selectedApplication) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('member_applications')
        .update({
          status: 'rejected',
          rejected_reason: rejectReason || null,
        })
        .eq('id', selectedApplication.id);

      if (error) throw error;

      toast.success('Application rejected');
      fetchData();
      setRejectDialogOpen(false);
      setViewDialogOpen(false);
      setRejectReason('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject application');
    } finally {
      setProcessing(false);
    }
  }

  // Delete member
  async function handleDeleteMember(member: MemberWithDivision) {
    if (!confirm(`Are you sure you want to remove ${member.name} from members?`)) return;

    try {
      const { error } = await supabase.from('members').delete().eq('id', member.id);

      if (error) throw error;

      toast.success('Member removed');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    }
  }

  // Open edit dialog for a member
  function openEditDialog(member: MemberWithDivision) {
    setEditingMember(member);
    setEditForm({
      division_id: member.division_id || '',
      position: member.position,
      is_core_team: member.is_core_team,
      is_admin: member.profile?.role === 'admin',
      skills: member.skills ?? [],
    });
    setSkillInput('');
    setEditDialogOpen(true);
  }

  // Save edited member
  async function handleSaveEdit() {
    if (!editingMember) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({
          division_id: editForm.division_id || null,
          position: editForm.position.trim(),
          is_core_team: editForm.is_core_team,
          skills: editForm.skills,
        })
        .eq('id', editingMember.id);

      if (error) throw error;

      // Sync position/division/role to profile if linked
      if (editingMember.profile_id) {
        const selectedDivision = divisions.find((d) => d.id === editForm.division_id);
        const newRole = editForm.is_admin ? 'admin' : 'user';
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            position: editForm.position.trim(),
            division: selectedDivision?.name || null,
            role: newRole,
          })
          .eq('id', editingMember.profile_id);

        if (profileError) throw profileError;
      }

      toast.success(`${editingMember.name} berhasil diperbarui`);
      setEditDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  }

  // Add member directly by email
  async function handleAddMember() {
    if (!addMemberForm.name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }
    if (!addMemberForm.email.trim()) {
      toast.error('Email tidak boleh kosong');
      return;
    }
    if (!addMemberForm.position.trim()) {
      toast.error('Posisi tidak boleh kosong');
      return;
    }

    setAddingMember(true);
    try {
      const { error } = await supabase.from('members').insert({
        name: addMemberForm.name.trim(),
        email: addMemberForm.email.trim().toLowerCase(),
        division_id: addMemberForm.division_id || null,
        position: addMemberForm.position.trim(),
        year: addMemberForm.year.trim() || null,
        is_core_team: addMemberForm.is_core_team,
        order_index: members.length + 1,
        social_links: {},
      });

      if (error) throw error;

      toast.success(`${addMemberForm.name} berhasil ditambahkan sebagai member`);
      setAddMemberDialogOpen(false);
      setAddMemberForm({
        name: '',
        email: '',
        division_id: '',
        position: '',
        year: '',
        is_core_team: false,
      });
      fetchData();
      setActiveTab('members');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan member');
    } finally {
      setAddingMember(false);
    }
  }

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesDivision = filterDivision === 'all' || app.division_id === filterDivision;
    return matchesSearch && matchesStatus && matchesDivision;
  });

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDivision = filterDivision === 'all' || member.division_id === filterDivision;
    return matchesSearch && matchesDivision;
  });

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-1">atur penerimaan member baru dan aplikan</p>
        </div>
        <Button
          onClick={() => setAddMemberDialogOpen(true)}
          className="bg-electric-500 hover:bg-electric-600 gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-sm text-gray-600">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {applications.filter((a) => a.status === 'approved').length}
                </p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {applications.filter((a) => a.status === 'rejected').length}
                </p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="applications" className="gap-2">
            <UserPlus className="w-4 h-4" />
            pelamar
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            Member
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterDivision} onValueChange={setFilterDivision}>
            <SelectTrigger className="w-full sm:w-48">
              <Building2 className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua divisi</SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division.id} value={division.id}>
                  {division.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeTab === 'applications' && (
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-electric-500 border-t-transparent rounded-full" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">belum ada pelamar, Mari Cari pelamar pertama Kita!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pelamar</TableHead>
                      <TableHead>Divisi</TableHead>
                      <TableHead>Posisi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={application.profile?.avatar_url || undefined} />
                              <AvatarFallback className="bg-electric-100 text-electric-700 text-sm">
                                {getInitials(application.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{application.name}</p>
                              <p className="text-sm text-gray-500">{application.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{application.division?.name || '-'}</TableCell>
                        <TableCell>{application.position}</TableCell>
                        <TableCell>{formatDate(application.created_at)}</TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {application.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 h-8"
                                  onClick={() => handleApprove(application)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setRejectDialogOpen(true);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => {
                                setSelectedApplication(application);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-electric-500 border-t-transparent rounded-full" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No members found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Core Team</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={member.image_url || member.profile?.avatar_url || undefined}
                              />
                              <AvatarFallback className="bg-electric-100 text-electric-700 text-sm">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-500">{member.profile?.email || '-'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{member.division?.name || '-'}</Badge>
                        </TableCell>
                        <TableCell>{member.position}</TableCell>
                        <TableCell>{member.year || '-'}</TableCell>
                        <TableCell>
                          {member.is_core_team ? (
                            <Badge className="bg-electric-100 text-electric-700">Core Team</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(member)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Divisi & Posisi
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteMember(member)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>detail pelamar</DialogTitle>
            <DialogDescription>Review lamaran pendaftaran member</DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedApplication.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-electric-100 text-electric-700 text-xl">
                    {getInitials(selectedApplication.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedApplication.name}</h3>
                  <p className="text-gray-500">{selectedApplication.email}</p>
                  <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Label className="text-gray-500 text-xs">Phone</Label>
                    <p className="font-medium">{selectedApplication.phone || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Label className="text-gray-500 text-xs">WhatsApp</Label>
                    <p className="font-medium">
                      {selectedApplication.whatsapp ? (
                        <a
                          href={`https://wa.me/${selectedApplication.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline"
                        >
                          {selectedApplication.whatsapp}
                        </a>
                      ) : (
                        '-'
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Label className="text-gray-500 text-xs">NIM</Label>
                    <p className="font-medium">{selectedApplication.nim || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Label className="text-gray-500 text-xs">Year/Angkatan</Label>
                    <p className="font-medium">{selectedApplication.year || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Division Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Division Selection</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Label className="text-gray-500 text-xs">Division</Label>
                    <p className="font-medium">{selectedApplication.division?.name || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Label className="text-gray-500 text-xs">Position</Label>
                    <p className="font-medium">{selectedApplication.position}</p>
                  </div>
                </div>
                {selectedApplication.division_reason && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <Label className="text-blue-700 text-xs font-medium">
                      Why this division?
                    </Label>
                    <p className="text-sm mt-1">{selectedApplication.division_reason}</p>
                  </div>
                )}
              </div>

              {/* Skills */}
              {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {selectedApplication.experience && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Experience</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedApplication.experience}</p>
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {selectedApplication.portfolio_url && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Portfolio</h4>
                  <a
                    href={selectedApplication.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-electric-600 hover:underline text-sm"
                  >
                    {selectedApplication.portfolio_url}
                  </a>
                </div>
              )}

              {/* Motivation */}
              {selectedApplication.motivation && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Motivation</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedApplication.motivation}</p>
                  </div>
                </div>
              )}

              {/* Application Date */}
              <div className="text-sm text-gray-500 pt-4 border-t">
                Applied on {formatDate(selectedApplication.created_at)}
              </div>

              {/* Rejection Reason */}
              {selectedApplication.status === 'rejected' && selectedApplication.rejected_reason && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <Label className="text-red-700 text-xs font-medium">Rejection Reason</Label>
                  <p className="text-sm text-red-700 mt-1">
                    {selectedApplication.rejected_reason}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-6">
            {selectedApplication?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectDialogOpen(true);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedApplication)}
                  disabled={processing}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {processing ? 'Processing...' : 'Approve'}
                </Button>
              </>
            )}
            {selectedApplication?.status !== 'pending' && (
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Berikan alasan untuk menolak lamaran ini (opsional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectReason">Reason</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Application incomplete, not eligible at this time..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? 'Processing...' : 'Reject Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Ubah divisi dan posisi/jabatan untuk{' '}
              <span className="font-semibold">{editingMember?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Division */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-division">Divisi</Label>
              <Select
                value={editForm.division_id || 'none'}
                onValueChange={(val) =>
                  setEditForm((prev) => ({ ...prev, division_id: val === 'none' ? '' : val }))
                }
              >
                <SelectTrigger id="edit-division">
                  <SelectValue placeholder="Pilih divisi..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Tidak ada divisi —</SelectItem>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Position */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-position">
                Posisi / Jabatan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={editForm.position}
                onValueChange={(val) =>
                  setEditForm((prev) => ({ ...prev, position: val }))
                }
              >
                <SelectTrigger id="edit-position">
                  <SelectValue placeholder="Pilih jabatan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ketua">Ketua</SelectItem>
                  <SelectItem value="Wakil Ketua">Wakil Ketua</SelectItem>
                  <SelectItem value="Sekretaris">Sekretaris</SelectItem>
                  <SelectItem value="Bendahara">Bendahara</SelectItem>
                  <SelectItem value="Ketua Divisi">Ketua Divisi</SelectItem>
                  <SelectItem value="Wakil Ketua Divisi">Wakil Ketua Divisi</SelectItem>
                  <SelectItem value="Anggota">Anggota</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Atau ketik jabatan custom..."
                value={
                  ['Ketua','Wakil Ketua','Sekretaris','Bendahara','Ketua Divisi','Wakil Ketua Divisi','Anggota'].includes(editForm.position)
                    ? ''
                    : editForm.position
                }
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, position: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Tambah skill, lalu Enter..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = skillInput.trim();
                      if (val && !editForm.skills.includes(val)) {
                        setEditForm((prev) => ({ ...prev, skills: [...prev.skills, val] }));
                      }
                      setSkillInput('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const val = skillInput.trim();
                    if (val && !editForm.skills.includes(val)) {
                      setEditForm((prev) => ({ ...prev, skills: [...prev.skills, val] }));
                    }
                    setSkillInput('');
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {editForm.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {editForm.skills.map((skill, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="gap-1 pr-1 bg-electric-50 text-electric-700"
                    >
                      {skill}
                      <button
                        type="button"
                        className="ml-0.5 hover:text-red-500 transition-colors"
                        onClick={() =>
                          setEditForm((prev) => ({
                            ...prev,
                            skills: prev.skills.filter((_, idx) => idx !== i),
                          }))
                        }
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Core Team */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-core-team"
                checked={editForm.is_core_team}
                onCheckedChange={(checked) =>
                  setEditForm((prev) => ({ ...prev, is_core_team: !!checked }))
                }
              />
              <Label htmlFor="edit-core-team" className="cursor-pointer">
                Core Team (pengurus inti)
              </Label>
            </div>

            {/* Admin role — only for members with a linked account */}
            {editingMember?.profile_id ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-is-admin"
                    checked={editForm.is_admin}
                    onCheckedChange={(checked) =>
                      setEditForm((prev) => ({ ...prev, is_admin: !!checked }))
                    }
                  />
                  <Label htmlFor="edit-is-admin" className="cursor-pointer font-medium">
                    Admin website
                  </Label>
                </div>
                <p className="text-xs text-yellow-700 leading-snug">
                  {editForm.is_admin
                    ? 'Member ini akan punya akses penuh ke halaman admin.'
                    : 'Centang untuk memberi akses admin ke akun ini.'}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Role admin tidak bisa diubah — member ini belum punya akun yang terhubung.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editForm.position.trim()}
              className="bg-electric-500 hover:bg-electric-600"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member by Email Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Member Langsung</DialogTitle>
            <DialogDescription>
              Daftarkan member dengan email mereka. Mereka tidak perlu akses website terlebih dahulu.
              Kalau nanti mereka daftar dengan email yang sama, akun mereka akan otomatis terhubung.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="add-name">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-name"
                value={addMemberForm.name}
                onChange={(e) =>
                  setAddMemberForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="cth: Budi Santoso"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="add-email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-email"
                type="email"
                value={addMemberForm.email}
                onChange={(e) =>
                  setAddMemberForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="cth: budi@email.com"
              />
            </div>

            {/* Division */}
            <div className="space-y-1.5">
              <Label htmlFor="add-division">Divisi</Label>
              <Select
                value={addMemberForm.division_id || 'none'}
                onValueChange={(val) =>
                  setAddMemberForm((prev) => ({ ...prev, division_id: val === 'none' ? '' : val }))
                }
              >
                <SelectTrigger id="add-division">
                  <SelectValue placeholder="Pilih divisi..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Tidak ada divisi —</SelectItem>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Position */}
            <div className="space-y-1.5">
              <Label htmlFor="add-position">
                Posisi/Jabatan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-position"
                value={addMemberForm.position}
                onChange={(e) =>
                  setAddMemberForm((prev) => ({ ...prev, position: e.target.value }))
                }
                placeholder="cth: Anggota, Ketua Divisi, Wakil..."
              />
            </div>

            {/* Year */}
            <div className="space-y-1.5">
              <Label htmlFor="add-year">Angkatan</Label>
              <Input
                id="add-year"
                value={addMemberForm.year}
                onChange={(e) =>
                  setAddMemberForm((prev) => ({ ...prev, year: e.target.value }))
                }
                placeholder="cth: 2023"
              />
            </div>

            {/* Core Team */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="add-core-team"
                checked={addMemberForm.is_core_team}
                onCheckedChange={(checked) =>
                  setAddMemberForm((prev) => ({ ...prev, is_core_team: !!checked }))
                }
              />
              <Label htmlFor="add-core-team" className="cursor-pointer">
                Core Team (pengurus inti)
              </Label>
            </div>

          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddMemberDialogOpen(false)}
              disabled={addingMember}
            >
              Batal
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={addingMember}
              className="bg-electric-500 hover:bg-electric-600"
            >
              {addingMember ? 'Menambahkan...' : 'Tambah Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}