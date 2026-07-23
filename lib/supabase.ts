import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL as string;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url || !key) {
  // Só avisa em runtime, não quebra o build
  console.warn("[supabase] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.");
}

// Usamos a service_role key porque todas as chamadas passam pelas nossas
// próprias API routes (protegidas por senha via cookie), então o Supabase
// nunca é exposto direto pro navegador.
export const supabase = createClient(url, key, {
  auth: { persistSession: false }
});
