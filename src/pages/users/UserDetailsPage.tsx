import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageLoader } from '@/components/feedback/PageLoader';
import { PageHeader } from '@/components/layout/PageHeader';
import { RefreshButton } from '@/components/shared/RefreshButton';
import {
  AddUserFlagDialog,
  AddUserNoteDialog,
  DeleteSubscriberDialog,
  EditSubscriberProfileDialog,
  ExtendTrialDialog,
  ForceLogoutDialog,
  ReactivateUserDialog,
  RemoveUserFlagDialog,
  ResendVerificationDialog,
  SendPasswordResetDialog,
  SuspendUserDialog,
  UserDetailsWorkspace,
  VerifyUserDialog,
} from '@/features/users/components';
import {
  useAddUserFlag,
  useAddUserNote,
  useDeleteUser,
  useEditUserProfile,
  useExtendUserTrial,
  useForceLogoutUser,
  useReactivateUser,
  useRemoveUserFlag,
  useResendVerification,
  useSendPasswordReset,
  useSuspendUser,
  useUser,
  useVerifyUser,
} from '@/features/users/hooks';
import type { UserDetail } from '@/features/users/types/user.types';
import { useDisclosure } from '@/hooks/ui/useDisclosure';
import { appRoutes } from '@/config/routes';

