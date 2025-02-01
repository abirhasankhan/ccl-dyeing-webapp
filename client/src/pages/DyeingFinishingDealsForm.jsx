import { useForm, FormProvider } from "react-hook-form";
import { Box, Button, IconButton } from "@chakra-ui/react";
import { FormInput, SubmitButton } from "../components";
import { useToastNotification } from "../hooks/toastUtils";
import { useDyeingFinishingDealsStore } from "../store";
import { FaTrash } from "react-icons/fa";

const DyeingFinishingDealsForm = ({ dealId, onPrev, onNext, onSkip }) => {
	const methods = useForm({
		defaultValues: {
			deal_id: dealId,
			dyeingDeals: [
				{
					color: "",
					shade_percent: "",
					tube_tk: 0,
					open_tk: 0,
					elasteen_tk: 0,
					double_dyeing_tk: 0,
				},
			], // Initialize with one row
		},
	});

	const { showError, showSuccess } = useToastNotification();
	const { createDyeingFinishingDeal } = useDyeingFinishingDealsStore();

	const [dyeingDeals, setDyeingDeals] = useState([
		{
			color: "",
			shade_percent: "",
			tube_tk: 0,
			open_tk: 0,
			elasteen_tk: 0,
			double_dyeing_tk: 0,
		},
	]);

	const addRow = () => {
		setDyeingDeals([
			...dyeingDeals,
			{
				color: "",
				shade_percent: "",
				tube_tk: 0,
				open_tk: 0,
				elasteen_tk: 0,
				double_dyeing_tk: 0,
			},
		]);
	};

	const removeRow = (index) => {
		const newDyeingDeals = dyeingDeals.filter((_, i) => i !== index);
		setDyeingDeals(newDyeingDeals);
	};

const onSubmit = async (formData) => {
	const formattedData = {
		deal_id: formData.deal_id,
		dyeingDeals: formData.dyeingDeals.map((deal) => ({
			color: deal.color,
			shade_percent: parseFloat(deal.shade_percent), // Ensure shade_percent is a number
			tube_tk: parseFloat(deal.tube_tk), // Convert to number
			open_tk: parseFloat(deal.open_tk), // Convert to number
			elasteen_tk: parseFloat(deal.elasteen_tk), // Convert to number
			double_dyeing_tk: parseFloat(deal.double_dyeing_tk), // Convert to number
		})),
	};

	try {
		const response = await createDyeingFinishingDeal(formattedData);
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
				<Button onClick={addRow} mb={4}>
					Add New Row
				</Button>
				<table>
					<thead>
						<tr>
							<th>Color</th>
							<th>Shade %</th>
							<th>Tube TK</th>
							<th>Open TK</th>
							<th>Elasteen TK</th>
							<th>Double Dyeing TK</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{dyeingDeals.map((deal, index) => (
							<tr key={index}>
								<td>
									<FormInput
										label="Color"
										name={`dyeingDeals[${index}].color`}
										value={deal.color}
										onChange={(e) => {
											const newDeals = [...dyeingDeals];
											newDeals[index].color =
												e.target.value;
											setDyeingDeals(newDeals);
										}}
										isRequired
									/>
								</td>
								<td>
									<FormInput
										label="Shade Percent"
										name={`dyeingDeals[${index}].shade_percent`}
										type="number"
										value={deal.shade_percent}
										onChange={(e) => {
											const newDeals = [...dyeingDeals];
											newDeals[index].shade_percent =
												e.target.value;
											setDyeingDeals(newDeals);
										}}
									/>
								</td>
								<td>
									<FormInput
										label="Tube TK"
										name={`dyeingDeals[${index}].tube_tk`}
										type="number"
										value={deal.tube_tk}
										onChange={(e) => {
											const newDeals = [...dyeingDeals];
											newDeals[index].tube_tk =
												e.target.value;
											setDyeingDeals(newDeals);
										}}
									/>
								</td>
								<td>
									<FormInput
										label="Open TK"
										name={`dyeingDeals[${index}].open_tk`}
										type="number"
										value={deal.open_tk}
										onChange={(e) => {
											const newDeals = [...dyeingDeals];
											newDeals[index].open_tk =
												e.target.value;
											setDyeingDeals(newDeals);
										}}
									/>
								</td>
								<td>
									<FormInput
										label="Elasteen TK"
										name={`dyeingDeals[${index}].elasteen_tk`}
										type="number"
										value={deal.elasteen_tk}
										onChange={(e) => {
											const newDeals = [...dyeingDeals];
											newDeals[index].elasteen_tk =
												e.target.value;
											setDyeingDeals(newDeals);
										}}
									/>
								</td>
								<td>
									<FormInput
										label="Double Dyeing TK"
										name={`dyeingDeals[${index}].double_dyeing_tk`}
										type="number"
										value={deal.double_dyeing_tk}
										onChange={(e) => {
											const newDeals = [...dyeingDeals];
											newDeals[index].double_dyeing_tk =
												e.target.value;
											setDyeingDeals(newDeals);
										}}
									/>
								</td>
								<td>
									<IconButton
										icon={<FaTrash />}
										onClick={() => removeRow(index)}
										colorScheme="red"
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				<SubmitButton label="Submit & Next" />
				<Button mt={4} ml={2} onClick={onSkip}>
					Skip
				</Button>
			</Box>
		</FormProvider>
	);
};

export default DyeingFinishingDealsForm;
