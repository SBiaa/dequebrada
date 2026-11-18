import { BannerForm } from "../BannerForm";

export default function NovoBannerPage() {
  return (
    <>
      <h1 className="h2-section mb-8">Novo banner</h1>
      <BannerForm
        values={{ title: "", imageAlt: "", linkUrl: "", startsAt: "", endsAt: "", sortOrder: "0", imageUrl: null, active: true }}
      />
    </>
  );
}
