import { useState } from "react";

export const useSearch = (data, fields) => {
	const [searchResults, setSearchResults] = useState([]);

	const handleSearch = (query) => {
		if (!query) {
			setSearchResults(data); // If no search query, show all data
		} else {
			const lowercasedQuery = query.toLowerCase();
			const filteredResults = data.filter((item) =>
				fields.some(
					(field) =>
						item[field]?.toLowerCase().includes(lowercasedQuery) // Use optional chaining to avoid undefined errors
				)
			);
			setSearchResults(filteredResults);
		}
	};

	return { searchResults, handleSearch };
};
