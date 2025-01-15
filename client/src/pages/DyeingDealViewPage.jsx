import {
	Container,
	Text,
	VStack,
	Box,
	Flex,
	useDisclosure,
	Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { useDyeingFinishingDealsStore } from "../store";

import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";

import { useToastNotification } from "../hooks/toastUtils";

function DyeingDealViewPage() {

	const { showError, showSuccess } = useToastNotification();

	const [dyeingdeal, setdyeingdeal] = useState({});

	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false); // Loading state

	const { isOpen, onOpen, onClose } = useDisclosure();

	const [newDyeingDeal, setNewDyeingDeal] = useState({
		dfpid: "",
		deal_id: "",
		color: "",
		shade_percent: "",
		service_type: "",
		service_price_tk: "",
		double_dyeing_tk: "",
		total_price: "",
		notes: "",
	});

	const resetForm = () => {
		setNewDyeingDeal({
			dfpid: "",
			deal_id: "",
			color: "",
			shade_percent: "",
			service_type: "",
			service_price_tk: "",
			double_dyeing_tk: "",
			total_price: "",
			notes: "",
		});
	};

	const [editDyeingDdealId, setEditDyeingDdealId] = useState(null);
	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

	const [dyeingDealToDelete, setDyeingDealToDelete] = useState(null);

	const {
		fetchDyeingFinishingDeals,
		updateDyeingFinishingDeals,
		deleteDyeingFinishingDeal,
		dyeingFinishingDeals,
	} = useDyeingFinishingDealsStore();

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await fetchDyeingFinishingDeals();
			setLoading(false);
		};
		loadData();
	}, [fetchDyeingFinishingDeals]);

	// Update client deals state when the data changes
	useEffect(() => {
		setdyeingdeal(dyeingFinishingDeals);
		setSearchResults(dyeingFinishingDeals); // Set search results to all clients initially
	}, [dyeingFinishingDeals]);

	// Handle search functionality
	const handleSearch = (query) => {
		if (query === "") {
			// If query is empty, show all clients
			setSearchResults(dyeingdeal);
		} else {
			// Search logic based on multiple fields (id, name, etc.)
			const results = dyeingdeal.filter((data) => {
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

		setNewDyeingDeal({ ...newDyeingDeal, [name]: value });
	};

	// Define fields that will be shown for both Add and Edit
	const commonFields = [
		{
			name: "deal_id",
			label: "Deal ID",
			placeholder: "Enter Deal ID",
		},

		{
			name: "color",
			label: "Color",
			placeholder: "Enter Color",
		},
		{
			name: "shade_percent", 
			label: "Shade Parcent",
			placeholder: "Enter Shade Parcent",
			},
		{
			name: "service_type",
			label: "Service Type",
			placeholder: "Enter Service Type",
		},
		{
			name: "service_price_tk",
			label: "Service Price Tk",
			placeholder: "Enter Service Price Tk",
		},
		{
			name: "double_dyeing_tk",
			label: "Double Dyeing Tk",
			placeholder: "Enter Double Dyeing Tk",
		},
		{
			name: "total_price",
			label: "Total Price",
			placeholder: "Enter Total Price",
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
		},
	];

	// Combine fields based on the condition
	const fields = editDyeingDdealId
		? [...commonFields, ...editFields]
		: commonFields;

	const columns = [
		{ Header: "ID", accessor: "dfpid" },
		{ Header: "Deal ID", accessor: "deal_id" },
		{ Header: "Color", accessor: "color" },
		{ Header: "Shade Parcent", accessor: "shade_percent" },
		{ Header: "Service Type", accessor: "service_type" },
		{ Header: "Service Price Tk", accessor: "service_price_tk" },
		{ Header: "Double Dyeing Tk", accessor: "double_dyeing_tk" },
		{ Header: "Total Price", accessor: "total_price" },
		{ Header: "Notes", accessor: "notes" },
	];

	const caption = "Dyeing Deal Information List"; // Optional Caption for the table

	// Function to handle editing a client deal
	const handleEditDyeingDeal = (data) => {
		setEditDyeingDdealId(data.dfpid); // Set the client ID to track which client we're editing
		setNewDyeingDeal(data); // Populate the form with the existing data
		onOpen(); // Open the modal
	};

	// Function to handle updating the client
	const handleUpdateDyeingDeal = async () => {
		try {
			// Merge bank_info into newCDeal
			const updatedDealData = {
				...newDyeingDeal
			};

			// Update the client deal with the merged data
			const { success, message } = await updateDyeingFinishingDeals(
				editDyeingDdealId,
				updatedDealData
			);

			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
				setEditDyeingDdealId(null);
				fetchDyeingFinishingDeals();
			}
		} catch (error) {
			console.error("Error updating dyeing deal:", error);
			showError("An error occurred while updating the dyeing deal.");
		}
	};

	// Delete function
	const handleDelete = async () => {
		try {
			const { success, message } = await deleteDyeingFinishingDeal(
				dyeingDealToDelete
			);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
        fetchDyeingFinishingDeals();
			}
		} catch (error) {
			console.error("Error deleting dyeing deals:", error);
			showError("An error occurred while deleting the dyeing deals.");
		} finally {
			setDeleteModalOpen(false);
			setDyeingDealToDelete(null);
		}
	};

	// Open the delete confirmation modal
	const openDeleteConfirmation = (data) => {
		setDyeingDealToDelete(data.dfpid);
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
            Dyeing Deals Page
					</Text>

					{/* Search Bar Component */}
					<SearchBar
						fields={["dfpid", "deal_id"]} // Search by Deal ID, Client ID, and Contact
						onSearch={handleSearch}
						placeholder="Search by Dyeing Deal ID, Deal ID"
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
								onEdit={handleEditDyeingDeal} // Pass the handleEditClient function
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
								No dyeing deals found 😢
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
					setEditDyeingDdealId(null); // Reset the edit client ID
				}}
				formData={newDyeingDeal}
				handleChange={handleChange}
				handleSubmit={editDyeingDdealId && handleUpdateDyeingDeal}
				modalTitle={editDyeingDdealId && "Edit Dyeing Deal"}
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

export default DyeingDealViewPage