import { RegulatorApplicationDetail } from '@/features/applications/regulator-application-detail';

export default function ReviewerApplicationPage({ params }: { params: { id: string } }) {
  return (
    <RegulatorApplicationDetail
      id={params.id}
      backHref="/reviewer/queue"
      backLabel="← All applications"
    />
  );
}
