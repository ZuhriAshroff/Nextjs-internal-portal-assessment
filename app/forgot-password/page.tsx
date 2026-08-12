import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
          <Mail className="size-4 text-muted-foreground" />
        </span>

        <h1 className="mt-4 font-heading text-xl font-semibold">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is an internal tool without self-serve password resets.
          Accounts are provisioned and managed by your workspace admin —
          reach out to them and they can reset it for you.
        </p>

        <Button
          className="mt-6 w-full"
          nativeButton={false}
          render={<Link href="/login" />}
        >
          Back to sign in
        </Button>
      </div>
    </div>
  );
}
