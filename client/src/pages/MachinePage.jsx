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

import { useMachineStore } from "../store"; // Import the machine store
import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";
import { useToastNotification } from "../hooks/toastUtils";

function MachinePage() {
	const { showError, showSuccess } = useToastNotification();

	const [data, setData] = useState([]); // Stores all machine records
	const [searchResults, setSearchResults] = useState([]); // Stores filtered machine records
	const [loading, setLoading] = useState(false); // Loading state

	const { isOpen, onOpen, onClose } = useDisclosure(); // Modal control

	const [newMachine, setNewMachine] = useState({
		machineid: "",
		machine_name: "",
		machine_type: "",
		capacity: "",
		manufacturer: "",
		model: "",
		installation_date: "",
		last_maintenance_date: "",
		next_maintenance_date: "",
		remarks: "",
		status: "", // Include status for editing
	});

	// Reset the form fields
	const resetForm = () => {
		setNewMachine({
			machineid: "",
			machine_name: "",
			machine_type: "",
			capacity: "",
			manufacturer: "",
			model: "",
			installation_date: "",
			last_maintenance_date: "",
			next_maintenance_date: "",
			remarks: "",
			status: "", // Include status for editing
		});
	};

	// To track whether we're editing or adding
	const [editId, setEditId] = useState(null);

	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [dataToDelete, setDataToDelete] = useState(null);

	// Import machine store methods and state
	const {
		createMachine,
		fetchMachines,
		updateMachine,
		deleteMachine,
		machines,
	} = useMachineStore();

	// Fetch data on initial load
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await fetchMachines();
			setLoading(false);
		};
		loadData();
	}, [fetchMachines]);

	// Update machine data when the store changes
	useEffect(() => {
		setData(machines);
		setSearchResults(machines);
	}, [machines]);

	// Handle search functionality
	const handleSearch = (query) => {
		if (query === "") {
			setSearchResults(data);
		} else {
			const results = data.filter((item) => {
				return (
					item.machineid.toString().includes(query) ||
					item.machine_name
						.toLowerCase()
						.includes(query.toLowerCase()) ||
					item.machine_type
						.toLowerCase()
						.includes(query.toLowerCase()) ||
					item.manufacturer
						.toLowerCase()
						.includes(query.toLowerCase()) ||
					item.model.toLowerCase().includes(query.toLowerCase())
				);
			});
			setSearchResults(results);
		}
	};

	// Handle form input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setNewMachine({ ...newMachine, [name]: value });
	};

	// Define fields for the form
	const commonFields = [
		{
			name: "machineid",
			label: "Machine ID",
			placeholder: "Enter Machine ID",
			type: "text",
		},
		{
			name: "machine_name",
			label: "Machine Name",
			placeholder: "Enter Machine Name",
			type: "text",
		},
		{
			name: "machine_type",
			label: "Machine Type",
			placeholder: "Enter Machine Type",
			type: "text",
		},
		{
			name: "capacity",
			label: "Capacity",
			placeholder: "Enter Capacity",
			type: "number",
		},
		{
			name: "manufacturer",
			label: "Manufacturer",
			placeholder: "Enter Manufacturer",
			type: "text",
		},
		{
			name: "model",
			label: "Model",
			placeholder: "Enter Model",
			type: "text",
		},
		{
			name: "installation_date",
			label: "Installation Date",
			placeholder: "Enter Installation Date",
			type: "date",
		},
		{
			name: "last_maintenance_date",
			label: "Last Maintenance Date",
			placeholder: "Enter Last Maintenance Date",
			type: "date",
		},
		{
			name: "next_maintenance_date",
			label: "Next Maintenance Date",
			placeholder: "Enter Next Maintenance Date",
			type: "date",
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
				{ value: "Available", label: "Available" },
				{ value: "Busy", label: "Busy" },
				{ value: "Under Maintenance", label: "Under Maintenance" },
			],
		},
	];

	const fields = editId ? [...commonFields, ...editFields] : commonFields;


	// Define columns for the data table
    const columns = [
        { Header: "Machine ID", accessor: "machineid" },
        { Header: "Machine Name", accessor: "machine_name" },
        { Header: "Machine Type", accessor: "machine_type" },
        { Header: "Capacity", accessor: "capacity" },
        { Header: "Manufacturer", accessor: "manufacturer" },
        { Header: "Model", accessor: "model" },
        { Header: "Status", accessor: "status" }, // Add status column
        { Header: "Installation Date", accessor: "installation_date" },
        { Header: "Last Maintenance Date", accessor: "last_maintenance_date" },
        { Header: "Next Maintenance Date", accessor: "next_maintenance_date" },
        { Header: "Remarks", accessor: "remarks" },
    ];

	const caption = "Machine List";

	// Create a new machine record
	const handleCreate = async () => {
		try {
			const { success, message } = await createMachine(newMachine);
			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				onClose();
				resetForm();
				fetchMachines();
			}
		} catch (error) {
			console.error("Error creating machine:", error);
			showError("An error occurred while creating the machine.");
		}
	};

	// Function to handle editing a machine record
	const handleEdit = (data) => {
		setEditId(data.machineid);
		setNewMachine(data);
		onOpen();
	};

	// Function to handle updating the machine record
	const handleUpdate = async () => {
		try {
			const { success, message } = await updateMachine(
				editId,
				newMachine
			);

			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				onClose();
				resetForm();
				setEditId(null);
				fetchMachines();
			}
		} catch (error) {
			console.error("Error updating machine:", error);
			showError("An error occurred while updating the machine.");
		}
	};

	// Delete function
	const handleDelete = async () => {
		try {
			const { success, message } = await deleteMachine(dataToDelete);
			if (!success) {
				showError(message);
			} else {
				showSuccess(message);
				fetchMachines();
			}
		} catch (error) {
			console.error("Error deleting machine:", error);
			showError("An error occurred while deleting the machine.");
		} finally {
			setDeleteModalOpen(false);
			setDataToDelete(null);
		}
	};

	// Open the delete confirmation modal
	const openDeleteConfirmation = (data) => {
		setDataToDelete(data.machineid);
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
						Machine Page
					</Text>

					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Machine
						</Button>
					</Flex>

					<SearchBar
						fields={[
							"machineid",
							"machine_name",
							"machine_type",
							"manufacturer",
							"model",
						]}
						onSearch={handleSearch}
						placeholder="Search by machine ID, name, type, manufacturer, or model"
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
								No machines found 😢
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
				formData={newMachine}
				handleChange={handleChange}
				handleSubmit={editId ? handleUpdate : handleCreate}
				modalTitle={editId ? "Edit Machine" : "Add New Machine"}
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

export default MachinePage;
