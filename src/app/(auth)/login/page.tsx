
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <AuthForm mode="login" />
    </div>
  );
}
