import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { UserForm } from "@/components/admin/user-form";
import { UserList } from "@/components/admin/user-list";
import { Header } from "@/components/layout/header";
import { EquipmentTypeManager } from "@/components/admin/EquipmentTypeManager"; // Import the new component
import { EmailSettings } from "@/components/admin/EmailSettings";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return <p>Access Denied</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Administration Panel</h1>
          <UserForm />
          <UserList />
          <div className="mt-8"> {/* Add some margin for separation */}
            <EquipmentTypeManager />
            <EmailSettings />
          </div>
        </div>
      </main>
    </div>
  );
}