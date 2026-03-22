import { GenerateForm } from "@/components/generate-form";
import { AdBanner } from "@/components/ad-banner";

const SECOND_AD_UNIT_ID = "ca-app-pub-1866650216428197/5377544903";

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <AdBanner unitId={SECOND_AD_UNIT_ID} position="top" />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline text-white">
          નવું પ્રશ્નપત્ર તૈયાર કરો
        </h1>
        <p className="text-muted-foreground text-lg">
          સેકન્ડોમાં GSEB અભ્યાસક્રમ મુજબનું પ્રશ્નપત્ર બનાવો.
        </p>
      </div>
      <GenerateForm />
      
      <AdBanner />
    </div>
  );
}
