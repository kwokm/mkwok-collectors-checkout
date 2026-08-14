import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// `pnpm dev:phone` (HTTPS=1) serves over self-signed HTTPS on the LAN —
// required because iOS only exposes DeviceOrientationEvent.requestPermission
// in a secure context.
export default defineConfig({
  plugins: [react(), tailwindcss(), ...(process.env.HTTPS ? [basicSsl()] : [])],
});
