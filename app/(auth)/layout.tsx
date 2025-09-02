import type React from "react";
import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";

export default function AuthLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
