import { ContentForm } from "../ContentForm";

export default function NovoConteudoPage() {
  return (
    <>
      <h1 className="h2-section mb-8">Novo conteúdo exclusivo</h1>
      <ContentForm
        values={{
          title: "",
          slug: "",
          description: "",
          kind: "video",
          youtube: "",
          externalUrl: "",
          published: false,
          fileName: null,
        }}
      />
    </>
  );
}
