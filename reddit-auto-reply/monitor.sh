#!/bin/bash

# Reddit Auto-Reply System Monitor
# This script monitors the auto-reply system and can be run via cron

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
DATA_DIR="$SCRIPT_DIR/data"
PID_FILE="$DATA_DIR/auto-reply.pid"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$SCRIPT_DIR"

# Function to check if process is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# Function to get today's reply count
get_today_count() {
    local today=$(date +%Y-%m-%d)
    if [ -f "$LOG_DIR/interactions.jsonl" ]; then
        grep "\"$today\"" "$LOG_DIR/interactions.jsonl" 2>/dev/null | grep -c '"replySent":true' || echo "0"
    else
        echo "0"
    fi
}

# Function to get recent interactions
check_recent_interactions() {
    if [ -f "$LOG_DIR/interactions.jsonl" ]; then
        echo -e "\n${YELLOW}📊 Recent Interactions:${NC}"
        tail -10 "$LOG_DIR/interactions.jsonl" | while read line; do
            timestamp=$(echo "$line" | grep -o '"timestamp":"[^"]*"' | cut -d'"' -f4 | cut -d'T' -f2 | cut -d'.' -f1)
            subreddit=$(echo "$line" | grep -o '"subreddit":"[^"]*"' | cut -d'"' -f4)
            faq=$(echo "$line" | grep -o '"matchedFAQ":"[^"]*"' | cut -d'"' -f4)
            status=$(echo "$line" | grep -o '"replySent":[^,}]*' | cut -d':' -f2)
            
            if [ "$status" = "true" ]; then
                status_icon="✅"
            else
                status_icon="⏭️"
            fi
            
            echo "  $status_icon [$timestamp] r/$subreddit - $faq"
        done
    fi
}

# Main commands
case "${1:-status}" in
    start)
        if is_running; then
            echo -e "${YELLOW}⚠️ Auto-reply system is already running (PID: $(cat $PID_FILE))${NC}"
        else
            echo -e "${GREEN}🚀 Starting auto-reply system...${NC}"
            nohup node src/autoReply.js > "$LOG_DIR/output.log" 2>&1 &
            echo $! > "$PID_FILE"
            sleep 2
            if is_running; then
                echo -e "${GREEN}✅ Started successfully (PID: $(cat $PID_FILE))${NC}"
            else
                echo -e "${RED}❌ Failed to start${NC}"
                exit 1
            fi
        fi
        ;;
        
    stop)
        if is_running; then
            echo -e "${YELLOW}🛑 Stopping auto-reply system...${NC}"
            kill "$(cat $PID_FILE)" 2>/dev/null
            rm -f "$PID_FILE"
            echo -e "${GREEN}✅ Stopped${NC}"
        else
            echo -e "${YELLOW}⚠️ Not running${NC}"
        fi
        ;;
        
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
        
    status)
        echo -e "${YELLOW}📊 Reddit Auto-Reply System Status${NC}"
        echo "=================================="
        
        if is_running; then
            echo -e "Status: ${GREEN}🟢 Running${NC} (PID: $(cat $PID_FILE))"
        else
            echo -e "Status: ${RED}🔴 Stopped${NC}"
        fi
        
        echo ""
        echo -e "📈 Today's Replies: ${GREEN}$(get_today_count)${NC}"
        
        if [ -f "$LOG_DIR/interactions.jsonl" ]; then
            total=$(wc -l < "$LOG_DIR/interactions.jsonl")
            echo -e "📊 Total Interactions: $total"
        fi
        
        check_recent_interactions
        ;;
        
    logs)
        if [ -f "$LOG_DIR/output.log" ]; then
            echo -e "${YELLOW}📄 Recent logs:${NC}\n"
            tail -50 "$LOG_DIR/output.log"
        else
            echo -e "${YELLOW}⚠️ No log file found${NC}"
        fi
        ;;
        
    interactions)
        if [ -f "$LOG_DIR/interactions.jsonl" ]; then
            echo -e "${YELLOW}📄 Recent interactions:${NC}\n"
            tail -20 "$LOG_DIR/interactions.jsonl" | jq '.' 2>/dev/null || tail -20 "$LOG_DIR/interactions.jsonl"
        else
            echo -e "${YELLOW}⚠️ No interactions logged yet${NC}"
        fi
        ;;
        
    test)
        echo -e "${YELLOW}🧪 Running test cycle...${NC}\n"
        node src/testReply.js
        ;;
        
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|interactions|test}"
        echo ""
        echo "Commands:"
        echo "  start        - Start the auto-reply system"
        echo "  stop         - Stop the auto-reply system"
        echo "  restart      - Restart the auto-reply system"
        echo "  status       - Show current status"
        echo "  logs         - Show recent logs"
        echo "  interactions - Show recent interactions"
        echo "  test         - Run a test cycle"
        ;;
esac
