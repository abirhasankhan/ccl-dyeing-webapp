

import {
	Container,
	Text,
	VStack,
	Box,
	Flex,
	useDisclosure,
	Spinner,
	Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { useAdditionalProcessDealsStore } from "../store";

import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";

import { useToastNotification } from "../hooks/toastUtils";

function AdditionalDealViewPage() {

	const { showError, showSuccess } = useToastNotification();

	const [addPgdeal, setAddPgdeal] = useState({});

	const [searchResults, setSearchResults] = useState([]);

	const [loading, setLoading] = useState(false); // Loading state

	const { isOpen, onOpen, onClose } = useDisclosure();

	const [newAddPgDeal, setNewAddPgDeal] = useState({
		appid: "",
		deal_id: "",
		process_type: "",
		price_tk: "",
		notes: "",
	});

	const resetForm = () => {
		setNewAddPgDeal({
			appid: "",
			deal_id: "",
			process_type: "",
			price_tk: "",
			notes: "",
		});
	};

	const [editAddPgDdealId, setEditAddPgDdealId] = useState(null);
	
	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

	const [addPgDealToDelete, setAddPgDealToDelete] = useState(null);

	const {
		createAdditionalProcessDeal,
		fetchAdditionalProcessDeals,
		updateAdditionalProcessDeal,
		deleteAdditionalProcessDeal,
		additionalProcessDeals,
	} = useAdditionalProcessDealsStore();

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await fetchAdditionalProcessDeals();
			setLoading(false);
		};
		loadData();
	}, [fetchAdditionalProcessDeals]);

	// Update client deals state when the data changes
	useEffect(() => {
		setAddPgdeal(additionalProcessDeals);
		setSearchResults(additionalProcessDeals); // Set search results to all clients initially
	}, [additionalProcessDeals]);

	// Handle search functionality
	const handleSearch = (query) => {
		if (query === "") {
			// If query is empty, show all clients
			setSearchResults(addPgdeal);
		} else {
			// Search logic based on multiple fields (id, name, etc.)
			const results = addPgdeal.filter((data) => {
				return (
					data.deal_id.toString().includes(query) ||
					data.dfpid.toString().includes(query)
				);
			});
			setSearchResults(results); // Set filtered results
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		setNewAddPgDeal({ ...newAddPgDeal, [name]: value });
	};

	// Define fields that will be shown for both Add and Edit
	const commonFields = [
		{
			name: "deal_id",
			label: "Deal ID",
			placeholder: "Enter Deal ID",
		},
		{
			name: "process_type",
			label: "Process Type",
			placeholder: "Enter Process Type",
		},
		{
			name: "price_tk",
			label: "Price TK",
			placeholder: "Enter Total Price",
		},
		{
			name: "notes",
			label: "Notes",
			placeholder: "Enter Notes",
		},
	];

	// Define additional fields for editing
	const editFields = [];

	// Combine fields based on the condition
	const fields = editAddPgDdealId
		? [...commonFields, ...editFields]
		: commonFields;

	const columns = [
		{ Header: "ID", accessor: "appid" },
		{ Header: "Deal ID", accessor: "deal_id" },
		{ Header: "Process Type", accessor: "process_type" },
		{ Header: "Price TK", accessor: "price_tk" },
		{ Header: "Notes", accessor: "notes" },
	];

	const caption = "Additional Pprocess Deals Information List"; // Optional Caption for the table

	const handleCreateAddPgDeal = async () => {
		try {
			const { success, message } = await createAdditionalProcessDeal(
				newAddPgDeal);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
				fetchAdditionalProcessDeals();

			}
		} catch (error) {
			console.error("Error creating Additional Pprocess Deal:", error);
			showError("An error occurred while creating Additional Pprocess Deal.");
		}
	};

	// Function to handle editing a Additional Pprocess deal
	const handleEditAddPgDeal = (data) => {
		setEditAddPgDdealId(data.appid);
		setNewAddPgDeal(data);
		onOpen(); // Open the modal
	};

	// Function to handle updating the Additional Pprocess Deal
	const handleUpdateAddPgDeal = async () => {
		try {
			const updatedDealData = {
				...newAddPgDeal,
			};

			const { success, message } = await updateAdditionalProcessDeal(
				editAddPgDdealId,
				updatedDealData
			);

			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
				setEditAddPgDdealId(null);
				fetchAdditionalProcessDeals();
			}
		} catch (error) {
			console.error("Error updating Additional Pprocess Deal:", error);
			showError(
				"An error occurred while updating the Additional Pprocess Deal."
			);
		}
	};

	// Delete function
	const handleDelete = async () => {
		try {
			const { success, message } = await deleteAdditionalProcessDeal(
				addPgDealToDelete
			);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				fetchAdditionalProcessDeals();
			}
		} catch (error) {
			console.error("Error deleting Additional Pprocess Deal:", error);
			showError(
				"An error occurred while deleting the Additional Pprocess Deal."
			);
		} finally {
			setDeleteModalOpen(false);
			setAddPgDealToDelete(null);
		}
	};

	// Open the delete confirmation modal
	const openDeleteConfirmation = (data) => {
		setAddPgDealToDelete(data.appid);
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
						Additional Pprocess Deals Page
					</Text>

					{/* Align button to the left */}
					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Additional Pprocess Deal
						</Button>
					</Flex>

					{/* Search Bar Component */}
					<SearchBar
						fields={["appid", "deal_id"]} // Search by Deal ID, Client ID, and Contact
						onSearch={handleSearch}
						placeholder="Search by Additional Pprocess Deal ID, Deal ID"
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
								data={searchResults} // Always show search results or all Additional Pprocess Deal
								columns={columns}
								caption={caption}
								onEdit={handleEditAddPgDeal} // Pass the handleEditClient function
								onDelete={openDeleteConfirmation} // Pass the openDeleteConfirmation function
							/>
						)}
					</div>

					{/* Display message when no Additional Pprocess Deal found */}
					{!loading && searchResults.length === 0 && (
						<VStack spacing={8} mt={10}>
							<Text
								fontSize={"xl"}
								fontWeight={"bold"}
								color={"gray.500"}
								textAlign={"center"}
							>
								No Additional Pprocess Deal found 😢
							</Text>
						</VStack>
					)}
				</VStack>
			</Container>

			{/* Add or Edit Additional Pprocess Deal Modal */}
			<FormModal
				isOpen={isOpen}
				onClose={() => {
					onClose(); // Close modal
					resetForm(); // Reset form data
					setEditAddPgDdealId(null); // Reset the edit client ID
				}}
				formData={newAddPgDeal}
				handleChange={handleChange}
				handleSubmit={editAddPgDdealId ? handleUpdateAddPgDeal : handleCreateAddPgDeal}
				modalTitle={editAddPgDdealId ? "Edit Dyeing Deal" : "Add Dyeing Deal"}
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


export default AdditionalDealViewPage