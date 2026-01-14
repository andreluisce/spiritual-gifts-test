## Supabase CLI Access

- O Supabase CLI já está disponível no ambiente. As credenciais do projeto estão em `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto (ex: `https://vttkurdzstlkybojigry.supabase.co`)
  - `SUPABASE_SERVICE_ROLE_KEY` — chave service role (use apenas em scripts server-side/admin)
  - `SUPABASE_ACCESS_TOKEN` e `SUPABASE_PROJECT_ID` — usados pelo CLI/link.
- Para rodar comandos do CLI no projeto linkado:
  ```bash
  npx supabase link --project-ref <project-ref>   # se precisar religar (já linkado em .env.local)
  npx supabase db push                             # aplica migrations no projeto remoto
  npx supabase db remote commit -m "msg"           # cria migration a partir do remoto
  ```
- Se precisar apontar para outro projeto, exporte `SUPABASE_ACCESS_TOKEN` e use `--project-ref` do novo projeto.
- Nunca exponha a service role em clientes; use-a apenas em scripts administrativos/CLI.
