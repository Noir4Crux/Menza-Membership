import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

async function OwnerContent({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (session?.role !== "owner") {
    redirect("/masuk/owner");
  }

  return children;
}

export default function OwnerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <OwnerContent>{children}</OwnerContent>
    </Suspense>
  );
}
