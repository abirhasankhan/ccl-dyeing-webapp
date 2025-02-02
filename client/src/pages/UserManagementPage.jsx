// pages/UserManagementPage.jsx
import React, { useEffect } from 'react';
import { Box, Heading, Table, Thead, Tr, Th, Tbody, Td, Button } from '@chakra-ui/react';
import { useUserStore } from '../store';
export const UserManagementPage = () => {
	const { users, filteredUsers, fetchUsers, deleteUser } = useUserStore();

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	return (
		<Box>
			<Heading mb={4}>User Management</Heading>
			<Table>
				<Thead>
					<Tr>
						<Th>Name</Th>
						<Th>Email</Th>
						<Th>Role</Th>
						<Th>Actions</Th>
					</Tr>
				</Thead>
				<Tbody>
					{filteredUsers.map((user) => (
						<Tr key={user.id}>
							<Td>{user.name}</Td>
							<Td>{user.email}</Td>
							<Td>{user.role}</Td>
							<Td>
								<Button onClick={() => deleteUser(user.id)}>
									Delete
								</Button>
							</Td>
						</Tr>
					))}
				</Tbody>
			</Table>
		</Box>
	);
};
