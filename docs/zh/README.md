# 中文文档

本仓库是个人用的 Quantumult X 资源解析器，**不是公司代码**。完整英文说明从 [docs/README.md](../README.md) 进入。

| 文档 | 内容 |
| --- | --- |
| [解析器说明.md](解析器说明.md) | 输入、过滤规则、错误文案 |
| [迁移指南.md](迁移指南.md) | 从「下载完整配置」改成本地策略 + 远程节点 |
| [../privacy.md](../privacy.md) | 哪些内容绝不能提交 |
| [../../lab/README.md](../../lab/README.md) | 本地回放命令 |

本地查看保留/丢弃结果：

```bash
npm test
node lab/run.js --explain lab/fixtures/nexitally-style-full.conf
```
