---
title: K3s + Istio 建構 Polyglot Microservices 完整指南
date: 2026-01-21
categories: Development
author: kai98k
tags:
  - Polyglot
  - Microservices
  - K3s
  - Istio
---

## 前言

在企業系統現代化的過程中，我們經常面臨一個挑戰：如何在保留既有系統的同時，逐步引入新技術？本文將分享我如何使用 K3s 搭配 Istio Service Mesh，建構一套支援多語言的微服務架構，實現與既有 Spring Cloud 系統的平滑整合。

<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/board/jkgICUnXEkhjWUzEtgnVjK/k3s-i?node-id=0-1&embed-host=share" allowfullscreen></iframe>

---

## 什麼是 Polyglot Microservices？

### 定義

Polyglot Microservices（多語言微服務）是一種架構模式，允許在同一個系統中使用不同的程式語言和技術棧來建構各個微服務。每個服務可以選擇最適合其特定需求的語言和框架。

### 為什麼需要 Polyglot？

**技術適配性**：不同的問題領域適合不同的工具。例如：

- **Python（FastAPI）**：非常適合 AI/ML 服務、資料處理、快速原型開發
- **Go**：適合高效能、高並發的服務，如 API Gateway、即時通訊
- **Java（Spring Boot）**：適合複雜的業務邏輯、企業級交易處理
- **Node.js**：適合 I/O 密集型應用、即時 API
- **Rust**：適合對效能和安全性要求極高的系統層服務

**團隊專長發揮**：不同團隊可能有不同的技術背景，Polyglot 允許各團隊使用最熟悉的工具。

**漸進式現代化**：既有系統可能是 Java，新服務可以用 Go 或 Python，不需要全部重寫。

**避免技術鎖定**：不被單一語言或框架綁定，保持技術選型的靈活性。

### 什麼時候該使用 Polyglot？

| 場景                        | 建議                              |
| --------------------------- | --------------------------------- |
| 新創公司，團隊小（< 10 人） | ❌ 不建議，統一技術棧降低認知負擔 |
| 有特定效能需求的服務        | ✅ 適合，用 Go/Rust 處理效能瓶頸  |
| 需要整合 AI/ML 功能         | ✅ 適合，Python 生態系無可取代    |
| 併購後整合不同技術團隊      | ✅ 適合，允許各團隊保留專長       |
| 既有單體應用拆分            | ✅ 適合，新服務可用新技術         |
| 團隊沒有 DevOps 經驗        | ⚠️ 謹慎，多語言增加維運複雜度     |

### Polyglot 的挑戰

- **維運複雜度增加**：需要維護多種 CI/CD Pipeline、多種 Runtime
- **跨服務除錯困難**：不同語言的 Tracing 和 Logging 需要統一格式
- **共用程式碼困難**：無法像單一語言那樣輕鬆共享 Library

**這正是 Service Mesh（如 Istio）的價值所在**——它在基礎設施層面提供統一的安全性、可觀測性和流量管理，讓應用層可以專注於業務邏輯。

---

## Kubernetes 基本概念

### 什麼是 Kubernetes？

Kubernetes（簡稱 K8s）是一個容器編排平台，它解決了「如何管理大量容器」這個核心問題。想像你有數十個微服務，每個都運行在容器中，你需要處理：

- **部署**：如何將服務放到正確的機器上？
- **擴展**：流量增加時如何自動增加實例？
- **自癒**：服務掛掉時如何自動重啟？
- **服務發現**：服務之間如何找到彼此？

Kubernetes 提供了一套聲明式的方式來管理這些問題。你只需要告訴它「我想要什麼狀態」，它會自動幫你達成並持續維護。

### 核心元件

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

**Control Plane 元件**：

- **API Server**：所有操作的入口，kubectl 就是透過它與叢集溝通
- **etcd**：分散式 Key-Value 儲存，保存叢集的所有狀態
- **Scheduler**：決定 Pod 要放在哪個 Node 上
- **Controller Manager**：確保實際狀態符合期望狀態

**Node 元件**：

- **kubelet**：每個 Node 上的 Agent，負責管理 Pod
- **kube-proxy**：處理網路規則和服務負載均衡

### 核心資源物件

