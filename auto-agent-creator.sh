#!/bin/bash
# 自动Agent创建系统
# 当有空闲slot时自动创建队列中的Agent

QUEUE_FILE="/root/.openclaw/workspace/data/agent-queue.json"
MAX_AGENTS=5

# 获取当前运行的Agent数量
get_running_agents() {
  # 从sessions_list统计
  local count=$(sessions_list 2>/dev/null | grep -c "subagent" || echo "5")
  echo $count
}

# 从队列获取最高优先级的Agent
get_next_agent() {
  if [ -f "$QUEUE_FILE" ]; then
    # 使用jq获取最高优先级且状态为queued的Agent
    cat "$QUEUE_FILE" | jq -r '[.[] | select(.status=="queued")] | sort_by(.priority) | reverse | .[0] // empty'
  fi
}

# 更新Agent状态
update_agent_status() {
  local agent_id=$1
  local new_status=$2
  local session_key=$3
  
  if [ -f "$QUEUE_FILE" ]; then
    cat "$QUEUE_FILE" | jq --arg id "$agent_id" --arg status "$new_status" --arg key "$session_key" '
      map(if .id == $id then .status = $status | .session_key = $key else . end)
    ' > /tmp/agent-queue-tmp.json && mv /tmp/agent-queue-tmp.json "$QUEUE_FILE"
  fi
}

# 主循环
echo "🤖 自动Agent创建系统"
echo "========================"

running=$(get_running_agents)
available=$((MAX_AGENTS - running))

echo "当前运行Agent: $running/$MAX_AGENTS"
echo "可用slot: $available"
echo ""

if [ $available -gt 0 ]; then
  echo "✅ 有$available个空位，可以创建新Agent"
  
  # 获取下一个Agent
  next_agent=$(get_next_agent)
  
  if [ -n "$next_agent" ] && [ "$next_agent" != "null" ]; then
    agent_id=$(echo "$next_agent" | jq -r '.id')
    agent_name=$(echo "$next_agent" | jq -r '.name')
    agent_task=$(echo "$next_agent" | jq -r '.task')
    
    echo "🎯 准备创建Agent: $agent_name"
    echo "任务: $agent_task"
    echo ""
    echo "使用命令创建:"
    echo "sessions_spawn --label=\"$agent_id\" --task=\"$agent_task\""
  else
    echo "ℹ️ 队列为空，没有待创建的Agent"
  fi
else
  echo "⏳ Agent槽位已满，等待释放..."
fi

echo ""
echo "========================"
echo "队列状态:"
if [ -f "$QUEUE_FILE" ]; then
  cat "$QUEUE_FILE" | jq -r '.[] | "  \(.status): \(.name) (P\(.priority))"' | head -20
fi
