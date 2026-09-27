# k8s-three-tier-app

Kubernetes-based three-tier architecture deployment.

## Architecture Stack

| Tier | Component | Purpose |
|------|-----------|---------|
| **Presentation** | Frontend Service | User interface layer |
| **Application** | API Gateway / Microservices | Business logic processing |
| **Data** | Database Layer | Persistent storage |

## Quick Start

```bash
kubectl apply -f k8s/
```

## Infrastructure

- **AI Gateway**: `http://localhost:8787/v1`
- **Token Optimizations**: OmniRoute, Headroom, Graphify