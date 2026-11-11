# De Quebrada: proposta de layout (Ace Lab)

Versão melhorada do site dequebrada.com, feita como **exemplo** para o Carlos Junior. Não é o site real: todas as páginas têm `noindex, nofollow` e uma faixa "Proposta de layout · Ace Lab" no topo.

Stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS. Blog e painel: Neon Postgres (Drizzle ORM), Vercel Blob (imagens), senhas com argon2id, e-mail pelo Resend.

## Como rodar

```bash
npm install
npx vercel env pull .env.local   # baixa DATABASE_URL, BLOB_READ_WRITE_TOKEN etc.
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run lint
```

## Como publicar na Vercel

1. Suba a pasta para um repositório no GitHub.
2. Na Vercel: **Add New → Project**, importe o repositório (Next.js é detectado automaticamente).
3. (Opcional) Em **Settings → Environment Variables**, adicione `NEXT_PUBLIC_META_PIXEL_ID` e/ou `NEXT_PUBLIC_GA_ID`. Veja `.env.example`.
4. Clique em **Deploy**.

Pelo terminal: `npx vercel` (preview) e `npx vercel --prod`.

## Blog e painel do Carlos

- Público: `/blog` (busca e paginação), `/blog/[slug]`, `/blog/categoria/[categoria]`, `/feed.xml` (RSS) e `/sitemap.xml`. `/news` redireciona para `/blog`.
- Painel: `/painel` (protegido). Escrever, publicar, tirar do ar e excluir posts; criar e renomear categorias; enviar imagem de capa (JPG/PNG/WEBP até 4 MB, com texto alternativo obrigatório).
- O texto do post é em Markdown simples (dicas aparecem no formulário). O HTML é limpo no servidor: script, iframe e atributos perigosos são removidos.
- Páginas do blog ficam em cache e são atualizadas na hora em que o Carlos salva no painel (e a cada 5 min).
- Cada post gera title e description próprios, Open Graph, JSON-LD `NewsArticle` e tempo de leitura.

### Contas e segurança

- Login: `/entrar`. Esqueci a senha: `/esqueci-senha` (link por e-mail, vale 1 hora, uso único). Ao trocar a senha, todas as sessões são encerradas.
- Senhas guardadas só como hash argon2id. Sessão em cookie httpOnly; o banco guarda só o hash do token.
- Bloqueio após 5 erros por e-mail ou 20 por IP em 15 minutos. A mensagem de erro não revela se o e-mail existe.
- `/painel` é protegido em três camadas: proxy (sem cookie → login), layout e cada Server Action checam sessão válida e papel `admin`.

### Primeiro acesso (criar a conta do Carlos)

```bash
npm run admin:create      # pergunta e-mail, nome e senha
```

### Banco de dados

```bash
npm run db:generate   # gera migração depois de mudar src/db/schema.ts
npm run db:migrate    # aplica no banco do DATABASE_URL_UNPOOLED
```

A migração inicial já foi aplicada no banco Neon `dequebrada-db` (projeto Vercel `dequebrada-proposta`).

## Área de membros

- `/cadastro`: nome, e-mail, senha e aceite da Política de Privacidade (obrigatório, data gravada).
- `/membros`: pública para quem não tem conta (explica e chama para o cadastro). Logado, mostra o status da assinatura.
- `/membros/episodios`: episódios do De Quebrada Podcast tocando no site (player `youtube-nocookie`). Exige conta (grátis). Sem `YOUTUBE_API_KEY` aparecem só os mais recentes; com a chave, todos. Lista em cache de 1 hora.
- `/membros/conteudos/[slug]`: conteúdos exclusivos (vídeo/aula do YouTube "não listado", PDF ou link). **Só assinantes**: a checagem é no servidor, e o PDF sai por `/membros/arquivo/[id]`, que confere a assinatura a cada download (sem link público).
- `/conta`: dados da conta, trocar senha, sair e **excluir conta e dados** (LGPD, pede a senha).
- Painel: `/painel/assinantes` (liberar ou retirar acesso manualmente) e `/painel/conteudos` (criar, publicar, tirar do ar, excluir; PDF até 4 MB guardado no banco).

