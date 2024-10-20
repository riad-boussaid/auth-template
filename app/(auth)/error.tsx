"use client";

import { ErrorCard } from "@/features/auth/components/error-card";

export default function Error() {
  return (
    <div className="flex min-h-dvh items-center justify-center py-8">
      <ErrorCard />
    </div>
  );
}
