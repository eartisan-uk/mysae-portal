import { odooSearchRead, serviceAccountWrite } from "@/lib/odoo/client"
import type { OdooBlogPost } from "@/types/odoo"
import type { BlogPost } from "@/types/portal"

const ODOO_BASE_URL = process.env.ODOO_BASE_URL!

const FIELDS: (keyof OdooBlogPost)[] = [
  "id", "name", "subtitle", "teaser", "post_date",
  "website_url", "author_id", "blog_id",
]

function shape(raw: OdooBlogPost): BlogPost {
  return {
    id: raw.id,
    title: raw.name,
    subtitle: raw.subtitle || null,
    excerpt: raw.teaser || null,
    publishedAt: raw.post_date,
    externalUrl: `${ODOO_BASE_URL}${raw.website_url}`,
    authorName: Array.isArray(raw.author_id) ? raw.author_id[1] : null,
    blogName: raw.blog_id[1],
  }
}

export async function getBlogPosts(limit = 20): Promise<BlogPost[]> {
  return serviceAccountWrite(sessionId =>
    odooSearchRead<OdooBlogPost>(
      "blog.post",
      [["website_published", "=", true]],
      FIELDS,
      sessionId,
      { order: "post_date desc", limit }
    ).then(raw => raw.map(shape))
  )
}
