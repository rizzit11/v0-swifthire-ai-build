import { AuthLayout } from "@/components/auth/auth-layout"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata = {
  title: "Create account",
  description: "Create your SwiftHire AI account.",
}

export default function SignUpPage() {
  return (
    <AuthLayout
      mode="sign-up"
      title="Create your account"
      subtitle="Choose your role — you can always switch later."
    >
      <SignUpForm />
    </AuthLayout>
  )
}
