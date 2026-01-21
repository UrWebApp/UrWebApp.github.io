---
title: K3s + Istio で構築する Polyglot Microservices 完全ガイド
date: 2026-01-21
categories: Development
author: kai98k
tags:
  - Polyglot
  - Microservices
  - K3s
  - Istio
---

## はじめに

企業システムのモダナイゼーションプロセスにおいて、私たちはしばしば課題に直面します。「既存のシステムを維持しながら、どのように段階的に新技術を導入するか？」という点です。この記事では、K3s と Istio Service Mesh を組み合わせて、多言語（Polyglot）対応のマイクロサービスアーキテクチャを構築し、既存の Spring Cloud システムとスムーズに統合した経験を共有します。

<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/board/jkgICUnXEkhjWUzEtgnVjK/k3s-i?node-id=0-1&embed-host=share" allowfullscreen></iframe>

---

## Polyglot Microservices とは？

### 定義

Polyglot Microservices（多言語マイクロサービス）は、同じシステム内で異なるプログラミング言語や技術スタックを使用して各マイクロサービスを構築することを可能にするアーキテクチャパターンです。各サービスは、その特定のニーズに最も適した言語とフレームワークを選択できます。

### なぜ Polyglot なのか？

**技術的な適合性**：異なる問題領域には異なるツールが適しています。例えば：

- **Python (FastAPI)**：AI/ML サービス、データ処理、迅速なプロトタイピングに最適
- **Go**：API Gateway やリアルタイム通信など、高性能・高並行処理が必要なサービスに最適
- **Java (Spring Boot)**：複雑なビジネスロジック、エンタープライズ級のトランザクション処理に最適
- **Node.js**：I/O 集中型アプリケーション、リアルタイム API に最適
- **Rust**：極めて高いパフォーマンスとセキュリティが求められるシステムレベルのサービスに最適

**チームの専門性の活用**：チームによって技術的背景が異なる場合があります。Polyglot により、各チームは最も使い慣れたツールを使用できます。

**段階的なモダナイゼーション**：既存のシステムが Java であっても、新しいサービスは Go や Python で構築でき、すべてを書き直す必要はありません。

**ベンダーロックインの回避**：単一の言語やフレームワークに縛られず、技術選定の柔軟性を維持できます。

### いつ Polyglot を使うべきか？

| シナリオ                               | 推奨事項                                                    |
| -------------------------------------- | ----------------------------------------------------------- |
| スタートアップ、小規模チーム（< 10人） | ❌ 推奨しない。認知負荷を下げるため技術スタックを統一すべき |
| 特定のパフォーマンス要件があるサービス | ✅ 適している。Go/Rust を使用してボトルネックを解消         |
| AI/ML 機能の統合が必要                 | ✅ 適している。Python エコシステムは代替不可能              |
| M&A 後の異なる技術チームの統合         | ✅ 適している。各チームの専門性を維持できる                 |
| 既存のモノリスの解体                   | ✅ 適している。新サービスに新技術を使用可能                 |
| チームに DevOps の経験がない           | ⚠️ 注意。多言語化は運用の複雑さを増大させる                 |

### Polyglot の課題

- **運用コストの増加**：複数の CI/CD パイプライン、複数のランタイムを維持する必要がある
- **サービス間のデバッグ困難**：異なる言語間での Tracing や Logging のフォーマット統一が必要
- **コード共有の困難さ**：単一言語のように簡単にライブラリを共有できない

**これこそが Service Mesh（Istio など）の価値です**——インフラ層でセキュリティ、可観測性（Observability）、トラフィック管理を統一的に提供し、アプリケーション層はビジネスロジックに集中できるようにします。

---

## Kubernetes の基本概念

### Kubernetes とは？

Kubernetes（略称 K8s）は、「大量のコンテナをどのように管理するか」という核心的な問題を解決するコンテナオーケストレーションプラットフォームです。数十のマイクロサービスがあり、それぞれがコンテナで実行されていると想像してください。以下の問題を処理する必要があります：

- **デプロイ**：サービスをどのマシンに配置するか？
- **スケーリング**：トラフィック増加時にどう自動的にインスタンスを増やすか？
- **自己修復（Self-healing）**：サービスがダウンした際にどう自動再起動するか？
- **サービスディスカバリ**：サービス同士がどうやって相手を見つけるか？

Kubernetes は、これらの問題を管理するための宣言的な方法を提供します。「どのような状態にしたいか」を伝えるだけで、自動的にその状態を達成し、維持してくれます。

### コアコンポーネント

