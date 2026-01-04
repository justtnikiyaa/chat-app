import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

//Signup new user



export const signup = async (req, res) => {
    const {fullname, email, password, bio} = req.body;

    try {
       console.log('Signup request body:', req.body);
       if(!fullname || !email || !password || !bio){
         return res.json({success: false, message: "Missing details"});
       }
    
        const user = await User.findOne({email});
        if(user){
            return res.json({success: false, message: "Account already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            fullname,
            email,
            password: hashedPassword,
            bio
        });

        const token = generateToken(newUser._id);
        res.json({success: true, userData: newUser, token, message: "Account created successfully"});
     } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Controller for user login
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email})

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if(!isPasswordCorrect){
            return res.json({success: false, message: "Invalid credentials"});
        }

        const token = generateToken(userData._id);

        res.json({success: true, userData, token, message: "Login successful"});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        // accept both `fullname` (server) and `fullName` (client)
        const { profilePic, bio, fullname, fullName } = req.body;
        const nameToSet = fullname || fullName;
        const userId = req.user._id;

        console.log('updateProfile request body:', {
            profilePic: !!profilePic,
            bio,
            fullname,
            fullName
        });

        let updateFields = {};
        if (bio !== undefined) updateFields.bio = bio;
        if (nameToSet !== undefined) updateFields.fullname = nameToSet;

        let updateUser;

        if (profilePic) {
            console.log('Uploading profilePic to Cloudinary (preview):', profilePic?.slice(0, 80));
            const upload = await cloudinary.uploader.upload(profilePic);
            console.log('Cloudinary upload result:', upload && upload.secure_url);
            updateFields.profilePic = upload.secure_url;
        }

        updateUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        console.log('Updated user:', updateUser);
        res.json({ success: true, userData: updateUser });
    } catch (error) {
        console.log('updateProfile error:', error.message);
        res.json({ success: false, message: error.message });
    }
}