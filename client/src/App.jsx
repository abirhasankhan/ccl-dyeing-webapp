import { Box } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";

import { HomePage, ClientPage } from "./pages";
import { Navbar, Sidebar } from "./components";

function App() {
	return (
		<>
			<Box minH="100vh" display="flex">
				
				<Sidebar height="full" />{" "}
				{/* Ensure Sidebar takes full height */}
				
				<Box flex="1" display="flex" flexDirection="column">
					<Navbar />

					<Box p="6" flex="1" overflowY="auto">
						<Routes>
							<Route 
								path="/" 
								element={<HomePage />} 
							/>
							<Route 
								path="/client" 
								element={<ClientPage />} 
							/>

							{/* <Route
								path="/services/web"
								element={<ServicesPage />}
							/>
							<Route
								path="/services/app"
								element={<ServicesPage />}
							/>
							<Route
								path="/contact/email"
								element={<ContactPage />}
							/>
							<Route
								path="/contact/phone"
								element={<ContactPage />}
							/> */}
						</Routes>
					</Box>
				</Box>
			</Box>
		</>
	);
}

export default App;
