import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
	FaHome,
	FaInfoCircle,
	FaPhone,
	FaCode,
	FaBriefcase,
} from "react-icons/fa"; // Adding icons
import { useColorMode } from "@chakra-ui/react"; // Import Chakra UI's useColorMode hook

// Example data for sidebar items
const sidebarItems = [
	{ label: "Home", to: "/", icon: <FaHome /> },
	{ label: "Client", to: "/client", icon: <FaInfoCircle /> },
	{
		label: "Services",
		to: "#",
		icon: <FaBriefcase />,
		subItems: [
			{
				label: "Dyeing Prices",
				to: "/services/dyeing-prices",
				icon: <FaCode />,
			},
			{
				label: "Additional Prices",
				to: "/services/additional-prices",
				icon: <FaCode />,
			},
		],
	},
	{
		label: "Client Deal",
		to: "#",
		icon: <FaPhone />,
		subItems: [
			{ label: "Create", to: "/client-deal/create", icon: <FaPhone /> },
			{
				label: "View",
				to: "#",
				icon: <FaPhone />,
				subItems: [
					{
						label: "Client Deals",
						to: "/client-deal/view/client-deal-view",
						icon: <FaCode />,
					},
					{
						label: "Dyeing Prices Deals",
						to: "/client-deal/view/dyeing-deal-view",
						icon: <FaCode />,
					},
					{
						label: "Additional Prices Deals",
						to: "/client-deal/view/additional-deal-view",
						icon: <FaCode />,
					},
				],
			},
		],
	},
	{
		label: "Deal Orders",
		to: "/deal-order",
		icon: <FaInfoCircle />,
	},
	{
		label: "Shipments",
		to: "/shipments",
		icon: <FaInfoCircle />,
	},
	{
		label: "Product Detail",
		to: "/product-detail",
		icon: <FaInfoCircle />,
	},
	{
		label: "Dyeing Process",
		to: "/dyeing-process",
		icon: <FaInfoCircle />,
	},
	{
		label: "Stores",
		to: "/stores",
		icon: <FaInfoCircle />,
	},
	{
		label: "Bills",
		to: "/bills",
		icon: <FaInfoCircle />,
	},
	{
		label: "Machines",
		to: "/machines",
		icon: <FaInfoCircle />,
	},
];


const Sidebar = () => {
	const [open, setOpen] = useState({}); // Track open/close state for each submenu
	const { colorMode } = useColorMode(); // Get current color mode

	// Toggle submenu visibility
	const toggleSubmenu = (index) => {
		setOpen((prevState) => ({
			...prevState,
			[index]: !prevState[index], // Toggle submenu visibility
		}));
	};

	// Recursive render function for multilevel submenus
	const renderMenuItem = (item, index) => (
		<li key={index}>
			{!item.subItems ? (
				<NavLink
					to={item.to}
					className={({ isActive }) =>
						`flex items-center space-x-4 p-3 rounded-lg transition-all ${
							isActive
								? "bg-yellow-400 text-gray-800 font-bold"
								: "hover:bg-gray-700 hover:text-yellow-400"
						}`
					}
				>
					{item.icon && <span className="text-lg">{item.icon}</span>}
					<span className="text-lg font-medium">{item.label}</span>
				</NavLink>
			) : (
				<>
					<div
						className="flex justify-between items-center cursor-pointer text-lg font-medium p-3 rounded-lg hover:bg-gray-700"
						onClick={() => toggleSubmenu(index)}
					>
						<span>
							{item.icon && (
								<span className="text-lg">{item.icon}</span>
							)}{" "}
							{item.label}
						</span>
						<span>{open[index] ? "▲" : "▼"}</span>
					</div>
					{open[index] && (
						<ul className="pl-6 space-y-2 mt-2">
							{item.subItems.map((subItem, subIndex) =>
								renderMenuItem(subItem, `${index}-${subIndex}`)
							)}
						</ul>
					)}
				</>
			)}
		</li>
	);

	return (
		<div
			className={`w-60 h-screen ${
				colorMode === "light" ? "bg-gray-800" : "bg-gray-900"
			} text-white flex flex-col p-6 shadow-md overflow-y-auto`}
		>
			<h2 className="text-2xl font-bold mb-8 text-center text-yellow-400">
				Dyeing v1.0
			</h2>
			<ul className="space-y-6">
				{sidebarItems.map((item, index) => renderMenuItem(item, index))}
			</ul>
		</div>
	);
};

export default Sidebar;
