'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@legalmeet/ui';
import { Check, ChevronRight } from 'lucide-react';
import { SignatureCanvas } from './SignatureCanvas';
import { useSignNDA } from '@/hooks/useNDA';

interface NDASigningFlowProps {
  meetingId: string;
  templateContent: string;
  templateName: string;
  participantId?: string;
  signerName?: string;
  signerEmail?: string;
  guestToken?: string;
  onComplete: () => void;
}

export function NDASigningFlow({ meetingId, templateContent, templateName, participantId, signerName = 'Demo User', signerEmail = 'demo@legalmeet.com', guestToken, onComplete }: NDASigningFlowProps) {
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const signNDA = useSignNDA();

  const steps = ['Review NDA', 'Sign', 'Confirm'];

  const handleConfirm = async () => {
    if (!signatureData) return;
    await signNDA.mutateAsync({
      meetingId,
      participantId,
      signatureData,
      signerName,
      signerEmail,
      guestToken,
    });
    onComplete();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sign: {templateName}</CardTitle>
        <div className="flex items-center gap-2 mt-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className="text-xs text-slate-500">{s}</span>
              {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {step === 0 && (
          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border text-sm font-mono whitespace-pre-wrap">
              {templateContent}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="rounded border-slate-300" />
              <span className="text-sm">I have read and understood this agreement</span>
            </label>
            <div className="flex justify-end">
              <Button onClick={() => setStep(1)} disabled={!agreed}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Draw your signature below:</p>
            <SignatureCanvas onSave={(data) => { setSignatureData(data); setStep(2); }} />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            </div>
          </div>
        )}

        {step === 2 && signatureData && (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <Check className="h-5 w-5" />
              <span className="font-medium">Signature captured</span>
            </div>
            <img src={signatureData} alt="Your signature" className="mx-auto border rounded p-2 bg-white max-h-24" />
            <p className="text-xs text-slate-500">Signed at: {new Date().toISOString()}</p>
            <p className="text-xs text-slate-500">Signer: {signerName} ({signerEmail})</p>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleConfirm} disabled={signNDA.isPending}>
                {signNDA.isPending ? 'Signing...' : 'Confirm & Sign'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
