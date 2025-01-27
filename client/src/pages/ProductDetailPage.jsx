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

import { useProductDetailsStore } from "../store";

import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";

import { useToastNotification } from "../hooks/toastUtils";

function ProductDetailPage() {

	const { showError, showSuccess } = useToastNotification();

	const [data, setData] = useState([]);

	const [searchResults, setSearchResults] = useState([]);

	const [loading, setLoading] = useState(false);

	const { isOpen, onOpen, onClose } = useDisclosure();

	const [newProductDetail, setNewProductDetail] = useState({
		shipmentid: "",
		yarn_count: "",
		color: "",
		fabric: "",
		gsm: "",
		machine_dia: "",
		finish_dia: "",
		rolls_received: "",
		grey_received_qty: "",
		grey_return_qty: "",
		notes: "",
		final_qty: "",
		rejected_qty: "",
	});

	// Reset the form fields
	const resetForm = () => {
		setNewProductDetail({
			shipmentid: "",
			yarn_count: "",
			color: "",
			fabric: "",
			gsm: "",
			machine_dia: "",
			finish_dia: "",
			rolls_received: "",
			grey_received_qty: "",
			grey_return_qty: "",
			notes: "",
			final_qty: "",
			rejected_qty: "",
		});
	};

	// To track whether we're editing or adding
	const [editId, setEditId] = useState(null);

	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

	const [dataToDelete, setDataToDelete] = useState(null);

	const {
		createProductDetail,
		fetchProductDetails,
		updateProductDetail,
		deleteProductDetail,
		productDetails,
	} = useProductDetailsStore();


	// Fetch data on initial load
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await fetchProductDetails();
			setLoading(false);
		};
		loadData();
	}, [fetchProductDetails]);

	// Update product details when the data changes
	useEffect(() => {
		setData(productDetails);
		setSearchResults(productDetails);
	}, [productDetails]);


	// Handle search functionality
	const handleSearch = (query) => {
		if (query === "") {
			setSearchResults(data);
		} else {
			const results = data.filter((item) => {
				return (
					item.productdetailid.toString().includes(query) ||
					item.shipmentid.toString().includes(query) ||
					item.yarn_count
						.toLowerCase()
						.includes(query.toLowerCase()) ||
					item.color.toLowerCase().includes(query.toLowerCase()) ||
					item.fabric.toLowerCase().includes(query.toLowerCase())
				);
			});
			setSearchResults(results);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setNewProductDetail({ ...newProductDetail, [name]: value });
	};

	// Define fields that will be shown for both Add and Edit
	const commonFields = [
		{
			name: "shipmentid",
			label: "Shipment ID",
			placeholder: "Enter Shipment ID",
			type: "text",
		},
		{
			name: "yarn_count",
			label: "Yarn Count",
			placeholder: "Enter Yarn Count",
			type: "text",
		},
		{
			name: "color",
			label: "Color",
			placeholder: "Enter Color",
			type: "text",
		},
		{
			name: "fabric",
			label: "Fabric",
			placeholder: "Enter Fabric",
			type: "text",
		},
		{
			name: "gsm",
			label: "GSM",
			placeholder: "Enter GSM",
			type: "number",
		},
		{
			name: "machine_dia",
			label: "Machine Dia",
			placeholder: "Enter Machine Dia",
			type: "number",
		},
		{
			name: "finish_dia",
			label: "Finish Dia",
			placeholder: "Enter Finish Dia",
			type: "number",
		},
		{
			name: "rolls_received",
			label: "Rolls Received",
			placeholder: "Enter Rolls Received",
			type: "number",
		},
		{
			name: "grey_received_qty",
			label: "Grey Received Quantity",
			placeholder: "Enter Grey Received Quantity",
			type: "number",
		},
		{
			name: "grey_return_qty",
			label: "Grey Return Quantity",
			placeholder: "Enter Grey Return Quantity",
			type: "number",
		},
		{
			name: "notes",
			label: "Notes",
			placeholder: "Enter Notes",
			type: "text",
		},
	];

	const editFields = [
		{
			name: "final_qty",
			label: "Final Qty After Dyeing",
			placeholder: "Enter Final Qty",
			type: "number",
		},
		{
			name: "rejected_qty",
			label: "Rejected Qty After Dyeing",
			placeholder: "Enter Rejected Qty",
			type: "number",
		},
	];

	const fields = editId ? [...commonFields, ...editFields] : commonFields;

	const columns = [
		{ Header: "Product Detail ID", accessor: "productdetailid" },
		{ Header: "Shipment ID", accessor: "shipmentid" },
		{ Header: "Yarn Count", accessor: "yarn_count" },
		{ Header: "Color", accessor: "color" },
		{ Header: "Fabric", accessor: "fabric" },
		{ Header: "GSM", accessor: "gsm" },
		{ Header: "Machine Dia", accessor: "machine_dia" },
		{ Header: "Finish Dia", accessor: "finish_dia" },
		{ Header: "Rolls Received", accessor: "rolls_received" },
		{ Header: "Grey Received Quantity", accessor: "grey_received_qty" },
		{ Header: "Grey Return Quantity", accessor: "grey_return_qty" },
		{ Header: "Final Qty", accessor: "final_qty" },
		{ Header: "Rejected Qty", accessor: "rejected_qty" },
		{ Header: "Notes", accessor: "notes" },
		{ Header: "Created At", accessor: "created_at" },
		{ Header: "Updated At", accessor: "updated_at" },
	];


	const caption = "Product Details List";


	// Create a new product detail
	const handleCreate = async () => {

		try {
			const { success, message } = await createProductDetail(
				newProductDetail
			);
			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				onClose();
				resetForm();
                fetchProductDetails();
			}
		} catch (error) {
			console.error("Error creating product detail:", error);
			showError("An error occurred while creating the product detail.");
		}
	};

	// Function to handle editing a product detail
	const handleEdit = (data) => {
		setEditId(data.productdetailid);
		setNewProductDetail(data);
		onOpen();
	};

	// Function to handle updating the product detail
	const handleUpdate = async () => {
		try {
			const { success, message } = await updateProductDetail(
				editId,
				newProductDetail
			);

			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				onClose();
				resetForm();
				setEditId(null);
				fetchProductDetails();
			}
		} catch (error) {
			console.error("Error updating product detail:", error);
			showError("An error occurred while updating the product detail.");
		}
	};

	// Delete function
	const handleDelete = async () => {
		try {
			const { success, message } = await deleteProductDetail(
				dataToDelete
			);
			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				fetchProductDetails();
			}
		} catch (error) {
			console.error("Error deleting product detail:", error);
			showError("An error occurred while deleting the product detail.");
		} finally {
			setDeleteModalOpen(false);
			setDataToDelete(null);
		}
	};

	// Open the delete confirmation modal
	const openDeleteConfirmation = (data) => {
		setDataToDelete(data.productdetailid);
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
						Product Details Page
					</Text>

					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Product Detail
						</Button>
					</Flex>

					<SearchBar
						fields={[
							"productdetailid",
							"shipmentid",
							"yarn_count",
							"color",
							"fabric",
						]}
						onSearch={handleSearch}
						placeholder="Search by product detail ID, shipment ID, yarn count, color, or fabric"
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
								No product details found 😢
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
				formData={newProductDetail}
				handleChange={handleChange}
				handleSubmit={editId ? handleUpdate : handleCreate}
				modalTitle={
					editId ? "Edit Product Detail" : "Add New Product Detail"
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

export default ProductDetailPage;
