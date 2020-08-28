const data = require('../data/general-data');



exports.createData = async (customers, applications, spouse) => {
    let max1 = customers.length;
    for(let i=0; i < max1 ;i++){
        let max2 = applications[i].length;
        for(let x=0; x < max2 ;x++){
            customers[i].createApplication(applications[i][x]);
            if(customers[i].civil_status === 'M')
                customers[i].createSpouse(spouse[0]);
        }
    }
}