| 資源             | 說明                           | 常見用途           |
| ---------------- | ------------------------------ | ------------------ |
| Pod              | 最小部署單位，包含一或多個容器 | 運行應用程式       |
| Deployment       | 管理 Pod 的副本數和更新策略    | 無狀態應用部署     |
| Service          | 為 Pod 提供穩定的網路端點      | 服務發現和負載均衡 |
| ConfigMap        | 儲存非敏感配置                 | 環境變數、設定檔   |
| Secret           | 儲存敏感資訊                   | 密碼、API Key      |
| Ingress          | HTTP/HTTPS 路由規則            | 對外暴露服務       |
| PersistentVolume | 持久化儲存                     | 資料庫、檔案儲存   |

---

## 為什麼選擇 K3s？

### K3s vs 標準 Kubernetes

| 特性           | 標準 K8s     | K3s                             |
| -------------- | ------------ | ------------------------------- |
| 二進位檔案大小 | ~1GB+        | ~100MB                          |
| 記憶體佔用     | ~2GB+        | ~512MB                          |
| 安裝時間       | 數小時       | 幾分鐘                          |
| 預設資料庫     | etcd         | SQLite（可換 etcd）             |
| 適用場景       | 大型生產環境 | Edge、IoT、開發測試、中小型生產 |

### 選擇 K3s 的理由

**資源受限的環境**：K3s 移除了許多雲端特定的驅動程式和 Legacy 功能，記憶體佔用大幅降低。對於企業內部的 Edge 部署或測試環境來說，這是極大的優勢。

**快速上手**：完整的 K8s 叢集安裝可能需要數小時的配置，K3s 只需要幾分鐘。這讓團隊可以專注在應用開發而非基礎設施維運。

**離線部署友善**：在企業內網或 Air-gapped 環境中，K3s 的簡化架構讓離線安裝變得更加容易。

**生產就緒**：儘管輕量，K3s 仍然是經過 CNCF 認證的 Kubernetes 發行版，完全相容標準 K8s API。

---

## K3s 安裝與配置

### 前置需求

```bash
# 系統需求
# - Linux (Ubuntu 20.04/22.04, CentOS 7/8, RHEL 7/8)
# - 最低 1 CPU, 512MB RAM (建議 2 CPU, 2GB RAM)
# - 開放 Port: 6443 (API Server), 10250 (kubelet)

# 檢查系統資源
free -h
nproc
```

### 線上安裝（單節點）

```bash
# 安裝 K3s Server (Master + Worker)
curl -sfL https://get.k3s.io | sh -

# 檢查安裝狀態
sudo systemctl status k3s

# 檢查節點狀態
sudo kubectl get nodes

# K3s 預設將 kubeconfig 放在 /etc/rancher/k3s/k3s.yaml
# 設定環境變數方便使用
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# 或者複製到使用者目錄
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
```

### 離線安裝（Air-gapped 環境）

```bash
# === 在有網路的機器上準備 ===

# 1. 下載 K3s 二進位檔
K3S_VERSION="v1.28.4+k3s1"
wget https://github.com/k3s-io/k3s/releases/download/${K3S_VERSION}/k3s
wget https://github.com/k3s-io/k3s/releases/download/${K3S_VERSION}/k3s-airgap-images-amd64.tar.gz

# 2. 下載安裝腳本
wget https://get.k3s.io -O install.sh

# === 在離線機器上安裝 ===

# 1. 複製檔案到目標機器後
sudo cp k3s /usr/local/bin/
sudo chmod +x /usr/local/bin/k3s

# 2. 載入映像檔
sudo mkdir -p /var/lib/rancher/k3s/agent/images/
sudo cp k3s-airgap-images-amd64.tar.gz /var/lib/rancher/k3s/agent/images/

# 3. 執行離線安裝
INSTALL_K3S_SKIP_DOWNLOAD=true ./install.sh
```

### 多節點叢集配置

