"use client";

/**
 * ScanStage — Canlı Akıllı Postür Taraması
 *
 * KURAL 1 — Otomatik kadraj + sıralı 4 yönlü tarama:
 *   Kadraj kontrolü gerçek bir algılamaya dayanır (harici kütüphane YOK):
 *   video.requestVideoFrameCallback → tarayıcının her yeni kare geldiğinde
 *   tetiklediği native event listener. Kamera açılır açılmaz "boş sahne"
 *   referans olarak alınır; sonraki her karede referansla fark hesaplanıp
 *   kişinin sınır kutusu (bounding box) çıkarılır. Kutu kadrajın ortasında,
 *   yeterince büyük ve kenarlara değmiyorsa kadraj DOĞRULANMIŞ sayılır ve
 *   tarama kendiliğinden başlar (buton/tuş yok).
 *   Doğrulama sonrası Ön → Sağ Yan → Arka → Sol Yan sırasıyla ilerlenir;
 *   her pozisyonda kullanıcı TAM 3 SANİYE sabit durmalıdır (gerçek zamanlı
 *   sayaç). Kadraj o sırada bozulursa sayaç durur, düzelince kaldığı yerden
 *   devam eder.
 *
 * KURAL 2 — Analiz Sonuçları ve Risk Modülü:
 *   Tarama bitince dairesel Genel Skor, Detaylı Parametreler listesi ve
 *   Öngörülen Patoloji/Risk Oranları (yüzdesel bar) aynen istenen yapıda
 *   gösterilir. NOT: Skor ve risk değerleri burada örnek/mock veridir;
 *   gerçek analiz için bu değerlerin bir postür-analiz servisinden/backend'den
 *   gelmesi gerekir — capturedFrames dizisi bu servise gönderilecek 4 kareyi
 *   içerir.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Camera, CheckCircle2, AlertTriangle, RefreshCw, Play, Scan, UserCheck, X, Lock } from "lucide-react";
import { useGuide } from "@/lib/guide-context";
import { POSITIONS } from "@/lib/guide-content";
import { ScanProgressBar } from "@/components/guide/scan-progress-bar";
import { GuidePanel } from "@/components/guide/guide-panel";

/* ------------------------------------------------------------------ */
/* Ayarlar                                                             */
/* ------------------------------------------------------------------ */

const PROC_W = 160;
const PROC_H = 120;

const DIFF_THRESHOLD = 28; // piksel fark eşiği (0-255)
const EDGE_MARGIN = 0.04; // kadraj kenar payı (oran)
const MIN_HEIGHT_RATIO = 0.55; // sınır kutusunun kaplaması gereken min. yükseklik oranı
const MIN_FILL_RATIO = 0.015; // "kişi var" sayılması için min. değişen piksel oranı
const STABLE_FRAMES = 3; // ardışık kaç karede doğrulanacak (gürültüye karşı, sabit süre DEĞİL)

const POSITION_HOLD_MS = 3000; // her pozisyonda sabit durma süresi — GERÇEK sayaç
const LOST_GRACE_MS = 500; // kadraj kısa süreliğine bozulursa sayacı sıfırlama toleransı

type Orientation = "front" | "right" | "back" | "left";

type Step = "idle" | "calibrating" | "framing" | "scanning" | "completed";
type CapturedFrame = { id: Orientation; title: string; image: string };
type Box = { x: number; y: number; width: number; height: number } | null;

/* Analiz sonuçları için mock veri yapısı — gerçek entegrasyonda backend'den gelmeli. */
type PostureResult = {
  overallScore: number;
  parameters: { label: string; value: string; tone: "good" | "warn" | "bad" }[];
  risks: { label: string; percent: number; level: string; tone: "good" | "warn" | "bad" }[];
};

