import Dexie, { Table } from 'dexie'

export type EmotionType = 
  | 'joy' 
  | 'gratitude' 
  | 'calm' 
  | 'excited' 
  | 'anxious' 
  | 'sad' 
  | 'angry' 
  | 'tired'

export interface Emotion {
  type: EmotionType
  label: string
  emoji: string
  color: string
  description: string
}

export const EMOTIONS: Emotion[] = [
  { type: 'joy', label: '开心', emoji: '😊', color: 'bg-emotion-joy', description: '感到快乐满足' },
  { type: 'gratitude', label: '感恩', emoji: '🙏', color: 'bg-emotion-gratitude', description: '心存感激' },
  { type: 'calm', label: '平静', emoji: '😌', color: 'bg-emotion-calm', description: '内心安宁' },
  { type: 'excited', label: '兴奋', emoji: '🤩', color: 'bg-emotion-excited', description: '充满期待' },
  { type: 'anxious', label: '焦虑', emoji: '😰', color: 'bg-emotion-anxious', description: '感到担忧' },
  { type: 'sad', label: '难过', emoji: '😢', color: 'bg-emotion-sad', description: '情绪低落' },
  { type: 'angry', label: '生气', emoji: '😠', color: 'bg-emotion-angry', description: '感到愤怒' },
  { type: 'tired', label: '疲惫', emoji: '😴', color: 'bg-emotion-tired', description: '精疲力尽' }
]

export interface DiaryEntry {
  id?: number
  date: Date
  emotion: EmotionType
  content: string
  tags: string[]
  aiSummary: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MoodLog {
  id?: number
  entryId: number
  timestamp: Date
  emotion: EmotionType
  intensity: number // 1-10
}

export interface AIGeneratedContent {
  id?: number
  entryId: number
  type: 'summary' | 'weekly_report' | 'monthly_insights' | 'mood_prediction'
  content: string
  generatedAt: Date
}

// Query Cache for expensive operations
class QueryCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (item && Date.now() - item.timestamp < this.TTL) {
      return item.data
    }
    if (item) this.cache.delete(key)
    return null
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  invalidate(prefix?: string): void {
    if (prefix) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) this.cache.delete(key)
      }
    } else {
      this.cache.clear()
    }
  }
}

export const queryCache = new QueryCache()

class DiaryDatabase extends Dexie {
  entries!: Table<DiaryEntry>
  moodLogs!: Table<MoodLog>
  aiContents!: Table<AIGeneratedContent>

  constructor() {
    super('AIDiaryProDB')
    
    this.version(1).stores({
      entries: '++id, date, emotion, createdAt',
      moodLogs: '++id, entryId, timestamp, emotion',
      aiContents: '++id, entryId, type, generatedAt'
    })

    // Performance: Add hooks for cache invalidation
    this.entries.hook('creating', () => queryCache.invalidate('entries'))
    this.entries.hook('updating', () => queryCache.invalidate('entries'))
    this.entries.hook('deleting', () => queryCache.invalidate('entries'))
  }
}

export const db = new DiaryDatabase()

// ==========================================
// OPTIMIZED DATABASE OPERATIONS
// ==========================================

// Batch operations for better performance
export async function batchAddEntries(entries: Omit<DiaryEntry, 'id'>[]): Promise<number[]> {
  return await db.entries.bulkAdd(entries as DiaryEntry[], { allKeys: true })
}

export async function batchDeleteEntries(ids: number[]): Promise<void> {
  await db.entries.bulkDelete(ids)
  queryCache.invalidate('entries')
}

// Optimized queries with pagination
export async function getEntriesPaginated(
  page: number = 1,
  pageSize: number = 20,
  order: 'asc' | 'desc' = 'desc'
): Promise<{ entries: DiaryEntry[]; total: number; hasMore: boolean }> {
  const cacheKey = `entries:page:${page}:size:${pageSize}:order:${order}`
  const cached = queryCache.get(cacheKey)
  if (cached) return cached

  const offset = (page - 1) * pageSize
  
  const [entries, total] = await Promise.all([
    db.entries
      .orderBy('date')
      .reverse(order === 'desc')
      .offset(offset)
      .limit(pageSize)
      .toArray(),
    db.entries.count()
  ])

  const result = {
    entries,
    total,
    hasMore: offset + entries.length < total
  }

  queryCache.set(cacheKey, result)
  return result
}

// Optimized date range query with caching
export async function getEntriesByDateRange(
  startDate: Date, 
  endDate: Date
): Promise<DiaryEntry[]> {
  const cacheKey = `entries:range:${startDate.toISOString()}:${endDate.toISOString()}`
  const cached = queryCache.get<DiaryEntry[]>(cacheKey)
  if (cached) return cached

  const result = await db.entries
    .where('date')
    .between(startDate, endDate)
    .toArray()

  queryCache.set(cacheKey, result)
  return result
}

