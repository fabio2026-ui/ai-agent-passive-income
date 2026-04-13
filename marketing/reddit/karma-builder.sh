#!/bin/bash
# Reddit Karma建设自动化

echo "Reddit Karma建设 - 第1-2周"
echo "==========================="

SUBREDDITS=("webdev" "devops" "ExperiencedDevs" "SideProject")

for sub in "${SUBREDDITS[@]}"; do
    echo ""
    echo "r/$sub:"
    echo "  - 每天浏览热门帖子"
    echo "  - 评论5-10个帖子"
    echo "  - 提供有价值的建议"
    echo "  - 不推广任何链接"
    echo "  - 目标: 50+ karma/周"
done

echo ""
echo "评论模板:"
echo "  • 'Have you considered...'"
echo "  • 'In my experience...'"
echo "  • 'One approach that worked for me...'"
echo "  • 'Great question! Here''s what I''d do...'"
