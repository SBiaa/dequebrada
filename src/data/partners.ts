/**
 * Parceiros e patrocinadores.
 * ATENÇÃO: os itens abaixo são [EXEMPLO] até a lista real chegar.
 * logo: caminho em /public (ex.: "/parceiros/nome.png"). Sem logo, aparece o espaço reservado.
 */

export type PartnerKind = "patrocinador" | "parceiro";

export type Partner = {
  name: string;
  kind: PartnerKind;
  description: string;
  logo?: string;
  links: { label: string; href: string }[];
};

export const PARTNERS: Partner[] = [
  {
    name: "[PATROCINADOR EXEMPLO 1]",
    kind: "patrocinador",
    description: "[DESCRIÇÃO CURTA DO PATROCINADOR]",
    links: [{ label: "Instagram", href: "https://www.instagram.com/" }],
  },
  {
    name: "[PATROCINADOR EXEMPLO 2]",
    kind: "patrocinador",
    description: "[DESCRIÇÃO CURTA DO PATROCINADOR]",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/" },
      { label: "Site", href: "https://example.com/" },
    ],
  },
  {
    name: "[PARCEIRO EXEMPLO 1]",
    kind: "parceiro",
    description: "[DESCRIÇÃO CURTA DO PARCEIRO]",
    links: [{ label: "Instagram", href: "https://www.instagram.com/" }],
  },
  {
    name: "[PARCEIRO EXEMPLO 2]",
    kind: "parceiro",
    description: "[DESCRIÇÃO CURTA DO PARCEIRO]",
    links: [{ label: "Instagram", href: "https://www.instagram.com/" }],
  },
  {
    name: "[PARCEIRO EXEMPLO 3]",
    kind: "parceiro",
    description: "[DESCRIÇÃO CURTA DO PARCEIRO]",
    links: [{ label: "Site", href: "https://example.com/" }],
  },
];
