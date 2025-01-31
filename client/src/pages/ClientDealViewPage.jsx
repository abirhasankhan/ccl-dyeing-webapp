import {
	Container,
	Text,
	VStack,
	Box,
	Flex,
	useDisclosure,
	Spinner,
	Button,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf"; // Import jsPDF
import "jspdf-autotable";

import { useClientDealStore } from "../store";
import { FormModal, DeleteConfirmationModal, SearchBar } from "../components";
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
		createClientDeal,
		fetchClientDeals,
		updateClientDeal,
		deleteClientDeal,
		clientDeals,
	} = useClientDealStore();

	// Fetch client deals on initial load
	useEffect(() => {
		let isMounted = true; // Flag to check if the component is still mounted
		const loadCDeal = async () => {
			setLoading(true);
			await fetchClientDeals();
			if (isMounted) setLoading(false); // Only set loading to false if component is still mounted
		};

		loadCDeal();
		return () => {
			isMounted = false;
		}; // Cleanup function to set isMounted to false when component unmounts
	}, [fetchClientDeals]);

	// Update client deals state when the data changes
	useEffect(() => {
		if (clientDeals !== cdeal) {
			setcdeal(clientDeals);
			setSearchResults(clientDeals);
		}
	}, [clientDeals, cdeal]);

	// Handle search functionality
	const handleSearch = (query) => {
		const debounceTimeout = setTimeout(() => {
			if (query === "") {
				// If query is empty, show all clients
				setSearchResults(cdeal);
			} else {
				// Search logic based on multiple fields (id, name, etc.)
				const results = cdeal.filter((data) => {
					return (
						data.deal_id.toString().includes(query) ||
						data.clientid.toString().includes(query) ||
						data.contact_no
							.toLowerCase()
							.includes(query.toLowerCase())
					);
				});
				setSearchResults(results); // Set filtered results
			}
		}, 300); // Delay the search by 300ms
		return () => clearTimeout(debounceTimeout);
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
			name: "issue_date",
			label: "Issue Date",
			placeholder: "Enter Issue Date",
			type: "date",
		},
		{
			name: "valid_through",
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
			name: "contact_no",
			label: "Contact No",
			placeholder: "Enter Contact No",
		},
		{
			name: "payment_method",
			label: "Payment Method",
			type: "select", // Field type select
			options: [
				{ label: "Cash", value: "Cash" },
				{ label: "Bank", value: "Bank" },
				{ label: "Hybrid", value: "Hybrid" },
			],
		},
		{
			name: "notes",
			label: "Notes",
			placeholder: "Enter Notes",
		},
		{
			name: "bankName",
			label: "Bank Name",
			placeholder: "Enter Bank Name",
		},
		{
			name: "branch",
			label: "Branch",
			placeholder: "Enter Branch Name",
		},
		{
			name: "sortCode",
			label: "Sort Code",
			placeholder: "Enter Sort Code",
		},
	];

	// Define additional fields for editing
	const editFields = [
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
		? [...commonFields, ...editFields]
		: commonFields;

	// Function to generate a PDF using jsPDF

const generatePDF = (deal) => {
	const doc = new jsPDF();

	// Add watermark
	doc.setFontSize(60); // Large font size for watermark
	doc.setFont("helvetica", "bold");
	doc.setTextColor(200, 200, 200); // Light gray color for watermark
	doc.setGState(new doc.GState({ opacity: 0.3 })); // Semi-transparent watermark
	doc.text("CONFIDENTIAL", 40, 150, { angle: 45 }); // Rotated watermark text

	// Reset opacity and color for the rest of the document
	doc.setGState(new doc.GState({ opacity: 1 }));
	doc.setTextColor(0, 0, 0); // Reset text color to black

	// Add company logo (assuming you have a logo image)
	const logoUrl =
		"https://res.cloudinary.com/diy56o5uu/image/upload/v1727518197/gqi7mkawt9pucefuqvgb.png"; // Replace with your logo URL
	doc.addImage(logoUrl, "PNG", 10, 10, 50, 20); // Adjust dimensions as needed

	// Add company name and address
	doc.setFontSize(16);
	doc.setFont("helvetica", "bold");
	doc.text("Your Company Name", 70, 20);
	doc.setFontSize(12);
	doc.setFont("helvetica", "normal");
	doc.text("123 Company Address, City, State, ZIP", 70, 30);
	doc.text("Phone: (123) 456-7890 | Email: info@company.com", 70, 40);

	// Add a separator line
	doc.setDrawColor(0);
	doc.setLineWidth(0.5);
	doc.line(10, 50, 200, 50);

	// Add title
	doc.setFontSize(18);
	doc.setFont("helvetica", "bold");
	doc.text("Client Deal Details", 10, 60);

	// Add deal details
	doc.setFontSize(12);
	doc.setFont("helvetica", "normal");
	let y = 70; // Vertical position for text
	const lineHeight = 10; // Space between lines

	doc.text(`Deal ID: ${deal.deal_id}`, 10, y);
	y += lineHeight;

	doc.text(`Client ID: ${deal.clientid}`, 10, y);
	y += lineHeight;

	doc.text(`Payment Method: ${deal.payment_method}`, 10, y);
	y += lineHeight;

	doc.text(`Issue Date: ${deal.issue_date}`, 10, y);
	y += lineHeight;

	doc.text(`Valid Through: ${deal.valid_through}`, 10, y);
	y += lineHeight;

	doc.text(`Representative: ${deal.representative}`, 10, y);
	y += lineHeight;

	doc.text(`Designation: ${deal.designation}`, 10, y);
	y += lineHeight;

	doc.text(`Contact No: ${deal.contact_no}`, 10, y);
	y += lineHeight;

	doc.text(`Bank Name: ${deal.bankName}`, 10, y);
	y += lineHeight;

	doc.text(`Branch: ${deal.branch}`, 10, y);
	y += lineHeight;

	doc.text(`Sort Code: ${deal.sortCode}`, 10, y);
	y += lineHeight;

	doc.text(`Notes: ${deal.notes || "N/A"}`, 10, y);
	y += lineHeight;

	doc.text(`Status: ${deal.status || "N/A"}`, 10, y);
	y += lineHeight;

	// Add a separator line before tables
	doc.setDrawColor(0);
	doc.setLineWidth(0.5);
	doc.line(10, y + 10, 200, y + 10);
	y += 20;

	// Add Dyeing Finishing Deals table
	if (deal.dyeingFinishingDeals && deal.dyeingFinishingDeals.length > 0) {
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.text("Dyeing Finishing Deals", 10, y);
		y += lineHeight;

		// Table headers
		const dyeingHeaders = [
			"Color",
			"Shade %",
			"Tube Tk",
			"Open Tk",
			"Elasteen Tk",
			"Double Dyeing Tk",
			"Notes",
		];
		const dyeingData = deal.dyeingFinishingDeals.map((df) => [
			df.color || "N/A",
			df.shade_percent || "N/A",
			df.tube_tk || "N/A",
			df.open_tk || "N/A",
			df.elasteen_tk || "N/A",
			df.double_dyeing_tk || "N/A",
			df.notes || "N/A",
		]);

		// Add table
		doc.autoTable({
			startY: y,
			head: [dyeingHeaders],
			body: dyeingData,
			theme: "grid",
			styles: { fontSize: 10 },
		});

		y = doc.autoTable.previous.finalY + 10; // Update y position after table
	}

	// Add Additional Process Deals table
	if (deal.additionalProcessDeals && deal.additionalProcessDeals.length > 0) {
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.text("Additional Process Deals", 10, y);
		y += lineHeight;

		// Table headers
		const additionalHeaders = ["Process Type", "Price Tk", "Notes"];
		const additionalData = deal.additionalProcessDeals.map((ap) => [
			ap.process_type || "N/A",
			ap.price_tk || "N/A",
			ap.notes || "N/A",
		]);

		// Add table
		doc.autoTable({
			startY: y,
			head: [additionalHeaders],
			body: additionalData,
			theme: "grid",
			styles: { fontSize: 10 },
		});

		y = doc.autoTable.previous.finalY + 10; // Update y position after table
	}

	// Add a separator line before signatures
	doc.setDrawColor(0);
	doc.setLineWidth(0.5);
	doc.line(10, y + 10, 200, y + 10);
	y += 20;

	// Add signature fields for two company representatives
	doc.setFontSize(12);
	doc.setFont("helvetica", "bold");
	doc.text("Authorized Signatures", 10, y);
	y += lineHeight;

	// First representative signature
	doc.setFontSize(10);
	doc.setFont("helvetica", "normal");
	doc.text("Representative 1:", 10, y);
	doc.line(40, y, 100, y); // Signature line
	doc.text("Name: ________________________", 10, y + 5);
	doc.text("Designation: __________________", 10, y + 10);
	y += 20;

	// Second representative signature
	doc.text("Representative 2:", 10, y);
	doc.line(40, y, 100, y); // Signature line
	doc.text("Name: ________________________", 10, y + 5);
	doc.text("Designation: __________________", 10, y + 10);
	y += 20;

	// Add a footer
	doc.setFontSize(10);
	doc.setFont("helvetica", "italic");
	doc.text("Thank you for choosing Your Company Name!", 10, 280);
	doc.text(
		"For any inquiries, please contact us at info@company.com",
		10,
		290
	);

	return doc;
};



	// Function to handle viewing a PDF
	const handleViewPDF = (deal) => {
		const doc = generatePDF(deal);
		const pdfUrl = doc.output("bloburl"); // Generate a URL for the PDF
		window.open(pdfUrl, "_blank"); // Open the PDF in a new tab
	};

	// Function to handle downloading a PDF
	const handleDownloadPDF = (deal) => {
		const doc = generatePDF(deal);
		doc.save(`client_deal_${deal.deal_id}.pdf`); // Download the PDF
	};

	// createClient function to handle creating a new client deal
	const handleCreateClient = async () => {
		try {
			const { success, message } = await createClientDeal(newCDeal);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				onClose();
				resetForm();
			}
		} catch (error) {
			console.error("Error creating client deal:", error);
			showError("An error occurred while creating client deal.");
		}
	};

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
					branch: newCDeal.branch,
					bankName: newCDeal.bankName,
					sortCode: newCDeal.sortCode,
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

					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Client Deal
						</Button>
					</Flex>

					<SearchBar
						fields={["deal_id", "clientid", "contact"]}
						onSearch={handleSearch}
						placeholder="Search by Deal ID, Client ID, and Contact"
					/>

					<Box width="100%" overflowX="auto">
						{loading ? (
							<Flex justify="center" mt={8}>
								<Spinner size="xl" />
							</Flex>
						) : (
							<Table variant="striped" colorScheme="teal">
								<Thead>
									<Tr>
										<Th>ID</Th>
										<Th>Client ID</Th>
										<Th>Issue Date</Th>
										<Th>Valid Through</Th>
										<Th>Representative</Th>
										<Th>Designation</Th>
										<Th>Contact No</Th>
										<Th>Payment Method</Th>
										<Th>Bank Name</Th>
										<Th>Branch</Th>
										<Th>Sort Code</Th>
										<Th>Status</Th>
										<Th>Notes</Th>
										<Th>Actions</Th>
									</Tr>
								</Thead>
								<Tbody>
									{searchResults.map((deal) => (
										<Tr key={deal.deal_id}>
											<Td>{deal.deal_id}</Td>
											<Td>{deal.clientid}</Td>
											<Td>{deal.issue_date}</Td>
											<Td>{deal.valid_through}</Td>
											<Td>{deal.representative}</Td>
											<Td>{deal.designation}</Td>
											<Td>{deal.contact_no}</Td>
											<Td>{deal.payment_method}</Td>
											<Td>{deal.bankName}</Td>
											<Td>{deal.branch}</Td>
											<Td>{deal.sortCode}</Td>
											<Td>{deal.status}</Td>
											<Td>{deal.notes}</Td>
											<Td>
												<Flex gap={2}>
													<Button
														colorScheme="blue"
														size="sm"
														onClick={() =>
															handleViewPDF(deal)
														}
													>
														View PDF
													</Button>
													<Button
														colorScheme="green"
														size="sm"
														onClick={() =>
															handleDownloadPDF(
																deal
															)
														}
													>
														Download PDF
													</Button>
													<Button
														colorScheme="yellow"
														size="sm"
														onClick={() =>
															handleEditCDeal(
																deal
															)
														}
													>
														Edit
													</Button>
													<Button
														colorScheme="red"
														size="sm"
														onClick={() =>
															openDeleteConfirmation(
																deal
															)
														}
													>
														Delete
													</Button>
												</Flex>
											</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						)}
					</Box>

					{!loading && searchResults.length === 0 && (
						<VStack spacing={8} mt={10}>
							<Text
								fontSize={"xl"}
								fontWeight={"bold"}
								color={"gray.500"}
								textAlign={"center"}
							>
								No client deals found 😢
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
					setEditCDdealId(null);
				}}
				formData={newCDeal}
				handleChange={handleChange}
				handleSubmit={
					editCDdealId ? handleUpdateCDeal : handleCreateClient
				}
				modalTitle={
					editCDdealId ? "Edit Client Deal" : "Add New Client Deal"
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

export default ClientDealViewPage;