```
┌─────────────────────────────────────────────────────────────┐
│                      Kubernetes Cluster                     │
├─────────────────────────────────────────────────────────────┤
│  Control Plane (Master)                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ API Server  │ │   etcd      │ │ Scheduler   │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│  ┌─────────────────────────────┐                            │
│  │   Controller Manager        │                            │
│  └─────────────────────────────┘                            │
├─────────────────────────────────────────────────────────────┤
│  Worker Nodes                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │ Node 1               │  │ Node 2               │         │
│  │ ┌──────┐ ┌──────┐    │  │ ┌──────┐ ┌──────┐    │         │
│  │ │ Pod  │ │ Pod  │    │  │ │ Pod  │ │ Pod  │    │         │
│  │ └──────┘ └──────┘    │  │ └──────┘ └──────┘    │         │
│  │ kubelet | kube-proxy │  │ kubelet | kube-proxy │         │
│  └──────────────────────┘  └──────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

**Control Plane コンポーネント**：

- **API Server**：すべての操作の入り口。kubectl はこれを通じてクラスタと通信します
- **etcd**：分散 Key-Value ストア。クラスタの全状態を保存します
- **Scheduler**：Pod をどの Node に配置するかを決定します
- **Controller Manager**：実際の状態が期待する状態と一致することを確認します

**Node コンポーネント**：

- **kubelet**：各 Node 上のエージェント。Pod の管理を担当します
- **kube-proxy**：ネットワークルールとサービスロードバランシングを処理します

### コアリソースオブジェクト

| リソース         | 説明                                           | 一般的な用途                             |
| ---------------- | ---------------------------------------------- | ---------------------------------------- |
| Pod              | 最小のデプロイ単位。1つ以上のコンテナを含む    | アプリケーションの実行                   |
| Deployment       | Pod のレプリカ数と更新戦略を管理               | ステートレスアプリケーションのデプロイ   |
| Service          | Pod に安定したネットワークエンドポイントを提供 | サービスディスカバリとロードバランシング |
| ConfigMap        | 機密でない設定を保存                           | 環境変数、設定ファイル                   |
| Secret           | 機密情報を保存                                 | パスワード、API Key                      |
| Ingress          | HTTP/HTTPS ルーティングルール                  | サービスの外部公開                       |
| PersistentVolume | 永続ストレージ                                 | データベース、ファイル保存               |

---

## なぜ K3s を選ぶのか？

### K3s vs 標準 Kubernetes

| 機能             | 標準 K8s       | K3s                                  |
| ---------------- | -------------- | ------------------------------------ |
| バイナリサイズ   | ~1GB+          | ~100MB                               |
| メモリ使用量     | ~2GB+          | ~512MB                               |
| インストール時間 | 数時間         | 数分                                 |
| デフォルト DB    | etcd           | SQLite (etcd に変更可能)             |
| 利用シーン       | 大規模本番環境 | Edge, IoT, 開発/テスト, 中小規模本番 |

### K3s を選ぶ理由

**リソース制約のある環境**：K3s は多くのクラウド固有のドライバやレガシー機能を削除し、メモリフットプリントを大幅に削減しています。企業内部のエッジデプロイやテスト環境にとって、これは大きな利点です。

**すぐに始められる**：完全な K8s クラスタのインストールには数時間の構成が必要ですが、K3s はわずか数分です。これにより、チームはインフラの維持よりもアプリケーション開発に集中できます。

**オフラインデプロイに優しい**：企業内イントラネットや Air-gapped（物理的に隔離された）環境において、K3s の簡素化されたアーキテクチャはオフラインインストールを非常に容易にします。

**本番環境対応**：軽量でありながら、K3s は CNCF 認定の Kubernetes ディストリビューションであり、標準の K8s API と完全に互換性があります。

---

## K3s のインストールと設定

### 前提条件

```bash
# システム要件
# - Linux (Ubuntu 20.04/22.04, CentOS 7/8, RHEL 7/8)
# - 最低 1 CPU, 512MB RAM (推奨 2 CPU, 2GB RAM)
# - 開放ポート: 6443 (API Server), 10250 (kubelet)

# システムリソースの確認
free -h
nproc
```

### オンラインインストール（シングルノード）

```bash
# K3s Server (Master + Worker) のインストール
curl -sfL https://get.k3s.io | sh -

# インストール状態の確認
sudo systemctl status k3s

# ノード状態の確認
sudo kubectl get nodes

# K3s はデフォルトで /etc/rancher/k3s/k3s.yaml に kubeconfig を置く
# 利便性のため環境変数を設定
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# またはユーザーディレクトリにコピー
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
```

### オフラインインストール（Air-gapped 環境）

```bash
# === インターネットがあるマシンで準備 ===

# 1. K3s バイナリのダウンロード
K3S_VERSION="v1.28.4+k3s1"
wget https://github.com/k3s-io/k3s/releases/download/${K3S_VERSION}/k3s
wget https://github.com/k3s-io/k3s/releases/download/${K3S_VERSION}/k3s-airgap-images-amd64.tar.gz

# 2. インストールスクリプトのダウンロード
wget https://get.k3s.io -O install.sh

# === オフラインマシンでインストール ===

# 1. ファイルをターゲットマシンにコピー後
sudo cp k3s /usr/local/bin/
sudo chmod +x /usr/local/bin/k3s

# 2. イメージのロード
sudo mkdir -p /var/lib/rancher/k3s/agent/images/
sudo cp k3s-airgap-images-amd64.tar.gz /var/lib/rancher/k3s/agent/images/

# 3. オフラインインストールの実行
INSTALL_K3S_SKIP_DOWNLOAD=true ./install.sh
```

### マルチノードクラスタ設定

```bash
# === Master ノード ===
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --tls-san=<MASTER_IP> \
  --tls-san=<LOAD_BALANCER_IP>

# Token の取得（Worker 追加用）
sudo cat /var/lib/rancher/k3s/server/node-token

# === Worker ノード ===
curl -sfL https://get.k3s.io | K3S_URL=https://<MASTER_IP>:6443 \
  K3S_TOKEN=<NODE_TOKEN> sh -

# === クラスタの検証 ===
kubectl get nodes
# NAME      STATUS   ROLES                  AGE   VERSION
# master    Ready    control-plane,master   10m   v1.28.4+k3s1
# worker1   Ready    <none>                 5m    v1.28.4+k3s1
# worker2   Ready    <none>                 5m    v1.28.4+k3s1
```

### K3s の一般的な設定オプション

```bash
# Traefik を無効化（Istio Gateway を使用するため）
curl -sfL https://get.k3s.io | sh -s - server \
  --disable traefik

# ServiceLB を無効化（外部 Load Balancer を使用）
curl -sfL https://get.k3s.io | sh -s - server \
  --disable servicelb

