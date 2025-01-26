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

import { useShipmentStore } from "../store";

import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";

import { useToastNotification } from "../hooks/toastUtils";

function ShipmentPage() {
	const { showError, showSuccess } = useToastNotification();

	const [data, setData] = useState([]);

	const [searchResults, setSearchResults] = useState([]);

	const [loading, setLoading] = useState(false); // Loading state

	const { isOpen, onOpen, onClose } = useDisclosure();

	const [newShipment, setNewShipment] = useState({
		orderid: "",
		shipment_date: "",
		quantity_shipped: "",
		notes: "",
	});

	// Reset the form fields
	const resetForm = () => {
		setNewShipment({
			orderid: "",
			shipment_date: "",
			quantity_shipped: "",
			notes: "",
		});
	};

	// To track whether we're editing or adding
	const [editId, setEditId] = useState(null);

	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

	const [dataToDelete, setDataToDelete] = useState(null);

	const {
		createShipment,
		fetchShipments,
		updateShipment,
		deleteShipment,
		shipments,
	} = useShipmentStore();

	// Fetch data on initial load
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await fetchShipments();
			setLoading(false);
		};
		loadData();
	}, [fetchShipments]);

	// Update DealOrders when the data changes
	useEffect(() => {
		setData(shipments);
		setSearchResults(shipments);
	}, [shipments]);

	// Handle search functionality
	const handleSearch = (query) => {
		if (query === "") {
			// If query is empty, show all clients
			setSearchResults(data);
		} else {
			// Search logic based on multiple fields (id, name, etc.)
			const results = data.filter((items) => {
				return (
					items.shipmentid.toString().includes(query) ||
					items.orderid.toString().includes(query)
				);
			});
			setSearchResults(results); // Set filtered results
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		setNewShipment({ ...newShipment, [name]: value });
	};

	// Define fields that will be shown for both Add and Edit
	const commonFields = [
		{
			name: "orderid",
			label: "Order ID",
			placeholder: "Enter Order ID",
		},
		{
			name: "shipment_date",
			label: "Shipment Date",
			placeholder: "Enter Shipment Date",
			type: "date",
		},
		{
			name: "quantity_shipped",
			label: "Quantity Shipped",
			placeholder: "Enter Quantity Shipped (kgs)",
			type: "number",
		},
		{
			name: "notes",
			label: "Notes",
			placeholder: "Enter Notes",
		},
	];

	const editFields = [];

	const fields = editId
		? [...commonFields, ...editFields] // Combine common fields and the status field for edit
		: commonFields;

	const columns = [
		{ Header: "Shipment ID", accessor: "shipmentid" },
		{ Header: "Order ID", accessor: "orderid" },
		{ Header: "Shipment Date", accessor: "shipment_date" },
		{ Header: "Quantity Shipped", accessor: "quantity_shipped" },
		{ Header: "Notes", accessor: "notes" },
		{ Header: "Created At", accessor: "created_at" },
		{ Header: "Updated At", accessor: "updated_at" },
	];

	const caption = "Shipment Information List"; // Optional Caption for the table

	// create function to handle creating a new Data
	const handleCreate = async () => {
		try {
			const { success, message } = await createShipment(newShipment);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
			}
		} catch (error) {
			console.error("Error creating shipment:", error);
			showError("An error occurred while creating the shipment.");
		}
	};

	// Function to handle editing a data
	const handleEdit = (data) => {
		setEditId(data.shipmentid); // Set the deal order ID to track which shipment we're editing
		setNewShipment(data); // Populate the form with the existing data
		onOpen(); // Open the modal
	};

	// Function to handle updating the Deal Order
	const handleUpdate = async () => {
		try {
			const { success, message } = await updateShipment(
				editId,
				newShipment
			);

			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
				setEditId(null);
				fetchShipments();
			}
		} catch (error) {
			console.error("Error updating shipment:", error);
			showError("An error occurred while updating the shipment.");
		}
	};

	// Delete function
	const handleDelete = async () => {
		try {
			const { success, message } = await deleteShipment(dataToDelete);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				fetchShipments();
			}
		} catch (error) {
			console.error("Error deleting shipment:", error);
			showError("An error occurred while deleting the shipment.");
		} finally {
			setDeleteModalOpen(false);
			setDataToDelete(null);
		}
	};

	// Open the delete confirmation modal
	const openDeleteConfirmation = (data) => {
		setDataToDelete(data.shipmentid);
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
						Shipment Page
					</Text>

					{/* Align button to the left */}
					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Shipment
						</Button>
					</Flex>

					{/* Search Bar Component */}
					<SearchBar
						fields={["shipmentid" ,"orderid"]} // Search by ID, Name, and Contact
						onSearch={handleSearch}
						placeholder="Search by shipment id, order id"
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
								No shipment found 😢
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
				formData={newShipment}
				handleChange={handleChange}
				handleSubmit={
					editId ? handleUpdate : handleCreate
				}
				modalTitle={editId ? "Edit Shipment" : "Add New Shipment"}
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

export default ShipmentPage;
