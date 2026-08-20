import { expect, test } from "@playwright/test";

const MAILPIT_URL = process.env.E2E_MAILPIT_URL ?? "http://localhost:18025";

interface MailpitMessageSummary {
  ID: string;
  To: Array<{ Address: string }>;
}

async function findVerificationLink(email: string): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const listResponse = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=20`);
    const list = (await listResponse.json()) as { messages: MailpitMessageSummary[] };
    const message = list.messages.find((candidate) =>
      candidate.To.some((recipient) => recipient.Address === email),
    );

    if (message) {
      const messageResponse = await fetch(`${MAILPIT_URL}/api/v1/message/${message.ID}`);
      const body = (await messageResponse.json()) as { Text: string };
      const match = body.Text.match(/https?:\/\/\S+\/api\/v1\/auth\/email\/verify\/\S+/);

      if (match) {
        return match[0].replace(/[)\].,]+$/, "");
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`No verification email arrived for ${email}`);
}

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
