# De Quebrada: proposta de layout (Ace Lab)

Versão melhorada do site dequebrada.com, feita como **exemplo** para o Carlos Junior. Não é o site real: todas as páginas têm `noindex, nofollow` e uma faixa "Proposta de layout · Ace Lab" no topo.

Stack: Next.js (App Router) + TypeScript + Tailwind CSS. Sem bibliotecas extras.

## Como rodar

```bash
npm install
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

## Páginas

Mesma estrutura do site atual, com texto real e URLs sem acento.

| Rota | Site atual | O que mudou |
|---|---|---|
| `/` | Só um carrossel de notícias | Home com notícias, produtos, Carlos, canais, provas, FAQ e CTA |
| `/news` | `/blog` | Filtro por cidade, cards com cidade e tempo de leitura |
| `/business` | `/dequebradabusiness` | Página era um iframe sem texto indexável; agora é texto real |
| `/estudio` | `/podcasts` | Estúdio + participação no podcast, galeria e FAQ. `/podcast` e `/podcasts` redirecionam para cá |
| `/publicidade` | (cardápio de serviços) | Cardápio de publicidade e mídia kit resumido |
| `/parceiros` | (não existia) | Patrocinadores e parceiros com links para as redes |
| `/loja`, `/membros` | (não existiam) | "Em breve" até as fases 4 e 5 |
| `/da-quebrada-ao-digital` | `/daquebradaaodigital` | Idem |
| `/presenca-digital` | `/presençadigital` (com cedilha) | URL sem acento, canais e números em texto |
| `/sobre` | `/sobre` | História, equipe, valores, "Onde nos encontrar" (todos os canais), endereço com mapa e telefone |
| 4 páginas legais | Links levavam à home | Páginas reais (texto-base a validar com jurídico) |

## Pixel da Meta e Google Analytics

Só carregam se as variáveis existirem. Todo clique em botão de WhatsApp dispara o evento `Lead`. Outros CTAs de venda (ex.: "Quero ser parceiro") disparam `CTA` no Pixel e `cta_click` no GA.
O mapa do Google em `/sobre` só carrega quando a pessoa clica em "Mostrar mapa".

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | Pixel da Meta |
| `NEXT_PUBLIC_GA_ID` | Google Analytics (ex.: `G-XXXXXXXXXX`) |

## Menu

Início, Da Quebrada ao Digital, Estúdio, Publicidade, Blog, Loja, Parceiros, Sobre, Área de membros. Business e Presença Digital saíram do menu, mas continuam no ar, com link no rodapé.
Até a fase 3, "Blog" aponta para `/news`. Até a fase 2, a formação continua em `/da-quebrada-ao-digital`.

## Onde editar (sem mexer em componente)

- `src/lib/site.ts`: telefone, endereço, CNPJ, mensagens de WhatsApp, menu.
- `src/data/channels.ts`: **todas as redes e canais** (usado no rodapé, home, Sobre e Presença Digital).
- `src/data/studio.ts`: pacotes, preços, serviços avulsos, galeria e FAQ do estúdio.
- `src/data/advertising.ts`: cardápio de publicidade e mídia kit.
- `src/data/partners.ts`: parceiros e patrocinadores (logo em `/public/parceiros/`).
- `src/lib/news.ts`: notícias de exemplo (no site final vêm do blog/CMS).
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
| `[LINK DE CHECKOUT]` | Botão da formação Da Quebrada ao Digital |
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
- As notícias da home e de `/news` são exemplos reais do portal atual e abrem a notícia no site atual. Para o site final, o portal precisa de um CMS ou blog próprio.
- O logo é só texto estilizado. Trocar pelo logo oficial (microfone com corrente).
- Instagram do Rancho, do Estúdio e do Empreendedor, e o TikTok do Empreendedor, usam o padrão de URL dos @ informados no site atual. Conferir.

As páginas legais são **texto-base e precisam de validação de profissional jurídico**.

## Antes de ir pro ar de verdade

Remover o `noindex` (`robots` em `src/app/layout.tsx`) e a faixa `ProposalBanner`.
