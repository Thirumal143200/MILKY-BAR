'use client';

import { useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import {
  Upload,
  Image as ImageIcon,
  X,
  Droplets,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { scansApi } from '@/lib/api/scans';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type UploadStep = 'details' | 'upload' | 'analyzing' | 'done';

export default function ProducerUploadPage() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>('details');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [scanId, setScanId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Step 1: Create scan
  const createScanMutation = useMutation({
    mutationFn: () =>
      scansApi.create(token, { title: title || undefined, notes: notes || undefined }),
    onSuccess: (scan) => {
      setScanId(scan.id);
      setStep('upload');
    },
    onError: () => toast.error('Failed to create scan session'),
  });

  // Step 2: Upload images + analyze
  const uploadAndAnalyzeMutation = useMutation({
    mutationFn: async () => {
      if (!scanId) throw new Error('No scan ID');
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]!);
        await scansApi.uploadImage(token, scanId, formData);
        setUploadProgress(Math.round(((i + 1) / files.length) * 80));
      }
      setUploadProgress(90);
      setStep('analyzing');
      await scansApi.analyze(token, scanId);
      setUploadProgress(100);
      setStep('done');
    },
    onError: () => toast.error('Upload failed. Please try again.'),
  });

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Upload Milk Sample</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Submit your milk sample images for AI quality analysis
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(['details', 'upload', 'analyzing', 'done'] as UploadStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : ['details', 'upload', 'analyzing', 'done'].indexOf(step) > i
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {['details', 'upload', 'analyzing', 'done'].indexOf(step) > i ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                i + 1
              )}
            </div>
            {i < 3 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Scan details */}
      {step === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title (optional)</label>
              <Input
                placeholder="e.g., Morning batch — Farm A"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Any relevant information about this sample..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button
              className="w-full gap-2"
              loading={createScanMutation.isPending}
              onClick={() => createScanMutation.mutate()}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Image upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const selected = Array.from(e.target.files ?? []);
                  setFiles((prev) => [...prev, ...selected]);
                }}
              />
              <Droplets className="h-10 w-10 mx-auto mb-3 text-primary" />
              <p className="font-medium text-sm">Drop milk sample images here</p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, WebP · Max 10MB per image
              </p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              className="w-full gap-2"
              disabled={files.length === 0}
              loading={uploadAndAnalyzeMutation.isPending}
              onClick={() => uploadAndAnalyzeMutation.mutate()}
            >
              <Upload className="h-4 w-4" />
              Upload & Analyze ({files.length} image{files.length !== 1 ? 's' : ''})
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Analyzing */}
      {(step === 'analyzing' || (step === 'upload' && uploadAndAnalyzeMutation.isPending)) && (
        <Card>
          <CardContent className="p-10 text-center">
            <Loader2 className="h-10 w-10 mx-auto mb-4 text-primary animate-spin" />
            <p className="font-medium">AI is analyzing your milk sample...</p>
            <p className="text-sm text-muted-foreground mt-1">This typically takes 10–30 seconds</p>
            <Progress value={uploadProgress} className="mt-6" />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Done */}
      {step === 'done' && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-10 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-4 text-emerald-500" />
            <p className="font-display font-bold text-lg">Analysis Complete!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your milk sample has been analyzed successfully.
            </p>
            <div className="flex gap-3 mt-6 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('details');
                  setFiles([]);
                  setTitle('');
                  setNotes('');
                  setScanId(null);
                  setUploadProgress(0);
                }}
              >
                Upload Another
              </Button>
              <Button onClick={() => router.push(`/producer/scans/${scanId ?? ''}`)}>
                View Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
