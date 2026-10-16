import ProfileAccountForm from "@/components/unit/ProfileAccountForm";
import { getSessionUser } from "@/lib/session";

export default async function ProfileAccountPage() {
  const user = await getSessionUser();
  if (!user) return null;
  return (
    <section className="space-y-4">
      <header><h2 className="text-lg font-bold text-white">Account settings</h2><p className="mt-1 text-sm text-zinc-500">{user.email} · {user.role.toLowerCase()}</p></header>
      <ProfileAccountForm initialValues={{ name: user.name, phone: user.phone, address: user.address }} />
    </section>
  );
}