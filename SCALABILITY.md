# Scalability and capacity plan

- Paginate projects, clients, invoices, and activity feeds.
- Use database transactions and idempotency for invoice/payment state transitions.
- Move exports, reminders, and bulk operations to bounded background jobs.
- Avoid unbounded file uploads and validate MIME type, size, and ownership.
- Cache only public/reference data or safely versioned derived data.
- Add per-user rate limits to expensive report and search operations.
- Track p95/p99 latency, queue depth, worker duration, DB pool wait, and error rate.

## Release gates
- [ ] Concurrent invoice updates preserve financial invariants.
- [ ] Retries do not duplicate invoices or reminders.
- [ ] Large exports are streamed or asynchronous.
- [ ] Data isolation and access control are regression-tested.
- [ ] Load-test results support any replica increase.

No load-test result is claimed.
