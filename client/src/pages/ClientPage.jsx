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

import { useClientStore } from "../store";

import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";

import { useToastNotification } from "../hooks/toastUtils";

function ClientPage() {
	const { showError, showSuccess } = useToastNotification();

	const [clients, setClients] = useState([]);
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false); // Loading state

	const { isOpen, onOpen, onClose } = useDisclosure();

	const [newClient, setNewClient] = useState({
		companyname: "",
		address: "",
		contact: "",
		email: "",
		remarks: "",
		status: "", // Include status for editing
	});

	// Reset form data
	const resetForm = () => {
		setNewClient({
			companyname: "",
			address: "",
			contact: "",
			email: "",
			remarks: "",
			status: "", // Reset status as well
		});
	};

	// To track whether we're editing or adding a client
	const [editClientId, setEditClientId] = useState(null);

	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [clientToDelete, setClientToDelete] = useState(null);

	const { createClient, fetchClient, updateClient, deleteClient, client } =
		useClientStore();

	// Fetch client data on initial load
	useEffect(() => {
		const loadClients = async () => {
			setLoading(true);
			await fetchClient();
			setLoading(false);
		};
		loadClients();
	}, [fetchClient]);

	// Update clients when the data changes
	useEffect(() => {
		setClients(client);
		setSearchResults(client); // Set search results to all clients initially
	}, [client]);

	// Handle search functionality
	const handleSearch = (query) => {
		if (query === "") {
			// If query is empty, show all clients
			setSearchResults(clients);
		} else {
			// Search logic based on multiple fields (id, name, etc.)
			const results = clients.filter((client) => {
				return (
					client.clientid.toString().includes(query) ||
					client.companyname
						.toLowerCase()
						.includes(query.toLowerCase()) ||
					client.contact.toLowerCase().includes(query.toLowerCase())
				);
			});
			setSearchResults(results); // Set filtered results
		}
	};

	const handleChange = (e) => {
		setNewClient({ ...newClient, [e.target.name]: e.target.value });
	};

	// Define fields that will be shown for both Add and Edit
	const commonFields = [
		{
			name: "companyname",
			label: "Company Name",
			placeholder: "Enter Company Name",
		},
		{
			name: "address",
			label: "Address",
			placeholder: "Enter Address",
		},
		{
			name: "contact",
			label: "Contact",
			placeholder: "Enter Contact",
		},
		{
			name: "email",
			label: "Email",
			placeholder: "Enter Email",
			type: "email",
		},
		{
			name: "remarks",
			label: "Remarks",
			placeholder: "Enter Remarks",
		},
	];

	// Define additional fields for editing
	const editFields = [
		{
			name: "status",
			label: "Status",
			type: "select", // Field type select
			options: [
				{ label: "Active", value: "active" },
				{ label: "Inactive", value: "inactive" },
				{ label: "Blocked", value: "block" },
			],
		},
	];

	const fields = editClientId
		? [...commonFields, ...editFields] // Combine common fields and the status field for edit
		: commonFields;

	const columns = [
		{ Header: "ID", accessor: "clientid" },
		{ Header: "Company Name", accessor: "companyname" },
		{ Header: "Address", accessor: "address" },
		{ Header: "Contact", accessor: "contact" },
		{ Header: "Email", accessor: "email" },
		{ Header: "Remarks", accessor: "remarks" },
		{ Header: "Status", accessor: "status" },
	];

	const caption = "Client Information List"; // Optional Caption for the table

	// createClient function to handle creating a new client
	const handleCreateClient = async () => {
		try {
			const { success, message } = await createClient(newClient);
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

	// Function to handle editing a client
	const handleEditClient = (clientData) => {
		setEditClientId(clientData.clientid); // Set the client ID to track which client we're editing
		setNewClient(clientData); // Populate the form with the existing data
		onOpen(); // Open the modal
	};

	// Function to handle updating the client
	const handleUpdateClient = async () => {
		try {
			const { success, message } = await updateClient(
				editClientId,
				newClient
			);

			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
				setEditClientId(null);
			}
		} catch (error) {
			console.error("Error updating client:", error);
			showError("An error occurred while updating the client.");
		}
	};

	// Delete function
	const handleDelete = async () => {
		try {
			const { success, message } = await deleteClient(clientToDelete);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				fetchClient();
			}
		} catch (error) {
			console.error("Error deleting client:", error);
			showError("An error occurred while deleting the client.");
		} finally {
			setDeleteModalOpen(false);
			setClientToDelete(null);
		}
	};

	// Open the delete confirmation modal
	const openDeleteConfirmation = (clientid) => {
		setClientToDelete(clientid);
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
						Client Page
					</Text>

					{/* Align button to the left */}
					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Client
						</Button>
					</Flex>

					{/* Search Bar Component */}
					<SearchBar
						fields={["clientid", "companyname", "contact"]} // Search by ID, Name, and Contact
						onSearch={handleSearch}
						placeholder="Search by ID, Name, or Contact"
					/>

					{/* Loading Spinner */}
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
							onEdit={handleEditClient} // Pass the handleEditClient function
							onDelete={openDeleteConfirmation} // Pass the openDeleteConfirmation function
						/>
					)}

					{/* Display message when no clients found */}
					{!loading && searchResults.length === 0 && (
						<VStack spacing={8} mt={10}>
							<Text
								fontSize={"xl"}
								fontWeight={"bold"}
								color={"gray.500"}
								textAlign={"center"}
							>
								No clients found 😢
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
					setEditClientId(null); // Reset the edit client ID
				}}
				formData={newClient}
				handleChange={handleChange}
				handleSubmit={
					editClientId ? handleUpdateClient : handleCreateClient
				}
				modalTitle={editClientId ? "Edit Client" : "Add New Client"}
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

export default ClientPage;
