import { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { toast } from "sonner";
import api, { formatApiError } from "../lib/api";

const OUT_SIZE = 512;

async function cropToPngDataUrl(src, crop) {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = OUT_SIZE;
  canvas.height = OUT_SIZE;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, OUT_SIZE, OUT_SIZE);
  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, OUT_SIZE, OUT_SIZE);
  return canvas.toDataURL("image/png");
}

export default function ImageCropUpload({ onUploaded, label = "Upload & Crop Logo", testidPrefix = "logo-upload" }) {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result);
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const confirm = async () => {
    if (!src || !croppedArea) return;
    setBusy(true);
    try {
      const dataUrl = await cropToPngDataUrl(src, croppedArea);
      const { data } = await api.post("/admin/upload", { data_url: dataUrl });
      onUploaded(data.url);
      setSrc(null);
      toast.success("Logo uploaded — 512×512 PNG, transparency preserved.");
    } catch (err) {
      toast.error(formatApiError(err, "Upload failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" data-testid={`${testidPrefix}-file-input`} onChange={onFile} />
      <button type="button" data-testid={`${testidPrefix}-open-btn`} onClick={() => fileRef.current?.click()} className="outline-btn">{label}</button>

      {src && (
        <div data-testid={`${testidPrefix}-crop-modal`} className="fixed inset-0 z-[90] bg-[#050B14]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-lg">
            <h3 className="font-serif text-xl mb-1">Crop Logo</h3>
            <p className="text-[0.62rem] text-slate-500 font-mono mb-4 tracking-wider">OUTPUT: 512 × 512 PNG · TRANSPARENT BACKGROUND PRESERVED</p>
            <div className="relative w-full h-80 border border-[#C5A059]/25 overflow-hidden"
              style={{ backgroundImage: "repeating-conic-gradient(#16233a 0% 25%, #0A1322 0% 50%)", backgroundSize: "20px 20px" }}>
              <Cropper image={src} crop={crop} zoom={zoom} aspect={1} cropShape="rect" showGrid={false}
                onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, area) => setCroppedArea(area)} />
            </div>
            <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 mt-4">
              Zoom
              <input data-testid={`${testidPrefix}-zoom-range`} type="range" min={1} max={3} step={0.05} value={zoom}
                onChange={(e) => setZoom(+e.target.value)} className="flex-1 accent-[#D4AF37]" />
            </label>
            <div className="flex gap-3 mt-5">
              <button type="button" data-testid={`${testidPrefix}-confirm-btn`} onClick={confirm} disabled={busy} className="gold-btn disabled:opacity-50">
                {busy ? "Uploading…" : "Crop & Upload"}
              </button>
              <button type="button" data-testid={`${testidPrefix}-cancel-btn`} onClick={() => setSrc(null)} className="outline-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
