# Kubernetes Three-Tier Application

A production-ready, containerized three-tier web application architected and deployed on Kubernetes, demonstrating cloud-native infrastructure expertise.

## Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           Kubernetes Cluster                                │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         three-tier-app Namespace                       │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────┐ │  │
│  │  │    Frontend      │  │     Backend      │  │      PostgreSQL     │ │  │
│  │  │   (React+Nginx)  │  │  (Node.js/Expr)  │  │   (StatefulSet)     │ │  │
│  │  ├──────────────────┤  ├──────────────────┤  ├─────────────────────┤ │  │
│  │  │ Deployment       │  │ Deployment       │  │ StatefulSet         │ │  │
│  │  │ replicas: 2      │  │ replicas: 2      │  │ replicas: 1         │ │  │
│  │  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌───────────────┐   │ │  │
│  │  │ │ nginx:alpine │ │  │ │node:20-alpine│ │  │ │postgres:16-   │   │ │  │
│  │  │ │ port: 80     │ │  │ │ port: 3000   │ │  │ │ alpine        │   │ │  │
│  │  │ │ 50m/64Mi     │ │  │ │ 50m/64Mi     │ │  │ │ port: 5432    │   │ │  │
│  │  │ └──────────────┘ │  │ └──────────────┘ │  │ │ 100m/128Mi    │   │ │  │
│  │  └────────┬─────────┘  └────────┬─────────┘  └────────┬───────────┘   │  │
│  │           │                     │                     │               │  │
│  │  ┌────────┴─────────────────────┴─────────────────────┴───────────┐   │  │
│  │  │                     Services Layer                              │   │  │
│  │  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │   │  │
│  │  │  │ LoadBalancer  │  │  ClusterIP    │  │  Headless (DNS)   │   │   │  │
│  │  │  │ :80           │  │ :3000         │  │  postgres-svc     │   │   │  │
│  │  │  └───────────────┘  └───────────────┘  └───────────────────┘   │   │  │
│  │  └─────────────────────────────┬───────────────────────────────────┘   │  │
│  │                                │                                       │  │
│  │  ┌─────────────────────────────┴───────────────────────────────────┐   │  │
│  │  │                    Storage Layer                                 │   │  │
│  │  │  ┌─────────────────────────────────────────────────────────────┐ │   │  │
│  │  │  │            PersistentVolumeClaim: postgres-pvc             │ │   │  │
│  │  │  │                    1Gi Storage                              │ │   │  │
│  │  │  └─────────────────────────────────────────────────────────────┘ │   │  │
│  │  └──────────────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                              Data Flow                                      │
│                                                                              │
│   User ──► LoadBalancer ──► NGINX ──► ClusterIP ──► Express API ──► PG    │
│              (Frontend)         (Backend)           (Database)              │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

## Project Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| **Setup & Design** | 2 days | Namespace structure, ConfigMap/Secret design, networking topology |
| **Backend Development** | 3 days | Express API, health endpoints, PostgreSQL integration |
| **Frontend Development** | 2 days | React SPA, NGINX configuration, API integration |
| **Containerization** | 1 day | Dockerfiles, multi-stage builds, image optimization |
| **Kubernetes Deployment** | 3 days | StatefulSet, Deployments, Services, PVCs |
| **Testing & Validation** | 2 days | Health probes, resource tuning, connectivity testing |
| **Documentation** | 1 day | README, architecture docs, operational guides |

**Total Project Duration**: ~14 days

## Application Screenshots

```
┌─────────────────────────────────────────────────────────────────┐
│           Kubernetes Three-Tier Application                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     ┌─────────────────────────────────────────────────────┐     │
│     │                                                     │     │
│     │          KUBERNETES THREE-TIER APP                  │     │
│     │                                                     │     │
│     │     ┌───────────────────────────────────────────┐   │     │
│     │     │                                           │   │     │
│     │     │    Frontend: React + Nginx                │   │     │
│     │     │    Backend:  Node.js + Express            │   │     │
│     │     │    Database: PostgreSQL                   │   │     │
│     │     │                                           │   │     │
│     │     └───────────────────────────────────────────┘   │     │
│     │                                                     │     │
│     │         [Check Backend Status]                      │     │
│     │                                                     │     │
│     │     ┌───────────────────────────────────────────┐   │     │
│     │     │ {                                           │   │     │
│     │     │   "service": "three-tier-backend",         │   │     │
│     │     │   "database": "connected",                 │   │     │
│     │     │   "server_time": "2026-09-29T12:00:00Z"    │   │     │
│     │     │ }                                           │   │     │
│     │     └───────────────────────────────────────────┘   │     │
│     │                                                     │     │
│     └─────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Orchestration** | Kubernetes, Minikube |
| **Frontend** | React 18, NGINX Alpine |
| **Backend** | Node.js 20, Express.js, pg (PostgreSQL driver) |
| **Database** | PostgreSQL 16 (StatefulSet) |
| **Configuration** | ConfigMaps, Kubernetes Secrets |
| **Storage** | PersistentVolumeClaims |

## Key Skills Demonstrated

### Kubernetes & Container Orchestration
- StatefulSet deployment for stateful PostgreSQL database
- Deployment strategies with rolling updates and rollbacks
- Liveness/readiness probes for zero-downtime deployments
- Namespace isolation and resource quota management
- Service networking (ClusterIP, LoadBalancer, Headless)

### Infrastructure as Code
- Declarative Kubernetes manifests (YAML)
- Environment-specific configuration via ConfigMaps
- Secret management for credentials and API keys
- Persistent storage provisioning

### DevOps & Cloud Patterns
- Containerization with multi-stage Docker builds
- Minikube local development workflow
- kubectl operational commands
- CI/CD-ready deployment manifests

## Deployment Structure

```
k8s-three-tier/
├── backend/
│   ├── Dockerfile          # Node.js container build
│   ├── server.js           # Express API + health endpoints
│   └── package.json
├── frontend/
│   ├── Dockerfile          # NGINX static serving
│   ├── nginx.conf          # Reverse proxy configuration
│   └── index.html          # React SPA
├── 00-namespace.yaml       # three-tier-app namespace
├── 01-configmap.yaml       # Database & app configuration
├── 02-secret.yaml          # Encrypted credentials
├── 03-postgres-pvc.yaml    # Persistent volume claim
├── 04-postgres-statefulset.yaml
├── 05-postgres-service.yaml
├── 06-backend-deployment.yaml
├── 07-backend-service.yaml
├── 08-frontend-deployment.yaml
└── 09-frontend-service.yaml
```

## Quick Start

```bash
# Start Minikube
minikube start --driver=docker --cpus=4 --memory=8192

