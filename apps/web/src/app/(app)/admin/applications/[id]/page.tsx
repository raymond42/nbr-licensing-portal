import { RegulatorApplicationDetail } from '@/features/applications/regulator-application-detail';

export default function AdminApplicationPage({ params }: { params: { id: string } }) {
  return (
    <RegulatorApplicationDetail
      id={params.id}
      backHref="/admin/applications"
      backLabel="← All applications"
    />
  );
}
