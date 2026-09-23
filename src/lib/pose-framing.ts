/**
 * Kadraj değerlendirme çekirdeği (saf fonksiyonlar — DOM / React yok).
 *
 * Birincil yol: MediaPipe PoseLandmarker iskelet noktaları (hareketten
 * bağımsız — kullanıcı 3 sn sabit dururken de stabil kalır).
 *
 * Yedek yol: hareket tabanlı basit kutu (aşağıdaki BgModel yardımcıları).
 * Eski "ilk kareyi boş sahne say" yaklaşımı kaldırıldı; arka plan modeli
 * sürekli adapte olur ve tarama sırasında dondurulur.
 */

/** MediaPipe PoseLandmarker çıktısının kullandığımız alt kümesi. */
export interface SimpleLandmark {
  x: number; // 0..1 normalize
  y: number; // 0..1 normalize
  visibility?: number;
  presence?: number;
}

/** Normalize (0..1) sınır kutusu — video koordinatında. */
export interface NormBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FramingResult {
  ok: boolean;
  box: NormBox | null;
  message: string | null;
  coverage: number; // dikey kapsama 0..1
  visibleCritical: number; // görünür kritik nokta sayısı (0..5)
  missing: string[];
  centerOffset: number; // yatay merkez sapması 0..0.5
  footVisible: boolean;
}

const VIS_T = 0.35; // nokta görünürlük eşiği
const EDGE = 0.04; // kenar payı (normalize)
const MIN_COVERAGE = 0.38; // min. dikey kapsama (telefonda tam boy için makul)
const CENTER_TOL = 0.22; // yatay merkez toleransı
const PAD = 0.07; // kutu payı

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function scoreOf(lm: SimpleLandmark | undefined): number {
  if (!lm) return 0;
  return Math.min(lm.visibility ?? 1, lm.presence ?? 1);
}

function inside(lm: SimpleLandmark | undefined, margin = EDGE): boolean {
  if (!lm) return false;
  return lm.x > margin && lm.x < 1 - margin && lm.y > margin * 0.5 && lm.y < 1 - margin;
}

function missingMessage(missing: string[]): string {
  if (missing.includes("yüz")) return "Başınız kadrajın dışında — biraz geriye gidin";
  if (missing.some((m) => m.includes("kalça")))
    return "Bel/kalça bölgeniz görünmüyor — biraz geriye gidin";
  if (missing.some((m) => m.includes("omuz")))
    return "Omuzlarınız kadraj dışında — kadrajın ortasına gelin";
  return "Kadrajın dışındasınız — çerçevenin içine girin";
}

/**
 * BlazePose-33 sıralı landmark dizisini değerlendirir.
 * Kritik set: burun + 2 omuz + 2 kalça. Diz/ayak kutuyu büyütür
 * (kapsama hesabına katılır) ama yoklukları tek başına engellemez.
 */
