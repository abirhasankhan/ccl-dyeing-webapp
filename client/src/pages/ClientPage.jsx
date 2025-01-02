import {
	Container,
	Text,
	VStack,
	Button,
	useToast,
	Box,
	Flex,
	useDisclosure,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useClientStore } from "../store/client";

import { DataTable, FormModal } from "../components";

function ClientPage() {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [newClient, setNewClient] = useState({
		companyname: "",
		address: "",
		contact: "",
		email: "",
		remarks: "",
		status: "", // Include status for editing
	});

	// To track whether we're editing or adding a client
	const [editClientId, setEditClientId] = useState(null);

	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [clientToDelete, setClientToDelete] = useState(null);

	const toast = useToast();

	const { createClient, fetchClient, updateClient, deleteClient, client } =
		useClientStore();

	useEffect(() => {
		fetchClient();
	}, [fetchClient]);

	// createClient function to handle creating a new client
	const handleCreateClient = async () => {
		try {
			const { success, message } = await createClient(newClient);

			if (!success) {
				toast({
					title: "Error",
					description: message,
					status: "error",
					duration: 4000,
					isClosable: true,
				});
			} else {
				toast({
					title: "Success",
					description: message,
					status: "success",
					duration: 3000,
					isClosable: true,
				});
				onClose(); // Close the modal after successful creation
				resetForm(); // Reset form after closing
			}
		} catch (error) {
			console.error("Error creating client:", error);
			toast({
				title: "Error",
				description: "An error occurred while creating the client.",
				status: "error",
				duration: 4000,
				isClosable: true,
			});
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
				toast({
					title: "Error",
					description: message,
					status: "error",
					duration: 4000,
					isClosable: true,
				});
			} else {
				toast({
					title: "Success",
					description: message,
					status: "success",
					duration: 3000,
					isClosable: true,
				});
				onClose(); // Close the modal after successful update
				resetForm(); // Reset form after closing
				setEditClientId(null); // Reset the edit client ID
			}
		} catch (error) {
			console.error("Error updating client:", error);
			toast({
				title: "Error",
				description: "An error occurred while updating the client.",
				status: "error",
				duration: 4000,
				isClosable: true,
			});
		}
	};

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

	// Delete function
	const handleDelete = async () => {
		try {
			// Call the deleteClient function from the store, passing the client id to delete
			const { success, message } = await deleteClient(clientToDelete);

			if (!success) {
				toast({
					title: "Error",
					description: message,
					status: "error",
					duration: 4000,
					isClosable: true,
				});
			} else {
				toast({
					title: "Success",
					description: message,
					status: "success",
					duration: 3000,
					isClosable: true,
				});
				// Optionally, fetch the updated client list
				fetchClient(); // Ensure the client list is refreshed after deletion
			}
		} catch (error) {
			console.error("Error deleting client:", error);
			toast({
				title: "Error",
				description: "An error occurred while deleting the client.",
				status: "error",
				duration: 4000,
				isClosable: true,
			});
		} finally {
			setDeleteModalOpen(false); // Close the confirmation modal after delete attempt
			setClientToDelete(null); // Reset client ID after deletion
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
			<Container maxW={"container.xl"} py={12} px={0}>
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

					{/* Display DataTable with client data */}
					{client.length > 0 ? (
						<DataTable
							data={client}
							columns={columns}
							caption={caption}
							onEdit={handleEditClient} // Pass the handleEditClient function
							onDelete={openDeleteConfirmation} // Pass the openDeleteConfirmation function
						/>
					) : (
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
				} // Decide which function to call based on whether we're editing or adding
				modalTitle={editClientId ? "Edit Client" : "Add New Client"}
				fields={fields} // Pass the dynamic field configuration
			/>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Confirm Deletion</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						Are you sure you want to delete this client? This action
						cannot be undone.
					</ModalBody>
					<ModalFooter>
						<Button colorScheme="red" onClick={handleDelete} mr={3}>
							Delete
						</Button>
						<Button onClick={() => setDeleteModalOpen(false)}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	);
}

export default ClientPage;
