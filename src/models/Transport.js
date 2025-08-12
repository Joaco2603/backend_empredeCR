import { Schema,model } from 'mongoose';


//Schema
let TransportSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name must be provided']
    },
    schedules:{
        type: String,
        required: [true, 'Schedules must be provided']
    },
    phone:{
        type: Number,
        required: [true, 'Phone must be provided']
    },
    price: {
        type: Number,
        required: [true, 'Price must be provided']
    },
    address: {
        type: String,
        required: [true, 'Address must be provided']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
}, { versionKey: false });

//Model
export default model('Transports', TransportSchema);