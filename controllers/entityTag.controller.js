const EntityTag = require('../models/entityTag.model');
const _ = require('lodash');

module.exports = {
    getComboSytemTag: async (req, res) => {
        try {
            let existingEntityTag = await EntityTag.findOne({
                prefix: 'COMBOMAT'
            });
            let currentEntityTag;
            if (!existingEntityTag) { /* first time check */
                let newTag = new EntityTag({
                    prefix: 'COMBOMAT',
                    count: 1000
                });
                currentEntityTag = await newTag.save();
            } else {
                currentEntityTag = existingEntityTag;
            }
            currentEntityTag.count++;
            let updatedEntityTag = await currentEntityTag.save();
            updatedEntityTag = updatedEntityTag.toObject();
            
            let comboSystemTag = `${updatedEntityTag.prefix}${updatedEntityTag.count}`;
            
            return res.status(200).json({
                comboTag : comboSystemTag
            })
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                message: "Internal server error"
            });
        }


    }
}