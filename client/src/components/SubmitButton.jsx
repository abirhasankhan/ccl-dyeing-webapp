import { Button } from "@chakra-ui/react";

const SubmitButton = ({ label, isDisabled }) => {
	return (
		<Button colorScheme="blue" type="submit" isDisabled={isDisabled} mt={4}>
			{label}
		</Button>
	);
};

export default SubmitButton;
