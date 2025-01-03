import  { useState } from "react";
import { Input, Box } from "@chakra-ui/react";

const SearchBar = ({ fields, onSearch, placeholder }) => {
	const [query, setQuery] = useState("");

	const handleChange = (e) => {
		setQuery(e.target.value);
		onSearch(e.target.value);
	};

	return (
		<Box w="100%" mt={4}>
			<Input
				type="text"
				value={query}
				onChange={handleChange}
				placeholder={placeholder || "Search..."}
				size="lg"
				variant="outline"
				focusBorderColor="cyan.400"
			/>
		</Box>
	);
};

export default SearchBar;
