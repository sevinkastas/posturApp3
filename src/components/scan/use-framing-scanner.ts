'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { boxToCanvasRect, createBgModel, evaluatePoseLandmarks } from '@/lib/pose-framing';
import { motionBox, motionToFraming, toLuma } from '@/lib/pose-framing';
import type { BgModel, FramingResult, NormBox, SimpleLandmark } from '@/lib/pose-framing';
export type ScannerStep = 'idle' | 'loading' | 'framing' | 'scanning' | 'completed';
export type EngineKind = 'pose' | 'motion';
export interface ScannerDebug { engine: EngineKind; fps: number; coverage: number; joints: string; fill: number }
export interface CapturedShot { index: number; image: string }
interface Options { mirrored: boolean; facing: 'user' | 'environment'; positionCount: number; holdMs?: number; onCapture?: (s: CapturedShot) => void; onComplete?: () => void; onStepChange?: (s: ScannerStep) => void }
const PW = 160; const PH = 120;
const OK_NEED = 4; const DET_MS = 66; const REUSE_MS = 400; const HOLD_DEF = 3000;
const GRACE = 1200; const MANUAL_MS = 12000; const UI_MS = 150;
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
type PoseInst = { detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks?: SimpleLandmark[][] }; close?: () => void };
export function useFramingScanner(o: Options) {
  const ref = useRef(o); ref.current = o;
  const holdTarget = o.holdMs ?? HOLD_DEF;
  const mirrored = o.mirrored; const positionCount = o.positionCount;
  const facingRef = useRef(o.facing); facingRef.current = o.facing;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const procRef = useRef<HTMLCanvasElement | null>(null);
  const snapRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseRef = useRef<PoseInst | null>(null);
  const poseFail = useRef(false);
  const bgRef = useRef<BgModel | null>(null);
  const raf = useRef(0); const run = useRef(false);
  const stepR = useRef<ScannerStep>('idle');
  const okR = useRef(0); const holdR = useRef(0); const lostR = useRef(0); const posR = useRef(0);
  const tsR = useRef(0); const detR = useRef(0); const poseAtR = useRef(0);
  const poseResR = useRef<FramingResult | null>(null);
  const resR = useRef<FramingResult | null>(null);
  const uiR = useRef(0); const t0R = useRef(0);
  const fpsCR = useRef(0); const fpsTR = useRef(0); const fpsR = useRef(0); const fillR = useRef(0);
  const liveR = useRef({ ok: false, msg: null as string | null });
  const [step, setStep] = useState<ScannerStep>('idle');
  const [inFrame, setInFrame] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [posIndex, setPosIndex] = useState(0);
  const [holdMs, setHoldMs] = useState(0);
  const [engine, setEngine] = useState<EngineKind>('pose');
  const [elapsed, setElapsed] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loadingPose, setLoadingPose] = useState(false);
  const [dbg, setDbg] = useState<ScannerDebug>({ engine: 'pose', fps: 0, coverage: 0, joints: '0/5', fill: 0 });
  const go = useCallback((s: ScannerStep) => { stepR.current = s; setStep(s); ref.current.onStepChange?.(s); }, []);
  const setESafe = useCallback((e: EngineKind) => setEngine((p) => (p === e ? p : e)), []);
  const stop = useCallback(() => {
    run.current = false; cancelAnimationFrame(raf.current);
    try { poseRef.current?.close?.(); } catch { /* yoksay */ }
    poseRef.current = null;
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* yoksay */ }
    streamRef.current = null;
    const vv = videoRef.current; if (vv) vv.srcObject = null; bgRef.current = null;
  }, []);
  const draw = useCallback((box: NormBox | null, ok: boolean) => {
    const cv = overlayRef.current; if (!cv) return;
    const w = cv.clientWidth || 640; const h = cv.clientHeight || 480;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const cx = cv.getContext('2d'); if (!cx) return;
    cx.clearRect(0, 0, w, h); if (!box) return;
    const r = boxToCanvasRect(box, w, h, mirrored);
    cx.strokeStyle = ok ? 'rgba(34,197,94,0.95)' : 'rgba(250,204,21,0.95)';
    cx.lineWidth = 3; cx.strokeRect(r.x, r.y, r.w, r.h);
  }, [mirrored]);
  const shot = useCallback((index: number) => {
    const v = videoRef.current; const cv = snapRef.current;
    if (!v || !cv || v.videoWidth === 0) return null;
    cv.width = v.videoWidth; cv.height = v.videoHeight;
    const cx = cv.getContext('2d'); if (!cx) return null;
    if (mirrored) { cx.translate(cv.width, 0); cx.scale(-1, 1); }
    cx.drawImage(v, 0, 0, cv.width, cv.height);
    const s = { index, image: cv.toDataURL('image/jpeg', 0.85) };
    ref.current.onCapture?.(s); return s;
  }, [mirrored]);
  const loadPose = useCallback(async () => {
    if (poseRef.current || poseFail.current) return poseRef.current;
    setLoadingPose(true);
    try {
      const m = await import('@mediapipe/tasks-vision');
      const FR = (m as unknown as { FilesetResolver: { forVisionTasks: (u: string) => Promise<unknown> } }).FilesetResolver;
      const PL = (m as unknown as { PoseLandmarker: { createFromOptions: (v: unknown, x: unknown) => Promise<PoseInst> } }).PoseLandmarker;
      const vision = await FR.forVisionTasks(WASM_URL);
      // Once GPU dene (hizli), OpenGL/SwiftShader hatasinda CPU'ya dus.
      try {
        poseRef.current = await PL.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO', numPoses: 1,
          minPoseDetectionConfidence: 0.4, minPosePresenceConfidence: 0.4, minTrackingConfidence: 0.4,
        });
      } catch {
        poseRef.current = await PL.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
          runningMode: 'VIDEO', numPoses: 1,
          minPoseDetectionConfidence: 0.4, minPosePresenceConfidence: 0.4, minTrackingConfidence: 0.4,
        });
      }
      setEngine('pose');
    } catch { poseFail.current = true; setEngine('motion'); }
    finally { setLoadingPose(false); }
    return poseRef.current;
  }, []);
  const loopFn = useCallback(() => {
    if (!run.current) return;
    raf.current = requestAnimationFrame(loopFn);
    const v = videoRef.current; const pr = procRef.current;
    if (!v || !pr || v.readyState < 2 || v.videoWidth === 0) return;
    const now = performance.now();
    const dt = tsR.current ? now - tsR.current : 33; tsR.current = now;
    fpsCR.current++;
    if (now - fpsTR.current > 1000) { fpsR.current = fpsCR.current; fpsCR.current = 0; fpsTR.current = now; }
    let r: FramingResult | null = null;
    const pz = poseRef.current;
    if (pz && !poseFail.current && now - detR.current >= DET_MS) {
      detR.current = now;
      try {
        const out = pz.detectForVideo(v, Math.round(now));
        const lm = out?.landmarks?.[0] as SimpleLandmark[] | undefined;
        if (lm && lm.length >= 29) { r = evaluatePoseLandmarks(lm); poseResR.current = r; poseAtR.current = now; }
      } catch { /* yoksay */ }
    }
    if (!r && poseResR.current && now - poseAtR.current < REUSE_MS) r = poseResR.current;
    if (!r) {
      const cx = pr.getContext('2d', { willReadFrequently: true });
      if (cx) {
        cx.drawImage(v, 0, 0, PW, PH);
        const d = cx.getImageData(0, 0, PW, PH).data;
        if (!bgRef.current) bgRef.current = createBgModel(PW, PH);
        const frz = stepR.current === 'scanning';
        const mb = motionBox(bgRef.current, toLuma(d, PW, PH), frz);
        fillR.current = mb.fill;
        r = motionToFraming(mb.box, mb.fill, mb.warmed);
        if (poseFail.current) setESafe('motion');
      }
    }
    if (!r) return;
    resR.current = r; liveR.current.ok = r.ok; liveR.current.msg = r.message;
    draw(r.box, r.ok);
    if (stepR.current === 'framing') {
      okR.current = r.ok ? okR.current + 1 : 0;
      if (okR.current >= OK_NEED) {
        okR.current = 0; holdR.current = 0; lostR.current = 0; posR.current = 0;
        setPosIndex(0); setHoldMs(0); go('scanning');
      }
    } else if (stepR.current === 'scanning') {
      if (r.ok) {
        holdR.current += dt; lostR.current = 0;
        if (holdR.current >= holdTarget) {
          shot(posR.current); holdR.current = 0;
          if (posR.current < positionCount - 1) { posR.current += 1; setPosIndex(posR.current); }
          else { setHoldMs(holdTarget); go('completed'); ref.current.onComplete?.(); return; }
        }
      } else { lostR.current += dt; if (lostR.current > GRACE) holdR.current = 0; }
    }

    if (now - uiR.current >= UI_MS) {
      uiR.current = now;
      const lr = resR.current;
      setInFrame(liveR.current.ok); setHint(liveR.current.msg); setHoldMs(holdR.current);
      setElapsed(now - t0R.current);
      setDbg({ engine: poseFail.current ? 'motion' : 'pose', fps: fpsR.current, coverage: lr?.coverage ?? 0, joints: `${lr?.visibleCritical ?? 0}/5`, fill: fillR.current });
    }
  }, [draw, go, holdTarget, positionCount, setESafe, shot]);
  const loopRef = useRef(loopFn); loopRef.current = loopFn;
  const start = useCallback(async () => {
    setCameraError(null); setPosIndex(0); setHoldMs(0); setInFrame(false); setHint(null); setElapsed(0);
    okR.current = 0; holdR.current = 0; lostR.current = 0; posR.current = 0;
    tsR.current = 0; detR.current = 0; poseAtR.current = 0;
    poseResR.current = null; resR.current = null; fillR.current = 0;
    bgRef.current = createBgModel(PW, PH); poseFail.current = false;
    go('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingRef.current }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
      });
      streamRef.current = stream;
      const vv = videoRef.current; if (!vv) throw new Error('video-ref-yok');
      vv.srcObject = stream; await vv.play();
      go('framing');
      t0R.current = performance.now(); fpsTR.current = performance.now();
      run.current = true; cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(loopRef.current);
      void loadPose();
    } catch (err) {
      stop(); go('idle');
      const denied = err instanceof DOMException && err.name === 'NotAllowedError';
      setCameraError(denied ? 'Kamera izni verilmedi. Adres cubugundan izin verin.' : 'Kamera baslatilamadi. HTTPS veya localhost gerekli.');
    }
  }, [go, loadPose, stop]);
  const forceStart = useCallback(() => {
    okR.current = 0; holdR.current = 0; lostR.current = 0; posR.current = 0;
    setPosIndex(0); setHoldMs(0); go('scanning');
  }, [go]);
  const reset = useCallback(() => {
    stop(); posR.current = 0;
    setPosIndex(0); setHoldMs(0); setInFrame(false); setHint(null); go('idle');
  }, [go, stop]);
  useEffect(() => () => stop(), [stop]);
  const showManual = elapsed > MANUAL_MS && step === 'framing';
  return {
    videoRef, overlayRef, procRef, snapRef, step, inFrame, hint, posIndex,
    holdMs, holdTarget, engine, elapsed, showManual, cameraError, loadingPose,
    debug: dbg, start, forceStart, reset, stop,
  };
}