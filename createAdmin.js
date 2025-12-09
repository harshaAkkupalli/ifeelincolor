const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Admin model
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }
});

const Admin = mongoose.model('Admin', adminSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ifeelincolor', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected...');
    createAdmin();
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function createAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@ifeelincolor.com' });
        
        if (existingAdmin) {
            console.log('❌ Admin already exists!');
            console.log('Email: admin@ifeelincolor.com');
            console.log('\nIf you forgot the password, delete this admin from database and run again.');
            process.exit(0);
        }

        // Create new admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        const admin = new Admin({
            name: 'Super Admin',
            email: 'admin@ifeelincolor.com',
            password: hashedPassword,
            role: 'superadmin'
        });

        await admin.save();

        console.log('✅ Admin created successfully!');
        console.log('\n==========================================');
        console.log('LOGIN CREDENTIALS:');
        console.log('==========================================');
        console.log('Email:    admin@ifeelincolor.com');
        console.log('Password: Admin@123');
        console.log('==========================================');
        console.log('\n⚠️  IMPORTANT: Change this password after first login!');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}


