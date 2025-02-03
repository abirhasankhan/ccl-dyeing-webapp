// sidebar-items.js
import {
    FiHome,
    FiInfo,
    FiUsers,
    FiBriefcase,
    FiDollarSign,
    FiTruck,
    FiBox,
    FiSettings,
    FiFileText,
    FiCreditCard,
    FiArchive,
    FiChevronRight,
} from "react-icons/fi";

export const sidebarItems = [
    { label: "Home", to: "/", icon: FiHome },
    { label: "Clients", to: "/client", icon: FiUsers },
    {
        label: "Services",
        to: "#",
        icon: FiBriefcase,
        subItems: [
            {
                label: "Dyeing Prices",
                to: "/services/dyeing-prices",
                icon: FiDollarSign,
            },
            {
                label: "Additional Prices",
                to: "/services/additional-prices",
                icon: FiDollarSign,
            },
        ],
    },
    {
        label: "Client Deals",
        to: "#",
        icon: FiFileText,
        subItems: [
            { label: "Create Deal", to: "/client-deal/create", icon: FiChevronRight },
            {
                label: "View Deals",
                to: "#",
                icon: FiChevronRight,
                subItems: [
                    { label: "All Deals", to: "/client-deal/view/client-deal-view", icon: FiChevronRight },
                    { label: "Dyeing Prices Deals", to: "/client-deal/view/dyeing-deal-view", icon: FiChevronRight },
                    {
                        label: "Additional Prices Deals",
                        to: "/client-deal/view/additional-deal-view",
                        icon: FiChevronRight,
                    },
                ],
            },
        ],
    },
    { label: "Deal Orders", to: "/deal-order", icon: FiArchive },
    { label: "Shipments", to: "/shipment", icon: FiTruck },
    { label: "Product Detail", to: "/product-detail", icon: FiBox },
    { label: "Production", to: "/dyeing-process", icon: FiSettings },
    { label: "Stores", to: "/store", icon: FiArchive },
    { label: "Invoices", to: "/invoice", icon: FiFileText },
    { label: "Payments", to: "/paympaymentents", icon: FiCreditCard },
    { label: "Machines", to: "/machinery", icon: FiSettings },
];