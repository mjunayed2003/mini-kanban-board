import './globals.css';
import { StoreProvider } from '@/store/provider';

export const metadata = {
  title: 'Mini Kanban Board',
  description: 'Full-stack Kanban board with drag-and-drop',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
