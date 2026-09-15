'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchMachines, createMachine, updateMachine, deleteMachine } from '@/lib/api';
import { Monitor, Plus, Trash2, Power, AlertCircle, Copy, Check } from 'lucide-react';

interface Machine {
  id: string;
  name: string;
  status: 'active' | 'disabled';
  hasTunnelHost: boolean;
  inUse: boolean;
}

export function MachineSelector({ onSelect }: { onSelect: (machineId: string) => void }) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMachineName, setNewMachineName] = useState('');
  const [justCreatedKey, setJustCreatedKey] = useState<{ name: string; key: string } | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const { machines: m, isAdmin: admin } = await fetchMachines();
      setMachines(m);
      setIsAdmin(admin);
    } catch (err: any) {
      setError(err.message || 'Failed to load machines');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Refresh occasionally so "in use" status updates as other classmates'
    // sessions start/expire, without needing a full page reload.
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const handleCreateMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineName.trim()) return;
    try {
      const { machine, tunnelReportKey } = await createMachine(newMachineName.trim());
      setJustCreatedKey({ name: machine.name, key: tunnelReportKey });
      setNewMachineName('');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to create machine');
    }
  };

  const handleToggleStatus = async (machine: Machine) => {
    try {
      await updateMachine(machine.id, { status: machine.status === 'active' ? 'disabled' : 'active' });
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to update machine');
    }
  };

  const handleDelete = async (machine: Machine) => {
    if (!confirm(`Delete "${machine.name}"? This can't be undone.`)) return;
    try {
      await deleteMachine(machine.id);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to delete machine');
    }
  };

  if (isLoading) {
    return <p className="text-sm text-zinc-400 p-6">Loading machines…</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Choose a machine</h2>

      {error && (
        <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-950/30 border border-rose-900 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {machines.length === 0 && (
        <p className="text-sm text-zinc-400">
          No machines have been added yet. {isAdmin ? 'Add one below.' : 'Check back soon.'}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {machines.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl border p-4 flex flex-col gap-2 ${
              m.status === 'disabled'
                ? 'border-zinc-800 bg-zinc-900/40 opacity-60'
                : m.inUse
                ? 'border-amber-800 bg-amber-950/20'
                : 'border-zinc-800 bg-zinc-900 hover:border-blue-600'
            }`}
          >
            <div className="flex items-center gap-2 text-white font-semibold">
              <Monitor className="w-4 h-4" />
              {m.name}
            </div>
            <div className="text-xs text-zinc-400">
              {m.status === 'disabled'
                ? 'Disabled by admin'
                : !m.hasTunnelHost
                ? 'Laptop not connected yet'
                : m.inUse
                ? 'Currently in use'
                : 'Available'}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                disabled={m.status === 'disabled' || m.inUse || !m.hasTunnelHost}
                onClick={() => onSelect(m.id)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold cursor-pointer"
              >
                Select
              </button>

              {isAdmin && (
                <>
                  <button
                    onClick={() => handleToggleStatus(m)}
                    title={m.status === 'active' ? 'Disable' : 'Enable'}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(m)}
                    title="Delete"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900 text-zinc-300 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="border-t border-zinc-800 pt-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Admin: add a machine</h3>
          <form onSubmit={handleCreateMachine} className="flex gap-2">
            <input
              type="text"
              placeholder="Machine name (e.g. Laptop 2 — Ananya's)"
              value={newMachineName}
              onChange={(e) => setNewMachineName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>

          {justCreatedKey && (
            <div className="rounded-lg border border-amber-700 bg-amber-950/30 p-4 space-y-2">
              <p className="text-sm text-amber-300 font-semibold">
                "{justCreatedKey.name}" created. Copy this key now — it will not be shown again:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-zinc-950 text-emerald-400 px-2 py-1.5 rounded overflow-x-auto">
                  {justCreatedKey.key}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(justCreatedKey.key);
                    setKeyCopied(true);
                    setTimeout(() => setKeyCopied(false), 2000);
                  }}
                  className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                >
                  {keyCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-amber-400/80">
                Put this in that laptop's <code>run-cloudflared-tunnel.ps1</code> as{' '}
                <code>$TunnelKey</code>. If it's lost, delete this machine and create a new one.
              </p>
              <button
                onClick={() => setJustCreatedKey(null)}
                className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
