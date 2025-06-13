
import AuthForm from '@/components/AuthForm';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <AuthForm mode="signup" />
    </div>
  );
}
