import { User, hashPassword, comparePassword } from '../models/user.model.js';
import { db } from '../config/drizzleSetup.js'; // Assuming you've set up `db`

// Example: Creating a new user
export const createUser = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Insert user into the database
        await db.insert(User).values({
            username,
            password: hashedPassword,
            role,
            status: 'inactive', // Default value
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error); // Log the actual error
        res.status(500).json({ error: 'Error creating user', details: error.message });
    }
};


// Example: Validating a user
export const validateUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db
            .select()
            .from(User)
            .where(User.username.eq(username))
            .first();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        res.status(200).json({ message: 'User validated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Error validating user' });
    }
};
