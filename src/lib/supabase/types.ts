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
        Relationships: [
          {
            foreignKeyName: '';
            columns: [];
            isOneToOne: false;
            referencedRelation: '';
            referencedColumns: [];
          },
        ];
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
        Relationships: [];
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
        Relationships: [];
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
          domain: string;
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
          domain?: string;
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
          domain?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'alerts_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      daily_checkins: {
        Row: {
          id: string;
          date: string;
          bible_reading: boolean;
          bible_reading_notes: string | null;
          meeting_attended: boolean;
          meeting_name: string | null;
          ministry_hours: number;
          ministry_notes: string | null;
          gym_completed: boolean;
          gym_workout: string | null;
          gym_duration_minutes: number | null;
          meals_cooked: number;
          meals_eaten_out: number;
          packed_lunch: boolean;
          water_glasses: number;
          bedtime: string | null;
          waketime: string | null;
          sleep_quality: number | null;
          phone_away_by_930: boolean;
          coding_minutes: number;
          coding_project: string | null;
          learning_minutes: number;
          learning_topic: string | null;
          writing_minutes: number;
          dnd_prep_minutes: number;
          mood: number | null;
          daily_win: string | null;
          daily_struggle: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          bible_reading?: boolean;
          bible_reading_notes?: string | null;
          meeting_attended?: boolean;
          meeting_name?: string | null;
          ministry_hours?: number;
          ministry_notes?: string | null;
          gym_completed?: boolean;
          gym_workout?: string | null;
          gym_duration_minutes?: number | null;
          meals_cooked?: number;
          meals_eaten_out?: number;
          packed_lunch?: boolean;
          water_glasses?: number;
          bedtime?: string | null;
          waketime?: string | null;
          sleep_quality?: number | null;
          phone_away_by_930?: boolean;
          coding_minutes?: number;
          coding_project?: string | null;
          learning_minutes?: number;
          learning_topic?: string | null;
          writing_minutes?: number;
          dnd_prep_minutes?: number;
          mood?: number | null;
          daily_win?: string | null;
          daily_struggle?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          bible_reading?: boolean;
          bible_reading_notes?: string | null;
          meeting_attended?: boolean;
          meeting_name?: string | null;
          ministry_hours?: number;
          ministry_notes?: string | null;
          gym_completed?: boolean;
          gym_workout?: string | null;
          gym_duration_minutes?: number | null;
          meals_cooked?: number;
          meals_eaten_out?: number;
          packed_lunch?: boolean;
          water_glasses?: number;
          bedtime?: string | null;
          waketime?: string | null;
          sleep_quality?: number | null;
          phone_away_by_930?: boolean;
          coding_minutes?: number;
          coding_project?: string | null;
          learning_minutes?: number;
          learning_topic?: string | null;
          writing_minutes?: number;
          dnd_prep_minutes?: number;
          mood?: number | null;
          daily_win?: string | null;
          daily_struggle?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      streaks: {
        Row: {
          id: string;
          habit: string;
          current_streak: number;
          longest_streak: number;
          last_completed: string | null;
          total_completions: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          habit: string;
          current_streak?: number;
          longest_streak?: number;
          last_completed?: string | null;
          total_completions?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          habit?: string;
          current_streak?: number;
          longest_streak?: number;
          last_completed?: string | null;
          total_completions?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_schedule: {
        Row: {
          id: string;
          name: string;
          domain: string;
          cron_hour: number;
          cron_minute: number;
          days_of_week: number[];
          messages: string[];
          message_index: number;
          active: boolean;
          last_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain: string;
          cron_hour: number;
          cron_minute: number;
          days_of_week?: number[];
          messages: string[];
          message_index?: number;
          active?: boolean;
          last_sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string;
          cron_hour?: number;
          cron_minute?: number;
          days_of_week?: number[];
          messages?: string[];
          message_index?: number;
          active?: boolean;
          last_sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          domain: string;
          title: string;
          description: string | null;
          target_value: number | null;
          current_value: number;
          unit: string | null;
          target_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          domain: string;
          title: string;
          description?: string | null;
          target_value?: number | null;
          current_value?: number;
          unit?: string | null;
          target_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          domain?: string;
          title?: string;
          description?: string | null;
          target_value?: number | null;
          current_value?: number;
          unit?: string | null;
          target_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ministry_log: {
        Row: {
          id: string;
          date: string;
          hours: number;
          type: string;
          placements: number;
          return_visits: number;
          bible_studies: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          hours: number;
          type?: string;
          placements?: number;
          return_visits?: number;
          bible_studies?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          hours?: number;
          type?: string;
          placements?: number;
          return_visits?: number;
          bible_studies?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
      weekly_stats: {
        Row: {
          week_start: string;
          days_checked_in: number;
          bible_days: number;
          gym_days: number;
          packed_lunch_days: number;
          phone_away_days: number;
          total_meals_cooked: number;
          total_meals_out: number;
          total_coding_minutes: number;
          total_writing_minutes: number;
          total_ministry_hours: number;
          avg_mood: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      alerts_in_window: {
        Args: { hours_back: number };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
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
export type DailyCheckin = Tables<'daily_checkins'>;
export type Streak = Tables<'streaks'>;
export type NotificationScheduleRow = Tables<'notification_schedule'>;
export type WeeklyStats = Database['public']['Views']['weekly_stats']['Row'];
export type Goal = Tables<'goals'>;
export type MinistryLog = Tables<'ministry_log'>;
