import { permanentRedirect } from "next/navigation";

/** O quiz do estúdio agora fica em /quiz/estudio (editável no painel). */
export default function EstudioQuizRedirect() {
  permanentRedirect("/quiz/estudio");
}
