import { GenerateForm } from "@/components/generate-form";

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline text-white">
          નવું પ્રશ્નપત્ર તૈયાર કરો
        </h1>
        <p className="text-muted-foreground text-lg">
          AI ની મદદથી સેકન્ડોમાં GSEB અભ્યાસક્રમ મુજબનું પ્રશ્નપત્ર બનાવો.
        </p>
      </div>
      <GenerateForm />
    </div>
  );
}
