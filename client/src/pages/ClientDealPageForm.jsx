import React, { useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { FormInput, SubmitButton } from "../components";
import { Box, Select, VStack } from "@chakra-ui/react";
import { useToastNotification } from "../hooks/toastUtils";
import { useClientDealStore } from "../store";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// Define the validation schema with yup
const schema = yup.object().shape({
	clientid: yup.string().required("Client ID is required"),
	issue_date: yup.string().required("Issue Date is required"),
	valid_through: yup.string().required("Valid Through is required"),
	representative: yup.string().required("Representative is required"),
	designation: yup.string().required("Designation is required"),
	contact_no: yup.string().required("Contact No is required"),
	notes: yup.string().notRequired(), // Notes is optional
	payment_method: yup.string().required("Payment Method is required"),
	bankInfo: yup.object().shape({
		bankName: yup.string().when("paymentMethod", {
			is: (val) => val === "Bank" || val === "Hybrid",
			then: yup.string().required("Bank Name is required"),
		}),
		branch: yup.string().when("paymentMethod", {
			is: (val) => val === "Bank" || val === "Hybrid",
			then: yup.string().required("Branch is required"),
		}),
		sortCode: yup.string().when("paymentMethod", {
			is: (val) => val === "Bank" || val === "Hybrid",
			then: yup.string().required("Sort Code is required"),
		}),
	}),
});

const ClientDealPageForm = ({ onNext }) => {
	const { showError, showSuccess } = useToastNotification();

	const methods = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			clientid: "",
			issue_date: "",
			valid_through: "",
			representative: "",
			contact_no: "",
			payment_method: "",
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
						name="issue_date"
						type="date"
						required
					/>
					<FormInput
						label="Valid Through"
						name="valid_through"
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
						name="contact_no"
						type="text"
						required
					/>
					<FormInput
						label="Notes"
						name="notes"
						type="text"
						isRequired={false}
					/>

					{/* Payment Method Dropdown */}
					<Controller
						name="payment_method"
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
