const mongoose = require('mongoose');

const workSheetSchema = new mongoose.Schema({
    numWorkSheet: {
        type: Number,
        required: true
    },
    comment: {
        type: Text
    },
    status: {
        type: String,
        required: true,
        enum: ["En attente","En cours", "Termine"]
    },
    procedure:[
        {
            name: {
                type: String,
                trim: true
            },
            price: {
                type: Number
            }
        }
    ],
    firstNamePatient: {
        type: String,
        trim: true,
        required: true
    },
    lastNamePatient: {
        type: String,
        trim: true,
        required: true
    },
    emailNamePatient: {
        type: String,
        trim: true,
        required: true
    },
    numSecuPatient: {
        type: Number,
        required: true
    },
    invoicePDF: {
        type: String,
        trim: true,
        required: true
    },
    idDentist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

},
    {
        timestamps: true
    }
);

const WorkSheet = mongoose.model('Catalogue', workSheetSchema);
module.exports = WorkSheet;