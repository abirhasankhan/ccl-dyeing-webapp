import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Box, Button, Select } from "@chakra-ui/react";
import { FormInput, SubmitButton } from "../components";
import { useToastNotification } from "../hooks/toastUtils";
import { useDyeingFinishingDealsStore } from "../store";



const DyeingFinishingDealsForm = ({ dealId, onPrev }) => {

	const methods = useForm({ defaultValues: { deal_id: dealId } });

	const { showError, showSuccess } = useToastNotification();

	const { createDyeingFinishingDeal } = useDyeingFinishingDealsStore();
	

	const onSubmit = async (formData) => {
		try {
			const response = await createDyeingFinishingDeal(formData);
			if (response.success) {
				showSuccess("Dyeing Finishing Deal created successfully!");
				onPrev();
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
				<FormInput label="Color" name="color" />
				<FormInput label="Shade Percent" name="shade_percent" />
				<FormInput label="Service Type" name="service_type" />
				<FormInput
					label="Service Price (TK)"
					name="service_price_tk"
					type="number"
				/>
				<SubmitButton label="Submit" />
				<Button mt={4} ml={2} onClick={onPrev}>
					Back
				</Button>
			</Box>
		</FormProvider>
	);
};

export default DyeingFinishingDealsForm;
