"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey, useLogin } from "@vinext-ai-starter/api-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { formValue } from "@/lib/form";
import { validationErrors } from "@/lib/problem";
import { useHydrated } from "@/lib/use-hydrated";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydrated = useHydrated();
  const loginMutation = useLogin();

  const errors =
    loginMutation.data?.status === 422 ? validationErrors(loginMutation.data.data) : {};

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    loginMutation.mutate(
      {
        data: {
          email: formValue(form, "email"),
          password: formValue(form, "password"),
        },
      },
      {
        onSuccess: (response) => {
          if (response.status === 200) {
            queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
            router.push("/dashboard");
          }
        },
      },
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <h1 className="font-[family-name:var(--font-app-display)] text-xl text-foreground">
        Sign in
      </h1>
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        errors={errors["email"]}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        errors={errors["password"]}
      />
      <Button type="submit" size="lg" disabled={!hydrated || loginMutation.isPending}>
        {loginMutation.isPending ? "Signing in…" : "Sign in"}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
        <Link href="/register" className="text-primary hover:underline">
          Create account
        </Link>
      </div>
    </form>
  );
}
