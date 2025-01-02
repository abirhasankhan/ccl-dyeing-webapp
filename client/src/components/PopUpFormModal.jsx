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
	Select,
	Checkbox,
	Textarea,
	FormErrorMessage,
} from "@chakra-ui/react";

function FormModal({
	isOpen,
	onClose,
	formData,
	handleChange,
	handleSubmit,
	modalTitle = "Add Item", // Default title, can be overridden
	fields = [], // Array of field configurations
	buttonLabel = "Save", // Customize button label
	errors = {}, // Error messages for each field
}) {
	const renderField = (field) => {
		switch (field.type) {
			case "select":
				return (
					<Select
						id={field.name}
						name={field.name}
						placeholder={field.placeholder}
						value={formData[field.name]}
						onChange={handleChange}
					>
						{field.options.map((option, index) => (
							<option key={index} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
				);
			case "checkbox":
				return (
					<Checkbox
						id={field.name}
						name={field.name}
						isChecked={formData[field.name]}
						onChange={handleChange}
					>
						{field.label}
					</Checkbox>
				);
			case "textarea":
				return (
					<Textarea
						id={field.name}
						name={field.name}
						placeholder={field.placeholder}
						value={formData[field.name]}
						onChange={handleChange}
					/>
				);
			default:
				return (
					<Input
						id={field.name}
						name={field.name}
						placeholder={field.placeholder}
						type={field.type || "text"}
						value={formData[field.name]}
						onChange={handleChange}
					/>
				);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>{modalTitle}</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					{fields.map((field, index) => (
						<FormControl key={index} isInvalid={errors[field.name]}>
							<FormLabel htmlFor={field.name}>
								{field.label}
							</FormLabel>
							{renderField(field)}
							<FormErrorMessage>
								{errors[field.name]}
							</FormErrorMessage>
						</FormControl>
					))}
				</ModalBody>

				<ModalFooter>
					<Button colorScheme="blue" mr={3} onClick={handleSubmit}>
						{buttonLabel}
					</Button>
					<Button onClick={onClose}>Cancel</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export default FormModal;
