import { GenerateForm } from "@/components/generate-form";

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">
          Create a New Exam Paper
        </h1>
        <p className="text-muted-foreground">
          Fill in the details below to generate a new paper with AI in seconds.
        </p>
      </div>
      <GenerateForm />
    </div>
  );
}
