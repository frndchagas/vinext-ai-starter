# ADR 0008: GitHub source with Packagist distribution

Status: accepted.
Implementation: pending.

The GitHub template remains the canonical source. After the production path is verified, each stable tag will generate a small distribution repository published on Packagist as `frndchagas/vinext-ai-starter`. It will expose the starter through `laravel new --using` and qualify for submission to the community starter directory. The generated distribution must map to one source tag and will not add an updater to applications created from the starter.