# 外部 etcd を使用（本番環境推奨）
curl -sfL https://get.k3s.io | sh -s - server \
  --datastore-endpoint="etcd://etcd1:2379,etcd://etcd2:2379,etcd://etcd3:2379"

# 完全な本番環境設定例
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --disable traefik \
  --disable servicelb \
  --tls-san=k3s.example.com \
  --node-taint CriticalAddonsOnly=true:NoExecute \
  --kubelet-arg="max-pods=110"
```

---

## Pod とは？

### 基本概念

Pod は Kubernetes における最小のデプロイ単位です。Pod は1つ以上の密接に関連するコンテナを含むことができ、それらは以下を共有します：

- **ネットワーク空間**：Pod 内のコンテナは同じ IP アドレスを共有し、`localhost` を介して通信可能
- **ストレージボリューム**：同じディスクスペースをマウント可能
- **ライフサイクル**：一緒に作成され、一緒に破棄される

```
┌─────────────────────────────────────────────────┐
│                      Pod                        │
│  IP: 10.42.0.15                                 │
│  ┌─────────────────┐  ┌─────────────────┐       │
│  │ App Container   │  │ Sidecar Container│      │
│  │ (FastAPI)       │  │ (Envoy Proxy)   │       │
│  │ localhost:8000  │  │ localhost:15001 │       │
│  └─────────────────┘  └─────────────────┘       │
│           │                    │                │
│           └────── Volume ──────┘                │
└─────────────────────────────────────────────────┘
```

### Pod のライフサイクル

```
Pending → Running → Succeeded/Failed
    │         │
    │         └── (CrashLoopBackOff) → Running
    │
    └── (ImagePullBackOff) → Pending
```

| 状態      | 説明                                             |
| --------- | ------------------------------------------------ |
| Pending   | Pod は受け入れられたが、コンテナは未作成         |
| Running   | Pod がノードに割り当てられ、全コンテナが作成済み |
| Succeeded | 全コンテナが正常に終了                           |
| Failed    | 全コンテナが終了し、少なくとも1つが失敗          |
| Unknown   | Pod の状態を取得不可                             |

### Pod の例

```yaml
# pod-example.yaml
apiVersion: v1
kind: Pod
metadata:
  name: fastapi-pod
  labels:
    app: fastapi
    version: v1
spec:
  containers:
    - name: fastapi
      image: my-registry/fastapi-service:1.0.0
      ports:
        - containerPort: 8000
      env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
      resources:
        requests:
          memory: "128Mi"
          cpu: "100m"
        limits:
          memory: "256Mi"
          cpu: "500m"
      livenessProbe:
        httpGet:
          path: /health
          port: 8000
        initialDelaySeconds: 10
        periodSeconds: 5
      readinessProbe:
        httpGet:
          path: /ready
          port: 8000
        initialDelaySeconds: 5
        periodSeconds: 3
```

### なぜ直接 Pod を作成せず Deployment を使うのか？

```yaml
# deployment-example.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-deployment
spec:
  replicas: 3 # 自動的に 3 つの Pod を維持
  selector:
    matchLabels:
      app: fastapi
  template: # Pod テンプレート
    metadata:
      labels:
        app: fastapi
    spec:
      containers:
        - name: fastapi
          image: my-registry/fastapi-service:1.0.0
          ports:
            - containerPort: 8000
  strategy:
    type: RollingUpdate # ローリングアップデート戦略
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

Deployment は以下を提供します：

- **レプリカ管理**：指定された数の Pod を自動維持
- **ローリングアップデート**：サービスを中断せずに更新
- **ロールバック能力**：問題発生時に旧バージョンへ即座に戻す
- **自己修復**：Pod がクラッシュした場合に自動再作成

---

## Sidecar パターンと Istio

### Sidecar とは？

Sidecar パターンはデザインパターンの一種です。メインのアプリケーションコンテナの横に、横断的な関心事（Cross-cutting Concerns）を処理するための補助コンテナを配置します。バイクの横にあるサイドカーのように、メインのバイクが進む責任を持ち、サイドカーが荷物や人を運ぶ役割を果たします。

