#!/bin/bash
# ContentAI 一键执行脚本
# 用户只需运行此脚本即可执行关键任务

echo "╔══════════════════════════════════════════╗"
echo "║        ContentAI 一键执行中心          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

PS3='请选择要执行的操作: '
options=("查看项目状态" "健康检查" "备份CID" "生成周报" "准备发布内容" "查看收入" "退出")

select opt in "${options[@]}"
do
    case $opt in
        "查看项目状态")
            bash /root/.openclaw/workspace/contentai/monitoring/dashboard.sh
            ;;
        "健康检查")
            bash /root/.openclaw/workspace/contentai/monitoring/health-check.sh
            ;;
        "备份CID")
            bash /root/.openclaw/workspace/contentai/monitoring/backup-cids.sh
            ;;
        "生成周报")
            bash /root/.openclaw/workspace/contentai/monitoring/weekly-report.sh
            ;;
        "准备发布内容")
            bash /root/.openclaw/workspace/contentai/monitoring/launch-prep.sh
            ;;
        "查看收入")
            bash /root/.openclaw/workspace/contentai/monitoring/income-tracker.sh
            ;;
        "退出")
            break
            ;;
        *) echo "无效选项 $REPLY";;
    esac
done
