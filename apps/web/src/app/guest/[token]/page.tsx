'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGuestAccess } from '@/hooks/useGuestAccess';
import { NDASigningFlow } from '@/components/nda/NDASigningFlow';
import { Shield, Clock, FileSignature, Video, AlertCircle, CheckCircle } from 'lucide-react';

export default function GuestAccessPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = useGuestAccess(token);
  const [showSigning, setShowSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-lg p-8">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-500">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  const { guest, meeting } = data;
  const hasSignedNDA = signed || meeting.hasSignedNDA;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600">LegalMeet</span>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Shield className="h-4 w-4 text-green-500" />
            Secure Guest Access
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome, {guest.displayName}</h1>
          <p className="text-slate-500 mt-1">You've been invited to a meeting</p>
        </div>

        {/* Meeting Info */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{meeting.title}</h2>
          {meeting.description && <p className="text-sm text-slate-500 mb-4">{meeting.description}</p>}

          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              {meeting.scheduledAt ? new Date(meeting.scheduledAt).toLocaleString() : 'Time TBD'}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              meeting.status === 'ready' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400'
                : meeting.status === 'awaiting_signatures' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
            }`}>
              {meeting.status?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* NDA Section */}
        {meeting.ndaRequired && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileSignature className="h-5 w-5 text-indigo-500" />
              <h3 className="font-medium text-slate-900 dark:text-white">Non-Disclosure Agreement</h3>
              {hasSignedNDA ? (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />Signed
                </span>
              ) : (
                <span className="text-xs text-amber-600 dark:text-amber-400">Signature required</span>
              )}
            </div>

            {meeting.ndaContent && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-4 max-h-64 overflow-y-auto mb-4">
                <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-sans">{meeting.ndaContent}</pre>
              </div>
            )}

            {!hasSignedNDA && !showSigning && (
              <button
                className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                onClick={() => setShowSigning(true)}
              >
                Review & Sign NDA
              </button>
            )}

            {!hasSignedNDA && showSigning && (
              <NDASigningFlow
                meetingId={meeting.id}
                templateContent={meeting.ndaContent || ''}
                templateName="Meeting NDA"
                participantId={guest.participantId}
                signerName={guest.displayName}
                signerEmail={guest.email}
                guestToken={token}
                onComplete={() => {
                  setSigned(true);
                  setShowSigning(false);
                }}
              />
            )}
          </div>
        )}

        {/* Join Meeting */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-indigo-500" />
            <h3 className="font-medium text-slate-900 dark:text-white">Join Meeting</h3>
          </div>
          <button
            disabled={meeting.ndaRequired && !hasSignedNDA}
            className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {meeting.ndaRequired && !hasSignedNDA ? 'Sign NDA to join' : 'Join Video Call'}
          </button>
        </div>
      </div>
    </div>
  );
}
