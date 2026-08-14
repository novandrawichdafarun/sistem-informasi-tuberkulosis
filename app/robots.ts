import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "Googlebot",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: "https://nu-tbcare.id/sitemap.xml",
  };
}
