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

import { useDyeingProcessStore } from "../store"; // Import the dyeing process store
import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";
import { useToastNotification } from "../hooks/toastUtils";

function DyeingProcessPage() {
	const { showError, showSuccess } = useToastNotification();

	const [data, setData] = useState([]); // Stores all dyeing process records
	const [searchResults, setSearchResults] = useState([]); // Stores filtered dyeing process records
	const [loading, setLoading] = useState(false); // Loading state

	const { isOpen, onOpen, onClose } = useDisclosure(); // Modal control

	const [newDyeingProcess, setNewDyeingProcess] = useState({
		productdetailid: "",
		machineid: "",
		batch_qty: "",
		grey_weight: "",
		finish_weight: "",
		finish_after_gsm: "",
		status: "In Progress", // Default status
		notes: "",
		remarks: "",
	});

	// Reset the form fields
	const resetForm = () => {
		setNewDyeingProcess({
			productdetailid: "",
			machineid: "",
			batch_qty: "",
			grey_weight: "",
			finish_weight: "",
			finish_after_gsm: "",
			status: "In Progress",
			notes: "",
			remarks: "",
		});
	};

	// To track whether we're editing or adding
	const [editId, setEditId] = useState(null);

	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [dataToDelete, setDataToDelete] = useState(null);

	// Import dyeing process store methods and state
	const {
		createDyeingProcess,
		fetchDyeingProcesses,
		updateDyeingProcess,
		deleteDyeingProcess,
		dyeingProcesses,
	} = useDyeingProcessStore();

	// Fetch data on initial load
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await fetchDyeingProcesses();
			setLoading(false);
		};
		loadData();
	}, [fetchDyeingProcesses]);

	// Update dyeing process data when the store changes
	useEffect(() => {
		setData(dyeingProcesses);
		setSearchResults(dyeingProcesses);
	}, [dyeingProcesses]);

	// Handle search functionality
	const handleSearch = (query) => {
		if (query === "") {
			setSearchResults(data);
		} else {
			const results = data.filter((item) => {
				return (
					item.processid.toString().includes(query) ||
					item.productdetailid
						.toString()
						.includes(query.toLowerCase()) ||
					item.machineid.toString().includes(query.toLowerCase()) ||
					item.status.toLowerCase().includes(query.toLowerCase())
				);
			});
			setSearchResults(results);
		}
	};

	// Handle form input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setNewDyeingProcess({ ...newDyeingProcess, [name]: value });
	};

	// Define fields for the form
	const commonFields = [
		{
			name: "productdetailid",
			label: "Product Detail ID",
			placeholder: "Enter Product Detail ID",
			type: "text",
		},
		{
			name: "machineid",
			label: "Machine ID",
			placeholder: "Enter Machine ID",
			type: "text",
		},
		{
			name: "batch_qty",
			label: "Batch Quantity",
			placeholder: "Enter Batch Quantity",
			type: "number",
		},
		{
			name: "grey_weight",
			label: "Grey Weight",
			placeholder: "Enter Grey Weight",
			type: "number",
		},
		{
			name: "finish_weight",
			label: "Finish Weight",
			placeholder: "Enter Finish Weight",
			type: "number",
		},
		{
			name: "finish_after_gsm",
			label: "Finish After GSM",
			placeholder: "Enter Finish After GSM",
			type: "number",
		},
		{
			name: "notes",
			label: "Notes",
			placeholder: "Enter Notes",
			type: "text",
		},
		{
			name: "remarks",
			label: "Remarks",
			placeholder: "Enter Remarks",
			type: "text",
		},
	];

	// Define additional fields for editing
	const editFields = [
		{
			name: "status",
			label: "Status",
			type: "select", // Field type select
			options: [
				{ value: "In Progress", label: "In Progress" },
				{ value: "Finished", label: "Finished" },
			],
		},
	];

	const fields = editId ? [...commonFields, ...editFields] : commonFields;

	// Define columns for the data table
	const columns = [
		{ Header: "Process ID", accessor: "processid" },
		{ Header: "Product Detail ID", accessor: "productdetailid" },
		{ Header: "Machine ID", accessor: "machineid" },
		{ Header: "Batch Quantity", accessor: "batch_qty" },
		{ Header: "Grey Weight", accessor: "grey_weight" },
		{ Header: "Finish Weight", accessor: "finish_weight" },
		{ Header: "Finish After GSM", accessor: "finish_after_gsm" },
		{ Header: "Status", accessor: "status" },
		{ Header: "Notes", accessor: "notes" },
		{ Header: "Remarks", accessor: "remarks" },
	];

	const caption = "Dyeing Process List";

	// Create a new dyeing process record
	const handleCreate = async () => {
		try {
			const { success, message } = await createDyeingProcess(
				newDyeingProcess
			);
			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				onClose();
				resetForm();
				fetchDyeingProcesses();
			}
		} catch (error) {
			console.error("Error creating dyeing process:", error);
			showError("An error occurred while creating the dyeing process.");
		}
	};

	// Function to handle editing a dyeing process record
	const handleEdit = (data) => {
		setEditId(data.processid);
		setNewDyeingProcess(data);
		onOpen();
	};

	// Function to handle updating the dyeing process record
	const handleUpdate = async () => {
		try {
			const { success, message } = await updateDyeingProcess(
				editId,
				newDyeingProcess
			);

			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				onClose();
				resetForm();
				setEditId(null);
				fetchDyeingProcesses();
			}
		} catch (error) {
			console.error("Error updating dyeing process:", error);
			showError("An error occurred while updating the dyeing process.");
		}
	};

	// Delete function
	const handleDelete = async () => {
		try {
			const { success, message } = await deleteDyeingProcess(
				dataToDelete
			);
			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				fetchDyeingProcesses();
			}
		} catch (error) {
			console.error("Error deleting dyeing process:", error);
			showError("An error occurred while deleting the dyeing process.");
		} finally {
			setDeleteModalOpen(false);
			setDataToDelete(null);
		}
	};

	// Open the delete confirmation modal
	const openDeleteConfirmation = (data) => {
		setDataToDelete(data.processid);
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
						Dyeing Process Page
					</Text>

					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Dyeing Process
						</Button>
					</Flex>

					<SearchBar
						fields={[
							"processid",
							"productdetailid",
							"machineid",
							"status",
						]}
						onSearch={handleSearch}
						placeholder="Search by process ID, product detail ID, machine ID, or status"
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
								No dyeing processes found 😢
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
				formData={newDyeingProcess}
				handleChange={handleChange}
				handleSubmit={editId ? handleUpdate : handleCreate}
				modalTitle={
					editId ? "Edit Dyeing Process" : "Add New Dyeing Process"
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

export default DyeingProcessPage;
