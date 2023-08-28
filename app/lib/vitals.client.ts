import { type Metric } from "web-vitals";

const vitalsUrl = "https://vitals.vercel-analytics.com/v1/vitals";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Navigator {
    connection?: {
      effectiveType?: string;
    };
  }
}

function sendToVercelAnalytics(metric: Metric): void {
  const analyticsId = window.ENV.VERCEL_ANALYTICS_ID;

  if (!analyticsId) {
    return;
  }

  const body = {
    dsn: analyticsId,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: navigator?.connection?.effectiveType ?? "",
  };

  const blob = new Blob([new URLSearchParams(body).toString()], {
    // This content type is necessary for `sendBeacon`
    type: "application/x-www-form-urlencoded",
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else {
    void fetch(vitalsUrl, {
      body: blob,
      method: "POST",
      credentials: "omit",
      keepalive: true,
    });
  }
}

export const reportWebVitalsToVercelAnalytics = (): void => {
  import(/* webpackChunkName: "web-vitals" */ "web-vitals").then(
    ({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(sendToVercelAnalytics);
      onFID(sendToVercelAnalytics);
      onFCP(sendToVercelAnalytics);
      onLCP(sendToVercelAnalytics);
      onTTFB(sendToVercelAnalytics);
    },
  );
};
