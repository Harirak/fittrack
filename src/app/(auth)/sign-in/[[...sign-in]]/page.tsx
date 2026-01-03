import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 via-violet-600 to-pink-500 p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'bg-card text-card-foreground shadow-xl border-border',
          },
        }}
        signUpUrl="/sign-up"
        redirectUrl="/dashboard"
      />
    </div>
  );
}
