# Fluxo de Trabalho do Supabase (Supabase Workflow)

Este projeto utiliza o **Supabase Cloud** para o banco de dados e backend. NÃO tente executar ou gerenciar uma instância local do Supabase via Docker.

## Regras Críticas

1.  **Sempre use o Supabase CLI Cloud**:
    *   Não execute comandos que dependam de uma instância local (ex: `supabase start`, `supabase stop`, `supabase db reset` local).
    *   Para aplicar alterações no banco de dados, utilize comandos que interajam com o projeto remoto (ex: `supabase db push`).

2.  **Credenciais**:
    *   As credenciais de conexão e chaves de API estão localizadas no arquivo `.env.local`.
    *   Consulte este arquivo para obter `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, e outras variáveis necessárias.

3.  **Migrações**:
    *   Novas migrações devem ser criadas no diretório `supabase/migrations`.
    *   A aplicação das migrações deve ser feita visando o ambiente remoto (Cloud).

## Motivo
O ambiente de desenvolvimento local não possui o Docker configurado/rodando para suportar o stack completo do Supabase localmente. Todas as operações devem assumir a conexão com a infraestrutura em nuvem existente.
