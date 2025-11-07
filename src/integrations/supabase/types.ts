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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anexos: {
        Row: {
          data_upload: string
          id: string
          manifestacao_id: string
          nome_arquivo: string
          nome_original: string
          tamanho: number
          tipo_arquivo: string
          upload_por_id: string
          url: string
        }
        Insert: {
          data_upload?: string
          id?: string
          manifestacao_id: string
          nome_arquivo: string
          nome_original: string
          tamanho: number
          tipo_arquivo: string
          upload_por_id: string
          url: string
        }
        Update: {
          data_upload?: string
          id?: string
          manifestacao_id?: string
          nome_arquivo?: string
          nome_original?: string
          tamanho?: number
          tipo_arquivo?: string
          upload_por_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_manifestacao_id_fkey"
            columns: ["manifestacao_id"]
            isOneToOne: false
            referencedRelation: "manifestacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anexos_upload_por_id_fkey"
            columns: ["upload_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicacoes: {
        Row: {
          assunto: string | null
          created_at: string
          data_envio: string
          data_leitura: string | null
          destinatario: string
          email_id: string | null
          email_status: string | null
          id: string
          interno: boolean
          manifestacao_id: string
          mensagem: string
          remetente: string
          tipo: Database["public"]["Enums"]["tipo_comunicacao"]
          usuario_id: string | null
        }
        Insert: {
          assunto?: string | null
          created_at?: string
          data_envio?: string
          data_leitura?: string | null
          destinatario: string
          email_id?: string | null
          email_status?: string | null
          id?: string
          interno?: boolean
          manifestacao_id: string
          mensagem: string
          remetente: string
          tipo: Database["public"]["Enums"]["tipo_comunicacao"]
          usuario_id?: string | null
        }
        Update: {
          assunto?: string | null
          created_at?: string
          data_envio?: string
          data_leitura?: string | null
          destinatario?: string
          email_id?: string | null
          email_status?: string | null
          id?: string
          interno?: boolean
          manifestacao_id?: string
          mensagem?: string
          remetente?: string
          tipo?: Database["public"]["Enums"]["tipo_comunicacao"]
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comunicacoes_manifestacao_id_fkey"
            columns: ["manifestacao_id"]
            isOneToOne: false
            referencedRelation: "manifestacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      encaminhamentos: {
        Row: {
          created_at: string
          data_encaminhamento: string
          data_retorno: string | null
          id: string
          instrucoes: string | null
          manifestacao_id: string
          prazo: string | null
          resposta_setor: string | null
          setor_destino_id: string
          setor_origem_id: string | null
          status: Database["public"]["Enums"]["status_encaminhamento"]
          updated_at: string
          usuario_destino_id: string | null
          usuario_origem_id: string
        }
        Insert: {
          created_at?: string
          data_encaminhamento?: string
          data_retorno?: string | null
          id?: string
          instrucoes?: string | null
          manifestacao_id: string
          prazo?: string | null
          resposta_setor?: string | null
          setor_destino_id: string
          setor_origem_id?: string | null
          status?: Database["public"]["Enums"]["status_encaminhamento"]
          updated_at?: string
          usuario_destino_id?: string | null
          usuario_origem_id: string
        }
        Update: {
          created_at?: string
          data_encaminhamento?: string
          data_retorno?: string | null
          id?: string
          instrucoes?: string | null
          manifestacao_id?: string
          prazo?: string | null
          resposta_setor?: string | null
          setor_destino_id?: string
          setor_origem_id?: string | null
          status?: Database["public"]["Enums"]["status_encaminhamento"]
          updated_at?: string
          usuario_destino_id?: string | null
          usuario_origem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "encaminhamentos_manifestacao_id_fkey"
            columns: ["manifestacao_id"]
            isOneToOne: false
            referencedRelation: "manifestacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encaminhamentos_setor_destino_id_fkey"
            columns: ["setor_destino_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encaminhamentos_setor_origem_id_fkey"
            columns: ["setor_origem_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encaminhamentos_usuario_destino_id_fkey"
            columns: ["usuario_destino_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encaminhamentos_usuario_origem_id_fkey"
            columns: ["usuario_origem_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_auditoria: {
        Row: {
          acao: string
          dados_antigos: Json | null
          dados_novos: Json | null
          data_acao: string
          entidade: string
          entidade_id: string
          id: string
          ip: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          dados_antigos?: Json | null
          dados_novos?: Json | null
          data_acao?: string
          entidade: string
          entidade_id: string
          id?: string
          ip?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          dados_antigos?: Json | null
          dados_novos?: Json | null
          data_acao?: string
          entidade?: string
          entidade_id?: string
          id?: string
          ip?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_auditoria_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      manifestacoes: {
        Row: {
          anonima: boolean
          canal: Database["public"]["Enums"]["canal_manifestacao"]
          categoria: string | null
          created_at: string
          data_encerramento: string | null
          data_recebimento: string
          data_resposta: string | null
          descricao: string
          id: string
          manifestante_id: string | null
          palavras_chave: string[] | null
          prazo_resposta: string | null
          prioridade: Database["public"]["Enums"]["prioridade_manifestacao"]
          protocolo: string
          responsavel_id: string | null
          sentimento: Database["public"]["Enums"]["sentimento"] | null
          setor_responsavel_id: string | null
          sigilosa: boolean
          status: Database["public"]["Enums"]["status_manifestacao"]
          tags: string[] | null
          tempo_resolucao: number | null
          tempo_resposta: number | null
          tipo: Database["public"]["Enums"]["tipo_manifestacao"]
          updated_at: string
        }
        Insert: {
          anonima?: boolean
          canal: Database["public"]["Enums"]["canal_manifestacao"]
          categoria?: string | null
          created_at?: string
          data_encerramento?: string | null
          data_recebimento?: string
          data_resposta?: string | null
          descricao: string
          id?: string
          manifestante_id?: string | null
          palavras_chave?: string[] | null
          prazo_resposta?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_manifestacao"]
          protocolo: string
          responsavel_id?: string | null
          sentimento?: Database["public"]["Enums"]["sentimento"] | null
          setor_responsavel_id?: string | null
          sigilosa?: boolean
          status?: Database["public"]["Enums"]["status_manifestacao"]
          tags?: string[] | null
          tempo_resolucao?: number | null
          tempo_resposta?: number | null
          tipo: Database["public"]["Enums"]["tipo_manifestacao"]
          updated_at?: string
        }
        Update: {
          anonima?: boolean
          canal?: Database["public"]["Enums"]["canal_manifestacao"]
          categoria?: string | null
          created_at?: string
          data_encerramento?: string | null
          data_recebimento?: string
          data_resposta?: string | null
          descricao?: string
          id?: string
          manifestante_id?: string | null
          palavras_chave?: string[] | null
          prazo_resposta?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_manifestacao"]
          protocolo?: string
          responsavel_id?: string | null
          sentimento?: Database["public"]["Enums"]["sentimento"] | null
          setor_responsavel_id?: string | null
          sigilosa?: boolean
          status?: Database["public"]["Enums"]["status_manifestacao"]
          tags?: string[] | null
          tempo_resolucao?: number | null
          tempo_resposta?: number | null
          tipo?: Database["public"]["Enums"]["tipo_manifestacao"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manifestacoes_manifestante_id_fkey"
            columns: ["manifestante_id"]
            isOneToOne: false
            referencedRelation: "manifestantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manifestacoes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manifestacoes_setor_responsavel_id_fkey"
            columns: ["setor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      manifestantes: {
        Row: {
          cep: string | null
          cidade: string | null
          consentimento_lgpd: boolean
          cpf: string | null
          created_at: string
          data_consentimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          meio_comunicacao: Database["public"]["Enums"]["meio_comunicacao"]
          nome: string
          prefere_comunicacao: boolean
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          consentimento_lgpd?: boolean
          cpf?: string | null
          created_at?: string
          data_consentimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          meio_comunicacao?: Database["public"]["Enums"]["meio_comunicacao"]
          nome: string
          prefere_comunicacao?: boolean
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          consentimento_lgpd?: boolean
          cpf?: string | null
          created_at?: string
          data_consentimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          meio_comunicacao?: Database["public"]["Enums"]["meio_comunicacao"]
          nome?: string
          prefere_comunicacao?: boolean
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          created_at: string
          data_leitura: string | null
          id: string
          lida: boolean
          link: string | null
          manifestacao_id: string | null
          mensagem: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          data_leitura?: string | null
          id?: string
          lida?: boolean
          link?: string | null
          manifestacao_id?: string | null
          mensagem: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          data_leitura?: string | null
          id?: string
          lida?: boolean
          link?: string | null
          manifestacao_id?: string | null
          mensagem?: string
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_manifestacao_id_fkey"
            columns: ["manifestacao_id"]
            isOneToOne: false
            referencedRelation: "manifestacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      permissoes: {
        Row: {
          acao: Database["public"]["Enums"]["acao_permissao"]
          ativo: boolean
          created_at: string
          descricao: string
          id: string
          modulo: string
          recurso: string
          updated_at: string
        }
        Insert: {
          acao: Database["public"]["Enums"]["acao_permissao"]
          ativo?: boolean
          created_at?: string
          descricao: string
          id?: string
          modulo: string
          recurso: string
          updated_at?: string
        }
        Update: {
          acao?: Database["public"]["Enums"]["acao_permissao"]
          ativo?: boolean
          created_at?: string
          descricao?: string
          id?: string
          modulo?: string
          recurso?: string
          updated_at?: string
        }
        Relationships: []
      }
      planos_acao: {
        Row: {
          created_at: string
          data_conclusao: string | null
          data_inicio: string | null
          descricao: string
          id: string
          manifestacao_id: string
          observacoes: string | null
          prazo: string | null
          responsavel_id: string | null
          setor_id: string
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          descricao: string
          id?: string
          manifestacao_id: string
          observacoes?: string | null
          prazo?: string | null
          responsavel_id?: string | null
          setor_id: string
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          descricao?: string
          id?: string
          manifestacao_id?: string
          observacoes?: string | null
          prazo?: string | null
          responsavel_id?: string | null
          setor_id?: string
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_acao_manifestacao_id_fkey"
            columns: ["manifestacao_id"]
            isOneToOne: false
            referencedRelation: "manifestacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      setores: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          email: string | null
          gestor_id: string | null
          id: string
          nome: string
          sigla: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          email?: string | null
          gestor_id?: string | null
          id?: string
          nome: string
          sigla: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          email?: string | null
          gestor_id?: string | null
          id?: string
          nome?: string
          sigla?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_setores_gestor"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean
          auth_id: string | null
          avatar: string | null
          cargo: string | null
          created_at: string
          email: string
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["perfil_usuario"]
          primeiro_acesso: boolean
          setor_id: string | null
          telefone: string | null
          ultimo_acesso: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          auth_id?: string | null
          avatar?: string | null
          cargo?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
          primeiro_acesso?: boolean
          setor_id?: string | null
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          auth_id?: string | null
          avatar?: string | null
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
          primeiro_acesso?: boolean
          setor_id?: string | null
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_permissoes: {
        Row: {
          concedido_em: string
          concedido_por: string | null
          id: string
          permissao_id: string
          usuario_id: string
        }
        Insert: {
          concedido_em?: string
          concedido_por?: string | null
          id?: string
          permissao_id: string
          usuario_id: string
        }
        Update: {
          concedido_em?: string
          concedido_por?: string | null
          id?: string
          permissao_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_permissoes_permissao_id_fkey"
            columns: ["permissao_id"]
            isOneToOne: false
            referencedRelation: "permissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_permissoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gerar_protocolo: { Args: never; Returns: string }
      check_admin_users_exist: { Args: never; Returns: boolean }
    }
    Enums: {
      acao_permissao:
        | "CREATE"
        | "READ"
        | "UPDATE"
        | "DELETE"
        | "EXPORT"
        | "APPROVE"
        | "FORWARD"
        | "CLOSE"
        | "REOPEN"
        | "MANAGE"
      canal_manifestacao:
        | "PORTAL"
        | "EMAIL"
        | "PRESENCIAL"
        | "TELEFONE"
        | "WHATSAPP"
        | "CARTA"
        | "OUTROS"
      meio_comunicacao: "EMAIL" | "TELEFONE" | "PRESENCIAL" | "WHATSAPP"
      perfil_usuario:
        | "ADMIN"
        | "OUVIDOR"
        | "ASSISTENTE"
        | "GESTOR"
        | "ANALISTA"
        | "CONSULTA"
      prioridade_manifestacao: "BAIXA" | "MEDIA" | "ALTA" | "URGENTE"
      sentimento: "POSITIVO" | "NEUTRO" | "NEGATIVO"
      status_encaminhamento:
        | "PENDENTE"
        | "EM_ANALISE"
        | "RESPONDIDO"
        | "ATRASADO"
      status_manifestacao:
        | "NOVA"
        | "EM_ANALISE"
        | "ENCAMINHADA"
        | "EM_ATENDIMENTO"
        | "AGUARDANDO_RETORNO"
        | "RESPONDIDA"
        | "ENCERRADA"
        | "CANCELADA"
      tipo_comunicacao:
        | "EMAIL"
        | "COMENTARIO"
        | "TELEFONE"
        | "PRESENCIAL"
        | "WHATSAPP"
        | "SISTEMA"
      tipo_manifestacao:
        | "ELOGIO"
        | "SUGESTAO"
        | "RECLAMACAO"
        | "DENUNCIA"
        | "SOLICITACAO"
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
      acao_permissao: [
        "CREATE",
        "READ",
        "UPDATE",
        "DELETE",
        "EXPORT",
        "APPROVE",
        "FORWARD",
        "CLOSE",
        "REOPEN",
        "MANAGE",
      ],
      canal_manifestacao: [
        "PORTAL",
        "EMAIL",
        "PRESENCIAL",
        "TELEFONE",
        "WHATSAPP",
        "CARTA",
        "OUTROS",
      ],
      meio_comunicacao: ["EMAIL", "TELEFONE", "PRESENCIAL", "WHATSAPP"],
      perfil_usuario: [
        "ADMIN",
        "OUVIDOR",
        "ASSISTENTE",
        "GESTOR",
        "ANALISTA",
        "CONSULTA",
      ],
      prioridade_manifestacao: ["BAIXA", "MEDIA", "ALTA", "URGENTE"],
      sentimento: ["POSITIVO", "NEUTRO", "NEGATIVO"],
      status_encaminhamento: [
        "PENDENTE",
        "EM_ANALISE",
        "RESPONDIDO",
        "ATRASADO",
      ],
      status_manifestacao: [
        "NOVA",
        "EM_ANALISE",
        "ENCAMINHADA",
        "EM_ATENDIMENTO",
        "AGUARDANDO_RETORNO",
        "RESPONDIDA",
        "ENCERRADA",
        "CANCELADA",
      ],
      tipo_comunicacao: [
        "EMAIL",
        "COMENTARIO",
        "TELEFONE",
        "PRESENCIAL",
        "WHATSAPP",
        "SISTEMA",
      ],
      tipo_manifestacao: [
        "ELOGIO",
        "SUGESTAO",
        "RECLAMACAO",
        "DENUNCIA",
        "SOLICITACAO",
      ],
    },
  },
} as const