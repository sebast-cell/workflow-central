import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { Header } from '@/components/header';
import { AdminNav } from '@/components/admin-nav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'Admin') {
    redirect('/portal');
  }

  return (
    <div className="min-h-screen w-full flex">
      <aside className="hidden md:flex h-screen w-56 flex-col fixed border-r">
        <div className="flex h-16 items-center border-b px-6">
           <h1 className="text-lg font-bold font-headline text-primary">Admin Panel</h1>
        </div>
        <AdminNav />
      </aside>
      <div className="flex flex-col w-full md:pl-56">
        <Header user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/40">
            {children}
        </main>
      </div>
    </div>
  );
}
