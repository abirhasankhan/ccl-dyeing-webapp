import React, { useState } from "react";
import { Box, Button, useToast, SlideFade } from "@chakra-ui/react";
import ClientDealPageForm from "./pages/ClientDealPageForm";
import DyeingFinishingDealsForm from "./pages/DyeingFinishingDealsForm";
import AdditionalPriceDealForm from "./pages/AdditionalPriceDealForm"; // Import the new form
import ProgressBar from "./components/ProgressBar";

const MultiStepForm = () => {
	const [step, setStep] = useState(1);
	const [dealId, setDealId] = useState(null);
	const toast = useToast();

	const nextStep = () => setStep((prev) => prev + 1);
	const prevStep = () => setStep((prev) => prev - 1);

	const handleDealCreated = (id) => {
		setDealId(id);
		nextStep();
	};

	const handleSkipDyeingFinishing = () => {
		nextStep(); // Skip Dyeing Finishing Deals Form and go to the next step
	};

	return (
		<Box p={6} maxW="600px" mx="auto">
			<ProgressBar value={(step / 3) * 100} />
			<SlideFade in={true} offsetY="20px">
				{step === 1 && (
					<ClientDealPageForm onNext={handleDealCreated} />
				)}
				{step === 2 && (
					<DyeingFinishingDealsForm
						dealId={dealId}
						onPrev={prevStep}
						onNext={nextStep}
						onSkip={handleSkipDyeingFinishing}
					/>
				)}
				{step === 3 && (
					<AdditionalPriceDealForm
						dealId={dealId}
						onPrev={prevStep}
						onSkip={() => nextStep()} // Skip Additional Price Deal form
						setStep={setStep} // Pass setStep to handle navigation back to ClientDealPageForm
					/>
				)}
			</SlideFade>
			<Button mt={4} onClick={prevStep} isDisabled={step === 1}>
				Previous
			</Button>
		</Box>
	);
};

export default MultiStepForm;
