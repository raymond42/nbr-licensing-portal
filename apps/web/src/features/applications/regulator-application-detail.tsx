'use client';

import { ApplicationStatus, Role } from '@nbr/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

import { CardContentSkeleton } from '@/components/ui/data-table-skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { ApplicationStepper } from '@/features/applications/application-stepper';
import { ApplicationTimeline } from '@/features/applications/application-timeline';
import { DocumentVersionGroups } from '@/features/applications/document-version-groups';
import { useApplicationDataBundle } from '@/features/applications/hooks/use-application-data';
import { formatDateTime } from '@/lib/format';
import { getApiErrorMessage } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import {
  findApproverActor,
  findRecommenderActor,
  findReviewerActor,
  inferRecommendRejectFromAudit,
} from '@/lib/workflow-actors';
import { isTerminalStatus } from '@/lib/workflow-ui';
import * as applicationsApi from '@/services/applications-api';
import { downloadDocumentFile } from '@/services/documents-api';
import { useAuth } from '@/hooks/use-auth';

type NoteAction =
  | 'requestInfo'
  | 'recommendApprove'
  | 'recommendReject'
  | 'approve'
  | 'reject'
  | null;

export function RegulatorApplicationDetail({
  id,
  backHref,
  backLabel,
}: {
  id: string;
  backHref: string;
  backLabel: string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteAction, setNoteAction] = useState<NoteAction>(null);
  const [noteText, setNoteText] = useState('');

  const { appQ, docsQ, auditQ } = useApplicationDataBundle(id);

  const app = appQ.data;

  const auditRows = useMemo(() => auditQ.data ?? [], [auditQ.data]);

  const recommendReject = useMemo(
    () => inferRecommendRejectFromAudit(auditRows),
    [auditRows],
  );

  const workflowActors = useMemo(() => {
    return {
      reviewer: findReviewerActor(auditRows),
      recommender: findRecommenderActor(auditRows, app?.reviewCompletedByUserId ?? null),
      approver: findApproverActor(auditRows),
    };
  }, [auditRows, app?.reviewCompletedByUserId]);

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: queryKeys.application(id) });
    await qc.invalidateQueries({ queryKey: queryKeys.applicationDocuments(id) });
    await qc.invalidateQueries({ queryKey: queryKeys.auditApplication(id) });
    await qc.invalidateQueries({ queryKey: ['applications'] });
  };

  async function claimReview() {
    if (!app) return;
    try {
      await applicationsApi.startReview(id, { expectedVersion: app.version });
      await invalidate();
      toast.success('Claimed');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  async function continueReviewFlow() {
    if (!app) return;
    try {
      await applicationsApi.continueReview(id, { expectedVersion: app.version });
      await invalidate();
      toast.success('Review continued');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  async function onDownload(documentId: string) {
    try {
      const { blob, fileName } = await downloadDocumentFile(id, documentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  function openNote(action: Exclude<NoteAction, null>) {
    setNoteAction(action);
    setNoteText('');
    setNoteOpen(true);
  }

  async function submitNote() {
    if (!app || !noteAction) return;
    const body = { expectedVersion: app.version, note: noteText || undefined };
    try {
      switch (noteAction) {
        case 'requestInfo':
          await applicationsApi.requestInfo(id, body);
          break;
        case 'recommendApprove':
        case 'recommendReject':
          await applicationsApi.completeReview(id, body);
          break;
        case 'approve':
          await applicationsApi.approveApplication(id, body);
          break;
        case 'reject':
          await applicationsApi.rejectApplication(id, body);
          break;
        default:
          break;
      }
      await invalidate();
      toast.success('Updated');
      setNoteOpen(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  const role = user?.role as Role | undefined;
  const isReviewer = role === Role.REVIEWER;
  const isApprover = role === Role.APPROVER;
  const isAdmin = role === Role.ADMIN;

  if (appQ.isPending) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <LoadingSpinner className="h-10 w-10" />
        <p className="text-sm text-muted-foreground">Loading application…</p>
      </div>
    );
  }
  if (appQ.isError || !app) {
    return (
      <p className="text-sm text-red-600">{appQ.isError ? getApiErrorMessage(appQ.error) : 'Not found'}</p>
    );
  }

  const terminal = isTerminalStatus(app.status as ApplicationStatus);

  const latestNote = [...auditRows]
    .reverse()
    .find(
      (e) =>
        e.action === 'STATUS_CHANGED' &&
        e.metadata &&
        typeof e.metadata === 'object' &&
        'note' in e.metadata,
    )?.metadata as { note?: string } | undefined;

  const dialogCopy =
    noteAction === 'requestInfo'
      ? {
          title: 'Request more information',
          description:
            'The applicant will be notified. Add clear instructions — this note is stored permanently on the audit trail.',
          confirm: 'Send request',
        }
      : noteAction === 'recommendApprove'
        ? {
            title: 'Recommend approval',
            description:
              'Your note is visible to the approver and becomes part of the permanent audit record.',
            confirm: 'Submit recommendation',
          }
        : noteAction === 'recommendReject'
          ? {
              title: 'Recommend rejection',
              description:
                'Your note is visible to the approver and becomes part of the permanent audit record.',
              confirm: 'Submit recommendation',
            }
          : noteAction === 'approve'
            ? {
                title: 'Approve application',
                description: 'Optional note is stored on the audit trail.',
                confirm: 'Confirm approval',
              }
            : noteAction === 'reject'
              ? {
                  title: 'Reject application',
                  description: 'Optional note is stored on the audit trail.',
                  confirm: 'Confirm rejection',
                }
              : {
                  title: '',
                  description: '',
                  confirm: 'Confirm',
                };

  return (
    <div>
      <Link href={backHref} className="text-sm font-medium text-brand hover:underline">
        {backLabel}
      </Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={app.institutionName} subtitle={app.licenseCategory} />
        <StatusBadge
          status={app.status as ApplicationStatus}
          reviewCompletedAsReject={recommendReject}
        />
      </div>

      <div className="mt-6">
        <ApplicationStepper status={app.status as ApplicationStatus} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {app.description ? (
                <p className="whitespace-pre-wrap text-sm text-foreground">{app.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No description provided.</p>
              )}
              {latestNote?.note ? (
                <div className="mt-4 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                  <p className="text-xs font-semibold uppercase text-gray-500">Latest decision note</p>
                  <p className="mt-1">{latestNote.note}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {docsQ.isPending ? (
                <CardContentSkeleton lines={3} />
              ) : (
                <DocumentVersionGroups
                  documents={docsQ.data ?? []}
                  onDownload={(documentId) => void onDownload(documentId)}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity history</CardTitle>
            </CardHeader>
            <CardContent>
              {auditQ.isPending ? (
                <CardContentSkeleton lines={3} />
              ) : (
                <ApplicationTimeline entries={auditRows} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {terminal ? (
                <p className="text-sm text-gray-600">
                  This application is in a terminal state. No further changes are permitted.
                </p>
              ) : isAdmin ? (
                <p className="text-sm text-gray-600">Administrator view — workflow actions use reviewer/approver roles.</p>
              ) : isReviewer ? (
                <>
                  {app.status === ApplicationStatus.SUBMITTED ? (
                    <Button type="button" className="w-full" onClick={() => void claimReview()}>
                      Claim for review
                    </Button>
                  ) : null}
                  {app.status === ApplicationStatus.RESUBMITTED ? (
                    <Button type="button" className="w-full" onClick={() => void continueReviewFlow()}>
                      Continue review
                    </Button>
                  ) : null}
                  {app.status === ApplicationStatus.UNDER_REVIEW ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => openNote('requestInfo')}
                      >
                        Request more info
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-brand text-brand hover:bg-brand/5"
                        onClick={() => openNote('recommendReject')}
                      >
                        Recommend reject
                      </Button>
                      <Button type="button" className="w-full" onClick={() => openNote('recommendApprove')}>
                        Recommend approve
                      </Button>
                    </>
                  ) : null}
                </>
              ) : null}
              {isApprover && app.status === ApplicationStatus.REVIEW_COMPLETED ? (
                <>
                  <Button type="button" className="w-full" onClick={() => openNote('approve')}>
                    Final approve
                  </Button>
                  <Button type="button" variant="destructive" className="w-full" onClick={() => openNote('reject')}>
                    Final reject
                  </Button>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-gray-600">
              <p>
                <span className="font-medium text-gray-700">ID:</span> {app.id}
              </p>
              <p>
                <span className="font-medium text-gray-700">Version:</span> {app.version}
              </p>
              <p>
                <span className="font-medium text-gray-700">Reviewer:</span>{' '}
                {workflowActors.reviewer?.label ?? '—'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Recommender:</span>{' '}
                {workflowActors.recommender?.label ?? '—'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Approver:</span>{' '}
                {workflowActors.approver?.label ?? '—'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Created:</span> {formatDateTime(app.createdAt)}
              </p>
              <p>
                <span className="font-medium text-gray-700">Updated:</span> {formatDateTime(app.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent title={dialogCopy.title} description={dialogCopy.description}>
          <div className="space-y-3">
            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                className="mt-1 min-h-[140px]"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Reason / instructions…"
              />
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={() => void submitNote()}>
                {dialogCopy.confirm}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
