const { getDB, connectDB } = require('../config/database');
const { ObjectId } = require('mongodb');

// Helper function to ensure DB is connected
const ensureDB = async () => {
    try {
        return getDB();
    } catch (error) {
        // Jodi database connect na thake, connect koro
        return await connectDB();
    }
};

// Get all persons
const getPersons = async (req, res, next) => {
    try {
        const db = await ensureDB();
        const persons = await db.collection('persons')
            .find()
            .sort({ createdAt: -1 })
            .toArray();

        res.json({
            success: true,
            count: persons.length,
            data: persons
        });
    } catch (error) {
        next(error);
    }
};

// Get single person
const getPerson = async (req, res, next) => {
    try {
        const db = await ensureDB();

        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid person ID'
            });
        }

        const person = await db.collection('persons')
            .findOne({ _id: new ObjectId(req.params.id) });

        if (!person) {
            return res.status(404).json({
                success: false,
                message: 'Person not found'
            });
        }

        res.json({
            success: true,
            data: person
        });
    } catch (error) {
        next(error);
    }
};

// Create new person
const createPerson = async (req, res, next) => {
    try {
        const db = await ensureDB();
        const { name, email, age, address } = req.body;

        if (!name || !email || !age || !address) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if email already exists
        const existingPerson = await db.collection('persons')
            .findOne({ email: email.toLowerCase() });

        if (existingPerson) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const newPerson = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            age: parseInt(age),
            address: address.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('persons').insertOne(newPerson);

        res.status(201).json({
            success: true,
            message: 'Person created successfully',
            data: { _id: result.insertedId, ...newPerson }
        });
    } catch (error) {
        next(error);
    }
};

// Update person
const updatePerson = async (req, res, next) => {
    try {
        const db = await ensureDB();
        const { name, email, age, address } = req.body;

        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid person ID'
            });
        }

        const existingPerson = await db.collection('persons')
            .findOne({ _id: new ObjectId(req.params.id) });

        if (!existingPerson) {
            return res.status(404).json({
                success: false,
                message: 'Person not found'
            });
        }

        // Check if email is taken by another person
        if (email && email !== existingPerson.email) {
            const emailExists = await db.collection('persons')
                .findOne({
                    email: email.toLowerCase(),
                    _id: { $ne: new ObjectId(req.params.id) }
                });

            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already taken by another person'
                });
            }
        }

        const updateData = {
            name: name || existingPerson.name,
            email: email ? email.toLowerCase() : existingPerson.email,
            age: age ? parseInt(age) : existingPerson.age,
            address: address || existingPerson.address,
            updatedAt: new Date()
        };

        const result = await db.collection('persons')
            .updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: updateData }
            );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'No changes made'
            });
        }

        const updatedPerson = await db.collection('persons')
            .findOne({ _id: new ObjectId(req.params.id) });

        res.json({
            success: true,
            message: 'Person updated successfully',
            data: updatedPerson
        });
    } catch (error) {
        next(error);
    }
};

// Delete person
const deletePerson = async (req, res, next) => {
    try {
        const db = await ensureDB();

        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid person ID'
            });
        }

        const result = await db.collection('persons')
            .deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Person not found'
            });
        }

        res.json({
            success: true,
            message: 'Person deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPersons,
    getPerson,
    createPerson,
    updatePerson,
    deletePerson
};