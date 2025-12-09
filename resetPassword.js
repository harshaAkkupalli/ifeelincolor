const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config();

const adminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const Admin = mongoose.model('Admin', adminSchema);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ifeelincolor', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected...');
    resetPassword();
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function resetPassword() {
    rl.question('Enter admin email: ', async (email) => {
        rl.question('Enter new password: ', async (newPassword) => {
            try {
                const admin = await Admin.findOne({ email });

                if (!admin) {
                    console.log('❌ Admin not found with email:', email);
                    process.exit(1);
                }

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(newPassword, salt);

                admin.password = hashedPassword;
                await admin.save();

                console.log('\n✅ Password reset successfully!');
                console.log('==========================================');
                console.log('Email:', email);
                console.log('New Password:', newPassword);
                console.log('==========================================');

                process.exit(0);
            } catch (error) {
                console.error('Error resetting password:', error);
                process.exit(1);
            }
        });
    });
}


