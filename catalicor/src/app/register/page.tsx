// src/app/register/page.tsx
import RegisterStoreForm from '../components/RegisterStoreForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <RegisterStoreForm />
    </div>
  );
}