import { getReportsAction } from '../actions';
import { getStats } from '@/lib/data';
import DashboardClient from './client';

export default async function DashboardPage() {
  const initialReports = await getReportsAction();
  const initialStats = getStats(initialReports);

  return <DashboardClient initialReports={initialReports} initialStats={initialStats} />;
}
