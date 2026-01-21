---
title: Complete Guide to Building Polyglot Microservices with K3s + Istio
date: 2026-01-21
categories: Development
author: kai98k
tags:
  - Polyglot
  - Microservices
  - K3s
  - Istio
---

## Introduction

In the process of modernizing enterprise systems, we often face a challenge: how to gradually introduce new technologies while preserving existing systems? This article shares how I used K3s combined with Istio Service Mesh to build a microservices architecture supporting multiple languages, achieving smooth integration with existing Spring Cloud systems.

<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/board/jkgICUnXEkhjWUzEtgnVjK/k3s-i?node-id=0-1&embed-host=share" allowfullscreen></iframe>

---

## What are Polyglot Microservices?

### Definition

Polyglot Microservices is an architectural pattern that allows the use of different programming languages and technology stacks to build individual microservices within the same system. Each service can choose the language and framework that best suits its specific needs.

### Why Polyglot?

**Technical Suitability**: Different problem domains require different tools. For example:

- **Python (FastAPI)**: excellent for AI/ML services, data processing, and rapid prototyping
- **Go**: suitable for high-performance, high-concurrency services, such as API Gateways and real-time communication
- **Java (Spring Boot)**: suitable for complex business logic and enterprise-level transaction processing
- **Node.js**: suitable for I/O-intensive applications and real-time APIs
- **Rust**: suitable for system-level services requiring extremely high performance and security

**Leveraging Team Expertise**: Different teams may have different technical backgrounds. Polyglot allows each team to use the tools they are most familiar with.

**Gradual Modernization**: Existing systems might be in Java, but new services can be built with Go or Python, without needing a complete rewrite.

**Avoiding Vendor Lock-in**: Not being bound by a single language or framework maintains flexibility in technology selection.

### When to Use Polyglot?

| Scenario                                   | Recommendation                                                 |
| ------------------------------------------ | -------------------------------------------------------------- |
| Startup, small team (< 10 people)          | ❌ Not recommended, unify tech stack to reduce cognitive load  |
| Services with specific performance needs   | ✅ Suitable, use Go/Rust to handle bottlenecks                 |
| Need to integrate AI/ML features           | ✅ Suitable, Python ecosystem is irreplaceable                 |
| Integrating different tech teams after M&A | ✅ Suitable, allows teams to retain expertise                  |
| Breaking down existing monoliths           | ✅ Suitable, new services can use new tech                     |
| Team lacks DevOps experience               | ⚠️ Caution, multiple languages increase operational complexity |

### Challenges of Polyglot

- **Increased Operational Complexity**: Need to maintain multiple CI/CD pipelines and runtimes
- **Cross-service Debugging Difficulty**: Tracing and Logging across different languages need a unified format
- **Code Sharing Difficulty**: Cannot easily share libraries like in a single language

**This is where Service Mesh (like Istio) brings value**—it provides unified security, observability, and traffic management at the infrastructure layer, allowing the application layer to focus on business logic.

---

## Basic Kubernetes Concepts

### What is Kubernetes?

Kubernetes (K8s) is a container orchestration platform that solves the core problem of "how to manage a large number of containers". Imagine you have dozens of microservices, each running in a container, and you need to handle:

- **Deployment**: How to place services on the correct machines?
- **Scaling**: How to automatically add instances when traffic increases?
- **Self-healing**: How to automatically restart services when they crash?
- **Service Discovery**: How do services find each other?

Kubernetes provides a declarative way to manage these issues. You simply tell it "what state I want", and it automatically achieves and maintains that state for you.

### Core Components

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

**Control Plane Components**:

- **API Server**: Entry point for all operations; kubectl communicates with the cluster through it
- **etcd**: Distributed Key-Value store, holds all cluster state
- **Scheduler**: Decides which Node to place Pods on
- **Controller Manager**: Ensures actual state matches desired state

**Node Components**:

- **kubelet**: Agent on each Node, responsible for managing Pods
- **kube-proxy**: Handles network rules and service load balancing

### Core Resource Objects