```bash
# === Master 節點 ===
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --tls-san=<MASTER_IP> \
  --tls-san=<LOAD_BALANCER_IP>

# 取得 Token（用於 Worker 加入）
sudo cat /var/lib/rancher/k3s/server/node-token

# === Worker 節點 ===
curl -sfL https://get.k3s.io | K3S_URL=https://<MASTER_IP>:6443 \
  K3S_TOKEN=<NODE_TOKEN> sh -

# === 驗證叢集 ===
kubectl get nodes
# NAME      STATUS   ROLES                  AGE   VERSION
# master    Ready    control-plane,master   10m   v1.28.4+k3s1
# worker1   Ready    <none>                 5m    v1.28.4+k3s1
# worker2   Ready    <none>                 5m    v1.28.4+k3s1
```

### K3s 常用配置選項

```bash
# 停用 Traefik（因為我們要用 Istio Gateway）
curl -sfL https://get.k3s.io | sh -s - server \
  --disable traefik

# 停用 ServiceLB（使用外部 Load Balancer）
curl -sfL https://get.k3s.io | sh -s - server \
  --disable servicelb

# 使用外部 etcd（生產環境建議）
curl -sfL https://get.k3s.io | sh -s - server \
  --datastore-endpoint="etcd://etcd1:2379,etcd://etcd2:2379,etcd://etcd3:2379"

# 完整生產環境配置範例
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --disable traefik \
  --disable servicelb \
  --tls-san=k3s.example.com \
  --node-taint CriticalAddonsOnly=true:NoExecute \
  --kubelet-arg="max-pods=110"
```

---

## 什麼是 Pod？

### 基本概念

Pod 是 Kubernetes 中最小的部署單位。一個 Pod 可以包含一個或多個緊密相關的容器，它們共享：

- **網路空間**：Pod 內的容器共用同一個 IP 地址，可以透過 `localhost` 互相通訊
- **儲存卷**：可以掛載相同的磁碟空間
- **生命週期**：一起被建立、一起被銷毀

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

### Pod 生命週期

```
Pending → Running → Succeeded/Failed
    │         │
    │         └── (CrashLoopBackOff) → Running
    │
    └── (ImagePullBackOff) → Pending
```

| 狀態      | 說明                               |
| --------- | ---------------------------------- |
| Pending   | Pod 已被接受，但容器尚未建立       |
| Running   | Pod 已綁定到節點，所有容器都已建立 |
| Succeeded | 所有容器都成功終止                 |
| Failed    | 所有容器都已終止，至少一個失敗     |
| Unknown   | 無法取得 Pod 狀態                  |

### Pod 範例

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

### 為什麼通常用 Deployment 而非直接建立 Pod？

```yaml
# deployment-example.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-deployment
spec:
  replicas: 3 # 自動維護 3 個 Pod
  selector:
    matchLabels:
      app: fastapi
  template: # Pod 模板
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
    type: RollingUpdate # 滾動更新策略
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

Deployment 提供：

- **副本管理**：自動維護指定數量的 Pod
- **滾動更新**：更新時不中斷服務
- **回滾能力**：出問題可以快速回到上一版本
- **自癒能力**：Pod 掛掉會自動重建

---

## Sidecar 模式與 Istio

### 什麼是 Sidecar？

Sidecar 模式是一種設計模式：在主應用程式容器旁邊，附加一個輔助容器來處理橫切關注點（Cross-cutting Concerns）。就像摩托車旁邊的邊車，主車負責前進，邊車負責載貨或載人。

```
傳統架構：每個服務自己處理安全、監控、重試...
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

Sidecar 架構：基礎設施關注點由 Sidecar 統一處理
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

### Sidecar 處理的橫切關注點

| 關注點    | 傳統做法                          | Sidecar 做法           |
| --------- | --------------------------------- | ---------------------- |
| mTLS 加密 | 每個服務實作 TLS                  | Envoy 自動處理         |
| 服務發現  | 整合 Consul/Eureka SDK            | Envoy 透過控制平面獲取 |
| 負載均衡  | 客戶端 Library                    | Envoy 內建多種演算法   |
| 熔斷      | 整合 Hystrix/Resilience4j         | Envoy 配置即可         |
| 重試      | 程式碼內實作                      | Envoy 配置即可         |
| Metrics   | 整合 Micrometer/Prometheus Client | Envoy 自動暴露         |
| Tracing   | 整合 Jaeger/Zipkin SDK            | Envoy 自動傳播         |

### Istio 架構

