import {
	Container,
	Text,
	VStack,
	Button,
	Box,
	Flex,
	useDisclosure,
	Spinner,
	Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import {
	useDyeingPriceStore,
	useAdditionalPriceStore,
} from "../store";

import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";

import { useToastNotification } from "../hooks/toastUtils";

function ServicePricePage() {
	const { showError, showSuccess } = useToastNotification();

	const [dyingPrices, setDyingPrices] = useState([]);
	const [additionalPrices, setAdditionalPrices] = useState([]);

	const [loading, setLoading] = useState(false); // Loading state

	const { isOpen, onOpen, onClose } = useDisclosure();

	const [newDyeingPrice, setNewDyeingPrice] = useState({
		color: "",
		tube_tk: 0,
		open_tk: 0,
		elasteen_tk: 0,
		status: "",
	});

	const [newAdditionalPrice, setNewAdditionalPrice] = useState({
		service: "",
		tk: 0,
		status: "",
	});

	// Reset form data
	const resetForm = () => {
		setNewDyeingPrice({
			color: "",
			tube_tk: 0,
			open_tk: 0,
			elasteen_tk: 0,
			status: "",
		}),
			setNewAdditionalPrice({
				service: "",
				tk: 0,
				status: "",
			});
	};

	// to Tracker whether we're adding or editing a service price
	const [editDyingPriceId, setEditDyingPriceId] = useState(null);
	const [editAdditionalPriceId, setEditAdditionalPriceId] = useState(null);

	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [dyingPriceToDelete, setDyingPriceToDelete] = useState(null);
	const [additionalPriceToDelete, setAdditionalPriceToDelete] =
		useState(null);

	const {
		createDyeingPrice,
		fetchDyeingPrice,
		updateDyeingPrice,
		deleteDyeingPrice,
		dyingPrice,
	} = useDyeingPriceStore();

	const {
		createAdditionalPrice,
		fetchAdditionalPrices,
		updateAdditionalPrice,
		deleteAdditionalPrice,
		additionalPrice,
	} = useAdditionalPriceStore();

	// Fetch dyeing & additional prices
	useEffect(() => {
		fetchDyeingPrice();
		fetchAdditionalPrices();
	}, [fetchDyeingPrice, fetchAdditionalPrices]);

	// Update dyeing & additional when the data changes
	useEffect(() => {
		setDyingPrices(dyingPrice);
		setAdditionalPrices(additionalPrice);
	}, [dyingPrice, additionalPrice]);

	const handleChangeDyeingPrice = (e) => {
		setNewDyeingPrice({
			...newDyeingPrice,
			[e.target.name]: e.target.value,
		});
	};

	const handleChangeAdditionalPrice = (e) => {
		setNewAdditionalPrice({
			...newAdditionalPrice,
			[e.target.name]: e.target.value,
		});
	};

	// Define fields that will be shown for both Add and Edit forms
	const dyingPriceFields = [
		{
			name: "color",
			label: "Color",
			type: "text",
		},
		{
			name: "shade_percent",
			label: "Shade Percent",
			type: "text",
		},
		{
			name: "tube_tk",
			label: "Tube TK",
			type: "number",
		},
		{
			name: "open_tk",
			label: "Open TK",
			type: "number",
		},
		{
			name: "elasteen_tk",
			label: "Elasteen TK",
			type: "number",
		},
		{
			name: "double_dyeing_tk",
			label: "Double Dyeing TK",
			type: "number",
		},
		{
			name: "remarks",
			label: "Remarks",
			placeholder: "Enter Remarks",
		},
	];

	const additionalPriceFields = [
		{
			name: "product_type",
			label: "Product Type",
			type: "text",
		},
		{
			name: "price_tk",
			label: "TK",
			type: "number",
		},
		{
			name: "remarks",
			label: "Remarks",
			placeholder: "Enter Remarks",
		},
	];

	// Define additional fields for editing
	const dyingEditFields = [
		{
			name: "status",
			label: "Status",
			type: "select",
			options: [
				{ value: "active", label: "Active" },
				{ value: "inactive", label: "Inactive" },
			],
		},
	];

	const additionalEditFields = [
		{
			name: "status",
			label: "Status",
			type: "select",
			options: [
				{ value: "active", label: "Active" },
				{ value: "inactive", label: "Inactive" },
			],
		},
	];

	const dyingFields = editDyingPriceId
		? [...dyingPriceFields, ...dyingEditFields]
		: dyingPriceFields;

	const additionalFields = editAdditionalPriceId
		? [...additionalPriceFields, ...additionalEditFields]
		: additionalPriceFields;

	const dyingColumns = [
		{ Header: "ID", accessor: "df_priceid" },
		{ Header: "Color", accessor: "color" },
		{ Header: "Shade Percent", accessor: "shade_percent" },
		{ Header: "Tube TK", accessor: "tube_tk" },
		{ Header: "Open TK", accessor: "open_tk" },
		{ Header: "Elasteen TK", accessor: "elasteen_tk" },
		{ Header: "Double Dyeing TK", accessor: "double_dyeing_tk" },
		{ Header: "Remarks", accessor: "remarks" },
	];

	const additionalColumns = [
		{ Header: "ID", accessor: "ap_priceid" },
		{ Header: "Process Type", accessor: "process_type" },
		{ Header: "TK", accessor: "tk" },
		{ Header: "Remarks", accessor: "remarks" },
	];

	const dyingCaption = "Dyeing & Finishing Prices";
	const additionalCaption = "Additional Prices";

	// createClient function to handle creating dyeing price
	const handleCreateDyeingPrice = async () => {
		try {
			const { success, message } = await createDyeingPrice(
				newDyeingPrice
			);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
			}
		} catch (error) {
			console.error("Error creating dyeing price:", error);
			showError("An error occurred while creating the dyeing price.");
		}
	};

	// createClient function to handle creating additional price
	const handleCreateAdditionalPrice = async () => {
		try {
			const { success, message } = await createAdditionalPrice(
				newAdditionalPrice
			);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
			}
		} catch (error) {
			console.error("Error creating additional price:", error);
			showError("An error occurred while creating the additional price.");
		}
	};

	// Function to handle editing a dyeing price
	const handleEditDyeingPrice = (dyeingPriceData) => {
		setEditDyingPriceId(dyeingPriceData.df_priceid); // Set the dyeing price ID to track which dyeing price we're editing
		setNewDyeingPrice(dyeingPriceData); // Populate the form with the existing data
		onOpen(); // Open the modal
	};

	// Function to handle editing an additional price
	const handleEditAdditionalPrice = (additionalPriceData) => {
		setEditAdditionalPriceId(additionalPriceData.ap_priceid); // Set the additional price ID to track which additional price we're editing
		setNewAdditionalPrice(additionalPriceData); // Populate the form with the existing data
		onOpen(); // Open the modal
	};

	// Function to handle updating the dyeing price
	const handleUpdateDyeingPrice = async () => {
		try {
			const { success, message } = await updateDyeingPrice(
				editDyingPriceId,
				newDyeingPrice
			);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
				setEditDyingPriceId(null);
			}
		} catch (error) {
			console.error("Error updating dyeing price:", error);
			showError("An error occurred while updating the dyeing price.");
		}
	};

	// Function to handle updating the additional price
	const handleUpdateAdditionalPrice = async () => {
		try {
			const { success, message } = await updateAdditionalPrice(
				editAdditionalPriceId,
				newAdditionalPrice
			);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
				setEditAdditionalPriceId(null);
			}
		} catch (error) {
			console.error("Error updating additional price:", error);
			showError("An error occurred while updating the additional price.");
		}
	};

	// Delete function to delete dyeing price
	const handleDeleteDyeingPrice = async (dyeingPriceData) => {
		try {
			const { success, message } = await deleteDyeingPrice(
				dyeingPriceData.df_priceid
			);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
			}
		} catch (error) {
			console.error("Error deleting dyeing price:", error);
			showError("An error occurred while deleting the dyeing price.");
		} finally {
			setDeleteModalOpen(false);
			setDyingPriceToDelete(null);
		}
	};

	// Delete function to delete additional price
	const handleDeleteAdditionalPrice = async (additionalPriceData) => {
		try {
			const { success, message } = await deleteAdditionalPrice(
				additionalPriceData.ap_priceid
			);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
			}
		} catch (error) {
			console.error("Error deleting additional price:", error);
			showError("An error occurred while deleting the additional price.");
		} finally {
			setDeleteModalOpen(false);
			setAdditionalPriceToDelete(null);
		}
	};

	// Open the delete confirmation modal for dyeing price
	const openDeleteDyeingPriceConfirmation = (dyeingPriceData) => {
		setDyingPriceToDelete(dyeingPriceData); // Set the dyeing price to delete
		setDeleteModalOpen(true); // Open the modal
	};

	// Open the delete confirmation modal for additional price
	const openDeleteAdditionalPriceConfirmation = (additionalPriceData) => {
		setAdditionalPriceToDelete(additionalPriceData); // Set the additional price to delete
		setDeleteModalOpen(true); // Open the modal
	}

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
						Service Price List
					</Text>
					<Text
						fontSize={"20"}
						fontWeight={"bold"}
						bgGradient={"linear(to-r, cyan.400, blue.400)"}
						bgClip={"text"}
						textAlign={"center"}
					>
						Dyeing Price List
					</Text>

					{/* Align button to the left for dyeing price */}
					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Dyeing Price
						</Button>
					</Flex>

					{/* Loading Spinner */}
					{loading ? (
						<Flex justify="center" mt={8}>
							<Spinner size="xl" />
						</Flex>
					) : (
						// Display DataTable with client data
						<DataTable
							data={dyingPrices}
							columns={dyingColumns}
							caption={dyingCaption}
							onEdit={handleEditDyeingPrice}
							onDelete={openDeleteDyeingPriceConfirmation}
						/>
					)}

					{/* Display message when no Dyeing Price data is available */}
					{!loading && (
						<VStack spacing={8} mt={10}>
							<Text
								fontSize={"xl"}
								fontWeight={"bold"}
								color={"gray.500"}
								textAlign={"center"}
							>
								No Dyeing Price is Available 😢
							</Text>
						</VStack>
					)}

					<Divider size="xl" borderWidth="2px" borderColor="cyan" />

					<Text
						fontSize={"20"}
						fontWeight={"bold"}
						bgGradient={"linear(to-r, cyan.400, blue.400)"}
						bgClip={"text"}
						textAlign={"center"}
					>
						Additional Price List
					</Text>

					{/* Align button to the left for additional price */}
					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Additional Price
						</Button>
					</Flex>

					{/* Loading Spinner */}
					{loading ? (
						<Flex justify="center" mt={8}>
							<Spinner size="xl" />
						</Flex>
					) : (
						// Display DataTable with client data
						<DataTable
							data={additionalPrices}
							columns={additionalColumns}
							caption={additionalCaption}
							onEdit={handleEditAdditionalPrice}
							onDelete={openDeleteAdditionalPriceConfirmation}
						/>
					)}

					{/* Display message when no Additional Price data is available */}
					{!loading && (
						<VStack spacing={8} mt={10}>
							<Text
								fontSize={"xl"}
								fontWeight={"bold"}
								color={"gray.500"}
								textAlign={"center"}
							>
								No Additional Price is Available 😢
							</Text>
						</VStack>
					)}
				</VStack>
			</Container>

			{/* Add or Edit Dyeing Modal */}
			<FormModal
				isOpen={isOpen}
				onClose={() => {
					onClose();
					resetForm();
					setEditDyingPriceId(null);
				}}
				formData={newDyeingPrice}
				handleChange={handleChangeDyeingPrice}
				handleSubmit={
					editDyingPriceId
						? handleUpdateDyeingPrice
						: handleCreateDyeingPrice
				}
				modalTitle={
					editDyingPriceId ? "Edit Dyeing Price" : "Add Dyeing Price"}
				fields={dyingFields}
			/>

			{/* Add or Edit Additional Modal */}
			<FormModal
				isOpen={isOpen}
				onClose={() => {
					onClose();
					resetForm();
					setEditAdditionalPriceId(null);
				}}
				formData={newAdditionalPrice}
				handleChange={handleChangeAdditionalPrice}
				handleSubmit={
					editAdditionalPriceId
						? handleUpdateAdditionalPrice
						: handleCreateAdditionalPrice
				}
				modalTitle={
					editAdditionalPriceId
						? "Edit Additional Price"
						: "Add Additional Price"}
				fields={additionalFields}
			/>

			{/* Delete Dyeing Price Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleDeleteDyeingPrice}
			/>

			{/* Delete Additional Price Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleDeleteAdditionalPrice}
			/>
		</Box>
	);
}

export default ServicePricePage;
