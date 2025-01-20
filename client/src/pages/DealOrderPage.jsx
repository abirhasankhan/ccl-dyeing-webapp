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

import { useDealOrderStore } from "../store";

import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";

import { useToastNotification } from "../hooks/toastUtils";



function DealOrderPage() {
	const { showError, showSuccess } = useToastNotification();

	const [data, setData] = useState([]);

	const [searchResults, setSearchResults] = useState([]);

	const [loading, setLoading] = useState(false); // Loading state

	const { isOpen, onOpen, onClose } = useDisclosure();

	const [newDealOrder, setNewDealOrder] = useState({
		deal_id: "",
		challan_no: "",
		booking_qty: "",
		total_received_qty: "",
		total_returned_qty: "",
		notes: "",
		status: "", // Reset status as well
	});

	// Reset the form fields
	const resetForm = () => {
		setNewDealOrder({
			deal_id: "",
			challan_no: "",
			booking_qty: "",
			total_received_qty: "",
			total_returned_qty: "",
			notes: "",
			status: "", // Reset status as well
		});
	};

	// To track whether we're editing or adding a client
	const [editId, setEditId] = useState(null);

	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

	const [dataToDelete, setDataToDelete] = useState(null);

	const {
		createDealOrder,
		fetchDealOrders,
		updateDealOrder,
		deleteDealOrder,
		dealOrders,
	} = useDealOrderStore();

	// Fetch data on initial load
	useEffect(() => {
		const loadClients = async () => {
			setLoading(true);
			await fetchDealOrders();
			setLoading(false);
		};
		loadClients();
	}, [fetchDealOrders]);

	// Update DealOrders when the data changes
	useEffect(() => {
		setData(dealOrders);
		setSearchResults(dealOrders);
	}, [dealOrders]);

	// Handle search functionality
	const handleSearch = (query) => {
		if (query === "") {
			// If query is empty, show all clients
			setSearchResults(data);
		} else {
			// Search logic based on multiple fields (id, name, etc.)
			const results = data.filter((items) => {
				return (
					items.orderid.toString().includes(query) ||
					items.deal_id.toString().includes(query) ||
					items.challan_no.toString().includes(query)
				);
			});
			setSearchResults(results); // Set filtered results
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		setNewDealOrder({ ...newDealOrder, [name]: value });
	};

	// Define fields that will be shown for both Add and Edit
	const commonFields = [
		{
			name: "deal_id",
			label: "Deal ID",
			placeholder: "Enter Deal ID",
		},
		{
			name: "challan_no",
			label: "Challan No",
			placeholder: "Enter Challan No",
		},
		{
			name: "booking_qty",
			label: "Booking Qty",
			placeholder: "Enter Booking Qty (kgs)",
			type: "number",
		},
		{
			name: "total_received_qty",
			label: "Total Received Qty",
			placeholder: "Enter Total Received Qty (kgs)",
			type: "number",
		},
		{
			name: "total_returned_qty",
			label: "Total Returned Qty",
			placeholder: "Enter Total Returned Qty (kgs)",
			type: "number",
		},
		{
			name: "notes",
			label: "Notes",
			placeholder: "Enter Notes",
		},
	];

	// Define additional fields for editing
	const editFields = [
		{
			name: "status",
			label: "Status",
			type: "select", // Field type select
			options: [
				{ label: "Pending", value: "Pending" },
				{ label: "Completed", value: "Completed" },
				{ label: "Canceled", value: "Canceled" },
			],
		},
	];

	const fields = editId
		? [...commonFields, ...editFields] // Combine common fields and the status field for edit
		: commonFields;

	const columns = [
		{ Header: "ID", accessor: "orderid" },
		{ Header: "Deal ID", accessor: "deal_id" },
		{ Header: "Challan No", accessor: "challan_no" },
		{ Header: "Booking Qty", accessor: "booking_qty" },
		{ Header: "Total Received", accessor: "total_received_qty" },
		{ Header: "Total Returned", accessor: "total_returned_qty" },
		{ Header: "Status", accessor: "status" },
		{ Header: "Notes", accessor: "notes" },
		{ Header: "Created At", accessor: "created_at" },
		{ Header: "Updated At", accessor: "updated_at" },
	];

	const caption = "Deal Order Information List"; // Optional Caption for the table

	// create function to handle creating a new Deal Order
	const handleCreate = async () => {
		try {
			const { success, message } = await createDealOrder(newDealOrder);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
			}
		} catch (error) {
			console.error("Error creating Deal Order:", error);
			showError("An error occurred while creating the Deal Order.");
		}
	};

	// Function to handle editing a Deal Order
	const handleEdit = (data) => {
		setEditId(data.orderid); // Set the deal order ID to track which deal order we're editing
		setNewDealOrder(data); // Populate the form with the existing data
		onOpen(); // Open the modal
	};

	// Function to handle updating the Deal Order
	const handleUpdate = async () => {
		try {
			const { success, message } = await updateDealOrder(
				editId,
				newDealOrder
			);

			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
				setEditId(null);
				fetchDealOrders();
			}
		} catch (error) {
			console.error("Error updating Deal Order:", error);
			showError("An error occurred while updating the Deal Order.");
		}
	};

	// Delete function
	const handleDelete = async () => {
		try {
			const { success, message } = await deleteDealOrder(dataToDelete);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				fetchDealOrders();
			}
		} catch (error) {
			console.error("Error deleting deal order:", error);
			showError("An error occurred while deleting the deal order.");
		} finally {
			setDeleteModalOpen(false);
			setDataToDelete(null);
		}
	};

	// Open the delete confirmation modal
	const openDeleteConfirmation = (data) => {
		setDataToDelete(data.orderid);
		setDeleteModalOpen(true);
	};

	return (
		<Box minH="100vh" display="flex" flexDirection="column" px={4}>
			{/* Full height container */}
			<Container maxW={"container.xl"} py={12}>
				<VStack spacing={8}>
					<Text
						fontSize={"30"}
						fontWeight={"bold"}
						bgGradient={"linear(to-r, cyan.400, blue.400)"}
						bgClip={"text"}
						textAlign={"center"}
					>
						Deal Order Page
					</Text>

					{/* Align button to the left */}
					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Deal Order
						</Button>
					</Flex>

					{/* Search Bar Component */}
					<SearchBar
						fields={["orderid", "deal_id", "challan_no"]} // Search by ID, Name, and Contact
						onSearch={handleSearch}
						placeholder="Search by order id, deal id, or challan no"
					/>

					{/* Loading Spinner */}
					<div style={{ width: "100%" }}>
						{loading ? (
							<Flex justify="center" mt={8}>
								<Spinner size="xl" />
							</Flex>
						) : (
							// Display DataTable with client data
							<DataTable
								data={searchResults} // Always show search results or all clients
								columns={columns}
								caption={caption}
								onEdit={handleEdit} // Pass the handleEditClient function
								onDelete={openDeleteConfirmation} // Pass the openDeleteConfirmation function
							/>
						)}
					</div>

					{/* Display message when no clients found */}
					{!loading && searchResults.length === 0 && (
						<VStack spacing={8} mt={10}>
							<Text
								fontSize={"xl"}
								fontWeight={"bold"}
								color={"gray.500"}
								textAlign={"center"}
							>
								No Deal Orders found 😢
							</Text>
						</VStack>
					)}
				</VStack>
			</Container>

			{/* Add or Edit Client Modal */}
			<FormModal
				isOpen={isOpen}
				onClose={() => {
					onClose(); // Close modal
					resetForm(); // Reset form data
					setEditId(null); // Reset the edit client ID
				}}
				formData={newDealOrder}
				handleChange={handleChange}
				handleSubmit={
					editId ? handleUpdate : handleCreate
				}
				modalTitle={editId ? "Edit Deal Order" : "Add New Deal Order"}
				fields={fields} // Pass the dynamic field configuration
			/>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleDelete}
			/>
		</Box>
	);
}

export default DealOrderPage;
