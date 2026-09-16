# 中文索引

本仓库是个人用的 Quantumult X 资源解析器，**不含公司配置**，也**不含** Nexitally 订阅 URL。

## 这个脚本做什么

Nexitally 的 Quantumult X「配置文件下载」是一份**完整配置**。重新下载会覆盖本地的策略、分流和重写。`nexitally-node-parser.js` 只从 `[server_local]` 抽出节点行，交给 `[server_remote]` 单独更新。

## 设备上怎么接

`[general]` 里只有一条全局解析器，指向本仓库：

```ini
resource_parser_url = https://cdn.jsdelivr.net/gh/sapphireran/quanx-resource-parsers@main/nexitally-node-parser.js
```

```ini
[server_remote]
YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

把真实 URL 留在手机本地。导入稳定配置后，刷新 **服务器资源 → Nexitally**。

## 会丢掉什么

- 流量 / 到期 / 剩余 / 套餐 以及英文 `Traffic` `Expire` `Reset` `Days Left`
- `[Premium]` 占位节点；如果它是**下一个小节标题**，还会截断 `[server_local]`
- 完全相同的重复行
- `;` `#` `//` 注释
- `https=` / `ss=` / `socks=` / `hysteria2=` 等未收录前缀

注意：`Reset` 是子串。`HK-Reset-01` 和 `HK-Preset-01` 都会被丢掉，`HK-RST-01` 会保留。`剩余-01` 也会被丢掉。

## 报错原文

```
Nexitally parser: [server_local] section was not found.
Nexitally parser: no usable server entries were found.
```

前者多半是下载到了 HTML、Clash YAML 或分享链接；后者是找到了小节但没有可用节点行。

## 对照英文页

| 中文问题 | 英文页 |
| --- | --- |
| 什么能进 git | [personal-scope.md](personal-scope.md) |
| 为什么不用整份配置覆盖 | [why-a-server-resource.md](why-a-server-resource.md) |
| `$resource` / `$done` | [quantumult-x-parser-contract.md](quantumult-x-parser-contract.md) |
| 正则怎么切小节 | [extraction-pipeline.md](extraction-pipeline.md) |
| 保留 / 丢弃对照 | [keep-drop-catalog.md](keep-drop-catalog.md) |
| 设备接线 | [device-wiring.md](device-wiring.md) |
| 故障对照表 | [troubleshooting.md](troubleshooting.md) |

本地复现（不访问订阅）：

```bash
npm test
node bench/run.js --why "anytls=example.com:443, password=pwd, tag=HK-Preset-01"
```
