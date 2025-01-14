import {
	FormControl,
	FormLabel,
	Input,
	FormErrorMessage,
} from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";

const FormInput = ({ label, name, type = "text", isRequired = true }) => {
	const {
		register,
		formState: { errors },
	} = useFormContext();

	return (
		<FormControl isInvalid={errors[name]} isRequired={isRequired} mb={4}>
			<FormLabel>{label}</FormLabel>
			<Input
				{...register(name, {
					required: isRequired ? "This field is required" : false,
				})}
				type={type}
			/>
			<FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
		</FormControl>
	);
};

export default FormInput;
