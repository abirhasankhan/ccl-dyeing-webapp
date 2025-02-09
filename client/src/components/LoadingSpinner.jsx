// components/LoadingSpinner.jsx
import { Box, Spinner, Text } from "@chakra-ui/react";

const LoadingSpinner = () => {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="center"
			minHeight="200px"
			flexDirection="column"
			gap={4}
		>
			<Spinner
				thickness="4px" // Border thickness
				speed="0.65s" // Animation speed
				emptyColor="gray.200" // Background color
				color="blue.500" // Active color
				size="xl" // Size (xs, sm, md, lg, xl)
			/>
			<Text fontSize="lg" color="gray.500">
				Loading...
			</Text>
		</Box>
	);
};

export default LoadingSpinner;
