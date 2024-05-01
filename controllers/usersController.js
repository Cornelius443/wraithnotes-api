const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// get all users
// route Get /users
// @access private
const getAllUsers = asyncHandler(async (req, res)=>{
        try{
            const users = await User.find().select('-password').lean();
            if(!users?.length) return res.status(400).json({message: 'No users found'});
            res.json(users);
        }catch(e){
            res.status(500).json({'message': e.message});
        }
})

// Create new user
// route POST /users
// @access private
const createNewUser = asyncHandler(async (req, res)=>{
    const {username, password, roles} = req.body;
    if(!username || !password){
        return res.status(400).json({message: "All fields are required"});
    } 
    try{
        // check for duplicate
        const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()
        if(duplicate) return res.status(409).json({message: "Duplicate username"});
        // hash password
        const hashPwd = await bcrypt.hash(password, 10); // salt rounds
     
        const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, "password": hashPwd }
        : { username, "password": hashPwd, roles }
        
        // create and store new user
        const user = await User.create(userObject);
        if(user){
            res.status(201).json({message: `New user ${username} created`});
        }else{
            res.status(400).json({message: 'Invalid user data received'});
        }

    }catch(e){
        res.status(500).json({'message': e.message});
    }
})

// Update a user
// route PATCH /users
// @access private
const updateUser = asyncHandler(async (req, res)=>{
 const {id, username, roles, active, password} = req.body;
 //confirm data
 if(!id || !username || !Array.isArray(roles) || !roles.length 
 || typeof active !== 'boolean'){
    return res.status(400).json({message: 'All fields are required'});
 }
 try{
    let user = await User.findById(id).exec();
    if(!user) return res.status(400).json({message: 'User not found'});
    // check for duplicate
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()
    // allow updates to the original user
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: "Duplicate username"});
    }
    user.username = username;
    user.roles = roles;
    user.active = active; 
    if(password){
        // hashing the password
        user.password = await bcrypt.hash(password, 10); // salt rounds
    }
    const updatedUser = await user.save();
    res.json({message: `${updatedUser.username} updated`});
 }catch(e){
    res.status(500).json({'message': e.message});
 }
})

// Delete a user
// route DELETE /users
// @access private
const deleteUser = asyncHandler(async (req, res)=>{
    const {id} = req.body;
    if(!id) return res.status(400).json({message:'User ID Required'});
    try{
        const note = await Note.findOne({user: id}).lean().exec();
        if(note) return res.status(400).json({message: 'User has assigned note'});
        const user = await User.findById(id).exec();
        if(!user)return res.status(400).json({message: "User not found"});
        const result = await user.deleteOne();
        const reply = `Username ${user.username} with ID ${user._id} deleted`;
        res.json(reply);
    }catch(e){
        res.status(500).json({'message': e.message});
    }
})

module.exports = {getAllUsers, createNewUser, updateUser, deleteUser}; 