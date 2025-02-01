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

import { useStoreStore } from "../store"; // Import the store store
import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";
import { useToastNotification } from "../hooks/toastUtils";

function StorePage() {
	const { showError, showSuccess } = useToastNotification();

	const [data, setData] = useState([]); // Stores all store records
	const [searchResults, setSearchResults] = useState([]); // Stores filtered store records
	const [loading, setLoading] = useState(false); // Loading state

	const { isOpen, onOpen, onClose } = useDisclosure(); // Modal control

	const [newStore, setNewStore] = useState({
		processid: "",
		product_location: "",
		qty: "",
		status: "In Store", // Default status
	});

	// Reset the form fields
	const resetForm = () => {
		setNewStore({
			processid: "",
			product_location: "",
			qty: "",
			status: "In Store",
		});
	};

	// To track whether we're editing or adding
	const [editId, setEditId] = useState(null);

	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [dataToDelete, setDataToDelete] = useState(null);

	// Import store store methods and state
	const { createStore, fetchStores, updateStore, deleteStore, stores } =
		useStoreStore();

	// Fetch data on initial load
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await fetchStores();
			setLoading(false);
		};
		loadData();
	}, [fetchStores]);

	// Update store data when the store changes
	useEffect(() => {
		setData(stores);
		setSearchResults(stores);
	}, [stores]);

	// Handle search functionality
	const handleSearch = (query) => {
		if (query === "") {
			setSearchResults(data);
		} else {
			const results = data.filter((item) => {
				return (
					item.storeid.toString().includes(query) ||
					item.processid.toString().includes(query.toLowerCase()) ||
					item.product_location
						.toLowerCase()
						.includes(query.toLowerCase()) ||
					item.status.toLowerCase().includes(query.toLowerCase())
				);
			});
			setSearchResults(results);
		}
	};

	// Handle form input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setNewStore({ ...newStore, [name]: value });
	};

	// Define fields for the form
	const fields = [
		{
			name: "processid",
			label: "Process ID",
			placeholder: "Enter Process ID",
			type: "text",
		},
		{
			name: "product_location",
			label: "Product Location",
			placeholder: "Enter Product Location",
			type: "text",
		},
		{
			name: "qty",
			label: "Quantity",
			placeholder: "Enter Quantity",
			type: "number",
		},
		{
			name: "status",
			label: "Status",
			type: "select", // Field type select
			options: [
				{ value: "In Store", label: "In Store" },
				{ value: "Delivered", label: "Delivered" },
			],
		},
	];

	// Define columns for the data table
	const columns = [
		{ Header: "Store ID", accessor: "storeid" },
		{ Header: "Process ID", accessor: "processid" },
		{ Header: "Product Location", accessor: "product_location" },
		{ Header: "Quantity", accessor: "qty" },
		{ Header: "Status", accessor: "status" },
		{ Header: "Created At", accessor: "created_at" },
		{ Header: "Updated At", accessor: "updated_at" },
	];

	const caption = "Store Records List";

	// Create a new store record
	const handleCreate = async () => {
		try {
			const { success, message } = await createStore(newStore);
			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				onClose();
				resetForm();
				fetchStores();
			}
		} catch (error) {
			console.error("Error creating store record:", error);
			showError("An error occurred while creating the store record.");
		}
	};

	// Function to handle editing a store record
	const handleEdit = (data) => {
		setEditId(data.storeid);
		setNewStore(data);
		onOpen();
	};

	// Function to handle updating the store record
	const handleUpdate = async () => {
		try {
			const { success, message } = await updateStore(editId, newStore);

			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				onClose();
				resetForm();
				setEditId(null);
				fetchStores();
			}
		} catch (error) {
			console.error("Error updating store record:", error);
			showError("An error occurred while updating the store record.");
		}
	};

	// Delete function
	const handleDelete = async () => {
		try {
			const { success, message } = await deleteStore(dataToDelete);
			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				fetchStores();
			}
		} catch (error) {
			console.error("Error deleting store record:", error);
			showError("An error occurred while deleting the store record.");
		} finally {
			setDeleteModalOpen(false);
			setDataToDelete(null);
		}
	};

	// Open the delete confirmation modal
	const openDeleteConfirmation = (data) => {
		setDataToDelete(data.storeid);
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
						Store Page
					</Text>

					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Store Record
						</Button>
					</Flex>

					<SearchBar
						fields={[
							"storeid",
							"processid",
							"product_location",
							"status",
						]}
						onSearch={handleSearch}
						placeholder="Search by store ID, process ID, product location, or status"
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
								No store records found 😢
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
				formData={newStore}
				handleChange={handleChange}
				handleSubmit={editId ? handleUpdate : handleCreate}
				modalTitle={
					editId ? "Edit Store Record" : "Add New Store Record"
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

export default StorePage;
