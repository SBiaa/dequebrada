import { allCategories } from "@/lib/blog";
import { requireAdmin } from "@/lib/auth";
import { PostForm } from "../../PostForm";

export default async function NovoPostPage() {
  const user = await requireAdmin();
  const categories = await allCategories();
  return (
    <>
      <h1 className="h2-section mb-8">Novo post</h1>
      <PostForm
        categories={categories}
        values={{
          title: "",
          slug: "",
          excerpt: "",
          body: "",
          coverUrl: null,
          coverAlt: "",
          categoryId: null,
          authorName: user.name,
          status: "draft",
        }}
      />
    </>
  );
}
