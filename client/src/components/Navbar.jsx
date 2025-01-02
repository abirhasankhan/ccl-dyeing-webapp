import React, { useState } from "react";
import {
	Button,
	Text,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Box,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { colorMode, toggleColorMode } = useColorMode();

	return (
		<nav
			className={`flex flex-col md:flex-row justify-between items-center p-4 ${
				colorMode === "light" ? "bg-gray-800" : "bg-gray-900"
			} text-white`}
		>
			<div className="container mx-auto flex justify-between items-center">
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
					<Link to="/">Crystal Group 🛒</Link>
				</Text>

				{/* Right-side Buttons */}
				<Box className="hidden md:flex items-center space-x-4">
					{/* Theme Toggle Button */}
					<Button
						onClick={toggleColorMode}
						className="hover:bg-gray-600"
						aria-label="Toggle theme"
					>
						{colorMode === "light" ? <IoMoon /> : <LuSun />}
					</Button>

					{/* Profile Menu */}
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
									colorMode === "light" ? "black" : "white"
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
									colorMode === "light" ? "black" : "white"
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
				</Box>

				{/* Mobile Menu Button */}
				<Button
					className="md:hidden"
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					aria-label="Toggle navigation"
				>
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						{isMenuOpen ? (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						) : (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4 6h16M4 12h16m-7 6h7"
							/>
						)}
					</svg>
				</Button>
			</div>

			{/* Mobile Links */}
			{isMenuOpen && (
				<Box className="md:hidden flex flex-col bg-gray-700 px-4 py-2 space-y-2">
					{/* Theme Toggle Button */}
					<Button
						onClick={toggleColorMode}
						className="hover:bg-gray-600 w-full my-2"
						aria-label="Toggle theme"
					>
						{colorMode === "light" ? <IoMoon /> : <LuSun />}
					</Button>

					{/* Profile Menu */}
					<Menu>
						<MenuButton
							as={Button}
							rightIcon={<ChevronDownIcon />}
							className="w-full text-xl font-semibold mt-2"
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
									colorMode === "light" ? "black" : "white"
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
									colorMode === "light" ? "black" : "white"
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
				</Box>
			)}
		</nav>
	);
};

export default Navbar;
