import {
	Container,
	Text,
	VStack,
	Button,
	Box,
	Flex,
	useDisclosure,
	Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { usePaymentStore } from "../store"; // Import the payment store
import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";
import { useToastNotification } from "../hooks/toastUtils";

function PaymentPage() {
	const { showError, showSuccess } = useToastNotification();

	const [data, setData] = useState([]); // Stores all payment records
	const [searchResults, setSearchResults] = useState([]); // Stores filtered payment records
	const [loading, setLoading] = useState(false); // Loading state

	const { isOpen, onOpen, onClose } = useDisclosure(); // Modal control

	const [newPayment, setNewPayment] = useState({
		invoiceid: "",
		amount: "",
		payment_method: "",
		notes: "",
	});

	// Reset the form fields
	const resetForm = () => {
		setNewPayment({
			invoiceid: "",
			amount: "",
			payment_method: "",
			notes: "",
		});
	};

	// To track whether we're editing or adding
	const [editId, setEditId] = useState(null);

	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [dataToDelete, setDataToDelete] = useState(null);

	// Import payment store methods and state
	const {
		createPayment,
		fetchPayments,
		updatePayment,
		deletePayment,
		payments,
	} = usePaymentStore();

	// Fetch data on initial load
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await fetchPayments();
			setLoading(false);
		};
		loadData();
	}, [fetchPayments]);

	// Update payment data when the store changes
	useEffect(() => {
		setData(payments);
		setSearchResults(payments);
	}, [payments]);

	// Handle search functionality
	const handleSearch = (query) => {
		if (query === "") {
			setSearchResults(data);
		} else {
			const results = data.filter((item) => {
				return (
					item.paymentid.toString().includes(query) ||
					item.invoiceid.toString().includes(query.toLowerCase()) ||
					item.payment_method
						.toLowerCase()
						.includes(query.toLowerCase()) ||
					item.notes.toLowerCase().includes(query.toLowerCase()) ||
					item.remarks.toLowerCase().includes(query.toLowerCase())
				);
			});
			setSearchResults(results);
		}
	};

	// Handle form input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setNewPayment({ ...newPayment, [name]: value });
	};

	// Define fields for the form
	const fields = [
		{
			name: "invoiceid",
			label: "Invoice ID",
			placeholder: "Enter Invoice ID",
			type: "text",
		},
		{
			name: "amount",
			label: "Amount",
			placeholder: "Enter Amount",
			type: "number",
		},
		{
			name: "payment_method",
			label: "Payment Method",
			type: "select", // Field type select
			options: [
				{ label: "Cash", value: "Cash" },
				{ label: "Bank Cheque", value: "Bank Cheque" },
				{ label: "Bank Transfer", value: "Bank Transfer" },
			],
		},

		{
			name: "notes",
			label: "Notes",
			placeholder: "Enter Notes",
			type: "text",
		},
	];

	// Define columns for the data table
	const columns = [
		{ Header: "Payment ID", accessor: "paymentid" },
		{ Header: "Invoice ID", accessor: "invoiceid" },
		{ Header: "Amount", accessor: "amount" },
		{ Header: "Payment Method", accessor: "payment_method" },
		{ Header: "Notes", accessor: "notes" },
		{ Header: "Created At", accessor: "created_at" },
		{ Header: "Updated At", accessor: "updated_at" },
	];

	const caption = "Payment Records List";

	// Create a new payment record
	const handleCreate = async () => {
		try {
			const { success, message } = await createPayment(newPayment);
			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				onClose();
				resetForm();
				fetchPayments();
			}
		} catch (error) {
			console.error("Error creating payment record:", error);
			showError("An error occurred while creating the payment record.");
		}
	};

	// Function to handle editing a payment record
	const handleEdit = (data) => {
		setEditId(data.paymentid);
		setNewPayment(data);
		onOpen();
	};

	// Function to handle updating the payment record
	const handleUpdate = async () => {
		try {
			const { success, message } = await updatePayment(
				editId,
				newPayment
			);

			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				onClose();
				resetForm();
				setEditId(null);
				fetchPayments();
			}
		} catch (error) {
			console.error("Error updating payment record:", error);
			showError("An error occurred while updating the payment record.");
		}
	};

	// Delete function
	const handleDelete = async () => {
		try {
			const { success, message } = await deletePayment(dataToDelete);
			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				fetchPayments();
			}
		} catch (error) {
			console.error("Error deleting payment record:", error);
			showError("An error occurred while deleting the payment record.");
		} finally {
			setDeleteModalOpen(false);
			setDataToDelete(null);
		}
	};

	// Open the delete confirmation modal
	const openDeleteConfirmation = (data) => {
		setDataToDelete(data.paymentid);
		setDeleteModalOpen(true);
	};

	return (
		<Box minH="100vh" display="flex" flexDirection="column" px={4}>
			<Container maxW={"container.xl"} py={12}>
				<VStack spacing={8}>
					<Text
						fontSize={"30"}
						fontWeight={"bold"}
						bgGradient={"linear(to-r, cyan.400, blue.400)"}
						bgClip={"text"}
						textAlign={"center"}
					>
						Payment Page
					</Text>

					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Payment Record
						</Button>
					</Flex>

					<SearchBar
						fields={[
							"paymentid",
							"invoiceid",
							"payment_method",
							"notes",
							"remarks",
						]}
						onSearch={handleSearch}
						placeholder="Search by payment ID, invoice ID, payment method, notes, or remarks"
					/>

					<div style={{ width: "100%" }}>
						{loading ? (
							<Flex justify="center" mt={8}>
								<Spinner size="xl" />
							</Flex>
						) : (
							<DataTable
								data={searchResults}
								columns={columns}
								caption={caption}
								onEdit={handleEdit}
								onDelete={openDeleteConfirmation}
							/>
						)}
					</div>

					{!loading && searchResults.length === 0 && (
						<VStack spacing={8} mt={10}>
							<Text
								fontSize={"xl"}
								fontWeight={"bold"}
								color={"gray.500"}
								textAlign={"center"}
							>
								No payment records found 😢
							</Text>
						</VStack>
					)}
				</VStack>
			</Container>

			<FormModal
				isOpen={isOpen}
				onClose={() => {
					onClose();
					resetForm();
					setEditId(null);
				}}
				formData={newPayment}
				handleChange={handleChange}
				handleSubmit={editId ? handleUpdate : handleCreate}
				modalTitle={
					editId ? "Edit Payment Record" : "Add New Payment Record"
				}
				fields={fields}
			/>

			<DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleDelete}
			/>
		</Box>
	);
}

export default PaymentPage;
