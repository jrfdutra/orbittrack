import QRCode from 'qrcode';
import path from 'node:path';
import fs from 'node:fs';

await QRCode.toFile(path.resolve('entrega/logo/qr-exemplo.png'), 'https://orbittrack.exemplo/verificar/AB7K-92QX', {
  width: 900,
  margin: 1,
  color: { dark: '#0F172A', light: '#FFFFFF' },
  errorCorrectionLevel: 'H',
});
console.log('QR de exemplo gerado');
