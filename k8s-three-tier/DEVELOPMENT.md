# Local Development Setup Guide

Complete guide for setting up and developing the Kubernetes three-tier application locally.

## Prerequisites

### System Requirements
- **OS**: Linux, macOS, or Windows (WSL2 recommended)
- **RAM**: 8GB+ (Minikube requires 4GB minimum)
- **Disk Space**: 20GB+ for Docker images and cluster storage
- **CPU**: 4+ cores recommended

### Required Tools

```bash
# Check versions after installation
minikube version      # v1.37.0+
kubectl version       # v1.37.0+
docker --version      # 20.10+
node --version        # v20+
npm --version         # 10+
```

## Installation

### 1. Docker
**macOS/Windows:**
- Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Enable Kubernetes (Settings → Kubernetes → Enable Kubernetes)

**Linux:**
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
```

### 2. Minikube
```bash
# macOS (Homebrew)
brew install minikube

# Linux
curl -LO https://github.com/kubernetes/minikube/releases/download/v1.37.0/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Windows (Chocolatey)
choco install minikube
```

### 3. kubectl
```bash
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/

# Windows
choco install kubernetes-cli
```

### 4. Node.js & npm
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

## Quick Start

### 1. Clone & Setup Repository
```bash
git clone https://github.com/dcube-g/k8s-three-tier-app.git
cd k8s-three-tier-app
```

### 2. Start Minikube Cluster
```bash
minikube start \
  --driver=docker \
  --cpus=4 \
  --memory=8192 \
  --disk-size=20g

# Verify cluster
kubectl cluster-info
minikube status
```

### 3. Build Docker Images Locally
```bash
# Navigate to project root
cd k8s-three-tier

# Build backend
docker build -t backend-api:latest ./backend
minikube image load backend-api:latest

# Build frontend
docker build -t frontend:latest ./frontend
minikube image load frontend:latest

# Verify images in Minikube
minikube image ls
```

### 4. Deploy Application
```bash
# Apply manifests in order
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-configmap.yaml
kubectl apply -f 02-secret.yaml
kubectl apply -f 03-postgres-pvc.yaml
kubectl apply -f 04-postgres-statefulset.yaml
kubectl apply -f 05-postgres-service.yaml
kubectl apply -f 06-backend-deployment.yaml
kubectl apply -f 07-backend-service.yaml
kubectl apply -f 08-frontend-deployment.yaml
kubectl apply -f 09-frontend-service.yaml

# Or apply all at once
kubectl apply -f .
```

### 5. Monitor Deployment
```bash
# Watch pod status
kubectl get pods -n three-tier-app -w

# Wait for all pods to be Running
# (PostgreSQL may take 30+ seconds to start)
```

### 6. Access Application
```bash
# Option A: Port Forward (recommended for local dev)
kubectl port-forward -n three-tier-app svc/frontend-svc 8080:80

# Option B: Minikube Service
minikube service frontend-svc -n three-tier-app --url

# Access at: http://localhost:8080
```

## Development Workflow

### Making Code Changes

**Backend:**
```bash
# Edit backend code
nano k8s-three-tier/backend/server.js

# Rebuild and deploy
docker build -t backend-api:latest ./k8s-three-tier/backend
minikube image load backend-api:latest
kubectl set image deployment/backend backend=backend-api:latest -n three-tier-app

# Monitor rollout
kubectl rollout status deployment/backend -n three-tier-app
```

**Frontend:**
```bash
# Edit frontend code
nano k8s-three-tier/frontend/index.html

# Rebuild and deploy
docker build -t frontend:latest ./k8s-three-tier/frontend
minikube image load frontend:latest
kubectl set image deployment/frontend frontend=frontend:latest -n three-tier-app

# Monitor rollout
kubectl rollout status deployment/frontend -n three-tier-app
```

### View Application Logs

```bash
# Backend logs
kubectl logs -n three-tier-app deployment/backend -f

# Frontend logs (NGINX)
kubectl logs -n three-tier-app deployment/frontend -f

# Database logs
kubectl logs -n three-tier-app statefulset/postgres -f

# View logs from specific pod
kubectl logs -n three-tier-app <pod-name>

# Previous pod logs (if crashed)
kubectl logs -n three-tier-app <pod-name> --previous
```

### Testing API Endpoints

```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pod -n three-tier-app -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Port forward backend
kubectl port-forward -n three-tier-app pod/$BACKEND_POD 3000:3000

# Test endpoints
curl http://localhost:3000/              # Service info
curl http://localhost:3000/health        # Liveness probe
curl http://localhost:3000/ready         # Readiness probe
curl http://localhost:3000/api           # API endpoint with DB query
```

### Database Access

```bash
# Connect to PostgreSQL
POSTGRES_POD=$(kubectl get pod -n three-tier-app -l app=postgres -o jsonpath='{.items[0].metadata.name}')

