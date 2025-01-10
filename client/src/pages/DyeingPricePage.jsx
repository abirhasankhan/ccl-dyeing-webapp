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

import { useDyeingPriceStore } from "../store";
import { DataTable, FormModal, DeleteConfirmationModal } from "../components";
import { useToastNotification } from "../hooks/toastUtils";

function DyeingPricePage() {
	const { showError, showSuccess } = useToastNotification();

	const [dyeing, setDyeing] = useState([]);

	const [loading, setLoading] = useState(false);

	const { isOpen, onOpen, onClose } = useDisclosure();

	const [newDyeing, setNewDyeing] = useState({
		color: "",
		shade_percent: "",
		tube_tk: "",
		open_tk: "",
		elasteen_tk: "",
		double_dyeing_tk: "",
		remarks: "",
	});

	//reset form data
	const resetForm = () => {
		setNewDyeing({
			color: "",
			shade_percent: "",
			tube_tk: "",
			open_tk: "",
			elasteen_tk: "",
			double_dyeing_tk: "",
			remarks: "",
		});
	};

	const [editDyeingId, setEditDyeingId] = useState(null);

	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

	const [dyeingToDelete, setDyeingToDelete] = useState(null);

	const {
		dyeingPrices,
		createDyeingPrice,
		fetchDyeingPrice,
		updateDyeingPrice,
		deleteDyeingPrice,
	} = useDyeingPriceStore();

	useEffect(() => {
		const loadDyeingPrices = async () => {
			setLoading(true);
			await fetchDyeingPrice();
			setLoading(false);
		};
		loadDyeingPrices();
	}, [fetchDyeingPrice]);

	useEffect(() => {
		setDyeing(dyeingPrices);
	}, [dyeingPrices]);

	useEffect(() => {
		console.log("Dyeing prices data:", dyeingPrices); // Check data structure
		setDyeing(dyeingPrices);
	}, [dyeingPrices]);


	const handleChange = (e) => {
		setNewDyeing({ ...newDyeing, [e.target.name]: e.target.value });
	};

	const commonFields = [
		{ label: "Color", name: "color", placeholder: "Color" },
		{ label: "Shade %", name: "shade_percent", placeholder: "Shade %" },
		{ label: "Tube TK", name: "tube_tk", placeholder: "Tube TK" },
		{ label: "Open TK", name: "open_tk", placeholder: "Open TK" },
		{
			label: "Elasteen TK",
			name: "elasteen_tk",
			placeholder: "Elasteen TK",
		},
		{
			label: "Double Dyeing TK",
			name: "double_dyeing_tk",
			placeholder: "Double Dyeing TK",
		},
		{ label: "Remarks", name: "remarks", placeholder: "Remarks" },
	];

	const editFields = [
		{ label: "Color", name: "color", placeholder: "Color" },
		{ label: "Shade %", name: "shade_percent", placeholder: "Shade %" },
		{ label: "Tube TK", name: "tube_tk", placeholder: "Tube TK" },
		{ label: "Open TK", name: "open_tk", placeholder: "Open TK" },
		{
			label: "Elasteen TK",
			name: "elasteen_tk",
			placeholder: "Elasteen TK",
		},
		{
			label: "Double Dyeing TK",
			name: "double_dyeing_tk",
			placeholder: "Double Dyeing TK",
		},
		{ label: "Remarks", name: "remarks", placeholder: "Remarks" },
	];

	const fields = editDyeingId ? editFields : commonFields;

	const columns = [
		{ Header: "ID", accessor: "df_priceid" }, // Ensure 'df_priceid' is the correct field name in your data
		{ Header: "Color", accessor: "color" },
		{ Header: "Shade %", accessor: "shade_percent" },
		{ Header: "Tube TK", accessor: "tube_tk" },
		{ Header: "Open TK", accessor: "open_tk" },
		{ Header: "Elasteen TK", accessor: "elasteen_tk" },
		{ Header: "Double Dyeing TK", accessor: "double_dyeing_tk" },
		{ Header: "Remarks", accessor: "remarks" },
	];


	const caption = "Dyeing Price List"; // Optional Caption for the table

	const handleCreateDyeing = async () => {
		try {
			const { success, message } = await createDyeingPrice(newDyeing);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
			}
		} catch (error) {
			console.error("Error creating client:", error);
			showError("An error occurred while creating the client.");
		}
	};

	const handleEditDyeing = (dyeingData) => {
		setEditDyeingId(dyeingData.df_priceid);
		setNewDyeing(dyeingData); 
		onOpen();
	};

	
	const handleUpdateClient = async () => {
		try {
			const { success, message } = await updateDyeingPrice(
				editDyeingId,
				newDyeing
			);

			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
				setEditDyeingId(null);
				fetchDyeingPrice();

			}
		} catch (error) {
			console.error("Error updating client:", error);
			showError("An error occurred while updating the client.");
		}
	};

	const openDeleteConfirmation = (dyeingData) => {
		console.log("Deleting dyeing with ID:", dyeingData.df_priceid); // Log to verify it's correct
		setDyeingToDelete(dyeingData.df_priceid);
		setDeleteModalOpen(true); // Open the delete confirmation modal
	};


const handleDelete = async () => {
	console.log("Attempting to delete dyeing with ID:", dyeingToDelete); // Check if ID is correct
	try {
		const { success, message } = await deleteDyeingPrice(dyeingToDelete);
		if (!success) {
			showError(message);
		} else {
			showSuccess(message);
			fetchDyeingPrice();
		}
	} catch (error) {
		console.error("Error deleting dyeing price:", error);
		showError("An error occurred while deleting the dyeing price.");
	} finally {
		setDeleteModalOpen(false);
		setDyeingToDelete(null);
	}
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
						Dyeing Price List
					</Text>

					{/* Align button to the left */}
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
						<DataTable
							data={dyeingPrices}
							columns={columns}
							caption={caption}
							onEdit={handleEditDyeing}
							onDelete={openDeleteConfirmation} // Ensure the correct ID is passed
						/>
					)}

					{/* Display message when no data found */}
					{!loading && dyeing.length === 0 && (
						<VStack spacing={8} mt={10}>
							<Text
								fontSize={"xl"}
								fontWeight={"bold"}
								color={"gray.500"}
								textAlign={"center"}
							>
								No data found 😢
							</Text>
						</VStack>
					)}
				</VStack>
			</Container>

			<FormModal
				isOpen={isOpen}
				onClose={() => {
					onClose(); // Close modal
					resetForm(); // Reset form data
					setEditDyeingId(null); // Reset the edit client ID
				}}
				formData={newDyeing}
				handleChange={handleChange}
				handleSubmit={
					editDyeingId ? handleUpdateClient : handleCreateDyeing
				}
				modalTitle={
					editDyeingId ? "Edit Dyeing Price" : "Add Dyeing Price"
				}
				fields={fields} // Pass the dynamic field configuration
			/>

			<DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleDelete}
			/>
		</Box>
	);


}
export default DyeingPricePage;
