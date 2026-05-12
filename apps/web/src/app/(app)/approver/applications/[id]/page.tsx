import { RegulatorApplicationDetail } from '@/features/applications/regulator-application-detail';

export default function ApproverApplicationPage({ params }: { params: { id: string } }) {
  return (
    <RegulatorApplicationDetail
      id={params.id}
      backHref="/approver/queue"
      backLabel="← All applications"
    />
  );
}
