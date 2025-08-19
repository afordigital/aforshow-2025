const appKey = "A-SH-3887203412";
const host = "https://aptabase.dokploy.dev";
const devMode = import.meta.env.DEV;

const API_URL = `${host}/api/v0/events`;

export function getOSName() {
  const platform = (navigator as any).userAgentData?.platform;
  if (platform && platform !== "unknown") {
    return platform;
  }

  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
  if (/Mac/.test(ua)) return "macOS";
  if (/Win/.test(ua)) return "Windows";
  if (/Android/.test(ua)) return "Android";
  if (/Linux/.test(ua)) return "Linux";

  return "unknown";
}

export async function sendEvent(
  eventName: string,
  sessionId: string,
  props = {},
) {
  if (!appKey || !host) {
    console.error("Aptabase appKey or host is not configured.");
    return;
  }
  const eventPayload = [
    {
      timestamp: new Date().toISOString(),
      sessionId,
      eventName,
      systemProps: {
        locale: navigator.language,
        osName: getOSName(),
        isDebug: devMode,
        appVersion: "1.0.0",
        sdkVersion: "astro-sdk@1.0.0",
      },
      props,
    },
  ];

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "App-Key": appKey,
      },
      credentials: "omit",
      body: JSON.stringify(eventPayload),
    });
  } catch (err) {
    console.error("Error sending event to Aptabase", err);
  }
}