```
従来のアーキテクチャ：各サービスがセキュリティ、監視、リトライを個別に処理...
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Service A       │  │ Service B       │  │ Service C       │
│ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │
│ │ Business    │ │  │ │ Business    │ │  │ │ Business    │ │
│ │ Logic       │ │  │ │ Logic       │ │  │ │ Logic       │ │
│ ├─────────────┤ │  │ ├─────────────┤ │  │ ├─────────────┤ │
│ │ mTLS        │ │  │ │ mTLS        │ │  │ │ mTLS        │ │
│ │ Retry       │ │  │ │ Retry       │ │  │ │ Retry       │ │
│ │ Metrics     │ │  │ │ Metrics     │ │  │ │ Metrics     │ │
│ │ Tracing     │ │  │ │ Tracing     │ │  │ │ Tracing     │ │
│ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Sidecar アーキテクチャ：インフラの関心事を Sidecar で統一処理
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Service A       │  │ Service B       │  │ Service C       │
│ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │
│ │ Business    │ │  │ │ Business    │ │  │ │ Business    │ │
│ │ Logic Only! │ │  │ │ Logic Only! │ │  │ │ Logic Only! │ │
│ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │
│ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │
│ │   Envoy     │ │  │ │   Envoy     │ │  │ │   Envoy     │ │
│ │   Sidecar   │ │  │ │   Sidecar   │ │  │ │   Sidecar   │ │
│ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Sidecar が処理する横断的関心事

| 関心事               | 従来の方法                          | Sidecar の方法                    |
| -------------------- | ----------------------------------- | --------------------------------- |
| mTLS 暗号化          | 各サービスで TLS 実装               | Envoy が自動処理                  |
| サービスディスカバリ | Consul/Eureka SDK の統合            | Envoy が Control Plane 経由で取得 |
| ロードバランシング   | クライアントサイドライブラリ        | Envoy 組み込みアルゴリズム        |
| サーキットブレーカー | Hystrix/Resilience4j の統合         | Envoy 設定のみ                    |
| リトライ             | コード内実装                        | Envoy 設定のみ                    |
| Metrics              | Micrometer/Prometheus Client の統合 | Envoy が自動公開                  |
| Tracing              | Jaeger/Zipkin SDK の統合            | Envoy が自動伝播                  |

### Istio アーキテクチャ

Istio は Service Mesh ソリューションの一つで、Envoy Sidecar Proxy を各 Pod に自動注入することで、「コード無侵襲（Zero-intrusion）」のサービスガバナンスを実現します。

```
┌────────────────────────────────────────────────────────────────┐
│                        Istio Architecture                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Control Plane                        │   │
│  │  ┌─────────────────────────────────────────────────────┐│   │
│  │  │                      istiod                         ││   │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐              ││   │
│  │  │  │  Pilot  │  │ Citadel │  │ Galley  │              ││   │
│  │  │  │ (Traffic)  (Security)|  │ (Config)│              ││   │
│  │  │  └─────────┘  └─────────┘  └─────────┘              ││   │
│  │  └─────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              │ xDS API (設定配信)               │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     Data Plane                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │    Pod A    │  │    Pod B    │  │    Pod C    │      │   │
│  │  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │      │   │
│  │  │ │   App   │ │  │ │   App   │ │  │ │   App   │ │      │   │
│  │  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │      │   │
│  │  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │      │   │
│  │  │ │  Envoy  │◄┼──┼►│  Envoy  │◄┼──┼►│  Envoy  │ │      │   │
│  │  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │                       mTLS 暗号化通信                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

**Control Plane (istiod)**：

- **Pilot**：サービスディスカバリとトラフィック管理設定を担当。高レベルなルーティングルールを Envoy 設定に変換
- **Citadel**：証明書管理を担当。TLS 証明書の自動生成とローテーション
- **Galley**：設定の検証と配布を担当。設定の正確性を保証

**Data Plane**：

- 全 Pod 内の Envoy Sidecar で構成
- Pod へのすべての入出力トラフィックをインターセプト
- トラフィック制御、セキュリティポリシー、テレメトリ収集を実行

---

## Istio のインストールと設定

### 前提条件

```bash
# K3s が正常に動作しているか確認
kubectl get nodes

# 十分なリソースがあるか確認（Istio は最低 4GB RAM 推奨）
kubectl top nodes
```

### istioctl を使用したインストール

```bash
# 1. Istio のダウンロード
ISTIO_VERSION="1.20.0"
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=${ISTIO_VERSION} sh -

# 2. PATH に追加
cd istio-${ISTIO_VERSION}
export PATH=$PWD/bin:$PATH

# 3. 環境チェック
istioctl x precheck

# 4. Istio インストール（demo プロファイルは全コンポーネントを含む）
istioctl install --set profile=demo -y

# 本番環境では default またはカスタムプロファイルを推奨
# istioctl install --set profile=default -y

# 5. インストールの検証
kubectl get pods -n istio-system
# NAME                                    READY   STATUS
# istio-egressgateway-xxx                 1/1     Running
# istio-ingressgateway-xxx                1/1     Running
# istiod-xxx                              1/1     Running
```

### Istio オフラインインストール

```bash
# === インターネット接続のあるマシンで準備 ===

# 1. Istio のダウンロード
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.20.0

# 2. 必要な全イメージのダウンロード
IMAGES=(
  "docker.io/istio/proxyv2:1.20.0"
  "docker.io/istio/pilot:1.20.0"
)

for img in "${IMAGES[@]}"; do
  docker pull $img
  docker save $img -o $(echo $img | tr '/:' '_').tar
done

# === オフラインマシンでインストール ===

# 1. ローカルレジストリへのインポートまたは直接ロード
for tar in *.tar; do
  sudo k3s ctr images import $tar
done

# 2. ローカルハブを使用してインストール
istioctl install --set profile=demo \
  --set hub=my-registry.local/istio \
  -y
```

### Sidecar 自動注入の有効化

```bash
# Namespace に対して自動注入を有効化
kubectl label namespace default istio-injection=enabled

# ラベルの確認
kubectl get namespace -L istio-injection

# 特定の Deployment に対してのみ有効化することも可能
kubectl patch deployment my-app -p '{"spec":{"template":{"metadata":{"labels":{"sidecar.istio.io/inject":"true"}}}}}'
```

### Istio Profile の比較

```bash
# 利用可能なプロファイル一覧
istioctl profile list

# プロファイル内容のダンプ
istioctl profile dump demo
```

| Profile | 説明                                 | 利用シーン                         |
| ------- | ------------------------------------ | ---------------------------------- |
| default | 本番環境対応                         | 本番環境                           |
| demo    | 全コンポーネント含む、高リソース消費 | 学習、デモ                         |
| minimal | istiod のみ                          | Gateway API 経由のトラフィック制御 |
| empty   | 空の設定                             | 完全なカスタム設定                 |

---

## Gateway 設定

### Ingress Gateway

Ingress Gateway は Service Mesh への外部トラフィックの入り口です。

```yaml
# gateway.yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: main-gateway
  namespace: istio-system
spec:
  selector:
    istio: ingressgateway # デフォルトの Ingress Gateway を使用
  servers:
    - port:
        number: 80
        name: http
        protocol: HTTP
      hosts:
        - "api.example.com"
        - "*.example.com"
    - port:
        number: 443
        name: https
        protocol: HTTPS
      tls:
        mode: SIMPLE
        credentialName: example-com-cert # K8s Secret
      hosts:
        - "api.example.com"
```

