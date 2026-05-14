'use client';

import { ApplicationStatus } from '@nbr/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CardContentSkeleton } from '@/components/ui/data-table-skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { ApplicationStepper } from '@/features/applications/application-stepper';
import { ApplicationTimeline } from '@/features/applications/application-timeline';
import {
  DocumentUploadQueue,
  type DocumentUploadItem,
} from '@/features/applications/document-upload-queue';
import { DocumentVersionGroups } from '@/features/applications/document-version-groups';
import { useApplicationDataBundle } from '@/features/applications/hooks/use-application-data';
import { inferRecommendRejectFromAudit } from '@/lib/workflow-actors';
import { formatDateTime } from '@/lib/format';
import { getApiErrorMessage } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { isTerminalStatus } from '@/lib/workflow-ui';
import { TrackedLink } from '@/providers/navigation-loading-provider';
import * as applicationsApi from '@/services/applications-api';
import { downloadDocumentFile, uploadDocument } from '@/services/documents-api';
import { useEffect, useMemo } from 'react';

const descSchema = z.object({
  description: z.string().min(10).max(20000),
});

type DescForm = z.infer<typeof descSchema>;

export function ApplicantApplicationDetail({ id }: { id: string }) {
  const qc = useQueryClient();

  const { appQ, docsQ, auditQ } = useApplicationDataBundle(id);

  const app = appQ.data;

  const recommendReject = useMemo(
    () => inferRecommendRejectFromAudit(auditQ.data ?? []),
    [auditQ.data],
  );

  const descForm = useForm<DescForm>({
    resolver: zodResolver(descSchema),
    defaultValues: { description: '' },
  });

  useEffect(() => {
    if (!appQ.data) return;
    descForm.reset({ description: appQ.data.description ?? '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when application id/version changes
  }, [appQ.data?.id, appQ.data?.version, descForm]);

  const patchMut = useMutation({
    mutationFn: (body: applicationsApi.UpdateApplicationBody) =>
      applicationsApi.updateApplication(id, body),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.application(id), data);
      toast.success('Saved');
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const submitMut = useMutation({
    mutationFn: () => applicationsApi.submitApplication(id, { expectedVersion: app!.version }),
    onSuccess: async (data) => {
      qc.setQueryData(queryKeys.application(id), data);
      await qc.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Submitted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const resubmitMut = useMutation({
    mutationFn: () => applicationsApi.resubmitApplication(id, { expectedVersion: app!.version }),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.application(id), data);
      toast.success('Resubmitted');
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  async function onUploadDocument(item: DocumentUploadItem, onProgress: (pct: number) => void) {
    if (!app) return;
    await uploadDocument({
      applicationId: id,
      file: item.file,
      type: item.type,
      logicalKey: item.logicalKey,
      expectedVersion: app.version,
      onProgress,
    });
  }

  async function onDocumentsUploaded() {
    await qc.invalidateQueries({ queryKey: queryKeys.application(id) });
    await qc.invalidateQueries({ queryKey: queryKeys.applicationDocuments(id) });
    await qc.invalidateQueries({ queryKey: queryKeys.auditApplication(id) });
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

  if (appQ.isPending) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <LoadingSpinner className="h-10 w-10 border-t-applicant" />
        <p className="text-sm text-muted-foreground">Loading application…</p>
      </div>
    );
  }
  if (appQ.isError || !app) {
    return (
      <p className="text-sm text-red-600">{appQ.isError ? getApiErrorMessage(appQ.error) : 'Not found'}</p>
    );
  }

  const canEditDraftFields = app.status === ApplicationStatus.DRAFT;
  const canEditDescriptionOnly = app.status === ApplicationStatus.INFO_REQUESTED;
  const canUpload =
    app.status === ApplicationStatus.DRAFT ||
    app.status === ApplicationStatus.INFO_REQUESTED ||
    app.status === ApplicationStatus.RESUBMITTED;
  const canSubmit = app.status === ApplicationStatus.DRAFT;
  const canResubmit = app.status === ApplicationStatus.INFO_REQUESTED;
  const terminal = isTerminalStatus(app.status);

  const latestNote = [...(auditQ.data ?? [])]
    .reverse()
    .find((e) => e.action === 'STATUS_CHANGED' && e.metadata && typeof e.metadata === 'object' && 'note' in e.metadata)
    ?.metadata as { note?: string } | undefined;

  return (
    <div>
      <TrackedLink href="/applicant/applications" className="text-sm font-medium text-applicant hover:underline">
        ← All applications
      </TrackedLink>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={app.institutionName} subtitle={app.licenseCategory} />
        <StatusBadge
          status={app.status as ApplicationStatus}
          reviewCompletedAsReject={recommendReject}
        />
      </div>

      <div className="mt-6">
        <ApplicationStepper accent="applicant" status={app.status as ApplicationStatus} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {canEditDraftFields || canEditDescriptionOnly ? (
                <form
                  className="space-y-3"
                  onSubmit={descForm.handleSubmit((v) =>
                    patchMut.mutate({
                      expectedVersion: app.version,
                      description: v.description,
                    }),
                  )}
                >
                  <Textarea {...descForm.register('description')} rows={6} />
                  {descForm.formState.errors.description ? (
                    <p className="text-sm text-red-600">{descForm.formState.errors.description.message}</p>
                  ) : null}
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={patchMut.isPending}
                    className="bg-applicant-muted text-applicant-dark hover:bg-applicant/20"
                  >
                    Save description
                  </Button>
                </form>
              ) : app.description ? (
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
            <CardContent className="space-y-4">
              {canUpload ? (
                <div className="border-b border-gray-100 pb-4">
                  <DocumentUploadQueue
                    id="app-doc"
                    onUpload={onUploadDocument}
                    onUploaded={onDocumentsUploaded}
                  />
                </div>
              ) : null}
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
                <ApplicationTimeline entries={auditQ.data ?? []} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canSubmit ? (
                <Button
                  type="button"
                  className="w-full bg-applicant hover:bg-applicant-dark"
                  disabled={submitMut.isPending}
                  onClick={() => submitMut.mutate()}
                >
                  <Send className="h-4 w-4" aria-hidden />
                  Submit application
                </Button>
              ) : null}
              {canResubmit ? (
                <Button
                  type="button"
                  className="w-full bg-applicant hover:bg-applicant-dark"
                  disabled={resubmitMut.isPending}
                  onClick={() => resubmitMut.mutate()}
                >
                  Resubmit
                </Button>
              ) : null}
              {terminal ? (
                <p className="text-sm text-gray-600">This application is finalized. No further changes are permitted.</p>
              ) : null}
              {!canSubmit && !canResubmit && !terminal ? (
                <p className="text-sm text-muted-foreground">
                  Nothing for you to do right now — your application is moving through the workflow.
                </p>
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
                <span className="font-medium text-gray-700">Created:</span> {formatDateTime(app.createdAt)}
              </p>
              <p>
                <span className="font-medium text-gray-700">Updated:</span> {formatDateTime(app.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
