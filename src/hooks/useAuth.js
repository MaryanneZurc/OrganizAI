import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica sessão ativa ao carregar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Função de login
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    toast.success("Login realizado com sucesso!");
  };

  // Função de cadastro
  const register = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }, // vai para raw_user_meta_data
      },
    });
    if (error) throw error;
    toast.success("Conta criada! Verifique seu e‑mail (se exigido).");
  };

  // Função de logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success("Até logo!");
  };

  return { user, loading, login, register, logout };
}
