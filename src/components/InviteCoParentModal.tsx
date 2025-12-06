import { useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface InviteCoParentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteCoParentModal({ isOpen, onClose }: InviteCoParentModalProps) {
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user: _user } = useAuth();

  const generateInviteLink = async () => {
    setLoading(true);

    try {
      // TODO: Create invite in Firestore and get token
      // For now, generate a mock invite link
      const token = Math.random().toString(36).substring(2, 15);
      const link = `${window.location.origin}/invite/${token}`;

      // TODO: Save invite to Firestore
      // await addDoc(collection(db, 'invites'), {
      //   agreementId: userAgreementId,
      //   createdBy: user?.uid,
      //   email,
      //   role: 'parent',
      //   status: 'pending',
      //   token,
      //   expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
      //   createdAt: serverTimestamp(),
      // });

      setInviteLink(link);

      // TODO: Send email notification
      console.log('Invite created for:', email);
    } catch (error) {
      console.error('Error creating invite:', error);
      alert('Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateInviteLink();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Invite Co-Parent</AlertDialogTitle>
          <AlertDialogDescription asChild>
            {!inviteLink ? (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <p className="text-zinc-600">
                  Send an invitation to your co-parent to join this agreement. They'll receive an email
                  with a secure link to create their account.
                </p>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-2">
                    Co-Parent Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="coparent@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="p-4 bg-alert-50 border border-alert-200 rounded-lg">
                  <p className="text-sm text-alert-800">
                    ⚠️ Make sure this email is correct. The invite link will be valid for 7 days.
                  </p>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                  <AlertDialogAction type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Send Invite'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            ) : (
              <div className="space-y-4 pt-2">
                <p className="text-zinc-600">
                  Invitation created successfully! Share this link with <strong>{email}</strong>:
                </p>

                <div className="p-4 bg-zinc-50 border border-zinc-300 rounded-lg">
                  <p className="text-sm text-zinc-700 break-all mb-3">{inviteLink}</p>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors w-full justify-center"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
                  <p className="text-sm text-secondary-800">
                    ✅ An email has been sent to {email} with the invitation link.
                  </p>
                </div>

                <AlertDialogFooter>
                  <AlertDialogAction onClick={onClose} className="w-full">
                    Done
                  </AlertDialogAction>
                </AlertDialogFooter>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