export function evaluatePoseLandmarks(lms: SimpleLandmark[] | null | undefined): FramingResult {
  const empty: FramingResult = {
    ok: false,
    box: null,
    message: "Kadrajda kimse görünmüyor — çerçevenin içine girin",
    coverage: 0,
    visibleCritical: 0,
    missing: ["vücut"],
    centerOffset: 0,
    footVisible: false,
  };
  if (!lms || lms.length < 29) return empty;

  const nose = lms[0];
  const lSh = lms[11];
  const rSh = lms[12];
  const lHip = lms[23];
  const rHip = lms[24];
  const lKnee = lms[25];
  const rKnee = lms[26];
  const lAnk = lms[27];
  const rAnk = lms[28];

  const critical: Array<{ label: string; lm: SimpleLandmark | undefined }> = [
    { label: "yüz", lm: nose },
    { label: "sol omuz", lm: lSh },
    { label: "sağ omuz", lm: rSh },
    { label: "sol kalça", lm: lHip },
    { label: "sağ kalça", lm: rHip },
  ];

  const missing: string[] = [];
  let visibleCritical = 0;
  for (const c of critical) {
    if (c.lm && scoreOf(c.lm) >= VIS_T && inside(c.lm)) visibleCritical++;
    else missing.push(c.label);
  }

  const candidates = [nose, lSh, rSh, lHip, rHip, lKnee, rKnee, lAnk, rAnk].filter(
    (l): l is SimpleLandmark => !!l && scoreOf(l) >= 0.25,
  );

  let box: NormBox | null = null;
  let coverage = 0;
  let cx = 0.5;
  if (candidates.length >= 2) {
    let minX = 1,
      minY = 1,
      maxX = 0,
      maxY = 0;
    for (const l of candidates) {
      if (l.x < minX) minX = l.x;
      if (l.y < minY) minY = l.y;
      if (l.x > maxX) maxX = l.x;
      if (l.y > maxY) maxY = l.y;
    }
    minX = clamp01(minX - PAD);
    minY = clamp01(minY - PAD);
    maxX = clamp01(maxX + PAD);
    maxY = clamp01(maxY + PAD);
    box = {
      x: minX,
      y: minY,
      width: Math.max(0.02, maxX - minX),
      height: Math.max(0.02, maxY - minY),
    };
    coverage = box.height;
    cx = minX + box.width / 2;
  }

  const centerOffset = Math.abs(cx - 0.5);
  const footVisible = [lAnk, rAnk].some((l) => l && scoreOf(l) >= VIS_T && inside(l, 0.01));

  if (missing.length > 0) {
    return {
      ok: false,
      box,
      message: missingMessage(missing),
      coverage,
      visibleCritical,
      missing,
      centerOffset,
      footVisible,
    };
  }
  if (coverage < MIN_COVERAGE) {
    return {
      ok: false,
      box,
      message: "Vücudunuz küçük görünüyor — kameraya biraz yaklaşın",
      coverage,
      visibleCritical,
      missing,
      centerOffset,
      footVisible,
    };
  }
  if (centerOffset > CENTER_TOL) {
    return {
      ok: false,
      box,
      message: "Kadrajın ortasına doğru gelin",
      coverage,
      visibleCritical,
      missing,
      centerOffset,
      footVisible,
    };
  }
  return {
    ok: true,
    box,
    message: null,
    coverage,
    visibleCritical,
    missing: [],
    centerOffset,
    footVisible,
  };
}

/* ------------------------------------------------------------------ */
/* Yedek: hareket tabanlı kutu (ısınan arka plan modeli)               */
/*                                                                     */
/* Eski kodun hatası: ilk kare "boş sahne" sayılıyordu — kullanıcı     */
/* zaten kadrajdaysa kendisi fark olarak algılanmıyor, sistem sonsuza  */
/* kadar "kadraj dışı" diyordu. Aşağıdaki model her karede yavaşça     */
/* adapte olur (ısınma), taramada dondurulur ve HAREKETE değil         */
/* MEVCUDİYETE bakar: kutu yeterince büyük + çerçevede kaldığı sürece  */
/* kullanıcı sabit dursa bile kadraj geçerli sayılır.                  */
/* ------------------------------------------------------------------ */

export interface BgModel {
  bg: Float32Array;
  w: number;
  h: number;
  warmed: boolean;
  frames: number;
  lastBox: NormBox | null;
}

/** 160x120 RGBA veriden luma çıkarır (0..255). */
export function toLuma(data: Uint8ClampedArray, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    out[i] = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) / 255;
  }
  return out;
}

export function createBgModel(w: number, h: number): BgModel {
  return { bg: new Float32Array(w * h), w, h, warmed: false, frames: 0, lastBox: null };
}

