import { useRef, useState } from 'react';
import { CheckCircle2, FileText, Loader2, RefreshCw, Upload, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VendorDocument } from '@/types';

export function DocumentUpload({ doc, label, hint, onUpload, disabled }: { doc: VendorDocument; label: string; hint: string; onUpload: (file: File) => Promise<unknown>; disabled?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handle = async (f?: File | null) => { if (!f) return; setError(null); setBusy(true); try { await onUpload(f); } catch (e) { setError((e as { message?: string }).message ?? 'Upload failed'); } finally { setBusy(false); } };
  const done = doc.status === 'UPLOADED' || doc.status === 'VERIFIED';
  return (
    <div className={cn('rounded-lg border bg-white p-4 transition-colors', doc.status === 'VERIFIED' ? 'border-success-600/40' : doc.status === 'REJECTED' ? 'border-error-600/40' : done ? 'border-border-strong' : drag ? 'border-accent-600 bg-accent-50' : 'border-dashed border-border-input')}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}>
      <div className="flex items-start gap-3">
        <span className={cn('h-10 w-10 rounded-md inline-flex items-center justify-center shrink-0', doc.status === 'VERIFIED' ? 'bg-success-50 text-success-600' : doc.status === 'REJECTED' ? 'bg-error-50 text-error-600' : done ? 'bg-cream-200 text-ink-700' : 'bg-cream-100 text-ink-500')}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : doc.status === 'VERIFIED' ? <CheckCircle2 className="h-5 w-5" /> : doc.status === 'REJECTED' ? <XCircle className="h-5 w-5" /> : done ? <FileText className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="text-body font-semibold text-ink-900">{label}</div>
            {doc.status === 'VERIFIED' && <span className="text-caption font-semibold text-success-700">Verified</span>}
            {doc.status === 'UPLOADED' && <span className="text-caption font-semibold text-ink-500">Uploaded</span>}
            {doc.status === 'REJECTED' && <span className="text-caption font-semibold text-error-700">Rejected</span>}
          </div>
          <div className="text-caption text-ink-500 mt-0.5">{hint}</div>
          {done && doc.fileName && <div className="mt-2 text-body-sm text-ink-700 inline-flex items-center gap-1.5"><FileText className="h-4 w-4 text-ink-500" /> {doc.fileName}</div>}
          {doc.extracted && <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-caption">{Object.entries(doc.extracted).map(([k, v]) => <div key={k} className="contents"><dt className="text-ink-500">{k}</dt><dd className="text-ink-700">{v}</dd></div>)}</dl>}
          {doc.note && <p className="mt-2 text-caption text-error-700">{doc.note}</p>}
          {error && <p className="mt-2 text-caption text-error-700">{error}</p>}
          {doc.status !== 'VERIFIED' && !disabled && (
            <button type="button" onClick={() => ref.current?.click()} className={cn('mt-3 inline-flex items-center gap-1.5 text-body-sm font-medium', done ? 'text-ink-700 hover:text-ink-900' : 'text-accent-600 hover:underline')}>
              {done ? <><RefreshCw className="h-4 w-4" /> Replace file</> : <><Upload className="h-4 w-4" /> Choose file or drop it here</>}
            </button>
          )}
          <input ref={ref} type="file" accept=".pdf,image/*" className="sr-only" onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ''; }} />
        </div>
      </div>
    </div>
  );
}