export function UserDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [selectedFlag, setSelectedFlag] = useState<UserDetail['flags'][number] | null>(null);

  const suspendDisclosure = useDisclosure(false);
  const reactivateDisclosure = useDisclosure(false);
  const verifyDisclosure = useDisclosure(false);
  const resendDisclosure = useDisclosure(false);
  const passwordResetDisclosure = useDisclosure(false);
  const forceLogoutDisclosure = useDisclosure(false);
  const extendDisclosure = useDisclosure(false);
  const noteDisclosure = useDisclosure(false);
  const flagDisclosure = useDisclosure(false);
  const removeFlagDisclosure = useDisclosure(false);
  const deleteDisclosure = useDisclosure(false);
  const editProfileDisclosure = useDisclosure(false);

  const userQuery = useUser(id);
  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();
  const verifyMutation = useVerifyUser();
  const resendMutation = useResendVerification();
  const passwordResetMutation = useSendPasswordReset();
  const forceLogoutMutation = useForceLogoutUser();
  const extendMutation = useExtendUserTrial();
  const noteMutation = useAddUserNote();
  const addFlagMutation = useAddUserFlag();
  const removeFlagMutation = useRemoveUserFlag();
  const deleteMutation = useDeleteUser();
  const editProfileMutation = useEditUserProfile();

  if (userQuery.isPending) return <PageLoader />;
  if (userQuery.isError || !userQuery.data) {
    return <ErrorState title="Unable to load user" description="The user detail workspace could not be loaded. Retry after confirming the backend users API is available." onAction={() => void userQuery.refetch()} />;
  }

  const user = userQuery.data;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={user.profile.name} description="Route-driven account workspace for deep user investigation, admin actions, and linked operational context." meta={user.profile.email} />
        <RefreshButton loading={userQuery.isFetching} onClick={() => void userQuery.refetch()} />
      </div>

      <UserDetailsWorkspace
        user={user}
        onRefresh={() => void userQuery.refetch()}
        refreshing={userQuery.isFetching}
        onSuspend={suspendDisclosure.onOpen}
        onReactivate={reactivateDisclosure.onOpen}
        onVerify={verifyDisclosure.onOpen}
        onResendVerification={resendDisclosure.onOpen}
        onPasswordReset={passwordResetDisclosure.onOpen}
        onForceLogout={forceLogoutDisclosure.onOpen}
        onExtendTrial={extendDisclosure.onOpen}
        onAddNote={noteDisclosure.onOpen}
        onAddFlag={flagDisclosure.onOpen}
        onRemoveFlag={(flag) => { setSelectedFlag(flag); removeFlagDisclosure.onOpen(); }}
        onDelete={deleteDisclosure.onOpen}
        onEditProfile={editProfileDisclosure.onOpen}
      />

      <SuspendUserDialog open={suspendDisclosure.open} loading={suspendMutation.isPending} onClose={suspendDisclosure.onClose} onConfirm={(reason) => suspendMutation.mutate([user.id, reason] as never, { onSuccess: () => suspendDisclosure.onClose() })} />
      <ReactivateUserDialog open={reactivateDisclosure.open} loading={reactivateMutation.isPending} onClose={reactivateDisclosure.onClose} onConfirm={(reason) => reactivateMutation.mutate([user.id, reason] as never, { onSuccess: () => reactivateDisclosure.onClose() })} />
      <VerifyUserDialog open={verifyDisclosure.open} loading={verifyMutation.isPending} onClose={verifyDisclosure.onClose} onConfirm={(reason) => verifyMutation.mutate([user.id, reason] as never, { onSuccess: () => verifyDisclosure.onClose() })} />
      <ResendVerificationDialog open={resendDisclosure.open} loading={resendMutation.isPending} onClose={resendDisclosure.onClose} onConfirm={(reason) => resendMutation.mutate([user.id, reason] as never, { onSuccess: () => resendDisclosure.onClose() })} />
      <SendPasswordResetDialog open={passwordResetDisclosure.open} loading={passwordResetMutation.isPending} onClose={passwordResetDisclosure.onClose} onConfirm={(reason) => passwordResetMutation.mutate([user.id, reason] as never, { onSuccess: () => passwordResetDisclosure.onClose() })} />
      <ForceLogoutDialog open={forceLogoutDisclosure.open} loading={forceLogoutMutation.isPending} onClose={forceLogoutDisclosure.onClose} onConfirm={(reason) => forceLogoutMutation.mutate([user.id, reason] as never, { onSuccess: () => forceLogoutDisclosure.onClose() })} />
      <ExtendTrialDialog open={extendDisclosure.open} loading={extendMutation.isPending} onClose={extendDisclosure.onClose} onConfirm={(days, reason) => extendMutation.mutate([user.id, days, reason] as never, { onSuccess: () => extendDisclosure.onClose() })} />
      <AddUserNoteDialog open={noteDisclosure.open} loading={noteMutation.isPending} onClose={noteDisclosure.onClose} onConfirm={(payload) => noteMutation.mutate([user.id, payload] as never, { onSuccess: () => noteDisclosure.onClose() })} />
      <AddUserFlagDialog open={flagDisclosure.open} loading={addFlagMutation.isPending} onClose={flagDisclosure.onClose} onConfirm={(payload) => addFlagMutation.mutate([user.id, payload] as never, { onSuccess: () => flagDisclosure.onClose() })} />
      <RemoveUserFlagDialog open={removeFlagDisclosure.open} loading={removeFlagMutation.isPending} flag={selectedFlag} onClose={removeFlagDisclosure.onClose} onConfirm={(reason) => {
        if (!selectedFlag?.id) return;
        removeFlagMutation.mutate([user.id, selectedFlag.id, reason] as never, { onSuccess: () => removeFlagDisclosure.onClose() });
      }} />
      <DeleteSubscriberDialog
        open={deleteDisclosure.open}
        loading={deleteMutation.isPending}
        userName={user.profile.name}
        onClose={deleteDisclosure.onClose}
        onConfirm={(reason) => deleteMutation.mutate([user.id, reason] as never, {
          onSuccess: () => {
            deleteDisclosure.onClose();
            navigate(appRoutes.usersAll);
          },
        })}
      />
      <EditSubscriberProfileDialog
        open={editProfileDisclosure.open}
        loading={editProfileMutation.isPending}
        user={user}
        onClose={editProfileDisclosure.onClose}
        onConfirm={(payload) => editProfileMutation.mutate([user.id, payload] as never, {
          onSuccess: () => editProfileDisclosure.onClose(),
        })}
      />
    </section>
  );
}
