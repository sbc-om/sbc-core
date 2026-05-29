import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary font-bold text-lg text-primary-foreground">
            S
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">SBC ERP</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue.</p>
        </div>

        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
