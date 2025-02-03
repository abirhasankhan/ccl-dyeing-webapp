// Sidebar.jsx
import {
	Box,
	Flex,
	Icon,
	Text,
	Collapse,
	useColorModeValue,
	useDisclosure,
} from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { sidebarItems } from "./sidebarItems";

const SidebarItem = ({ item, level = 0 }) => {
	const { isOpen, onToggle } = useDisclosure();
	const location = useLocation();
	const isActive = location.pathname === item.to;
	const hasChildren = item.subItems?.length > 0;

	const activeBg = useColorModeValue("blue.500", "blue.200");
	const activeColor = useColorModeValue("white", "gray.800");
	const hoverBg = useColorModeValue("blackAlpha.100", "whiteAlpha.100");

	return (
		<Box>
			<Flex
				as={hasChildren ? Box : NavLink}
				to={hasChildren ? "#" : item.to}
				align="center"
				cursor="pointer"
				onClick={hasChildren ? onToggle : undefined}
				pl={`${1.5 + level}rem`}
				pr={2}
				py={2}
				mx={2}
				borderRadius="md"
				bg={isActive ? activeBg : "transparent"}
				color={isActive ? activeColor : "inherit"}
				_hover={{ bg: !isActive && hoverBg }}
				transition="all 0.2s"
				minW="0" // Allow text truncation
			>
				{item.icon && (
					<Icon
						as={item.icon}
						mr={3}
						boxSize={5}
						flexShrink={0} // Prevent icon from shrinking
					/>
				)}
				<Text
					fontSize="xl"
					fontWeight={isActive ? "medium" : "normal"}
					whiteSpace="nowrap"
					overflow="hidden"
					textOverflow="ellipsis"
					flex="1"
				>
					{item.label}
				</Text>
				{hasChildren && (
					<Icon
						as={FiChevronDown}
						ml={2}
						transform={isOpen ? "rotate(180deg)" : "none"}
						transition="transform 0.2s"
						flexShrink={0}
					/>
				)}
			</Flex>

			{hasChildren && (
				<Collapse in={isOpen}>
					{item.subItems.map((child, idx) => (
						<SidebarItem key={idx} item={child} level={level + 1} />
					))}
				</Collapse>
			)}
		</Box>
	);
};

const Sidebar = ({ onClose }) => {
	const bg = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");

	return (
		<Box
			w={{ base: "full", md: "64" }}
			minW={{ md: "64" }} // Set minimum width
			h="full"
			bg={bg}
			borderRightWidth="1px"
			borderColor={borderColor}
			overflowY="auto"
			overflowX="hidden" // Prevent horizontal scroll
			pb={8}
			boxShadow="lg"
		>
			<Flex
				px={6}
				py={6}
				align="center"
				borderBottomWidth="1px"
				borderColor={borderColor}
				minW="0"
			>
				<Text
					fontSize="xl"
					fontWeight="bold"
					letterSpacing="tighter"
					whiteSpace="nowrap"
					overflow="hidden"
					textOverflow="ellipsis"
				>
					DyePro ERP v1.0
				</Text>
			</Flex>

			<Box px={2} mt={4}>
				{sidebarItems.map((item, idx) => (
					<SidebarItem key={idx} item={item} />
				))}
			</Box>
		</Box>
	);
};

export default Sidebar;