Istio 是一個 Service Mesh 解決方案，它透過自動注入 Envoy Sidecar Proxy 到每個 Pod，實現了「零侵入式」的服務治理。

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
│  │  │  │  (流量)│    │ (安全)  │  │ (配置)  │              ││   │
│  │  │  └─────────┘  └─────────┘  └─────────┘              ││   │
│  │  └─────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              │ xDS API (配置下發)               │
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
│  │                       mTLS 加密通訊                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

**Control Plane（istiod）**：

- **Pilot**：負責服務發現和流量管理配置，將高階路由規則轉換為 Envoy 配置
- **Citadel**：負責憑證管理，自動為服務產生和輪換 TLS 憑證
- **Galley**：負責配置驗證和分發，確保配置正確性

**Data Plane**：

- 由所有 Pod 中的 Envoy Sidecar 組成
- 攔截所有進出 Pod 的流量
- 執行流量控制、安全策略、遙測收集

---

## Istio 安裝與配置

### 前置需求

```bash
# 確認 K3s 運行正常
kubectl get nodes

# 確認有足夠資源（Istio 建議至少 4GB RAM）
kubectl top nodes
```

### 使用 istioctl 安裝

```bash
# 1. 下載 Istio
ISTIO_VERSION="1.20.0"
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=${ISTIO_VERSION} sh -

# 2. 加入 PATH
cd istio-${ISTIO_VERSION}
export PATH=$PWD/bin:$PATH

# 3. 檢查環境
istioctl x precheck

# 4. 安裝 Istio（使用 demo profile 包含所有元件）
istioctl install --set profile=demo -y

# 生產環境建議使用 default 或自訂 profile
# istioctl install --set profile=default -y

# 5. 驗證安裝
kubectl get pods -n istio-system
# NAME                                    READY   STATUS
# istio-egressgateway-xxx                 1/1     Running
# istio-ingressgateway-xxx                1/1     Running
# istiod-xxx                              1/1     Running
```

### 離線安裝 Istio

```bash
# === 在有網路的機器上準備 ===

# 1. 下載 Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.20.0

# 2. 下載所有需要的映像檔
IMAGES=(
  "docker.io/istio/proxyv2:1.20.0"
  "docker.io/istio/pilot:1.20.0"
)

for img in "${IMAGES[@]}"; do
  docker pull $img
  docker save $img -o $(echo $img | tr '/:' '_').tar
done

# === 在離線機器上安裝 ===

# 1. 載入映像檔到本地 Registry 或直接載入
for tar in *.tar; do
  sudo k3s ctr images import $tar
done

# 2. 使用本地映像安裝
istioctl install --set profile=demo \
  --set hub=my-registry.local/istio \
  -y
```

### 啟用自動 Sidecar 注入

```bash
# 為 Namespace 啟用自動注入
kubectl label namespace default istio-injection=enabled

# 驗證標籤
kubectl get namespace -L istio-injection

# 也可以為特定 Deployment 啟用
kubectl patch deployment my-app -p '{"spec":{"template":{"metadata":{"labels":{"sidecar.istio.io/inject":"true"}}}}}'
```

### Istio 配置 Profile 比較

```bash
# 查看可用的 profile
istioctl profile list

# 查看 profile 內容
istioctl profile dump demo
```

| Profile | 說明                     | 適用場景                  |
| ------- | ------------------------ | ------------------------- |
| default | 生產就緒配置             | 生產環境                  |
| demo    | 包含所有元件，資源需求高 | 學習、展示                |
| minimal | 只有 istiod              | 透過 Gateway API 控制流量 |
| empty   | 空配置                   | 完全自訂                  |

---

## Gateway 配置

### Ingress Gateway

Ingress Gateway 是外部流量進入 Service Mesh 的入口。

```yaml
# gateway.yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: main-gateway
  namespace: istio-system
spec:
  selector:
    istio: ingressgateway # 使用預設的 Ingress Gateway
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

### VirtualService（路由規則）

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
    # FastAPI 服務路由
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

    # Go 服務路由
    - match:
        - uri:
            prefix: /api/v1/gateway
      route:
        - destination:
            host: go-service
            port:
              number: 8080

    # 預設路由到主服務
    - route:
        - destination:
            host: main-service
            port:
              number: 8000
```

