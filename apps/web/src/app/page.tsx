import { redirect } from 'next/navigation';

export default function RootPage() {
  // In mock mode, redirect straight to dashboard
  redirect('/meetings');
}
