'use client';

import { useState, useEffect } from 'react';
import { Mail, MailOpen, Archive, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase, Contact } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-gray-100 text-gray-700',
  replied: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
};

const collaborationLabels: Record<string, string> = {
  education: 'Institusi Pendidikan',
  company: 'Perusahaan Teknologi',
  sponsor: 'Sponsor Kompetisi',
  project: 'Klien Proyek',
  other: 'Lainnya',
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setContacts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('contacts').update({ status }).eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      fetchContacts();
    }
  };

  const handleView = async (contact: Contact) => {
    setSelectedContact(contact);
    if (contact.status === 'new') {
      await updateStatus(contact.id, 'read');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete message');
    } else {
      toast.success('Message deleted');
      setSelectedContact(null);
      fetchContacts();
    }
  };

  const newCount = contacts.filter((c) => c.status === 'new').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-navy-900">
            Contact Messages
            {newCount > 0 && (
              <span className="ml-3 px-2 py-1 bg-electric-100 text-electric-700 text-sm rounded-full">
                {newCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-2">atur dan review permintaan / pesan dari kontak</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No contact messages yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <Card
              key={contact.id}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${
                contact.status === 'new' ? 'border-l-4 border-l-electric-500' : ''
              }`}
              onClick={() => handleView(contact)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      contact.status === 'new'
                        ? 'bg-electric-100 text-electric-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {contact.status === 'new' ? (
                      <Mail className="w-5 h-5" />
                    ) : (
                      <MailOpen className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">
                      {contact.name}
                      <Badge className={`ml-2 ${statusColors[contact.status]}`}>
                        {contact.status}
                      </Badge>
                    </h3>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {contact.subject || contact.message}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {format(new Date(contact.created_at), 'dd MMM yyyy')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(contact.created_at), 'HH:mm')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        {selectedContact && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Message from {selectedContact.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium">{selectedContact.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <p className="font-medium">
                    {format(new Date(selectedContact.created_at), 'dd MMMM yyyy, HH:mm')}
                  </p>
                </div>
                {selectedContact.subject && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Subject:</span>
                    <p className="font-medium">{selectedContact.subject}</p>
                  </div>
                )}
                {selectedContact.collaboration_type && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Collaboration Type:</span>
                    <p className="font-medium">
                      {collaborationLabels[selectedContact.collaboration_type] ||
                        selectedContact.collaboration_type}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <span className="text-gray-500 text-sm">Message:</span>
                <p className="mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(selectedContact.id, 'replied')}
                  >
                    Mark as Replied
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(selectedContact.id, 'archived')}
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Archive
                  </Button>
                </div>
                <div className="flex gap-2">
                  <a href={`mailto:${selectedContact.email}`}>
                    <Button size="sm" className="bg-electric-500 hover:bg-electric-600">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Reply via Email
                    </Button>
                  </a>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedContact.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
