# 中文速查

个人仓库。不要提交公司配置，也不要提交 Nexitally 的真实订阅 URL。

## 这个解析器做什么

Quantumult X 自己下载厂商的**完整配置**。`nexitally-node-parser.js` 只从 `[server_local]` 抽出节点行，交给 `[server_remote]`。本地的 `[policy]`、`[filter_remote]`、`[rewrite_local]`、`[mitm]` 不会被覆盖。

## 设备上怎么写

```ini
[general]
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js

[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

URL 只留在手机 / Mac 的配置里。

## 会丢掉的行

含有这些子串的整行都会丢（大小写不敏感）：

`[Premium]` · `Traffic` · `Expire` · `Reset` · `Days Left` · `流量` · `到期` · `剩余` · `套餐`

因此 `tag=HK-Reset-01` 也会被丢掉。这是子串规则，不是只匹配仪表盘文案。

## 两种报错

| 英文（应用里会看到） | 含义 |
| --- | --- |
| `[server_local] section was not found.` | 下载到的不是带该分段的完整配置（HTML、Clash、空文件、只有 `[server_remote]`） |
| `no usable server entries were found.` | 分段在，但全是流量行 / 注释 / 不支持的协议 |

## 本地核对

```bash
npm test
npm run trace
```

更细的说明看同目录英文笔记和 `workbook/`。
