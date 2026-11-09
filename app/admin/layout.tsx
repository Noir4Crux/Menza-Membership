import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

async function AdminContent({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (session?.role !== "administrator") {
    redirect("/masuk/administrator");
  }

  return children;
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AdminContent>{children}</AdminContent>
    </Suspense>
  );
}
