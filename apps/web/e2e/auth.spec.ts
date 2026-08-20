import { expect, test } from "@playwright/test";

import { findPasswordResetLink, findVerificationLink } from "./helpers";

test("register, verify email, use the private channel, sign out and sign in again", async ({
  page,
}) => {
  test.setTimeout(120_000);

  const uniqueEmail = `e2e-${Date.now()}@example.com`;
  const password = "e2e-secret-password";

  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E User");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/verify-email$/, { timeout: 20_000 });
  await expect(page.getByText(uniqueEmail)).toBeVisible();

  const verificationLink = await findVerificationLink(uniqueEmail);
  await page.goto(verificationLink);

  await expect(page).toHaveURL(/\/dashboard\?verified=1$/, { timeout: 20_000 });
  await expect(page.getByText("Email verified")).toBeVisible();
  await expect(page.getByText("member")).toBeVisible();
  await expect(page.getByText(/Subscribed to users\./)).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
  await expect(page.getByText(/Subscribed to users\./)).toBeVisible({ timeout: 15_000 });
});

test("rejects invalid credentials with a stable field error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password").fill("definitely-wrong");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("alert")).toContainText(/credentials/i);
  await expect(page).toHaveURL(/\/login$/);
});

test("reset a password through the link delivered by email", async ({ page }) => {
  test.setTimeout(120_000);

  const uniqueEmail = `e2e-reset-${Date.now()}@example.com`;
  const originalPassword = "original-e2e-password";
  const newPassword = "new-e2e-password";

  await page.goto("/register");
  await page.getByLabel("Name").fill("Password Reset User");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password", { exact: true }).fill(originalPassword);
  await page.getByLabel("Confirm password").fill(originalPassword);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/verify-email$/, { timeout: 20_000 });

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText(/reset link is on its way/i)).toBeVisible();

  const resetLink = await findPasswordResetLink(uniqueEmail);
  await page.goto(resetLink);
  await expect(page.getByLabel("Email")).toHaveValue(uniqueEmail);
  await page.getByLabel("New password", { exact: true }).fill(newPassword);
  await page.getByLabel("Confirm new password").fill(newPassword);
  await page.getByRole("button", { name: "Reset password" }).click();
  await expect(page).toHaveURL(/\/login$/, { timeout: 20_000 });

  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password").fill(newPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/verify-email$/, { timeout: 20_000 });
});
