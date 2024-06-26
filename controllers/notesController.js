const Note = require('../models/Note');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');


const getAllNotes = asyncHandler(async(req, res)=>{
    try{
        const notes = await Note.find().lean();
        if(!notes?.length) return res.status(400).json({message: 'No notes found'});
        // Add username to each note before sending the response 
        const notesWithUser = await Promise.all(notes.map(async (note) => {
            const user = await User.findById(note.user).lean().exec();
            return { ...note, username: user.username };
        }))
        res.json(notesWithUser)
        }catch(e){
        res.status(500).json({'message': e.message});
        }
})
 
const createNewNote = asyncHandler(async(req, res)=>{
    const {user, title, text} = req.body; 
    if(!user || !title || !text){
        return res.status(400).json({message: "All fields are required"});
    }
    try{
        const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()
        if(duplicate) return res.status(409).json({message: "Duplicate note title"});
        const note = await Note.create({user, title, text});
        if (note) { // Created 
            return res.status(201).json({ message: 'New note created' })
        } else {
            return res.status(400).json({ message: 'Invalid note data received' })
        }
    }catch(e){
        res.status(500).json({'message': e.message});
    }
})

const updateNote = asyncHandler(async(req, res)=>{
    const {id, user, title, text, completed} = req.body;
    if(!id || !user || !title || !text || typeof completed !== 'boolean'){
        return res.status(400).json({message: 'All fields are required'});
    }
    try{
        const note = await Note.findById(id).exec();
        if(!note) return res.status(400).json({message: 'Note not found'});
        const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()
        if(duplicate && duplicate?._id.toString() !== id){
            return res.status(409).json({message: "Duplicate note title"});
        }
        note.user = user;
        note.title = title;
        note.text = text;
        note.completed = completed;
        const updatedNote = await note.save();
        res.json(`'${updatedNote.title}' updated`);

    }catch(e){
        res.status(500).json({'message': e.message});
    }
})

const deleteNote = asyncHandler(async(req, res)=>{
const {id} = req.body;
if(!id) return res.status(400).json({message:'Note ID Required'});
try{
    const note = await Note.findById(id).exec();
    if(!note) return res.status(400).json({ message: 'Note not found' });
     await note.deleteOne();
    const reply = `Note '${note.title}' with ID ${note._id} deleted`;
    res.json(reply)
}catch(e){
    res.status(500).json({'message': e.message});
}
})


module.exports = {getAllNotes, createNewNote, updateNote, deleteNote}
