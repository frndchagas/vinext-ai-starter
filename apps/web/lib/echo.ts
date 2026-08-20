"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echo: Echo<"reverb"> | undefined;

function requiredEnvironmentValue(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing public environment variable: ${name}`);
  }

  return value;
}

export function getEcho(): Echo<"reverb"> {
  if (typeof window === "undefined") {
    throw new Error("Laravel Echo is only available in the browser.");
  }

  if (echo) {
    return echo;
  }

  const key = requiredEnvironmentValue(
    "NEXT_PUBLIC_REVERB_APP_KEY",
    process.env.NEXT_PUBLIC_REVERB_APP_KEY,
  );
  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? window.location.protocol.slice(0, -1);
  const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? (scheme === "https" ? 443 : 80));

  echo = new Echo<"reverb">({
    Pusher,
    authEndpoint: "/broadcasting/auth",
    broadcaster: "reverb",
    enabledTransports: ["ws", "wss"],
    forceTLS: scheme === "https",
    key,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? window.location.hostname,
    wsPort: port,
    wssPort: port,
  });

  return echo;
}

export function disconnectEcho(): void {
  echo?.disconnect();
  echo = undefined;
}