| Resource         | Description                                               | Common Usage                         |
| ---------------- | --------------------------------------------------------- | ------------------------------------ |
| Pod              | Smallest deployment unit, contains one or more containers | Running applications                 |
| Deployment       | Manages Pod replicas and update strategies                | Stateless application deployment     |
| Service          | Provides stable network endpoints for Pods                | Service discovery and load balancing |
| ConfigMap        | Stores non-sensitive configuration                        | Environment variables, config files  |
| Secret           | Stores sensitive information                              | Passwords, API Keys                  |
| Ingress          | HTTP/HTTPS routing rules                                  | Exposing services externally         |
| PersistentVolume | Persistent storage                                        | Databases, file storage              |

---

## Why Choose K3s?

### K3s vs Standard Kubernetes

| Feature           | Standard K8s          | K3s                                 |
| ----------------- | --------------------- | ----------------------------------- |
| Binary Size       | ~1GB+                 | ~100MB                              |
| Memory Usage      | ~2GB+                 | ~512MB                              |
| Installation Time | Hours                 | Minutes                             |
| Default DB        | etcd                  | SQLite (can swap to etcd)           |
| Use Cases         | Large production envs | Edge, IoT, Dev/Test, SME Production |

### Reasons for Choosing K3s

**Resource-Constrained Environments**: K3s removes many cloud-specific drivers and legacy features, significantly reducing memory footprint. This is a huge advantage for internal enterprise Edge deployments or test environments.

**Quick to Start**: Installing a complete K8s cluster can take hours of configuration; K3s takes just minutes. This allows teams to focus on application development rather than infrastructure maintenance.

**Offline Deployment Friendly**: In enterprise intranets or air-gapped environments, K3s's simplified architecture makes offline installation much easier.

**Production Ready**: Despite being lightweight, K3s is a CNCF-certified Kubernetes distribution, fully compatible with standard K8s APIs.

---

## K3s Installation and Configuration

### Prerequisites

```bash
# System Requirements
# - Linux (Ubuntu 20.04/22.04, CentOS 7/8, RHEL 7/8)
# - Minimum 1 CPU, 512MB RAM (Recommended 2 CPU, 2GB RAM)
# - Open Ports: 6443 (API Server), 10250 (kubelet)

# Check system resources
free -h
nproc
```

### Online Installation (Single Node)

```bash
# Install K3s Server (Master + Worker)
curl -sfL https://get.k3s.io | sh -

# Check installation status
sudo systemctl status k3s

# Check node status
sudo kubectl get nodes

# K3s puts kubeconfig in /etc/rancher/k3s/k3s.yaml by default
# Set env var for convenience
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# Or copy to user directory
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
```

### Offline Installation (Air-gapped Environment)

```bash
# === Prepare on a machine with internet ===

# 1. Download K3s binary
K3S_VERSION="v1.28.4+k3s1"
wget https://github.com/k3s-io/k3s/releases/download/${K3S_VERSION}/k3s
wget https://github.com/k3s-io/k3s/releases/download/${K3S_VERSION}/k3s-airgap-images-amd64.tar.gz

# 2. Download install script
wget https://get.k3s.io -O install.sh

# === Install on offline machine ===

# 1. After copying files to target machine
sudo cp k3s /usr/local/bin/
sudo chmod +x /usr/local/bin/k3s

# 2. Load images
sudo mkdir -p /var/lib/rancher/k3s/agent/images/
sudo cp k3s-airgap-images-amd64.tar.gz /var/lib/rancher/k3s/agent/images/

# 3. Execute offline install
INSTALL_K3S_SKIP_DOWNLOAD=true ./install.sh
```

### Multi-node Cluster Configuration

