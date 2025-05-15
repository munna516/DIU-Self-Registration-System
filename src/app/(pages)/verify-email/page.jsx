// app/verify-email/page.jsx

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the actual component to avoid SSR
const VerifyEmailComponent = dynamic(() => import("./VerifyEmailComponent"), {
  ssr: true,
});

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailComponent />
    </Suspense>
  );
}
