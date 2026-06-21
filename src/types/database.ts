export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          locale: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          website: string | null;
          description: string | null;
          industry: string | null;
          city: string | null;
          country: string;
          target_customer: string | null;
          monthly_revenue_range: string | null;
          team_size: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          website?: string | null;
          description?: string | null;
          industry?: string | null;
          city?: string | null;
          country?: string;
          target_customer?: string | null;
          monthly_revenue_range?: string | null;
          team_size?: string | null;
        };
        Update: {
          name?: string;
          website?: string | null;
          description?: string | null;
          industry?: string | null;
          city?: string | null;
          target_customer?: string | null;
          monthly_revenue_range?: string | null;
          team_size?: string | null;
        };
        Relationships: [];
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          company_id: string | null;
          what_they_sell: string;
          target_market: string;
          location: string;
          status: string;
          growth_score: number | null;
          total_opportunities: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id?: string | null;
          what_they_sell: string;
          target_market: string;
          location: string;
          status?: string;
          growth_score?: number | null;
          total_opportunities?: number;
        };
        Update: {
          status?: string;
          growth_score?: number | null;
          total_opportunities?: number;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          analysis_id: string;
          user_id: string;
          title: string;
          description: string;
          why_it_matches: string;
          revenue_potential: number;
          confidence_score: number;
          recommended_action: string;
          is_locked: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          user_id: string;
          title: string;
          description: string;
          why_it_matches: string;
          revenue_potential: number;
          confidence_score: number;
          recommended_action: string;
          is_locked?: boolean;
          sort_order?: number;
        };
        Update: {
          is_locked?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      prospects: {
        Row: {
          id: string;
          user_id: string;
          analysis_id: string | null;
          company_name: string;
          industry: string;
          fit_score: number;
          location: string;
          why_they_match: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          analysis_id?: string | null;
          company_name: string;
          industry: string;
          fit_score: number;
          location: string;
          why_they_match: string;
        };
        Update: {
          fit_score?: number;
        };
        Relationships: [];
      };
      competitors: {
        Row: {
          id: string;
          user_id: string;
          analysis_id: string | null;
          name: string;
          strength: string;
          weakness: string;
          suggested_advantage: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          analysis_id?: string | null;
          name: string;
          strength: string;
          weakness: string;
          suggested_advantage: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      insights: {
        Row: {
          id: string;
          user_id: string;
          analysis_id: string | null;
          market_trend: string;
          recommended_action: string;
          growth_opportunity: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          analysis_id?: string | null;
          market_trend: string;
          recommended_action: string;
          growth_opportunity: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          status: string;
          price_sar: number;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: string;
          status?: string;
          price_sar?: number;
        };
        Update: {
          plan?: string;
          status?: string;
          price_sar?: number;
        };
        Relationships: [];
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          metadata?: Json;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      demo_requests: {
        Row: {
          id: string;
          name: string;
          company_name: string;
          whatsapp: string;
          business_type: string;
          city: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company_name: string;
          whatsapp: string;
          business_type: string;
          city: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Analysis = Database["public"]["Tables"]["analyses"]["Row"];
export type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
export type Prospect = Database["public"]["Tables"]["prospects"]["Row"];
export type Competitor = Database["public"]["Tables"]["competitors"]["Row"];
export type Insight = Database["public"]["Tables"]["insights"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type DemoRequest = Database["public"]["Tables"]["demo_requests"]["Row"];
