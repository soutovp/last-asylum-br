"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface GiftCode {
  id: string;
  code: string;
  rewards: string;
  created_at: string;
}

export default function AdminGiftCodes() {
  const [codes, setCodes] = useState<GiftCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form fields
  const [editId, setEditId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [rewards, setRewards] = useState("");
  const [createdAt, setCreatedAt] = useState(""); // Representa a Data de Adição
  const [notifyEmail, setNotifyEmail] = useState(true);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gift_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setCodes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    const formattedCode = code.trim().toUpperCase();
    const formattedRewards = rewards.trim();

    const payload: any = {
      code: formattedCode,
      rewards: formattedRewards,
    };

    // Adiciona a data de adição/criação customizada caso o usuário escolha, caso contrário usa a data atual
    if (createdAt) {
      payload.created_at = new Date(createdAt).toISOString();
    }

    try {
      if (editId) {
        // Editar
        await supabase.from("gift_codes").update(payload).eq("id", editId);
      } else {
        // Cadastrar
        await supabase.from("gift_codes").insert([payload]);

        // Disparo assíncrono de E-mail Marketing para novo código
        if (notifyEmail) {
          (async () => {
            try {
              let recipients: string[] = [];
              const { data: profiles } = await supabase.from("profiles").select("email");
              if (profiles && profiles.length > 0) {
                recipients = profiles
                  .map((p: any) => p.email)
                  .filter((em: any): em is string => Boolean(em && typeof em === "string" && em.includes("@")));
              }

              const currentOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
              fetch("/api/mail-marketing/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "codigo",
                  data: {
                    code: formattedCode,
                    rewards: formattedRewards,
                  },
                  recipients,
                  siteUrl: currentOrigin,
                }),
              }).catch((err) => {
                console.warn("[Mail Marketing Code Trigger Warning]:", err);
              });
            } catch (mailErr) {
              console.warn("[Mail Marketing Code Exception Caught]:", mailErr);
            }
          })();
        }
      }
      resetForm();
      fetchCodes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item: GiftCode) => {
    setEditId(item.id);
    setCode(item.code);
    setRewards(item.rewards);
    setCreatedAt(item.created_at ? item.created_at.slice(0, 16) : "");
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente deletar este código presente?")) return;
    try {
      await supabase.from("gift_codes").delete().eq("id", id);
      fetchCodes();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setCode("");
    setRewards("");
    setCreatedAt("");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#101623]/95 border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Códigos Presente</h2>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie cupons e códigos de resgate de recompensas ativas no jogo.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:bg-[#15ff96]"
          >
            + Adicionar Código
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white">
            {editId ? "Editar Código" : "Cadastrar Novo Código"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">CÓDIGO:</label>
              <input
                type="text"
                required
                placeholder="EX: SURVIVAL2026"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00ff88]"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">DATA DE ADIÇÃO (PADRÃO: HOJE):</label>
              <input
                type="datetime-local"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00ff88]"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-slate-400 font-mono block mb-1">RECOMPENSAS (RECURSOS):</label>
              <input
                type="text"
                placeholder="EX: 500x Diamantes, 2x Livros de Experiência, 10x Antitoxina"
                value={rewards}
                onChange={(e) => setRewards(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00ff88]"
              />
            </div>

            {!editId && (
              <div className="md:col-span-3 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-sm">
                    🎁
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Disparar E-mail Marketing do Código</p>
                    <p className="text-[11px] text-slate-400">
                      Notificar todos os jogadores cadastrados sobre o novo cupom de presente
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ff88]"></div>
                </label>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs"
            >
              {editId ? "Salvar Alterações" : "Salvar Código"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-[#101623]/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-mono text-slate-400">
                <th className="p-4">CÓDIGO</th>
                <th className="p-4">RECOMPENSAS</th>
                <th className="p-4">DATA DE ADIÇÃO</th>
                <th className="p-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((item) => {
                const isOld = (Date.now() - new Date(item.created_at).getTime()) > (30 * 24 * 60 * 60 * 1000);
                return (
                  <tr key={item.id} className="border-b border-slate-800/60 hover:bg-slate-800/20 text-sm text-slate-200">
                    <td className="p-4 font-mono font-bold text-white">{item.code}</td>
                    <td className="p-4 text-slate-300 text-xs">{item.rewards || "-"}</td>
                    <td className="p-4 text-xs font-mono">
                      <span className={isOld ? "text-orange-400" : "text-[#00ff88]"}>
                        {new Date(item.created_at).toLocaleString("pt-BR")}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 border border-red-500/20"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
