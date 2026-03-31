import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
      throw new Error(
        "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
      );
    }

    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

// Types for VidSense AI
declare module "@supabase/supabase-js" {
  interface Database {
    public: {
      Tables: {
        users: {
          Row: {
            id: string;
            email: string;
            credit_balance: number;
            sociabuzz_email: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            email: string;
            credit_balance?: number;
            sociabuzz_email?: string | null;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            email?: string;
            credit_balance?: number;
            sociabuzz_email?: string | null;
            updated_at?: string;
          };
        };
        analysis_history: {
          Row: {
            id: string;
            user_id: string;
            video_url: string;
            video_title: string | null;
            positive_count: number;
            negative_count: number;
            neutral_count: number;
            credits_used: number;
            created_at: string;
          };
          Insert: {
            id?: string;
            user_id: string;
            video_url: string;
            video_title?: string | null;
            positive_count: number;
            negative_count: number;
            neutral_count: number;
            credits_used: number;
            created_at?: string;
          };
        };
        transactions: {
          Row: {
            id: string;
            user_id: string;
            type: "credit_purchase" | "analysis" | "refund";
            amount: number;
            description: string;
            created_at: string;
          };
          Insert: {
            id?: string;
            user_id: string;
            type: "credit_purchase" | "analysis" | "refund";
            amount: number;
            description: string;
            created_at?: string;
          };
        };
      };
    };
  }
}
