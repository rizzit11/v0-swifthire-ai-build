import { Suspense } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Sign in",
  description: "Sign in to your SwiftHire AI workspace.",
}

export default function LoginPage() {
  return (
    <AuthLayout
      mode="sign-in"
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard."
    >
      {/* Wrap the component using useSearchParams in a Suspense boundary */}
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}