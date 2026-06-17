import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

/* Renders the join-link QR using the bundled `qrcode` lib (no CDN). */
export default function QrCode({ value, size = 140 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !value) return;
    QRCode.toCanvas(ref.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#0a0d14', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).catch(() => {});
  }, [value, size]);
  return <canvas ref={ref} width={size} height={size} aria-label="QR code" />;
}
