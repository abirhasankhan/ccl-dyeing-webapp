import {
	Container,
	Text,
	VStack,
	Button,
	useToast,
	Box,
	Flex,
	useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useClientStore } from "../store/client";
import DataTable from "../components/DataTable"; // Reusable Table Component
import FormModal from "../components/PopUpFormModal"; // Import the reusable modal

function ClientPage() {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [newClient, setNewClient] = useState({
		companyname: "",
		address: "",
		contact: "",
		email: "",
		remarks: "",
	});

	const toast = useToast();

	const { createClient, fetchClient, client } = useClientStore();

	useEffect(() => {
		fetchClient();
	}, [fetchClient]);

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
				setNewClient({
					companyname: "",
					address: "",
					contact: "",
					email: "",
					remarks: "",
				});
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

	const handleChange = (e) => {
		setNewClient({ ...newClient, [e.target.name]: e.target.value });
	};

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

	// Edit function
	const handleEdit = (row) => {
		console.log("Editing row:", row);
		// Implement your edit logic here (e.g., open a modal to edit)
	};

	// Delete function
	const handleDelete = (row) => {
		console.log("Deleting row:", row);
		// Implement your delete logic here (e.g., remove the row from the data array)
	};

	const clientFields = [
		{
			name: "companyname",
			label: "Company Name",
			placeholder: "Enter Company Name",
		},
		{ 
			name: "address", 
			label: "Address", 
			placeholder: "Enter Address" 
		},
		{ 
			name: "contact", 
			label: "Contact", 
			placeholder: "Enter Contact" 
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
			placeholder: "Enter Remarks" 
		},
	];

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
							onEdit={handleEdit}
							onDelete={handleDelete}
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

			{/* Add Client Modal */}
			<FormModal
				isOpen={isOpen}
				onClose={onClose}
				formData={newClient}
				handleChange={handleChange}
				handleSubmit={handleCreateClient}
				modalTitle="Add New Client"
				fields={clientFields} // Pass the field configuration
			/>
		</Box>
	);
}

export default ClientPage;