const MOCK_RESULT: PostureResult = {
  overallScore: 82,
  parameters: [
    { label: "Omurga Eğriliği", value: "Normal", tone: "good" },
    { label: "Omuz Hizalaması", value: "İyi", tone: "good" },
    { label: "Baş Pozisyonu", value: "Öne Eğik Risk", tone: "warn" },
    { label: "Pelvis / Kalça Hizası", value: "Hafif Eğik", tone: "warn" },
    { label: "Kürek Kemiği Simetrisi", value: "Simetrik", tone: "good" },
  ],
  risks: [
    { label: "Boyun Düzleşmesi / Forward Head Risk", percent: 68, level: "Orta Risk", tone: "warn" },
    { label: "Kifoz (Kamburluk Eğilimi)", percent: 24, level: "Düşük Risk", tone: "good" },
    { label: "Pelvik Tilt (Kalça Asimetrisi)", percent: 45, level: "Hafif Risk", tone: "warn" },
  ],
};

const toneBarColor: Record<string, string> = {
  good: "bg-green-500",
  warn: "bg-amber-500",
  bad: "bg-red-500",
};
const toneTextColor: Record<string, string> = {
  good: "text-green-600",
  warn: "text-amber-500",
  bad: "text-red-600",
};

/* ------------------------------------------------------------------ */
/* Bileşen                                                             */
/* ------------------------------------------------------------------ */

