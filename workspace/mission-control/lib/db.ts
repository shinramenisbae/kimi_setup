import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data', 'workforce.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath)
    initDb()
  }
  return db
}

function initDb() {
  if (!db) return

  // Agents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      gateway TEXT NOT NULL,
      status TEXT DEFAULT 'offline',
      current_task_id TEXT,
      hubstaff_account TEXT,
      hubstaff_status TEXT DEFAULT 'stopped',
      multimango_account TEXT,
      multimango_status TEXT DEFAULT 'logged_out',
      last_heartbeat DATETIME,
      total_tasks_completed INTEGER DEFAULT 0,
      today_hours DECIMAL(4,2) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Workforce tasks table (separate from regular tasks)
  db.exec(`
    CREATE TABLE IF NOT EXISTS workforce_tasks (
      id TEXT PRIMARY KEY,
      agent_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      multimango_task_id TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      started_at DATETIME,
      completed_at DATETIME,
      duration_seconds INTEGER,
      earnings DECIMAL(8,2),
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
  `)

  // Hubstaff logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS hubstaff_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      date DATE NOT NULL,
      start_time DATETIME,
      end_time DATETIME,
      total_hours DECIMAL(4,2) DEFAULT 0,
      tasks_completed INTEGER DEFAULT 0,
      screenshots_taken INTEGER DEFAULT 0,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
  `)

  // Activity log for real-time updates
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
  `)

  // Insert default agents if not exists
  const stmt = db.prepare(`SELECT COUNT(*) as count FROM agents`)
  const result = stmt.get() as { count: number }

  if (result.count === 0) {
    const insertAgent = db.prepare(`
      INSERT INTO agents (id, name, gateway, hubstaff_account, multimango_account)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    // VPS Agent (this agent) - Discord + SSH access
    insertAgent.run('vps-agent', 'VPS Agent (Discord)', 'vps-local', 'eleven', 'eleven')
    
    // KimiClaw Agent - KimiClaw platform
    insertAgent.run('kimiclaw-agent', 'KimiClaw Agent', 'kimiclaw', 'tweleve', 'tweleve')
  }
}

export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}
