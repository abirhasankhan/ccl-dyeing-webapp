import {
	Flex,
	IconButton,
	useColorMode,
	useColorModeValue,
	Box,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	MenuDivider,
	Avatar,
	Text,
	HStack,
	useBreakpointValue,
} from "@chakra-ui/react";
import { FiMenu, FiSun, FiMoon, FiChevronDown } from "react-icons/fi";
import { Link } from "react-router-dom";

const Navbar = ({ onMenuToggle }) => {
	const { colorMode, toggleColorMode } = useColorMode();
	const isMobile = useBreakpointValue({ base: true, md: false });
	const bg = useColorModeValue("white", "gray.800");
	const color = useColorModeValue("gray.800", "white");
	const borderColor = useColorModeValue("gray.200", "gray.700");

	return (
		<Flex
			as="nav"
			align="center"
			justify="space-between"
			px={{ base: 4, md: 8 }}
			py={4}
			bg={bg}
			color={color}
			borderBottomWidth="1px"
			borderColor={borderColor}
			position="sticky"
			top="0"
			zIndex="sticky"
			boxShadow="sm"
		>
			<HStack spacing={4}>
				{isMobile && (
					<IconButton
						icon={<FiMenu />}
						variant="ghost"
						onClick={onMenuToggle}
						aria-label="Open menu"
						size="lg"
					/>
				)}

				<Text
					as={Link}
					to="/"
					fontSize="2xl"
					fontWeight="bold"
					letterSpacing="tighter"
					_hover={{ textDecoration: "none" }}
				>
					🏭 DyePro ERP
				</Text>
			</HStack>

			<HStack spacing={{ base: 2, md: 4 }}>
				<IconButton
					icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
					onClick={toggleColorMode}
					variant="ghost"
					aria-label="Toggle theme"
					size="lg"
				/>

				<Menu>
					<MenuButton>
						<HStack spacing={3}>
							<Avatar
								size="md"
								name="Admin User"
								src="https://avatars.githubusercontent.com/u/65373372?v=4"
							/>
							{!isMobile && (
								<>
									<Box textAlign="left">
										<Text fontWeight="semibold">
											Admin User
										</Text>
										<Text fontSize="sm" color="gray.500">
											System Administrator
										</Text>
									</Box>
									<FiChevronDown />
								</>
							)}
						</HStack>
					</MenuButton>
					<MenuList>
						<MenuItem as={Link} to="/profile">
							My Profile
						</MenuItem>
						<MenuItem as={Link} to="/settings">
							Account Settings
						</MenuItem>
						<MenuDivider />
						<MenuItem color="red.500">Logout</MenuItem>
					</MenuList>
				</Menu>
			</HStack>
		</Flex>
	);
};

export default Navbar;
