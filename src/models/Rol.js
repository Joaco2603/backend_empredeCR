const { Schema,model } = require('mongoose')


const RolSchema = Schema({
    rol:{
        type:String,
        require:[true,'Rol must be provided']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = model('Role', RolSchema);