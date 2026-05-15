'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  LogOut,
  CreditCard as Edit2,
  Save,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase, Division } from '@/lib/supabase';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { SingleFileUpload } from '@/components/ui/single-file-upload';
import { FileUpload } from '@/components/ui/file-upload';
import { toast } from 'sonner';
import Link from 'next/link';

type MembershipStatus = 'none' | 'pending' | 'approved' | 'rejected';

type MemberApplication = {
  id: string;
  status: MembershipStatus;
  division_id: string | null;
  position: string;
  year: string | null;
  rejected_reason: string | null;
  created_at: string;
  division?: Division;
};

export default function ProfilePage() {
  const { user, profile, loading, isAdmin, signIn, signUp, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authLoading, setAuthLoading] = useState(false);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus>('none');
  const [memberApplication, setMemberApplication] = useState<MemberApplication | null>(null);
  const [applyingMembership, setApplyingMembership] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const [profileData, setProfileData] = useState({
    full_name: '',
    nim: '',
    division: '',
    position: '',
    bio: '',
  });

  const [applicationData, setApplicationData] = useState({
    division_id: '',
    position: 'Anggota',
    year: new Date().getFullYear().toString(),
    nim: '',
    phone: '',
    whatsapp: '',
    division_reason: '',
    skills: [] as string[],
    experience: '',
    motivation: '',
    portfolio_url: '',
    // Lampiran wajib
    formulir_url: '',
    motivation_letter_url: '',
    transkrip_urls: [] as string[],
    photo_url: '',
  });
  const [skillInput, setSkillInput] = useState('');

  // Fetch divisions
  useEffect(() => {
    async function fetchDivisions() {
      const { data } = await supabase
        .from('divisions')
        .select('*')
        .order('order_index', { ascending: true });
      if (data) setDivisions(data);
    }
    fetchDivisions();
  }, []);

  // Check membership status
  useEffect(() => {
    async function checkMembershipStatus() {
      if (!user) return;

      // Check if user is already a member
      const { data: memberData } = await supabase
        .from('members')
        .select('*, division:divisions(*)')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (memberData) {
        setMembershipStatus('approved');
        setMemberApplication({
          id: memberData.id,
          status: 'approved',
          division_id: memberData.division_id,
          position: memberData.position,
          year: memberData.year,
          rejected_reason: null,
          created_at: memberData.created_at,
          division: memberData.division,
        });
        return;
      }

      // Check if there's a pending application
      const { data: applicationData } = await supabase
        .from('member_applications')
        .select('*, division:divisions(*)')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (applicationData) {
        setMembershipStatus(applicationData.status);
        setMemberApplication(applicationData);
      } else {
        setMembershipStatus('none');
      }
    }

    checkMembershipStatus();
  }, [user]);

  // Set profile data when profile loads
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        nim: profile.nim || '',
        division: profile.division || '',
        position: profile.position || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (authMode === 'signin') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Selamat datang kembali!');
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Akun berhasil dibuat! Silakan cek email untuk verifikasi.');
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          nim: profileData.nim || null,
          division: profileData.division,
          position: profileData.position,
          bio: profileData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      toast.success('Profil berhasil diperbarui!');
    } catch (error) {
      toast.error('Gagal memperbarui profil');
    }
  };

  const handleApplyMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !applicationData.division_id) return;

    // Validation
    if (!applicationData.phone || !applicationData.whatsapp) {
      toast.error('Mohon isi nomor telepon dan WhatsApp');
      return;
    }
    if (!applicationData.division_reason) {
      toast.error('Mohon jelaskan alasan memilih divisi ini');
      return;
    }
    if (
      !applicationData.formulir_url ||
      !applicationData.motivation_letter_url ||
      applicationData.transkrip_urls.length === 0 ||
      !applicationData.photo_url
    ) {
      toast.error('Mohon lengkapi semua lampiran wajib (Formulir, Surat Motivasi, Transkrip Nilai, Pasfoto)');
      return;
    }

    setApplyingMembership(true);

    try {
      const { error } = await supabase.from('member_applications').insert({
        profile_id: user.id,
        name: profile?.full_name || '',
        email: user.email,
        phone: applicationData.phone,
        whatsapp: applicationData.whatsapp,
        nim: applicationData.nim,
        division_id: applicationData.division_id,
        position: applicationData.position,
        year: applicationData.year,
        division_reason: applicationData.division_reason,
        skills: applicationData.skills,
        experience: applicationData.experience,
        motivation: applicationData.motivation,
        portfolio_url: applicationData.portfolio_url || null,
        formulir_url: applicationData.formulir_url,
        motivation_letter_url: applicationData.motivation_letter_url,
        transkrip_urls: applicationData.transkrip_urls,
        photo_url: applicationData.photo_url,
        status: 'pending',
      });

      if (error) throw error;

      setMembershipStatus('pending');
      toast.success('Pendaftaran terkirim! Mohon tunggu persetujuan admin.');

      // Refresh application status
      const { data } = await supabase
        .from('member_applications')
        .select('*, division:divisions(*)')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) setMemberApplication(data);
    } catch (error: any) {
      console.error('Application submit error:', error);
      toast.error('Gagal mengirim aplikasi. Silakan coba lagi.');
    } finally {
      setApplyingMembership(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !applicationData.skills.includes(skillInput.trim())) {
      setApplicationData({
        ...applicationData,
        skills: [...applicationData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setApplicationData({
      ...applicationData,
      skills: applicationData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleReapply = () => {
    setMembershipStatus('none');
    setMemberApplication(null);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-electric-500 border-t-transparent rounded-full" />
      </div>
    );
  } 

  // Not logged in - show auth form
  if (!user) {
    return (
      <div className="section-padding">
        <div className="container-custom max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-electric-100 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-electric-600" />
              </div>
              <CardTitle className="text-2xl font-heading">
                {authMode === 'signin' ? 'Selamat Datang Kembali' : 'Bergabung dengan KROENG'}
              </CardTitle>
              <p className="text-gray-500 text-sm mt-2">
                {authMode === 'signin'
                  ? 'Masuk untuk mengakses profil Anda'
                  : 'Buat akun untuk bergabung dengan komunitas'}
              </p>
            </CardHeader>
            <CardContent>
              <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'signin' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Masuk</TabsTrigger>
                  <TabsTrigger value="signup">Daftar</TabsTrigger>
                </TabsList>

                <form onSubmit={handleAuth} className="space-y-4">
                  <TabsContent value="signup" className="mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nama Lengkap</Label>
                      <Input
                        id="fullName"
                        placeholder="Masukkan nama lengkap"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required={authMode === 'signup'}
                      />
                    </div>
                  </TabsContent>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Masukkan email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Masukkan kata sandi"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-electric-500 hover:bg-electric-600"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Memuat...
                      </span>
                    ) : authMode === 'signin' ? (
                      'Masuk'
                    ) : (
                      'Buat Akun'
                    )}
                  </Button>
                </form>
              </Tabs>

              <p className="text-center text-sm text-gray-500 mt-6">
                Dengan melanjutkan, Anda menyetujui ketentuan layanan dan kebijakan privasi kami.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const divisionColor =
    membershipStatus === 'approved' && memberApplication?.division?.color
      ? memberApplication.division.color
      : null;

  // Logged in - show profile
  return (
    <div
      className="section-padding min-h-screen transition-colors duration-700"
      style={
        divisionColor
          ? {
              background: `radial-gradient(ellipse at 10% 10%, ${divisionColor}22 0%, transparent 45%),
                           radial-gradient(ellipse at 90% 90%, ${divisionColor}14 0%, transparent 45%)`,
            }
          : undefined
      }
    >
      <div className="container-custom max-w-4xl space-y-6">
        {/* Admin Quick Access */}
        {isAdmin && (
          <Alert className="bg-electric-50 border-electric-200">
            <Shield className="h-4 w-4 text-electric-600" />
            <AlertDescription className="flex items-center justify-between">
              <span>Anda memiliki akses admin.</span>
              <Link href="/admin">
                <Button size="sm" className="bg-electric-500 hover:bg-electric-600">
                  Buka Panel Admin
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <AvatarUpload
                  value={profile?.avatar_url ?? null}
                  name={profile?.full_name || user.email || ''}
                  size="w-16 h-16"
                  onChange={async (url) => {
                    await supabase
                      .from('profiles')
                      .update({ avatar_url: url, updated_at: new Date().toISOString() })
                      .eq('id', user.id);
                    await refreshProfile();
                  }}
                />
                <div>
                  <CardTitle className="text-2xl font-heading">
                    {profile?.full_name || 'Pengguna'}
                  </CardTitle>
                  <p className="text-gray-500">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      className={
                        profile?.role === 'admin'
                          ? 'bg-electric-100 text-electric-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {profile?.role === 'admin' ? 'admin' : profile?.role === 'user' ? 'pengguna' : 'tamu'}
                    </Badge>
                    {membershipStatus === 'approved' && (
                      <Badge
                        style={
                          divisionColor
                            ? { backgroundColor: divisionColor + '20', color: divisionColor, borderColor: divisionColor + '40' }
                            : undefined
                        }
                        className={divisionColor ? 'border' : 'bg-green-100 text-green-700'}
                      >
                        {memberApplication?.division?.name ?? 'Anggota'}
                      </Badge>
                    )}
                    {membershipStatus === 'pending' && (
                      <Badge className="bg-yellow-100 text-yellow-700">Menunggu Review</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 mr-1" />
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUpdateProfile}
                      className="bg-electric-500 hover:bg-electric-600"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Simpan
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit Profil
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  Nama Lengkap
                </Label>
                {isEditing ? (
                  <Input
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  />
                ) : (
                  <p className="text-navy-900 font-medium">{profile?.full_name || '-'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <p className="text-navy-900 font-medium">{user.email}</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <Hash className="w-4 h-4" />
                  NIM
                </Label>
                {isEditing ? (
                  <Input
                    value={profileData.nim}
                    onChange={(e) => setProfileData({ ...profileData, nim: e.target.value })}
                    placeholder="Contoh: 2104101010xxx"
                  />
                ) : (
                  <p className="text-navy-900 font-medium">{profile?.nim || '-'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4" />
                  Divisi
                </Label>
                {isEditing ? (
                  <Input
                    value={profileData.division}
                    onChange={(e) => setProfileData({ ...profileData, division: e.target.value })}
                    placeholder="Contoh: Programmer, Electrical"
                  />
                ) : (
                  <p className="text-navy-900 font-medium">{profile?.division || '-'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  Jabatan
                </Label>
                {isEditing ? (
                  <Input
                    value={profileData.position}
                    onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                    placeholder="Contoh: Anggota, Ketua"
                  />
                ) : (
                  <p className="text-navy-900 font-medium">{profile?.position || '-'}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600">Bio</Label>
              {isEditing ? (
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Ceritakan tentang diri Anda..."
                  rows={4}
                />
              ) : (
                <p className="text-navy-900">{profile?.bio || 'Belum ada bio.'}</p>
              )}
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  signOut();
                  router.push('/');
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Membership Card */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-heading flex items-center gap-2">
              <User className="w-5 h-5 text-electric-600" />
              Status Keanggotaan
            </CardTitle>
            <CardDescription>
              Daftar sebagai anggota resmi KROENG untuk mengakses konten eksklusif dan ikut serta dalam kegiatan komunitas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Status: Approved */}
            {membershipStatus === 'approved' && memberApplication && (
              <div className="p-6 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Anda adalah Anggota KROENG!</h3>
                    <p className="text-green-700 text-sm mt-1">
                      Divisi: {memberApplication.division?.name || '-'}
                    </p>
                    <p className="text-green-700 text-sm">Jabatan: {memberApplication.position}</p>
                    {memberApplication.year && (
                      <p className="text-green-700 text-sm">Angkatan: {memberApplication.year}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status: Pending */}
            {membershipStatus === 'pending' && memberApplication && (
              <div className="p-6 rounded-xl bg-yellow-50 border border-yellow-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-800">Pendaftaran Menunggu Review</h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      Pendaftaran anggota Anda sedang ditinjau oleh tim admin.
                    </p>
                    <p className="text-yellow-700 text-sm mt-2">
                      Divisi yang dipilih: {memberApplication.division?.name || '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status: Rejected */}
            {membershipStatus === 'rejected' && memberApplication && (
              <div className="p-6 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800">Pendaftaran Ditolak</h3>
                    <p className="text-red-700 text-sm mt-1">
                      Mohon maaf, pendaftaran Anda belum disetujui.
                    </p>
                    {memberApplication.rejected_reason && (
                      <p className="text-red-700 text-sm mt-2">
                        Alasan: {memberApplication.rejected_reason}
                      </p>
                    )}
                    <Button
                      onClick={handleReapply}
                      className="mt-4 bg-red-600 hover:bg-red-700"
                      size="sm"
                    >
                      Daftar Ulang
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Status: None - Show Application Form */}
            {membershipStatus === 'none' && (
              <form onSubmit={handleApplyMembership} className="space-y-8">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Isi formulir ini untuk mendaftar sebagai anggota KROENG. Pendaftaran Anda akan
                    ditinjau oleh tim admin.
                  </AlertDescription>
                </Alert>

                {/* Bagian 1: Informasi Kontak */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-navy-900 border-b pb-2">
                    Informasi Kontak
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Nomor Telepon <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={applicationData.phone}
                        onChange={(e) =>
                          setApplicationData({ ...applicationData, phone: e.target.value })
                        }
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">
                        Nomor WhatsApp <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        value={applicationData.whatsapp}
                        onChange={(e) =>
                          setApplicationData({ ...applicationData, whatsapp: e.target.value })
                        }
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nim">NIM</Label>
                      <Input
                        id="nim"
                        value={applicationData.nim}
                        onChange={(e) =>
                          setApplicationData({ ...applicationData, nim: e.target.value })
                        }
                        placeholder="Contoh: 2104101010xxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Angkatan</Label>
                      <Input
                        id="year"
                        value={applicationData.year}
                        onChange={(e) =>
                          setApplicationData({ ...applicationData, year: e.target.value })
                        }
                        placeholder="Contoh: 2024"
                      />
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Pemilihan Divisi */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-navy-900 border-b pb-2">
                    Pemilihan Divisi
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="division">
                        Divisi <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={applicationData.division_id}
                        onValueChange={(value) =>
                          setApplicationData({ ...applicationData, division_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih divisi" />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions.map((division) => (
                            <SelectItem key={division.id} value={division.id}>
                              {division.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Jabatan</Label>
                      <Select
                        value={applicationData.position}
                        onValueChange={(value) =>
                          setApplicationData({ ...applicationData, position: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Anggota">Anggota</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="division_reason">
                      Mengapa Anda memilih divisi ini? <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="division_reason"
                      value={applicationData.division_reason}
                      onChange={(e) =>
                        setApplicationData({ ...applicationData, division_reason: e.target.value })
                      }
                      placeholder="Jelaskan kenapa Anda tertarik pada divisi ini dan kontribusi apa yang ingin Anda berikan..."
                      rows={3}
                      required
                    />
                  </div>
                </div>

                {/* Bagian 3: Keahlian */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-navy-900 border-b pb-2">
                    Keahlian
                  </h3>
                  <div className="space-y-2">
                    <Label>Keahlian Anda (Opsional)</Label>
                    <p className="text-sm text-gray-500">
                      Tambahkan keahlian yang relevan dengan divisi yang dipilih (contoh: Arduino,
                      Python, AutoCAD, 3D Modeling, PCB Design, dll.)
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Ketik keahlian lalu tekan Tambah"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button type="button" onClick={addSkill} variant="secondary">
                        Tambah
                      </Button>
                    </div>
                    {applicationData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {applicationData.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="px-3 py-1 gap-1 cursor-pointer hover:bg-red-100 hover:text-red-700"
                            onClick={() => removeSkill(skill)}
                          >
                            {skill}
                            <X className="w-3 h-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bagian 4: Pengalaman */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-navy-900 border-b pb-2">Pengalaman</h3>
                  <div className="space-y-2">
                    <Label htmlFor="experience">
                      Pengalaman Sebelumnya (Proyek, Kompetisi, Organisasi)
                    </Label>
                    <Textarea
                      id="experience"
                      value={applicationData.experience}
                      onChange={(e) =>
                        setApplicationData({ ...applicationData, experience: e.target.value })
                      }
                      placeholder="Ceritakan pengalaman Anda di bidang robotika, pemrograman, elektronik, atau bidang relevan lainnya. Sertakan kompetisi, proyek, atau organisasi yang pernah Anda ikuti..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio_url">Tautan Portfolio (Opsional)</Label>
                    <Input
                      id="portfolio_url"
                      type="url"
                      value={applicationData.portfolio_url}
                      onChange={(e) =>
                        setApplicationData({ ...applicationData, portfolio_url: e.target.value })
                      }
                      placeholder="https://github.com/username atau https://portfolio-anda.com"
                    />
                  </div>
                </div>

                {/* Bagian 5: Motivasi */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-navy-900 border-b pb-2">Motivasi</h3>
                  <div className="space-y-2">
                    <Label htmlFor="motivation">Mengapa Anda ingin bergabung dengan KROENG?</Label>
                    <Textarea
                      id="motivation"
                      value={applicationData.motivation}
                      onChange={(e) =>
                        setApplicationData({ ...applicationData, motivation: e.target.value })
                      }
                      placeholder="Ceritakan motivasi Anda bergabung dengan KROENG dan tujuan yang ingin dicapai..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Bagian 6: Lampiran Wajib */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-navy-900 border-b pb-2">
                    Lampiran Wajib
                  </h3>
                  <p className="text-sm text-gray-500">
                    Semua lampiran di bawah ini wajib diisi. Maksimal 10 MB per file.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Formulir Pendaftaran (PDF) <span className="text-red-500">*</span>
                      </Label>
                      <SingleFileUpload
                        accept="pdf"
                        value={applicationData.formulir_url || null}
                        onChange={(url) =>
                          setApplicationData({ ...applicationData, formulir_url: url || '' })
                        }
                        disabled={applyingMembership}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Surat Motivasi / Motivation Letter (PDF){' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <SingleFileUpload
                        accept="pdf"
                        value={applicationData.motivation_letter_url || null}
                        onChange={(url) =>
                          setApplicationData({
                            ...applicationData,
                            motivation_letter_url: url || '',
                          })
                        }
                        disabled={applyingMembership}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Pasfoto (JPG/PNG/WebP) <span className="text-red-500">*</span>
                      </Label>
                      <SingleFileUpload
                        accept="image"
                        value={applicationData.photo_url || null}
                        onChange={(url) =>
                          setApplicationData({ ...applicationData, photo_url: url || '' })
                        }
                        disabled={applyingMembership}
                      />
                    </div>
                  </div>

                  {/* Transkrip Nilai — bisa lebih dari 1 PDF */}
                  <div className="space-y-2">
                    <Label>
                      Transkrip Nilai (PDF) <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-500">
                      Bisa upload lebih dari satu PDF (mis. transkrip per semester). Minimal 1 file.
                    </p>
                    <FileUpload
                      accept="pdf"
                      value={applicationData.transkrip_urls}
                      onChange={(urls) =>
                        setApplicationData({ ...applicationData, transkrip_urls: urls })
                      }
                      disabled={applyingMembership}
                      maxFiles={10}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-electric-500 hover:bg-electric-600 h-12 text-lg"
                  disabled={
                    applyingMembership ||
                    !applicationData.division_id ||
                    !applicationData.phone ||
                    !applicationData.whatsapp ||
                    !applicationData.division_reason ||
                    !applicationData.formulir_url ||
                    !applicationData.motivation_letter_url ||
                    applicationData.transkrip_urls.length === 0 ||
                    !applicationData.photo_url
                  }
                >
                  {applyingMembership ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      Mengirim Pendaftaran...
                    </span>
                  ) : (
                    'Kirim Pendaftaran'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}