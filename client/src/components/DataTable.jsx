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
import { useState, useMemo } from "react";

const DataTable = ({
	data = [],
	columns = [],
	caption,
	onEdit,
	onDelete,
	rowsPerPage = 10,
}) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [sortConfig, setSortConfig] = useState({
		key: null,
		direction: "ascending",
	});

	// Sorting logic
	const sortedData = useMemo(() => {
		let sortableData = [...data];
		if (sortConfig.key) {
			sortableData.sort((a, b) => {
				if (a[sortConfig.key] < b[sortConfig.key]) {
					return sortConfig.direction === "ascending" ? -1 : 1;
				}
				if (a[sortConfig.key] > b[sortConfig.key]) {
					return sortConfig.direction === "ascending" ? 1 : -1;
				}
				return 0;
			});
		}
		return sortableData;
	}, [data, sortConfig]);

	const requestSort = (key) => {
		let direction = "ascending";
		if (sortConfig.key === key && sortConfig.direction === "ascending") {
			direction = "descending";
		}
		setSortConfig({ key, direction });
	};

	// Pagination logic
	const totalPages = Math.ceil(sortedData.length / rowsPerPage);
	const startIndex = (currentPage - 1) * rowsPerPage;
	const currentPageData = sortedData.slice(
		startIndex,
		startIndex + rowsPerPage
	);

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

	if (!data || data.length === 0) {
		return <Text>No data available</Text>;
	}

	return (
		<Box overflowX="auto" mt={10}>
			<TableContainer>
				<Table variant="striped" colorScheme="teal">
					{caption && <TableCaption>{caption}</TableCaption>}
					<Thead>
						<Tr>
							{columns.map((column) => (
								<Th
									key={column.accessor}
									isNumeric={column.isNumeric}
									onClick={() => requestSort(column.accessor)}
									style={{ cursor: "pointer" }} // Make it look clickable
								>
									{column.Header}
									{sortConfig.key === column.accessor && (
										<span>
											{sortConfig.direction ===
											"ascending"
												? "↑"
												: "↓"}
										</span>
									)}
								</Th>
							))}
							<Th>Actions</Th>
						</Tr>
					</Thead>
					<Tbody>
						{currentPageData.map((row) => (
							<Tr key={row.id || Math.random().toString(36)}>
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
										<Button
											colorScheme="blue"
											onClick={() => onEdit(row)}
										>
											Edit
										</Button>
										<Button
											colorScheme="red"
											onClick={() => onDelete(row)}
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
