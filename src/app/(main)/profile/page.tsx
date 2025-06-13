
import ProfileForm from '@/components/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Seu Perfil</h1>
        <p className="text-muted-foreground mt-2">Gerencie suas preferências e metas de jejum.</p>
      </header>
      <ProfileForm />
    </div>
  );
}
