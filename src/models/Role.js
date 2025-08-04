const { Schema,model } = require('mongoose')


const RoleSchema = Schema({

    rol:{
        type:String,
        require:[true,'Rol must be provided']
    }

})

module.exports = model('Role', RoleSchema);