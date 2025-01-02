import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
	Button,
	HStack,
	Box,
	Text,
} from "@chakra-ui/react";
import { useState } from "react";

const DataTable = ({
	data,
	columns,
	caption,
	onEdit,
	onDelete,
	rowsPerPage = 10,
}) => {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(data.length / rowsPerPage);
	const startIndex = (currentPage - 1) * rowsPerPage;
	const currentPageData = data.slice(startIndex, startIndex + rowsPerPage);

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	return (
		<Box>
			<TableContainer mt={10}>
				<Table variant="striped" colorScheme="teal">
					{caption && <TableCaption>{caption}</TableCaption>}
					<Thead>
						<Tr>
							{columns.map((column) => (
								<Th key={column.accessor}>{column.Header}</Th>
							))}
							<Th>Actions</Th>{" "}
							{/* Add an extra column for actions */}
						</Tr>
					</Thead>
					<Tbody>
						{currentPageData.map((row, index) => (
							<Tr key={index}>
								{columns.map((column) => (
									<Td
										key={column.accessor}
										isNumeric={column.isNumeric}
									>
										{row[column.accessor]}
									</Td>
								))}
								<Td>
									<HStack spacing={4}>
										{/* Edit Button */}
										<Button
											colorScheme="blue"
											onClick={() => onEdit(row)}
										>
											Edit
										</Button>
										{/* Delete Button */}
										<Button
											colorScheme="red"
											onClick={() => onDelete(row)}
											isDisabled={false} // Add any condition to disable delete
										>
											Delete
										</Button>
									</HStack>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>

			{/* Pagination Controls */}
			<HStack spacing={4} justify="center" mt={4}>
				<Button onClick={handlePrevPage} isDisabled={currentPage === 1}>
					Prev
				</Button>
				<Text>
					Page {currentPage} of {totalPages}
				</Text>
				<Button
					onClick={handleNextPage}
					isDisabled={currentPage === totalPages}
				>
					Next
				</Button>
			</HStack>
		</Box>
	);
};

export default DataTable;
