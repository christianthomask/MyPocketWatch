export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          plaid_transaction_id: string;
          date: string;
          merchant_name: string;
          amount: number;
          category: string;
          subcategory: string | null;
          plaid_categories: string[] | null;
          plaid_merchant_id: string | null;
          pending: boolean;
          analyzed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plaid_transaction_id: string;
          date: string;
          merchant_name: string;
          amount: number;
          category: string;
          subcategory?: string | null;
          plaid_categories?: string[] | null;
          plaid_merchant_id?: string | null;
          pending?: boolean;
          analyzed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plaid_transaction_id?: string;
          date?: string;
          merchant_name?: string;
          amount?: number;
          category?: string;
          subcategory?: string | null;
          plaid_categories?: string[] | null;
          plaid_merchant_id?: string | null;
          pending?: boolean;
          analyzed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          category: string;
          monthly_limit: number;
          is_essential: boolean;
          is_frozen: boolean;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          monthly_limit: number;
          is_essential?: boolean;
          is_frozen?: boolean;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          monthly_limit?: number;
          is_essential?: boolean;
          is_frozen?: boolean;
          notes?: string | null;
          updated_at?: string;
        };
      };
      merchant_categories: {
        Row: {
          id: string;
          merchant_pattern: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          merchant_pattern: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          merchant_pattern?: string;
          category?: string;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          transaction_id: string | null;
          severity: 'info' | 'nudge' | 'warning' | 'urgent';
          message: string;
          budget_note: string | null;
          acknowledged: boolean;
          delivered: boolean;
          delivery_method: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id?: string | null;
          severity: 'info' | 'nudge' | 'warning' | 'urgent';
          message: string;
          budget_note?: string | null;
          acknowledged?: boolean;
          delivered?: boolean;
          delivery_method?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string | null;
          severity?: 'info' | 'nudge' | 'warning' | 'urgent';
          message?: string;
          budget_note?: string | null;
          acknowledged?: boolean;
          delivered?: boolean;
          delivery_method?: string | null;
          created_at?: string;
        };
      };
      weekly_reports: {
        Row: {
          id: string;
          week_start: string;
          week_end: string;
          total_spent: number;
          report_data: Json;
          summary: string;
          wins: string[] | null;
          concerns: string[] | null;
          suggestion: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          week_start: string;
          week_end: string;
          total_spent: number;
          report_data: Json;
          summary: string;
          wins?: string[] | null;
          concerns?: string[] | null;
          suggestion?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          week_start?: string;
          week_end?: string;
          total_spent?: number;
          report_data?: Json;
          summary?: string;
          wins?: string[] | null;
          concerns?: string[] | null;
          suggestion?: string | null;
          created_at?: string;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          endpoint: string;
          keys_p256dh: string;
          keys_auth: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          endpoint: string;
          keys_p256dh: string;
          keys_auth: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          endpoint?: string;
          keys_p256dh?: string;
          keys_auth?: string;
          active?: boolean;
          created_at?: string;
        };
      };
      plaid_connections: {
        Row: {
          id: string;
          item_id: string;
          access_token: string;
          cursor: string | null;
          institution_name: string;
          last_synced_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          access_token: string;
          cursor?: string | null;
          institution_name?: string;
          last_synced_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          access_token?: string;
          cursor?: string | null;
          institution_name?: string;
          last_synced_at?: string | null;
          created_at?: string;
        };
      };
      settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
    };
    Views: {
      budget_status: {
        Row: {
          category: string;
          monthly_limit: number;
          is_essential: boolean;
          is_frozen: boolean;
          spent_this_month: number;
          remaining: number;
          pct_used: number;
          day_of_month: number;
          days_in_month: number;
        };
      };
    };
    Functions: {
      alerts_in_window: {
        Args: { hours_back: number };
        Returns: number;
      };
    };
  };
}

// Convenience type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Named row types for easy import
export type Transaction = Tables<'transactions'>;
export type Budget = Tables<'budgets'>;
export type MerchantCategory = Tables<'merchant_categories'>;
export type Alert = Tables<'alerts'>;
export type WeeklyReport = Tables<'weekly_reports'>;
export type PushSubscription = Tables<'push_subscriptions'>;
export type PlaidConnection = Tables<'plaid_connections'>;
export type Settings = Tables<'settings'>;
export type BudgetStatus = Database['public']['Views']['budget_status']['Row'];
