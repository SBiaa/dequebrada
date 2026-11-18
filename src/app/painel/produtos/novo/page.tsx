import { PRODUCT_CATEGORIES } from "@/data/products";
import { ProductForm } from "../ProductForm";

export default function NovoProdutoPage() {
  return (
    <>
      <h1 className="h2-section mb-8">Novo produto</h1>
      <ProductForm
        values={{
          name: "",
          sku: "",
          category: PRODUCT_CATEGORIES[0].slug,
          description: "",
          price: "",
          variantLabel: "",
          variantOptions: "",
          imageAlt: "",
          imageUrl: null,
          buyType: "whatsapp",
          buyUrl: "",
          buyLabel: "",
          sortOrder: "0",
          available: true,
        }}
      />
    </>
  );
}
