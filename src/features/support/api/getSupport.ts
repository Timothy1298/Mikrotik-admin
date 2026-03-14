import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  SupportActivityItem,
  SupportAgent,
  SupportAgentWorkload,
  SupportAnalytics,
  SupportFilterState,
  SupportFlag,
  SupportListResponse,
  SupportMessage,
  SupportNote,
  SupportOverview,
  SupportTeamWorkload,
  SupportTicketDetail,
  SupportTicketRow,
} from "@/features/support/types/support.types";

export async function getSupportOverview() {
  const { data } = await apiClient.get<{ success: boolean; overview: SupportOverview }>(endpoints.admin.supportOverview);
  return data.overview;
}

export async function getSupportAnalytics(params?: SupportFilterState & { window?: string }) {
  const { data } = await apiClient.get<{ success: boolean; analytics: SupportAnalytics }>(endpoints.admin.supportAnalytics, { params });
  return data.analytics;
}

export async function getTickets(params?: SupportFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SupportTicketRow[]; pagination: SupportListResponse<SupportTicketRow>["pagination"] }>(endpoints.admin.supportTickets, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getTicketById(id: string) {
  const { data } = await apiClient.get<{ success: boolean; data: SupportTicketDetail }>(endpoints.admin.supportTicketDetail(id));
  return data.data;
}

export async function getTicketActivity(id: string, params?: SupportFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SupportActivityItem[]; pagination: SupportListResponse<SupportActivityItem>["pagination"] }>(endpoints.admin.supportTicketActivity(id), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getTicketMessages(id: string, params?: SupportFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SupportMessage[]; pagination: SupportListResponse<SupportMessage>["pagination"] }>(endpoints.admin.supportTicketMessages(id), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getTicketContext(id: string) {
  const { data } = await apiClient.get<{ success: boolean; context: SupportTicketDetail["context"] }>(endpoints.admin.supportTicketContext(id));
  return data.context;
}

export async function getUnassignedQueue(params?: SupportFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SupportTicketRow[]; pagination: SupportListResponse<SupportTicketRow>["pagination"] }>(endpoints.admin.supportQueuesUnassigned, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getEscalatedQueue(params?: SupportFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SupportTicketRow[]; pagination: SupportListResponse<SupportTicketRow>["pagination"] }>(endpoints.admin.supportQueuesEscalated, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getStaleQueue(params?: SupportFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SupportTicketRow[]; pagination: SupportListResponse<SupportTicketRow>["pagination"] }>(endpoints.admin.supportQueuesStale, { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getAssigneeWorkload() {
  const { data } = await apiClient.get<{ success: boolean; items: SupportAgentWorkload[] }>(endpoints.admin.supportQueuesByAssignee);
  return data.items;
}

export async function getTeamWorkload() {
  const { data } = await apiClient.get<{ success: boolean; items: SupportTeamWorkload[] }>(endpoints.admin.supportQueuesByTeam);
  return data.items;
}

export async function getTicketsByAssignee(adminId: string, params?: SupportFilterState) {
  const { data } = await apiClient.get<{ success: boolean; items: SupportTicketRow[]; pagination: SupportListResponse<SupportTicketRow>["pagination"] }>(endpoints.admin.supportAssigneeTickets(adminId), { params });
  return { items: data.items, pagination: data.pagination };
}

export async function getSupportAgents() {
  const { data } = await apiClient.get<{ success: boolean; items: SupportAgent[] }>(endpoints.admin.supportAgents);
  return data.items;
}

export async function getTicketNotes(id: string) {
  const { data } = await apiClient.get<{ success: boolean; items: SupportNote[] }>(endpoints.admin.supportTicketNotes(id));
  return data.items;
}

export async function getTicketFlags(id: string) {
  const { data } = await apiClient.get<{ success: boolean; items: SupportFlag[] }>(endpoints.admin.supportTicketFlags(id));
  return data.items;
}

export async function assignTicket(ticketId: string, assigneeId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportAssignTicket(ticketId), { assigneeId, reason });
  return data;
}

export async function reassignTicket(ticketId: string, assigneeId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportReassignTicket(ticketId), { assigneeId, reason });
  return data;
}

export async function unassignTicket(ticketId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportUnassignTicket(ticketId), { reason });
  return data;
}

export async function changeTicketStatus(ticketId: string, status: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportTicketStatus(ticketId), { status, reason });
  return data;
}

export async function changeTicketPriority(ticketId: string, priority: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportTicketPriority(ticketId), { priority, reason });
  return data;
}

export async function changeTicketCategory(ticketId: string, category: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportTicketCategory(ticketId), { category, reason });
  return data;
}

export async function escalateTicket(ticketId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportEscalateTicket(ticketId), { reason });
  return data;
}

export async function deEscalateTicket(ticketId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportDeEscalateTicket(ticketId), { reason });
  return data;
}

export async function reopenTicket(ticketId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportReopenTicket(ticketId), { reason });
  return data;
}

export async function resolveTicket(ticketId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportResolveTicket(ticketId), { reason });
  return data;
}

export async function closeTicket(ticketId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportCloseTicket(ticketId), { reason });
  return data;
}

export async function replyToTicket(ticketId: string, payload: { message: string; attachments?: Array<Record<string, unknown>>; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportReplyToTicket(ticketId), payload);
  return data;
}

export async function markTicketReviewed(ticketId: string, reason?: string) {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(endpoints.admin.supportMarkTicketReviewed(ticketId), { reason });
  return data;
}

export async function addTicketNote(ticketId: string, payload: { body: string; category: string; pinned?: boolean; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; note: SupportNote }>(endpoints.admin.supportTicketNotes(ticketId), payload);
  return data;
}

export async function addTicketFlag(ticketId: string, payload: { flag: string; severity: string; description?: string; reason?: string }) {
  const { data } = await apiClient.post<{ success: boolean; flag: SupportFlag }>(endpoints.admin.supportTicketFlags(ticketId), payload);
  return data;
}

export async function removeTicketFlag(ticketId: string, flagId: string, reason?: string) {
  const { data } = await apiClient.delete<{ success: boolean; removed: SupportFlag }>(endpoints.admin.supportRemoveFlag(ticketId, flagId), { data: { reason } });
  return data;
}