```bash
# === Master Node ===
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --tls-san=<MASTER_IP> \
  --tls-san=<LOAD_BALANCER_IP>

# Get Token (for Workers to join)
sudo cat /var/lib/rancher/k3s/server/node-token

# === Worker Node ===
curl -sfL https://get.k3s.io | K3S_URL=https://<MASTER_IP>:6443 \
  K3S_TOKEN=<NODE_TOKEN> sh -

# === Verify Cluster ===
kubectl get nodes
# NAME      STATUS   ROLES                  AGE   VERSION
# master    Ready    control-plane,master   10m   v1.28.4+k3s1
# worker1   Ready    <none>                 5m    v1.28.4+k3s1
# worker2   Ready    <none>                 5m    v1.28.4+k3s1
```

### Common K3s Configuration Options

```bash
# Disable Traefik (since we will use Istio Gateway)
curl -sfL https://get.k3s.io | sh -s - server \
  --disable traefik

# Disable ServiceLB (use external Load Balancer)
curl -sfL https://get.k3s.io | sh -s - server \
  --disable servicelb

# Use external etcd (recommended for production)
curl -sfL https://get.k3s.io | sh -s - server \
  --datastore-endpoint="etcd://etcd1:2379,etcd://etcd2:2379,etcd://etcd3:2379"

# Full production config example
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --disable traefik \
  --disable servicelb \
  --tls-san=k3s.example.com \
  --node-taint CriticalAddonsOnly=true:NoExecute \
  --kubelet-arg="max-pods=110"
```

---

## What is a Pod?

### Basic Concept

A Pod is the smallest deployment unit in Kubernetes. A Pod can contain one or more tightly coupled containers that share:

- **Network Namepace**: Containers within a Pod share the same IP address and can communicate via `localhost`
- **Storage Volumes**: Can mount the same disk space
- **Lifecycle**: Created together, destroyed together

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

### Pod Lifecycle

```
Pending → Running → Succeeded/Failed
    │         │
    │         └── (CrashLoopBackOff) → Running
    │
    └── (ImagePullBackOff) → Pending
```

| State     | Description                                    |
| --------- | ---------------------------------------------- |
| Pending   | Pod accepted, but container not yet created    |
| Running   | Pod bound to node, all containers created      |
| Succeeded | All containers terminated successfully         |
| Failed    | All containers terminated, at least one failed |
| Unknown   | Unable to get Pod status                       |

### Pod Example

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

### Why use Deployment instead of creating Pods directly?

```yaml
# deployment-example.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-deployment
spec:
  replicas: 3 # Automatically maintain 3 Pods
  selector:
    matchLabels:
      app: fastapi
  template: # Pod Template
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
    type: RollingUpdate # Rolling update strategy
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

Deployment provides:

- **Replica Management**: Automatically maintains specified number of Pods
- **Rolling Updates**: Updates without service interruption
- **Rollback Capability**: Quickly revert to previous version if issues occur
- **Self-healing**: Auto-recreates Pods if they crash

---

## Sidecar Pattern and Istio

### What is a Sidecar?

The Sidecar pattern is a design pattern: attaching an auxiliary container alongside the main application container to handle Cross-cutting Concerns. Like a sidecar next to a motorcycle, the main bike is responsible for driving, while the sidecar carries cargo or passengers.

```
Traditional Architecture: Each service handles security, monitoring, retry itself...
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

Sidecar Architecture: Infrastructure concerns unified by Sidecar
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

### Cross-cutting Concerns handled by Sidecar

| Concern           | Traditional Approach                   | Sidecar Approach             |
| ----------------- | -------------------------------------- | ---------------------------- |
| mTLS              | Implement TLS in each service          | Envoy handles automatically  |
| Service Discovery | Integrate Consul/Eureka SDK            | Envoy gets via Control Plane |
| Load Balancing    | Client-side Library                    | Envoy built-in algorithms    |
| Circuit Breaking  | Integrate Hystrix/Resilience4j         | Envoy configuration          |
| Retry             | Code implementation                    | Envoy configuration          |
| Metrics           | Integrate Micrometer/Prometheus Client | Envoy auto-exposes           |
| Tracing           | Integrate Jaeger/Zipkin SDK            | Envoy auto-propagates        |

### Istio Architecture

