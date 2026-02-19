'use client'

import { useState } from 'react'

export default function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState('overview')

  const baseUrl = 'http://76.13.182.206/api'

  const endpoints = [
    {
      id: 'agents',
      title: 'Agents API',
      description: 'Manage agent registration, heartbeats, and status',
      endpoints: [
        {
          method: 'GET',
          path: '/agents',
          description: 'List all agents with their current status',
          response: `[
  {
    "id": "vps-agent",
    "name": "VPS Agent (Discord)",
    "status": "working",
    "gateway": "vps-local",
    "hubstaff_account": "eleven",
    "multimango_account": "eleven",
    "today_hours": 2.5,
    "total_tasks_completed": 15
  }
]`
        },
        {
          method: 'POST',
          path: '/agents',
          description: 'Send heartbeat and update agent status',
          body: `{
  "agent_id": "vps-agent",
  "status": "working",
  "hubstaff_status": "tracking",
  "multimango_status": "logged_in"
}`,
          response: `{ "success": true }`
        }
      ]
    },
    {
      id: 'tasks',
      title: 'Workforce Tasks API',
      description: 'Create, assign, and complete tasks',
      endpoints: [
        {
          method: 'GET',
          path: '/workforce-tasks?next=true&agent_id=vps-agent',
          description: 'Get next pending task for an agent',
          response: `{
  "id": "task-123456",
  "type": "perception",
  "title": "Caption 3 images",
  "status": "pending",
  "priority": "high"
}`
        },
        {
          method: 'POST',
          path: '/workforce-tasks',
          description: 'Create a new task (from user or agent)',
          body: `{
  "type": "perception",
  "title": "Caption batch #42",
  "description": "Describe 5 images",
  "priority": "medium",
  "agent_id": "vps-agent"
}`,
          response: `{ "id": "task-789", "success": true }`
        },
        {
          method: 'PUT',
          path: '/workforce-tasks',
          description: 'Update task status (start, complete, fail)',
          body: `{
  "id": "task-123456",
  "agent_id": "vps-agent",
  "status": "in_progress",
  "started_at": "2026-02-19T21:30:00Z"
}`,
          response: `{ "success": true }`
        }
      ]
    },
    {
      id: 'hubstaff',
      title: 'Hubstaff API',
      description: 'Track work sessions and productivity',
      endpoints: [
        {
          method: 'POST',
          path: '/hubstaff',
          description: 'Start workday tracking',
          body: `{
  "agent_id": "vps-agent",
  "action": "start"
}`,
          response: `{ "success": true, "message": "Work session started" }`
        },
        {
          method: 'POST',
          path: '/hubstaff',
          description: 'Stop workday tracking',
          body: `{
  "agent_id": "vps-agent",
  "action": "stop"
}`,
          response: `{ "success": true, "hours": 4.5 }`
        },
        {
          method: 'POST',
          path: '/hubstaff',
          description: 'Mark task as completed (for Hubstaff)',
          body: `{
  "agent_id": "vps-agent",
  "action": "task_complete"
}`,
          response: `{ "success": true }`
        }
      ]
    },
    {
      id: 'activity',
      title: 'Activity Log API',
      description: 'Log and retrieve agent activities',
      endpoints: [
        {
          method: 'GET',
          path: '/activity?limit=20',
          description: 'Get recent activity across all agents',
          response: `[
  {
    "id": 1,
    "agent_id": "vps-agent",
    "agent_name": "VPS Agent",
    "type": "task_update",
    "message": "Task completed: Caption batch #42",
    "created_at": "2026-02-19T22:15:00Z"
  }
]`
        },
        {
          method: 'POST',
          path: '/activity',
          description: 'Log an activity',
          body: `{
  "agent_id": "vps-agent",
  "type": "status",
  "message": "Starting perception task"
}`,
          response: `{ "success": true }`
        }
      ]
    }
  ]

  const agentScripts = `
#!/bin/bash
# Agent Work Loop Example
# This script runs continuously during the workday

AGENT_ID="vps-agent"  # Change to your agent ID
MISSION_CONTROL="http://76.13.182.206/api"

echo "🔄 Starting work loop for $AGENT_ID"

while true; do
  # 1. Send heartbeat
  curl -s -X POST "$MISSION_CONTROL/agents" \\
    -H "Content-Type: application/json" \\
    -d "{\"agent_id\":\"$AGENT_ID\",\"status\":\"working\"}"

  # 2. Get next task
  TASK=$(curl -s "$MISSION_CONTROL/workforce-tasks?next=true&agent_id=$AGENT_ID")
  
  if [ "$TASK" != "null" ]; then
    TASK_ID=$(echo "$TASK" | jq -r '.id')
    TASK_TYPE=$(echo "$TASK" | jq -r '.type')
    
    echo "🎯 Found task: $TASK_TYPE"
    
    # 3. Mark as in_progress
    curl -s -X PUT "$MISSION_CONTROL/workforce-tasks" \\
      -H "Content-Type: application/json" \\
      -d "{\"id\":\"$TASK_ID\",\"status\":\"in_progress\",\"started_at\":\"$(date -Iseconds)\"}"
    
    # 4. DO THE WORK HERE
    # ./complete-task.sh "$TASK_TYPE"
    
    # 5. Mark complete
    curl -s -X PUT "$MISSION_CONTROL/workforce-tasks" \\
      -H "Content-Type: application/json" \\
      -d "{\"id\":\"$TASK_ID\",\"status\":\"completed\",\"completed_at\":\"$(date -Iseconds)\"}"
    
    # 6. Log to Hubstaff
    curl -s -X POST "$MISSION_CONTROL/hubstaff" \\
      -H "Content-Type: application/json" \\
      -d "{\"agent_id\":\"$AGENT_ID\",\"action\":\"task_complete\"}"
    
    echo "✅ Task completed"
    sleep 300  # 5 min break between tasks
  else
    echo "😴 No tasks, waiting..."
    sleep 1200  # 20 min check interval
  fi
done
`

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">API Documentation</h1>
        <p className="text-slate-400">
          Mission Control API for agent coordination. Base URL:{' '}
          <code className="bg-slate-800 px-2 py-1 rounded text-primary-400">{baseUrl}</code>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden sticky top-6">
            <div className="p-4 border-b border-slate-700">
              <h2 className="font-bold text-white">Sections</h2>
            </div>
            <nav className="p-2">
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === 'overview'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                📋 Overview
              </button>
              {endpoints.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mt-1 ${
                    activeSection === section.id
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {section.title}
                </button>
              ))}
              <button
                onClick={() => setActiveSection('scripts')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mt-1 ${
                  activeSection === 'scripts'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                📜 Example Scripts
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Quick Start for Agents</h2>
                <div className="space-y-4 text-slate-300">
                  <p>
                    Welcome to Mission Control! This API allows agents to coordinate tasks,
                    track Hubstaff hours, and communicate status.
                  </p>
                  
                  <div className="bg-slate-900 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">Agent IDs</h3>
                    <ul className="space-y-1 text-sm">
                      <li><code className="text-primary-400">vps-agent</code> - VPS Agent (Discord) - Multimango: eleven</li>
                      <li><code className="text-primary-400">kimiclaw-agent</code> - KimiClaw Agent - Multimango: tweleve</li>
                    </ul>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">Work Schedule</h3>
                    <p className="text-sm">
                      Workday starts at <strong>21:00 (9:00 PM) NZDT</strong> and runs for 12 hours.
                      Both agents should start their work loops at this time.
                    </p>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">Basic Workflow</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Send heartbeat every few minutes</li>
                      <li>Poll for next task: <code className="text-primary-400">GET /workforce-tasks?next=true</code></li>
                      <li>Mark task as <code className="text-primary-400">in_progress</code></li>
                      <li>Complete the work</li>
                      <li>Mark task as <code className="text-primary-400">completed</code></li>
                      <li>Report to Hubstaff</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Endpoint Sections */}
          {endpoints.map((section) => (
            activeSection === section.id && (
              <div key={section.id} className="space-y-6">
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h2 className="text-xl font-bold text-white mb-2">{section.title}</h2>
                  <p className="text-slate-400">{section.description}</p>
                </div>

                {section.endpoints.map((endpoint, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          endpoint.method === 'GET' ? 'bg-green-600 text-white' :
                          endpoint.method === 'POST' ? 'bg-blue-600 text-white' :
                          endpoint.method === 'PUT' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-primary-400 text-sm">{endpoint.path}</code>
                      </div>
                      <p className="text-slate-300 text-sm">{endpoint.description}</p>
                    </div>
                    
                    {endpoint.body && (
                      <div className="p-4 border-b border-slate-700">
                        <div className="text-xs text-slate-400 mb-2">Request Body</div>
                        <pre className="bg-slate-900 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto">
                          {endpoint.body}
                        </pre>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="text-xs text-slate-400 mb-2">Response</div>
                      <pre className="bg-slate-900 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto">
                        {endpoint.response}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )
          ))}

          {/* Scripts Section */}
          {activeSection === 'scripts' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Example Agent Work Loop</h2>
                <p className="text-slate-400 mb-4">
                  This is the core work loop that agents should run during their shift.
                  It handles task polling, execution, and status reporting.
                </p>
                <pre className="bg-slate-900 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto">
                  {agentScripts}
                </pre>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Available Scripts</h2>
                <div className="space-y-3">
                  <div className="bg-slate-900 rounded-lg p-4">
                    <code className="text-primary-400 font-mono text-sm">agent-start-workday.sh</code>
                    <p className="text-slate-400 text-sm mt-1">
                      Starts Hubstaff, logs into Multimango, begins work loop
                    </p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4">
                    <code className="text-primary-400 font-mono text-sm">agent-stop-workday.sh</code>
                    <p className="text-slate-400 text-sm mt-1">
                      Stops Hubstaff, logs out, ends workday
                    </p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4">
                    <code className="text-primary-400 font-mono text-sm">complete-task.sh</code>
                    <p className="text-slate-400 text-sm mt-1">
                      Routes tasks to type-specific handlers (perception, video, etc.)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
