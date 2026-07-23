# ARK Tracker — Registro da Tribo

Site para acompanhar genética (histórico de stats), plantel de dinos e timers
de breeding com aviso automático no Discord — mesmo com o site fechado.

## O que você precisa (tudo grátis)

1. Conta no [Supabase](https://supabase.com) — banco de dados
2. Conta no [Upstash](https://upstash.com) — agenda o disparo exato do webhook
3. Um webhook do Discord no canal da tribo
4. Conta no [Vercel](https://vercel.com) — hospedagem
5. Conta no [GitHub](https://github.com) — pra conectar o Vercel ao código

---

## Passo 1 — Supabase (banco de dados)

1. Crie um projeto novo em supabase.com (região mais próxima de vocês).
2. Vá em **SQL Editor** → cole o conteúdo de `supabase/schema.sql` → **Run**.
3. Vá em **Project Settings → API** e copie:
   - `Project URL` → vai virar `SUPABASE_URL`
   - `service_role` key (não é a `anon` key!) → vai virar `SUPABASE_SERVICE_ROLE_KEY`

## Passo 2 — Discord Webhook

1. No Discord, vá no canal onde quer receber os avisos.
2. Editar Canal → Integrações → Webhooks → Novo Webhook.
3. Copie a URL → vai virar `DISCORD_WEBHOOK_URL`.

## Passo 3 — Upstash QStash

1. Crie conta em upstash.com → vá em **QStash**.
2. Copie o `QSTASH_TOKEN` no painel.
   (Não precisa criar nada manualmente — o site agenda as mensagens sozinho via API.)

## Passo 4 — Subir o código pro GitHub

```bash
cd ark-tracker
git init
git add .
git commit -m "primeira versão"
```
Crie um repositório novo no GitHub e siga as instruções dele pra dar push
(`git remote add origin ...` e `git push`).

## Passo 5 — Deploy no Vercel

1. Em vercel.com → **Add New → Project** → importe o repositório do GitHub.
2. Antes de clicar em Deploy, adicione as variáveis de ambiente (aba
   **Environment Variables**) usando o `.env.example` como guia:
   - `SITE_PASSWORD`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DISCORD_WEBHOOK_URL`
   - `QSTASH_TOKEN`
   - `INTERNAL_WEBHOOK_SECRET` (qualquer string aleatória, tipo senha)
   - `APP_URL` → deixe em branco por enquanto, o Vercel só te dá a URL
     depois do primeiro deploy.
3. Clique em **Deploy**.
4. Depois que terminar, copie a URL que o Vercel gerou (ex:
   `https://ark-tracker-seunome.vercel.app`), volte em **Settings →
   Environment Variables**, edite `APP_URL` com essa URL, e clique em
   **Redeploy** (Deployments → ⋯ → Redeploy).

Pronto — manda o link do site pros seus amigos junto com a senha da tribo.

## Rodando localmente (opcional, pra testar antes de subir)

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```
Abra http://localhost:3000

## Como funciona por baixo dos panos

- **Genética**: cada vez que você cadastra um novo stat pra uma linhagem
  (mesma espécie + apelido + sexo), o registro anterior vira "histórico"
  automaticamente e o novo vira o "atual".
- **Mutações**: editar o contador de mutações de um dino dispara um aviso
  no Discord na hora.
- **Timers**: ao criar um timer, o site agenda uma mensagem no Upstash
  QStash pra disparar exatamente no instante em que o timer zera — não
  depende de ninguém estar com o site aberto, nem de cron job (o plano
  grátis do Vercel só permite cron 1x/dia, então não daria pra confiar nele
  pra isso).

## Limites do plano grátis (bem folgados pra uso com a tribo)

- Vercel Hobby: sem custo pra esse tipo de app pequeno.
- Supabase free: 500MB de banco — muito mais do que o suficiente.
- Upstash QStash free: 500 mensagens/dia — cada timer criado usa 1.
