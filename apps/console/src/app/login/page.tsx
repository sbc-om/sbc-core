import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">S</div>
          <h1 className="text-2xl font-bold tracking-tight">SBC Core</h1>
          <p className="mt-1 text-sm text-muted-foreground">Business Operating System</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-8 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">Sign in</h2>
          <p className="mb-6 text-sm text-muted-foreground">Enter your credentials to continue.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
