#!/bin/bash
# ContentAI IPFS CID备份脚本
# 自动备份所有项目的IPFS CID

BACKUP_FILE="/root/.openclaw/workspace/contentai/monitoring/backup/cids-$(date +%Y%m%d).txt"
mkdir -p $(dirname $BACKUP_FILE)

echo "=== ContentAI IPFS CID Backup $(date) ===" > $BACKUP_FILE

echo "" >> $BACKUP_FILE
echo "## ContentAI" >> $BACKUP_FILE
echo "CID: QmdEWJUbT6nMgbsx1ftnUBLW8kHZAXwRStp3ZjLCHQdRZD" >> $BACKUP_FILE
echo "URL: https://dweb.link/ipfs/QmdEWJUbT6nMgbsx1ftnUBLW8kHZAXwRStp3ZjLCHQdRZD/" >> $BACKUP_FILE

echo "" >> $BACKUP_FILE
echo "## CodeReview AI" >> $BACKUP_FILE
echo "CID: QmY1uqWwP9gPtJTwv1toZVzzp2ppRXXRjEKKuhHRY7esBn" >> $BACKUP_FILE
echo "URL: https://dweb.link/ipfs/QmY1uqWwP9gPtJTwv1toZVzzp2ppRXXRjEKKuhHRY7esBn/" >> $BACKUP_FILE

echo "" >> $BACKUP_FILE
echo "## ReplyAI" >> $BACKUP_FILE
echo "CID: QmY9Vg9K8khR91HD81STJwdGT8iUaKd6bY6X8SzREieA6s" >> $BACKUP_FILE
echo "URL: https://dweb.link/ipfs/QmY9Vg9K8khR91HD81STJwdGT8iUaKd6bY6X8SzREieA6s/" >> $BACKUP_FILE

echo "" >> $BACKUP_FILE
echo "Backup completed: $(date)" >> $BACKUP_FILE
echo "Backup saved to: $BACKUP_FILE"
