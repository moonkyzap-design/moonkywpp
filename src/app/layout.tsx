import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Moonky — Atendimento Omnichannel Inteligente (WhatsApp & Instagram)',
  description:
    'Plataforma moderna de comunicação unificada para WhatsApp e Instagram Direct com IA, transbordo humano, CRM e automações.',
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
    <html lang="pt-BR" className="h-full antialiased bg-[#EAEFEA]">
      <body className="h-full w-full overflow-hidden flex flex-col font-sans text-[#252B28] bg-[#EAEFEA]">
        {children}
      </body>
    </html>
  );
}
