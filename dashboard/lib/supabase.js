import { createClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_SUPABASE_URL에 /rest/v1 등 API 하위 경로가 실수로 포함된 경우
// 제거해서 createClient()가 기대하는 프로젝트 base URL로 만든다.
// (automation/rp/generate_rp.py의 clean_supabase_url()과 동일한 목적)
function cleanSupabaseUrl(url) {
  let cleaned = (url || "").trim().replace(/\/+$/, "");
  for (const suffix of ["/rest/v1", "/storage/v1", "/auth/v1", "/functions/v1"]) {
    if (cleaned.endsWith(suffix)) {
      cleaned = cleaned.slice(0, -suffix.length);
    }
  }
  return cleaned;
}

const supabaseUrl = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
