import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	Button,
} from "@chakra-ui/react";

function DeleteConfirmationModal({ isOpen, onClose, onConfirm }) {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Confirm Deletion</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					Are you sure you want to  <h className="font-bold text-red-500">delete</h> this ? This
					action cannot be undone.
				</ModalBody>
				<ModalFooter>
					<Button colorScheme="red" onClick={onConfirm} mr={3}>
						Delete
					</Button>
					<Button onClick={onClose}>Cancel</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export default DeleteConfirmationModal;
