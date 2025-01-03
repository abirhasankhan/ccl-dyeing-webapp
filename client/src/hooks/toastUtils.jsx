import { useToast } from "@chakra-ui/react";

export const useToastNotification = () => {
    
    const toast = useToast();

    const showToast = (status, title, description) => {
        toast({
            title,
            description,
            status,
            duration: 3000,
            isClosable: true,
        });
    };

    const showError = (message) => {
        showToast("error", "Error", message);
    };

    const showSuccess = (message) => {
        showToast("success", "Success", message);
    };

    return {
        showError,
        showSuccess,
    };
};