### VirtualService（ルーティングルール）

```yaml
# virtualservice.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-routing
spec:
  hosts:
    - "api.example.com"
  gateways:
    - istio-system/main-gateway
  http:
    # FastAPI サービスへのルート
    - match:
        - uri:
            prefix: /api/v1/ml
      route:
        - destination:
            host: fastapi-service
            port:
              number: 8000
      timeout: 30s
      retries:
        attempts: 3
        perTryTimeout: 10s

    # Go サービスへのルート
    - match:
        - uri:
            prefix: /api/v1/gateway
      route:
        - destination:
            host: go-service
            port:
              number: 8080

    # メインサービスへのデフォルトルート
    - route:
        - destination:
            host: main-service
            port:
              number: 8000
```

### Egress Gateway

Egress Gateway はサービスから外部リソースへのアクセスを制御します。

```yaml
# egress-gateway.yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: egress-gateway
  namespace: istio-system
spec:
  selector:
    istio: egressgateway
  servers:
    - port:
        number: 443
        name: tls
        protocol: TLS
      hosts:
        - "postgres.external.com"
        - "grafana.external.com"
      tls:
        mode: PASSTHROUGH

---
# 外部サービスの定義
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: external-postgres
spec:
  hosts:
    - postgres.external.com
  ports:
    - number: 5432
      name: tcp-postgres
      protocol: TCP
  location: MESH_EXTERNAL
  resolution: DNS

---
# Egress Gateway へのルーティング
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: postgres-egress
spec:
  hosts:
    - postgres.external.com
  gateways:
    - mesh
    - istio-system/egress-gateway
  tcp:
    - match:
        - gateways:
            - mesh
          port: 5432
      route:
        - destination:
            host: istio-egressgateway.istio-system.svc.cluster.local
            port:
              number: 5432
    - match:
        - gateways:
            - istio-system/egress-gateway
          port: 5432
      route:
        - destination:
            host: postgres.external.com
            port:
              number: 5432
```

### トラフィック管理の高度な機能

```yaml
# カナリアリリース
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: canary-release
spec:
  hosts:
    - my-service
  http:
    - route:
        - destination:
            host: my-service
            subset: v1
          weight: 90
        - destination:
            host: my-service
            subset: v2
          weight: 10

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: my-service-versions
spec:
  host: my-service
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
```

```yaml
# サーキットブレーカー設定
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: circuit-breaker
spec:
  host: my-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        h2UpgradePolicy: UPGRADE
        http1MaxPendingRequests: 100
        http2MaxRequests: 1000
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
```

---

## Polyglot サービスのデプロイ

### プロジェクト構造

```
polyglot-microservices/
├── services/
│   ├── fastapi-service/        # Python FastAPI (AI/ML)
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   └── requirements.txt
│   ├── go-service/             # Go (API Gateway)
│   │   ├── Dockerfile
│   │   ├── main.go
│   │   └── go.mod
│   └── java-service/           # Java Spring Boot (Business Logic)
│       ├── Dockerfile
│       ├── pom.xml
│       └── src/
├── k8s/
│   ├── namespace.yaml
│   ├── fastapi/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── configmap.yaml
│   ├── go/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   └── java/
│       ├── deployment.yaml
│       └── service.yaml
└── istio/
    ├── gateway.yaml
    ├── virtualservice.yaml
    └── destinationrule.yaml
```

### FastAPI サービス (Python)

```python
# services/fastapi-service/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import os

app = FastAPI(title="ML Service")

class PredictionRequest(BaseModel):
    data: list[float]

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/ready")
async def ready():
    return {"status": "ready"}

@app.post("/api/v1/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    # ML 推論ロジック
    prediction = sum(request.data) / len(request.data)
    return PredictionResponse(prediction=prediction, confidence=0.95)

@app.get("/api/v1/call-go")
async def call_go_service():
    """サービス間呼び出しデモ - Envoy が mTLS を自動処理"""
    go_service_url = os.getenv("GO_SERVICE_URL", "http://go-service:8080")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{go_service_url}/health")
        return {"go_service_response": response.json()}
```

```dockerfile
# services/fastapi-service/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# k8s/fastapi/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-service
  labels:
    app: fastapi-service
    version: v1
spec:
  replicas: 2
  selector:
    matchLabels:
      app: fastapi-service
  template:
    metadata:
      labels:
        app: fastapi-service
        version: v1
      annotations:
        # Prometheus 自動検知
        prometheus.io/scrape: "true"
        prometheus.io/port: "8000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: fastapi
          image: my-registry/fastapi-service:1.0.0
          ports:
            - containerPort: 8000
          env:
            - name: GO_SERVICE_URL
              value: "http://go-service:8080"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
          resources:
            requests:
              memory: "256Mi"
              cpu: "200m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: fastapi-service
  labels:
    app: fastapi-service
spec:
  ports:
    - port: 8000
      targetPort: 8000
      name: http
  selector:
    app: fastapi-service
```

### Go サービス