Istio is a Service Mesh solution that implements "zero-intrusion" service governance by automatically injecting Envoy Sidecar Proxies into each Pod.

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
│  │  │  │(Traffic)│  (Security)|  │ (Config)│              ││   │
│  │  │  └─────────┘  └─────────┘  └─────────┘              ││   │
│  │  └─────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              │ xDS API (Config Push)           │
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
│  │                       mTLS Encrypted Traffic            │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

**Control Plane (istiod)**:

- **Pilot**: Responsible for service discovery and traffic management config, converting high-level routing rules to Envoy config
- **Citadel**: Responsible for credential management, automatically generating and rotating TLS certificates for services
- **Galley**: Responsible for configuration validation and distribution, ensuring config correctness

**Data Plane**:

- Composed of Envoy Sidecars in all Pods
- Intercepts all incoming and outgoing traffic for a Pod
- Executes traffic control, security policies, and telemetry collection

---

## Istio Installation and Configuration

### Prerequisites

```bash
# Verify K3s is running normally
kubectl get nodes

# Verify sufficient resources (Istio recommends at least 4GB RAM)
kubectl top nodes
```

### Install using istioctl

```bash
# 1. Download Istio
ISTIO_VERSION="1.20.0"
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=${ISTIO_VERSION} sh -

# 2. Add to PATH
cd istio-${ISTIO_VERSION}
export PATH=$PWD/bin:$PATH

# 3. Check environment
istioctl x precheck

# 4. Install Istio (demo profile includes all components)
istioctl install --set profile=demo -y

# Recommended default or custom profile for production
# istioctl install --set profile=default -y

# 5. Verify installation
kubectl get pods -n istio-system
# NAME                                    READY   STATUS
# istio-egressgateway-xxx                 1/1     Running
# istio-ingressgateway-xxx                1/1     Running
# istiod-xxx                              1/1     Running
```

### Offline Istio Installation

```bash
# === Prepare on Internet-connected machine ===

# 1. Download Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.20.0

# 2. Download all required images
IMAGES=(
  "docker.io/istio/proxyv2:1.20.0"
  "docker.io/istio/pilot:1.20.0"
)

for img in "${IMAGES[@]}"; do
  docker pull $img
  docker save $img -o $(echo $img | tr '/:' '_').tar
done

# === Install on offline machine ===

# 1. Import images to local registry or direct import
for tar in *.tar; do
  sudo k3s ctr images import $tar
done

# 2. Install using local hub
istioctl install --set profile=demo \
  --set hub=my-registry.local/istio \
  -y
```

### Enable Automatic Sidecar Injection

```bash
# Enable injection for Namespace
kubectl label namespace default istio-injection=enabled

# Verify label
kubectl get namespace -L istio-injection

# Can also enable for specific Deployment
kubectl patch deployment my-app -p '{"spec":{"template":{"metadata":{"labels":{"sidecar.istio.io/inject":"true"}}}}}'
```

### Istio Profile Comparison

```bash
# List available profiles
istioctl profile list

# Dump profile content
istioctl profile dump demo
```

| Profile | Description                                  | Usage Scenario                  |
| ------- | -------------------------------------------- | ------------------------------- |
| default | Production ready                             | Production environments         |
| demo    | Includes all components, high resource usage | Learning, Demos                 |
| minimal | Only istiod                                  | Traffic control via Gateway API |
| empty   | Empty config                                 | Fully custom setup              |

---

## Gateway Configuration

### Ingress Gateway

Ingress Gateway is the entry point for external traffic into the Service Mesh.

```yaml
# gateway.yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: main-gateway
  namespace: istio-system
spec:
  selector:
    istio: ingressgateway # Use default Ingress Gateway
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

### VirtualService (Routing Rules)

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
    # FastAPI Service Route
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

    # Go Service Route
    - match:
        - uri:
            prefix: /api/v1/gateway
      route:
        - destination:
            host: go-service
            port:
              number: 8080

    # Default route to main service
    - route:
        - destination:
            host: main-service
            port:
              number: 8000
```

### Egress Gateway

Egress Gateway controls service access to external resources.

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
# Define external service
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
# Route to Egress Gateway
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

