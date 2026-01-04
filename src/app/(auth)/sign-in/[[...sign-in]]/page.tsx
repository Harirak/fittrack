import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'bg-card text-card-foreground shadow-xl border-border',
            headerTitle: 'text-foreground',
            headerSubtitle: 'text-muted-foreground',
            formFieldInput: 'bg-background border-input text-foreground',
            formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
            footerActionLink: 'text-primary hover:text-primary/90',
          },
        }}
        signUpUrl="/sign-up"
        redirectUrl="/dashboard"
      />
    </div>
  );
}
