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
		createClientDeal,
		fetchClientDeals,
		updateClientDeal,
		deleteClientDeal,
		clientDeals,

	} = useClientDealStore();

	// Fetch paginated client deals when currentPage changes
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await fetchClientDeals();
			setLoading(false);
		};
		loadData();
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

	const columns = [
		{ Header: "Deal ID", accessor: "deal_id" },
		{ Header: "Client ID", accessor: "clientid" },
		{ Header: "Issue Date", accessor: "issue_date" },
		{ Header: "Valid Through", accessor: "valid_through" },
		{ Header: "Representative", accessor: "representative" },
		{ Header: "Designation", accessor: "designation" },
		{ Header: "Contact No", accessor: "contact_no" },
		{ Header: "Payment Method", accessor: "payment_method" },
		{ Header: "Bank Name", accessor: "bankName" },
		{ Header: "Branch", accessor: "branch" },
		{ Header: "Sort Code", accessor: "sortCode" },
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

	const caption = "Client Deal Details";


	// Function to generate a PDF using jsPDF
	const generatePDF = (deal) => {
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.width;
		const pageHeight = doc.internal.pageSize.height;
		const marginX = 10;
		let y = 20;
		const lineHeight = 10;

		// Helper function to add text and calculate height
		const addTextWithHeight = (
			text,
			x,
			y,
			maxWidth,
			fontStyle = "normal"
		) => {
			doc.setFont("helvetica", fontStyle);
			const splitText = doc.splitTextToSize(text, maxWidth);
			const textHeight = splitText.length * lineHeight;
			doc.text(splitText, x, y);
			return textHeight;
		};

		// Function to check if a new page is needed
		const checkPageBreak = (heightNeeded) => {
			if (y + heightNeeded > pageHeight - 20) {
				doc.addPage(); // Add a new page
				y = 20; // Reset Y position for the new page
				addWatermark(); // Add watermark to the new page
			}
		};

		// Watermark function
		const addWatermark = () => {
			doc.setFontSize(50);
			doc.setFont("helvetica", "bold");
			doc.setTextColor(200, 200, 200);
			doc.setGState(new doc.GState({ opacity: 0.3 }));
			doc.text("Crystal Composite Ltd", pageWidth / 4, pageHeight / 2, {
				angle: 45,
			});
			doc.setTextColor(0, 0, 0);
			doc.setGState(new doc.GState({ opacity: 1 }));
		};

		// Apply watermark to the first page
		addWatermark();

		// Add company logo
		const logoUrl =
			"https://res.cloudinary.com/diy56o5uu/image/upload/v1727518197/gqi7mkawt9pucefuqvgb.png";
		doc.addImage(logoUrl, "PNG", marginX, 10, 50, 20);

		// Company Details
		doc.setFontSize(14)
			.setFont("helvetica", "bold")
			.text("Crystal Composite Ltd", 70, 20);
		y +=
			addTextWithHeight(
				"629 Khejur Bagan, Ashulia, Savar, Dhaka, Bangladesh",
				70,
				30,
				pageWidth - 80,
				"normal"
			) + 10;

		addTextWithHeight(
			"Email: composite@crystalgroupbd.com | Web: www.crystalbd.com",
			70,
			40,
			pageWidth - 80,
			"normal"
		);

		// Separator line
		doc.setDrawColor(0)
			.setLineWidth(0.5)
			.line(marginX, 50, pageWidth - marginX, 50);

		// Title
		y = 60;
		doc.setFontSize(12)
			.setFont("helvetica", "bold")
			.text("Trade Agreement", marginX, y);
		y += lineHeight + 10;

		// Trade Agreement Text
		const tradeAgreementText = `This Trade Agreement No. ${deal.deal_id}, set on ${deal.issue_date}, is between:`;
		y +=
			addTextWithHeight(
				tradeAgreementText,
				marginX,
				y,
				pageWidth - 2 * marginX,
				"bold"
			) + 5;

		// Client Details
		const clientDetails = `${
			deal.client?.[0]?.companyname || "Unknown Client"
		}, Address: ${
			deal.client?.[0]?.address || "Unknown Address"
		}\n& Crystal Composite Ltd. Address: 629 Khejur Bagan, Ashulia, Savar, Dhaka.`;
		y +=
			addTextWithHeight(
				clientDetails,
				marginX,
				y,
				pageWidth - 2 * marginX,
				"bold"
			) + 10;

		// Offer Details
		const offerDetails = `Based on Price Offer No: 1x for the Purpose of Dyeing & Finishing W/ Enzyme + Silicon Fabric.\nValid through: ${deal.valid_through}.`;
		y +=
			addTextWithHeight(
				offerDetails,
				marginX,
				y,
				pageWidth - 2 * marginX,
				"normal"
			) + 15;

		// Deal Details
		const details = [
			["Agreement No", deal.deal_id],
			["Payment Method", deal.payment_method],
			["Issue Date", deal.issue_date],
			["Valid Through", deal.valid_through],
			["Representative", deal.representative],
			["Designation", deal.designation],
			["Contact No", deal.contact_no],
			["Notes", deal.notes || "N/A"],
		];

		details.forEach(([key, value]) => {
			checkPageBreak(lineHeight); // Check if a new page is needed
			doc.setFont("helvetica", "bold").text(`${key}:`, marginX, y);
			doc.setFont("helvetica", "normal").text(value, marginX + 50, y);
			y += lineHeight;
		});

		// Separator before tables
		checkPageBreak(20); // Check if a new page is needed
		y += 10;
		doc.line(marginX, y, pageWidth - marginX, y);
		y += 20;

		// Dyeing Finishing Deals Table
		if (deal.dyeingFinishingDeals?.length) {
			checkPageBreak(50); // Check if a new page is needed
			doc.setFontSize(12)
				.setFont("helvetica", "bold")
				.text("Dyeing Finishing Deals Prices", marginX, y);
			y += lineHeight;

			doc.autoTable({
				startY: y,
				head: [
					[
						"Color",
						"Shade %",
						"Tube Tk",
						"Open Tk",
						"Elasteen Tk",
						"Double Dyeing Tk",
						"Notes",
					],
				],
				body: deal.dyeingFinishingDeals.map((df) => [
					df.color || "N/A",
					df.shade_percent || "N/A",
					df.tube_tk || "N/A",
					df.open_tk || "N/A",
					df.elasteen_tk || "N/A",
					df.double_dyeing_tk || "N/A",
					df.notes || "N/A",
				]),
				theme: "grid",
				styles: { fontSize: 10 },
				margin: { left: marginX, right: marginX },
				didDrawPage: () => {
					y = doc.autoTable.previous.finalY + 15; // Update Y position after table
				},
			});

			y = doc.autoTable.previous.finalY + 15; // Ensure proper spacing
		}

		// Additional Process Deals Table
		if (deal.additionalProcessDeals?.length) {
			checkPageBreak(50); // Check if a new page is needed
			doc.setFontSize(12)
				.setFont("helvetica", "bold")
				.text("Additional Process Deals", marginX, y);
			y += lineHeight;

			doc.autoTable({
				startY: y,
				head: [["Process Type", "Price Tk", "Notes"]],
				body: deal.additionalProcessDeals.map((ap) => [
					ap.process_type || "N/A",
					ap.price_tk || "N/A",
					ap.notes || "N/A",
				]),
				theme: "grid",
				styles: { fontSize: 10 },
				margin: { left: marginX, right: marginX },
				didDrawPage: () => {
					y = doc.autoTable.previous.finalY + 15; // Update Y position after table
				},
			});

			y = doc.autoTable.previous.finalY + 15; // Ensure proper spacing
		}

		// Special Notes
		const specialNotes = [
			"➤ One Way Transport Facility.",
			"➤ Payment Must be Cash/LC.",
			"➤ Cheque will be valid after money collection.",
			"➤ Fabrics security must be maintained for delivery.",
			"➤ No claims will be accepted after delivery.",
			"➤ Bill will be made on Grey Weight.",
		].join("\n");

		checkPageBreak(50); // Check if a new page is needed
		doc.setFontSize(10)
			.setFont("helvetica", "bold")
			.text("Special Notes:", marginX, y);
		y += lineHeight;
		y +=
			addTextWithHeight(
				specialNotes,
				marginX,
				y,
				pageWidth - 2 * marginX,
				"normal"
			) + 20;

		// Signatures
		checkPageBreak(50); // Check if a new page is needed
		doc.line(marginX, y, pageWidth - marginX, y);
		y += 15;

		const signatureText = (text, x) => {
			doc.setFontSize(12)
				.setFont("helvetica", "normal")
				.text(text, x, y)
				.line(x, y + 5, x + 70, y + 5);
		};

		// Left Signature
		signatureText("Representative 1:", marginX);
		doc.text("Name: ________________________", marginX, y + 15)
			.text("Designation: __________________", marginX, y + 25)
			.text("Crystal Composite Ltd", marginX, y + 35);

		// Right Signature
		const rightSigX = pageWidth - 100;
		signatureText("Representative 2:", rightSigX);
		doc.text("Name: ________________________", rightSigX, y + 15)
			.text("Designation: __________________", rightSigX, y + 25)
			.text(
				deal.client?.[0]?.companyname || "Unknown Client",
				rightSigX,
				y + 35
			);

		// Footer
		checkPageBreak(30); // Check if a new page is needed
		doc.setFontSize(8)
			.setFont("helvetica", "italic")
			.text("Thank you for choosing Crystal Composite Ltd!", marginX, 280)
			.text(
				"For any inquiries, contact us at info@crystalbd.com",
				marginX,
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

	// Function to generate a PDF for dyeingFinishingDeals and additionalProcessDeals
	const generateDealsPDF = (deal) => {
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
			.text("Deals Prices Details", marginX, 60);

		y = 70;

		// Dynamic deal details
		const details = [
			["Agreement No", deal.deal_id],
			["Issue Date", deal.issue_date],
			["Valid Through", deal.valid_through],
		];

		// Client Details Formatting with Wrapping
		const clientText = `Client: ${
			deal.client?.[0]?.companyname || "Unknown Client"
		}\nAddress: ${deal.client?.[0]?.address || "Unknown Address"}`;

		const wrappedClientText = doc.splitTextToSize(
			clientText,
			pageWidth - 2 * marginX
		);
		doc.setFont("helvetica", "semibold").text(
			wrappedClientText,
			marginX,
			y
		);

		y += wrappedClientText.length * lineHeight; // Adjust Y based on wrapped text height
		y += 5; // Extra padding

		// Deal details section
		details.forEach(([key, value]) => {
			doc.setFont("helvetica", "bold").text(`${key}:`, marginX, y);
			doc.setFont("helvetica", "normal").text(
				value || "N/A",
				marginX + 50,
				y
			);
			y += lineHeight;
		});

		// Separator before tables
		doc.line(marginX, y + 5, pageWidth - marginX, y + 5);
		y += 15;

		// Dyeing Finishing Deals Table
		if (deal.dyeingFinishingDeals?.length) {
			doc.setFontSize(14)
				.setFont("helvetica", "bold")
				.text("Dyeing Finishing Deals Prices", marginX, y);
			y += lineHeight;

			doc.autoTable({
				startY: y,
				head: [
					[
						"Color",
						"Shade %",
						"Tube Tk",
						"Open Tk",
						"Elasteen Tk",
						"Double Dyeing Tk",
						"Notes",
					],
				],
				body: deal.dyeingFinishingDeals.map((df) => [
					df.color || "N/A",
					df.shade_percent || "N/A",
					df.tube_tk || "N/A",
					df.open_tk || "N/A",
					df.elasteen_tk || "N/A",
					df.double_dyeing_tk || "N/A",
					df.notes || "N/A",
				]),
				theme: "grid",
				styles: { fontSize: 10 },
				margin: { left: marginX, right: marginX },
			});

			y = doc.autoTable.previous.finalY + 15; // Ensuring space before the next section
		}

		// Additional Process Deals Table
		if (deal.additionalProcessDeals?.length) {
			doc.setFontSize(14)
				.setFont("helvetica", "bold")
				.text("Additional Process Deals", marginX, y);
			y += lineHeight;

			doc.autoTable({
				startY: y,
				head: [["Process Type", "Price Tk", "Notes"]],
				body: deal.additionalProcessDeals.map((ap) => [
					ap.process_type || "N/A",
					ap.price_tk || "N/A",
					ap.notes || "N/A",
				]),
				theme: "grid",
				styles: { fontSize: 10 },
				margin: { left: marginX, right: marginX },
			});

			y = doc.autoTable.previous.finalY + 15; // Adding proper spacing
		}

		// Footer
		doc.setFontSize(10).setFont("helvetica", "italic");
		doc.text(
			"Thank you for choosing Crystal Composite Ltd!",
			marginX,
			y + 10
		);
		doc.text(
			"For any inquiries, contact us at info@crystalbd.com",
			marginX,
			y + 20
		);

		return doc;
	};

	// Function to handle viewing a PDF for deals tables
	const handleViewDealsPDF = (deal) => {
		const doc = generateDealsPDF(deal);
		const pdfUrl = doc.output("bloburl"); // Generate a URL for the PDF
		window.open(pdfUrl, "_blank"); // Open the PDF in a new tab
	};

	// Function to handle downloading a PDF for deals tables
	const handleDownloadDealsPDF = (deal) => {
		const doc = generateDealsPDF(deal);
		doc.save(`deals_details_${deal.deal_id}.pdf`); // Download the PDF
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
											View Client Deal
										</Button>
										<Button
											colorScheme="green"
											onClick={() =>
												handleDownloadPDF(row)
											}
										>
											Download Client Deal
										</Button>
										<Button
											colorScheme="yellow"
											onClick={() =>
												handleViewDealsPDF(row)
											}
										>
											View Client Deal Prices
										</Button>
										<Button
											colorScheme="pink"
											onClick={() =>
												handleDownloadDealsPDF(row)
											}
										>
											Download Client Deal Prices
										</Button>
									</HStack>
								)}
								onEdit={handleEditCDeal}
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
								No client deals found 😢
							</Text>
						</VStack>
					)}
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
