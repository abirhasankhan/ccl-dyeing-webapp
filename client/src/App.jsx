import {
	Box,
	useDisclosure,
	useBreakpointValue,
	useColorModeValue,
} from "@chakra-ui/react";

import { Routes, Route } from "react-router-dom";

import { Suspense, lazy } from "react";

import { Navbar, Sidebar, LoadingSpinner } from "./components";



// Lazy load pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const ClientPage = lazy(() => import("./pages/ClientPage"));
const DyeingPricePage = lazy(() => import("./pages/DyeingPricePage"));
const AdditionalPricePage = lazy(() => import("./pages/AdditionalPricePage"));
const ClientDealPageForm = lazy(() => import("./pages/ClientDealPageForm"));
const DyeingFinishingDealsForm = lazy(() => import("./pages/DyeingFinishingDealsForm"));
const AdditionalPriceDealForm = lazy(() => import("./pages/AdditionalPriceDealForm"));
const ClientDealViewPage = lazy(() => import("./pages/ClientDealViewPage"));
const DyeingDealViewPage = lazy(() => import("./pages/DyeingDealViewPage"));
const AdditionalDealViewPage = lazy(() => import("./pages/AdditionalDealViewPage"));
const DealOrderPage = lazy(() => import("./pages/DealOrderPage"));
const ShipmentPage = lazy(() => import("./pages/ShipmentPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const MachinePage = lazy(() => import("./pages/MachinePage"));
const DyeingProcessPage = lazy(() => import("./pages/DyeingProcessPage"));
const StorePage = lazy(() => import("./pages/StorePage"));
const InvoicePage = lazy(() => import("./pages/InvoicePage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const MultiStepForm = lazy(() => import("./MultiStepForm"));

function App() {

	const { isOpen, onToggle } = useDisclosure();
	const isMobile = useBreakpointValue({ base: true, md: false });
	const bgColor = useColorModeValue("gray.50", "gray.900");
	const sidebarBg = useColorModeValue("white", "gray.800");
	const navbarBg = useColorModeValue("white", "gray.800");
	

	return (
		<Box minH="100vh" bg={bgColor}>
			{/* Sidebar */}
			<Box
				w={{ base: "full", md: "64" }}
				position={{ base: "fixed", md: "fixed" }}
				left={{ base: isOpen ? "0" : "-100%", md: "0" }}
				top="0"
				h="100vh"
				zIndex="sticky"
				bg={sidebarBg}
				borderRightWidth="1px"
				borderColor={useColorModeValue("gray.200", "gray.700")}
				transition="all 0.3s"
				boxShadow={{ base: "xl", md: "none" }}
			>
				<Sidebar onClose={onToggle} />
			</Box>

			{/* Main Content Area */}
			<Box ml={{ md: "64" }} transition="margin 0.3s" minH="100vh">
				{/* Sticky Navbar */}
				<Box
					position="sticky"
					top="0"
					zIndex="sticky"
					bg={navbarBg}
					boxShadow="sm"
				>
					<Navbar onMenuToggle={onToggle} />
				</Box>

				{/* Content Area */}
				<Box p={{ base: 4, md: 8 }} pt={{ base: "20", md: "24" }}>
					<Suspense fallback={<LoadingSpinner />}>
						<Routes>
							<Route path="/" element={<HomePage />} />

							<Route path="/client" element={<ClientPage />} />

							<Route
								path="/services/dyeing-prices"
								element={<DyeingPricePage />}
							/>

							<Route
								path="/services/additional-prices"
								element={<AdditionalPricePage />}
							/>

							<Route
								path="/client-deal/create"
								element={<MultiStepForm />}
							/>

							<Route
								path="/client-deal"
								element={<ClientDealPageForm />}
							/>

							<Route
								path="/dyeing-finishing-deal"
								element={<DyeingFinishingDealsForm />}
							/>

							<Route
								path="/additional-price-deal"
								element={<AdditionalPriceDealForm />}
							/>

							<Route
								path="/client-deal/view/client-deal-view"
								element={<ClientDealViewPage />}
							/>
							<Route
								path="/client-deal/view/dyeing-deal-view"
								element={<DyeingDealViewPage />}
							/>

							<Route
								path="/client-deal/view/additional-deal-view"
								element={<AdditionalDealViewPage />}
							/>

							<Route
								path="/deal-order"
								element={<DealOrderPage />}
							/>

							<Route
								path="/shipment"
								element={<ShipmentPage />}
							/>

							<Route
								path="/product-detail"
								element={<ProductDetailPage />}
							/>

							<Route
								path="/dyeing-process"
								element={<DyeingProcessPage />}
							/>

							<Route path="/invoice" element={<InvoicePage />} />

							<Route path="/payment" element={<PaymentPage />} />

							<Route path="/store" element={<StorePage />} />

							<Route
								path="/machinery"
								element={<MachinePage />}
							/>
						</Routes>
					</Suspense>
				</Box>
			</Box>
		</Box>
	);
}

export default App;