### Egress Gateway

Egress Gateway 控制服務對外部資源的存取。

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
# 定義外部服務
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
# 路由到 Egress Gateway
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

### 流量管理進階功能

```yaml
# 金絲雀部署
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
# 熔斷配置
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

## 部署 Polyglot 服務

### 專案結構

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

### FastAPI 服務（Python）

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
    # ML 推論邏輯
    prediction = sum(request.data) / len(request.data)
    return PredictionResponse(prediction=prediction, confidence=0.95)

@app.get("/api/v1/call-go")
async def call_go_service():
    """示範服務間呼叫 - Envoy 會自動處理 mTLS"""
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
        # Prometheus 自動發現
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

### Go 服務

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

### 部署腳本

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

### 驗證部署

```bash
# 檢查 Pod 狀態（應該看到 2/2 READY，表示 Sidecar 注入成功）
kubectl get pods -n polyglot-services
# NAME                               READY   STATUS    RESTARTS   AGE
# fastapi-service-xxx                2/2     Running   0          1m
# go-service-xxx                     2/2     Running   0          1m

# 檢查 Sidecar
kubectl describe pod fastapi-service-xxx -n polyglot-services | grep -A 5 "istio-proxy"

# 測試服務
kubectl port-forward svc/istio-ingressgateway -n istio-system 8080:80

# 在另一個終端
curl http://localhost:8080/api/v1/predict -X POST \
  -H "Content-Type: application/json" \
  -H "Host: api.example.com" \
  -d '{"data": [1.0, 2.0, 3.0]}'

# 測試服務間通訊
curl http://localhost:8080/api/v1/call-go \
  -H "Host: api.example.com"
```

---

## 為什麼資料庫放在 K3s 外部？

這是一個常見的架構決策問題。在我的設計中，PostgreSQL 被放置在 K3s 叢集外部，主要基於以下考量：

### 狀態管理的複雜性

Kubernetes 的設計哲學偏向無狀態應用。雖然 StatefulSet 和 PersistentVolume 可以支援有狀態服務，但資料庫的運維需求遠比一般應用複雜：

```
無狀態應用生命週期：
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Create  │ ──► │  Run    │ ──► │ Delete  │  ← 簡單！隨時可以重建
└─────────┘     └─────────┘     └─────────┘

有狀態資料庫生命週期：
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Create  │ ──► │  Run    │ ──► │ Backup  │ ──► │ Upgrade │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                     │               │               │
                     ▼               ▼               ▼
              ┌─────────────────────────────────────────┐
              │  主從切換、資料遷移、效能調校、災難復原  │  ← 複雜！
              └─────────────────────────────────────────┘
```

### 資料持久性與可靠性

資料庫是企業最重要的資產。將它放在 K3s 外部，意味著：

- 叢集的任何異常（升級、重建、故障）都不會影響資料
- 可以使用成熟的資料庫管理工具和流程
- 備份和災難復原策略更加明確

### 效能考量

```
容器化儲存路徑：
Application → Container Runtime → CSI Driver → Storage Backend
                    ↑
                額外延遲

原生儲存路徑：
Application → Database → Local SSD / SAN
                    ↑
                最短路徑
```

資料庫對 I/O 效能極為敏感。容器化的儲存層通常會帶來額外的延遲。

### 職責分離

| 負責對象      | 管理內容                          |
| ------------- | --------------------------------- |
| 開發/SRE 團隊 | K3s 叢集、應用服務                |
| DBA 團隊      | 資料庫維運、效能調校              |
| 雲端服務      | Managed Database (RDS, Cloud SQL) |

### 連接外部資料庫

```yaml
# 定義外部服務
apiVersion: v1
kind: Service
metadata:
  name: external-postgres
spec:
  type: ExternalName
  externalName: postgres.external.example.com

---
# 或使用 Endpoints 指向 IP
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

### 什麼時候可以把資料庫放在 K8s 內？

| 場景                         | 建議                      |
| ---------------------------- | ------------------------- |
| 開發/測試環境                | ✅ 可以，方便快速建立環境 |
| 資料可重建（Cache, Session） | ✅ 可以，如 Redis         |
| 有專業 K8s DBA 團隊          | ✅ 可以，使用 Operator    |
| 生產核心資料庫               | ⚠️ 謹慎評估               |
| 合規要求特定儲存             | ❌ 不建議                 |

