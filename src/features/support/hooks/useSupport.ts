import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/config/queryKeys";
import {
  addTicketFlag,
  addTicketNote,
  assignTicket,
  assignTicketTeam,
  changeTicketCategory,
  changeTicketPriority,
  changeTicketStatus,
  closeTicket,
  createTicket,
  deEscalateTicket,
  escalateTicket,
  getAssigneeWorkload,
  getEscalatedQueue,
  getSupportAgents,
  getSupportAnalytics,
  getSupportContextOptions,
  getSupportOverview,
  getStaleQueue,
  getTicketActivity,
  getTicketById,
  getTicketContext,
  getTicketFlags,
  getTicketMessages,
  getTicketNotes,
  getTickets,
  getTicketsByAssignee,
  getTeamWorkload,
  getUnassignedQueue,
  markTicketReviewed,
  reassignTicket,
  removeTicketFlag,
  reopenTicket,
  replyToTicket,
  resolveTicket,
  unassignTicket,
  updateTicketContext,
} from "@/features/support/api/getSupport";
import type { SupportFilterState } from "@/features/support/types/support.types";

const supportBase = [...queryKeys.support] as const;

export const useSupportOverview = () => useQuery({ queryKey: [...supportBase, "overview"], queryFn: getSupportOverview, staleTime: 30_000, refetchOnWindowFocus: false });
export const useSupportAnalytics = (params?: SupportFilterState & { window?: string }) => useQuery({ queryKey: [...supportBase, "analytics", params], queryFn: () => getSupportAnalytics(params), staleTime: 30_000, refetchOnWindowFocus: false });
export const useTickets = (params?: SupportFilterState, enabled = true) => useQuery({ queryKey: [...supportBase, "tickets", params], queryFn: () => getTickets(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
export const useTicket = (id: string) => useQuery({ queryKey: [...supportBase, "ticket", id], queryFn: () => getTicketById(id), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });
export const useTicketActivity = (id: string, params?: SupportFilterState) => useQuery({ queryKey: [...supportBase, "activity", id, params], queryFn: () => getTicketActivity(id, params), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });
export const useTicketMessages = (id: string, params?: SupportFilterState) => useQuery({ queryKey: [...supportBase, "messages", id, params], queryFn: () => getTicketMessages(id, params), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });
export const useTicketContext = (id: string) => useQuery({ queryKey: [...supportBase, "context", id], queryFn: () => getTicketContext(id), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });
export const useUnassignedQueue = (params?: SupportFilterState, enabled = true) => useQuery({ queryKey: [...supportBase, "unassigned", params], queryFn: () => getUnassignedQueue(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
export const useEscalatedQueue = (params?: SupportFilterState, enabled = true) => useQuery({ queryKey: [...supportBase, "escalated", params], queryFn: () => getEscalatedQueue(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
export const useStaleQueue = (params?: SupportFilterState, enabled = true) => useQuery({ queryKey: [...supportBase, "stale", params], queryFn: () => getStaleQueue(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
export const useAssigneeWorkload = (enabled = true) => useQuery({ queryKey: [...supportBase, "assignee-workload"], queryFn: getAssigneeWorkload, staleTime: 20_000, refetchOnWindowFocus: false, enabled });
export const useTeamWorkload = () => useQuery({ queryKey: [...supportBase, "team-workload"], queryFn: getTeamWorkload, staleTime: 20_000, refetchOnWindowFocus: false });
export const useTicketsByAssignee = (id: string, params?: SupportFilterState, enabled = true) => useQuery({ queryKey: [...supportBase, "assignee-tickets", id, params], queryFn: () => getTicketsByAssignee(id, params), enabled: Boolean(id) && enabled, staleTime: 20_000, refetchOnWindowFocus: false });
export const useSupportAgents = () => useQuery({ queryKey: [...supportBase, "agents"], queryFn: getSupportAgents, staleTime: 20_000, refetchOnWindowFocus: false });
export const useSupportContextOptions = (params?: { q?: string; limit?: number }, enabled = true) => useQuery({ queryKey: [...supportBase, "context-options", params], queryFn: () => getSupportContextOptions(params), staleTime: 20_000, refetchOnWindowFocus: false, enabled });
export const useTicketNotes = (id: string) => useQuery({ queryKey: [...supportBase, "notes", id], queryFn: () => getTicketNotes(id), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });
export const useTicketFlags = (id: string) => useQuery({ queryKey: [...supportBase, "flags", id], queryFn: () => getTicketFlags(id), enabled: Boolean(id), staleTime: 20_000, refetchOnWindowFocus: false });

function useSupportMutation<TArgs extends unknown[], TResult extends { message?: string }>(mutationFn: (...args: TArgs) => Promise<TResult>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: TArgs) => mutationFn(...variables),
    onSuccess: async (result, variables) => {
      const id = variables[0] ? String(variables[0]) : "";
      toast.success(result.message || successMessage);
      await queryClient.invalidateQueries({ queryKey: supportBase });
      if (id) {
        await queryClient.invalidateQueries({ queryKey: [...supportBase, "ticket", id] });
        await queryClient.invalidateQueries({ queryKey: [...supportBase, "messages", id] });
        await queryClient.invalidateQueries({ queryKey: [...supportBase, "activity", id] });
        await queryClient.invalidateQueries({ queryKey: [...supportBase, "notes", id] });
        await queryClient.invalidateQueries({ queryKey: [...supportBase, "flags", id] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Support action failed");
    },
  });
}

export const useAssignTicket = () => useSupportMutation(assignTicket, "Ticket assigned successfully");
export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: async (result) => {
      toast.success(result.message || "Ticket created successfully");
      await queryClient.invalidateQueries({ queryKey: supportBase });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Support action failed");
    },
  });
}
export const useReassignTicket = () => useSupportMutation(reassignTicket, "Ticket reassigned successfully");
export const useUnassignTicket = () => useSupportMutation(unassignTicket, "Ticket unassigned successfully");
export const useAssignTicketTeam = () => useSupportMutation(assignTicketTeam, "Ticket team updated successfully");
export const useChangeTicketStatus = () => useSupportMutation(changeTicketStatus, "Ticket status updated successfully");
export const useChangeTicketPriority = () => useSupportMutation(changeTicketPriority, "Priority updated successfully");
export const useChangeTicketCategory = () => useSupportMutation(changeTicketCategory, "Category updated successfully");
export const useEscalateTicket = () => useSupportMutation(escalateTicket, "Ticket escalated successfully");
export const useDeEscalateTicket = () => useSupportMutation(deEscalateTicket, "Ticket de-escalated successfully");
export const useReopenTicket = () => useSupportMutation(reopenTicket, "Ticket reopened successfully");
export const useResolveTicket = () => useSupportMutation(resolveTicket, "Ticket resolved successfully");
export const useCloseTicket = () => useSupportMutation(closeTicket, "Ticket closed successfully");
export const useReplyToTicket = () => useSupportMutation(replyToTicket, "Reply sent successfully");
export const useMarkTicketReviewed = () => useSupportMutation(markTicketReviewed, "Ticket reviewed successfully");
export const useAddTicketNote = () => useSupportMutation(addTicketNote as (...args: Parameters<typeof addTicketNote>) => Promise<{ message?: string }>, "Internal note added successfully");
export const useAddTicketFlag = () => useSupportMutation(addTicketFlag as (...args: Parameters<typeof addTicketFlag>) => Promise<{ message?: string }>, "Ticket flag added successfully");
export const useRemoveTicketFlag = () => useSupportMutation(removeTicketFlag as (...args: Parameters<typeof removeTicketFlag>) => Promise<{ message?: string }>, "Ticket flag removed successfully");
export const useUpdateTicketContext = () => useSupportMutation(updateTicketContext, "Ticket context updated successfully");
