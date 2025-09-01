"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
   className?: string;
   width?: number;
   height?: number;
   alt?: string;
}

export function Logo({
   className = "",
   width = 32,
   height = 32,
   alt = "Notiva Logo",
}: LogoProps) {
   const { theme, resolvedTheme } = useTheme();
   const [mounted, setMounted] = useState(false);

   // Prevent hydration mismatch
   useEffect(() => {
      setMounted(true);
   }, []);

   if (!mounted) {
      return (
         <div
            className={`bg-gray-200 dark:bg-gray-800 rounded ${className}`}
            style={{ width, height }}
         />
      );
   }

   const logoSrc = resolvedTheme === "dark" ? "/logo-dark.png" : "/logo.png";

   return (
      <Image
         src={logoSrc}
         alt={alt}
         width={width}
         height={height}
         className={className}
         priority
      />
   );
}
