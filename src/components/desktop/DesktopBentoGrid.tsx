import TheProblemCard from "./cards/TheProblemCard";
import HowItWorksCard from "./cards/HowItWorksCard";
import CurrencyCard from "./cards/CurrencyCard";
import AppUnlockCard from "./cards/AppUnlockCard";
import PrivacyBanner from "./cards/PrivacyBanner";

import TransformationCard from "./cards/TransformationCard";
import BenefitsCard from "./cards/BenefitsCard";
import MozCompanionCard from "./cards/MozCompanionCard";
import WhyItWorksCard from "./cards/WhyItWorksCard";
import TestimonialsCard from "./cards/TestimonialsCard";
import FaqCard from "./cards/FaqCard";

export default function DesktopBentoGrid() {
  return (
    <div className="mozy-bento-grid-wrapper">
      <div className="mozy-bento-grid-container">
        {/* Left Column */}
        <div className="bento-column bento-col-left">
          <TheProblemCard />
          <HowItWorksCard />
          <CurrencyCard />
          <AppUnlockCard />
          <PrivacyBanner />
        </div>

        {/* Right Column */}
        <div className="bento-column bento-col-right">
          <TransformationCard />
          <BenefitsCard />
          <MozCompanionCard />
          <WhyItWorksCard />
          <TestimonialsCard />
          <FaqCard />
        </div>
      </div>
    </div>
  );
}
