exports.updateAreaCode = {
    updateType: 'both',
    id: 1,
    fieldName: 'area_code',
    fieldValue: 'TEST-200'
}

exports.updateApplicationDetails = (type, name, value, id=1) => {
    return ({
        updateType: type,
        id: id,
        fieldName: name,
        fieldValue: value
    });
};