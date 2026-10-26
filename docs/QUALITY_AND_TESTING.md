# Development and QA Guide

FreelanceSuite is a workspace for freelancer-oriented software workflows. The current source and manifests define which modules are implemented; client management, proposals, invoicing, and project tracking should be treated as planned unless verified in code.

## Setup

```bash
git clone https://github.com/kandisaikishore/FreelanceSuite.git
cd FreelanceSuite
```

Inspect the project's manifests and configuration to determine the actual runtime, package manager, services, and supported scripts. Configure credentials locally and never commit secrets or real client data.

## Functional validation

For each implemented module, test valid inputs, missing required values, malformed input, boundary values, repeated submissions, and recoverable failures. Verify that failed saves do not leave the UI showing data as persisted.

If client or project records exist, verify that access controls prevent unauthorized users from viewing or modifying records. Test empty, loading, and error states in addition to the successful workflow.

## Money and dates

If invoices or billing are implemented:
- Use decimal-safe arithmetic for money.
- Document currency precision and rounding rules.
- Validate quantity, rate, tax, discount, and total boundaries.
- Test repeated invoice submission and duplicate-payment handling where applicable.
- Keep invoice dates stable across parsing, display, and export; document the relevant time-zone semantics.

Do not assume these billing features exist unless confirmed in source.

## Data handling

Keep customer names, contact details, contracts, and invoices out of logs by default. Document the persistence layer and backup/deletion behavior based on actual implementation. Use synthetic data in tests.

## Pull-request checklist

- [ ] Describe the implemented workflow affected.
- [ ] Add a regression test for the defect or behavior.
- [ ] Run the project's declared test/build commands.
- [ ] Report unavailable checks and required external services.
- [ ] Avoid claiming planned features or production readiness without verification.
