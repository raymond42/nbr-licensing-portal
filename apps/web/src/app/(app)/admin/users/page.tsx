'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Role } from '@nbr/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { type Column, DataTable } from '@/components/ui/data-table';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton';
import { IconTableAction } from '@/components/ui/icon-table-action';
import { ListPagination } from '@/components/ui/list-pagination';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { ErrorState } from '@/components/states/error-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { RoleBadge } from '@/components/ui/role-badge';
import { USER_LIST_PAGE_SIZE } from '@/constants/pagination';
import { formatDateTime } from '@/lib/format';
import { getApiErrorMessage } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { UserDto } from '@nbr/shared';
import * as usersApi from '@/services/users-api';

const createSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(256),
  role: z.nativeEnum(Role),
  password: z.string().min(12).max(256),
});

type CreateForm = z.infer<typeof createSchema>;

const roleOptions = [
  Role.APPLICANT,
  Role.REVIEWER,
  Role.APPROVER,
  Role.ADMIN,
] as const;

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const take = USER_LIST_PAGE_SIZE;
  const [createOpen, setCreateOpen] = useState(false);
  const [disableTarget, setDisableTarget] = useState<UserDto | null>(null);

  const q = useQuery({
    queryKey: queryKeys.users(page, take),
    queryFn: () => usersApi.listUsers({ page, take }),
  });

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      email: '',
      fullName: '',
      role: Role.APPLICANT,
      password: '',
    },
  });

  const createMut = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created');
      setCreateOpen(false);
      createForm.reset({
        email: '',
        fullName: '',
        role: Role.APPLICANT,
        password: '',
      });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const disableMut = useMutation({
    mutationFn: (id: string) => usersApi.updateUser(id, { isActive: false }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User disabled');
      setDisableTarget(null);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const enableMut = useMutation({
    mutationFn: (id: string) => usersApi.updateUser(id, { isActive: true }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User reactivated');
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (q.isError) {
    return <ErrorState message={getApiErrorMessage(q.error)} onRetry={() => void q.refetch()} />;
  }

  const rows = q.data?.items ?? [];
  const total = q.data?.total ?? 0;

  const columns: Column<UserDto>[] = [
    {
      key: 'email',
      header: 'Email',
      cell: (r) => <span className="text-foreground">{r.email}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      cell: (r) => <span className="font-medium text-foreground">{r.fullName}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      cell: (r) => <RoleBadge role={r.role as Role} />,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => (
        <span
          className={
            r.isActive ? 'font-medium text-emerald-400' : 'text-muted-foreground'
          }
        >
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      cell: (r) => <span className="text-muted-foreground">{formatDateTime(r.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Account actions</span>,
      className: 'w-14 text-center',
      cell: (r) =>
        r.isActive ? (
          <IconTableAction
            label="Disable user"
            icon={UserX}
            onClick={() => setDisableTarget(r)}
            className="hover:text-destructive"
          />
        ) : (
          <IconTableAction
            label="Enable user"
            icon={UserCheck}
            disabled={enableMut.isPending}
            onClick={() => void enableMut.mutate(r.id)}
            className="hover:text-emerald-400"
          />
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Provision and manage portal accounts for applicants and regulator staff."
        actions={
          <Button type="button" variant="primary" onClick={() => setCreateOpen(true)}>
            + New user
          </Button>
        }
      />
      {q.isPending ? (
        <DataTableSkeleton rows={8} columns={6} />
      ) : (
        <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} />
      )}
      {!q.isPending ? (
        <ListPagination className="mt-4" page={page} take={take} total={total} onPageChange={setPage} />
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          title="New user"
          description="Creates an active account with the given role. Share the password securely with the recipient."
        >
          <form
            className="space-y-3"
            onSubmit={createForm.handleSubmit((values) => createMut.mutate(values))}
          >
            <div>
              <Label htmlFor="cu-email">Email</Label>
              <Input id="cu-email" className="mt-1" type="email" {...createForm.register('email')} />
              {createForm.formState.errors.email ? (
                <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="cu-name">Full name</Label>
              <Input id="cu-name" className="mt-1" {...createForm.register('fullName')} />
              {createForm.formState.errors.fullName ? (
                <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.fullName.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="cu-role">Role</Label>
              <select
                id="cu-role"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                {...createForm.register('role')}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="cu-pass">Initial password</Label>
              <Input id="cu-pass" className="mt-1" type="password" autoComplete="new-password" {...createForm.register('password')} />
              <p className="mt-1 text-xs text-gray-500">Minimum 12 characters.</p>
              {createForm.formState.errors.password ? (
                <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.password.message}</p>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createMut.isPending}>
                Create user
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!disableTarget} onOpenChange={(o) => !o && setDisableTarget(null)}>
        <DialogContent
          title="Disable user"
          description="The account will no longer be able to sign in. This can be reversed later by reactivating the user in the database if needed."
        >
          {disableTarget ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Disable <span className="font-medium">{disableTarget.fullName}</span> ({disableTarget.email})?
              </p>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={disableMut.isPending}
                  onClick={() => disableTarget && disableMut.mutate(disableTarget.id)}
                >
                  Disable account
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
