# Scalability baseline

Scale this project according to actual workflows and measured load. Do not introduce distributed infrastructure without profiling evidence.

## Priorities
- Profile the busiest workflows before optimizing or adding replicas.
- Bound input sizes, concurrent requests/jobs, retry counts, database pools, and provider timeouts.
- Paginate large lists and tune database queries/indexes based on query plans.
- Keep API/service instances stateless where practical; externalize sessions, locks, queues, and caches before horizontal scaling.
- Use idempotency keys for retryable state-changing workflows such as payments, reservations, or job execution where applicable.
- Add health/readiness checks, request IDs, structured logs, metrics, graceful shutdown, and tested rollback procedures.
- Keep secrets in deployment configuration and avoid logging sensitive personal or business information.
- Add automated build, unit, integration, dependency/security, and deployment smoke tests appropriate to this project's stack.

## Load validation
Test normal, peak, burst, and dependency-failure scenarios. Record throughput, p95/p99 latency, error rates, CPU/memory, DB pool wait time, queue lag, and cost where relevant.

## Release gates
- [ ] Authorization and tenant/data isolation are covered by tests if applicable.
- [ ] Retries are bounded and state-changing operations are idempotent where required.
- [ ] Persistent data has tested backup/restore and migration/rollback procedures.
- [ ] Capacity assumptions and load-test evidence are documented.

This checklist is a plan, not evidence that load tests or production scaling are complete.