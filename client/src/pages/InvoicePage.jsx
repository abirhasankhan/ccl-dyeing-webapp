import {
	Container,
	Text,
	VStack,
	Box,
	Flex,
	useDisclosure,
	Spinner,
	Button,
	HStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf"; // Import jsPDF
import "jspdf-autotable";

import { useInvoiceStore } from "../store"; // Import the invoice store
import {
	DataTable,
	FormModal,
	DeleteConfirmationModal,
	SearchBar,
} from "../components";
import { useToastNotification } from "../hooks/toastUtils";

function InvoicePage() {
	const { showError, showSuccess } = useToastNotification();

	const [invoice, setInvoice] = useState({});
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false); // Loading state
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [newInvoice, setNewInvoice] = useState({
		processid: "",
		amount: "",
		due_date: "",
		notes: "",
	});

	const resetForm = () => {
		setNewInvoice({
			processid: "",
			amount: "",
			due_date: "",
			notes: "",
		});
	};

	const [editInvoiceId, setEditInvoiceId] = useState(null);

	// State for handling delete confirmation modal
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [invoiceToDelete, setInvoiceToDelete] = useState(null);

	const {
		createInvoice,
		fetchInvoices,
		updateInvoice,
		deleteInvoice,
		invoices,
	} = useInvoiceStore();

	// Fetch paginated invoices when currentPage changes
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await fetchInvoices();
			setLoading(false);
		};
		loadData();
	}, [fetchInvoices]);

	// Update invoices state when the data changes
	useEffect(() => {
		if (invoices !== invoice) {
			setInvoice(invoices);
			setSearchResults(invoices);
		}
	}, [invoices, invoice]);

	// Handle search functionality
	const handleSearch = (query) => {
		const debounceTimeout = setTimeout(() => {
			if (query === "") {
				// If query is empty, show all invoices
				setSearchResults(invoice);
			} else {
				// Search logic based on multiple fields (invoiceid, processid, etc.)
				const results = invoice.filter((data) => {
					return (
						data.invoiceid.toString().includes(query) ||
						data.processid.toString().includes(query) ||
						data.amount.toString().includes(query)
					);
				});
				setSearchResults(results); // Set filtered results
			}
		}, 300); // Delay the search by 300ms
		return () => clearTimeout(debounceTimeout);
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setNewInvoice({ ...newInvoice, [name]: value });
	};

	// Define fields that will be shown for both Add and Edit
	const commonFields = [
		{
			name: "processid",
			label: "Process ID",
			placeholder: "Enter Process ID",
		},
		{
			name: "amount",
			label: "Amount",
			placeholder: "Enter Amount",
			type: "number",
		},
		{
			name: "due_date",
			label: "Due Date",
			placeholder: "Enter Due Date",
			type: "date",
		},
		{
			name: "notes",
			label: "Notes",
			placeholder: "Enter Notes",
		},
	];

	// Define additional fields for editing
	const editFields = [
		{
			name: "status",
			label: "Status",
			type: "select", // Field type select
			options: [
				{ label: "Unpaid", value: "Unpaid" },
				{ label: "Partially Paid", value: "Partially Paid" },
				{ label: "Paid", value: "Paid" },
			],
		},
	];

	// Combine fields based on the condition
	const fields = editInvoiceId
		? [...commonFields, ...editFields] // Combine common fields and the status field for edit
		: commonFields;

	const columns = [
		{ Header: "Invoice ID", accessor: "invoiceid" },
		{ Header: "Process ID", accessor: "processid" },
		{ Header: "Amount", accessor: "amount" },
		{ Header: "Paid Amount", accessor: "paid_amount" },
		{ Header: "Issued Date", accessor: "issued_date" },
		{ Header: "Due Date", accessor: "due_date" },
		{ Header: "Status", accessor: "status" },
		{ Header: "Notes", accessor: "notes" },
		{ Header: "Created At", accessor: "created_at" },
		{ Header: "Updated At", accessor: "updated_at" },
		// Add the PDF column conditionally
		{
			Header: "PDF Actions", // Custom header name
			accessor: "pdfActions", // Unique accessor
			isPDFColumn: true, // Flag to identify this as the PDF column
		},
	];

	const caption = "Invoice Details";

	// Function to generate a PDF using jsPDF
	const generatePDF = (invoice) => {
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.width;
		const marginX = 10;
		let y = 20;
		const lineHeight = 10;

		// Add company logo
		const logoUrl =
			"https://res.cloudinary.com/diy56o5uu/image/upload/v1727518197/gqi7mkawt9pucefuqvgb.png";
		doc.addImage(logoUrl, "PNG", marginX, 10, 50, 20);

		// Company Details
		doc.setFontSize(16)
			.setFont("helvetica", "bold")
			.text("Crystal Composite Ltd", 70, 20);
		doc.setFontSize(12).text(
			"629 Khejur Bagan, Ashulia, Savar, Dhaka, Bangladesh",
			70,
			30
		);
		doc.setFont("helvetica", "normal").text(
			"Email: composite@crystalgroupbd.com | Web: www.crystalbd.com",
			70,
			40
		);

		// Separator line
		doc.setDrawColor(0)
			.setLineWidth(0.5)
			.line(marginX, 50, pageWidth - marginX, 50);

		// Title
		doc.setFontSize(18)
			.setFont("helvetica", "bold")
			.text("Invoice Details", marginX, 60);

		y = 70;

		// Invoice Details

		const details = [
			["Invoice ID", String(invoice.invoiceid)],
			["Process ID", String(invoice.processid)],
			["Amount", String(invoice.amount)],
			["Due Date", String(invoice.due_date)],
			["Notes", String(invoice.notes || "N/A")],
		];


		details.forEach(([key, value]) => {
			doc.setFont("helvetica", "bold").text(`${key}:`, marginX, y);
			doc.setFont("helvetica", "normal").text(
				value || "N/A",
				marginX + 50,
				y
			);
			y += lineHeight;
		});

		// Footer
		doc.setFontSize(10).setFont("helvetica", "italic");
		doc.text(
			"Thank you for choosing Crystal Composite Ltd!",
			marginX,
			y + 20
		);
		doc.text(
			"For any inquiries, contact us at info@crystalbd.com",
			marginX,
			y + 30
		);

		return doc;
	};

	// Function to handle viewing a PDF
	const handleViewPDF = (invoice) => {
		const doc = generatePDF(invoice);
		const pdfUrl = doc.output("bloburl"); // Generate a URL for the PDF
		window.open(pdfUrl, "_blank"); // Open the PDF in a new tab
	};

	// Function to handle downloading a PDF
	const handleDownloadPDF = (invoice) => {
		const doc = generatePDF(invoice);
		doc.save(`invoice_${invoice.invoiceid}.pdf`); // Download the PDF
	};

	// Create invoice function
	const handleCreateInvoice = async () => {
		try {
			const { success, message } = await createInvoice(newInvoice);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				fetchInvoices();
				onClose();
				resetForm();
			}
		} catch (error) {
			console.error("Error creating invoice:", error);
			showError("An error occurred while creating the invoice.");
		}
	};

	// Function to handle editing an invoice
	const handleEditInvoice = (data) => {
		setEditInvoiceId(data.invoiceid); // Set the invoice ID to track which invoice we're editing
		setNewInvoice(data); // Populate the form with the existing data
		onOpen(); // Open the modal
	};

	// Function to handle updating the invoice
	const handleUpdateInvoice = async () => {
		try {
			const { success, message } = await updateInvoice(
				editInvoiceId,
				newInvoice
			);

			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				fetchInvoices();
				onClose();
				resetForm();
				setEditInvoiceId(null);
			}
		} catch (error) {
			console.error("Error updating invoice:", error);
			showError("An error occurred while updating the invoice.");
		}
	};

	// Delete function
	const handleDelete = async () => {
		try {
			const { success, message } = await deleteInvoice(invoiceToDelete);
			if (!success) {
				showError(message); // Use the utility function for errors
			} else {
				showSuccess(message); // Use the utility function for success
				fetchInvoices();
			}
		} catch (error) {
			console.error("Error deleting invoice:", error);
			showError("An error occurred while deleting the invoice.");
		} finally {
			setDeleteModalOpen(false);
			setInvoiceToDelete(null);
		}
	};

	// Open the delete confirmation modal
	const openDeleteConfirmation = (data) => {
		setInvoiceToDelete(data.invoiceid);
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
						Invoice Page
					</Text>

					<Flex justify="flex-start" w="100%" pl={4}>
						<Button colorScheme="blue" size="lg" onClick={onOpen}>
							Add Invoice
						</Button>
					</Flex>

					<SearchBar
						fields={["invoiceid", "processid", "amount"]}
						onSearch={handleSearch}
						placeholder="Search by Invoice ID, Process ID, and Amount"
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
								customActions={(row) => (
									<HStack spacing={2}>
										<Button
											colorScheme="orange"
											onClick={() => handleViewPDF(row)}
										>
											View Invoice
										</Button>
										<Button
											colorScheme="green"
											onClick={() =>
												handleDownloadPDF(row)
											}
										>
											Download Invoice
										</Button>
									</HStack>
								)}
								onEdit={handleEditInvoice}
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
								No invoices found 😢
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
					setEditInvoiceId(null);
				}}
				formData={newInvoice}
				handleChange={handleChange}
				handleSubmit={
					editInvoiceId ? handleUpdateInvoice : handleCreateInvoice
				}
				modalTitle={editInvoiceId ? "Edit Invoice" : "Add New Invoice"}
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

export default InvoicePage;
