import PublicFormClient from "@/modules/forms/components/PublicFormClient";

export default async function PublicFormPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ embed?: string }> }) {
  const { id } = await params;
  const { embed } = await searchParams;
  return <PublicFormClient formId={id} isEmbed={embed === 'true'} />;
}
