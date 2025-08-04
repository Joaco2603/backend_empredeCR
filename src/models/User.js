const mongoose = require('mongoose');

const DB_URI = 'mongodb://localhost:27017/LoginTienda';

mongoose.connect(DB_URI, {})

    .then(console.log("DB conect"))
    .catch(err => console.log(err))

//Schema

let UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'Name must be provided']
    },
    email: {
        type: String,
        required: [true, 'Email must be provided'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password must be provided']
    },
    img: {
        type: String,
    },
    rol: {
        type: String,
        required: true,
        emun: ['ADMIN_ROLE', 'CITIZEN_ROLE', 'ENTREPRENEUR_ROLE']
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { versionKey: false });

//Model

UserSchema.methods.toJSON = ()=>{
    const { __v,password, ...usuario } = this.toObject();
    return usuario
}

module.exports = mongoose.model('Users', UserSchema);