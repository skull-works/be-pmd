

//passbook

exports.postPassbook = (area_code, id) => {
    return ({
        area_code: area_code,
        AppId: id
    });
}


//passbook Items

exports.postPassbookItems = (passbookId, balance, collection, newField, newFieldValue) => {
    let value = {
        passbookId: passbookId,
        balance: balance,
        collection: collection
    };
    if(newField)
        value[newField] = newFieldValue;
    return (value);
}
