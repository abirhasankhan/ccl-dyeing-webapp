import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	Button,
	FormControl,
	FormLabel,
	Input,
	HStack,
} from "@chakra-ui/react";

function FormModal({
	isOpen,
	onClose,
	formData,
	handleChange,
	handleSubmit,
	modalTitle = "Add Item", // Default title, can be overridden
	fields = [], // Array of field configurations
}) {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>{modalTitle}</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					{fields.map((field, index) => (
						<FormControl key={index}>
							<FormLabel htmlFor={field.name}>
								{field.label}
							</FormLabel>
							<Input
								id={field.name}
								name={field.name}
								placeholder={field.placeholder}
								type={field.type || "text"}
								value={formData[field.name]}
								onChange={handleChange}
							/>
						</FormControl>
					))}
				</ModalBody>

				<ModalFooter>
					<Button colorScheme="blue" mr={3} onClick={handleSubmit}>
						Save
					</Button>
					<Button onClick={onClose}>Cancel</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export default FormModal;
