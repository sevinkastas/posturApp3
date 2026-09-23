"use client";
/**
 * ScanStage — Canli Akilli Postur Taramasi (v2).
 * Kadraj: MediaPipe Pose iskeleti birincil, hareket yedekli.
 * Video alani: mobilde dikey buyuk (3/4), masaustunde 4/3.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Camera, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Play, Scan, UserCheck, X, Lock, SwitchCamera, Info } from 'lucide-react';
import { useGuide } from '@/lib/guide-context';
import { POSITIONS } from '@/lib/guide-content';
import { ScanProgressBar } from '@/components/guide/scan-progress-bar';
import { GuidePanel } from '@/components/guide/guide-panel';
import { useFramingScanner } from './use-framing-scanner';
import type { CapturedShot } from './use-framing-scanner';
type Orientation = 'front' | 'right' | 'back' | 'left';
type CapturedFrame = { id: Orientation; title: string; image: string };
type PostureResult = {
  overallScore: number;
  parameters: { label: string; value: string; tone: 'good' | 'warn' | 'bad' }[];
  risks: { label: string; percent: number; level: string; tone: 'good' | 'warn' | 'bad' }[];
};
const MOCK_RESULT: PostureResult = {
  overallScore: 82,
  parameters: [
    { label: 'Omurga Egriligi', value: 'Normal', tone: 'good' },
    { label: 'Omuz Hizalamasi', value: 'Iyi', tone: 'good' },
    { label: 'Bas Pozisyonu', value: 'One Egik Risk', tone: 'warn' },
    { label: 'Pelvis / Kalca Hizasi', value: 'Hafif Egik', tone: 'warn' },
    { label: 'Diz Hizalamasi', value: 'Normal', tone: 'good' },
  ],
  risks: [
    { label: 'Servikal duzlesme (boyun duzlesmesi)', percent: 18, level: 'Dusuk', tone: 'good' },
    { label: 'Torakal kifoz artisi (kamburluk)', percent: 32, level: 'Orta', tone: 'warn' },
    { label: 'Lomber lordoz degisimi (bel kavisi)', percent: 24, level: 'Dusuk-Orta', tone: 'warn' },
    { label: 'Skolyotik postur / asimetri', percent: 12, level: 'Dusuk', tone: 'good' },
  ],
};
const HOLD_MS = 3000;
const toneBarColor: Record<string, string> = { good: 'bg-green-500', warn: 'bg-amber-400', bad: 'bg-red-500' };
const toneTextColor: Record<string, string> = { good: 'text-green-600', warn: 'text-amber-500', bad: 'text-red-600' };
export function ScanStage({ onComplete }: { onComplete?: (frames: CapturedFrame[], result: PostureResult) => void }) {
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const mirrored = facing === 'user';
  const [capturedFrames, setCapturedFrames] = useState<CapturedFrame[]>([]);
  const [result, setResult] = useState<PostureResult | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const capturedRef = useRef<CapturedFrame[]>([]);
  const guide = useGuide();
  const guideRef = useRef(guide); guideRef.current = guide;
  const onCapture = useCallback((s: CapturedShot) => {
    const meta = POSITIONS[s.index] ?? POSITIONS[0];
    capturedRef.current[s.index] = { id: meta.id as Orientation, title: meta.title, image: s.image };
  }, []);
  const onDone = useCallback(() => {
    const frames = capturedRef.current.filter(Boolean);
    setCapturedFrames([...frames]);
    setResult(MOCK_RESULT);
    guideRef.current.setLastScore(MOCK_RESULT.overallScore);
    guideRef.current.setScanProgress(POSITIONS.length, POSITIONS.length);
    guideRef.current.setScanPhase('completed');
    onComplete?.(frames, MOCK_RESULT);
  }, [onComplete]);
  const onStep = useCallback((s: string) => {
    if (s === 'framing') { guideRef.current.setScanPhase('framing'); guideRef.current.setScanProgress(0, POSITIONS.length); }
    else if (s === 'scanning') guideRef.current.setScanPhase('scanning');
    else if (s === 'completed') guideRef.current.setScanPhase('completed');
    else if (s === 'idle') guideRef.current.setScanPhase('idle');
  }, []);
  const sc = useFramingScanner({
    mirrored, facing, positionCount: POSITIONS.length, holdMs: HOLD_MS,
    onCapture, onComplete: onDone, onStepChange: onStep,
  });
  const resetScan = useCallback(() => {
    capturedRef.current = [];
    setCapturedFrames([]); setResult(null);
    sc.reset();
  }, [sc]);
  const stopRef = useRef(sc.stop);
  stopRef.current = sc.stop;
  // NOT: [sc] dependency'si DEGIL — hook her render'da yeni obje dondurdugu icin
  // [sc] yazmak her state guncellemesinde cleanup'i calistirip kamerayi kapatiyordu.
  useEffect(() => () => { stopRef.current(); }, []);
  useEffect(() => { if (sc.step === 'scanning') guideRef.current.setScanProgress(sc.posIndex, POSITIONS.length); }, [sc.posIndex, sc.step]);
  const currentPos = POSITIONS[sc.posIndex];
  const secondsLeft = Math.max(0, Math.ceil((sc.holdTarget - sc.holdMs) / 1000));
  const countdownDisplay = secondsLeft === 0 ? '00' : secondsLeft < 10 ? `0${secondsLeft}` : `${secondsLeft}`;
  const showManual = sc.showManual;
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Canli Akilli Postur Taramasi</h1>
        <p className="text-muted-foreground text-sm">Otomatik kadraj algilama ile 4 yonlu (On, Sag, Arka, Sol) sirali postur analizi.</p>
      </div>
      <ScanProgressBar />
      <GuidePanel />
      {sc.cameraError && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /><span>{sc.cameraError}</span>
        </div>
      )}
      <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-lg aspect-[3/4] sm:aspect-[4/3] sm:max-h-[70vh]">
        <video ref={sc.videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" style={{ transform: mirrored ? 'scaleX(-1)' : undefined }} />
        <canvas ref={sc.overlayRef} className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={sc.procRef} width={160} height={120} className="hidden" />
        <canvas ref={sc.snapRef} className="hidden" />
        {(sc.step === 'framing' || sc.step === 'scanning' || sc.step === 'loading') && (
          <div className="absolute right-3 top-3 z-20 flex gap-2">
            <Button onClick={() => { sc.stop(); setFacing((f) => (f === 'user' ? 'environment' : 'user')); setTimeout(() => sc.start(), 150); }} variant="outline" size="sm" className="gap-1.5 bg-black/60 text-white border-white/20 hover:bg-black/80">
              <SwitchCamera className="h-4 w-4" /> {facing === 'user' ? 'Arka Kamera' : 'On Kamera'}
            </Button>
            <Button onClick={resetScan} variant="destructive" size="sm" className="gap-1.5 bg-black/60 hover:bg-destructive text-white border border-white/20">
              <X className="h-4 w-4" /> Kapat
            </Button>
          </div>
        )}
        {sc.step === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 p-6 text-white">
            <Camera className="h-16 w-16 text-primary animate-pulse" />
            {guide.canStartScan ? (
              <>
                <p className="max-w-sm text-center text-sm">Kamerayi acin, cercevenin icinde dik durun. Kadraj dogrulaninca tarama otomatik baslar.</p>
                <Button onClick={sc.start} size="lg" className="gap-2"><Play className="h-4 w-4" /> Taramayi Baslat</Button>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-yellow-300 border border-yellow-400/40">
                  <Lock className="h-3.5 w-3.5" /> Once kilavuz adimlarini tamamlayin
                </span>
                <p className="max-w-sm text-center text-sm">Hazirlik ve Aci Secimi adimlarini tamamlayin.</p>
                <Button onClick={() => guide.setActiveStep(guide.prepDone ? 2 : 1)} size="lg" className="gap-2"><Play className="h-4 w-4" /> Kilavuza Don</Button>
              </>
            )}
          </div>
        )}
        {sc.step === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 text-white">
            <Scan className="h-10 w-10 text-yellow-300 animate-pulse" />
            <p className="text-sm">{sc.loadingPose ? 'YZ yukleniyor...' : 'Kamera aciliyor...'}</p>
          </div>
        )}
        {sc.step === 'framing' && (
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
            <div className="self-center flex items-center gap-2 rounded-full border border-yellow-400/40 bg-black/80 px-5 py-2 text-sm font-medium text-yellow-300 animate-pulse">
              <Scan className="h-4 w-4" /> {sc.hint ?? 'Cercevede dik durun...'}
            </div>
            <div className="self-center rounded-lg bg-black/70 px-4 py-1.5 text-xs text-white">Cerceve icinde dik durun</div>
          </div>
        )}
        {sc.step === 'scanning' && currentPos && (
          <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow">
                {sc.inFrame && <UserCheck className="h-3.5 w-3.5" />} {currentPos.title} ({sc.posIndex + 1}/4)
              </span>
              <span className="rounded-full border border-primary/40 bg-black/80 px-4 py-1 font-mono text-xl text-white">00:{countdownDisplay}</span>
            </div>
            <div className="self-center rounded-xl border border-primary/30 bg-black/80 px-6 py-3 text-center shadow-lg">
              <p className="mb-1 text-lg font-semibold text-white">{currentPos.instruction}</p>
              <p className="text-xs text-muted-foreground">{sc.inFrame ? 'Sabit durun...' : (sc.hint ?? 'Kadraja girin')}</p>
            </div>
          </div>
        )}
      </div>
      {sc.showManual && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm">
          <p className="font-medium">Kadraj hala dogrulanamadi mi?</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Isik yetersiz ya da model yuklenememis olabilir. Dilerseniz sayaci elle baslatabilirsiniz.</p>
          <Button onClick={sc.forceStart} size="sm" className="mt-2">Manuel Baslat</Button>
        </div>
      )}
      <button type="button" onClick={() => setShowDebug((v) => !v)} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
        <Info className="h-3.5 w-3.5" /> {showDebug ? 'Teknik bilgiyi gizle' : 'Teknik bilgi'}
      </button>
      {sc.step === 'completed' && result && (
        <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <h2 className="text-xl font-bold">Tarama Basariyla Tamamlandi</h2>
                <p className="text-sm text-muted-foreground">4 yonlu postur analiz raporunuz olusturuldu.</p>
              </div>
            </div>
            <Button onClick={resetScan} variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Yeniden Tara</Button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/analyses" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary/40 hover:text-primary">Risk Skorlarimi Gor</Link>
            <Link href="/exercises" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Egzersiz Programima Git</Link>
          </div>
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 p-6">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full shadow-inner" style={{ background: `conic-gradient(hsl(var(--primary)) ${result.overallScore * 3.6}deg, hsl(var(--muted)) 0deg)` }}>
                <div className="absolute inset-2 flex items-center justify-center rounded-full bg-card">
                  <span className="text-3xl font-extrabold text-primary">{result.overallScore}</span>
                  <span className="absolute bottom-5 text-xs text-muted-foreground">/100</span>
                </div>
              </div>
              <span className="mt-4 text-sm font-semibold">Genel Postur Skoru</span>
            </div>
            <div className="space-y-3 md:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detayli Parametreler</h3>
              <div className="space-y-2 text-sm">
                {result.parameters.map((p) => (
                  <div key={p.label} className="flex justify-between rounded-lg bg-muted/50 p-2.5">
                    <span className="font-medium">{p.label}:</span>
                    <span className={`font-semibold ${toneTextColor[p.tone]}`}>{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ongorulen Patoloji ve Risk Oranlari</h3>
            <div className="space-y-3">
              {result.risks.map((r) => (
                <div key={r.label}>
                  <div className="mb-1 flex justify-between text-xs font-medium">
                    <span>{r.label}</span>
                    <span className={toneTextColor[r.tone]}>{r.percent}% ({r.level})</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`${toneBarColor[r.tone]} h-full rounded-full transition-[width]`} style={{ width: `${r.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
            {capturedFrames.map((c) => (
              <figure key={c.id} className="space-y-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={`${c.title} karesi`} className="aspect-[3/4] w-full rounded-lg border object-cover" />
                <figcaption className="text-xs text-muted-foreground">{c.title}</figcaption>
              </figure>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Genel skor, parametreler ve risk oranlari su an ornek (mock) verilerdir. Gercek analiz icin yukaridaki 4 kareyi postur-analiz servisinize gondermeniz gerekir.</p>
        </div>
      )}
    </div>
  );
}
export default ScanStage;