### Advanced Traffic Management

```yaml
# Canary Deployment
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
# Circuit Breaker config
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

## Deploying Polyglot Services

### Project Structure

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

### FastAPI Service (Python)

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
    # ML Inference Logic
    prediction = sum(request.data) / len(request.data)
    return PredictionResponse(prediction=prediction, confidence=0.95)

@app.get("/api/v1/call-go")
async def call_go_service():
    """Demo inter-service call - Envoy handles mTLS automatically"""
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
        # Prometheus auto-discovery
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

### Go Service

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

### Deployment Script

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

### Verify Deployment

```bash
# Check Pod status (should see 2/2 READY, indicating Sidecar injection success)
kubectl get pods -n polyglot-services
# NAME                               READY   STATUS    RESTARTS   AGE
# fastapi-service-xxx                2/2     Running   0          1m
# go-service-xxx                     2/2     Running   0          1m

# Check Sidecar
kubectl describe pod fastapi-service-xxx -n polyglot-services | grep -A 5 "istio-proxy"

# Test Service
kubectl port-forward svc/istio-ingressgateway -n istio-system 8080:80

# In another terminal
curl http://localhost:8080/api/v1/predict -X POST \
  -H "Content-Type: application/json" \
  -H "Host: api.example.com" \
  -d '{"data": [1.0, 2.0, 3.0]}'

# Test inter-service communication
curl http://localhost:8080/api/v1/call-go \
  -H "Host: api.example.com"
```

---

## Why put the database outside K3s?

This is a common architectural decision question. In my design, PostgreSQL is placed outside the K3s cluster, mainly based on the following considerations:

### Complexity of State Management

Kubernetes design philosophy favors stateless applications. Although StatefulSet and PersistentVolume can support stateful services, the operational requirements of databases are far more complex than general applications:

```
Stateless App Lifecycle:
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Create  │ ──► │  Run    │ ──► │ Delete  │  ← Simple! Can be recreated anytime
└─────────┘     └─────────┘     └─────────┘

Stateful Database Lifecycle:
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Create  │ ──► │  Run    │ ──► │ Backup  │ ──► │ Upgrade │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                     │               │               │
                     ▼               ▼               ▼
              ┌─────────────────────────────────────────┐
              │  Primary-Replica Switch, Data Migration,│
              │  Performance Tuning, Disaster Recovery  │  ← Complex!
              └─────────────────────────────────────────┘
```

### Data Persistence and Reliability

Data is the most important asset for an enterprise. Placing it outside K3s means:

- Any anomaly in the cluster (upgrade, rebuild, failure) will not affect the data
- Mature database management tools and processes can be used
- Backup and disaster recovery strategies are clearer

### Performance Considerations

```
Containerized Storage Path:
Application → Container Runtime → CSI Driver → Storage Backend
                    ↑
                Extra Latency

Native Storage Path:
Application → Database → Local SSD / SAN
                    ↑
                Shortest Path
```

Databases are extremely sensitive to I/O performance. Containerized storage layers usually introduce extra latency.

### Separation of Concerns

| Responsibility | Managed Content                   |
| -------------- | --------------------------------- |
| Dev/SRE Team   | K3s Cluster, Application Services |
| DBA Team       | Database Ops, Performance Tuning  |
| Cloud Service  | Managed Database (RDS, Cloud SQL) |

### Connecting External Database

```yaml
# Define external service
apiVersion: v1
kind: Service
metadata:
  name: external-postgres
spec:
  type: ExternalName
  externalName: postgres.external.example.com

---
# Or use Endpoints pointing to IP
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
      - ip: 10.0.0.100 # External PostgreSQL IP
    ports:
      - port: 5432
```

### When can you put the database inside K8s?

| Scenario                              | Recommendation                     |
| ------------------------------------- | ---------------------------------- |
| Dev/Test Environments                 | ✅ Yes, convenient for quick setup |
| Reconstructible Data (Cache, Session) | ✅ Yes, e.g., Redis                |
| Have dedicated K8s DBA team           | ✅ Yes, using Operator             |
| Production Core Database              | ⚠️ Evaluate carefully              |
| Compliance requiring specific storage | ❌ Not recommended                 |

---

## Observability Architecture

### Three Pillars

```
                    Observability
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ Metrics │      │  Logs   │      │ Traces  │
    │ (Values)│      │ (Events)│      │ (Chains)│
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