**Cobrança ainda não implementada.** Hoje: a pessoa cria a conta → paga por fora (WhatsApp) → o Carlos clica em "Liberar acesso".

### Cobrança recorrente

**Decisão (nov/2026): sem plataforma de cobrança por enquanto.** O acesso de assinante é liberado manualmente no painel. A tabela abaixo fica como referência para quando o cliente quiser automatizar.

Taxas aproximadas; conferir no site de cada um antes de fechar.

| | Mercado Pago (Assinaturas) | Stripe (Billing) | Hotmart / Kiwify |
|---|---|---|---|
| Pagamento recorrente | Cartão | Cartão | Cartão (e Pix/boleto conforme o plano) |
| Taxa | ~4–5% no cartão | ~4–5% + tarifa fixa + taxa do Billing | ~9–10% + tarifa fixa por venda |
| Checkout | Do Mercado Pago | Do Stripe (ou embutido) | Pronto, com página de vendas e afiliados |
| Integração aqui | Webhook marca `isSubscriber` | Webhook + portal do assinante (cancelar, trocar cartão) | Webhook marca `isSubscriber` |
| Bom para | Público que já usa MP | Controle e menor custo em escala | Quem já vende cursos lá e quer afiliados |

Em todas, o login continua sendo o deste site; a plataforma só avisa quem pagou ou cancelou.

### Aviso de cookies

Só aparece se `NEXT_PUBLIC_META_PIXEL_ID` ou `NEXT_PUBLIC_GA_ID` estiverem configurados. Pixel e GA só carregam depois de "Aceitar". O cookie de login (`dq_session`) é essencial e não depende do aviso.

## Páginas

Mesma estrutura do site atual, com texto real e URLs sem acento.

| Rota | Site atual | O que mudou |
|---|---|---|
| `/` | Só um carrossel de notícias | Home com notícias, produtos, Carlos, canais, provas, FAQ e CTA |
| `/blog` | `/blog` | Blog com painel próprio, categorias, busca, paginação, RSS e sitemap. `/news` redireciona |
| `/business` | `/dequebradabusiness` | Página era um iframe sem texto indexável; agora é texto real |
| `/estudio` | `/podcasts` | Estúdio + participação no podcast, galeria e FAQ. `/podcast` e `/podcasts` redirecionam para cá |
| `/publicidade` | (cardápio de serviços) | Cardápio de publicidade e mídia kit resumido |
| `/parceiros` | (não existia) | Patrocinadores e parceiros com links para as redes |
| `/loja` | (não existia) | Vitrine com filtro por categoria. Compra pelo WhatsApp (mensagem com produto, variação e código) ou link externo |
| `/membros` | (não existia) | Área de membros: cadastro, episódios do YouTube no site e conteúdos exclusivos para assinantes |
| `/daquebradaaodigital` | `/daquebradaaodigital` | Mesma URL da divulgação. Página de vendas completa (pra quem é, módulos, como funciona, depoimentos, incluso, garantia, FAQ). `/da-quebrada-ao-digital` redireciona para cá |
| `/presenca-digital` | `/presençadigital` (com cedilha) | URL sem acento, canais e números em texto |
| `/sobre` | `/sobre` | História, equipe, valores, "Onde nos encontrar" (todos os canais), endereço com mapa e telefone |
| 4 páginas legais | Links levavam à home | Páginas reais (texto-base a validar com jurídico) |

## Pixel da Meta e Google Analytics