kubectl exec -n three-tier-app -it $POSTGRES_POD -- psql -U postgres -d appdb

# Inside psql shell
\dt                      # List tables
SELECT * FROM pg_tables; # View all tables
\q                       # Exit
```

## Debugging

### Check Resource Status
```bash
# Overall namespace status
kubectl get all -n three-tier-app

# Detailed pod info
kubectl describe pod -n three-tier-app <pod-name>

# Resource usage
kubectl top pods -n three-tier-app
kubectl top nodes

# Events
kubectl get events -n three-tier-app --sort-by='.lastTimestamp'
```

### Shell Access to Containers
```bash
# Backend container
kubectl exec -n three-tier-app -it <backend-pod> -- /bin/sh

# Frontend container
kubectl exec -n three-tier-app -it <frontend-pod> -- /bin/sh

# Database container
kubectl exec -n three-tier-app -it <postgres-pod> -- /bin/bash
```

### Network Diagnostics
```bash
# Test DNS resolution
kubectl run test-dns --rm -i --tty --image=busybox -- nslookup postgres-svc.three-tier-app.svc.cluster.local

# Test connectivity between pods
kubectl run test-curl --rm -i --tty --image=curlimages/curl -- sh
# Inside: curl http://backend-svc:3000/health

# Verify services
kubectl get svc -n three-tier-app
kubectl get endpoints -n three-tier-app
```

### Common Issues

| Issue | Solution |
|-------|----------|
| **Pods stuck in Pending** | Check node resources: `kubectl top nodes` |
| **ImagePullBackOff** | Load image: `minikube image load <image>:<tag>` |
| **CrashLoopBackOff** | Check logs: `kubectl logs <pod> --previous` |
| **Connection refused** | Verify service: `kubectl get svc -n three-tier-app` |
| **Database not ready** | Check PVC: `kubectl get pvc -n three-tier-app` |

## Cleanup

### Stop Development Cluster
```bash
# Pause cluster (keeps state)
minikube pause

# Stop cluster
minikube stop

# Delete cluster
minikube delete
```

### Remove Application
```bash
# Delete namespace (cascading delete of all resources)
kubectl delete namespace three-tier-app

# Or delete individual resources
kubectl delete -f k8s-three-tier/
```

## Useful Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
# Kubernetes shortcuts
alias k='kubectl'
alias kgp='kubectl get pods'
alias kgpn='kubectl get pods -n three-tier-app'
alias kl='kubectl logs'
alias ke='kubectl exec -it'
alias kdp='kubectl describe pod'
alias krr='kubectl rollout restart'

# Minikube shortcuts
alias ms='minikube start --driver=docker --cpus=4 --memory=8192'
alias mst='minikube stop'
alias mss='minikube status'
alias ml='minikube logs'
```

## IDE Setup

### VS Code
**Extensions:**
- Kubernetes (ms-kubernetes-tools.vscode-kubernetes-tools)
- Docker (ms-azuretools.vscode-docker)
- YAML (redhat.vscode-yaml)

**Recommended Settings:**
```json
{
  "kubernetes.checkForMinikube": true,
  "kubernetes.minikubePath": "minikube",
  "yaml.schemas": {
    "kubernetes": "k8s-three-tier/**/*.yaml"
  }
}
```

### JetBrains IntelliJ / WebStorm
- Install Kubernetes plugin (JetBrains Marketplace)
- Configure kubeconfig path
- Enable YAML schema validation

## Useful Commands Reference

```bash
# Cluster management
minikube start
minikube stop
minikube delete
minikube status
minikube logs

# Deployment
kubectl apply -f <file>
kubectl delete -f <file>
kubectl get all -n three-tier-app
kubectl describe <resource> <name>

# Logs & Debugging
kubectl logs <pod>
kubectl logs <pod> --previous
kubectl exec -it <pod> -- /bin/sh
kubectl port-forward svc/<service> <local-port>:<remote-port>

# Updates & Rollouts
kubectl set image deployment/<name> <container>=<image>
kubectl rollout status deployment/<name>
kubectl rollout history deployment/<name>
kubectl rollout undo deployment/<name>

# Resources
kubectl get pvc
kubectl get configmap
kubectl get secrets
kubectl top pods
kubectl top nodes
```

## Next Steps

- Create integration tests
- Set up persistent development environment
- Configure IDE remote debugging
- Add pre-commit hooks for manifest validation
- Implement automated backup strategy

---

**Last Updated**: September 2026  
**Maintainer**: DevOps Engineering Team