# Deploy all manifests
kubectl apply -f .

# Access application
kubectl port-forward -n three-tier-app svc/frontend-svc 8080:80
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Service info |
| `GET /health` | Liveness probe |
| `GET /ready` | Readiness probe (DB connectivity check) |
| `GET /api` | Database connectivity test with timestamp |

## Development Workflow

### Local Development Cycle

```bash
# 1. Start Minikube
minikube start --driver=docker --cpus=4 --memory=8192

# 2. Build and load images
docker build -t frontend:latest ./frontend
docker build -t backend-api:latest ./backend
minikube image load frontend:latest
minikube image load backend-api:latest

# 3. Deploy to cluster
kubectl apply -f k8s-three-tier/

# 4. Monitor deployments
kubectl get pods -n three-tier-app -w

# 5. View logs
kubectl logs -n three-tier-app deployment/backend -f
kubectl logs -n three-tier-app deployment/frontend -f

# 6. Test endpoints
curl http://localhost:8080/api
```

### Iterative Development

```bash
# Make code changes, rebuild image
docker build -t backend-api:latest ./backend
minikube image load backend-api:latest

# Rolling update
kubectl set image deployment/backend backend=backend-api:latest -n three-tier-app

# Verify rollout
kubectl rollout status deployment/backend -n three-tier-app

# Rollback if needed
kubectl rollout undo deployment/backend -n three-tier-app
```

### Debugging Commands

```bash
# Pod diagnostics
kubectl describe pod -n three-tier-app <pod-name>
kubectl logs -n three-tier-app <pod-name> --previous

# Shell access
kubectl exec -n three-tier-app -it <pod-name> -- /bin/sh

# Network check
kubectl run test-$RANDOM --rm -i --tty --image busybox -- nslookup postgres-svc

# Resource usage
kubectl top pods -n three-tier-app
```

## Key Implementation Details

### Database Health Check
```javascript
app.get("/ready", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ready", database: "connected" });
  } catch {
    res.status(503).json({ status: "not_ready", database: "disconnected" });
  }
});
```

### Resource Configuration
- **Frontend**: 50m CPU / 64Mi Memory (per pod)
- **Backend**: 50m CPU / 64Mi Memory (per pod)
- **PostgreSQL**: 100m CPU / 128Mi Memory

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| **ImagePullBackOff** | Image not in registry or minikube | `minikube image load <image>:<tag>` |
| **CrashLoopBackOff** | Application crash | `kubectl logs <pod> --previous` |
| **Pending Pods** | Insufficient resources | Check node capacity: `kubectl describe node minikube` |
| **Service Unreachable** | Wrong port/selector | Verify service endpoints: `kubectl get endpoints -n three-tier-app` |
| **DB Connection Failed** | ConfigMap/Secret mismatch | Validate config: `kubectl get configmap three-tier-config -o yaml` |
| **PVC Pending** | No storage class/insufficient space | Check PVC status: `kubectl get pvc -n three-tier-app` |

### Diagnostic Commands

```bash
# Cluster health
kubectl get all --all-namespaces
kubectl describe node minikube

# Namespace resources
kubectl get all -n three-tier-app
kubectl get events -n three-tier-app --sort-by='.lastTimestamp'

# Service connectivity
kubectl run test-$RANDOM --rm -i --tty --image=busybox -- sh
# nslookup postgres-svc.three-tier-app.svc.cluster.local
# wget -qO- http://backend-svc:3000/health
```

## Production Considerations (For Future Enhancement)

- Horizontal Pod Autoscaler (HPA)
- NetworkPolicies for tier isolation
- External secret management (Vault/AWS Secrets Manager)
- Prometheus + Grafana observability stack
- TLS termination with Ingress controller
- Database backup and disaster recovery

---

**Stack**: Kubernetes | Docker | Node.js | React | PostgreSQL | NGINX

**Category**: Cloud Infrastructure | DevOps | Container Orchestration

**Duration**: ~14 days (full project lifecycle)