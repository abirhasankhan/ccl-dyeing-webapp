import { useState } from "react";
import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Input,
	Checkbox,
	useToast,
	Stack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import { useEffect } from "react";

const LoginPage = () => {
	const [emailOrUsername, setEmailOrUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();
	const { login, loading } = useAuthStore();

	const { isAuthenticated } = useAuthStore();

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated, navigate]);


	const handleLogin = async () => {
		const result = await login({
			email: emailOrUsername,
			password,
		});

		if (result.success) {
			toast({
				title: "Login Successful",
				description: result.message,
				status: "success",
				duration: 5000,
				isClosable: true,
			});
			navigate("/");
		} else {
			toast({
				title: "Login Failed",
				description: result.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		}
	};

	return (
		<Box
			maxW="md"
			mx="auto"
			mt={10}
			p={5}
			borderWidth="1px"
			borderRadius="lg"
		>
			<Stack spacing={4}>
				<FormControl>
					<FormLabel>Email or Username</FormLabel>
					<Input
						type="text"
						value={emailOrUsername}
						onChange={(e) => setEmailOrUsername(e.target.value)}
						autoFocus
					/>
				</FormControl>

				<FormControl>
					<FormLabel>Password</FormLabel>
					<Input
						type={showPassword ? "text" : "password"}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<Checkbox
						mt={2}
						isChecked={showPassword}
						onChange={() => setShowPassword(!showPassword)}
					>
						Show Password
					</Checkbox>
				</FormControl>

				<Button
					colorScheme="teal"
					onClick={handleLogin}
					isLoading={loading}
					loadingText="Logging in..."
					width="full"
				>
					Sign In
				</Button>
			</Stack>
		</Box>
	);
};

export default LoginPage;
