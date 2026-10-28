import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirect to portal login by default
  redirect('/portal/login');
}

