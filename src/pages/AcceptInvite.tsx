import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCheck, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    loadInvite();
  }, [token]);

  const loadInvite = async () => {
    try {
      // TODO: Fetch invite from Firestore by token
      // const inviteQuery = query(collection(db, 'invites'), where('token', '==', token));
      // const inviteSnapshot = await getDocs(inviteQuery);

      // Mock invite data for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockInvite = {
        id: token,
        agreementId: 'mock-agreement-id',
        createdBy: 'Parent A',
        email: 'coparent@example.com',
        status: 'pending',
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      };

      // Check if expired
      if (mockInvite.expiresAt < new Date()) {
        setError('This invitation has expired');
      } else if (mockInvite.status !== 'pending') {
        setError('This invitation has already been used');
      } else {
        setInviteData(mockInvite);
      }
    } catch (err) {
      console.error('Error loading invite:', err);
      setError('Invalid or expired invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      // Redirect to sign up with invite token
      navigate('/signup?invite=' + token);
      return;
    }

    setAccepting(true);

    try {
      // TODO: Update invite status and add user to agreement
      // await updateDoc(doc(db, 'invites', inviteData.id), {
      //   status: 'accepted',
      //   acceptedAt: serverTimestamp(),
      //   acceptedBy: user.uid,
      // });

      // await updateDoc(doc(db, 'agreements', inviteData.agreementId), {
      //   parent2Id: user.uid,
      //   updatedAt: serverTimestamp(),
      // });

      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error accepting invite:', err);
      setError('Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-spin" />
          <p className="text-zinc-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-zinc-800 mb-2">Invalid Invitation</h1>
          <p className="text-zinc-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/signin')}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <UserCheck className="w-16 h-16 mx-auto mb-4 text-secondary-500" />
          <h1 className="text-2xl font-bold text-zinc-800 mb-2">You're Invited!</h1>
          <p className="text-zinc-600">
            <strong>{inviteData?.createdBy}</strong> has invited you to join their CoParent agreement.
          </p>
        </div>

        <div className="mb-6 p-4 bg-zinc-50 rounded-lg">
          <h3 className="font-semibold text-zinc-800 mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="text-secondary-500">✓</span>
              <span>Access shared custody schedules</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary-500">✓</span>
              <span>Track shared expenses and payments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary-500">✓</span>
              <span>View important documents and agreements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary-500">✓</span>
              <span>Manage holiday schedules together</span>
            </li>
          </ul>
        </div>

        {!user && (
          <div className="mb-6 p-4 bg-alert-50 border border-alert-200 rounded-lg">
            <p className="text-sm text-alert-800">
              You'll need to create an account or sign in to accept this invitation.
            </p>
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full py-3 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {accepting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Accepting...
            </span>
          ) : user ? (
            'Accept Invitation'
          ) : (
            'Sign Up to Accept'
          )}
        </button>

        {user && (
          <p className="mt-4 text-center text-sm text-zinc-500">
            Logged in as {user.email}
          </p>
        )}
      </div>
    </div>
  );
}
