var fs=require('fs');

var blogData="";
function readDataBase(){
    fs.readFile('index.db','utf-8',function (err,data) {
        if(err){
            console.log("error to read index.db");
            throw err;
        }
        blogData=JSON.parse(data);
    });
}

exports.blogData=blogData;
exports.readDataBase=readDataBase;