```go
// services/go-service/main.go
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
}

type GatewayResponse struct {
	Message string `json:"message"`
	Service string `json:"service"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func gatewayHandler(w http.ResponseWriter, r *http.Request) {
	response := GatewayResponse{
		Message: "Request processed by Go Gateway",
		Service: "go-service",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/ready", healthHandler)
	http.HandleFunc("/api/v1/gateway", gatewayHandler)

	log.Printf("Go service starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
```

```dockerfile
# services/go-service/Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:3.18
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .

EXPOSE 8080
CMD ["./main"]
```

```yaml
# k8s/go/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: go-service
  labels:
    app: go-service
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: go-service
  template:
    metadata:
      labels:
        app: go-service
        version: v1
    spec:
      containers:
        - name: go
          image: my-registry/go-service:1.0.0
          ports:
            - containerPort: 8080
          env:
            - name: PORT
              value: "8080"
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "200m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 3
            periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: go-service
  labels:
    app: go-service
spec:
  ports:
    - port: 8080
      targetPort: 8080
      name: http
  selector:
    app: go-service
```

### デプロイスクリプト

```bash
#!/bin/bash
# deploy.sh

set -e

NAMESPACE="polyglot-services"
REGISTRY="my-registry.local"

echo "=== Building Docker Images ==="
docker build -t ${REGISTRY}/fastapi-service:1.0.0 ./services/fastapi-service/
docker build -t ${REGISTRY}/go-service:1.0.0 ./services/go-service/

echo "=== Pushing Images ==="
docker push ${REGISTRY}/fastapi-service:1.0.0
docker push ${REGISTRY}/go-service:1.0.0

echo "=== Creating Namespace ==="
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

echo "=== Enabling Istio Injection ==="
kubectl label namespace ${NAMESPACE} istio-injection=enabled --overwrite

echo "=== Creating Secrets ==="
kubectl create secret generic db-credentials \
  --from-literal=url="postgresql://user:pass@postgres.external:5432/mydb" \
  -n ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

echo "=== Deploying Services ==="
kubectl apply -f k8s/fastapi/ -n ${NAMESPACE}
kubectl apply -f k8s/go/ -n ${NAMESPACE}

echo "=== Configuring Istio ==="
kubectl apply -f istio/

echo "=== Waiting for Pods ==="
kubectl wait --for=condition=ready pod -l app=fastapi-service -n ${NAMESPACE} --timeout=120s
kubectl wait --for=condition=ready pod -l app=go-service -n ${NAMESPACE} --timeout=120s

echo "=== Deployment Complete ==="
kubectl get pods -n ${NAMESPACE}
```

### デプロイの検証

```bash
# Pod 状態のチェック（2/2 READY なら Sidecar 注入成功）
kubectl get pods -n polyglot-services
# NAME                               READY   STATUS    RESTARTS   AGE
# fastapi-service-xxx                2/2     Running   0          1m
# go-service-xxx                     2/2     Running   0          1m

# Sidecar のチェック
kubectl describe pod fastapi-service-xxx -n polyglot-services | grep -A 5 "istio-proxy"

# サービスのテスト
kubectl port-forward svc/istio-ingressgateway -n istio-system 8080:80

# 別ターミナルで実行
curl http://localhost:8080/api/v1/predict -X POST \
  -H "Content-Type: application/json" \
  -H "Host: api.example.com" \
  -d '{"data": [1.0, 2.0, 3.0]}'

# サービス間通信のテスト
curl http://localhost:8080/api/v1/call-go \
  -H "Host: api.example.com"
```

---

## なぜデータベースを K3s の外に置くのか？

これはよくあるアーキテクチャ設計上の疑問です。私の設計では、PostgreSQL を K3s クラスタの外部に配置していますが、これは主に以下の考慮に基づいています：

### 状態管理の複雑さ

Kubernetes の設計哲学はステートレスアプリケーションを優先しています。StatefulSet と PersistentVolume でステートフルサービスをサポートできますが、データベースの運用要件は一般的なアプリよりはるかに複雑です：

```
ステートレスアプリのライフサイクル：
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Create  │ ──► │  Run    │ ──► │ Delete  │  ← 簡単！いつでも再作成可能
└─────────┘     └─────────┘     └─────────┘

ステートフルデータベースのライフサイクル：
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Create  │ ──► │  Run    │ ──► │ Backup  │ ──► │ Upgrade │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                     │               │               │
                     ▼               ▼               ▼
              ┌─────────────────────────────────────────┐
              │  主従切り替え、データ移行、チューニング、災害復旧 │  ← 複雑！
              └─────────────────────────────────────────┘
```

### データの永続性と信頼性

データは企業にとって最も重要な資産です。それを K3s の外に置くことは以下を意味します：

- クラスタの異常（アップグレード、再構築、障害）がデータに影響しない
- 成熟したデータベース管理ツールとプロセスを利用できる
- バックアップと災害復旧戦略がより明確になる

### パフォーマンスの考慮

```
コンテナ化ストレージのパス：
Application → Container Runtime → CSI Driver → Storage Backend
                    ↑
                追加の遅延

ネイティブストレージのパス：
Application → Database → Local SSD / SAN
                    ↑
                最短パス
```

データベースは I/O パフォーマンスに非常に敏感です。コンテナ化されたストレージ層は通常、追加の遅延をもたらします。

### 責務の分離

| 責任者           | 管理内容                                     |
| ---------------- | -------------------------------------------- |
| 開発/SRE チーム  | K3s クラスタ、アプリケーションサービス       |
| DBA チーム       | データベース運用、パフォーマンスチューニング |
| クラウドサービス | Managed Database (RDS, Cloud SQL)            |

### 外部データベースへの接続

```yaml
# 外部サービスの定義
apiVersion: v1
kind: Service
metadata:
  name: external-postgres
spec:
  type: ExternalName
  externalName: postgres.external.example.com

---
# または IP を指す Endpoints を使用
apiVersion: v1
kind: Service
metadata:
  name: external-postgres
spec:
  ports:
    - port: 5432
      targetPort: 5432

---
apiVersion: v1
kind: Endpoints
metadata:
  name: external-postgres
subsets:
  - addresses:
      - ip: 10.0.0.100 # 外部 PostgreSQL IP
    ports:
      - port: 5432
```

### いつデータベースを K8s 内に置くべきか？

| シナリオ                                     | 推奨事項                    |
| -------------------------------------------- | --------------------------- |
| 開発/テスト環境                              | ✅ OK、迅速な環境構築に便利 |
| 再構築可能なデータ（Cache, Session）         | ✅ OK、例：Redis            |
| 専門の K8s DBA チームがいる                  | ✅ OK、Operator を使用      |
| 本番環境のコアデータベース                   | ⚠️ 慎重に評価すべき         |
| 特定のストレージを要するコンプライアンス要件 | ❌ 推奨しない               |

---

## 可観測性（Observability）アーキテクチャ

### 3つの柱

```
                    可観測性 (Observability)
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ Metrics │      │  Logs   │      │ Traces  │
    │ (数値)  │      │ (イベント)│     │ (リクエスト連鎖)│
    └────┬────┘      └────┬────┘      └────┬────┘
         │                │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │Prometheus│     │  Loki   │      │ Jaeger  │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                │                 │
         └────────────────┼─────────────────┘
                          │
                    ┌─────▼─────┐
                    │  Grafana  │
                    └───────────┘
```

### Prometheus 設定

```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    scrape_configs:
    # Kubernetes Service Discovery
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)

    # Istio Metrics
    - job_name: 'istio-mesh'
      kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
          - istio-system
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
        action: keep
        regex: istio-telemetry;prometheus
```

### Istio 組み込みメトリクス

Istio Envoy は以下のメトリクスを自動収集します：

| 指標                                  | 説明             | 用途               |
| ------------------------------------- | ---------------- | ------------------ |
| `istio_requests_total`                | リクエスト総数   | トラフィック分析   |
| `istio_request_duration_milliseconds` | リクエスト遅延   | パフォーマンス監視 |
| `istio_request_bytes`                 | リクエストサイズ | 帯域使用量         |
| `istio_response_bytes`                | レスポンスサイズ | 帯域使用量         |
| `istio_tcp_connections_opened_total`  | TCP 接続数       | 接続監視           |

### Grafana ダッシュボード

```yaml
# grafana-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
        - name: grafana
          image: grafana/grafana:10.2.0
          ports:
            - containerPort: 3000
          env:
            - name: GF_SECURITY_ADMIN_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: grafana-secret
                  key: admin-password
          volumeMounts:
            - name: grafana-datasources
              mountPath: /etc/grafana/provisioning/datasources
      volumes:
        - name: grafana-datasources
          configMap:
            name: grafana-datasources

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
data:
  datasources.yaml: |
    apiVersion: 1
    datasources:
    - name: Prometheus
      type: prometheus
      url: http://prometheus:9090
      access: proxy
      isDefault: true
```

---

## いつ K3s クラスタを拡張すべきか？

### 監視指標による判断

```bash
# 1. ノードリソース使用率の確認
kubectl top nodes

# 2. Pod リソース使用率の確認
kubectl top pods --all-namespaces

# 3. Pending Pods（リソース不足）の確認
kubectl get pods --all-namespaces | grep Pending

# 4. ノード状態の確認
kubectl describe nodes | grep -A 5 "Conditions:"
```

### 拡張トリガー

| 指標                 | 警戒値         | アクション           |
| -------------------- | -------------- | -------------------- |
| CPU 使用率           | > 70% 継続     | 拡張を検討           |
| メモリ使用率         | > 80% 継続     | 即座に拡張           |
| Pending Pods         | > 0 が 5分以上 | 原因調査             |
| Pod Eviction（退去） | 発生           | 即座に拡張           |
| API Server 遅延      | > 1 秒         | Control Plane を確認 |

### 水平スケーリング（ノード追加）

```bash
# シナリオ：計算リソースがもっと必要

# 1. 新しいノードの準備
# 新しいマシンで実行

# 2. 既存クラスタの Token 取得
sudo cat /var/lib/rancher/k3s/server/node-token

# 3. 新規 Worker ノードの参加
curl -sfL https://get.k3s.io | K3S_URL=https://<MASTER_IP>:6443 \
  K3S_TOKEN=<NODE_TOKEN> sh -

# 4. 検証
kubectl get nodes
```

### 垂直スケーリング（単一ノードのリソース増強）

```bash
# シナリオ：特定のサービスがもっとリソースを必要とする

# 1. Pod リソース制限の調整
kubectl patch deployment fastapi-service -p '{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "fastapi",
          "resources": {
            "requests": {"memory": "512Mi", "cpu": "500m"},
            "limits": {"memory": "1Gi", "cpu": "1000m"}
          }
        }]
      }
    }
  }
}'

