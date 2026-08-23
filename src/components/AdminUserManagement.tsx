"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { UserRole, ROLES_REGISTRY, getDynamicAdminPages, AdminPageDefinition } from "@/lib/permissions";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getDeterministicHeroAvatar, getSavedSession, UserSession } from "@/lib/auth";

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  birthDate: string;
  region: string;
  characterName?: string;
  characterId?: string;
  kingdomNumber?: number;
  avatarUrl?: string;
  createdAt: string;
}

interface ProfileRow {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  birth_date?: string;
  region?: string;
  character_name?: string;
  character_id?: string;
  kingdom_number?: number;
  avatar_url?: string;
  created_at?: string;
}

interface FeedbackState {
  type: "success" | "error" | "info";
  message: string;
}

interface AdminUserManagementProps {
  session?: UserSession;
  onSessionUpdate?: (updated: UserSession) => void;
}

const ITEMS_PER_PAGE = 10;

/* =========================================================================
   FUNÇÕES AUXILIARES DE VALIDAÇÃO E SANITIZAÇÃO DE SEGURANÇA
   ========================================================================= */

function sanitizeInput(val: string | undefined | null, maxLen: number = 100): string {
  if (!val) return "";
  return val.trim().slice(0, maxLen);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: "A senha inicial deve conter no mínimo 8 caracteres para conformidade de segurança." };
  }
  return { valid: true };
}

function isValidBirthDate(dateStr: string): { valid: boolean; message?: string } {
  if (!dateStr) {
    return { valid: false, message: "Data de nascimento é obrigatória." };
  }
  const birth = new Date(dateStr);
  const now = new Date();
  if (isNaN(birth.getTime())) {
    return { valid: false, message: "Data de nascimento inválida." };
  }
  if (birth > now) {
    return { valid: false, message: "Data de nascimento não pode estar em data futura." };
  }
  if (birth.getFullYear() < 1900) {
    return { valid: false, message: "Ano de nascimento inválido (deve ser após 1900)." };
  }
  return { valid: true };
}

