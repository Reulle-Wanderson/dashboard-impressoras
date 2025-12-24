"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnlyLocal({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
      router.replace("/auth");
    }
  }, [router]);

  if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
    return null;
  }

  return <>{children}</>;
}
