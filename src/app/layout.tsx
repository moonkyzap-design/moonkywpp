import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Moonky — Omnichannel Customer Communication (WhatsApp & Instagram)',
  description:
    'Modern omnichannel customer communication platform uniting WhatsApp and Instagram Direct with AI support and human handoff.',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased bg-[#EAEFEA]">
      <body className="h-full w-full overflow-hidden flex flex-col font-sans text-[#252B28] bg-[#EAEFEA]">
        {children}
      </body>
    </html>
  );
}
