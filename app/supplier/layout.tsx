import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

async function SupplierContent({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (session?.role !== "supplier") {
    redirect("/masuk/supplier");
  }

  return children;
}

export default function SupplierLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <SupplierContent>{children}</SupplierContent>
    </Suspense>
  );
}
