const  mongoose = require('mongoose');
const procedureSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    } ,
    description: {
        type: String,
    }
});

const Procedure = mongoose.model('Procedure', procedureSchema);
module.exports = Catalogue;