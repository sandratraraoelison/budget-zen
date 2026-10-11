"use client";

import { useSyncExternalStore } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Keep decorative SVG markup out of the server/client hydration boundary. */
export default function HydratedIcon({
  icon: Icon,
  size = 24,
  className,
  ...props
}: LucideProps & { icon: LucideIcon }) {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);

  if (!hydrated) {
    return (
      <span
        aria-hidden="true"
        data-icon-placeholder=""
        className={`inline-block shrink-0 ${className ?? ""}`}
        style={{ width: size, height: size, verticalAlign: "middle" }}
      />
    );
  }

  return <Icon size={size} className={className} {...props} />;
}
