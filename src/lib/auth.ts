import { supabase, isSupabaseConfigured } from "./supabase";
import { UserRole } from "./permissions";

export interface UserSession {
  id?: string;
  email: string;
  role: UserRole;
  authenticatedAt: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  birthDate?: string;
  region?: string;
  characterName?: string;
  characterId?: string;
  kingdomNumber?: number;
  useCharacterName?: boolean;
}

const LOCAL_STORAGE_KEY = "last_asylum_admin_session";

// Lista de URLs fixas de imagens dos heróis para fallback
export const HERO_AVATARS = [
  "https://lastasylumplague.com/wp-content/uploads/2026/04/nicole-full-image-300x266.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/annie-full-image-226x300.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/marlena-full-image-300x281.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/jester-full-image-275x300.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/red-lady-full-image-284x300.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/billy-full-image-300x289.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/cynthia-full-image-247x300.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/zoya-full-image-281x300.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/bell-full-image-285x300.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/harper-full-image-296x300.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/brian-full-image-292x300.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/louis-full-image-290x300.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/shadow-full-image-300x245.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/daskal-last-asylum-plague.webp",
  "https://lastasylumplague.com/wp-content/uploads/2026/03/arthur-last-asylum-plague.webp",
];

/**
 * Retorna uma imagem determinística a partir do e-mail do usuário
 */
export function getDeterministicHeroAvatar(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % HERO_AVATARS.length;
  return HERO_AVATARS[index];
}

// DEMO / FALLBACK ADMIN CREDENTIALS FOR DEVELOPMENT
export const DEMO_ADMIN_EMAIL = "admin@lastasylum.br";
export const DEMO_ADMIN_PASS = "admin123";

/**
 * Tenta realizar o login via Supabase ou via Fallback Local
 */
export async function loginAdmin(
  email: string,
  pass: string
): Promise<{ success: boolean; error?: string; session?: UserSession }> {
  // SE O SUPABASE ESTIVER CONFIGURADO COM CHAVES REAIS, USA SUPABASE AUTH
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        let session = await getUserSessionFromDb(data.user.email || email, data.user.id);
        
        if (!session) {
          const userRole = (data.user.user_metadata?.role as UserRole) || "USER";
          session = {
            id: data.user.id,
            email: data.user.email || email,
            role: userRole,
            authenticatedAt: new Date().toISOString(),
            firstName: data.user.user_metadata?.first_name || "",
            lastName: data.user.user_metadata?.last_name || "",
            avatarUrl: data.user.user_metadata?.avatar_url || getDeterministicHeroAvatar(data.user.email || email),
            birthDate: data.user.user_metadata?.birth_date || "",
            region: data.user.user_metadata?.region || "",
          };
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
        return { success: true, session };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro na autenticação do Supabase.";
      return { success: false, error: message };
    }
  }

  // FALLBACK DE DESENVOLVIMENTO (QUANDO AINDA NÃO HÁ CHAVES NO .env.local)
  if (process.env.NODE_ENV === "production") {
    return {
      success: false,
      error: "Credenciais inválidas. Verifique o e-mail e a senha informados.",
    };
  }

  if (email.trim().toLowerCase() === DEMO_ADMIN_EMAIL && pass === DEMO_ADMIN_PASS) {
    const session: UserSession = {
      email: DEMO_ADMIN_EMAIL,
      role: "ADM",
      authenticatedAt: new Date().toISOString(),
      firstName: "Fernando",
      lastName: "Silva",
      avatarUrl: getDeterministicHeroAvatar(DEMO_ADMIN_EMAIL),
      birthDate: "1990-05-15",
      region: "Sudeste",
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
    return { success: true, session };
  }

  return {
    success: false,
    error: "Credenciais inválidas. Verifique o e-mail e a senha informados.",
  };
}

/**
 * Envia um e-mail de recuperação de senha (Supabase ou Fallback Demo)
 */
