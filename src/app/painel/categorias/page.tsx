import { allCategories } from "@/lib/blog";
import { deleteCategoryAction } from "../actions";
import { CategoryForm } from "./CategoryForm";

export default async function CategoriasPage() {
  const categories = await allCategories();
  return (
    <>
      <h1 className="h2-section">Categorias</h1>
      <p className="mt-3 text-muted">
        Ex.: cidades (Ferraz de Vasconcelos, Poá, Suzano) ou temas (Empreendedorismo, Eventos).
      </p>
      <div className="mt-8 max-w-xl">
        <CategoryForm />
      </div>
      {categories.length > 0 && (
        <ul className="mt-10 divide-y divide-line rounded-xl border border-line bg-surface">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <CategoryForm id={c.id} name={c.name} compact />
                <p className="mt-1 text-sm text-muted">/blog/categoria/{c.slug}</p>
              </div>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="btn btn-ghost !min-h-10 !text-sm">
                  Excluir <span className="sr-only">{c.name}</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-sm text-muted">
        Excluir uma categoria não apaga os posts: eles ficam &quot;sem categoria&quot;.
      </p>
    </>
  );
}
