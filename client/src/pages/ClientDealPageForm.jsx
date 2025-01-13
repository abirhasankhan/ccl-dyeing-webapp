import React, { useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { FormInput, SubmitButton } from "../components";
import { Box, Select, VStack } from "@chakra-ui/react";
import { useToastNotification } from "../hooks/toastUtils";
import { useClientDealStore } from "../store";

const ClientDealPageForm = ({ onNext }) => {
	
	const { showError, showSuccess } = useToastNotification();

	const methods = useForm({
		defaultValues: {
			clientid: "",
			issueDate: "",
			validThrough: "",
			representative: "",
			contactNo: "",
			notes: "",
			paymentMethod: "",
			bankInfo: { bankName: "", branch: "", sortCode: "" },
		},
	});

	const [showBankDetails, setShowBankDetails] = useState(false);
	const { createClientDeal } = useClientDealStore();

	const handlePaymentMethodChange = (value) => {
		setShowBankDetails(value === "Bank" || value === "Hybrid");
	};

	const onSubmit = async (formData) => {
		try {
			const response = await createClientDeal(formData);
			if (response.success) {
				showSuccess("Client deal created successfully!");
				const dealId = response.deal_id; // Now you have access to deal_id

				if (typeof onNext === "function") {
					onNext(dealId); // Ensure dealId is being passed correctly
				}
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
				<VStack spacing={4} align="stretch">
					<FormInput label="Client ID" name="clientid" required />
					<FormInput
						label="Issue Date"
						name="issueDate"
						type="date"
						required
					/>
					<FormInput
						label="Valid Through"
						name="validThrough"
						type="date"
						required
					/>
					<FormInput
						label="Representative"
						name="representative"
						type="text"
						required
					/>
					<FormInput
						label="Designation"
						name="designation"
						type="text"
						required
					/>
					<FormInput
						label="Contact No"
						name="contactNo"
						type="text"
						required
					/>
					<FormInput label="Notes" name="notes" type="text" />
					
					{/* Payment Method Dropdown */}
					<Controller
						name="paymentMethod"
						control={methods.control}
						render={({ field }) => (
							<Select
								placeholder="Select Payment Method"
								{...field}
								onChange={(e) => {
									field.onChange(e);
									handlePaymentMethodChange(e.target.value);
								}}
							>
								<option value="Cash">Cash</option>
								<option value="Bank">Bank</option>
								<option value="Hybrid">Hybrid</option>
							</Select>
						)}
					/>
					{/* Conditionally Render Bank Details */}
					{showBankDetails && (
						<>
							<FormInput
								label="Bank Name"
								name="bankInfo.bankName"
								required
							/>
							<FormInput
								label="Branch"
								name="bankInfo.branch"
								required
							/>
							<FormInput
								label="Sort Code"
								name="bankInfo.sortCode"
								required
							/>
						</>
					)}
					<SubmitButton label="Submit & Next" />
				</VStack>
			</Box>
		</FormProvider>
	);
};

export default ClientDealPageForm;
