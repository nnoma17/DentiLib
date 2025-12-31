const  mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    role: {
        type: String,
        enum: ["ADMIN","DENTISTE","PROTHESISTE"],
        required: true
    },
    siret:{
        type: Number
    },
    associatedUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    listeActes: [
        {
            acte: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Procedure'
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
},{
    timestamps:true
});

const User = mongoose.model('User', userSchema);
module.exports = User;