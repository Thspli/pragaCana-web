import { useState } from 'react';

type ArmadilhaInput = {
  nome?: string;
  observacao?: string;
  dataFoto?: string | null;
  foto?: string | null; // base64 or URL depending on upload strategy
  ausencia?: boolean;
  latitude: number | null;
  longitude: number | null;
  talhaoId?: number | null;
};

const DEFAULT_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export function useArmadilhas(apiBase = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createArmadilha = async (input: ArmadilhaInput, token: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/armadilhas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(input)
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.erro || `Erro ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Erro');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const listarPorTalhao = async (talhaoId: number, token: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (talhaoId) params.set('talhaoId', String(talhaoId));
      const res = await fetch(`${apiBase}/armadilhas?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      return await res.json();
    } catch (err: any) {
      setError(err.message || 'Erro');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateArmadilha = async (id: number, input: Partial<ArmadilhaInput>, token: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/armadilhas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(input)
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.erro || `Erro ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      setError(err.message || 'Erro');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createArmadilha, listarPorTalhao, updateArmadilha, loading, error };
}
