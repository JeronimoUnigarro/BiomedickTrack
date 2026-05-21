import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Camera, Keyboard, QrCode, Search, StopCircle } from 'lucide-react';
import { toast } from 'sonner';
import jsQR from 'jsqr';
import { api } from '../services/api';

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => {
      detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>;
    };
  }
}

function extractEquipoId(value: string) {
  const trimmed = value.trim();
  const uuidMatch = trimmed.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  if (uuidMatch) return trimmed;

  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/equipos\/([^/?#]+)/);
    return match?.[1] ?? null;
  } catch {
    const match = trimmed.match(/(?:^|\/)equipos\/([^/?#]+)/) ?? trimmed.match(/^eq-[\w-]+$/i);
    return Array.isArray(match) ? match[1] ?? match[0] : null;
  }
}

function getFriendlyQrCode(id: string) {
  const hash = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `QR-${String((hash % 999) + 1).padStart(3, '0')}`;
}

export default function EscanearQR() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const detectedRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [manualValue, setManualValue] = useState('');

  const stopScanner = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const goToEquipo = async (rawValue: string) => {
    const equipoId = extractEquipoId(rawValue);
    if (equipoId) {
      stopScanner();
      toast.success('Equipo detectado');
      navigate(`/equipos/${equipoId}`);
      return;
    }

    const friendlyCode = rawValue.trim().toUpperCase();
    if (/^QR-\d{3}$/.test(friendlyCode)) {
      try {
        const equipos = await api.getEquipos();
        const equipo = equipos.find((item) => getFriendlyQrCode(item.id) === friendlyCode);
        if (equipo) {
          stopScanner();
          toast.success('Equipo detectado');
          navigate(`/equipos/${equipo.id}`);
          return;
        }
      } catch {
        toast.error('No se pudo consultar el equipo');
        return;
      }
    }

    if (!equipoId) {
      toast.error('El QR no corresponde a un equipo valido');
      return;
    }
  };

  const scanFrame = async (detector?: InstanceType<NonNullable<typeof window.BarcodeDetector>>) => {
    if (!videoRef.current || !canvasRef.current || detectedRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const codes = detector ? await detector.detect(canvas).catch(() => []) : [];
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const fallbackCode = detector ? null : jsQR(imageData.data, imageData.width, imageData.height);
      const firstCode = codes[0]?.rawValue ?? fallbackCode?.data;
      if (firstCode) {
        detectedRef.current = true;
        void goToEquipo(firstCode);
        return;
      }
    }

    frameRef.current = requestAnimationFrame(() => scanFrame(detector));
  };

  const startScanner = async () => {
    try {
      detectedRef.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScanning(true);
      const detector = window.BarcodeDetector
        ? new window.BarcodeDetector({ formats: ['qr_code'] })
        : undefined;
      frameRef.current = requestAnimationFrame(() => scanFrame(detector));
    } catch {
      toast.error('No se pudo acceder a la camara');
      stopScanner();
    }
  };

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void goToEquipo(manualValue);
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Escanear Codigo QR</h1>
        <p className="text-gray-600 mt-1">
          Escanea el codigo del equipo para abrir su hoja de vida.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Camara
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Ubica el QR dentro del recuadro para detectarlo automaticamente.
              </p>
            </div>
            {scanning ? (
              <button
                onClick={stopScanner}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <StopCircle className="w-4 h-4" />
                Detener
              </button>
            ) : (
              <button
                onClick={startScanner}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Iniciar escaneo
              </button>
            )}
          </div>

          {!window.BarcodeDetector && (
            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              Tu navegador no tiene lector QR nativo, pero se usara un lector alternativo desde la camara.
            </div>
          )}

          <div className="relative overflow-hidden rounded-lg bg-gray-950 aspect-video">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                <QrCode className="w-16 h-16 mb-3" />
                <p className="text-sm">Camara detenida</p>
              </div>
            )}
            <div className="absolute inset-6 border-2 border-white/80 rounded-xl pointer-events-none" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
            <Keyboard className="w-5 h-5" />
            Ingreso manual
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Pega la URL del QR o el identificador del equipo.
          </p>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <input
              type="text"
              aria-label="URL, UUID o codigo QR del equipo"
              value={manualValue}
              onChange={(event) => setManualValue(event.target.value)}
              placeholder="URL, UUID o QR-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar equipo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
