'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DocumentType } from '@nbr/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DOCUMENT_TYPE_OPTIONS } from '@/constants/document-types';
import { getApiErrorMessage } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { formatBytes } from '@/lib/format';
import * as applicationsApi from '@/services/applications-api';
import { assertFileSize, listDocuments, uploadDocument } from '@/services/documents-api';
import { FileUpload } from '@/features/applications/file-upload';
import { WizardVertical, type WizardStepDef } from '@/features/applications/wizard-vertical';
import { useAuth } from '@/hooks/use-auth';

const steps: WizardStepDef[] = [
  { title: 'Institution', description: 'Who you represent' },
  { title: 'Application details', description: "Describe what you're applying for" },
  { title: 'Supporting documents', description: 'Attach required files' },
  { title: 'Review & submit', description: 'Confirm and send' },
];

const step0Schema = z.object({
  institutionName: z.string().min(2, 'Minimum 2 characters').max(256),
  licenseCategory: z.string().min(2, 'Minimum 2 characters').max(128),
});

const step1Schema = z.object({
  description: z.string().min(10, 'At least 10 characters').max(20000),
});

type Step0 = z.infer<typeof step0Schema>;
type Step1 = z.infer<typeof step1Schema>;

export function NewApplicationWizard() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user: authUser } = useAuth();
  const [step, setStep] = useState(0);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [docType, setDocType] = useState<DocumentType>(DocumentType.BUSINESS_PLAN);
  const [logicalKey, setLogicalKey] = useState('BusinessPlan');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const appQuery = useQuery({
    queryKey: queryKeys.application(applicationId ?? ''),
    queryFn: () => applicationsApi.getApplication(applicationId!),
    enabled: !!applicationId,
  });

  const docsQuery = useQuery({
    queryKey: queryKeys.applicationDocuments(applicationId ?? ''),
    queryFn: () => listDocuments(applicationId!),
    enabled: !!applicationId,
  });

  const app = appQuery.data;

  const form0 = useForm<Step0>({ resolver: zodResolver(step0Schema) });
  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: { description: '' } });

  const createMut = useMutation({
    mutationFn: applicationsApi.createApplication,
    onSuccess: (data) => {
      setApplicationId(data.id);
      qc.setQueryData(queryKeys.application(data.id), data);
      form1.reset({ description: data.description ?? '' });
      toast.success('Draft created');
      setStep(1);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const patchMut = useMutation({
    mutationFn: (patch: applicationsApi.UpdateApplicationBody) =>
      applicationsApi.updateApplication(applicationId!, patch),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.application(data.id), data);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const submitMut = useMutation({
    mutationFn: () =>
      applicationsApi.submitApplication(applicationId!, { expectedVersion: app!.version }),
    onSuccess: async (data) => {
      qc.setQueryData(queryKeys.application(data.id), data);
      await qc.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application submitted');
      router.push('/applicant/applications');
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  async function onStep0(values: Step0) {
    createMut.mutate({
      institutionName: values.institutionName,
      licenseCategory: values.licenseCategory,
    });
  }

  async function onStep1(values: Step1) {
    if (!applicationId || !app) return;
    await patchMut.mutateAsync({
      expectedVersion: app.version,
      description: values.description,
    });
    toast.success('Saved');
    setStep(2);
  }

  async function onUpload(file: File) {
    if (!applicationId || !app) return;
    try {
      assertFileSize(file);
      setUploadProgress(0);
      await uploadDocument({
        applicationId,
        file,
        type: docType,
        logicalKey,
        expectedVersion: app.version,
        onProgress: setUploadProgress,
      });
      setUploadProgress(null);
      await qc.invalidateQueries({ queryKey: queryKeys.application(applicationId) });
      await qc.invalidateQueries({ queryKey: queryKeys.applicationDocuments(applicationId) });
      toast.success('File uploaded');
    } catch (e) {
      setUploadProgress(null);
      toast.error(getApiErrorMessage(e));
    }
  }

  const summary = useMemo(() => {
    if (!app) return null;
    return {
      institution: `${app.institutionName} — ${app.licenseCategory}`,
      description: form1.getValues('description') || app.description,
      docs: docsQuery.data ?? [],
    };
  }, [app, form1, docsQuery.data]);

  return (
    <div>
      <Link
        href="/applicant/applications"
        className="text-sm font-medium text-applicant hover:underline"
      >
        ← Back to applications
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">New licensing application</h1>
      <p className="mt-1 text-sm text-gray-600">
        Walk through each step. You can save as a draft at any time and continue later.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit p-4">
          <WizardVertical steps={steps} currentIndex={step} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{steps[step]?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 0 ? (
              <form className="space-y-4" onSubmit={form0.handleSubmit(onStep0)}>
                {authUser ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50/90 p-4 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Your portal account
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{authUser.fullName}</p>
                    <p className="text-xs text-gray-600">{authUser.email}</p>
                    <p className="mt-3 text-xs leading-relaxed text-gray-600">
                      Institution and licence details you enter below are stored on this application and shared
                      with regulators when you submit.
                    </p>
                  </div>
                ) : null}
                <div>
                  <Label htmlFor="institutionName">Institution name</Label>
                  <Input id="institutionName" className="mt-1" {...form0.register('institutionName')} />
                  {form0.formState.errors.institutionName ? (
                    <p className="mt-1 text-sm text-red-600">{form0.formState.errors.institutionName.message}</p>
                  ) : null}
                </div>
                <div>
                  <Label htmlFor="licenseCategory">License category</Label>
                  <Input id="licenseCategory" className="mt-1" {...form0.register('licenseCategory')} />
                  {form0.formState.errors.licenseCategory ? (
                    <p className="mt-1 text-sm text-red-600">{form0.formState.errors.licenseCategory.message}</p>
                  ) : null}
                </div>
                <div className="flex justify-between pt-4">
                  <span />
                  <Button type="submit" variant="applicant" disabled={createMut.isPending}>
                    Continue <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </form>
            ) : null}

            {step === 1 && app ? (
              <form
                key={app.id}
                className="space-y-4"
                onSubmit={form1.handleSubmit(onStep1)}
              >
                <div>
                  <Label htmlFor="description">What are you applying for?</Label>
                  <Textarea
                    id="description"
                    className="mt-1"
                    placeholder="Briefly describe the licence you're applying for, the scope of operations, and any context the reviewer should know."
                    defaultValue={app.description ?? ''}
                    {...form1.register('description')}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {(form1.watch('description') ?? '').length} / 10 characters minimum
                  </p>
                  {form1.formState.errors.description ? (
                    <p className="mt-1 text-sm text-red-600">{form1.formState.errors.description.message}</p>
                  ) : null}
                </div>
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Back
                  </Button>
                  <Button type="submit" variant="applicant" disabled={patchMut.isPending}>
                    Continue <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </form>
            ) : null}

            {step === 2 && app ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Attach the materials a reviewer will need. Max 5 MB per file.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div>
                    <Label htmlFor="docType">Document type</Label>
                    <select
                      id="docType"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as DocumentType)}
                    >
                      {DOCUMENT_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="logicalKey">Logical key / slot</Label>
                    <Input
                      id="logicalKey"
                      className="mt-1"
                      value={logicalKey}
                      onChange={(e) => setLogicalKey(e.target.value)}
                    />
                  </div>
                </div>
                <FileUpload id="wizard-upload" onFileSelected={(f) => void onUpload(f)} />
                {uploadProgress !== null ? (
                  <p className="text-sm text-gray-600">Uploading… {uploadProgress}%</p>
                ) : null}
                <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                  {(docsQuery.data ?? []).map((d) => (
                    <li key={d.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span>
                        {d.logicalKey}: {d.originalFileName} ({formatBytes(d.sizeBytes)})
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Back
                  </Button>
                  <Button type="button" variant="applicant" onClick={() => setStep(3)}>
                    Continue <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            ) : null}

            {step === 3 && app && summary ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Institution</p>
                  <p className="text-sm text-gray-900">{summary.institution}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Description</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{summary.description}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Documents</p>
                  <ul className="text-sm text-gray-900">
                    {summary.docs.length === 0 ? (
                      <li className="text-gray-500">No documents yet</li>
                    ) : (
                      summary.docs.map((d) => (
                        <li key={d.id}>
                          {d.logicalKey}: {d.originalFileName}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <p className="text-xs text-gray-500">
                  Submitting locks the application for review. You can still resubmit with new documents if a
                  reviewer asks for more information.
                </p>
                <div className="flex flex-wrap justify-between gap-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={patchMut.isPending}
                      onClick={() => toast.message('Draft is saved on the server.')}
                    >
                      Save as draft
                    </Button>
                    <Button
                      type="button"
                      variant="applicant"
                      disabled={submitMut.isPending}
                      onClick={() => submitMut.mutate()}
                    >
                      <Send className="h-4 w-4" aria-hidden />
                      Submit application
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