# 2. または VPA（Vertical Pod Autoscaler）を使用
```

### 自動スケーリング設定

```yaml
# HPA (Horizontal Pod Autoscaler)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: fastapi-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: fastapi-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300 # フラッピング防止
    scaleUp:
      stabilizationWindowSeconds: 60
```

### 高可用性アーキテクチャへの拡張

```bash
# シナリオ：より高い可用性が必要

# シングルノードから HA クラスタへのアップグレード
# 最低 3 つの Control Plane ノードが必要

# Master 1 (初期化)
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --tls-san=<LOAD_BALANCER_IP>

# Master 2, 3 (参加)
curl -sfL https://get.k3s.io | sh -s - server \
  --server https://<MASTER1_IP>:6443 \
  --token <NODE_TOKEN> \
  --tls-san=<LOAD_BALANCER_IP>
```

### 拡張の意思決定フロー

```
                    ┌─────────────────┐
                    │  監視アラート発火 │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ 短期的なピーク？ │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │ Yes                         │ No
              ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │  HPA 自動スケール │           │  傾向分析       │
    │  回復を待つ      │           └────────┬────────┘
    └─────────────────┘                    │
                                 ┌─────────┴─────────┐
                                 │ CPU/Memory        │ その他
                                 ▼                   ▼
                       ┌─────────────────┐  ┌─────────────────┐
                       │  Worker 追加    │  │  アプリ最適化    │
                       │                 │  │  コード確認      │
                       └─────────────────┘  └─────────────────┘