### Prometheus Configuration

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

### Istio Built-in Metrics

Istio Envoy automatically collects the following metrics:

| Metric                                | Description      | Usage                  |
| ------------------------------------- | ---------------- | ---------------------- |
| `istio_requests_total`                | Total requests   | Traffic analysis       |
| `istio_request_duration_milliseconds` | Request duration | Performance monitoring |
| `istio_request_bytes`                 | Request size     | Bandwidth usage        |
| `istio_response_bytes`                | Response size    | Bandwidth usage        |
| `istio_tcp_connections_opened_total`  | TCP connections  | Connection monitoring  |

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

## When to scale the K3s cluster?

### Monitoring Indicators Judgment

```bash
# 1. Check node resource usage
kubectl top nodes

# 2. Check Pod resource usage
kubectl top pods --all-namespaces

# 3. Check Pending Pods (resource insufficiency)
kubectl get pods --all-namespaces | grep Pending

# 4. Check Node Conditions
kubectl describe nodes | grep -A 5 "Conditions:"
```

### Scaling Triggers

| Metric             | Warning Threshold | Action              |
| ------------------ | ----------------- | ------------------- |
| CPU Usage          | > 70% sustained   | Consider scaling    |
| Memory Usage       | > 80% sustained   | Scale immediately   |
| Pending Pods       | > 0 for > 5 mins  | Investigate cause   |
| Pod Eviction       | Occurs            | Scale immediately   |
| API Server Latency | > 1 sec           | Check Control Plane |

### Horizontal Scaling (Adding Nodes)

```bash
# Scenario: Need more compute resources

# 1. Prepare new node
# Run on new machine

# 2. Get existing cluster Token
sudo cat /var/lib/rancher/k3s/server/node-token

# 3. Join new Worker Node
curl -sfL https://get.k3s.io | K3S_URL=https://<MASTER_IP>:6443 \
  K3S_TOKEN=<NODE_TOKEN> sh -

# 4. Verify
kubectl get nodes
```

### Vertical Scaling (Increasing Single Node Resources)

```bash
# Scenario: Specific service needs more resources

# 1. Adjust Pod Resource Limits
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

# 2. Or use VPA (Vertical Pod Autoscaler)
```

### Auto-scaling Configuration

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
      stabilizationWindowSeconds: 300 # Prevent flapping
    scaleUp:
      stabilizationWindowSeconds: 60
```

### High Availability Architecture Scaling

```bash
# Scenario: Need higher availability

# Upgrade from Single Node to HA Cluster
# Need at least 3 Control Plane nodes

# Master 1 (Init)
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --tls-san=<LOAD_BALANCER_IP>

# Master 2, 3 (Join)
curl -sfL https://get.k3s.io | sh -s - server \
  --server https://<MASTER1_IP>:6443 \
  --token <NODE_TOKEN> \
  --tls-san=<LOAD_BALANCER_IP>
```

### Scaling Decision Process

```
                    ┌─────────────────┐
                    │  Monitor Alert   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Short-term peak?│
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │ Yes                         │ No
              ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │  HPA Auto-scale │           │ Analyze Trends  │
    │  Wait recovery  │           └────────┬────────┘
    └─────────────────┘                    │
                                 ┌─────────┴─────────┐
                                 │ CPU/Memory        │ Other
                                 ▼                   ▼
                       ┌─────────────────┐  ┌─────────────────┐
                       │  Add Worker     │  │  Optimize App   │
                       │  Node           │  │  Check Code     │
                       └─────────────────┘  └─────────────────┘
```

---

## Notes and Best Practices

### Security

```yaml
# 1. Enable mTLS (Istio default enabled)
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT # Enforce mTLS

