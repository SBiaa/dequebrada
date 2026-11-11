/**
 * Formação "Da Quebrada ao Digital" (página /daquebradaaodigital).
 * Preço, garantia e módulos vêm do site atual. O que está em [COLCHETES] falta confirmar.
 *
 * Botão de compra: se a variável CHECKOUT_URL_DA_QUEBRADA_AO_DIGITAL existir (link da Hotmart,
 * Kiwify, Mercado Pago etc.), o botão leva ao checkout. Se não existir, leva ao WhatsApp.
 */

import type { IconName } from "@/components/ui/Icon";

type Card = { icon?: IconName; title: string; text: string };

export const FORMACAO = {
  price: "R$ 47",
  priceNote: "acesso imediato e vitalício",
  guarantee: "Garantia incondicional de 7 dias: não gostou, devolvemos 100% do valor.",
  installments: "[PARCELAMENTO A CONFIRMAR]",
};

export const PAINS: Card[] = [
  { icon: "route", title: "Não sabe por onde começar", text: "Todo mundo fala de Instagram e TikTok, mas você trava na hora de executar." },
  { icon: "eyeOff", title: "Posta no escuro", text: "Tem perfil, mas o alcance não vem." },
  { icon: "coins", title: "Seguidor não vira cliente", text: "O perfil cresce, o caixa não." },
  { icon: "camera", title: "Trava na frente da câmera", text: "Não sabe o que falar nem como se soltar." },
];

export const FOR_WHO = [
  "Tem um pequeno negócio e quer vender mais pelas redes",
  "Quer começar no digital, mas não sabe por onde",
  "Já posta, mas o perfil não traz cliente",
  "Prefere aprender pelo celular, no seu ritmo",
];

export const NOT_FOR_WHO = [
  "Procura fórmula de dinheiro rápido",
  "Não está disposto a colocar em prática o que aprende",
];

export const MODULES: Card[] = [
  { icon: "brain", title: "Mentalidade de empreendedor digital", text: "Vencer o medo e construir consistência." },
  { icon: "pin", title: "Posicionamento digital", text: "Perfil, bio e mensagem que atraem o cliente certo." },
  { icon: "video", title: "Criação de conteúdo", text: "Gravar com o celular, pauta e roteiro." },
  { icon: "phone", title: "TikTok e Instagram", text: "Crescimento orgânico, sem dançar." },
  { icon: "megaphone", title: "Tráfego pago", text: "Impulsionar com pouco dinheiro, sem desperdício." },
  { icon: "coins", title: "Monetização", text: "Transformar seguidor em cliente." },
];

export const INCLUDED = [
  "6 módulos completos",
  "Aulas novas adicionadas continuamente",
  "Acesso pelo celular, suporte e comunidade",
  "Certificado de conclusão",
];

export const HOW_IT_WORKS: Card[] = [
  { icon: "wallet", title: "Você garante sua vaga", text: "Pagamento pelo checkout. Formas de pagamento: [A CONFIRMAR]." },
  { icon: "phone", title: "Recebe o acesso", text: "Acesso imediato às aulas, direto no celular." },
  { icon: "video", title: "Assiste no seu ritmo", text: "No ônibus, no intervalo, em casa." },
  { icon: "rocket", title: "Coloca em prática", text: "Cada módulo vira ação no seu perfil e no seu negócio." },
];

export const DIFFERENT: Card[] = [
  { icon: "chat", title: "Linguagem da quebrada", text: "Sem papo de guru, sem teoria de livro." },
  { icon: "star", title: "Aulas sempre novas", text: "Você paga uma vez e o conteúdo continua crescendo." },
  { icon: "phone", title: "Pelo celular", text: "No ônibus, no intervalo, em casa." },
  { icon: "shield", title: "Garantia de 7 dias", text: "Não gostou? Devolvemos 100% do valor." },
];

/** Depoimentos reais de alunos. Não preencher com texto inventado. */
export const TESTIMONIALS = [
  { quote: "[DEPOIMENTO REAL DE ALUNO]", name: "[NOME DO ALUNO]", business: "[NEGÓCIO / CIDADE]" },
  { quote: "[DEPOIMENTO REAL DE ALUNO]", name: "[NOME DO ALUNO]", business: "[NEGÓCIO / CIDADE]" },
  { quote: "[DEPOIMENTO REAL DE ALUNO]", name: "[NOME DO ALUNO]", business: "[NEGÓCIO / CIDADE]" },
];

export const FORMACAO_FAQ = [
  {
    q: "Quanto custa?",
    a: "R$ 47, com acesso imediato e vitalício. Parcelamento: [A CONFIRMAR].",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem garantia incondicional de 7 dias. Pediu dentro do prazo, devolvemos 100% do valor.",
  },
  {
    q: "Preciso de computador?",
    a: "Não. As aulas foram pensadas pra assistir pelo celular.",
  },
  {
    q: "Por quanto tempo tenho acesso?",
    a: "O acesso é vitalício, e as aulas novas que entrarem também ficam liberadas pra você.",
  },
  {
    q: "Onde ficam as aulas?",
    a: "Plataforma das aulas: [A CONFIRMAR]. Você recebe o acesso logo depois do pagamento.",
  },
  {
    q: "Tem certificado?",
    a: "Sim, certificado de conclusão.",
  },
  {
    q: "Como funciona o suporte?",
    a: "Você tem suporte e acesso à comunidade. Canal e horário do suporte: [A CONFIRMAR].",
  },
];
