import { useEffect, useRef } from "react";

interface PixelConfig {
  facebookPixelId?: string | null;
  tiktokPixelId?: string | null;
  googleAdsId?: string | null;
}

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    ttq?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function useTrackingPixels(config: PixelConfig) {
  const initialized = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Facebook Pixel
    if (config.facebookPixelId && !initialized.current.has("fb")) {
      initialized.current.add("fb");
      const f = window;
      const n = "fbq";
      if (!f[n]) {
        const q: any = function () { q.callMethod ? q.callMethod.apply(q, arguments) : q.queue.push(arguments); };
        if (!f._fbq) f._fbq = q;
        q.push = q; q.loaded = true; q.version = "2.0"; q.queue = [];
        f[n] = q;
        const s = document.createElement("script");
        s.async = true;
        s.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(s);
      }
      window.fbq!("init", config.facebookPixelId);
      window.fbq!("track", "PageView");
    }

    // TikTok Pixel
    if (config.tiktokPixelId && !initialized.current.has("tt")) {
      initialized.current.add("tt");
      const s = document.createElement("script");
      s.textContent = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib="+t;var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)}}(window,document,"ttq");`;
      document.head.appendChild(s);
      window.ttq?.load(config.tiktokPixelId);
      window.ttq?.page();
    }

    // Google Ads (gtag)
    if (config.googleAdsId && !initialized.current.has("ga")) {
      initialized.current.add("ga");
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAdsId}`;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer!.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", config.googleAdsId);
    }
  }, [config.facebookPixelId, config.tiktokPixelId, config.googleAdsId]);
}

export function trackEvent(eventName: string, data?: Record<string, any>) {
  // Facebook
  if (window.fbq) {
    window.fbq("track", eventName, data);
  }

  // TikTok
  if (window.ttq) {
    window.ttq.track(eventName, data);
  }

  // Google Ads
  if (window.gtag) {
    window.gtag("event", eventName === "Purchase" ? "conversion" : eventName, data);
  }
}
