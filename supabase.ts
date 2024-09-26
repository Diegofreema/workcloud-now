export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      connections: {
        Row: {
          connectedTo: number | null;
          created_at: string;
          id: number;
          owner: string | null;
        };
        Insert: {
          connectedTo?: number | null;
          created_at?: string;
          id?: number;
          owner?: string | null;
        };
        Update: {
          connectedTo?: number | null;
          created_at?: string;
          id?: number;
          owner?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'connections_connectedTo_fkey';
            columns: ['connectedTo'];
            isOneToOne: false;
            referencedRelation: 'organization';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'connections_owner_fkey';
            columns: ['owner'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['userId'];
          },
        ];
      };
      followers: {
        Row: {
          created_at: string;
          followerId: string | null;
          id: number;
          organizationId: number | null;
        };
        Insert: {
          created_at?: string;
          followerId?: string | null;
          id?: number;
          organizationId?: number | null;
        };
        Update: {
          created_at?: string;
          followerId?: string | null;
          id?: number;
          organizationId?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'followers_followerId_fkey';
            columns: ['followerId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['userId'];
          },
          {
            foreignKeyName: 'followers_organizationId_fkey';
            columns: ['organizationId'];
            isOneToOne: false;
            referencedRelation: 'organization';
            referencedColumns: ['id'];
          },
        ];
      };
      organization: {
        Row: {
          avatar: string | null;
          category: string | null;
          created_at: string;
          description: string | null;
          email: string | null;
          end: string | null;
          folllowers: string[] | null;
          followers: number[] | null;
          has_group: boolean | null;
          id: number;
          location: string | null;
          logoId: string | null;
          name: string | null;
          ownerId: string | null;
          search_count: number | null;
          start: string | null;
          subTitle: string | null;
          website: string | null;
          workDays: string | null;
          workspaces: number[] | null;
        };
        Insert: {
          avatar?: string | null;
          category?: string | null;
          created_at?: string;
          description?: string | null;
          email?: string | null;
          end?: string | null;
          folllowers?: string[] | null;
          followers?: number[] | null;
          has_group?: boolean | null;
          id?: number;
          location?: string | null;
          logoId?: string | null;
          name?: string | null;
          ownerId?: string | null;
          search_count?: number | null;
          start?: string | null;
          subTitle?: string | null;
          website?: string | null;
          workDays?: string | null;
          workspaces?: number[] | null;
        };
        Update: {
          avatar?: string | null;
          category?: string | null;
          created_at?: string;
          description?: string | null;
          email?: string | null;
          end?: string | null;
          folllowers?: string[] | null;
          followers?: number[] | null;
          has_group?: boolean | null;
          id?: number;
          location?: string | null;
          logoId?: string | null;
          name?: string | null;
          ownerId?: string | null;
          search_count?: number | null;
          start?: string | null;
          subTitle?: string | null;
          website?: string | null;
          workDays?: string | null;
          workspaces?: number[] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'organization_ownerId_fkey';
            columns: ['ownerId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['userId'];
          },
        ];
      };
      personal: {
        Row: {
          active: boolean | null;
          created_at: string;
          id: number;
          leisure: boolean | null;
          organizationId: number | null;
          ownerId: string | null;
          role: string | null;
          signedIn: boolean | null;
          workerId: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string;
          id?: number;
          leisure?: boolean | null;
          organizationId?: number | null;
          ownerId?: string | null;
          role?: string | null;
          signedIn?: boolean | null;
          workerId?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string;
          id?: number;
          leisure?: boolean | null;
          organizationId?: number | null;
          ownerId?: string | null;
          role?: string | null;
          signedIn?: boolean | null;
          workerId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'personal_organizationId_fkey';
            columns: ['organizationId'];
            isOneToOne: false;
            referencedRelation: 'organization';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'personal_ownerId_fkey';
            columns: ['ownerId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['userId'];
          },
          {
            foreignKeyName: 'personal_workerId_fkey';
            columns: ['workerId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['userId'];
          },
        ];
      };
      post: {
        Row: {
          author: number | null;
          created_at: string;
          id: number;
          pictures: string | null;
        };
        Insert: {
          author?: number | null;
          created_at?: string;
          id?: number;
          pictures?: string | null;
        };
        Update: {
          author?: number | null;
          created_at?: string;
          id?: number;
          pictures?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'public_post_author_fkey';
            columns: ['author'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          created_at: string;
          id: number;
          organizationId: number | null;
          postUrl: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          organizationId?: number | null;
          postUrl?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          organizationId?: number | null;
          postUrl?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_organizationId_fkey';
            columns: ['organizationId'];
            isOneToOne: false;
            referencedRelation: 'organization';
            referencedColumns: ['id'];
          },
        ];
      };
      request: {
        Row: {
          accepted: boolean | null;
          created_at: string;
          from: string | null;
          id: number;
          organizationId: number | null;
          pending: boolean | null;
          qualities: string | null;
          responsibility: string;
          role: string;
          salary: string;
          to: string | null;
          unread: boolean | null;
          workspaceId: number | null;
        };
        Insert: {
          accepted?: boolean | null;
          created_at?: string;
          from?: string | null;
          id?: number;
          organizationId?: number | null;
          pending?: boolean | null;
          qualities?: string | null;
          responsibility: string;
          role: string;
          salary: string;
          to?: string | null;
          unread?: boolean | null;
          workspaceId?: number | null;
        };
        Update: {
          accepted?: boolean | null;
          created_at?: string;
          from?: string | null;
          id?: number;
          organizationId?: number | null;
          pending?: boolean | null;
          qualities?: string | null;
          responsibility?: string;
          role?: string;
          salary?: string;
          to?: string | null;
          unread?: boolean | null;
          workspaceId?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'public_request_organizationId_fkey';
            columns: ['organizationId'];
            isOneToOne: false;
            referencedRelation: 'organization';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'request_from_fkey';
            columns: ['from'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['userId'];
          },
          {
            foreignKeyName: 'request_to_fkey';
            columns: ['to'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['userId'];
          },
          {
            foreignKeyName: 'request_workspaceId_fkey';
            columns: ['workspaceId'];
            isOneToOne: false;
            referencedRelation: 'workspace';
            referencedColumns: ['id'];
          },
        ];
      };
      roles: {
        Row: {
          created_at: string;
          id: number;
          role: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          role?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          role?: string | null;
        };
        Relationships: [];
      };
      servicePoint: {
        Row: {
          created_at: string;
          description: string;
          externalLink: boolean | null;
          form: boolean | null;
          id: number;
          name: string | null;
          organizationId: number | null;
          service: boolean | null;
          staff: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          externalLink?: boolean | null;
          form?: boolean | null;
          id?: number;
          name?: string | null;
          organizationId?: number | null;
          service?: boolean | null;
          staff: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          externalLink?: boolean | null;
          form?: boolean | null;
          id?: number;
          name?: string | null;
          organizationId?: number | null;
          service?: boolean | null;
          staff?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'public_servicePoint_organizationId_fkey';
            columns: ['organizationId'];
            isOneToOne: false;
            referencedRelation: 'organization';
            referencedColumns: ['id'];
          },
        ];
      };
      user: {
        Row: {
          avatar: string | null;
          birthday: string | null;
          created_at: string;
          email: string | null;
          id: number;
          name: string | null;
          organizationId: number | null;
          phoneNumber: string | null;
          posts: number[] | null;
          streamToken: string | null;
          userId: string | null;
          workerId: number | null;
          workspaces: number[] | null;
        };
        Insert: {
          avatar?: string | null;
          birthday?: string | null;
          created_at?: string;
          email?: string | null;
          id?: number;
          name?: string | null;
          organizationId?: number | null;
          phoneNumber?: string | null;
          posts?: number[] | null;
          streamToken?: string | null;
          userId?: string | null;
          workerId?: number | null;
          workspaces?: number[] | null;
        };
        Update: {
          avatar?: string | null;
          birthday?: string | null;
          created_at?: string;
          email?: string | null;
          id?: number;
          name?: string | null;
          organizationId?: number | null;
          phoneNumber?: string | null;
          posts?: number[] | null;
          streamToken?: string | null;
          userId?: string | null;
          workerId?: number | null;
          workspaces?: number[] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_organizationId_fkey';
            columns: ['organizationId'];
            isOneToOne: false;
            referencedRelation: 'organization';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_workerId_fkey';
            columns: ['workerId'];
            isOneToOne: false;
            referencedRelation: 'worker';
            referencedColumns: ['id'];
          },
        ];
      };
      waitList: {
        Row: {
          created_at: string;
          customer: string | null;
          id: number;
          workspace: number | null;
        };
        Insert: {
          created_at?: string;
          customer?: string | null;
          id?: number;
          workspace?: number | null;
        };
        Update: {
          created_at?: string;
          customer?: string | null;
          id?: number;
          workspace?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'waitList_customer_fkey';
            columns: ['customer'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['userId'];
          },
        ];
      };
      worker: {
        Row: {
          bossId: string | null;
          created_at: string;
          experience: string | null;
          gender: string | null;
          id: number;
          location: string | null;
          organizationId: number | null;
          personalId: number | null;
          qualifications: string | null;
          role: string | null;
          servicePointId: number | null;
          skills: string | null;
          userId: string | null;
          workspaceId: number | null;
        };
        Insert: {
          bossId?: string | null;
          created_at?: string;
          experience?: string | null;
          gender?: string | null;
          id?: number;
          location?: string | null;
          organizationId?: number | null;
          personalId?: number | null;
          qualifications?: string | null;
          role?: string | null;
          servicePointId?: number | null;
          skills?: string | null;
          userId?: string | null;
          workspaceId?: number | null;
        };
        Update: {
          bossId?: string | null;
          created_at?: string;
          experience?: string | null;
          gender?: string | null;
          id?: number;
          location?: string | null;
          organizationId?: number | null;
          personalId?: number | null;
          qualifications?: string | null;
          role?: string | null;
          servicePointId?: number | null;
          skills?: string | null;
          userId?: string | null;
          workspaceId?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'public_worker_workspaceId_fkey';
            columns: ['workspaceId'];
            isOneToOne: false;
            referencedRelation: 'workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'worker_bossId_fkey';
            columns: ['bossId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['userId'];
          },
          {
            foreignKeyName: 'worker_organizationId_fkey';
            columns: ['organizationId'];
            isOneToOne: false;
            referencedRelation: 'organization';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'worker_personalId_fkey';
            columns: ['personalId'];
            isOneToOne: false;
            referencedRelation: 'personal';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'worker_servicePointId_fkey';
            columns: ['servicePointId'];
            isOneToOne: false;
            referencedRelation: 'servicePoint';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'worker_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['userId'];
          },
        ];
      };
      workspace: {
        Row: {
          active: boolean | null;
          created_at: string;
          id: number;
          leisure: boolean | null;
          locked: boolean | null;
          organizationId: number | null;
          ownerId: string | null;
          personal: boolean | null;
          responsibility: string | null;
          role: string | null;
          salary: string | null;
          signedIn: boolean | null;
          workerId: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string;
          id?: number;
          leisure?: boolean | null;
          locked?: boolean | null;
          organizationId?: number | null;
          ownerId?: string | null;
          personal?: boolean | null;
          responsibility?: string | null;
          role?: string | null;
          salary?: string | null;
          signedIn?: boolean | null;
          workerId?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string;
          id?: number;
          leisure?: boolean | null;
          locked?: boolean | null;
          organizationId?: number | null;
          ownerId?: string | null;
          personal?: boolean | null;
          responsibility?: string | null;
          role?: string | null;
          salary?: string | null;
          signedIn?: boolean | null;
          workerId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'workspace_organizationId_fkey';
            columns: ['organizationId'];
            isOneToOne: false;
            referencedRelation: 'organization';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workspace_ownerId_fkey';
            columns: ['ownerId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['userId'];
          },
          {
            foreignKeyName: 'workspace_workerId_fkey';
            columns: ['workerId'];
            isOneToOne: false;
            referencedRelation: 'user';
            referencedColumns: ['userId'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      requesting_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          user_metadata: Json | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          owner_id: string | null;
          upload_signature: string;
          user_metadata: Json | null;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          owner_id?: string | null;
          upload_signature: string;
          user_metadata?: Json | null;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          owner_id?: string | null;
          upload_signature?: string;
          user_metadata?: Json | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey';
            columns: ['upload_id'];
            isOneToOne: false;
            referencedRelation: 's3_multipart_uploads';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string;
          name: string;
          owner: string;
          metadata: Json;
        };
        Returns: undefined;
      };
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      foldername: {
        Args: {
          name: string;
        };
        Returns: string[];
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number;
          bucket_id: string;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix_param: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
        };
        Returns: {
          key: string;
          id: string;
          created_at: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix_param: string;
          delimiter_param: string;
          max_keys?: number;
          start_after?: string;
          next_token?: string;
        };
        Returns: {
          name: string;
          id: string;
          metadata: Json;
          updated_at: string;
        }[];
      };
      operation: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;
