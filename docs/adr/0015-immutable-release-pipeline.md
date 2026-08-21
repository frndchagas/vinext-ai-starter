# ADR 0015: immutable release pipeline

Status: accepted.
Implementation: pending.

A stable release may publish only from a CI-green commit on `main`. Source and distribution tags are protected, GitHub Releases are immutable, the publisher is idempotent after partial failure, and the generated distribution accepts writes only from that publisher. Public image signing, SBOM and provenance remain deferred until the project distributes container images rather than source snapshots.

The workflow now verifies one complete `main` push run for the exact tagged SHA, uses a global distribution environment and publishes the distribution branch and annotated tag atomically. Tag rules, immutable releases, environment protection and distribution-repository rules remain pending repository controls.