Só carregam se as variáveis existirem. Todo clique em botão de WhatsApp dispara o evento `Lead`. Outros CTAs de venda (ex.: "Quero ser parceiro") disparam `CTA` no Pixel e `cta_click` no GA. O botão de checkout dispara `InitiateCheckout` no Pixel e `begin_checkout` no GA.
O mapa do Google em `/sobre` só carrega quando a pessoa clica em "Mostrar mapa".

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | Pixel da Meta |
| `NEXT_PUBLIC_GA_ID` | Google Analytics (ex.: `G-XXXXXXXXXX`) |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Neon Postgres (criado pela integração; já configurado na Vercel) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob para as capas (já configurado na Vercel) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Envio do e-mail de nova senha. **Falta configurar** |
| `YOUTUBE_CHANNEL_ID` | Canal do podcast: `UCPAZis3gDcWz67DUwtjaPJg`. **Falta adicionar na Vercel** |
| `YOUTUBE_API_KEY` | Opcional: lista todos os episódios (sem ela, só os ~15 mais recentes) |
| `SITE_URL` | Domínio final (links de e-mail, sitemap, RSS, Open Graph) |
| `CHECKOUT_URL_DA_QUEBRADA_AO_DIGITAL` | Link de checkout da formação (https). Sem ele, os botões de compra vão para o WhatsApp. Após mudar na Vercel, faça um novo deploy |

## Menu

Início, Da Quebrada ao Digital, Estúdio, Publicidade, Blog, Loja, Parceiros, Sobre, Área de membros. Business e Presença Digital saíram do menu, mas continuam no ar, com link no rodapé.
Até a fase 3, "Blog" aponta para `/news`.

## Onde editar (sem mexer em componente)

- `src/lib/site.ts`: telefone, endereço, CNPJ, mensagens de WhatsApp, menu.
- `src/data/channels.ts`: **todas as redes e canais** (usado no rodapé, home, Sobre e Presença Digital).
- `src/data/studio.ts`: pacotes, preços, serviços avulsos, galeria e FAQ do estúdio.
- `src/data/advertising.ts`: cardápio de publicidade e mídia kit.
- `src/data/formacao.ts`: preço, módulos, pra quem é, depoimentos e FAQ da formação.
- `src/data/products.ts`: produtos da loja (sku, preço em centavos, variações, foto, botão WhatsApp ou link externo, `available: false` para esconder).
- `src/data/partners.ts`: parceiros e patrocinadores (logo em `/public/parceiros/`).
- Notícias: pelo painel em `/painel`. `src/lib/news.ts` só tem os exemplos que a home mostra enquanto não houver post publicado.
- `src/app/*/page.tsx`: cada página. `src/components/sections/`: seções da home.

## Conteúdo real aproveitado do site atual

Textos, preços e números das páginas Business, Podcast, Da Quebrada ao Digital, Presença Digital e Sobre foram trazidos do site atual, em texto de verdade. Os preços do podcast (R$ 250, R$ 350, R$ 750/mês, R$ 1.200/mês e avulsos) e o da formação (R$ 47, garantia de 7 dias) também. CNPJ: 59.814.997/0001-66.

## Divergências no site atual (confirmar com o cliente)

- **Alcance:** Business e Presença Digital falam em 1,3M views/mês; a página do Podcast fala em 800k pessoas/mês. A proposta usa 1,3M views por mês e omite os 800k.
- **Endereço:** o site atual diz "Rua Santos Dumont, 1320, Vila Ana Maria"; a proposta usa "Avenida Santos Dumont, 1320, Tanquinho, 08531-100", como no briefing.
- **Presença Digital:** no site atual é a página dos canais e números do De Quebrada, não um serviço. A proposta mantém assim.

## O que falta o cliente preencher

Tudo que aparece em **[COLCHETES]** amarelos no site. Busque por `[` no código.

