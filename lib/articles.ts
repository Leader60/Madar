import { redis } from './redis'

export interface Article {
  id: string
  title: string
  summary: string
  content?: string
  category: string
  imageUrl: string
  isFeatured: boolean
  publishedAt: string
}

// 1. جلب كل المقالات من Upstash Redis
export async function getAllArticles(): Promise<Article[]> {
  try {
    const articles = await redis.get<Article[]>('madar_articles')
    return articles || []
  } catch (error) {
    console.error('Error fetching articles from Redis:', error)
    return []
  }
}

// 2. جلب المقالات البارزة فقط (Featured)
export async function getFeaturedArticles(): Promise<Article[]> {
  const articles = await getAllArticles()
  return articles.filter((article) => article.isFeatured)
}

// 3. جلب مقالات الأرشيف فقط (Archive)
export async function getArchiveArticles(): Promise<Article[]> {
  const articles = await getAllArticles()
  return articles.filter((article) => !article.isFeatured)
}
