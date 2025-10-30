#!/bin/bash

# Development script - starts app and worker in tmux

echo "🚀 Starting development environment..."

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux is not installed. Starting processes in background..."
    npm run dev &
    npm run worker &
    echo "✅ Services started in background"
    echo "Press Ctrl+C to stop"
    wait
    exit 0
fi

# Create new tmux session
SESSION="youtube-sub-voice"

# Kill existing session if it exists
tmux kill-session -t $SESSION 2>/dev/null

# Create new session with first window
tmux new-session -d -s $SESSION -n "app"

# Run Next.js dev server in first window
tmux send-keys -t $SESSION:0 "npm run dev" C-m

# Create second window for worker
tmux new-window -t $SESSION:1 -n "worker"
tmux send-keys -t $SESSION:1 "npm run worker" C-m

# Create third window for logs
tmux new-window -t $SESSION:2 -n "logs"
tmux send-keys -t $SESSION:2 "docker-compose logs -f postgres redis" C-m

# Attach to session
echo "✅ Development environment started in tmux"
echo "Use Ctrl+B then D to detach"
echo "Use 'tmux attach -t $SESSION' to reattach"
echo ""
tmux attach-session -t $SESSION

