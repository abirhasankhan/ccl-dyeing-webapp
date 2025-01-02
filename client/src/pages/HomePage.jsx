import { Container, Text, VStack } from '@chakra-ui/react'

function HomePage() {

    return (
		<Container maxW={"container.xl"} py={12}>
			<VStack spacing={8}>
				<Text
					fontSize={"30"}
					fontWeight={"bold"}
					bgGradient={"linear(to-r, cyan.400, blue.400)"}
					bgClip={"text"}
					textAlign={"center"}
				>
					Crystal Composite Ltd
				</Text>
			</VStack>
		</Container>
	);
}

export default HomePage