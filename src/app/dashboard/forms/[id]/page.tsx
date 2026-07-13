import FormBuilderClient from "@/modules/forms/components/FormBuilderClient";

export const metadata = {
  title: "Edit Form | Dashboard",
};

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FormBuilderClient formId={id} />;
}