---

## 可觀測性架構

### 三大支柱

```
                    可觀測性 (Observability)
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ Metrics │      │  Logs   │      │ Traces  │
    │ (數值)  │      │ (事件)  │       │ (請求鏈)│
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

### Prometheus 配置

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
    # Kubernetes 服務發現
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

    # Istio 指標
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

### Istio 內建指標

Istio Envoy 自動收集以下指標：

| 指標                                  | 說明       | 用途     |
| ------------------------------------- | ---------- | -------- |
| `istio_requests_total`                | 請求總數   | 流量分析 |
| `istio_request_duration_milliseconds` | 請求延遲   | 效能監控 |
| `istio_request_bytes`                 | 請求大小   | 流量計費 |
| `istio_response_bytes`                | 回應大小   | 流量計費 |
| `istio_tcp_connections_opened_total`  | TCP 連線數 | 連線監控 |

### Grafana Dashboard

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

## 何時需要擴充 K3s 叢集？

### 監控指標判斷

```bash
# 1. 檢查節點資源使用率
kubectl top nodes

# 2. 檢查 Pod 資源使用率
kubectl top pods --all-namespaces

# 3. 檢查 Pending Pods（資源不足）
kubectl get pods --all-namespaces | grep Pending

# 4. 檢查節點 Conditions
kubectl describe nodes | grep -A 5 "Conditions:"
```

### 擴充觸發條件

| 指標            | 警戒值          | 行動               |
| --------------- | --------------- | ------------------ |
| CPU 使用率      | > 70% 持續      | 考慮擴充           |
| 記憶體使用率    | > 80% 持續      | 立即擴充           |
| Pending Pods    | > 0 超過 5 分鐘 | 檢查原因           |
| Pod 驅逐事件    | 出現            | 立即擴充           |
| API Server 延遲 | > 1 秒          | 檢查 Control Plane |

### 水平擴充（增加節點）

```bash
# 場景：需要更多運算資源

# 1. 準備新節點
# 在新機器上執行

# 2. 取得現有叢集的 Token
sudo cat /var/lib/rancher/k3s/server/node-token

# 3. 加入新 Worker 節點
curl -sfL https://get.k3s.io | K3S_URL=https://<MASTER_IP>:6443 \
  K3S_TOKEN=<NODE_TOKEN> sh -

# 4. 驗證
kubectl get nodes
```

### 垂直擴充（增加單節點資源）

```bash
# 場景：特定服務需要更多資源

# 1. 調整 Pod 資源限制
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

# 2. 或使用 VPA（Vertical Pod Autoscaler）
```

### 自動擴充配置

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
      stabilizationWindowSeconds: 300 # 防止頻繁縮容
    scaleUp:
      stabilizationWindowSeconds: 60
```

### 高可用架構擴充

```bash
# 場景：需要更高可用性

# 從單節點升級為 HA 叢集
# 需要至少 3 個 Control Plane 節點

# Master 1 (初始化)
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --tls-san=<LOAD_BALANCER_IP>

# Master 2, 3 (加入)
curl -sfL https://get.k3s.io | sh -s - server \
  --server https://<MASTER1_IP>:6443 \
  --token <NODE_TOKEN> \
  --tls-san=<LOAD_BALANCER_IP>
```

### 擴充決策流程

```
                    ┌─────────────────┐
                    │   監控告警觸發   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  是短期流量高峰？ │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │ Yes                         │ No
              ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │  HPA 自動擴展    │           │  分析資源瓶頸    │
    │  等待恢復正常    │           └────────┬────────┘
    └─────────────────┘                    │
                                 ┌─────────┴─────────┐
                                 │ CPU/Memory        │ 其他
                                 ▼                   ▼
                       ┌─────────────────┐  ┌─────────────────┐
                       │  增加 Worker    │  │  優化應用程式    │
                       │  節點           │  │  檢查程式碼      │
                       └─────────────────┘  └─────────────────┘
```

---

## 注意事項與最佳實踐

### 安全性

