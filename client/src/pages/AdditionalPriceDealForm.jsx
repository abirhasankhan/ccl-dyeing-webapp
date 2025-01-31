import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Box, Button } from "@chakra-ui/react";
import { FormInput, SubmitButton } from "../components";
import { useToastNotification } from "../hooks/toastUtils";
import { useAdditionalProcessDealsStore } from "../store";

const AdditionalPriceDealForm = ({ dealId, onPrev, onSkip, setStep }) => {
	const methods = useForm({
		defaultValues: {
			deal_id: dealId,
		},
	});

	const { showError, showSuccess } = useToastNotification();

	const { createAdditionalProcessDeal } = useAdditionalProcessDealsStore();

	const onSubmit = async (formData) => {
		try {
			const response = await createAdditionalProcessDeal(formData);
			if (response.success) {
				showSuccess("Additional Price Deal updated successfully!");
				onPrev(); // Go back to previous step
				setStep(1); // Reset step to 1 to go back to ClientDealPageForm
			} else {
				showError(response.message);
			}
		} catch (error) {
			showError("An error occurred while submitting the form.");
			console.error(error);
		}
	};

	return (
		<FormProvider {...methods}>
			<Box as="form" onSubmit={methods.handleSubmit(onSubmit)}>
				<FormInput
					label="Process Type"
					name="process_type"
					type="text"
					isRequired
				/>
				<FormInput
					label="Additional Price (TK)"
					name="price_tk"
					type="number"
					isRequired
				/>
				<SubmitButton label="Submit" />
				<Button mt={4} ml={2} onClick={onPrev}>
					Back
				</Button>
				<Button mt={4} ml={2} onClick={onSkip}>
					Skip
				</Button>
			</Box>
		</FormProvider>
	);
};

export default AdditionalPriceDealForm;
