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
				thickness="4px"
				speed="0.65s"
				emptyColor="gray.200"
				color="blue.500"
				size="xl"
			/>
			<Text fontSize="lg" color="gray.500">
				Loading...
			</Text>
		</Box>
	);
};

export default LoadingSpinner;
