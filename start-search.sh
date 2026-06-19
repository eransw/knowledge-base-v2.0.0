#!/bin/bash

# 知识库检索系统启动脚本

echo "🚀 启动知识库检索系统"
echo "================================"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 docker-compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose 未安装，请先安装 docker-compose"
    exit 1
fi

# 启动 Elasticsearch
echo ""
echo "📦 启动 Elasticsearch..."
docker-compose -f docker-compose.elasticsearch.yml up -d

# 等待 Elasticsearch 启动
echo ""
echo "⏳ 等待 Elasticsearch 启动..."
sleep 10

# 检查 Elasticsearch 是否启动成功
if curl -s http://localhost:9200 > /dev/null 2>&1; then
    echo "✅ Elasticsearch 启动成功"
else
    echo "⚠️  Elasticsearch 可能还未就绪，请稍后检查 http://localhost:9200"
fi

echo ""
echo "================================"
echo "✨ 启动完成！"
echo ""
echo "服务地址："
echo "  - Elasticsearch: http://localhost:9200"
echo "  - Kibana (可选): http://localhost:5601"
echo ""
echo "下一步："
echo "  1. 在系统配置页面配置 API Key"
echo "  2. 建立索引库"
echo ""
