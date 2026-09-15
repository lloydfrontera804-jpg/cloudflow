// These are now Next.js Route Handlers living in this same app (app/api/**),
// not a separate deployed service — so plain relative paths work and there's
// no CORS, no base URL, no second Render service to manage.

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ---------- machines ----------

export function fetchMachines() {
  return req<{
    machines: { id: string; name: string; status: 'active' | 'disabled'; hasTunnelHost: boolean; inUse: boolean }[];
    isAdmin: boolean;
  }>('/api/machines');
}

// Admin only — backend rejects non-admins with 403. tunnelReportKey is
// returned exactly once, here, at creation time — copy it immediately into
// the laptop's reporter script; it can't be retrieved again afterward.
export function createMachine(name: string) {
  return req<{ machine: { id: string; name: string; status: string }; tunnelReportKey: string }>('/api/machines', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function updateMachine(machineId: string, updates: { name?: string; status?: 'active' | 'disabled' }) {
  return req<{ machine: { id: string; name: string; status: string } }>(`/api/machines/${machineId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export function deleteMachine(machineId: string) {
  return req<{ ok: true }>(`/api/machines/${machineId}`, { method: 'DELETE' });
}

// ---------- session (now always scoped to a specific machine) ----------

export function fetchSession(machineId: string) {
  return req<{ session: any | null }>(`/api/session?machineId=${encodeURIComponent(machineId)}`);
}

export function startSession(machineId: string, planId: string) {
  return req<{ session: any }>('/api/session/start', {
    method: 'POST',
    body: JSON.stringify({ machineId, planId }),
  });
}

export function extendSession(machineId: string, planId: string) {
  return req<{ session: any }>('/api/session/extend', {
    method: 'POST',
    body: JSON.stringify({ machineId, planId }),
  });
}

// Dev-only — the route rejects these outside development.
export function debugSession(machineId: string, action: 'warning' | 'expire' | 'reset') {
  return req<{ session: any | null }>('/api/session/debug', {
    method: 'POST',
    body: JSON.stringify({ machineId, action }),
  });
}

// ---------- transactions / stats (per-user, unchanged by multi-machine) ----------

export function fetchTransactions(email?: string) {
  const qs = email ? `?email=${encodeURIComponent(email)}` : '';
  return req<{ transactions: any[] }>(`/api/transactions${qs}`);
}

export function fetchStats(email?: string) {
  const qs = email ? `?email=${encodeURIComponent(email)}` : '';
  return req<{ totalSessionsCompleted: number; totalSpentInr: number; totalHoursUsed: number }>(
    `/api/stats${qs}`
  );
}

// ---------- tunnel host (now per-machine) ----------

export function fetchTunnelHost(machineId: string) {
  return req<{ host: string | null; updatedAt: number | null }>(
    `/api/tunnel-host?machineId=${encodeURIComponent(machineId)}`
  );
}
