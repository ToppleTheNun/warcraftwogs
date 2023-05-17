import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/react";
import { SSRProvider } from "react-aria";

import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: stylesheet },

    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.ico",
    },
    { rel: "manifest", href: "/site.webmanifest" },
    {
      rel: "mask-icon",
      href: "/safari-pinned-tab.svg",
      color: "#5bbad5",
    },
  ];
};

const title = "Warcraft WoGs";

export const meta: V2_MetaFunction = () => {
  const url = "https://warcraftwogs.vercel.app/";
  const description = "Word of Glory leaderboard for World of Warcraft.";

  return [
    { title },
    { property: "og:url", content: url },
    { property: "twitter:url", content: url },
    { property: "image:alt", content: title },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:site_name", content: title },
    { property: "og:locale", content: "en_US" },
    { property: "og:image", content: `${url}logo.webp` },
    { property: "og:image:alt", content: title },
    { property: "og:description", content: description },
    { property: "twitter:description", content: description },
    { property: "twitter:creator", content: "@ToppleTheNun" },
    { property: "twitter:title", content: title },
    { property: "twitter:image", content: `${url}logo.webp` },
    { property: "twitter:image:alt", content: title },
    { property: "twitter:card", content: "summary" },
    { property: "description", content: description },
    { property: "name", content: title },
    { property: "author", content: "Richard Harrah" },
    { property: "revisit-after", content: "7days" },
    { property: "distribution", content: "global" },
    { property: "msapplication-TileColor", content: "#da532c" },
    { property: "theme-color", content: "#ffffff" },
  ];
};
export default function App() {
  return (
    <html
      lang="en"
      dir="auto"
      className="bg-gray-900 text-gray-200 antialiased"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen">
        <div className="flex min-h-screen flex-col">
          <SSRProvider>
            <Outlet />
          </SSRProvider>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <Analytics />
      </body>
    </html>
  );
}
