"use client";

import { useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password123";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/deploy-log";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Separate named refs (rather than an array/lookup) so every ref read and
  // write below is a direct identifier, not a computed access — the React
  // Compiler's lint rules are strict about tracing ref usage through any
  // indirection, factory functions included.
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);

  // Each blob's "rest" position — permanent until you drag it somewhere
  // else. Ambient parallax is added on top of this, not a replacement for
  // it, so a dragged blob keeps drifting a little around wherever you drop
  // it instead of snapping back.
  const base1 = useRef({ x: 0, y: 0 });
  const base2 = useRef({ x: 0, y: 0 });
  const base3 = useRef({ x: 0, y: 0 });

  const draggingId = useRef<0 | 1 | 2 | 3>(0);
  const dragStartClient = useRef({ x: 0, y: 0 });
  const dragStartBase = useRef({ x: 0, y: 0 });

  function handlePanelPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    // Different strength/sign per blob so the three colors drift at
    // slightly different speeds and directions instead of moving as one
    // flat unit.
    if (draggingId.current !== 1 && blob1Ref.current) {
      blob1Ref.current.style.transform = `translate(${base1.current.x + nx * 70}px, ${base1.current.y + ny * 70}px)`;
    }
    if (draggingId.current !== 2 && blob2Ref.current) {
      blob2Ref.current.style.transform = `translate(${base2.current.x + nx * -50}px, ${base2.current.y + ny * -50}px)`;
    }
    if (draggingId.current !== 3 && blob3Ref.current) {
      blob3Ref.current.style.transform = `translate(${base3.current.x + nx * 40}px, ${base3.current.y + ny * 40}px)`;
    }
  }

  function handlePanelPointerLeave() {
    if (draggingId.current !== 1 && blob1Ref.current) {
      blob1Ref.current.style.transform = `translate(${base1.current.x}px, ${base1.current.y}px)`;
    }
    if (draggingId.current !== 2 && blob2Ref.current) {
      blob2Ref.current.style.transform = `translate(${base2.current.x}px, ${base2.current.y}px)`;
    }
    if (draggingId.current !== 3 && blob3Ref.current) {
      blob3Ref.current.style.transform = `translate(${base3.current.x}px, ${base3.current.y}px)`;
    }
  }

  function handleBlob1PointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingId.current = 1;
    dragStartClient.current = { x: e.clientX, y: e.clientY };
    dragStartBase.current = { ...base1.current };
    e.currentTarget.style.transitionDuration = "0ms";
  }
  function handleBlob1PointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (draggingId.current !== 1) return;
    const x = dragStartBase.current.x + (e.clientX - dragStartClient.current.x);
    const y = dragStartBase.current.y + (e.clientY - dragStartClient.current.y);
    base1.current = { x, y };
    e.currentTarget.style.transform = `translate(${x}px, ${y}px)`;
  }
  function handleBlob1PointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (draggingId.current !== 1) return;
    draggingId.current = 0;
    e.currentTarget.releasePointerCapture(e.pointerId);
    e.currentTarget.style.transitionDuration = "";
  }

  function handleBlob2PointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingId.current = 2;
    dragStartClient.current = { x: e.clientX, y: e.clientY };
    dragStartBase.current = { ...base2.current };
    e.currentTarget.style.transitionDuration = "0ms";
  }
  function handleBlob2PointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (draggingId.current !== 2) return;
    const x = dragStartBase.current.x + (e.clientX - dragStartClient.current.x);
    const y = dragStartBase.current.y + (e.clientY - dragStartClient.current.y);
    base2.current = { x, y };
    e.currentTarget.style.transform = `translate(${x}px, ${y}px)`;
  }
  function handleBlob2PointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (draggingId.current !== 2) return;
    draggingId.current = 0;
    e.currentTarget.releasePointerCapture(e.pointerId);
    e.currentTarget.style.transitionDuration = "";
  }

  function handleBlob3PointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingId.current = 3;
    dragStartClient.current = { x: e.clientX, y: e.clientY };
    dragStartBase.current = { ...base3.current };
    e.currentTarget.style.transitionDuration = "0ms";
  }
  function handleBlob3PointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (draggingId.current !== 3) return;
    const x = dragStartBase.current.x + (e.clientX - dragStartClient.current.x);
    const y = dragStartBase.current.y + (e.clientY - dragStartClient.current.y);
    base3.current = { x, y };
    e.currentTarget.style.transform = `translate(${x}px, ${y}px)`;
  }
  function handleBlob3PointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (draggingId.current !== 3) return;
    draggingId.current = 0;
    e.currentTarget.releasePointerCapture(e.pointerId);
    e.currentTarget.style.transitionDuration = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Branded visual panel — built from the app's own timeline/severity
          colors rather than a stock photo, so it doesn't depend on an
          external image URL or license. Blobs drift toward the cursor and
          can be dragged around; mix-blend-mode blends the colors where they
          overlap, like mixing paint. */}
      <div
        onPointerMove={handlePanelPointerMove}
        onPointerLeave={handlePanelPointerLeave}
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-zinc-50 md:flex"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            ref={blob1Ref}
            onPointerDown={handleBlob1PointerDown}
            onPointerMove={handleBlob1PointerMove}
            onPointerUp={handleBlob1PointerUp}
            onPointerCancel={handleBlob1PointerUp}
            className="pointer-events-auto absolute -top-20 -left-20 size-96 cursor-grab touch-none rounded-full bg-red-500/40 mix-blend-screen blur-3xl transition-transform duration-300 ease-out active:cursor-grabbing"
          />
          <div
            ref={blob2Ref}
            onPointerDown={handleBlob2PointerDown}
            onPointerMove={handleBlob2PointerMove}
            onPointerUp={handleBlob2PointerUp}
            onPointerCancel={handleBlob2PointerUp}
            className="pointer-events-auto absolute top-16 -right-8 size-96 cursor-grab touch-none rounded-full bg-amber-500/40 mix-blend-screen blur-3xl transition-transform duration-300 ease-out active:cursor-grabbing"
          />
          <div
            ref={blob3Ref}
            onPointerDown={handleBlob3PointerDown}
            onPointerMove={handleBlob3PointerMove}
            onPointerUp={handleBlob3PointerUp}
            onPointerCancel={handleBlob3PointerUp}
            className="pointer-events-auto absolute -bottom-16 left-1/4 size-96 cursor-grab touch-none rounded-full bg-emerald-500/40 mix-blend-screen blur-3xl transition-transform duration-300 ease-out active:cursor-grabbing"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <div className="relative flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-white/10">
            <Rocket className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold">
            Internal Portal
          </span>
        </div>

        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
            <span className="ml-1 text-[11px] text-zinc-500 italic">
              (psst - you can drag these around ↖)
            </span>
          </div>
          <h2 className="font-heading text-3xl leading-tight font-semibold">
            Every deploy,
            <br />
            one shared record.
          </h2>
          <p className="max-w-sm text-sm text-zinc-400">
            Log releases, track severity, and keep the whole team on the
            same page, no more digging through Slack for what shipped.
          </p>
        </div>

        <p className="relative text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Internal Portal
        </p>
      </div>

      <div className="flex w-full items-center justify-center p-6 md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-semibold">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to access the internal portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0" />
              <p>
                This is a trial product — visitors can sign in with{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono">
                  {DEMO_EMAIL}
                </code>{" "}
                /{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono">
                  {DEMO_PASSWORD}
                </code>
                .{" "}
                <button
                  type="button"
                  onClick={() => {
                    setEmail(DEMO_EMAIL);
                    setPassword(DEMO_PASSWORD);
                  }}
                  disabled={isSubmitting}
                  className="font-medium text-foreground underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50"
                >
                  Fill it in for me
                </button>
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
