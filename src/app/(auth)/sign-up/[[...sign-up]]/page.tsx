import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 via-violet-600 to-pink-500 p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'bg-card text-card-foreground shadow-xl border-border',
          },
        }}
        signInUrl="/sign-in"
        redirectUrl="/dashboard"
      />
    </div>
  );
}
