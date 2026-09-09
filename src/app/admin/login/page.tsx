import { redirect } from "next/navigation";

// The admin login lives at /admin — this route exists only because the spec
// enumerates /admin/login explicitly. It always forwards to /admin.
export default function AdminLoginAliasPage() {
  redirect("/admin");
}
