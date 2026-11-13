import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  sizeClassName?: string;
  textClassName?: string;
}

export default function UserAvatar({
  src,
  name,
  className,
  sizeClassName = "h-8 w-8",
  textClassName = "text-xs font-black",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const cleanSrc = src && typeof src === "string" ? src.trim() : null;
  const initial = (name?.trim()?.charAt(0) || "U").toUpperCase();
  const canShowImage = Boolean(cleanSrc && cleanSrc.length > 5 && !hasError);

  return (
    <div
      className={cn(
        "relative rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-blue-500 p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs",
        sizeClassName,
        className
      )}
    >
      <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-white overflow-hidden select-none">
        {canShowImage ? (
          <img
            src={cleanSrc!}
            alt={name || "Avatar"}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className={cn("text-white font-black leading-none", textClassName)}>
            {initial}
          </span>
        )}
      </div>
    </div>
  );
}

