# 中文速查

这份说明对着个人用的 Quantumult X，不是给公司仓库用的。

## 这个解析器做什么

Nexitally 的 Quantumult X「配置文件 → 下载」是**整份配置**。再下一次会覆盖本地的 `[policy]`、分流和重写。

`nexitally-node-parser.js` 只从响应体里剪出 `[server_local]`，丢掉流量/到期/`[Premium]` 占位行和重复行，把剩下的节点行交给 `[server_remote]`。订阅 URL 仍由 Quantumult X 自己下载；脚本里没有账号。

## 怎么接

```ini
[general]
resource_parser_url = https://raw.githubusercontent.com/sapphireran/quanx-resource-parsers/main/nexitally-node-parser.js

[server_remote]
<YOUR_PRIVATE_NEXITALLY_QUANTUMULT_X_URL>, tag=Nexitally, opt-parser=true, update-interval=21600, enabled=true
```

私钥链接只放在手机配置里。不要提交到 git。

策略组用 `resource-tag-regex=Nexitally` 跟着资源走，不要写死节点名。

## 会留下的协议

`anytls`、`shadowsocks`、`vmess`、`vless`、`trojan`、`http`、`socks5`。

`https=`、`socks=`、`hysteria`、`wireguard`、`tuic` 不会留下。

## 会丢掉的行

- 整行注释：`;` `#` `//`
- 英文：`Traffic` `Expire` `Reset` `Days Left` `[Premium]`
- 中文：`流量` `到期` `剩余` `套餐`
- 这些是**子串**匹配：`tag=Reset-01` 也会被丢掉

## 本地核对（不用手机）

```bash
node tools/check.js
node tools/ledger.js examples/cases/typical-managed-full/input.conf
```

示例全是 `*.example.test` 和文档里的占位密码，不会去拉订阅。
