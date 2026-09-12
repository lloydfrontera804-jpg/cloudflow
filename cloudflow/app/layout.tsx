import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'RemoteVM Workspace | Cloud Virtual Machines On-Demand',
  description: 'Paid remote virtual machine workspace service with real-time session countdown, prominent warnings, secure embedded viewer, and seamless time extensions.',
  openGraph: {
    title: 'RemoteVM Workspace | Cloud Virtual Machines On-Demand',
    description: 'Paid remote virtual machine workspace service with real-time session countdown, prominent warnings, secure embedded viewer, and seamless time extensions.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RemoteVM Workspace | Cloud Virtual Machines On-Demand',
    description: 'Paid remote virtual machine workspace service with real-time session countdown, prominent warnings, secure embedded viewer, and seamless time extensions.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
