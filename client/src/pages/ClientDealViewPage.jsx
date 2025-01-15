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

import { useClientDealStore } from "../store";

import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";

import { useToastNotification } from "../hooks/toastUtils";

function ClientDealViewPage() {
	const { showError, showSuccess } = useToastNotification();

	const [cdeal, setcdeal] = useState({});

	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false); // Loading state

	const { isOpen, onOpen, onClose } = useDisclosure();

	const [newCDeal, setNewCDeal] = useState({
		clientid: "",
		paymentMethod: "",
		issueDate: "",
		validThrough: "",
		representative: "",
		designation: "",
		contactNo: "",
		bankInfo: "",
		notes: "",
		status: "", // Include status for editing
	});

	const resetForm = () => {
		setNewCDeal({
			clientid: "",
			paymentMethod: "",
			issueDate: "",
			validThrough: "",
			representative: "",
			designation: "",
			contactNo: "",
			bankInfo: "",
			notes: "",
			status: "", // Include status for editing
		});
	};

	const [editCDdealId, setEditCDdealId] = useState(null);
	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

	const [cDealToDelete, setCDealToDelete] = useState(null);

	const {
		fetchClientDeals,
		updateClientDeal,
		deleteClientDeal,
		clientDeals,
	} = useClientDealStore();

	// Fetch client deals on initial load

	useEffect(() => {
		const loadCDeal = async () => {
			setLoading(true);
			await fetchClientDeals();
			setLoading(false);
		};

		loadCDeal();
	}, [fetchClientDeals]);

	// Update client deals state when the data changes
	useEffect(() => {
		setcdeal(clientDeals);
		setSearchResults(clientDeals); // Set search results to all clients initially
	}, [clientDeals]);

	// Handle search functionality
	const handleSearch = (query) => {
		if (query === "") {
			// If query is empty, show all clients
			setSearchResults(cdeal);
		} else {
			// Search logic based on multiple fields (id, name, etc.)
			const results = cdeal.filter((data) => {
				return (
					data.deal_id.toString().includes(query) ||
					data.clientid.toString().includes(query) ||
					data.contactNo.toLowerCase().includes(query.toLowerCase())
				);
			});
			setSearchResults(results); // Set filtered results
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		setNewCDeal({ ...newCDeal, [name]: value });
	};

	// Define fields that will be shown for both Add and Edit
	const commonFields = [
		{
			name: "clientid",
			label: "Client ID",
			placeholder: "Enter Client ID",
		},

		{
			name: "issueDate",
			label: "Issue Date",
			placeholder: "Enter Issue Date",
			type: "date",
		},
		{
			name: "validThrough",
			label: "Valid Through",
			placeholder: "Enter Valid Through",
			type: "date",
		},
		{
			name: "representative",
			label: "Representative",
			placeholder: "Enter Representative",
		},
		{
			name: "designation",
			label: "Designation",
			placeholder: "Enter Designation",
		},
		{
			name: "contactNo",
			label: "Contact No",
			placeholder: "Enter Contact No",
		},
		{
			name: "notes",
			label: "Notes",
			placeholder: "Enter Notes",
		},
		// Other fields
		{
			name: "bankInfo.bankName",
			label: "Bank Name",
			placeholder: "Enter Bank Name",
		},
		{
			name: "bankInfo.branch",
			label: "Branch",
			placeholder: "Enter Branch Name",
		},
		{
			name: "bankInfo.sortCode",
			label: "Sort Code",
			placeholder: "Enter Sort Code",
		},
	];

	// Define additional fields for editing
	const editFields = [
		{
			name: "paymentMethod",
			label: "Payment Method",
			type: "select", // Field type select
			options: [
				{ label: "Cash", value: "Cash" },
				{ label: "Bank", value: "Bank" },
				{ label: "Hybrid", value: "Hybrid" },
			],
		},
		{
			name: "status",
			label: "Status",
			type: "select", // Field type select
			options: [
				{ label: "Pending", value: "Pending" },
				{ label: "In Progress", value: "In Progress" },
				{ label: "Approved", value: "Approved" },
				{ label: "Rejected", value: "Rejected" },
				{ label: "Completed", value: "Completed" },
				{ label: "Cancelled", value: "Cancelled" },
				{ label: "On Hold", value: "On Hold" },
				{ label: "Expired", value: "Expired" },
			],
		},

	];



	// Combine fields based on the condition
	const fields = editCDdealId
		? [
				...commonFields,
				...editFields		
        ]
		: commonFields;

const columns = [
	{ Header: "ID", accessor: "deal_id" },
	{ Header: "Client ID", accessor: "clientid" },
	{ Header: "Issue Date", accessor: "issueDate" },
	{ Header: "Valid Through", accessor: "validThrough" },
	{ Header: "Representative", accessor: "representative" },
	{ Header: "Designation", accessor: "designation" },
	{ Header: "Contact No", accessor: "contactNo" },
	{ Header: "Payment Method", accessor: "paymentMethod" },
	{ Header: "Status", accessor: "status" },
	{ Header: "Notes", accessor: "notes" },
	{
		Header: "Bank Name",
		accessor: "bankInfo.bankName",
	},
	{
		Header: "Branch",
		accessor: "bankInfo.branch",
	},
	{
		Header: "Sort Code",
		accessor: "bankInfo.sortCode",
	},
];
    

	const caption = "Client Deal Information List"; // Optional Caption for the table

	// Function to handle editing a client deal
	const handleEditCDeal = (data) => {
		setEditCDdealId(data.deal_id); // Set the client ID to track which client we're editing
		setNewCDeal(data); // Populate the form with the existing data
		onOpen(); // Open the modal
	};

	// Function to handle updating the client
const handleUpdateCDeal = async () => {
	try {
		// Merge bank_info into newCDeal
    const updatedDealData = {
        ...newCDeal,
        bankInfo: {
            branch: newCDeal.bankInfo.branch,
            bankName: newCDeal.bankInfo.bankName,
            sortCode: newCDeal.bankInfo.sortCode,
        },
    };


		// Update the client deal with the merged data
		const { success, message } = await updateClientDeal(
			editCDdealId,
			updatedDealData
		);

		if (!success) {
			showError(message); // Use the utility function for errors
		} else {
			showSuccess(message); // Use the utility function for success
			onClose();
			resetForm();
			setEditCDdealId(null);
		}
	} catch (error) {
		console.error("Error updating client deal:", error);
		showError("An error occurred while updating the client deal.");
	}
};


	// Delete function
	const handleDelete = async () => {
		try {
			const { success, message } = await deleteClientDeal(cDealToDelete);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				fetchClientDeals();
			}
		} catch (error) {
			console.error("Error deleting client deals:", error);
			showError("An error occurred while deleting the client deals.");
		} finally {
			setDeleteModalOpen(false);
			setCDealToDelete(null);
		}
	};

	// Open the delete confirmation modal
	const openDeleteConfirmation = (data) => {
		setCDealToDelete(data.deal_id);
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
						Client Deals Page
					</Text>

					{/* Search Bar Component */}
					<SearchBar
						fields={["deal_id", "clientid", "contact"]} // Search by Deal ID, Client ID, and Contact
						onSearch={handleSearch}
						placeholder="Search by Deal ID, Client ID, and Contact"
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
								onEdit={handleEditCDeal} // Pass the handleEditClient function
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
								No clients deals found 😢
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
					setEditCDdealId(null); // Reset the edit client ID
				}}
				formData={newCDeal}
				handleChange={handleChange}
				handleSubmit={editCDdealId && handleUpdateCDeal}
				modalTitle={editCDdealId && "Edit Client"}
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

export default ClientDealViewPage;