| Marcador | Onde |
|---|---|
| `[DEFINIR]` | Preço "a partir de R$" da consultoria Business |
| `[A CONFIRMAR]` | FAQ (prazos, segmentos, pagamento) e textos legais |
| `[DEPOIMENTO REAL AQUI]`, `[NOME DO CLIENTE]`, `[NEGÓCIO / CASE]` | Provas na home (3 espaços) |
| `[E-MAIL REAL AQUI]` | Rodapé e páginas legais |
| `[PRODUTO EXEMPLO]`, `[DESCRIÇÃO DO PRODUTO...]`, `[DEFINIR PREÇO]`, `[FOTO DO PRODUTO]` | Loja: lista real, fotos, preços e se cada um vende por WhatsApp ou link externo (e qual link) |
| `[COMO FUNCIONA A ENTREGA OU RETIRADA]` | Loja |
| Valor da assinatura `[DEFINIR]` e forma de pagamento | Área de membros |
| `[PLATAFORMA DE PAGAMENTO, QUANDO HOUVER]` | Política de Privacidade |
| Primeiros conteúdos exclusivos | Pelo painel |
| Conta do Carlos no painel | `npm run admin:create` com o e-mail dele |
| Resend (conta + domínio verificado) | E-mail de "esqueci minha senha" |
| Categorias e primeiros posts | Pelo painel |
| Link de checkout | Variável `CHECKOUT_URL_DA_QUEBRADA_AO_DIGITAL` (formação) |
| `[DEPOIMENTO REAL DE ALUNO]`, `[NOME DO ALUNO]`, `[NEGÓCIO / CIDADE]` | Formação: 3 depoimentos |
| `[PARCELAMENTO A CONFIRMAR]`, `[A CONFIRMAR]` | Formação: parcelamento, formas de pagamento, plataforma das aulas, canal de suporte |
| `[CONFERIR NÚMEROS]` | Seguidores e views por canal em Presença Digital |
| `[LISTA DE PRÊMIOS E REALIZAÇÕES]` | Página Sobre (hoje só em imagem no site atual) |
| `[FOTO ... AQUI]` | Fotos do Carlos e do estúdio |
| `[RAZÃO SOCIAL]`, `[DATA]`, foro, DPO, prazos de reembolso | Páginas legais |
| Depoimentos/cases do Raio-X | Seção Raio-X da Quebrada na home |
| `[ANO DE INÍCIO]`, `[COMPLETAR A HISTÓRIA...]` | Sobre: história |
| `[NOME DA PESSOA DA EQUIPE]`, `[FUNÇÃO]`, `[VALOR A CONFIRMAR]` | Sobre: equipe e valores |
| `[HORÁRIO DE ATENDIMENTO]` | Sobre: contato |
| `[EXEMPLO]` e `[DEFINIR]` no cardápio | Publicidade: cardápio oficial (aguardando) |
| `[CONFERIR NÚMERO]` | Publicidade: alcance mensal (1,3M views ou 800k pessoas?) |
| `[PERFIL DO PÚBLICO...]` | Publicidade: mídia kit |
| `[PATROCINADOR/PARCEIRO EXEMPLO]`, `[LOGO]` | Parceiros: lista real, logos e links |
| `[A CONFIRMAR]` no FAQ do estúdio | Equipamentos, capacidade, pagamento, critérios de entrevista |
| `[FOTO DO ESTÚDIO ...]` | Estúdio: 4 fotos da galeria |

Observações:
- Enquanto não houver post publicado no painel, a home mostra 3 exemplos reais do portal atual (abrem no site atual).
- Migrar as notícias do portal atual para o blog novo: [DECIDIR] (manual pelo painel ou importação).
- O logo é só texto estilizado. Trocar pelo logo oficial (microfone com corrente).
- Instagram do Rancho, do Estúdio e do Empreendedor, e o TikTok do Empreendedor, usam o padrão de URL dos @ informados no site atual. Conferir.

As páginas legais são **texto-base e precisam de validação de profissional jurídico**.

## Antes de ir pro ar de verdade

Remover o `noindex` (`robots` em `src/app/layout.tsx`) e a faixa `ProposalBanner`.
