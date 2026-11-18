/**
 * Quizzes iniciais, criados por `npm run seed:quizzes`.
 * Depois de criados, edite pelo painel (/painel/quizzes). Mudar este arquivo não altera quizzes que já existem.
 */
import type { QuizStep } from "../lib/quiz.ts";

type Seed = {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  ctaLabel: string;
  contactTitle: string;
  askEmail: boolean;
  askInstagram: boolean;
  finalTitle: string;
  finalText: string;
  steps: QuizStep[];
};

function step(id: string, kind: QuizStep["kind"], question: string, extra: Partial<QuizStep> = {}): QuizStep {
  return { id, kind, question, hint: "", options: [], placeholder: "", buttonLabel: "", videoUrl: "", ...extra };
}

export const QUIZ_SEEDS: Seed[] = [
  {
    slug: "estudio",
    title: "Monte sua gravação em 1 minuto",
    eyebrow: "Estúdio de Quebrada",
    intro: "",
    ctaLabel: "Começar",
    contactTitle: "Pra onde mandamos a proposta?",
    askEmail: true,
    askInstagram: false,
    finalTitle: "Recebemos!",
    finalText: "A gente vai te chamar no WhatsApp em breve. Se quiser adiantar, fala com a gente agora.",
    steps: [
      step("servico", "single", "O que você quer gravar?", {
        options: [
          "Podcast (R$147/hora)",
          "Videoaula (a partir de R$197/hora)",
          "Reels, chamadas e comerciais (a partir de R$197/hora)",
          "Gravação externa no meu local (R$450/hora)",
          "Ainda não sei",
        ],
      }),
      step("edicao", "single", "Você precisa de edição?", {
        hint: "Na videoaula e nos reels, gravação + edição sai por R$297.",
        options: ["Só a gravação", "Gravação + edição", "Quero também o pacote de 3 cortes (R$100)", "Quero entender as opções"],
      }),
      step("canal", "single", "Você já tem canal ou redes pro conteúdo?", {
        hint: "Se estiver começando do zero, a gente cria canal no YouTube, logo e identidade visual por R$250.",
        options: ["Já tenho tudo pronto", "Tenho, mas precisa de ajuste", "Estou começando do zero"],
      }),
      step("frequencia", "single", "Com que frequência pretende gravar?", {
        options: ["Uma vez só", "Toda semana", "A cada 15 dias", "Uma vez por mês"],
      }),
      step("quando", "single", "Pra quando você quer gravar?", {
        options: ["Esta semana", "Nas próximas 2 semanas", "Este mês", "Ainda estou pesquisando"],
      }),
    ],
  },
  {
    slug: "participe",
    title: "Garanta sua vaga no De Quebrada Podcast",
    eyebrow: "Exclusivo para empreendedores e especialistas",
    intro:
      "Responda algumas perguntas rápidas. Se você for selecionado(a), a gente entra em contato pra alinhar a pauta antes da gravação. Leva cerca de 1 minuto.",
    ctaLabel: "Quero participar do De Quebrada",
    contactTitle: "Se você for selecionado(a), como podemos falar com você?",
    askEmail: false,
    askInstagram: true,
    finalTitle: "Recebemos sua inscrição!",
    finalText:
      "Nossa equipe vai analisar suas respostas. Sendo selecionado(a), marcamos uma conversa pra alinhar as pautas e os próximos passos.",
    steps: [
      step("perfil", "single", "Qual dessas opções melhor te define no momento?", {
        options: [
          "Empreendedor(a) / dono(a) de negócio",
          "Profissional liberal ou especialista",
          "Mentor(a) / consultor(a)",
          "Criador(a) de conteúdo",
          "Artista / produtor(a) cultural",
        ],
      }),
      step("prova", "info", "Quem passa pelo De Quebrada cresce junto", {
        hint:
          "Mais de 600 episódios, 4x premiado e o podcast nº 1 do Alto Tietê. Participar não é só uma entrevista: é divulgação antes, ao vivo no YouTube, Facebook e Instagram, cortes pras redes e postagens em collab com um público engajado da região.",
        buttonLabel: "Continuar",
      }),
      step("experiencia", "single", "Você já participou de algum podcast?", {
        options: ["Sim, várias vezes", "Algumas vezes", "Apenas uma vez", "Nunca, mas quero muito"],
      }),
      step("objetivo", "multi", "Se você for selecionado(a), qual seria o objetivo da sua participação?", {
        hint: "Pode marcar mais de uma opção.",
        options: [
          "Ganhar autoridade na minha área",
          "Divulgar meu negócio na região",
          "Vender meus produtos ou serviços",
          "Crescer nas redes sociais",
          "Contar minha história",
        ],
        buttonLabel: "Continuar",
      }),
      step("temas", "text", "Quais temas não poderiam faltar na sua participação?", {
        hint: "Sua resposta é analisada pela nossa equipe pra encaixar sua participação no melhor formato.",
        placeholder: "Digite aqui suas sugestões de temas",
        buttonLabel: "Continuar",
      }),
      step("quando", "single", "Se você for selecionado(a), quando teria disponibilidade pra gravar?", {
        hint: "Isso nos ajuda a organizar a agenda do estúdio.",
        options: [
          "Já na próxima semana (quero prioridade)",
          "Daqui a 2 semanas",
          "Daqui a 3 semanas",
          "Depois de 4 semanas",
        ],
      }),
      step("investimento", "single", "A participação tem investimento único de R$350. Faz sentido pra você agora?", {
        hint:
          "Inclui: gravação no estúdio, divulgação prévia com banner, ao vivo no YouTube, Facebook e Instagram, cortes pras redes enviados pra você e postagens em collab.",
        options: ["Sim, à vista no Pix", "Sim, parcelado no cartão", "Ainda não posso investir no momento"],
      }),
    ],
  },
];
