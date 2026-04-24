import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Check, X, AlertCircle, Sparkles, Loader2, Footprints } from "lucide-react";
import { CATEGORIES, type CategoryId, pickFunFact } from "@/lib/journal-categories";

type Props = {
  questTitle: string;
  /** How far (meters) the player has walked this trip. Used to gate capture. */
  walkedMeters: number;
  /** Minimum required distance to unlock the shutter. */
  requiredMeters?: number;
  onClose: () => void;
  onCapture: (result: {
    sketchDataUrl: string;
    category: CategoryId;
    title: string;
    funFact: string;
  }) => Promise<void> | void;
};

type Status = "idle" | "requesting" | "ready" | "denied" | "unavailable" | "error";

/**
 * Apply a parchment "pencil sketch" effect to a frame drawn on a canvas.
 * Technique: grayscale + invert + box-blur the inverted layer, then
 * color-dodge blend (base / (1 - blur)) to produce pencil lines, finally
 * tint toward the parchment palette.
 */
function applySketchFilter(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const base = ctx.getImageData(0, 0, w, h);
  const gray = new Uint8ClampedArray(base.data.length);
  // Grayscale pass
  for (let i = 0; i < base.data.length; i += 4) {
    const g = 0.299 * base.data[i] + 0.587 * base.data[i + 1] + 0.114 * base.data[i + 2];
    gray[i] = gray[i + 1] = gray[i + 2] = g;
    gray[i + 3] = 255;
  }
  // Inverted + simple box blur (radius 4)
  const inv = new Uint8ClampedArray(gray.length);
  for (let i = 0; i < gray.length; i += 4) {
    inv[i] = inv[i + 1] = inv[i + 2] = 255 - gray[i];
    inv[i + 3] = 255;
  }
  const blurred = new Uint8ClampedArray(inv.length);
  const r = 4;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          sum += inv[(yy * w + xx) * 4];
          count++;
        }
      }
      const v = sum / count;
      const idx = (y * w + x) * 4;
      blurred[idx] = blurred[idx + 1] = blurred[idx + 2] = v;
      blurred[idx + 3] = 255;
    }
  }
  // Color dodge: out = base / (1 - blur)
  const out = ctx.createImageData(w, h);
  for (let i = 0; i < gray.length; i += 4) {
    const b = blurred[i];
    const g = gray[i];
    let v = b === 255 ? 255 : Math.min(255, (g * 255) / (255 - b));
    // Add a touch of grain & deepen mid-tones for charcoal feel
    v = Math.pow(v / 255, 1.1) * 255;
    // Tint toward warm parchment ink (sepia-ish)
    out.data[i] = Math.min(255, v * 0.95 + 8); // R
    out.data[i + 1] = Math.min(255, v * 0.88 + 4); // G
    out.data[i + 2] = Math.min(255, v * 0.7); // B
    out.data[i + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);

  // Parchment paper overlay
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.7);
  grad.addColorStop(0, "rgba(252, 240, 210, 1)");
  grad.addColorStop(1, "rgba(220, 195, 150, 1)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Subtle vignette
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const vg = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.75);
  vg.addColorStop(0, "rgba(255,255,255,1)");
  vg.addColorStop(1, "rgba(150,120,80,0.55)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function QuestCamera({
  questTitle,
  walkedMeters,
  requiredMeters = 100,
  onClose,
  onCapture,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  // Post-capture flow: pick a category, then see the fun fact, then save.
  const [step, setStep] = useState<"capture" | "categorize" | "fact">("capture");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [title, setTitle] = useState("");
  const [funFact, setFunFact] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasWalkedEnough = walkedMeters >= requiredMeters;

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        setError("Camera isn't available in this browser.");
        return;
      }
      setStatus("requesting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setStatus("ready");
      } catch (e) {
        const err = e as DOMException;
        if (err.name === "NotAllowedError" || err.name === "SecurityError") {
          setStatus("denied");
          setError("Camera permission was denied.");
        } else {
          setStatus("error");
          setError(err.message || "Couldn't start camera.");
        }
      }
    }

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const snap = () => {
    if (!hasWalkedEnough) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = 640;
    const vw = video.videoWidth || w;
    const vh = video.videoHeight || w;
    const ratio = vh / vw;
    const h = Math.round(w * ratio);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    applySketchFilter(ctx, w, h);
    setPreview(canvas.toDataURL("image/jpeg", 0.85));
    setStep("categorize");
    setTitle(questTitle);
  };

  const retake = () => {
    setPreview(null);
    setStep("capture");
    setCategory(null);
    setFunFact("");
    setSaveError(null);
  };

  const pickCategory = (id: CategoryId) => {
    setCategory(id);
    setFunFact(pickFunFact(id));
    setStep("fact");
  };

  const confirm = async () => {
    if (!preview || !category) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onCapture({
        sketchDataUrl: preview,
        category,
        title: title.trim() || questTitle,
        funFact,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't save sketch.";
      setSaveError(msg);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-3 text-background">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close camera"
          className="rounded-full bg-background/10 p-2 hover:bg-background/20"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">
            Capture proof
          </p>
          <p className="text-sm font-bold leading-tight line-clamp-1">{questTitle}</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Viewfinder / preview */}
      <div className="relative mx-4 flex-1 overflow-hidden rounded-3xl border border-background/15 bg-black">
        {/* Video */}
        {!preview && (
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}
        {/* Sketch preview */}
        {preview && (
          <img
            src={preview}
            alt="Sketch preview"
            className="h-full w-full object-cover"
          />
        )}
        {/* Hidden working canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Status overlay */}
        {!preview && status !== "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-foreground/70 p-6 text-center text-background">
            {status === "denied" || status === "unavailable" || status === "error" ? (
              <>
                <AlertCircle className="h-8 w-8 text-bloom" />
                <p className="text-sm font-semibold">{error}</p>
                <p className="text-xs opacity-70">
                  Enable camera access in your browser settings, then reopen.
                </p>
              </>
            ) : (
              <>
                <Camera className="h-8 w-8 animate-pulse" />
                <p className="text-sm">Waking up the camera…</p>
              </>
            )}
          </div>
        )}

        {/* Framing guides */}
        {!preview && status === "ready" && (
          <div className="pointer-events-none absolute inset-4 rounded-2xl border-2 border-dashed border-background/40" />
        )}

        {/* Anti-cheat lock: must walk before capturing */}
        {!preview && status === "ready" && !hasWalkedEnough && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-foreground/85 p-6 text-center text-background">
            <Footprints className="h-10 w-10 text-accent" />
            <p className="text-base font-bold leading-snug">
              Sorry — you need to show real items!
            </p>
            <p className="max-w-[260px] text-xs leading-relaxed opacity-80">
              Take a short walk outside first, then come back to capture your
              find. ({Math.round(walkedMeters)} m of {requiredMeters} m so far.)
            </p>
          </div>
        )}

        {/* Step 2: Categorize overlay */}
        {preview && step === "categorize" && (
          <div className="absolute inset-0 flex flex-col bg-foreground/85 p-5 text-background">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">
              What did you find?
            </p>
            <p className="mt-1 text-base font-bold">Pick a category for your sketch</p>
            <div className="mt-4 grid flex-1 grid-cols-3 content-start gap-2 overflow-y-auto">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickCategory(c.id)}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-background/15 bg-background/10 px-2 py-3 transition-colors hover:bg-background/20 active:scale-95"
                >
                  <span className="text-2xl" aria-hidden>
                    {c.emoji}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Fun fact overlay */}
        {preview && step === "fact" && category && (
          <div className="absolute inset-0 flex flex-col bg-foreground/90 p-5 text-background">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">
              <Sparkles className="h-3 w-3" />
              Did you know?
            </div>
            <p className="mt-2 text-2xl" aria-hidden>
              {CATEGORIES.find((c) => c.id === category)?.emoji}
            </p>
            <p className="mt-2 text-base font-semibold leading-snug">{funFact}</p>
            <button
              type="button"
              onClick={() => setFunFact(pickFunFact(category))}
              className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-background/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider hover:bg-background/25"
            >
              <RefreshCw className="h-3 w-3" />
              Another fact
            </button>

            <div className="mt-auto">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">
                Sketch title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={60}
                className="mt-1 w-full rounded-xl border border-background/20 bg-background/10 px-3 py-2 text-sm text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary/60"
                placeholder="Give it a name…"
              />
              {saveError && (
                <p className="mt-2 text-xs text-bloom">{saveError}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-around px-6 pb-8 pt-5">
        {step === "capture" && (
          <>
            <div className="w-12" />
            <button
              type="button"
              onClick={snap}
              disabled={status !== "ready"}
              aria-label="Take photo"
              className="grid h-20 w-20 place-items-center rounded-full border-4 border-background/80 bg-background/10 transition-transform active:scale-95 disabled:opacity-40"
            >
              <span className="h-14 w-14 rounded-full bg-background" />
            </button>
            <div className="w-12" />
          </>
        )}
        {step === "categorize" && (
          <button
            type="button"
            onClick={retake}
            className="flex flex-col items-center gap-1 text-background"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-background/15">
              <RefreshCw className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Retake
            </span>
          </button>
        )}
        {step === "fact" && (
          <>
            <button
              type="button"
              onClick={retake}
              disabled={saving}
              className="flex flex-col items-center gap-1 text-background"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-background/15">
                <RefreshCw className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Retake
              </span>
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={saving}
              className="flex flex-col items-center gap-1 text-background"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg disabled:opacity-60">
                {saving ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : (
                  <Check className="h-7 w-7" />
                )}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {saving ? "Saving…" : "Save sketch"}
              </span>
            </button>
            <div className="w-14" />
          </>
        )}
      </div>
    </div>
  );
}
