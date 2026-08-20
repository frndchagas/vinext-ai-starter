# Extensions and recipes

## What a recipe is

A recipe is an optional, repeatable change that adds a capability to the starter, such as 2FA, passkeys, social login, teams, or billing. It may include dependencies, migrations, environment variables, routes, components, and tests.

A page explaining how to make these changes manually is not an installable recipe. In version 0.1, we will call that material an extension guide.

## Version 0.1 policy

The starter will not have a recipe installer. Future extensions may have versioned guides, but they will not promise one-command installation. This avoids fragile scripts that overwrite code in an already customized application.

Shadcn will keep using its own registry for interface components. That mechanism will not be used to pretend that PHP changes, migrations, and infrastructure are UI components.

## Possible future installer

Once at least two repeated and tested extensions exist, we may create a separate installer. The minimum format must have:

- a manifest with compatible versions and dependencies;
- `--dry-run` and a diff before writing;
- conflict checking, without silently overwriting files;
- explicit steps for Composer, Bun, migrations, and environment variables;
- tests and a removal command when the rollback is safe.

Until then, there will be no `create-*` CLI, cross-stack registry, or recipe catalog in the core.