export default function AdminUserManagement({
  session: propSession,
  onSessionUpdate,
}: AdminUserManagementProps) {
  // Sessão interna de fallback caso não fornecida via prop
  const [internalSession, setInternalSession] = useState<UserSession | null>(() => {
    return typeof window !== "undefined" ? getSavedSession() : null;
  });

  const activeSession = propSession || internalSession;

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Feedback e alertas na interface
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  // Matriz de permissões dinâmicas por página
  const [pageMatrix, setPageMatrix] = useState<AdminPageDefinition[]>(() => {
    return getDynamicAdminPages();
  });

  // Estado de busca e paginação
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Estado do Modal de Edição
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editFormState, setEditFormState] = useState<UserRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado de criação de novo usuário
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [newCharacterName, setNewCharacterName] = useState("");
  const [newCharacterId, setNewCharacterId] = useState("");
  const [newKingdomNumber, setNewKingdomNumber] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("USER");

  // Auto-dismiss do feedback após 6 segundos
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Checagem rigorosa de privilégio ADM para RBAC
  const isAuthorizedAdmin = useMemo(() => {
    return Boolean(activeSession && activeSession.role === "ADM");
  }, [activeSession]);

  // Identificação segura da conta do próprio usuário logado
  const isSelfAccount = useCallback((target: UserRecord | null): boolean => {
    if (!target || !activeSession) return false;
    const targetEmail = (target.email || "").trim().toLowerCase();
    const currentEmail = (activeSession.email || "").trim().toLowerCase();
    if (targetEmail && currentEmail && targetEmail === currentEmail) return true;
    if (target.id && activeSession.id && target.id === activeSession.id) return true;
    return false;
  }, [activeSession]);

  // Identificação da conta raiz do sistema
  const isRootAdminAccount = useCallback((target: UserRecord | null): boolean => {
    if (!target) return false;
    return (target.email || "").trim().toLowerCase() === "admin@lastasylum.br";
  }, []);

  const refreshUsers = async () => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) {
          setUsers(
            (data as ProfileRow[]).map((u) => ({
              id: u.id || u.email || "",
              firstName: u.first_name || "",
              lastName: u.last_name || "",
              email: u.email || "",
              role: (u.role as UserRole) || "USER",
              birthDate: u.birth_date || "",
              region: u.region || "",
              characterName: u.character_name || "",
              characterId: u.character_id || "",
              kingdomNumber: u.kingdom_number || undefined,
              avatarUrl: u.avatar_url || getDeterministicHeroAvatar(u.email || ""),
              createdAt: u.created_at ? new Date(u.created_at).toISOString().split("T")[0] : ""
            }))
          );
        }
      } else {
        const stored = localStorage.getItem("local_profiles");
        if (stored) {
          setUsers(JSON.parse(stored));
        }
      }
    } catch (err: unknown) {
      console.error("Erro ao atualizar lista de usuários:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadInitialUsers() {
      try {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });
          if (error) throw error;
          if (data && isMounted) {
            setUsers(
              (data as ProfileRow[]).map((u) => ({
                id: u.id || u.email || "",
                firstName: u.first_name || "",
                lastName: u.last_name || "",
                email: u.email || "",
                role: (u.role as UserRole) || "USER",
                birthDate: u.birth_date || "",
                region: u.region || "",
                characterName: u.character_name || "",
                characterId: u.character_id || "",
                kingdomNumber: u.kingdom_number || undefined,
                avatarUrl: u.avatar_url || getDeterministicHeroAvatar(u.email || ""),
                createdAt: u.created_at ? new Date(u.created_at).toISOString().split("T")[0] : ""
              }))
            );
          }
        } else if (isMounted) {
          const stored = localStorage.getItem("local_profiles");
          if (stored) {
            setUsers(JSON.parse(stored));
          } else {
            const seed: UserRecord[] = [
              {
                id: "admin@lastasylum.br",
                firstName: "Fernando",
                lastName: "Silva",
                email: "admin@lastasylum.br",
                role: "ADM",
                birthDate: "1990-05-15",
                region: "Sudeste",
                characterName: "ComandanteBR",
                characterId: "LA-992144",
                kingdomNumber: 42,
                avatarUrl: getDeterministicHeroAvatar("admin@lastasylum.br"),
                createdAt: "2026-07-31"
              }
            ];
            localStorage.setItem("local_profiles", JSON.stringify(seed));
            setUsers(seed);
          }
        }
      } catch (err: unknown) {
        console.error("Erro ao carregar usuários:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadInitialUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // FILTRAGEM DE USUÁRIOS
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const roleDef = ROLES_REGISTRY[u.role];
      const roleName = roleDef ? roleDef.name.toLowerCase() : "";
      return (
        u.email.toLowerCase().includes(term) ||
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        fullName.includes(term) ||
        (u.characterName && u.characterName.toLowerCase().includes(term)) ||
        (u.characterId && u.characterId.toLowerCase().includes(term)) ||
        (u.region && u.region.toLowerCase().includes(term)) ||
        u.role.toLowerCase().includes(term) ||
        roleName.includes(term) ||
        (u.kingdomNumber && String(u.kingdomNumber).includes(term))
      );
    });
  }, [users, searchTerm]);

  // PAGINAÇÃO DINÂMICA
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const displayedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  // ABRIR MODAL DE EDIÇÃO
  const handleOpenEditModal = (user: UserRecord) => {
    if (!isAuthorizedAdmin) {
      setFeedback({ type: "error", message: "Ação não autorizada: Apenas administradores ADM podem editar usuários." });
      return;
    }
    setEditingUser(user);
    setEditFormState({ ...user });
  };

  // FECHAR MODAL DE EDIÇÃO
  const handleCloseEditModal = () => {
    if (isSaving || isDeleting) return;
    setEditingUser(null);
    setEditFormState(null);
  };

  // SALVAR EDIÇÃO DO USUÁRIO NO MODAL COM VALIDAÇÃO E PROTEÇÃO RBAC
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormState) return;

    // 1. Verificação de Autorização
    if (!isAuthorizedAdmin) {
      setFeedback({ type: "error", message: "Operação bloqueada: Apenas administradores ADM possuem permissão para salvar alterações." });
      return;
    }

    // 2. Sanitização e Validação dos Campos
    const cleanFirstName = sanitizeInput(editFormState.firstName, 60);
    const cleanLastName = sanitizeInput(editFormState.lastName, 60);
    const cleanRegion = sanitizeInput(editFormState.region, 60);
    const cleanCharName = sanitizeInput(editFormState.characterName, 60);
    const cleanCharId = sanitizeInput(editFormState.characterId, 60);

    if (!cleanFirstName || cleanFirstName.length < 2) {
      setFeedback({ type: "error", message: "O nome deve conter pelo menos 2 caracteres." });
      return;
    }
    if (!cleanLastName || cleanLastName.length < 2) {
      setFeedback({ type: "error", message: "O sobrenome deve conter pelo menos 2 caracteres." });
      return;
    }
    if (!cleanRegion) {
      setFeedback({ type: "error", message: "O campo região é obrigatório." });
      return;
    }

    const birthCheck = isValidBirthDate(editFormState.birthDate);
    if (!birthCheck.valid) {
      setFeedback({ type: "error", message: birthCheck.message || "Data de nascimento inválida." });
      return;
    }

    let parsedKingdom: number | null = null;
    if (editFormState.kingdomNumber !== undefined && editFormState.kingdomNumber !== null && String(editFormState.kingdomNumber).trim() !== "") {
      const kNum = Number(editFormState.kingdomNumber);
      if (isNaN(kNum) || kNum < 1 || kNum > 999999) {
        setFeedback({ type: "error", message: "Número do reino inválido. Deve ser um número positivo entre 1 e 999999." });
        return;
      }
      parsedKingdom = kNum;
    }

    // 3. Prevenção de Auto-Rebaixamento do Último ADM Ativo
    if (isSelfAccount(editFormState) && editFormState.role !== "ADM") {
      const otherAdmins = users.filter((u) => u.role === "ADM" && !isSelfAccount(u));
      if (otherAdmins.length === 0) {
        setFeedback({ type: "error", message: "Operação bloqueada por segurança: Não é permitido remover privilégios de ADM do único administrador ativo do portal." });
        return;
      }
    }

    setIsSaving(true);
    try {
      const targetId = editFormState.id;
      const dbUpdates = {
        first_name: cleanFirstName,
        last_name: cleanLastName,
        role: editFormState.role,
        birth_date: editFormState.birthDate,
        region: cleanRegion,
        character_name: cleanCharName || null,
        character_id: cleanCharId || null,
        kingdom_number: parsedKingdom,
      };

      const updatedRecord: UserRecord = {
        ...editFormState,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        region: cleanRegion,
        characterName: cleanCharName || undefined,
        characterId: cleanCharId || undefined,
        kingdomNumber: parsedKingdom || undefined,
      };

      if (isSupabaseConfigured) {
        const queryField = targetId.includes("@") ? "email" : "id";
        const { error } = await supabase
          .from("profiles")
          .update(dbUpdates)
          .eq(queryField, targetId);
        if (error) throw error;
      } else {
        const updated = users.map((u) => (u.id === targetId ? updatedRecord : u));
        localStorage.setItem("local_profiles", JSON.stringify(updated));
      }

      // Se editou a si mesmo, sincroniza com a sessão ativa
      if (isSelfAccount(editFormState) && activeSession) {
        const nextSession: UserSession = {
          ...activeSession,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          role: editFormState.role,
          region: cleanRegion,
          characterName: cleanCharName || undefined,
          characterId: cleanCharId || undefined,
          kingdomNumber: parsedKingdom || undefined,
          birthDate: editFormState.birthDate,
        };
        setInternalSession(nextSession);
        if (onSessionUpdate) {
          onSessionUpdate(nextSession);
        }
      }

      setUsers((prev) => prev.map((u) => (u.id === targetId ? updatedRecord : u)));
      setFeedback({ type: "success", message: `Perfil de ${cleanFirstName} atualizado com sucesso!` });
      handleCloseEditModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setFeedback({ type: "error", message: "Erro ao atualizar informações do usuário: " + message });
    } finally {
      setIsSaving(false);
    }
  };

  // DELETAR CONTA DE USUÁRIO COM PROTEÇÃO CONTRA AUTO-DELEÇÃO E ÚLTIMO ADM
  const handleDeleteUserFromModal = async () => {
    if (!editFormState) return;

    // 1. Verificação de Autorização
    if (!isAuthorizedAdmin) {
      setFeedback({ type: "error", message: "Ação não autorizada: Apenas administradores ADM podem excluir contas." });
      return;
    }

    // 2. Proteção contra Auto-Exclusão da Conta em Uso
    if (isSelfAccount(editFormState)) {
      setFeedback({
        type: "error",
        message: "Operação bloqueada por segurança: Você não pode excluir sua própria conta de administrador enquanto ela estiver em uso."
      });
      return;
    }

    // 3. Proteção da Conta Raiz do Sistema
    if (isRootAdminAccount(editFormState)) {
      setFeedback({
        type: "error",
        message: "Operação bloqueada por segurança: A conta de Administrador Raiz (admin@lastasylum.br) é protegida contra exclusão."
      });
      return;
    }

    // 4. Proteção contra remoção do último ADM
    if (editFormState.role === "ADM") {
      const otherAdmins = users.filter((u) => u.role === "ADM" && u.id !== editFormState.id && u.email !== editFormState.email);
      if (otherAdmins.length === 0) {
        setFeedback({
          type: "error",
          message: "Operação bloqueada por segurança: Não é permitido excluir o único administrador ativo do portal."
        });
        return;
      }
    }

    const confirmDelete = window.confirm(
      `ATENÇÃO DE SEGURANÇA:\n\nDeseja realmente deletar a conta de "${editFormState.firstName} ${editFormState.lastName}" (${editFormState.email})?\n\nEsta operação é destrutiva e irreversível.`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const targetId = editFormState.id;
      if (isSupabaseConfigured) {
        const queryField = targetId.includes("@") ? "email" : "id";
        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq(queryField, targetId);
        if (error) throw error;
      } else {
        const filtered = users.filter((u) => u.id !== targetId);
        localStorage.setItem("local_profiles", JSON.stringify(filtered));
      }

      setUsers((prev) => prev.filter((u) => u.id !== targetId));
      setFeedback({ type: "success", message: `Conta de ${editFormState.firstName} (${editFormState.email}) foi removida com sucesso.` });
      handleCloseEditModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setFeedback({ type: "error", message: "Erro ao deletar conta de usuário: " + message });
    } finally {
      setIsDeleting(false);
    }
  };

  // CRIAR NOVO USUÁRIO COM VALIDAÇÃO ROBUSTA E SINCRONIZAÇÃO COMPLETA
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Verificação de Autorização
    if (!isAuthorizedAdmin) {
      setFeedback({ type: "error", message: "Ação não autorizada: Apenas administradores ADM podem cadastrar novos usuários." });
      return;
    }

    // 2. Sanitização
    const cleanEmail = sanitizeInput(newEmail, 100).toLowerCase();
    const cleanFirstName = sanitizeInput(newFirstName, 60);
    const cleanLastName = sanitizeInput(newLastName, 60);
    const cleanRegion = sanitizeInput(newRegion, 60);
    const cleanCharName = sanitizeInput(newCharacterName, 60);
    const cleanCharId = sanitizeInput(newCharacterId, 60);

    // 3. Validações Estritas
    if (!isValidEmail(cleanEmail)) {
      setFeedback({ type: "error", message: "Formato de e-mail inválido. Utilize um endereço válido como usuario@provedor.com." });
      return;
    }

    const passCheck = isValidPassword(newPassword);
    if (!passCheck.valid) {
      setFeedback({ type: "error", message: passCheck.message || "Senha inicial inválida." });
      return;
    }

    if (!cleanFirstName || cleanFirstName.length < 2) {
      setFeedback({ type: "error", message: "O nome deve conter no mínimo 2 caracteres." });
      return;
    }
    if (!cleanLastName || cleanLastName.length < 2) {
      setFeedback({ type: "error", message: "O sobrenome deve conter no mínimo 2 caracteres." });
      return;
    }
    if (!cleanRegion) {
      setFeedback({ type: "error", message: "A região geográfica é obrigatória." });
      return;
    }

    const birthCheck = isValidBirthDate(newBirthDate);
    if (!birthCheck.valid) {
      setFeedback({ type: "error", message: birthCheck.message || "Data de nascimento inválida." });
      return;
    }

    let parsedKingdom: number | null = null;
    if (newKingdomNumber.trim()) {
      const kNum = Number(newKingdomNumber);
      if (isNaN(kNum) || kNum < 1 || kNum > 999999) {
        setFeedback({ type: "error", message: "Número do reino inválido. Deve ser um número positivo entre 1 e 999999." });
        return;
      }
      parsedKingdom = kNum;
    }

    // Checagem de duplicação local
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      setFeedback({ type: "error", message: "Já existe um usuário cadastrado com este endereço de e-mail." });
      return;
    }

    try {
      const avatarUrl = getDeterministicHeroAvatar(cleanEmail);

      if (isSupabaseConfigured) {
        // Tenta registrar na autenticação com metadados
        let authUserId: string | undefined = undefined;
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: newPassword,
            options: {
              data: {
                first_name: cleanFirstName,
                last_name: cleanLastName,
                role: newRole,
                birth_date: newBirthDate,
                region: cleanRegion,
                character_name: cleanCharName || null,
                character_id: cleanCharId || null,
                kingdom_number: parsedKingdom,
                avatar_url: avatarUrl,
                receive_noticias: true,
                receive_guias: true,
                receive_codigos: true,
                receive_promocionais: true,
              },
            },
          });
          if (authError) {
            console.warn("Aviso na criação via Auth (inserindo diretamente em profiles):", authError.message);
          } else if (authData?.user) {
            authUserId = authData.user.id;
          }
        } catch (authErr) {
          console.warn("Auth signup error ignored, proceeding with profile record:", authErr);
        }

        // Insere ou atualiza na tabela profiles
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: authUserId,
            email: cleanEmail,
            first_name: cleanFirstName,
            last_name: cleanLastName,
            role: newRole,
            birth_date: newBirthDate,
            region: cleanRegion,
            character_name: cleanCharName || null,
            character_id: cleanCharId || null,
            kingdom_number: parsedKingdom,
            avatar_url: avatarUrl,
            receive_noticias: true,
            receive_guias: true,
            receive_codigos: true,
            receive_promocionais: true,
          });

        if (profileError) throw profileError;
      } else {
        const newUser: UserRecord = {
          id: cleanEmail,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          email: cleanEmail,
          role: newRole,
          birthDate: newBirthDate,
          region: cleanRegion,
          characterName: cleanCharName || undefined,
          characterId: cleanCharId || undefined,
          kingdomNumber: parsedKingdom || undefined,
          avatarUrl,
          createdAt: new Date().toISOString().split("T")[0]
        };
        const updated = [newUser, ...users];
        localStorage.setItem("local_profiles", JSON.stringify(updated));
      }

      await refreshUsers();

      // Limpeza de estado e destruição imediata da senha da memória
      setNewEmail("");
      setNewPassword("");
      setNewFirstName("");
      setNewLastName("");
      setNewBirthDate("");
      setNewRegion("");
      setNewCharacterName("");
      setNewCharacterId("");
      setNewKingdomNumber("");
      setNewRole("USER");
      setShowCreateForm(false);

      setFeedback({ type: "success", message: `Usuário ${cleanFirstName} (${cleanEmail}) cadastrado com sucesso com cargo ${newRole}!` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setFeedback({ type: "error", message: "Erro ao cadastrar usuário: " + message });
    }
  };

  // ALTERAR PERMISSÕES DA MATRIZ DINÂMICA COM SINCRONIZAÇÃO SUPABASE
  const handleToggleMatrix = async (pageId: string, role: UserRole) => {
    if (!isAuthorizedAdmin) {
      setFeedback({ type: "error", message: "Apenas administradores ADM possuem permissão para modificar a matriz de acessos." });
      return;
    }

    if (role === "ADM") return; // ADM possui acesso total irrestrito inalterável

    const targetPage = pageMatrix.find((p) => p.id === pageId);
    if (!targetPage) return;

    const alreadyAllowed = targetPage.allowedRoles.includes(role);
    const nextAllowed = alreadyAllowed
      ? targetPage.allowedRoles.filter((r) => r !== role)
      : [...targetPage.allowedRoles, role];

    const updated = pageMatrix.map((page) => {
      if (page.id === pageId) {
        return { ...page, allowedRoles: nextAllowed };
      }
      return page;
    });

    setPageMatrix(updated);
    localStorage.setItem("admin_page_permissions_matrix", JSON.stringify(updated));
    window.dispatchEvent(new Event("permissions_updated"));

    // Sincroniza com Supabase se configurado
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from("page_permissions")
          .upsert(
            {
              page_id: pageId,
              allowed_roles: nextAllowed,
            },
            { onConflict: "page_id" }
          );
      } catch (dbErr) {
        console.error("Erro ao sincronizar matriz de permissões no Supabase:", dbErr);
      }
    }
  };

  // GUARD DE SEGURANÇA: Bloqueia renderização se usuário não for ADM
  if (!isAuthorizedAdmin) {
    return (
      <div className="p-8 rounded-3xl bg-[#101623]/90 border border-red-500/30 text-center space-y-4 shadow-2xl animate-in fade-in duration-200">
        <span className="text-4xl block">🛡️🚫</span>
        <h2 className="text-xl font-extrabold text-red-400">Acesso Restrito ao Módulo Administrativo</h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Você está conectado como <strong>{activeSession?.email || "Usuário não autenticado"}</strong> ({activeSession?.role || "Sem Cargo"}). 
          Apenas administradores com cargo <strong>ADM</strong> possuem privilégios para gerenciar contas e matriz de permissões.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* BANNER DE FEEDBACK DINÂMICO DE SEGURANÇA */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : feedback.type === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">
              {feedback.type === "success" ? "✅" : feedback.type === "error" ? "⚠️" : "ℹ️"}
            </span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1"
            title="Fechar aviso"
          >
            ✕
          </button>
        </div>
      )}

      {/* CABEÇALHO DA SEÇÃO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#101623]/90 border border-red-500/30 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400 mb-2">
            <span>👑 Acesso Exclusivo ADM</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Gestão de Usuários & Níveis de Acesso</h2>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre novos usuários com validação estrita, edite perfis e gerencie a matriz de privilégios do portal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
        >
          {showCreateForm ? "✕ Fechar Cadastro" : "+ Criar Novo Usuário"}
        </button>
      </div>

      {/* FORMULÁRIO DE CADASTRO DE NOVO USUÁRIO */}
      {showCreateForm && (
        <div className="p-6 rounded-3xl bg-[#101623]/95 border border-slate-800 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Cadastrar Novo Usuário</h3>
            <span className="text-xs font-mono text-slate-400">* Campos obrigatórios</span>
          </div>

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                placeholder="Ex: Carlos"
                required
                maxLength={60}
                className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                Sobrenome *
              </label>
              <input
                type="text"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                placeholder="Ex: Silva"
                required
                maxLength={60}
                className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                E-mail *
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Ex: carlos.silva@lastasylum.br"
                required
                maxLength={100}
                className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                Senha Inicial * (Mínimo 8 caracteres)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                maxLength={100}
                className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={newBirthDate}
                onChange={(e) => setNewBirthDate(e.target.value)}
                required
                max={new Date().toISOString().split("T")[0]}
                className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                Região *
              </label>
              <input
                type="text"
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                placeholder="Ex: Sudeste"
                required
                maxLength={60}
                className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                Nome no Jogo (Opcional)
              </label>
              <input
                type="text"
                value={newCharacterName}
                onChange={(e) => setNewCharacterName(e.target.value)}
                placeholder="Ex: ShadowHunter"
                maxLength={60}
                className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                ID no Jogo & Reino (Opcional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newCharacterId}
                  onChange={(e) => setNewCharacterId(e.target.value)}
                  placeholder="ID: LA-12345"
                  maxLength={60}
                  className="w-full h-10 px-3 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  value={newKingdomNumber}
                  onChange={(e) => setNewKingdomNumber(e.target.value)}
                  placeholder="Reino: 42"
                  min={1}
                  max={999999}
                  className="w-full h-10 px-3 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                Cargo / Nível de Acesso *
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full h-10 px-4 text-xs font-bold text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              >
                {(Object.keys(ROLES_REGISTRY) as UserRole[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLES_REGISTRY[r].name} ({r}) - {ROLES_REGISTRY[r].description}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all cursor-pointer"
              >
                Salvar Cadastro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEÇÃO PRINCIPAL: TABELA DE USUÁRIOS COM BUSCA E PAGINAÇÃO */}
      <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 shadow-2xl space-y-6">
        
        {/* BARRA SUPERIOR: TÍTULO, CONTADOR E CAMPO DE PESQUISA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Usuários Cadastrados</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-emerald-400">
                {filteredUsers.length} {filteredUsers.length === 1 ? "registro" : "registros"}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Consulte a lista em formato de tabela e utilize o botão de lápis para editar ou remover contas.
            </p>
          </div>

          {/* CAMPO DE PESQUISA MULTI-ATRIBUTO */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por e-mail, nome, ID do jogo..."
              className="w-full h-10 pl-9 pr-8 text-xs text-white bg-slate-900/90 rounded-xl border border-slate-800 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
              🔍
            </span>
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-1"
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* TABELA DE USUÁRIOS */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-mono text-slate-400">Carregando base de usuários...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80">
            <span className="text-3xl block mb-2">👥</span>
            <p className="text-sm font-bold text-white">Nenhum usuário encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm ? "Tente buscar com outros termos." : "Não há usuários cadastrados no momento."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider whitespace-nowrap">
                  <th className="py-3.5 px-4">Usuário / Nome</th>
                  <th className="py-3.5 px-4">E-mail</th>
                  <th className="py-3.5 px-4">Personagem no Jogo</th>
                  <th className="py-3.5 px-4">Região</th>
                  <th className="py-3.5 px-4 text-center">Cargo</th>
                  <th className="py-3.5 px-4 text-center">Editar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {displayedUsers.map((u) => {
                  const roleDef = ROLES_REGISTRY[u.role] || ROLES_REGISTRY.USER;
                  const isSelf = isSelfAccount(u);
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                      {/* USUÁRIO / NOME */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={u.avatarUrl || getDeterministicHeroAvatar(u.email)}
                            alt={u.firstName}
                            width={36}
                            height={36}
                            unoptimized
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700 flex-shrink-0 bg-slate-900"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white block">
                                {u.firstName} {u.lastName}
                              </span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded bg-[#00ff88]/20 border border-[#00ff88]/40 text-[9px] font-mono text-[#00ff88] font-bold">
                                  Você
                                </span>
                              )}
                            </div>
                            {u.createdAt && (
                              <span className="text-[10px] font-mono text-slate-500 block">
                                Cadastrado: {u.createdAt}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* E-MAIL */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {u.email}
                      </td>

                      {/* PERSONAGEM & ID DO JOGO */}
                      <td className="py-3.5 px-4">
                        {u.characterName || u.characterId ? (
                          <div>
                            <span className="font-bold text-emerald-400 block">
                              {u.characterName || "Sem Nome"}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block">
                              {u.characterId ? `ID: ${u.characterId}` : ""}
                              {u.kingdomNumber ? ` • Reino #${u.kingdomNumber}` : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Não vinculado</span>
                        )}
                      </td>

                      {/* REGIÃO */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <span>{u.region || "—"}</span>
                        {u.birthDate && (
                          <span className="text-[10px] font-mono text-slate-500 block">
                            Nasc: {u.birthDate}
                          </span>
                        )}
                      </td>

                      {/* CARGO */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${roleDef.badgeColor}`}
                        >
                          {roleDef.name} ({u.role})
                        </span>
                      </td>

                      {/* AÇÕES: BOTÃO LÁPIS ÚNICO */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(u)}
                          className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 inline-flex items-center justify-center transition-all shadow-[0_0_8px_rgba(245,158,11,0.15)] hover:scale-105 active:scale-95 cursor-pointer"
                          title={`Editar informações de ${u.firstName}`}
                          aria-label={`Editar usuário ${u.firstName}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTROLES DE PAGINAÇÃO (MÁXIMO DE 10 REGISTROS POR PÁGINA) */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-mono text-slate-400">
              Mostrando <strong className="text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> a{" "}
              <strong className="text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</strong> de{" "}
              <strong className="text-white">{filteredUsers.length}</strong> cadastros
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition-all cursor-pointer"
                >
                  ← Anterior
                </button>

                <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                  Página <strong className="text-emerald-400">{currentPage}</strong> de {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition-all cursor-pointer"
                >
                  Próxima →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE EDIÇÃO DE USUÁRIO & EXCLUSÃO */}
      {editingUser && editFormState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl rounded-3xl bg-[#0e1420] border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CABEÇALHO DO MODAL */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Image
                  src={editFormState.avatarUrl || getDeterministicHeroAvatar(editFormState.email)}
                  alt="Avatar"
                  width={48}
                  height={48}
                  unoptimized
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-700 bg-slate-900"
                />
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Editar Usuário</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        ROLES_REGISTRY[editFormState.role]?.badgeColor || ""
                      }`}
                    >
                      {ROLES_REGISTRY[editFormState.role]?.name || editFormState.role}
                    </span>
                    {isSelfAccount(editFormState) && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#00ff88]/20 border border-[#00ff88]/40 text-[#00ff88]">
                        Sua Conta Ativa
                      </span>
                    )}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">{editFormState.email}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={isSaving || isDeleting}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* AVISO DE CONTA PRÓPRIA NO MODAL */}
            {isSelfAccount(editFormState) && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>
                  Você está editando a sua própria conta ativa de administrador. A alteração de cargo afetará sua sessão atual. A exclusão de sua própria conta está desabilitada por segurança.
                </span>
              </div>
            )}

            {/* FORMULÁRIO DE EDIÇÃO */}
            <form onSubmit={handleSaveUserEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NOME */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={editFormState.firstName}
                    onChange={(e) => setEditFormState({ ...editFormState, firstName: e.target.value })}
                    required
                    maxLength={60}
                    className="w-full h-10 px-3.5 text-xs text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* SOBRENOME */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                    Sobrenome *
                  </label>
                  <input
                    type="text"
                    value={editFormState.lastName}
                    onChange={(e) => setEditFormState({ ...editFormState, lastName: e.target.value })}
                    required
                    maxLength={60}
                    className="w-full h-10 px-3.5 text-xs text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* E-MAIL (SOMENTE LEITURA / IDENTIFICADOR) */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={editFormState.email}
                    disabled
                    className="w-full h-10 px-3.5 text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800/80 cursor-not-allowed font-mono"
                  />
                </div>

                {/* CARGO */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                    Cargo / Nível de Acesso *
                  </label>
                  <select
                    value={editFormState.role}
                    onChange={(e) => setEditFormState({ ...editFormState, role: e.target.value as UserRole })}
                    className="w-full h-10 px-3.5 text-xs font-bold text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    {(Object.keys(ROLES_REGISTRY) as UserRole[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLES_REGISTRY[r].name} ({r})
                      </option>
                    ))}
                  </select>
                </div>

                {/* DATA DE NASCIMENTO */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    value={editFormState.birthDate}
                    onChange={(e) => setEditFormState({ ...editFormState, birthDate: e.target.value })}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full h-10 px-3.5 text-xs text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* REGIÃO */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                    Região *
                  </label>
                  <input
                    type="text"
                    value={editFormState.region}
                    onChange={(e) => setEditFormState({ ...editFormState, region: e.target.value })}
                    required
                    maxLength={60}
                    className="w-full h-10 px-3.5 text-xs text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* DADOS DO JOGO */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                    Nome do Personagem no Jogo
                  </label>
                  <input
                    type="text"
                    value={editFormState.characterName || ""}
                    onChange={(e) => setEditFormState({ ...editFormState, characterName: e.target.value })}
                    placeholder="Ex: HunterKing"
                    maxLength={60}
                    className="w-full h-10 px-3.5 text-xs text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                    ID no Jogo & Reino
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editFormState.characterId || ""}
                      onChange={(e) => setEditFormState({ ...editFormState, characterId: e.target.value })}
                      placeholder="ID: LA-12345"
                      maxLength={60}
                      className="w-full h-10 px-3 text-xs text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="number"
                      value={editFormState.kingdomNumber || ""}
                      onChange={(e) =>
                        setEditFormState({
                          ...editFormState,
                          kingdomNumber: e.target.value ? Number(e.target.value) : undefined
                        })
                      }
                      placeholder="Reino: 42"
                      min={1}
                      max={999999}
                      className="w-full h-10 px-3 text-xs text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* RODAPÉ DO MODAL: AÇÕES */}
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                {isSelfAccount(editFormState) || isRootAdminAccount(editFormState) ? (
                  <button
                    type="button"
                    disabled
                    title={
                      isSelfAccount(editFormState)
                        ? "Você não pode excluir sua própria conta de administrador em uso."
                        : "Conta de Administrador Raiz protegida contra exclusão."
                    }
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800/50 text-slate-500 border border-slate-800 text-xs font-bold cursor-not-allowed opacity-60"
                  >
                    🔒 Exclusão Protegida
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDeleteUserFromModal}
                    disabled={isDeleting || isSaving}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? "Deletando..." : "🗑️ Deletar Conta"}
                  </button>
                )}

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    disabled={isSaving || isDeleting}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || isDeleting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? "Salvando..." : "💾 Salvar Alterações"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEÇÃO DE ALTERAÇÃO DE ACESSOS (MATRIZ DINÂMICA DE PERMISSÕES) */}
      <div className="p-6 rounded-3xl bg-[#101623]/80 border border-slate-800 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-1">Alterar Acessos por Cargo</h3>
        <p className="text-xs text-slate-400 mb-6">
          Selecione as caixas abaixo para conceder ou revogar o acesso de cada nível de privilégio aos respectivos módulos administrativos em tempo real.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono">
                <th className="py-3 px-4">Página / Módulo</th>
                {(Object.keys(ROLES_REGISTRY) as UserRole[]).map((r) => (
                  <th key={r} className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full border ${ROLES_REGISTRY[r].badgeColor}`}>
                      {ROLES_REGISTRY[r].shortName}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {pageMatrix.map((page) => (
                <tr key={page.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span>{page.icon}</span>
                    <span>{page.label}</span>
                  </td>
                  {(Object.keys(ROLES_REGISTRY) as UserRole[]).map((r) => {
                    const isAllowed = page.allowedRoles.includes(r);
                    return (
                      <td key={r} className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={r === "ADM" ? true : isAllowed}
                          disabled={r === "ADM"}
                          onChange={() => void handleToggleMatrix(page.id, r)}
                          className="w-4 h-4 accent-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
