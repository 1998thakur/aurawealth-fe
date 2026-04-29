import AdminGuard from '../../src/components/admin/AdminGuard';

export const metadata = { title: 'AuraWealth Admin' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
