'use client';

import { useQuery } from '@tanstack/react-query';
import { Role } from '@nbr/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { RoleBadge } from '@/components/ui/role-badge';
import { homePathForRole } from '@/constants/routes';
import { formatDateTime } from '@/lib/format';
import { queryKeys } from '@/lib/query-keys';
import { useNavigationLoading } from '@/providers/navigation-loading-provider';
import { fetchMe, type CurrentUserProfileDto } from '@/services/auth-api';
import { useAuth } from '@/hooks/use-auth';

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{value || 'Not available'}</p>
    </div>
  );
}

export function UserSettings() {
  const router = useRouter();
  const { user } = useAuth();
  const { startNavigation } = useNavigationLoading();
  const [isBackNavigating, setIsBackNavigating] = useState(false);
  const profileQuery = useQuery<CurrentUserProfileDto>({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
    initialData: user ? { ...user } : undefined,
  });

  const profile: CurrentUserProfileDto | null = profileQuery.data ?? (user ? { ...user } : null);
  const showApplicantInstitutionDetails = profile?.role === Role.APPLICANT;

  function goBack() {
    if (document.referrer) {
      try {
        const referrer = new URL(document.referrer);
        const current = new URL(window.location.href);
        if (referrer.origin === current.origin && referrer.pathname !== current.pathname) {
          setIsBackNavigating(true);
          startNavigation(`${referrer.pathname}${referrer.search}${referrer.hash}`);
          router.back();
          return;
        }
      } catch {
        // Fall back to the role home page below.
      }
    }
    const fallback = user ? homePathForRole(user.role) : '/login';
    setIsBackNavigating(true);
    startNavigation(fallback);
    router.replace(fallback);
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="View the details connected to your portal account."
        actions={
          <Button type="button" variant="outline" disabled={isBackNavigating} onClick={goBack}>
            {isBackNavigating ? 'Loading...' : 'Back'}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>User details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile ? (
            <>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                  {profile.fullName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join('') || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-foreground">{profile.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <RoleBadge role={profile.role} />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <DetailRow label="Full name" value={profile.fullName} />
                <DetailRow label="Email" value={profile.email} />
                {showApplicantInstitutionDetails ? (
                  <>
                    <DetailRow label="Institution / bank name" value={profile.institutionName ?? undefined} />
                    <DetailRow label="Institution category" value={profile.institutionCategory ?? undefined} />
                  </>
                ) : null}
                <DetailRow label="Role" value={profile.role} />
                <DetailRow label="User ID" value={profile.id} />
                <DetailRow
                  label="Created"
                  value={profile.createdAt ? formatDateTime(profile.createdAt) : undefined}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">User details are not available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
