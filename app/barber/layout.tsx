import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

async function BarberContent({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (session?.role !== "barber") {
    redirect("/masuk/barber");
  }

  return children;
}

export default function BarberLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <BarberContent>{children}</BarberContent>
    </Suspense>
  );
}
