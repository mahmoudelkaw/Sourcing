// Database Utility Functions for Cloudflare D1

export type QueryResult<T> = {
  success: boolean;
  results?: T[];
  meta?: any;
  error?: string;
}

export async function query<T = any>(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  try {
    const stmt = db.prepare(sql)
    const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all()
    
    return {
      success: result.success,
      results: result.results as T[],
      meta: result.meta
    }
  } catch (error: any) {
    console.error('Database query error:', error)
    return {
      success: false,
      error: error.message || 'Database query failed'
    }
  }
}

export async function queryOne<T = any>(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const result = await query<T>(db, sql, params)
  return result.results && result.results.length > 0 ? result.results[0] : null
}

export async function execute(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<{ success: boolean; meta?: any; error?: string }> {
  try {
    const stmt = db.prepare(sql)
    const result = params.length > 0 ? await stmt.bind(...params).run() : await stmt.run()
    
    return {
      success: result.success,
      meta: result.meta
    }
  } catch (error: any) {
    console.error('Database execute error:', error)
    return {
      success: false,
      error: error.message || 'Database execution failed'
    }
  }
}

export async function insert(
  db: D1Database,
  table: string,
  data: Record<string, any>
): Promise<{ success: boolean; lastRowId?: number; error?: string }> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map(() => '?').join(', ')
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
  
  try {
    const stmt = db.prepare(sql)
    const result = await stmt.bind(...values).run()
    
    return {
      success: result.success,
      lastRowId: result.meta?.last_row_id
    }
  } catch (error: any) {
    console.error('Database insert error:', error)
    return {
      success: false,
      error: error.message || 'Database insert failed'
    }
  }
}

export async function update(
  db: D1Database,
  table: string,
  data: Record<string, any>,
  where: Record<string, any>
): Promise<{ success: boolean; changes?: number; error?: string }> {
  const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ')
  const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`
  const params = [...Object.values(data), ...Object.values(where)]
  
  try {
    const stmt = db.prepare(sql)
    const result = await stmt.bind(...params).run()
    
    return {
      success: result.success,
      changes: result.meta?.changes
    }
  } catch (error: any) {
    console.error('Database update error:', error)
    return {
      success: false,
      error: error.message || 'Database update failed'
    }
  }
}

export async function deleteRecord(
  db: D1Database,
  table: string,
  where: Record<string, any>
): Promise<{ success: boolean; changes?: number; error?: string }> {
  const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ')
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`
  const params = Object.values(where)
  
  try {
    const stmt = db.prepare(sql)
    const result = await stmt.bind(...params).run()
    
    return {
      success: result.success,
      changes: result.meta?.changes
    }
  } catch (error: any) {
    console.error('Database delete error:', error)
    return {
      success: false,
      error: error.message || 'Database delete failed'
    }
  }
}

// Transaction helper (D1 supports batch operations)
export async function transaction(
  db: D1Database,
  operations: Array<{ sql: string; params?: any[] }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const statements = operations.map(op => {
      const stmt = db.prepare(op.sql)
      return op.params && op.params.length > 0 ? stmt.bind(...op.params) : stmt
    })
    
    const results = await db.batch(statements)
    const allSuccess = results.every(r => r.success)
    
    return {
      success: allSuccess,
      error: allSuccess ? undefined : 'One or more operations failed'
    }
  } catch (error: any) {
    console.error('Transaction error:', error)
    return {
      success: false,
      error: error.message || 'Transaction failed'
    }
  }
}

// Generate unique reference numbers
export function generateReferenceNumber(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Date formatting helper
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString()
}