```yaml
# 1. 啟用 mTLS（Istio 預設啟用）
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT # 強制 mTLS

---
# 2. 設定 Authorization Policy
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
# 3. 定期更新映像檔
# 使用特定版本，避免 latest
image: my-registry/fastapi-service:1.0.0  # ✅
image: my-registry/fastapi-service:latest  # ❌

# 4. 掃描映像檔漏洞
trivy image my-registry/fastapi-service:1.0.0
```

### 資源管理

```yaml
# 務必設定 Resource Requests 和 Limits
resources:
  requests:
    memory: "256Mi" # 調度依據
    cpu: "200m"
  limits:
    memory: "512Mi" # 超過會 OOMKilled
    cpu: "500m" # 超過會被 Throttle

# 設定 PodDisruptionBudget 確保可用性
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: fastapi-pdb
spec:
  minAvailable: 1 # 至少保持 1 個 Pod 運行
  selector:
    matchLabels:
      app: fastapi-service
```

### 離線環境特別注意

```bash
# 1. 預先下載所有映像檔
# Istio 映像檔
docker pull docker.io/istio/proxyv2:1.20.0
docker pull docker.io/istio/pilot:1.20.0

# 應用映像檔
docker pull my-registry/fastapi-service:1.0.0

# 2. 設定私有 Registry
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

# 3. 重啟 K3s 套用配置
sudo systemctl restart k3s
```

### 除錯技巧

```bash
# 1. 檢查 Sidecar 狀態
istioctl proxy-status

# 2. 檢查 Envoy 配置
istioctl proxy-config clusters <pod-name>
istioctl proxy-config routes <pod-name>

# 3. 查看 Envoy 日誌
kubectl logs <pod-name> -c istio-proxy

# 4. 進入 Pod 除錯
kubectl exec -it <pod-name> -c fastapi -- /bin/sh

# 5. 檢查服務連通性
kubectl run debug --rm -it --image=curlimages/curl -- sh
curl http://fastapi-service:8000/health

# 6. 分析流量
istioctl dashboard kiali  # 視覺化服務拓撲
```

### 升級策略

```bash
# 1. K3s 升級
# 先升級 Server，再升級 Agent
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.28.5+k3s1 sh -

# 2. Istio 升級（金絲雀方式）
istioctl install --set revision=1-21-0
kubectl label namespace default istio.io/rev=1-21-0 --overwrite

# 3. 驗證後移除舊版本
istioctl uninstall --revision 1-20-0
```

### 常見問題排查

| 問題             | 可能原因         | 解決方案                                       |
| ---------------- | ---------------- | ---------------------------------------------- |
| Pod 一直 Pending | 資源不足         | 增加節點或調整資源請求                         |
| Sidecar 注入失敗 | Namespace 未標記 | `kubectl label ns xxx istio-injection=enabled` |
| 服務間通訊失敗   | mTLS 配置不一致  | 檢查 PeerAuthentication 設定                   |
| 外部存取失敗     | Gateway 配置錯誤 | 檢查 Gateway 和 VirtualService                 |
| 映像檔拉取失敗   | Registry 認證    | 檢查 imagePullSecrets                          |

---

## 結語

K3s + Istio 的組合為多語言微服務架構提供了一個輕量但功能完整的解決方案。Sidecar 模式讓我們能夠在不修改應用程式碼的情況下，獲得企業級的安全性、可觀測性和流量管理能力。

關鍵要點：

1. **Polyglot 的價值**：讓每個服務選擇最適合的技術，但要謹慎評估維運成本
2. **K3s 的優勢**：輕量、快速、離線友善，適合企業內部部署
3. **Istio 的威力**：零侵入式的服務治理，統一處理橫切關注點
4. **架構決策**：資料庫外置、可觀測性獨立，保持職責分離
5. **擴充時機**：監控驅動，根據實際指標做決策

在規劃這類架構時，關鍵是要根據實際需求做出合適的權衡。沒有放諸四海皆準的答案，只有最適合當前團隊和業務需求的選擇。

---

## 參考資源

- [K3s 官方文件](https://docs.k3s.io/)
- [Istio 官方文件](https://istio.io/latest/docs/)
- [Kubernetes 官方文件](https://kubernetes.io/docs/)
- [Envoy Proxy 文件](https://www.envoyproxy.io/docs/)