```

---

## 注意点とベストプラクティス

### セキュリティ

```yaml
# 1. mTLS の有効化（Istio デフォルトで有効）
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT # mTLS を強制

---
# 2. Authorization Policy の設定
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: fastapi-policy
spec:
  selector:
    matchLabels:
      app: fastapi-service
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/default/sa/go-service"]
      to:
        - operation:
            methods: ["GET", "POST"]
            paths: ["/api/*"]
```

```bash
# 3. 定期的なイメージ更新
# バージョンを特定し、latest は避ける
image: my-registry/fastapi-service:1.0.0  # ✅
image: my-registry/fastapi-service:latest  # ❌

# 4. イメージ脆弱性スキャン
trivy image my-registry/fastapi-service:1.0.0
```

### リソース管理

```yaml
# Resource Requests と Limits は必ず設定する
resources:
  requests:
    memory: "256Mi" # スケジューリングの基準
    cpu: "200m"
  limits:
    memory: "512Mi" # 超えると OOMKilled
    cpu: "500m" # 超えると Throttle

# PodDisruptionBudget を設定して可用性を確保
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: fastapi-pdb
spec:
  minAvailable: 1 # 最低 1 つの Pod を維持
  selector:
    matchLabels:
      app: fastapi-service
```

### オフライン環境での注意点

```bash
# 1. 全イメージの事前ダウンロード
# Istio イメージ
docker pull docker.io/istio/proxyv2:1.20.0
docker pull docker.io/istio/pilot:1.20.0

# アプリケーションイメージ
docker pull my-registry/fastapi-service:1.0.0

# 2. プライベートレジストリの設定
# /etc/rancher/k3s/registries.yaml
mirrors:
  docker.io:
    endpoint:
      - "https://my-registry.local"
  my-registry.local:
    endpoint:
      - "https://my-registry.local"
configs:
  "my-registry.local":
    auth:
      username: admin
      password: secret

# 3. 設定適用のための K3s 再起動
sudo systemctl restart k3s
```

### デバッグのヒント

```bash
# 1. Sidecar 状態の確認
istioctl proxy-status

# 2. Envoy 設定の確認
istioctl proxy-config clusters <pod-name>
istioctl proxy-config routes <pod-name>

# 3. Envoy ログの確認
kubectl logs <pod-name> -c istio-proxy

# 4. デバッグ用 Pod へのアクセス
kubectl exec -it <pod-name> -c fastapi -- /bin/sh

# 5. サービス接続性の確認
kubectl run debug --rm -it --image=curlimages/curl -- sh
curl http://fastapi-service:8000/health

# 6. トラフィック分析
istioctl dashboard kiali  # サービス構成の可視化
```

### アップグレード戦略

```bash
# 1. K3s アップグレード
# Server を先に、次に Agent
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.28.5+k3s1 sh -

# 2. Istio アップグレード（カナリア方式）
istioctl install --set revision=1-21-0
kubectl label namespace default istio.io/rev=1-21-0 --overwrite

# 3. 検証後に旧バージョンを削除
istioctl uninstall --revision 1-20-0
```

### 一般的なトラブルシューティング

| 問題                  | 可能性のある原因       | 解決策                                         |
| --------------------- | ---------------------- | ---------------------------------------------- |
| Pod が Pending のまま | リソース不足           | ノード追加またはリソースリクエスト調整         |
| Sidecar 注入失敗      | Namespace ラベル未設定 | `kubectl label ns xxx istio-injection=enabled` |
| サービス間通信失敗    | mTLS 設定不一致        | PeerAuthentication 設定の確認                  |
| 外部アクセス失敗      | Gateway 設定ミス       | Gateway と VirtualService の確認               |
| イメージ取得失敗      | レジストリ認証         | imagePullSecrets の確認                        |

---

## 結び

K3s + Istio の組み合わせは、軽量でありながら完全に機能する Polyglot Microservices アーキテクチャのソリューションを提供します。Sidecar パターンにより、アプリケーションコードを変更することなく、エンタープライズ級のセキュリティ、可観測性、トラフィック管理機能を手に入れることができます。

重要なポイント：

1. **Polyglot の価値**：各サービスに最適な技術を選択させるが、運用コストは慎重に評価する。
2. **K3s の利点**：軽量、高速、オフライン対応、企業内部デプロイに最適。
3. **Istio の威力**：コード無侵襲のサービスガバナンス、横断的関心事の統一処理。
4. **アーキテクチャの決定**：データベースは外部、可観測性は独立させ、責務の分離を維持する。
5. **拡張のタイミング**：監視主導、実際の指標に基づいて意思決定する。

このようなアーキテクチャを計画する際の鍵は、実際のニーズに基づいて適切なトレードオフを行うことです。万能の答えはなく、現在のチームとビジネス要件に最も適した選択があるだけです。

---

## 参考文献

- [K3s 公式ドキュメント](https://docs.k3s.io/)
- [Istio 公式ドキュメント](https://istio.io/latest/docs/)
- [Kubernetes 公式ドキュメント](https://kubernetes.io/docs/)
- [Envoy Proxy ドキュメント](https://www.envoyproxy.io/docs/)
