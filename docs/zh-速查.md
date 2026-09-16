# 中文速查

个人仓库。不是公司、雇主或客户配置。

## 这个解析器做什么

Nexitally 的 Quantumult X 下载是**完整配置**。重新下载会覆盖本地策略、分流和重写。本解析器只从第一个 `[server_local]` 取出可用节点，交给 `[server_remote]` 刷新。

## 设备里怎么写

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js

[server_remote]
<你的私有 Nexitally Quantumult X 地址>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

订阅地址只放在设备本地，不要提交到本仓库。

## 会留下的行

行首（忽略大小写，等号两侧可有空格）为：

`anytls` / `shadowsocks` / `vmess` / `vless` / `trojan` / `http` / `socks5`

## 会丢掉的行

- 空行，以及 `;` `#` `//` 注释
- 含 `[Premium]`、`Traffic`、`Expire`、`Reset`、`Days Left`、`流量`、`到期`、`剩余`、`套餐` 的行
- 去空白后完全重复的行（保留第一次）
- `https=`、`socks=`、`hysteria2=`、策略行、分流行

## 两个报错

| 英文 | 常见原因 |
| --- | --- |
| `[server_local] section was not found` | 不是完整配置、Clash/HTML、或 `[server_local]` 后没有换行 |
| `no usable server entries were found` | 区段在，但全是流量条 / 注释 / 不支持的协议 |

本地复现（只用仓库里的合成样例）：

```bash
npm test
node scripts/atlas.js trace examples/atlas/cases/managed-full-profile/input.conf
```

更细的规则见 [parser-specification.md](parser-specification.md)。
