'use client';

import { useState } from 'react';
import {
  Send,
  Mail,
  MapPin,
  Instagram,
  Linkedin,
  Github,
  CircleCheck as CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ✅ SEO Metadata - untuk client component, buat file metadata terpisah
// Lihat: app/contact/metadata.ts

const collaborationTypes = [
  { value: 'education', label: 'Institusi Pendidikan' },
  { value: 'company', label: 'Perusahaan Teknologi' },
  { value: 'sponsor', label: 'Sponsor Kompetisi' },
  { value: 'project', label: 'Klien Proyek' },
  { value: 'other', label: 'Lainnya' },
];

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'kroengusk@gmail.com' },
  {
    icon: MapPin,
    label: 'Location',
    value:
      'Jln. Tgk. Syech Abdurrauf No.7 Kopelma Darussalam, Kecamatan Syiah Kuala, Kota Banda Aceh, Provinsi Aceh, Indonesia 23111',
  },
];

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/kroengusk' },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/komunitas-robotik-electrical-engineering-usk/',
  },
  { icon: Github, label: 'GitHub', href: 'https://github.com/kroeng-usk' },
];

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const SUBMIT_COOLDOWN_MS = 30_000; // 30 seconds between submissions

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [honeypot, setHoneypot] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    collaboration_type: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check — bots fill hidden fields
    if (honeypot) return;

    // Rate limiting
    const now = Date.now();
    if (now - lastSubmitTime < SUBMIT_COOLDOWN_MS) {
      toast.error('Mohon tunggu sebentar sebelum mengirim pesan lagi.');
      return;
    }

    // Input length validation
    if (formData.name.length > MAX_NAME_LENGTH) {
      toast.error(`Nama maksimal ${MAX_NAME_LENGTH} karakter.`);
      return;
    }
    if (formData.email.length > MAX_EMAIL_LENGTH) {
      toast.error(`Email maksimal ${MAX_EMAIL_LENGTH} karakter.`);
      return;
    }
    if (formData.subject.length > MAX_SUBJECT_LENGTH) {
      toast.error(`Judul maksimal ${MAX_SUBJECT_LENGTH} karakter.`);
      return;
    }
    if (formData.message.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter.`);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('contacts').insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        collaboration_type: formData.collaboration_type || null,
      });

      if (error) throw error;

      setLastSubmitTime(Date.now());
      setSubmitted(true);
      toast.success('Pesan berhasil dikirim!');
    } catch {
      toast.error('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="section-padding">
        <div className="container-custom max-w-2xl">
          <Card className="shadow-xl border-0">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-navy-900 mb-4">
                Pesan Berhasil Dikirim!
              </h2>
              <p className="text-gray-600 mb-8">
                Terima kasih telah menghubungi KROENG. Kami akan segera merespons pesan Anda.
              </p>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                    collaboration_type: '',
                  });
                }}
                variant="outline"
              >
                Kirim Pesan Lainnya
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
            Get in Touch
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2">
            Hubungi Kami
          </h1>
          <p className="text-gray-600 mt-4">
            Punya pertanyaan atau ide kolaborasi? Kami siap diskusi. Hubungi kami melalui form di
            bawah ini atau media sosial kami.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field — hidden from real users, bots fill it */}
                  <div className="absolute opacity-0 -z-10" aria-hidden="true">
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama *</Label>
                      <Input
                        id="name"
                        placeholder="Nama Anda"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        maxLength={MAX_NAME_LENGTH}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contoh@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        maxLength={MAX_EMAIL_LENGTH}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Judul</Label>
                      <Input
                        id="subject"
                        placeholder="Judul pesan"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        maxLength={MAX_SUBJECT_LENGTH}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collaboration">Jenis Kolaborasi</Label>
                      <Select
                        value={formData.collaboration_type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, collaboration_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis (opsional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {collaborationTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan *</Label>
                    <Textarea
                      id="message"
                      placeholder="Jelaskan lebih lanjut tentang pertanyaan atau ide kolaborasi Anda..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      maxLength={MAX_MESSAGE_LENGTH}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-electric-500 hover:bg-electric-600 gap-2 h-12"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Mengirim...
                      </span>
                    ) : (
                      <>
                        Kirim pesan
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-navy-900 to-navy-800">
              <CardContent className="p-6 text-white">
                <h2 className="text-xl font-heading font-semibold mb-6">Informasi Kontak</h2>
                <div className="space-y-4">
                  {contactInfo.map((info) => (
                    <div key={info.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-5 h-5 text-electric-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">{info.label}</p>
                        <p className="font-medium">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0">
              <CardContent className="p-6">
                <h2 className="text-lg font-heading font-semibold text-navy-900 mb-4">
                  Follow Us
                </h2>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-electric-100 flex items-center justify-center text-gray-600 hover:text-electric-600 transition-colors"
                      aria-label={`Follow KROENG di ${social.label}`}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}