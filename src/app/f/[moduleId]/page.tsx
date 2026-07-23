import PublicFormClient from "./PublicFormClient";

export default function PublicFormPage({ params }: { params: { moduleId: string } }) {
  return <PublicFormClient moduleId={params.moduleId} />;
}
