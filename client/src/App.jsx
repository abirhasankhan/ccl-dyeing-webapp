import { Box } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";

import {
	HomePage,
	ClientPage,
	DyeingPricePage,
	AdditionalPricePage,
	ClientDealPageForm,
	DyeingFinishingDealsForm,
	AdditionalPriceDealForm,
	ClientDealViewPage,
	DyeingDealViewPage,
	AdditionalDealViewPage,
} from "./pages";
import { Navbar, Sidebar } from "./components";

import MultiStepForm from "./MultiStepForm";


function App() {
	return (
		<>
			<Box minH="100vh" display="flex">
				{/* Sidebar fixed on the left */}
				<Box
					position="fixed"
					top="0"
					left="0"
					height="100vh"
					width={{ base: "100%", md: "250px" }} // Sidebar width for different screens
					bg="gray.800"
					zIndex="1"
				>
					<Sidebar />
				</Box>

				{/* Main content area */}
				<Box flex="1" display="flex" flexDirection="column">
					{/* Navbar fixed at the top */}
					<Box
						position="fixed"
						top="0"
						left="0"
						width="full"
						bg="white"
						zIndex="2" // Navbar stays above the sidebar
						boxShadow="md"
						ml={{ base: 0, md: "240px" }} // Offset Navbar on medium and larger screens
					>
						<Navbar />
					</Box>

					{/* Content */}
					<Box
						p="6"
						pt="20" // To make space for the fixed navbar
						flex="1"
						overflowY="auto"
						ml={{ base: 0, md: "200px" }} // Make space for sidebar on large screens
					>
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

							{/* Main Multistep Form, updated path */}
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

							{/* Other routes */}

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
						</Routes>
					</Box>
				</Box>
			</Box>
		</>
	);
}

export default App;
