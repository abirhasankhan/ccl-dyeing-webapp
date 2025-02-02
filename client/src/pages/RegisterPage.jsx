import { useState } from "react";
import {
	Button,
	Input,
	FormControl,
	FormLabel,
	VStack,
	Box,
	useToast,
	InputGroup,
	InputRightElement,
} from "@chakra-ui/react";
import { HiEye, HiEyeOff } from "react-icons/hi"; // Corrected import for the icons
import { useUserStore } from "../store";
import { useNavigate } from "react-router-dom";


const RegisterPage = () => {
    
	const { createUser, login, setLoading, setError } = useUserStore();
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle confirm password visibility
	const toast = useToast();

    const navigate = useNavigate();



const handleSubmit = async (e) => {
	e.preventDefault();

	// Client-side validation
	const requiredFields = ["name", "email", "password"];
	const missingFields = requiredFields.filter(
		(field) => !e.target.elements[field]?.value
	);

	if (missingFields.length > 0) {
		toast({
			title: "Missing Fields",
			description: `Please fill in: ${missingFields.join(", ")}`,
			status: "error",
			duration: 5000,
			isClosable: true,
		});
		return;
	}

	if (password !== confirmPassword) {
		toast({
			title: "Password Mismatch",
			description: "Your passwords do not match.",
			status: "error",
			duration: 5000,
			isClosable: true,
		});
		return;
	}

	const userData = {
		name,
        username,
		email,
		password,
	};

	try {
		setLoading(true);

		// Create user through store action
		const result = await createUser(userData);

		if (!result.success) {
			throw new Error(result.message);
		}

		// Automatically log in after successful registration
		const loginResult = await login({ email, password });

		if (loginResult.success) {
			toast({
				title: "Registration Successful",
				description: "You have been registered and logged in!",
				status: "success",
				duration: 5000,
				isClosable: true,
			});
            // Redirect to dashboard or home page
            navigate("/");

		}
	} catch (error) {
		setError(error.message);
		toast({
			title: "Registration Failed",
			description: error.message,
			status: "error",
			duration: 5000,
			isClosable: true,
		});
	} finally {
		setLoading(false);
	}
};

	return (
		<VStack spacing={4} align="center" justify="center" height="100vh">
			<Box
				width="400px"
				p={6}
				boxShadow="md"
				borderRadius="md"
				borderWidth="1px"
			>
				<form onSubmit={handleSubmit}>
					<FormControl id="name" isRequired>
						<FormLabel>Name</FormLabel>
						<Input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</FormControl>
					<FormControl id="username" isRequired mt={4}>
						<FormLabel>Username</FormLabel>
						<Input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</FormControl>
					<FormControl id="email" isRequired mt={4}>
						<FormLabel>Email</FormLabel>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</FormControl>
					<FormControl id="password" isRequired mt={4}>
						<FormLabel>Password</FormLabel>
						<InputGroup>
							<Input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								pr="4.5rem"
							/>
							<InputRightElement width="4.5rem">
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										setShowPassword(!showPassword)
									}
								>
									{showPassword ? <HiEyeOff /> : <HiEye />}
								</Button>
							</InputRightElement>
						</InputGroup>
					</FormControl>
					<FormControl id="confirmPassword" isRequired mt={4}>
						<FormLabel>Confirm Password</FormLabel>
						<InputGroup>
							<Input
								type={showConfirmPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								pr="4.5rem"
							/>
							<InputRightElement width="4.5rem">
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										setShowConfirmPassword(
											!showConfirmPassword
										)
									}
								>
									{showConfirmPassword ? (
										<HiEyeOff />
									) : (
										<HiEye />
									)}
								</Button>
							</InputRightElement>
						</InputGroup>
					</FormControl>
					<Button
						type="submit"
						colorScheme="teal"
						width="full"
						mt={4}
					>
						Register
					</Button>
				</form>
			</Box>
		</VStack>
	);
};

export default RegisterPage;
