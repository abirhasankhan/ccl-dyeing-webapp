import React from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Box, Button, Select } from "@chakra-ui/react";
import { FormInput, SubmitButton } from "../components";
import { useToastNotification } from "../hooks/toastUtils";
import { useDyeingFinishingDealsStore } from "../store";

const DyeingFinishingDealsForm = ({ dealId, onPrev, onNext, onSkip }) => {
	const methods = useForm({
		defaultValues: {
			deal_id: dealId,
			double_dyeing_tk: 0, // Default value for Double Dyeing TK
		},
	});

	const { showError, showSuccess } = useToastNotification();

	const { createDyeingFinishingDeal } = useDyeingFinishingDealsStore();

	// Service Type Options
	const serviceTypeOptions = [
		{ label: "Tube TK", name: "tube_tk" },
		{ label: "Open TK", name: "open_tk" },
		{ label: "Elasteen TK", name: "elasteen_tk" },
	];

	const onSubmit = async (formData) => {
		try {
			const response = await createDyeingFinishingDeal(formData);
			if (response.success) {
				showSuccess("Dyeing Finishing Deal created successfully!");
				onNext(); // Move to the next step
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
				<FormInput label="Color" name="color" isRequired />

				<FormInput
					label="Shade Percent"
					name="shade_percent"
					isRequired={false} // Optional field
				/>

				{/* Service Type Dropdown */}
				{/* 
				<Controller
					name="service_type"
					control={methods.control}
					rules={{ required: "Service Type is required" }}
					render={({ field }) => (
						<Select
							{...field}
							placeholder="Select Service Type"
							isInvalid={!!methods.formState.errors.service_type}
						>
							{serviceTypeOptions.map((option) => (
								<option key={option.name} value={option.name}>
									{option.label}
								</option>
							))}
						</Select>
					)}
				/>
				{methods.formState.errors.service_type && (
					<Box color="red.500">
						{methods.formState.errors.service_type.message}
					</Box>
				)} */}

				<FormInput
					label="Tube TK"
					name="tube_tk"
					type="number"
					defaultValue={0} // Default value is 0
					isRequired={false} // Optional field
				/>

				<FormInput
					label="Open TK"
					name="open_tk"
					type="number"
					defaultValue={0} // Default value is 0
					isRequired={false} // Optional field
				/>

				<FormInput
					label="Elasteen TK"
					name="elasteen_tk"
					type="number"
					defaultValue={0} // Default value is 0
					isRequired={false} // Optional field
				/>

				{/* Double Dyeing TK (Optional, Default to 0) */}
				<FormInput
					label="Double Dyeing TK"
					name="double_dyeing_tk"
					type="number"
					defaultValue={0} // Default value is 0
					isRequired={false} // Optional field
				/>

				{/* Action Buttons */}
				<SubmitButton label="Submit & Next" />
				{/* Skip Button */}
				<Button mt={4} ml={2} onClick={onSkip}>
					Skip
				</Button>
			</Box>
		</FormProvider>
	);
};

export default DyeingFinishingDealsForm;
