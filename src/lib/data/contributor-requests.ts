import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  demoApproveContributorRequest,
  demoCountPendingContributorRequests,
  demoCreateContributorRequest,
  demoListContributorRequests,
  demoMyContributorRequest,
  demoRejectContributorRequest,
} from '@/demo/store';
import type {
  ContributorRequest,
  ContributorRequestStatus,
  ContributorRequestWithProfile,
} from '@/types/database';

/** Latest contributor request for this user. */
export async function fetchMyContributorRequest(
  userId: string,
): Promise<ContributorRequest | null> {
  if (!isSupabaseConfigured) return demoMyContributorRequest(userId);
  const { data, error } = await getSupabase()
    .from('contributor_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Apply to become a contributor. */
export async function createContributorRequest(
  userId: string,
  reason: string,
): Promise<ContributorRequest> {
  if (!isSupabaseConfigured) {
    return demoCreateContributorRequest(userId, reason);
  }
  const trimmed = reason.trim();
  if (trimmed.length < 20) {
    throw new Error('Please explain why you’d like to contribute (at least 20 characters).');
  }
  const { data, error } = await getSupabase()
    .from('contributor_requests')
    .insert({ user_id: userId, reason: trimmed } as never)
    .select('*')
    .single();
  if (error) throw error;
  return data as ContributorRequest;
}

/** Contributor requests for admin review. */
export async function listContributorRequests(
  status?: ContributorRequestStatus,
): Promise<ContributorRequestWithProfile[]> {
  if (!isSupabaseConfigured) return demoListContributorRequests(status);
  let query = getSupabase()
    .from('contributor_requests')
    .select('*, applicant:profiles!contributor_requests_user_id_fkey(*)')
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ContributorRequestWithProfile[];
}

/** How many requests are still pending. */
export async function countPendingContributorRequests(): Promise<number> {
  if (!isSupabaseConfigured) return demoCountPendingContributorRequests();
  const { count, error } = await getSupabase()
    .from('contributor_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  if (error) throw error;
  return count ?? 0;
}

/** Approve request and grant contributor role. */
export async function approveContributorRequest(
  id: string,
  reviewerId: string,
): Promise<ContributorRequest> {
  if (!isSupabaseConfigured) {
    return demoApproveContributorRequest(id, reviewerId);
  }
  const { data, error } = await getSupabase().rpc('approve_contributor_request', {
    request_id: id,
  } as never);
  if (error) throw error;
  return data as unknown as ContributorRequest;
}

/** Reject request with an admin note. */
export async function rejectContributorRequest(
  id: string,
  reviewerId: string,
  adminNote: string,
): Promise<ContributorRequest> {
  if (!isSupabaseConfigured) {
    return demoRejectContributorRequest(id, reviewerId, adminNote);
  }
  const note = adminNote.trim();
  if (!note) throw new Error('Please add a short note so the applicant understands.');
  const { data, error } = await getSupabase().rpc('reject_contributor_request', {
    request_id: id,
    admin_note: note,
  } as never);
  if (error) throw error;
  return data as unknown as ContributorRequest;
}
