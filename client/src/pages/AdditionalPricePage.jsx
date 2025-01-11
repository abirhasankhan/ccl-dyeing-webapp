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

import { useAdditionalPriceStore } from "../store";
import { DataTable, FormModal, DeleteConfirmationModal } from "../components";
import { useToastNotification } from "../hooks/toastUtils";

function AdditionalPricePage() {
  const { showError, showSuccess } = useToastNotification();

  const [addPrice, setAddPrice] = useState([]);

  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [newAddPrice, setNewAddPrice] = useState({
		process_type: "",
		price_tk: "",
		remarks: "",
  });

  //reset form data
  const resetForm = () => {
		setNewAddPrice({
			process_type: "",
			price_tk: "",
			remarks: "",
		});
  };

  const [editAddPriceId, setEditAddPriceId]  = useState(null);

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const [addPriceToDelete, setAddPriceToDelete] = useState(null);

  const {
		createAdditionalPrice,
		fetchAdditionalPrices,
		updateAdditionalPrice,
		deleteAdditionalPrice,
		additionalPrices,
  } = useAdditionalPriceStore();

  useEffect(() => {
		const loadAdditionalPrices = async () => {
			setLoading(true);
			await fetchAdditionalPrices();
			setLoading(false);
		};
		loadAdditionalPrices();
  }, [fetchAdditionalPrices]);

  useEffect(() => {
		setAddPrice(additionalPrices);
  }, [additionalPrices]);


  const handleChange = (e) => {
		setNewAddPrice({ ...newAddPrice, [e.target.name]: e.target.value });
  };

  const commonFields = [
		{
			label: "Process Type",
			name: "process_type",
			placeholder: "Process Type",
			type: "text",
		},
		{
			label: "Price TK",
			name: "price_tk",
			placeholder: "Price TK (number only)",
			type: "number",
		},
		{
			label: "Remarks",
			name: "remarks",
			placeholder: "Remarks",
			type: "text",
		},
  ];

  const editFields = [
		{
			label: "Process Type",
			name: "process_type",
			placeholder: "Process Type",
			type: "text",
		},
		{
			label: "Price TK",
			name: "price_tk",
			placeholder: "Price TK (number only)",
			type: "number",
		},
		{
			label: "Remarks",
			name: "remarks",
			placeholder: "Remarks",
			type: "text",
		},
  ];

  const fields = editAddPriceId ? editFields : commonFields;

  const columns = [
		{ Header: "ID", accessor: "ap_priceid" }, // Ensure 'df_priceid' is the correct field name in your data
		{ Header: "Process Type", accessor: "process_type" },
    { Header: "Price TK", accessor: "price_tk" },
		{ Header: "Remarks", accessor: "remarks" },
  ];

  const caption = "Additional Price List"; // Optional Caption for the table

  const handleCreateAddPrice = async () => {
		try {
			const { success, message } = await createAdditionalPrice(newAddPrice);
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

  const handleEditAddPrice = (addPriceData) => {
		setEditAddPriceId(addPriceData.ap_priceid);
		setNewAddPrice(addPriceData);
		onOpen();
  };

  const handleUpdateAddPrice = async () => {
		try {
			const { success, message } = await updateAdditionalPrice(
				editAddPriceId,
				newAddPrice
			);

			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
        setEditAddPriceId(null);
				fetchAdditionalPrices();
			}
		} catch (error) {
			console.error("Error updating client:", error);
			showError("An error occurred while updating the client.");
		}
  };

  const openDeleteConfirmation = (addPriceData) => {
		console.log("Deleting dyeing with ID:", addPriceData.ap_priceid); // Log to verify it's correct
		setAddPriceToDelete(addPriceData.ap_priceid);
		setDeleteModalOpen(true); // Open the delete confirmation modal
  };

  const handleDelete = async () => {
		console.log("Attempting to delete dyeing with ID:", addPriceToDelete); // Check if ID is correct
		try {
			const { success, message } = await deleteAdditionalPrice(
				addPriceToDelete
			);
			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				fetchAdditionalPrices();
			}
		} catch (error) {
			console.error("Error deleting dyeing price:", error);
			showError("An error occurred while deleting the dyeing price.");
		} finally {
			setDeleteModalOpen(false);
			setAddPriceToDelete(null);
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
						Additional Price List
					</Text>

					{/* Align button to the left */}
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
						<DataTable
							data={additionalPrices}
							columns={columns}
							caption={caption}
							onEdit={handleEditAddPrice}
							onDelete={openDeleteConfirmation} // Ensure the correct ID is passed
						/>
					)}

					{/* Display message when no data found */}
					{!loading && addPrice.length === 0 && (
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
					setEditAddPriceId(null); // Reset the edit client ID
				}}
				formData={newAddPrice}
				handleChange={handleChange}
				handleSubmit={
					editAddPriceId ? handleUpdateAddPrice : handleCreateAddPrice // Conditional submit : handleCreateDyeing
				}
				modalTitle={
					editAddPriceId
						? "Edit Additional Price"
						: "Add Additional Price"
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

export default AdditionalPricePage;