export async function resetAdminPassword(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?view=reset-password`,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro no envio do e-mail de recuperação.";
      return { success: false, error: message };
    }
  }

  // Fallback demo
  if (email.trim().toLowerCase() === DEMO_ADMIN_EMAIL) {
    return { success: true };
  }

  return {
    success: false,
    error: "E-mail não encontrado no sistema.",
  };
}

/**
 * Atualiza a senha do usuário autenticado no Supabase
 */
export async function updateUserPassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar a senha.";
      return { success: false, error: message };
    }
  }
  return { success: true };
}

/**
 * Atualiza o cargo da sessão atual para testes rápidos
 */
export function updateSessionRole(newRole: UserRole): UserSession | null {
  const current = getSavedSession();
  if (!current) return null;

  const updated: UserSession = {
    ...current,
    role: newRole,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Atualiza o e-mail da sessão atual para persistência local
 */
export function updateSessionEmail(newEmail: string): UserSession | null {
  const current = getSavedSession();
  if (!current) return null;

  const updated: UserSession = {
    ...current,
    email: newEmail,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Atualiza as informações do perfil do usuário na sessão persistida
 */
export function updateSessionProfile(updates: Partial<UserSession>): UserSession | null {
  const current = getSavedSession();
  if (!current) return null;

  const updated: UserSession = {
    ...current,
    ...updates,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Obtém a sessão salva no localStorage
 */
export function getSavedSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return null;
    const session = JSON.parse(data) as UserSession;
    // Normalização de papéisLegados/indefinidos para "ADM"
    if (!session.role || session.role === ("administrator" as any)) {
      session.role = "ADM";
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Efetua o logout do administrador
 */
export async function logoutAdmin(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

/**
 * Retorna o e-mail formatado de forma resumida (ex: fer***@hotmail.com)
 */
export function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  if (local.length <= 3) {
    return `${local}***@${domain}`;
  }
  return `${local.substring(0, 3)}***@${domain}`;
}

/**
 * Obtém a sessão do usuário com base no perfil do banco de dados
 */
export async function getUserSessionFromDb(email: string, userUuid: string): Promise<UserSession | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userUuid)
      .single();

    if (error || !profile) {
      const { data: profileByEmail } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();
      
      if (profileByEmail) {
        return {
          id: profileByEmail.id,
          email: profileByEmail.email,
          role: profileByEmail.role as UserRole,
          authenticatedAt: new Date().toISOString(),
          firstName: profileByEmail.first_name,
          lastName: profileByEmail.last_name,
          avatarUrl: profileByEmail.avatar_url,
          birthDate: profileByEmail.birth_date,
          region: profileByEmail.region,
          characterName: profileByEmail.character_name || undefined,
          characterId: profileByEmail.character_id || undefined,
          kingdomNumber: profileByEmail.kingdom_number || undefined,
          useCharacterName: profileByEmail.use_character_name || false,
        };
      }
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole,
      authenticatedAt: new Date().toISOString(),
      firstName: profile.first_name,
      lastName: profile.last_name,
      avatarUrl: profile.avatar_url,
      birthDate: profile.birth_date,
      region: profile.region,
      characterName: profile.character_name || undefined,
      characterId: profile.character_id || undefined,
      kingdomNumber: profile.kingdom_number || undefined,
      useCharacterName: profile.use_character_name || false,
    };
  } catch (err) {
    console.error("Erro ao carregar perfil do banco:", err);
    return null;
  }
}

/**
 * Cadastra um novo usuário no Supabase Auth com metadados básicos
 */
export async function signUpUser(
  email: string,
  pass: string,
  firstName: string,
  lastName: string,
  birthDate: string,
  region: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const avatarUrl = getDeterministicHeroAvatar(email);
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
            region: region,
            role: "USER",
            avatar_url: avatarUrl,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro no cadastro do Supabase.";
      return { success: false, error: message };
    }
  }

  // Fallback demo local se Supabase não estiver configurado
  const stored = localStorage.getItem("local_profiles");
  const localUsers = stored ? JSON.parse(stored) : [];
  if (localUsers.some((u: any) => u.email === email.trim().toLowerCase())) {
    return { success: false, error: "E-mail já cadastrado no sistema local." };
  }

  const newUser = {
    id: email.trim().toLowerCase(),
    firstName,
    lastName,
    email: email.trim().toLowerCase(),
    role: "USER" as UserRole,
    birthDate,
    region,
    createdAt: new Date().toISOString().split("T")[0],
    avatarUrl: getDeterministicHeroAvatar(email),
  };
  localStorage.setItem("local_profiles", JSON.stringify([...localUsers, newUser]));
  return { success: true };
}

/**
 * Atualiza o perfil do jogador no banco de dados e sincroniza com a sessão local
 */
export async function updateProfileInDatabase(
  userId: string,
  updates: {
    characterName?: string;
    characterId?: string;
    kingdomNumber?: number;
    useCharacterName?: boolean;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    region?: string;
  }
): Promise<{ success: boolean; error?: string; session?: UserSession }> {
  try {
    if (isSupabaseConfigured) {
      const dbUpdates: any = {
        character_name: updates.characterName,
        character_id: updates.characterId,
        kingdom_number: updates.kingdomNumber,
        use_character_name: updates.useCharacterName,
      };
      if (updates.firstName) dbUpdates.first_name = updates.firstName;
      if (updates.lastName) dbUpdates.last_name = updates.lastName;
      if (updates.birthDate) dbUpdates.birth_date = updates.birthDate;
      if (updates.region) dbUpdates.region = updates.region;

      const queryField = userId.includes("@") ? "email" : "id";
      const { error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq(queryField, userId);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    // Atualiza na sessão local
    const sessionUpdates: Partial<UserSession> = {
      characterName: updates.characterName,
      characterId: updates.characterId,
      kingdomNumber: updates.kingdomNumber,
      useCharacterName: updates.useCharacterName,
    };

    if (isSupabaseConfigured) {
      try {
        const queryField = userId.includes("@") ? "email" : "id";
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq(queryField, userId)
          .single();
        if (profile) {
          sessionUpdates.id = profile.id;
        }
      } catch (e) {
        console.error("Erro ao enriquecer sessão com id:", e);
      }
    }
    if (updates.firstName) sessionUpdates.firstName = updates.firstName;
    if (updates.lastName) sessionUpdates.lastName = updates.lastName;
    if (updates.birthDate) sessionUpdates.birthDate = updates.birthDate;
    if (updates.region) sessionUpdates.region = updates.region;

    const updatedSession = updateSessionProfile(sessionUpdates);
    if (updatedSession) {
      return { success: true, session: updatedSession };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao atualizar perfil.";
    return { success: false, error: message };
  }
}
