import { QuizEditor } from "../QuizEditor";

export default function NovoQuizPage() {
  return (
    <>
      <h1 className="h2-section mb-8">Novo quiz</h1>
      <QuizEditor
        values={{
          id: "",
          title: "",
          slug: "",
          eyebrow: "",
          intro: "",
          ctaLabel: "Começar",
          steps: [],
          contactTitle: "Como podemos falar com você?",
          askEmail: true,
          askInstagram: false,
          finalTitle: "Recebemos!",
          finalText: "A gente vai te chamar no WhatsApp em breve.",
          published: false,
        }}
      />
    </>
  );
}
