import PublicFormClient from "./PublicFormClient";

export default async function PublicFormPage(props: { params: Promise<{ moduleId: string }> }) {
  const params = await props.params;
  return <PublicFormClient moduleId={params.moduleId} />;
}
