"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to email entry page by default
    router.push("/auth/email");
  }, [router]);

  return null;
}
