const mongoose = require('mongoose');
const { WORKSHEET_STATUS } = require("../utils/constants");

const workSheetSchema = new mongoose.Schema({
    numWorkSheet: {
        type: Number,
        required: true
    },
    comment: {
        type: String
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(WORKSHEET_STATUS)
    },
    procedure:[
        {
            name: {
                type: String,
                trim: true
            },
            price: {
                type: Number
            },
            description: {
                type: String
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
        trim: true
    },
    idDentist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), //1 ans
        expires: 0
    }

},
    {
        timestamps: true
    }
);

const WorkSheet = mongoose.model('WorkSheet', workSheetSchema);
module.exports = WorkSheet;