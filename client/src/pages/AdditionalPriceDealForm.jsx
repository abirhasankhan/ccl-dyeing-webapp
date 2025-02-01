import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import {
	Box,
	Button,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Input,
} from "@chakra-ui/react";
import { SubmitButton } from "../components";
import { useToastNotification } from "../hooks/toastUtils";
import { useAdditionalProcessDealsStore } from "../store";


const AdditionalPriceDealForm = ({ dealId, onPrev, onSkip, setStep }) => {
	const methods = useForm({
		defaultValues: {
			deal_id: dealId,
			additionalPriceDeals: [{ process_type: "", price_tk: 0 }],
		},
	});

	const { showError, showSuccess } = useToastNotification();
	const { createAdditionalProcessDeal } = useAdditionalProcessDealsStore();
	const { fields, append, remove } = useFieldArray({
		control: methods.control,
		name: "additionalPriceDeals",
	});

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
				<Table variant="simple" mt={4}>
					<Thead>
						<Tr>
							<Th>Process Type</Th>
							<Th>Additional Price (TK)</Th>
							<Th>Action</Th>
						</Tr>
					</Thead>
					<Tbody>
						{fields.map((item, index) => (
							<Tr key={item.id}>
								<Td>
									<Input
										name={`additionalPriceDeals[${index}].process_type`}
										ref={methods.register()}
										defaultValue={item.process_type}
										isRequired
									/>
								</Td>
								<Td>
									<Input
										name={`additionalPriceDeals[${index}].price_tk`}
										type="number"
										ref={methods.register()}
										defaultValue={item.price_tk}
										isRequired
									/>
								</Td>
								<Td>
									<Button
										colorScheme="red"
										onClick={() => remove(index)}
									>
										Remove
									</Button>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>

				<Button
					colorScheme="blue"
					mt={4}
					onClick={() => append({ process_type: "", price_tk: 0 })}
				>
					Add More Deals
				</Button>

				<SubmitButton label="Submit" mt={4} />
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
