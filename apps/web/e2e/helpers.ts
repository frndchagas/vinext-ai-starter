import { expect, type Page } from "@playwright/test";

const MAILPIT_URL = process.env.E2E_MAILPIT_URL ?? "http://localhost:18025";

interface MailpitMessageSummary {
  ID: string;
  To: Array<{ Address: string }>;
}

export async function findVerificationLink(email: string): Promise<string> {
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

export async function registerVerifiedUser(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Task User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/verify-email$/, { timeout: 20_000 });

  const verificationLink = await findVerificationLink(email);
  await page.goto(verificationLink);
  await expect(page).toHaveURL(/\/dashboard\?verified=1$/, { timeout: 20_000 });
}
