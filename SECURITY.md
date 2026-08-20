# Security policy

## Reporting a vulnerability

Please do not open public issues for security problems. Use GitHub private
vulnerability reporting on this repository (Security → Report a vulnerability).
You will get an acknowledgement within a week.

## Scope

The starter ships with sessions via Laravel Fortify and Sanctum, role storage
via Spatie Laravel Permission, private Reverb channels, and idempotent job
processing. Reports about weaknesses in these flows, in the same-origin proxy
configuration, or in the generated client are all in scope. Vulnerabilities in
upstream dependencies should go to the upstream projects.
