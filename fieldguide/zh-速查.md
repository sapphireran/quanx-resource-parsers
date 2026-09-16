# 中文速查

这份速查只覆盖本仓库里的 **Nexitally 节点解析器**。它不是通用订阅转换器。

## 它在做什么

Nexitally 的「配置文件下载」是一份完整 Quantumult X 配置。直接导入会覆盖你本地的策略、分流和重写。

本解析器让 Quantumult X **自己下载** 那份完整配置，然后只把第一个 `[server_local]` 里可用的服务器行交给 `[server_remote]`。

## 设备上怎么写

`[general]`：

```ini
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js
```

`[server_remote]`（URL 只留在手机上）：

```ini
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

必须带 `opt-parser=true`。不要用「配置文件 → 下载」来日常更新节点。

## 会保留的行

行首（去掉首尾空白后，忽略大小写）是：

`anytls` · `shadowsocks` · `vmess` · `vless` · `trojan` · `http` · `socks5`

后面可以有空格再写 `=`。

## 会丢掉的行

- 空行，或以 `;` `#` `//` 开头的注释
- 其他协议前缀：`https=`、`socks=`、`ss=`、`hysteria2=` 等
- 行内任意位置出现：`[Premium]`、`Traffic`、`Expire`、`Reset`、`Days Left`、`流量`、`到期`、`剩余`、`套餐`
- 和已保留行 **完全相同** 的重复行（按 trim 后比较）

## 两个报错

| 原文 | 含义 | 先查什么 |
| --- | --- | --- |
| `[server_local] section was not found.` | 整份正文里没有合格的分段标题 | 是不是 Clash / HTML / 已经摊平的节点列表；标题后面有没有换行 |
| `no usable server entries were found.` | 找到了分段，但筛完是空的 | 是不是只剩流量行、`[Premium]`、或不支持的协议 |

## 两个容易踩的假友（不是这次要修的 bug）

- 标签写成 `Preset-HK`：`Preset` 含子串 `Reset`，整行会被丢掉。
- 标签写成 `unexpired-...`：含子串 `Expire`，整行会被丢掉。

用 `node scripts/replay.js <文件> --annotate` 看每一行的 reason。不要把真实订阅写进 git。

更细的说明看同目录英文各章；例子在 [`../examples`](../examples)。
