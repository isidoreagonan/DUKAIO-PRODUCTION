export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      automations: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string
          creator_id: string
          id: string
          is_active: boolean
          name: string
          trigger_event: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string
          creator_id: string
          id?: string
          is_active?: boolean
          name: string
          trigger_event: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string
          creator_id?: string
          id?: string
          is_active?: boolean
          name?: string
          trigger_event?: string
        }
        Relationships: []
      }
      badge_eligibility_scans: {
        Row: {
          ai_reasoning: string | null
          ai_score: number | null
          computed_grade: Database["public"]["Enums"]["badge_grade"] | null
          id: string
          is_eligible: boolean
          kyc_verified: boolean
          positive_reviews: number
          sales_last_30d: number
          scanned_at: string
          total_revenue: number
          user_id: string
          visits_last_30d: number
        }
        Insert: {
          ai_reasoning?: string | null
          ai_score?: number | null
          computed_grade?: Database["public"]["Enums"]["badge_grade"] | null
          id?: string
          is_eligible?: boolean
          kyc_verified?: boolean
          positive_reviews?: number
          sales_last_30d?: number
          scanned_at?: string
          total_revenue?: number
          user_id: string
          visits_last_30d?: number
        }
        Update: {
          ai_reasoning?: string | null
          ai_score?: number | null
          computed_grade?: Database["public"]["Enums"]["badge_grade"] | null
          id?: string
          is_eligible?: boolean
          kyc_verified?: boolean
          positive_reviews?: number
          sales_last_30d?: number
          scanned_at?: string
          total_revenue?: number
          user_id?: string
          visits_last_30d?: number
        }
        Relationships: []
      }
      badge_subscriptions: {
        Row: {
          amount: number
          badge_id: string | null
          created_at: string
          grade: Database["public"]["Enums"]["badge_grade"]
          id: string
          moneroo_transaction_id: string | null
          paid_at: string | null
          period_end: string
          period_start: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          badge_id?: string | null
          created_at?: string
          grade: Database["public"]["Enums"]["badge_grade"]
          id?: string
          moneroo_transaction_id?: string | null
          paid_at?: string | null
          period_end: string
          period_start: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          badge_id?: string | null
          created_at?: string
          grade?: Database["public"]["Enums"]["badge_grade"]
          id?: string
          moneroo_transaction_id?: string | null
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      buyer_otps: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
      cart_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          product_id: string | null
          session_id: string | null
          store_owner_id: string
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          product_id?: string | null
          session_id?: string | null
          store_owner_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          product_id?: string | null
          session_id?: string | null
          store_owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          position: number
          product_id: string
          title: string
          updated_at: string
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          position?: number
          product_id: string
          title: string
          updated_at?: string
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          position?: number
          product_id?: string
          title?: string
          updated_at?: string
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      currency_conversions: {
        Row: {
          ai_analysis: Json | null
          ai_source: string | null
          amount_fcfa: number
          amount_usd: number
          completed_at: string | null
          created_at: string
          id: string
          rate_used: number
          status: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          ai_source?: string | null
          amount_fcfa: number
          amount_usd: number
          completed_at?: string | null
          created_at?: string
          id?: string
          rate_used: number
          status?: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          ai_source?: string | null
          amount_fcfa?: number
          amount_usd?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          rate_used?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_domains: {
        Row: {
          created_at: string
          dns_verified: boolean
          domain: string
          id: string
          owner_id: string
          status: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dns_verified?: boolean
          domain: string
          id?: string
          owner_id: string
          status?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dns_verified?: boolean
          domain?: string
          id?: string
          owner_id?: string
          status?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          auth_id: string | null
          created_at: string
          email: string
          id: string
          last_otp_verified_at: string | null
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          email: string
          id?: string
          last_otp_verified_at?: string | null
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          email?: string
          id?: string
          last_otp_verified_at?: string | null
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          content: string
          created_at: string
          creator_id: string
          id: string
          recipient_type: string
          sent_at: string | null
          sent_count: number
          status: string
          subject: string
        }
        Insert: {
          content: string
          created_at?: string
          creator_id: string
          id?: string
          recipient_type?: string
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          creator_id?: string
          id?: string
          recipient_type?: string
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string
        }
        Relationships: []
      }
      identity_verifications: {
        Row: {
          ai_analysis_details: string | null
          ai_analyzed_at: string | null
          ai_confidence: number | null
          ai_recommendation: string | null
          city: string | null
          country: string | null
          created_at: string
          didit_decision: Json | null
          didit_session_id: string | null
          didit_session_url: string | null
          document_back_url: string | null
          document_front_url: string
          document_number: string | null
          document_type: string
          full_name: string | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          selfie_url: string | null
          status: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          ai_analysis_details?: string | null
          ai_analyzed_at?: string | null
          ai_confidence?: number | null
          ai_recommendation?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          didit_decision?: Json | null
          didit_session_id?: string | null
          didit_session_url?: string | null
          document_back_url?: string | null
          document_front_url: string
          document_number?: string | null
          document_type?: string
          full_name?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_url?: string | null
          status?: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          ai_analysis_details?: string | null
          ai_analyzed_at?: string | null
          ai_confidence?: number | null
          ai_recommendation?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          didit_decision?: Json | null
          didit_session_id?: string | null
          didit_session_url?: string | null
          document_back_url?: string | null
          document_front_url?: string
          document_number?: string | null
          document_type?: string
          full_name?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_url?: string | null
          status?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      license_activations: {
        Row: {
          activated_at: string
          deactivated_at: string | null
          device_id: string
          device_name: string | null
          id: string
          ip_address: string | null
          is_active: boolean
          license_id: string
          user_agent: string | null
        }
        Insert: {
          activated_at?: string
          deactivated_at?: string | null
          device_id: string
          device_name?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          license_id: string
          user_agent?: string | null
        }
        Update: {
          activated_at?: string
          deactivated_at?: string | null
          device_id?: string
          device_name?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          license_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_activations_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          activated_at: string | null
          created_at: string
          customer_id: string
          expires_at: string | null
          id: string
          license_key: string
          max_activations: number
          order_id: string | null
          product_id: string
          revoked_at: string | null
          status: string
          store_owner_id: string
          updated_at: string
          validity_days: number | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          customer_id: string
          expires_at?: string | null
          id?: string
          license_key: string
          max_activations?: number
          order_id?: string | null
          product_id: string
          revoked_at?: string | null
          status?: string
          store_owner_id: string
          updated_at?: string
          validity_days?: number | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          customer_id?: string
          expires_at?: string | null
          id?: string
          license_key?: string
          max_activations?: number
          order_id?: string | null
          product_id?: string
          revoked_at?: string | null
          status?: string
          store_owner_id?: string
          updated_at?: string
          validity_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      login_otps: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nova_messages: {
        Row: {
          content: Json
          created_at: string
          id: string
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nova_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "nova_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_threads: {
        Row: {
          created_at: string
          id: string
          store_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          store_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          store_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_id: string
          funds_available_at: string | null
          id: string
          moneroo_transaction_id: string | null
          original_amount: number | null
          pawapay_deposit_id: string | null
          payment_method: string | null
          payment_provider: string
          product_id: string
          promo_code: string | null
          shipping_address: Json | null
          status: string
          store_owner_id: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id: string
          funds_available_at?: string | null
          id?: string
          moneroo_transaction_id?: string | null
          original_amount?: number | null
          pawapay_deposit_id?: string | null
          payment_method?: string | null
          payment_provider?: string
          product_id: string
          promo_code?: string | null
          shipping_address?: Json | null
          status?: string
          store_owner_id: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id?: string
          funds_available_at?: string | null
          id?: string
          moneroo_transaction_id?: string | null
          original_amount?: number | null
          pawapay_deposit_id?: string | null
          payment_method?: string | null
          payment_provider?: string
          product_id?: string
          promo_code?: string | null
          shipping_address?: Json | null
          status?: string
          store_owner_id?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          moneroo_transaction_id: string | null
          pawapay_deposit_id: string | null
          product_id: string | null
          session_id: string | null
          status: string
          store_owner_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          moneroo_transaction_id?: string | null
          pawapay_deposit_id?: string | null
          product_id?: string | null
          session_id?: string | null
          status?: string
          store_owner_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          moneroo_transaction_id?: string | null
          pawapay_deposit_id?: string | null
          product_id?: string | null
          session_id?: string | null
          status?: string
          store_owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_fees: {
        Row: {
          key: string
          updated_at: string
          value_pct: number
        }
        Insert: {
          key: string
          updated_at?: string
          value_pct: number
        }
        Update: {
          key?: string
          updated_at?: string
          value_pct?: number
        }
        Relationships: []
      }
      product_faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          position: number
          product_id: string
          question: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          position?: number
          product_id: string
          question: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_faqs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_moderation_reviews: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          issues: Json
          product_id: string
          raw_result: Json
          reviewed_at: string
          status: Database["public"]["Enums"]["product_moderation_status"]
          suggested_fixes: Json
          summary: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          issues?: Json
          product_id: string
          raw_result?: Json
          reviewed_at?: string
          status?: Database["public"]["Enums"]["product_moderation_status"]
          suggested_fixes?: Json
          summary: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          issues?: Json
          product_id?: string
          raw_result?: Json
          reviewed_at?: string
          status?: Database["public"]["Enums"]["product_moderation_status"]
          suggested_fixes?: Json
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_moderation_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reports: {
        Row: {
          created_at: string
          customer_id: string
          details: string | null
          id: string
          product_id: string
          reason: string
          reporter_name: string
          status: Database["public"]["Enums"]["product_report_status"]
          store_owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          details?: string | null
          id?: string
          product_id: string
          reason: string
          reporter_name: string
          status?: Database["public"]["Enums"]["product_report_status"]
          store_owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          details?: string | null
          id?: string
          product_id?: string
          reason?: string
          reporter_name?: string
          status?: Database["public"]["Enums"]["product_report_status"]
          store_owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reports_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string
          created_at: string
          customer_id: string
          id: string
          is_public: boolean
          product_id: string
          reviewer_name: string
          sentiment: string
          store_owner_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          comment: string
          created_at?: string
          customer_id: string
          id?: string
          is_public?: boolean
          product_id: string
          reviewer_name: string
          sentiment: string
          store_owner_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_public?: boolean
          product_id?: string
          reviewer_name?: string
          sentiment?: string
          store_owner_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          accepted_formats: string | null
          bundle_discount_percent: number | null
          bundle_product_ids: string[] | null
          category: string | null
          collect_shipping_address: boolean
          course_content_type: string | null
          created_at: string
          creator_id: string
          description: string | null
          download_url: string | null
          file_password: string | null
          hide_from_store: boolean
          hide_sales_count: boolean
          id: string
          is_published: boolean
          license_max_activations: number | null
          license_validity_days: number | null
          marketing_sections: Json
          original_price: number | null
          price: number
          sales_count: number
          sales_limit: number | null
          seo_description: string | null
          seo_image_url: string | null
          seo_keywords: string | null
          seo_title: string | null
          thumbnail_url: string | null
          title: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
          watermark_enabled: boolean
        }
        Insert: {
          accepted_formats?: string | null
          bundle_discount_percent?: number | null
          bundle_product_ids?: string[] | null
          category?: string | null
          collect_shipping_address?: boolean
          course_content_type?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          download_url?: string | null
          file_password?: string | null
          hide_from_store?: boolean
          hide_sales_count?: boolean
          id?: string
          is_published?: boolean
          license_max_activations?: number | null
          license_validity_days?: number | null
          marketing_sections?: Json
          original_price?: number | null
          price?: number
          sales_count?: number
          sales_limit?: number | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          thumbnail_url?: string | null
          title: string
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
          watermark_enabled?: boolean
        }
        Update: {
          accepted_formats?: string | null
          bundle_discount_percent?: number | null
          bundle_product_ids?: string[] | null
          category?: string | null
          collect_shipping_address?: boolean
          course_content_type?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          download_url?: string | null
          file_password?: string | null
          hide_from_store?: boolean
          hide_sales_count?: boolean
          id?: string
          is_published?: boolean
          license_max_activations?: number | null
          license_validity_days?: number | null
          marketing_sections?: Json
          original_price?: number | null
          price?: number
          sales_count?: number
          sales_limit?: number | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
          watermark_enabled?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          contact: string | null
          country_code: string | null
          created_at: string
          display_name: string | null
          facebook_pixel_id: string | null
          first_name: string | null
          google_ads_id: string | null
          id: string
          last_2fa_verified_at: string | null
          last_name: string | null
          momo_operator: string | null
          momo_phone: string | null
          onboarding_completed: boolean | null
          phone: string | null
          store_banner_url: string | null
          store_brand_color: string | null
          store_button_animation: string | null
          store_corner_style: string | null
          store_description: string | null
          store_font: string | null
          store_keywords: string | null
          store_logo_url: string | null
          store_product_layout: string | null
          store_show_buy_button: boolean | null
          store_show_featured: boolean | null
          store_show_recommended: boolean | null
          store_slug: string | null
          store_sort_order: string | null
          store_theme: string | null
          tiktok_pixel_id: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          contact?: string | null
          country_code?: string | null
          created_at?: string
          display_name?: string | null
          facebook_pixel_id?: string | null
          first_name?: string | null
          google_ads_id?: string | null
          id: string
          last_2fa_verified_at?: string | null
          last_name?: string | null
          momo_operator?: string | null
          momo_phone?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          store_banner_url?: string | null
          store_brand_color?: string | null
          store_button_animation?: string | null
          store_corner_style?: string | null
          store_description?: string | null
          store_font?: string | null
          store_keywords?: string | null
          store_logo_url?: string | null
          store_product_layout?: string | null
          store_show_buy_button?: boolean | null
          store_show_featured?: boolean | null
          store_show_recommended?: boolean | null
          store_slug?: string | null
          store_sort_order?: string | null
          store_theme?: string | null
          tiktok_pixel_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          contact?: string | null
          country_code?: string | null
          created_at?: string
          display_name?: string | null
          facebook_pixel_id?: string | null
          first_name?: string | null
          google_ads_id?: string | null
          id?: string
          last_2fa_verified_at?: string | null
          last_name?: string | null
          momo_operator?: string | null
          momo_phone?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          store_banner_url?: string | null
          store_brand_color?: string | null
          store_button_animation?: string | null
          store_corner_style?: string | null
          store_description?: string | null
          store_font?: string | null
          store_keywords?: string | null
          store_logo_url?: string | null
          store_product_layout?: string | null
          store_show_buy_button?: boolean | null
          store_show_featured?: boolean | null
          store_show_recommended?: boolean | null
          store_slug?: string | null
          store_sort_order?: string | null
          store_theme?: string | null
          tiktok_pixel_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          creator_id: string
          current_uses: number
          discount_amount: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          product_ids: string[] | null
        }
        Insert: {
          code: string
          created_at?: string
          creator_id: string
          current_uses?: number
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          product_ids?: string[] | null
        }
        Update: {
          code?: string
          created_at?: string
          creator_id?: string
          current_uses?: number
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          product_ids?: string[] | null
        }
        Relationships: []
      }
      store_contact_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          sender_email: string
          sender_name: string
          sender_phone: string | null
          store_owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          sender_email: string
          sender_name: string
          sender_phone?: string | null
          store_owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          sender_email?: string
          sender_name?: string
          sender_phone?: string | null
          store_owner_id?: string
        }
        Relationships: []
      }
      store_reviews: {
        Row: {
          comment: string
          created_at: string
          customer_id: string
          id: string
          is_public: boolean
          reviewer_name: string
          sentiment: Database["public"]["Enums"]["review_sentiment"]
          store_id: string
          store_owner_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          comment: string
          created_at?: string
          customer_id: string
          id?: string
          is_public?: boolean
          reviewer_name: string
          sentiment: Database["public"]["Enums"]["review_sentiment"]
          store_id: string
          store_owner_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_public?: boolean
          reviewer_name?: string
          sentiment?: Database["public"]["Enums"]["review_sentiment"]
          store_id?: string
          store_owner_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_visits: {
        Row: {
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          page_path: string | null
          referrer: string | null
          store_owner_id: string
          user_agent: string | null
          visitor_ip: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          page_path?: string | null
          referrer?: string | null
          store_owner_id: string
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          page_path?: string | null
          referrer?: string | null
          store_owner_id?: string
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          banner_url: string | null
          brand_color: string | null
          button_animation: string | null
          corner_style: string | null
          created_at: string
          description: string | null
          font: string | null
          footer_disclaimer: string | null
          id: string
          is_archived: boolean
          keywords: string | null
          layout_sections: Json
          legal_notice: string | null
          logo_url: string | null
          name: string
          owner_id: string
          privacy_policy: string | null
          product_layout: string | null
          show_buy_button: boolean | null
          show_featured: boolean | null
          show_recommended: boolean | null
          slug: string
          sort_order: string | null
          terms_of_use: string | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          brand_color?: string | null
          button_animation?: string | null
          corner_style?: string | null
          created_at?: string
          description?: string | null
          font?: string | null
          footer_disclaimer?: string | null
          id?: string
          is_archived?: boolean
          keywords?: string | null
          layout_sections?: Json
          legal_notice?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          privacy_policy?: string | null
          product_layout?: string | null
          show_buy_button?: boolean | null
          show_featured?: boolean | null
          show_recommended?: boolean | null
          slug: string
          sort_order?: string | null
          terms_of_use?: string | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          brand_color?: string | null
          button_animation?: string | null
          corner_style?: string | null
          created_at?: string
          description?: string | null
          font?: string | null
          footer_disclaimer?: string | null
          id?: string
          is_archived?: boolean
          keywords?: string | null
          layout_sections?: Json
          legal_notice?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          privacy_policy?: string | null
          product_layout?: string | null
          show_buy_button?: boolean | null
          show_featured?: boolean | null
          show_recommended?: boolean | null
          slug?: string
          sort_order?: string | null
          terms_of_use?: string | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      support_conversations: {
        Row: {
          created_at: string
          id: string
          status: string
          subject: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_type?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_id: string | null
          sender_type: string
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_type: string
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          order_id: string
          product_id: string
          status: string
          store_owner_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          order_id: string
          product_id: string
          status?: string
          store_owner_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string
          product_id?: string
          status?: string
          store_owner_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      telegram_admin_chats: {
        Row: {
          chat_id: number
          created_at: string
          first_name: string | null
          username: string | null
        }
        Insert: {
          chat_id: number
          created_at?: string
          first_name?: string | null
          username?: string | null
        }
        Update: {
          chat_id?: number
          created_at?: string
          first_name?: string | null
          username?: string | null
        }
        Relationships: []
      }
      telegram_bot_state: {
        Row: {
          id: number
          update_offset: number
          updated_at: string
        }
        Insert: {
          id: number
          update_offset?: number
          updated_at?: string
        }
        Update: {
          id?: number
          update_offset?: number
          updated_at?: string
        }
        Relationships: []
      }
      telegram_link_tokens: {
        Row: {
          created_at: string
          expires_at: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      telegram_links: {
        Row: {
          chat_id: number
          created_at: string
          first_name: string | null
          id: string
          notify_payouts: boolean
          notify_sales: boolean
          user_id: string
          username: string | null
        }
        Insert: {
          chat_id: number
          created_at?: string
          first_name?: string | null
          id?: string
          notify_payouts?: boolean
          notify_sales?: boolean
          user_id: string
          username?: string | null
        }
        Update: {
          chat_id?: number
          created_at?: string
          first_name?: string | null
          id?: string
          notify_payouts?: boolean
          notify_sales?: boolean
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      telegram_messages: {
        Row: {
          ai_reply: string | null
          chat_id: number
          created_at: string
          from_user_id: number | null
          raw_update: Json
          text: string | null
          update_id: number
          username: string | null
        }
        Insert: {
          ai_reply?: string | null
          chat_id: number
          created_at?: string
          from_user_id?: number | null
          raw_update: Json
          text?: string | null
          update_id: number
          username?: string | null
        }
        Update: {
          ai_reply?: string | null
          chat_id?: number
          created_at?: string
          from_user_id?: number | null
          raw_update?: Json
          text?: string | null
          update_id?: number
          username?: string | null
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          balance_fcfa: number
          balance_usd: number
          created_at: string
          pending_fcfa: number
          pending_usd: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_fcfa?: number
          balance_usd?: number
          created_at?: string
          pending_fcfa?: number
          pending_usd?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_fcfa?: number
          balance_usd?: number
          created_at?: string
          pending_fcfa?: number
          pending_usd?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verified_badges: {
        Row: {
          activated_at: string | null
          ai_recommendation: string | null
          ai_score: number | null
          created_at: string
          expires_at: string | null
          grade: Database["public"]["Enums"]["badge_grade"]
          granted_by: string | null
          granted_by_admin: boolean
          id: string
          status: Database["public"]["Enums"]["badge_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          ai_recommendation?: string | null
          ai_score?: number | null
          created_at?: string
          expires_at?: string | null
          grade: Database["public"]["Enums"]["badge_grade"]
          granted_by?: string | null
          granted_by_admin?: boolean
          id?: string
          status?: Database["public"]["Enums"]["badge_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          ai_recommendation?: string | null
          ai_score?: number | null
          created_at?: string
          expires_at?: string | null
          grade?: Database["public"]["Enums"]["badge_grade"]
          granted_by?: string | null
          granted_by_admin?: boolean
          id?: string
          status?: Database["public"]["Enums"]["badge_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_pins: {
        Row: {
          created_at: string
          failed_attempts: number
          locked_until: string | null
          pin_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          failed_attempts?: number
          locked_until?: string | null
          pin_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          failed_attempts?: number
          locked_until?: string | null
          pin_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          available_at: string | null
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          status: string
          type: string
          user_id: string
          wallet_currency: string
        }
        Insert: {
          amount: number
          available_at?: string | null
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          type: string
          user_id: string
          wallet_currency: string
        }
        Update: {
          amount?: number
          available_at?: string | null
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          type?: string
          user_id?: string
          wallet_currency?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          country: string
          created_at: string
          holder_first_name: string
          holder_last_name: string
          id: string
          is_default: boolean
          name: string
          phone: string
          provider_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          country: string
          created_at?: string
          holder_first_name: string
          holder_last_name: string
          id?: string
          is_default?: boolean
          name: string
          phone: string
          provider_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string
          created_at?: string
          holder_first_name?: string
          holder_last_name?: string
          id?: string
          is_default?: boolean
          name?: string
          phone?: string
          provider_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          attempt: number
          created_at: string
          event: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          success: boolean
          webhook_id: string
        }
        Insert: {
          attempt?: number
          created_at?: string
          event: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean
          webhook_id: string
        }
        Update: {
          attempt?: number
          created_at?: string
          event?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          creator_id: string
          events: string[]
          id: string
          is_active: boolean
          name: string
          product_ids: string[] | null
          secret: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          events?: string[]
          id?: string
          is_active?: boolean
          name: string
          product_ids?: string[] | null
          secret?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          events?: string[]
          id?: string
          is_active?: boolean
          name?: string
          product_ids?: string[] | null
          secret?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          fee: number
          id: string
          moneroo_payout_id: string | null
          moneroo_reference: string | null
          net_amount: number
          operator: string
          pawapay_payout_id: string | null
          payment_provider: string
          phone_number: string
          processed_at: string | null
          provider_code: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          fee?: number
          id?: string
          moneroo_payout_id?: string | null
          moneroo_reference?: string | null
          net_amount: number
          operator?: string
          pawapay_payout_id?: string | null
          payment_provider?: string
          phone_number: string
          processed_at?: string | null
          provider_code?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          fee?: number
          id?: string
          moneroo_payout_id?: string | null
          moneroo_reference?: string | null
          net_amount?: number
          operator?: string
          pawapay_payout_id?: string | null
          payment_provider?: string
          phone_number?: string
          processed_at?: string | null
          provider_code?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      customer_has_kyc: { Args: { _customer_id: string }; Returns: boolean }
      customer_has_order_with_store: {
        Args: { _customer_id: string; _store_owner_id: string }
        Returns: boolean
      }
      generate_license_key: { Args: never; Returns: string }
      get_my_lesson_video: { Args: { _lesson_id: string }; Returns: string }
      get_my_product_secrets: {
        Args: { _product_id: string }
        Returns: {
          download_url: string
          file_password: string
        }[]
      }
      get_my_profile: {
        Args: never
        Returns: {
          avatar_url: string | null
          bio: string | null
          contact: string | null
          country_code: string | null
          created_at: string
          display_name: string | null
          facebook_pixel_id: string | null
          first_name: string | null
          google_ads_id: string | null
          id: string
          last_2fa_verified_at: string | null
          last_name: string | null
          momo_operator: string | null
          momo_phone: string | null
          onboarding_completed: boolean | null
          phone: string | null
          store_banner_url: string | null
          store_brand_color: string | null
          store_button_animation: string | null
          store_corner_style: string | null
          store_description: string | null
          store_font: string | null
          store_keywords: string | null
          store_logo_url: string | null
          store_product_layout: string | null
          store_show_buy_button: boolean | null
          store_show_featured: boolean | null
          store_show_recommended: boolean | null
          store_slug: string | null
          store_sort_order: string | null
          store_theme: string | null
          tiktok_pixel_id: string | null
          updated_at: string
          username: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_active_badge: {
        Args: { _user_id: string }
        Returns: {
          expires_at: string
          grade: Database["public"]["Enums"]["badge_grade"]
        }[]
      }
    }
    Enums: {
      badge_grade: "standard" | "pro" | "premium"
      badge_status: "pending_payment" | "active" | "expired" | "revoked"
      product_moderation_status: "approved" | "warning" | "rejected"
      product_report_status: "pending" | "reviewed" | "dismissed" | "actioned"
      product_type: "file" | "course" | "license"
      review_sentiment: "positive" | "negative"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      badge_grade: ["standard", "pro", "premium"],
      badge_status: ["pending_payment", "active", "expired", "revoked"],
      product_moderation_status: ["approved", "warning", "rejected"],
      product_report_status: ["pending", "reviewed", "dismissed", "actioned"],
      product_type: ["file", "course", "license"],
      review_sentiment: ["positive", "negative"],
    },
  },
} as const
