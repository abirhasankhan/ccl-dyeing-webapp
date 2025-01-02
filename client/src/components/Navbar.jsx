import {
	Button,
	Container,
	Flex,
	HStack,
	Text,
	Box,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { ChevronDownIcon } from "@chakra-ui/icons"; // Make sure to install this package
import { useColorMode } from "@chakra-ui/react";

const Navbar = () => {
	const { colorMode, toggleColorMode } = useColorMode();

	return (
		<div
			className={`flex justify-between items-center p-4 ${
				colorMode === "light" ? "bg-gray-800" : "bg-gray-900"
			} text-white`}
		>
			<Container maxW="container.xl" px={4}>
				<Flex
					h={16}
					alignItems={"center"}
					justifyContent={"space-between"}
					flexDir={{
						base: "column",
						md: "row",
					}}
				>
					{/* Logo and Title */}
					<Text
						fontSize={{
							base: "22",
							sm: "28",
						}}
						fontWeight={"bold"}
						textTransform={"uppercase"}
						textAlign={"center"}
						bgGradient={"linear(to-r, cyan.400, blue.500)"}
						bgClip={"text"}
					>
						<Link to={"/"}>Crystal Group 🛒</Link>
					</Text>

					{/* Navbar links and buttons */}
					<HStack spacing={4} alignItems={"center"}>
						{/* Color Mode Toggle button */}
						<Button onClick={toggleColorMode}>
							{colorMode === "light" ? <IoMoon /> : <LuSun />}
						</Button>

						{/* Profile Link with Dropdown Menu */}
						<Menu>
							<MenuButton
								as={Button}
								rightIcon={<ChevronDownIcon />}
								className="text-xl font-semibold transition-all"
							>
								Profile
							</MenuButton>
							<MenuList>
								<MenuItem
									as={Link}
									to="/profile"
									bg={
										colorMode === "light"
											? "gray.100"
											: "gray.700"
									}
									color={
										colorMode === "light"
											? "black"
											: "white"
									}
									_hover={{
										bg:
											colorMode === "light"
												? "gray.200"
												: "gray.600",
									}}
								>
									View Profile
								</MenuItem>
								<MenuItem
									onClick={() => alert("Logged out")}
									bg={
										colorMode === "light"
											? "gray.100"
											: "gray.700"
									}
									color={
										colorMode === "light"
											? "black"
											: "white"
									}
									_hover={{
										bg:
											colorMode === "light"
												? "gray.200"
												: "gray.600",
									}}
								>
									Logout
								</MenuItem>
							</MenuList>
						</Menu>
					</HStack>
				</Flex>
			</Container>
		</div>
	);
};

export default Navbar;