---
# 2. Configure Authorization Policy
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
# 3. Regularly Update Images
# Use specific version, avoid latest
image: my-registry/fastapi-service:1.0.0  # ✅
image: my-registry/fastapi-service:latest  # ❌

# 4. Scan Image Vulnerabilities
trivy image my-registry/fastapi-service:1.0.0
```

### Resource Management

```yaml
# Must set Resource Requests and Limits
resources:
  requests:
    memory: "256Mi" # Scheduling basis
    cpu: "200m"
  limits:
    memory: "512Mi" # Exceeding causes OOMKilled
    cpu: "500m" # Exceeding causes Throttle

# Configure PodDisruptionBudget to ensure availability
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: fastapi-pdb
spec:
  minAvailable: 1 # Keep at least 1 Pod running
  selector:
    matchLabels:
      app: fastapi-service
```

### Offline Environment Notes

```bash
# 1. Pre-download all images
# Istio Images
docker pull docker.io/istio/proxyv2:1.20.0
docker pull docker.io/istio/pilot:1.20.0

# Application Images
docker pull my-registry/fastapi-service:1.0.0

# 2. Configure Private Registry
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

# 3. Restart K3s to apply config
sudo systemctl restart k3s
```

### Debugging Tips

```bash
# 1. Check Sidecar Status
istioctl proxy-status

# 2. Check Envoy Config
istioctl proxy-config clusters <pod-name>
istioctl proxy-config routes <pod-name>

# 3. View Envoy Logs
kubectl logs <pod-name> -c istio-proxy

# 4. Enter Pod for Debugging
kubectl exec -it <pod-name> -c fastapi -- /bin/sh

# 5. Check Service Connectivity
kubectl run debug --rm -it --image=curlimages/curl -- sh
curl http://fastapi-service:8000/health

# 6. Analyze Traffic
istioctl dashboard kiali  # Visualize service topology
```

### Upgrade Strategy

```bash
# 1. K3s Upgrade
# Upgrade Server first, then Agent
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.28.5+k3s1 sh -

# 2. Istio Upgrade (Canary)
istioctl install --set revision=1-21-0
kubectl label namespace default istio.io/rev=1-21-0 --overwrite

# 3. Remove old version after verification
istioctl uninstall --revision 1-20-0
```

### Common Issues Troubleshooting

| Issue                 | Possible Cause         | Solution                                       |
| --------------------- | ---------------------- | ---------------------------------------------- |
| Pod stuck Pending     | Insufficient resources | Add nodes or adjust resource requests          |
| Sidecar inject failed | Namespace not labeled  | `kubectl label ns xxx istio-injection=enabled` |
| Inter-service fail    | mTLS config mismatch   | Check PeerAuthentication settings              |
| External access fail  | Gateway config error   | Check Gateway and VirtualService               |
| Image pull failed     | Registry auth          | Check imagePullSecrets                         |

---

## Conclusion

The combination of K3s + Istio provides a lightweight yet fully functional solution for polyglot microservices architecture. The Sidecar pattern allows us to gain enterprise-grade security, observability, and traffic management capabilities without modifying application code.

Key Takeaways:

1. **Value of Polyglot**: Let each service choose the detailed tech, but carefully evaluate operational costs.
2. **Advantage of K3s**: Lightweight, fast, offline-friendly, suitable for internal enterprise deployment.
3. **Power of Istio**: Zero-intrusion service governance, unified handling of cross-cutting concerns.
4. **Architectural Decisions**: External database, independent observability, maintaining separation of concerns.
5. **Scaling Timing**: Monitoring-driven, decision making based on actual metrics.

When planning such an architecture, the key is to make appropriate trade-offs based on actual needs. There is no one-size-fits-all answer, only the most suitable choice for the current team and business requirements.

---

## References

- [K3s Official Documentation](https://docs.k3s.io/)
- [Istio Official Documentation](https://istio.io/latest/docs/)
- [Kubernetes Official Documentation](https://kubernetes.io/docs/)
- [Envoy Proxy Documentation](https://www.envoyproxy.io/docs/)