export function ScanStage({
  mirrored = true,
  onComplete,
}: {
  /** Video CSS ile aynalanıyorsa true (ön kamera için tipik). */
  mirrored?: boolean;
  /** Tarama bitince 4 kare + (mock) sonuç dışarı verilir. */
  onComplete?: (frames: CapturedFrame[], result: PostureResult) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const procRef = useRef<HTMLCanvasElement | null>(null);
  const snapshotRef = useRef<HTMLCanvasElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const referenceRef = useRef<Uint8ClampedArray | null>(null);
  const vfcHandleRef = useRef<number | null>(null);

  const stepRef = useRef<Step>("idle");
  const posIndexRef = useRef(0);
  const stableCountRef = useRef(0);
  const holdMsRef = useRef(0);
  const lostMsRef = useRef(0);
  const lastTsRef = useRef(0);
  const capturedRef = useRef<CapturedFrame[]>([]);

  const [step, setStep] = useState<Step>("idle");
  const [posIndex, setPosIndex] = useState(0);
  const [holdMs, setHoldMs] = useState(0);
  const [inFrame, setInFrame] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [box, setBox] = useState<Box>(null);
  const [capturedFrames, setCapturedFrames] = useState<CapturedFrame[]>([]);
  const [result, setResult] = useState<PostureResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Yönlendirme Asistanı durumu — kılavuz adımları tarama fazıyla senkron ilerler.
  // guide nesnesi her render'da değiştiği için ref üzerinden erişilir (döngü engeli).
  const guide = useGuide();
  const guideRef = useRef(guide);
  guideRef.current = guide;

  const setStepBoth = useCallback((s: Step) => {
    stepRef.current = s;
    setStep(s);
    // Tarama barı + kılavuz paneli bu faz bilgisiyle canlı güncellenir.
    if (s === "framing") guideRef.current.setScanPhase("framing");
    else if (s === "scanning") guideRef.current.setScanPhase("scanning");
    else if (s === "completed") guideRef.current.setScanPhase("completed");
    else if (s === "idle") guideRef.current.setScanPhase("idle");
  }, []);

  /* ---------------- temizlik ---------------- */

  const stopCamera = useCallback(() => {
    const video = videoRef.current;
    if (video && vfcHandleRef.current !== null) {
      // @ts-ignore — cancelVideoFrameCallback bazı TS lib sürümlerinde tanımlı değil
      video.cancelVideoFrameCallback?.(vfcHandleRef.current);
    }
    vfcHandleRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (video) video.srcObject = null;
    referenceRef.current = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  /* ---------------- kare okuma ---------------- */

  const readFrame = useCallback((): Uint8ClampedArray | null => {
    const video = videoRef.current;
    const proc = procRef.current;
    if (!video || !proc || video.readyState < 2) return null;
    const ctx = proc.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, PROC_W, PROC_H);
    return ctx.getImageData(0, 0, PROC_W, PROC_H).data;
  }, []);

  const diffBoundingBox = useCallback((current: Uint8ClampedArray, reference: Uint8ClampedArray) => {
    let minX = PROC_W,
      minY = PROC_H,
      maxX = 0,
      maxY = 0,
      changed = 0;

    for (let y = 0; y < PROC_H; y++) {
      for (let x = 0; x < PROC_W; x++) {
        const i = (y * PROC_W + x) * 4;
        const diff =
          (Math.abs(current[i] - reference[i]) +
            Math.abs(current[i + 1] - reference[i + 1]) +
            Math.abs(current[i + 2] - reference[i + 2])) /
          3;
        if (diff > DIFF_THRESHOLD) {
          changed++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const fillRatio = changed / (PROC_W * PROC_H);
    if (fillRatio < MIN_FILL_RATIO) return { box: null as Box, fillRatio };
    return { box: { x: minX, y: minY, width: maxX - minX, height: maxY - minY } as Box, fillRatio };
  }, []);

  /* ---------------- overlay çizimi ---------------- */

  const drawOverlay = useCallback(
    (b: Box, ok: boolean) => {
      const canvas = overlayRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      const w = video.clientWidth;
      const h = video.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      if (!b) return;

      const sx = w / PROC_W;
      const sy = h / PROC_H;
      const drawX = mirrored ? w - (b.x + b.width) * sx : b.x * sx;

      ctx.strokeStyle = ok ? "rgba(34,197,94,0.9)" : "rgba(250,204,21,0.9)";
      ctx.lineWidth = 3;
      ctx.strokeRect(drawX, b.y * sy, b.width * sx, b.height * sy);
    },
    [mirrored],
  );

  /* ---------------- kare yakalama (tam çözünürlük) ---------------- */

  const captureCurrentPosition = useCallback((index: number) => {
    const video = videoRef.current;
    const canvas = snapshotRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const pos = POSITIONS[index];
    capturedRef.current = [
      ...capturedRef.current,
      { id: pos.id, title: pos.title, image: canvas.toDataURL("image/jpeg", 0.85) },
    ];
  }, []);

  /* ---------------- her karede çalışan değerlendirme ---------------- */

  const evaluateFrame = useCallback(() => {
    const now = performance.now();
    const dt = lastTsRef.current ? now - lastTsRef.current : 0;
    lastTsRef.current = now;

    const current = readFrame();
    if (!current) return;

    // Kalibrasyon: kamera açılır açılmaz ilk kareyi boş sahne referansı yap.
    if (stepRef.current === "calibrating") {
      referenceRef.current = current;
      setStepBoth("framing");
      return;
    }
    const reference = referenceRef.current;
    if (!reference) return;

    const { box: b, fillRatio } = diffBoundingBox(current, reference);
    setBox(b);

    let ok = false;
    let message: string | null = null;

    if (!b || fillRatio < MIN_FILL_RATIO) {
      message = "Kadrajda kimse algılanmıyor";
    } else {
      const marginX = PROC_W * EDGE_MARGIN;
      const marginY = PROC_H * EDGE_MARGIN;
      const heightRatio = b.height / PROC_H;
      const touchesTop = b.y <= marginY;
      const touchesBottom = b.y + b.height >= PROC_H - marginY;
      const touchesSide = b.x <= marginX || b.x + b.width >= PROC_W - marginX;

      if (heightRatio < MIN_HEIGHT_RATIO) message = "Kameraya biraz yaklaşın";
      else if (touchesTop) message = "Başınız kadrajın dışında, geriye gidin";
      else if (touchesBottom) message = "Ayaklarınız kadrajın dışında, geriye gidin";
      else if (touchesSide) message = "Kadrajın ortasına doğru gelin";
      else ok = true;
    }

    setInFrame(ok);
    setHint(message);
    drawOverlay(b, ok);

    const phase = stepRef.current;

    if (phase === "framing") {
      // KURAL 1: kadraj doğrulanınca tarama otomatik başlar (buton/tuş yok).
      stableCountRef.current = ok ? stableCountRef.current + 1 : 0;
      if (stableCountRef.current >= STABLE_FRAMES) {
        stableCountRef.current = 0;
        holdMsRef.current = 0;
        lostMsRef.current = 0;
        posIndexRef.current = 0;
        setPosIndex(0);
        setHoldMs(0);
        guideRef.current.setScanProgress(0, POSITIONS.length);
        setStepBoth("scanning");
      }
    } else if (phase === "scanning") {
      // KURAL 1: her pozisyonda GERÇEK 3 saniyelik sabit durma.
      if (ok) {
        holdMsRef.current += dt;
        lostMsRef.current = 0;
        if (holdMsRef.current >= POSITION_HOLD_MS) {
          captureCurrentPosition(posIndexRef.current);
          holdMsRef.current = 0;

          if (posIndexRef.current < POSITIONS.length - 1) {
            posIndexRef.current += 1;
            setPosIndex(posIndexRef.current);
            guideRef.current.setScanProgress(posIndexRef.current, POSITIONS.length);
          } else {
            // 4 yön tamamlandı → analiz sonuçlarını üret (mock) ve bitir.
            const frames = capturedRef.current;
            setCapturedFrames(frames);
            setResult(MOCK_RESULT);
            guideRef.current.setLastScore(MOCK_RESULT.overallScore);
            guideRef.current.setScanProgress(POSITIONS.length, POSITIONS.length);
            setStepBoth("completed");
            stopCamera();
            onComplete?.(frames, MOCK_RESULT);
            return;
          }
        }
      } else {
        lostMsRef.current += dt;
        if (lostMsRef.current > LOST_GRACE_MS) holdMsRef.current = 0;
      }
      setHoldMs(holdMsRef.current);
    }
  }, [captureCurrentPosition, diffBoundingBox, drawOverlay, onComplete, readFrame, setStepBoth, stopCamera]);

  /* ---------------- event listener kurulumu (requestVideoFrameCallback) ---------------- */

  const attachFrameListener = useCallback(
    (video: HTMLVideoElement) => {
      const supportsVFC = typeof (video as any).requestVideoFrameCallback === "function";

      if (supportsVFC) {
        const tick = () => {
          evaluateFrame();
          if (stepRef.current === "idle" || stepRef.current === "completed") return;
          // @ts-ignore
          vfcHandleRef.current = video.requestVideoFrameCallback(tick);
        };
        // @ts-ignore
        vfcHandleRef.current = video.requestVideoFrameCallback(tick);
      } else {
        // Eski tarayıcı desteği: video'nun kendi native event'i (harici zamanlayıcı değildir).
        video.addEventListener("timeupdate", evaluateFrame);
      }
    },
    [evaluateFrame],
  );

  /* ---------------- kamerayı başlatma ---------------- */

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCapturedFrames([]);
    setResult(null);
    capturedRef.current = [];
    stableCountRef.current = 0;
    holdMsRef.current = 0;
    lostMsRef.current = 0;
    lastTsRef.current = 0;
    referenceRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error("video-ref-yok");
      video.srcObject = stream;
      await video.play();

      setStepBoth("calibrating");
      attachFrameListener(video);
    } catch (err) {
      stopCamera();
      setStepBoth("idle");
      setCameraError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Kamera erişimi sağlanamadı. Lütfen tarayıcı izinlerini kontrol edin."
          : "Kamera başlatılamadı. Lütfen tekrar deneyin.",
      );
    }
  }, [attachFrameListener, setStepBoth, stopCamera]);

  const resetScan = useCallback(() => {
    stopCamera();
    capturedRef.current = [];
    posIndexRef.current = 0;
    stableCountRef.current = 0;
    holdMsRef.current = 0;
    setCapturedFrames([]);
    setResult(null);
    setPosIndex(0);
    setHoldMs(0);
    setBox(null);
    setInFrame(false);
    setStepBoth("idle");
  }, [setStepBoth, stopCamera]);

  /* ---------------- görünüm türetmeleri ---------------- */

  const currentPos = POSITIONS[posIndex];
  const secondsLeft = Math.max(0, Math.ceil((POSITION_HOLD_MS - holdMs) / 1000));
  const countdownDisplay = secondsLeft === 0 ? "00" : secondsLeft < 10 ? `0${secondsLeft}` : `${secondsLeft}`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Canlı Akıllı Postür Taraması</h1>
        <p className="text-muted-foreground text-sm">
          Otomatik kadraj algılama ile 4 yönlü (Ön, Sağ, Arka, Sol) sıralı postür analizi.
        </p>
      </div>

      {/* Özel Tarama Barı: o anki adım + mini ilerleme + kamera kilidi */}
      <ScanProgressBar />

      {/* Kılavuz Paneli: girişten tarama bitene kadar kaybolmayan asistan.
          Tarama sırasında küçülüp durum çubuğuna dönüşebilir. */}
      <GuidePanel />

      {cameraError && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Kamera & Tarama Ekranı */}
      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
        />
        <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        <canvas ref={procRef} width={PROC_W} height={PROC_H} className="hidden" />
        <canvas ref={snapshotRef} className="hidden" />

        {step !== "idle" && step !== "completed" && (
          <div className="absolute top-4 right-4 z-20">
            <Button
              onClick={resetScan}
              variant="destructive"
              size="sm"
              className="gap-1.5 shadow-lg bg-black/60 hover:bg-destructive text-white border border-white/20"
            >
              <X className="h-4 w-4" /> Taramayı Kapat
            </Button>
          </div>
        )}

        {step === "idle" && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 text-white p-6">
            <Camera className="h-16 w-16 text-primary animate-pulse" />
            {guide.canStartScan ? (
              <>
                <p className="text-center max-w-sm text-sm">
                  Taramayı başlatmak için kamerayı etkinleştirin. Sistem tüm vücudunuzu kadrajda
                  otomatik olarak algılayacaktır.
                </p>
                <Button onClick={startCamera} size="lg" className="gap-2">
                  <Play className="h-4 w-4" /> Taramayı Başlat
                </Button>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-yellow-300 border border-yellow-400/40">
                  <Lock className="h-3.5 w-3.5" /> Önce kılavuz adımlarını tamamlayın
                </span>
                <p className="text-center max-w-sm text-sm">
                  Kamerayı açmadan önce yukarıdaki Hazırlık
                  {!guide.prepDone ? " (Adım 1)" : ""} ve Açı Seçimi
                  {guide.prepDone ? " (Adım 2)" : ""} adımlarını tamamlayın.
                </p>
                <Button onClick={() => guide.setActiveStep(guide.prepDone ? 2 : 1)} size="lg" className="gap-2">
                  <Play className="h-4 w-4" /> Kılavuza Dön
                </Button>
              </>
            )}
          </div>
        )}

        {step === "calibrating" && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 text-white">
            <Scan className="h-10 w-10 text-yellow-300 animate-pulse" />
            <p className="text-sm">Sahne kalibre ediliyor, kadrajın dışında kalın…</p>
          </div>
        )}

        {step === "framing" && (
          <div className="absolute inset-0 border-4 border-dashed border-yellow-400 m-6 rounded-xl flex flex-col justify-between p-6 bg-black/20 pointer-events-none">
            <div className="self-center bg-black/80 text-yellow-300 px-5 py-2 rounded-full text-sm font-medium border border-yellow-400/40 flex items-center gap-2 animate-pulse">
              <Scan className="h-4 w-4" /> {hint ?? "Kadraj Taranıyor: Tüm vücudun algılanması bekleniyor..."}
            </div>
            <div className="self-center bg-black/70 text-white px-4 py-1.5 rounded-lg text-xs">
              Lütfen çerçeve içinde dik durun
            </div>
          </div>
        )}

        {step === "scanning" && currentPos && (
          <div
            className={`absolute inset-0 border-4 m-6 rounded-xl flex flex-col justify-between p-6 transition-colors ${
              inFrame ? "border-primary bg-primary/5" : "border-yellow-400 bg-yellow-400/5"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="bg-primary text-primary-foreground px-3.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow flex items-center gap-1.5">
                {inFrame && <UserCheck className="h-3.5 w-3.5" />}
                {currentPos.title} ({posIndex + 1}/4)
              </span>
              <span className="bg-black/80 text-white font-mono text-xl px-4 py-1 rounded-full border border-primary/40">
                00:{countdownDisplay}
              </span>
            </div>
            <div className="self-center bg-black/80 text-white px-6 py-3 rounded-xl text-center shadow-lg border border-primary/30">
              <p className="text-lg font-semibold text-primary-foreground mb-1">{currentPos.instruction}</p>
              <p className="text-xs text-muted-foreground">
                {inFrame ? "Sabit durun, analiz yapılıyor..." : (hint ?? "Kadraja geri girin")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tamamlanan Sonuç Modülü */}
      {step === "completed" && result && (
        <div className="space-y-6 bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <h2 className="text-xl font-bold">Tarama Başarıyla Tamamlandı</h2>
                <p className="text-sm text-muted-foreground">4 yönlü postür analiz raporunuz oluşturuldu.</p>
              </div>
            </div>
            <Button onClick={resetScan} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Yeniden Tara
            </Button>
          </div>

          {/* Adım 4 yönlendirmesi: risk skoru + havuzdan atanan program */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/analyses"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary/40 hover:text-primary"
            >
              Risk Skorlarımı Gör
            </Link>
            <Link
              href="/exercises"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Egzersiz Programıma Git
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Genel Skor Dairesel İlerleme */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl border">
              <div
                className="relative flex items-center justify-center w-32 h-32 rounded-full shadow-inner"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${result.overallScore * 3.6}deg, hsl(var(--muted)) 0deg)`,
                }}
              >
                <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-primary">{result.overallScore}</span>
                  <span className="text-xs text-muted-foreground absolute bottom-5">/100</span>
                </div>
              </div>
              <span className="mt-4 font-semibold text-sm">Genel Postür Skoru</span>
            </div>

            {/* Detaylı Parametreler */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Detaylı Parametreler
              </h3>
              <div className="space-y-2 text-sm">
                {result.parameters.map((p) => (
                  <div key={p.label} className="flex justify-between p-2.5 bg-muted/50 rounded-lg">
                    <span className="font-medium">{p.label}:</span>
                    <span className={`font-semibold ${toneTextColor[p.tone]}`}>{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Öngörülen Patoloji ve Risk Oranları */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Öngörülen Patoloji ve Risk Oranları
            </h3>
            <div className="space-y-3">
              {result.risks.map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>{r.label}</span>
                    <span className={toneTextColor[r.tone]}>
                      {r.percent}% ({r.level})
                    </span>
                  </div>
                  <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${toneBarColor[r.tone]} h-full rounded-full transition-[width]`}
                      style={{ width: `${r.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {capturedFrames.map((c) => (
              <figure key={c.id} className="space-y-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt={`${c.title} karesi`}
                  className="w-full aspect-[3/4] object-cover rounded-lg border"
                />
                <figcaption className="text-xs text-muted-foreground">{c.title}</figcaption>
              </figure>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Genel skor, parametreler ve risk oranları şu an örnek (mock) verilerdir. Gerçek analiz
            için yukarıdaki 4 kareyi kendi postür-analiz servisinize/backend'inize göndermeniz
            gerekir.
          </p>
        </div>
      )}
    </div>
  );
}

export default ScanStage;