const MOTION_T = 0.09; // luma fark eşiği
const WARMUP_FRAMES = 25; // ~1 sn ısınma
const ADAPT = 0.04; // arka plan adaptasyon hızı
const STILL_HOLD_FRAMES = 90; // kutu 3 sn hareketsiz kalsa bile geçerli
const MIN_FILL = 0.02;
const MIN_COV = 0.3;

/**
 * Her karede çağrılır. freeze=true iken arka plan güncellenmez
 * (taramada kullanıcı sabit dururken modelin kişiyi "yutması" engellenir).
 */
export function motionBox(
  model: BgModel,
  luma: Float32Array,
  freeze: boolean,
): { box: NormBox | null; fill: number; warmed: boolean } {
  const { w, h } = model;
  if (!model.warmed && model.frames === 0) {
    model.bg.set(luma);
  }
  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1,
    changed = 0;
  const n = w * h;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const d = Math.abs(luma[i] - model.bg[i]);
      if (!freeze) model.bg[i] += (luma[i] - model.bg[i]) * ADAPT;
      if (d > MOTION_T) {
        changed++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  model.frames++;
  if (model.frames >= WARMUP_FRAMES) model.warmed = true;

  const fill = changed / n;
  if (!model.warmed) return { box: null, fill, warmed: false };
  if (fill < MIN_FILL) {
    // Hareket yok: kişi sabit duruyor olabilir — son kutuyu koru,
    // kutu hâlâ kadraj kurallarına uyuyorsa geçerli say.
    const kept = model.lastBox;
    if (kept) return { box: kept, fill, warmed: true };
    return { box: null, fill, warmed: true };
  }
  const padX = Math.round(w * 0.04);
  const padY = Math.round(h * 0.04);
  const x0 = Math.max(0, minX - padX);
  const y0 = Math.max(0, minY - padY);
  const x1 = Math.min(w - 1, maxX + padX);
  const y1 = Math.min(h - 1, maxY + padY);
  const box: NormBox = {
    x: x0 / w,
    y: y0 / h,
    width: Math.max(0.02, (x1 - x0 + 1) / w),
    height: Math.max(0.02, (y1 - y0 + 1) / h),
  };
  model.lastBox = box;
  return { box, fill, warmed: true };
}

/** Hareket kutusunu aynı FramingResult tipine çevirir (yumuşak eşikler). */
export function motionToFraming(box: NormBox | null, fill: number, warmed: boolean): FramingResult {
  const base: FramingResult = {
    ok: false,
    box,
    message: null,
    coverage: box?.height ?? 0,
    visibleCritical: 0,
    missing: [],
    centerOffset: box ? Math.abs(box.x + box.width / 2 - 0.5) : 0,
    footVisible: false,
  };
  if (!warmed) {
    base.message = 'Kamera ısınıyor — kadrajda sabit durun…';
    return base;
  }
  if (!box || fill < MIN_FILL) {
    base.message = 'Kadrajda kimse görünmüyor — çerçevenin içine girin';
    base.missing = ['vücut'];
    return base;
  }
  if (box.height < 0.32) {
    base.message = 'Vücudunuz küçük görünüyor — kameraya biraz yaklaşın';
    return base;
  }
  const m = 0.03;
  if (box.x <= m || box.x + box.width >= 1 - m) {
    base.message = 'Kadrajın ortasına doğru gelin';
    return base;
  }
  if (box.y <= m * 0.5) {
    base.message = 'Başınız kadrajın dışında — biraz geriye gidin';
    return base;
  }
  base.ok = true;
  return base;
}

/** Normalize kutuyu canvas piksel dikdörtgenine çevirir (aynayı hesaba katar). */
export function boxToCanvasRect(
  box: NormBox,
  canvasW: number,
  canvasH: number,
  mirrored: boolean,
): { x: number; y: number; w: number; h: number } {
  const x = box.x * canvasW;
  const w = box.width * canvasW;
  return {
    x: mirrored ? canvasW - x - w : x,
    y: box.y * canvasH,
    w,
    h: box.height * canvasH,
  };
}

