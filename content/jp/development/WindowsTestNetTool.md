---
title: Windows 接続テストツール
date: 2023-03-03 18:30:00
categories: Development
author: kai98k
tags:
  - Internet
---

これらのツールを活用すれば、専門外のエンジニアでも基礎的な TCP/IP を理解し、ネットワークのどこに問題があるかをよりよく把握し、ネットワーク管理者に問題を報告するか...あるいは自分で対処する(?)ことができます。

## ping

Ping は最も基本的なコマンドと言えますが、ネットワークやさまざまな外部ホストの状態を深く判断しようとすると、非常に複雑になることもあります。まずは最も簡単な使い方について説明します。詳細は [IBM 説明ドキュメント](https://www.ibm.com/docs/zh-tw/aix/7.3?topic=p-ping-command#ping__row-d3e81277) を参照してください。

1. コマンドプロンプト (CMD) を開く

![ステップ1](https://i.imgur.com/KmlnDSO.png)

2. `ping [IPアドレス/ホスト名]`。ホスト名に ping を送信すると、その IP にパケットが送信され、往復時間が計算されることがわかります。実際には、ゲームでよく耳にする ping 値を計算しているのです。

![ステップ2](https://i.imgur.com/eEvXMyF.png)

## telnet

[Synology 説明ドキュメント](https://kb.synology.com/zh-tw/DSM/tutorial/Whether_TCP_port_is_open_or_closed) を参照してください。接続の問題が次のシナリオの可能性がある場合：

- ポート転送ルールが正しく設定されていない。
- 外部 IP アドレスがプライベート IP アドレスとして設定されている。
- ネットワーク接続がファイアウォールルールによってブロックされている。
- サービスが正常に動作していない。

`telnet` を使用してテストできます。

1. Windows では、まず `Windows の機能の有効化または無効化` に移動して、telnet サービスを有効にする必要があります。
   ![ステップ1](https://i.imgur.com/gQ1dQLz.png)
2. Telnet クライアントにチェックを入れます
   ![ステップ2](https://i.imgur.com/By12ZLH.png)
3. cmd を使用して `telnet [IP アドレスまたはホスト名] [ポート]` を入力します

失敗した場合は下の図が返されます
![ステップ3](https://i.imgur.com/SUPvDc2.png)

成功した場合は空白に直接ジャンプします

## tracert

[Microsoft 公式ドキュメントによると](https://support.microsoft.com/zh-tw/topic/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-tracert-%E7%96%91%E9%9B%A3%E6%8E%92%E8%A7%A3-windows-%E4%B8%AD%E7%9A%84-tcp-ip-%E5%95%8F%E9%A1%8C-e643d72b-2f4f-cdd6-09a0-fd2989c7ca8e)

> TRACERT 診断ユーティリティは、インターネット制御メッセージプロトコル (ICMP) エコーパケットを宛先に送信することにより、宛先への経路を決定します。これらのパケットでは、TRACERT はさまざまな IP 生存時間 (Time-To-Live、TTL) 値を使用します。パス上の各ルーターは、パケットを転送する前にパケットの TTL を少なくとも 1 減らす必要があるため、TTL は事実上ホップカウンターになります。パケットの TTL がゼロ (0) に達すると、ルーターは ICMP「時間切れ」メッセージを送信元のコンピューターに送り返します。

理解するのが難しすぎますが...実際には、パケットを指定されたアドレスに送信し、途中で通過するポイントと情報を解析することです。同じポイントに通じるパスが複数ある大規模ネットワークや、多くの中間コンポーネント（ルーターやブリッジ）が関与する大規模ネットワークの場合、TRACERT は非常に便利なトラブルシューティングツールです。

使い方は、cmd でコマンド `tracert [IPアドレス/ホスト名]` を入力するだけです。

![tracert](https://i.imgur.com/8dVwArb.png)

## Test-NetConnection

Test-NetConnection は telnet に似ていますが、より多くの情報を取得でき、成功した場合、情報は更新されません。ただし、今回は **windows powerShell** でコマンドを入力します。

![Test-NetConnection](https://i.imgur.com/EcLrSyD.png)

## Reference

- [Windows TCP 接続テスト、Telnet よりも優れた方法](https://blog.darkthread.net/blog/ps-test-netconnection/)
- [TRACERT を使用して Windows の TCP/IP 問題をトラブルシューティングする方法](https://support.microsoft.com/zh-tw/topic/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-tracert-%E7%96%91%E9%9B%A3%E6%8E%92%E8%A7%A3-windows-%E4%B8%AD%E7%9A%84-tcp-ip-%E5%95%8F%E9%A1%8C-e643d72b-2f4f-cdd6-09a0-fd2989c7ca8e)
- [TCP ポートが開いているか閉じているかを確認する方法](https://kb.synology.com/zh-tw/DSM/tutorial/Whether_TCP_port_is_open_or_closed)
