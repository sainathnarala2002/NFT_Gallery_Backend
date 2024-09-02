const { sendMail } = require('./mail')
const fs = require('fs')
const path = require('path')
const reusableFunctions = {}

reusableFunctions.generateOtp = () => {
    return Math.floor(1000 + Math.random() * 8000);
}

reusableFunctions.findMissingFields = (requestBody, requiredField) => {
    let missingField = "";
    requiredField.forEach((field) => {
        if (!requestBody[field]) missingField += field + ", "
    });

    return missingField.substring(0, missingField.length - 2)
}

reusableFunctions.sendMail = (email, subject, html) => {
    return new Promise((resolve) => {
        sendMail(email, subject, html, (err, status) => {
            if (err) {
                console.error("error sending email: " + err)
                resolve(false)
            } else {
                console.log("Email status", status)
                resolve(status === "Success")
            }
        })
    })
}

reusableFunctions.calculateExpiry = (currentDate, validityInMonths, validilityInDays) => {
    let expiryDate = '';
    if(typeof currentDate == "string") currentDate = new Date(currentDate)
    if(validityInMonths) expiryDate = new Date(
        currentDate.getFullYear(), 
        currentDate.getMonth() + validityInMonths, 
        currentDate.getDate(), 
        currentDate.getHours(), 
        currentDate.getMinutes(), 
        currentDate.getSeconds()
    );

    if(validilityInDays) expiryDate = new Date(
        currentDate.getFullYear(), 
        currentDate.getMonth(), 
        currentDate.getDate() + validilityInDays, 
        currentDate.getHours(), 
        currentDate.getMinutes(), 
        currentDate.getSeconds()
    );
    
    // Handle cases where the new month might have fewer days than the current date's day
    if (expiryDate.getDate() !== currentDate.getDate() && !validilityInDays) {
        expiryDate.setDate(0); // Set date to the last day of the previous month
    }
    
    return expiryDate;
}

// reusableFunctions.deleteFile = (collection, field) => {
//     const filedPath = collection[field]
//     const splitPath = filedPath.split('bling-movie-uploads/')[1];
//     if (fs.existsSync(path.join(__dirname, '../..', `/bling-movie-uploads/${splitPath}`))) {
//         fs.unlinkSync(path.join(__dirname, '../..', `/bling-movie-uploads/${splitPath}`))
//     }
//     return
// }

// reusableFunctions.generateLink = (request, fileName) => {
//     // D: is related to file system.
//     // so, remove it before saving as url
//     let url = fileName? request.files[fileName][0].path.split('\\'): request.file.path.split('\\')
//     let link = "", len = url.length;
//     const startIndex = url.indexOf('bling-movie-uploads')
//     for(let i = startIndex; i < len; i++){
//         i > startIndex? link += "/"+url[i]: link += url[i]
//     }
//     return  process.env.filePath + link;
// }

reusableFunctions.isExist = (list, name) => {
    const len = list.length
    for(let i = 0; i < len; i++){
        if(list[i].name == name) return true
    }
    return false
}

reusableFunctions.isGiven = (prop) => {
    return prop != "" && prop != null && prop != undefined
}

module.exports = reusableFunctions