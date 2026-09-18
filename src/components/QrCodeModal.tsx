import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download, ExternalLink } from 'lucide-react';
import { UrlRecord } from '../types';

interface QrCodeModalProps {
  link: UrlRecord | null;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ link, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (link && canvasRef.current) {
      const fullUrl = `${window.location.origin}/s/${link.shortCode}`;
      QRCode.toCanvas(canvasRef.current, fullUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }, (err) => {
        if (err) console.error('QR generation error:', err);
      });
    }
  }, [link]);

  if (!link) return null;

  const fullUrl = `${window.location.origin}/s/${link.shortCode}`;

  const downloadQr = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `qr-${link.shortCode}.png`;
    a.href = url;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">QR Code for Short URL</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="my-5 flex flex-col items-center">
          <div className="p-3 bg-white rounded-xl shadow-lg">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          <div className="mt-4 text-center">
            <div className="font-mono text-xs font-bold text-sky-400">/{link.shortCode}</div>
            <div className="font-mono text-[11px] text-slate-400 max-w-xs truncate mt-0.5">
              {fullUrl}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={downloadQr}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PNG</span>
          </button>

          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            <span>Visit</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
