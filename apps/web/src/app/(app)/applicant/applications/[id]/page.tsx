import { ApplicantApplicationDetail } from '@/features/applications/applicant-application-detail';

export default function ApplicantApplicationPage({ params }: { params: { id: string } }) {
  return <ApplicantApplicationDetail id={params.id} />;
}