// Optimized emotion filtering with compound query
export async function getEntriesByEmotion(
  emotion: EmotionType,
  limit: number = 50
): Promise<DiaryEntry[]> {
  const cacheKey = `entries:emotion:${emotion}:limit:${limit}`
  const cached = queryCache.get<DiaryEntry[]>(cacheKey)
  if (cached) return cached

  const result = await db.entries
    .where('emotion')
    .equals(emotion)
    .limit(limit)
    .toArray()

  queryCache.set(cacheKey, result)
  return result
}

// Optimized recent entries with cursor-based pagination
export async function getRecentEntries(
  limit: number = 10,
  cursor?: Date
): Promise<DiaryEntry[]> {
  let query = db.entries.orderBy('date').reverse()
  
  if (cursor) {
    query = query.filter(entry => entry.date < cursor)
  }

  return await query.limit(limit).toArray()
}

// Single day query optimized for calendar views
export async function getEntryByDate(date: Date): Promise<DiaryEntry | undefined> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const entries = await db.entries
    .where('date')
    .between(startOfDay, endOfDay)
    .limit(1)
    .toArray()
  
  return entries[0]
}

// Optimized bulk update
export async function updateEntryAISummary(
  entryId: number, 
  summary: string
): Promise<void> {
  await db.entries.update(entryId, { 
    aiSummary: summary,
    updatedAt: new Date()
  })
  queryCache.invalidate('entries')
}

export async function deleteEntry(id: number): Promise<void> {
  await db.entries.delete(id)
  queryCache.invalidate('entries')
}

// Optimized stats calculation with memoization
export async function getEmotionStats(
  startDate?: Date, 
  endDate?: Date
): Promise<Record<EmotionType, number> & { total: number; mostCommon: EmotionType | null }> {
  const cacheKey = `stats:${startDate?.toISOString() || 'all'}:${endDate?.toISOString() || 'all'}`
  const cached = queryCache.get(cacheKey)
  if (cached) return cached

  let entries: DiaryEntry[]
  
  if (startDate && endDate) {
    entries = await getEntriesByDateRange(startDate, endDate)
  } else {
    entries = await db.entries.toArray()
  }
  
  const stats: Record<string, number> = {
    joy: 0, gratitude: 0, calm: 0, excited: 0,
    anxious: 0, sad: 0, angry: 0, tired: 0
  }
  
  entries.forEach(entry => {
    stats[entry.emotion]++
  })

  // Find most common emotion
  let maxCount = 0
  let mostCommon: EmotionType | null = null
  
  for (const [emotion, count] of Object.entries(stats)) {
    if (count > maxCount) {
      maxCount = count
      mostCommon = emotion as EmotionType
    }
  }

  const result = {
    ...stats,
    total: entries.length,
    mostCommon
  } as Record<EmotionType, number> & { total: number; mostCommon: EmotionType | null }

  queryCache.set(cacheKey, result)
  return result
}

// Weekly stats aggregation - optimized for charts
export async function getWeeklyStats(
  weeks: number = 4
): Promise<Array<{
  weekStart: Date
  weekEnd: Date
  emotions: Record<EmotionType, number>
  total: number
}>> {
  const cacheKey = `weekly:${weeks}`
  const cached = queryCache.get(cacheKey)
  if (cached) return cached

  const now = new Date()
  const results = []

  for (let i = 0; i < weeks; i++) {
    const weekEnd = new Date(now)
    weekEnd.setDate(now.getDate() - i * 7)
    weekEnd.setHours(23, 59, 59, 999)

    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekEnd.getDate() - 6)
    weekStart.setHours(0, 0, 0, 0)

    const entries = await getEntriesByDateRange(weekStart, weekEnd)
    
    const emotions: Record<string, number> = {
      joy: 0, gratitude: 0, calm: 0, excited: 0,
      anxious: 0, sad: 0, angry: 0, tired: 0
    }

    entries.forEach(entry => {
      emotions[entry.emotion]++
    })

    results.push({
      weekStart,
      weekEnd,
      emotions: emotions as Record<EmotionType, number>,
      total: entries.length
    })
  }

  queryCache.set(cacheKey, results)
  return results.reverse()
}

// Database maintenance utilities
export async function vacuumDatabase(): Promise<void> {
  await db.entries.where('createdAt').below(
    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  ).delete()
  
  await db.moodLogs.where('timestamp').below(
    new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  ).delete()
  
  await db.aiContents.where('generatedAt').below(
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  ).delete()
  
  queryCache.invalidate()
}

// Export database stats
export async function getDatabaseStats(): Promise<{
  entries: number
  moodLogs: number
  aiContents: number
  cacheSize: number
}> {
  const [entries, moodLogs, aiContents] = await Promise.all([
    db.entries.count(),
    db.moodLogs.count(),
    db.aiContents.count()
  ])

  return {
    entries,
    moodLogs,
    aiContents,
    cacheSize: queryCache['cache'].size
  }
}
