
// var data;
// var x;
var shemaUser ={
  userImg :"",
  company : ""
}
var shemaDetails={}
function genshema(i){
  var shemaDetail = `{
    "urlimg" : "`+cdetail[i].cimage+`",
    "route" : "`+cdetail[i].rcompany+`",
    "cost" : "`+cdetail[i].cost+`",
    "time" : "`+time+`",
    "distance" : "`+distance+`",
    "phone" : "`+phone+`",
    "gps" : "`+cdetail[i].clocation+`"
  }`
  var shema = JSON.parse(shemaDetail);
  pushdata(shema);
}
function pushdata(data){
  total.push(data);
}
function b(client,i,res){
  client.query("select * from round_company where cname ='"+cdetail[i].cname+"' and rcompany ='"+cdetail[i].rcompany+"';",function(errss,round){
    if(errss || round.rows == ""){
      time = "ไม่มีรอบเวลา"
      //  throw errss;
     }
     else{
       time = round.rows[0].time;
     }
    genshema(i)
    if(i==cdetail.length-1){
      res.render('page/profile',{shemaUser,total});
      // console.log(total);
    }
  });
}
function a(client,i){
  client.query("select * from route where routing ='"+cdetail[i].rcompany+"';",function(errss,route){
    if(errss) throw errss;
    distance = route.rows[0].distance;
  });
}

var total = [];
var cdetail
var time;
var distance;
var phone;
module.exports = function(app,express,session,auth,client){

  var router = express.Router();
  router.get('/',function(req,res){
    total = [];
    client.query("select * from vanuser where id ='"+req.session.email+"';",function(err,user){
      shemaUser.userImg = user.rows[0].urlimg ;

    })

      client.query("select * from company where owner ='"+req.session.email+"';",function(err,company){
        if(err) throw err;

        client.query("select * from cdetail where cname ='"+company.rows[0].name+"';",function(errs,cdetails){
          if(errs || cdetails.rows == ""){
            total=[]
            res.render('page/profile',{shemaUser,total});
          }
          else{
            cdetail = cdetails.rows;
            phone = company.rows[0].phone;
            //loop push data to array
              for(var i = 0; i < cdetail.length; i++ ){
                a(client,i);
                b(client,i,res);
              }
          }//
          });
        shemaUser.company = company.rows[0].name;
      });
  })
  router.get('/edit',function(req,res){
    console.log(req.query.key);
    var shemadata=total[req.query.key];
    res.render('page/details',{shemaUser,shemadata});
  })
   router.get('/delete',function(req,res){
    console.log(req.query.key);
    var shemadata=total[req.query.key];
          client.query("DELETE FROM cdetail WHERE rcompany ='"+shemadata.route+"';",function(err,company){
        if(err){
          console.log("delete cdetail err");
          console.log(err);
          
        }
        });
         client.query("DELETE FROM route WHERE routing ='"+shemadata.route+"';",function(err,company){
        if(err) {
          console.log("delete route err");
          console.log(err);
        }
        });
        console.log("DELETE FROM round_company WHERE rcompany ='"+shemadata.route+"' and cname ='"+shemaUser.company+"';");
         client.query("DELETE FROM round_company WHERE rcompany ='"+shemadata.route+"' and cname ='"+shemaUser.company+"';",function(err,company){
        if(err) {
          console.log("delete round_company err");
          console.log(err);
        }
        });
    res.redirect('/profile');    
   // res.render('page/details',{shemaUser,shemadata});
  })
  router.get('/edit/save',function(req,res){
    console.log(req.query);
    var temp = "update cdetail set cost ="+req.query.cost+" , cimage ="+"'"+req.query.image+"'"+",clocation ='"+req.query.GPS+"' where rcompany ='"+req.query.route+"';"
   
    client.query(temp,function(err,company){
        if(err) throw err;
      });
      temp = "update route set distance ="+req.query.distance+" where routing ='"+req.query.route+"';"
           console.log(temp);

       client.query(temp,function(err,company){
        if(err) throw err;
      });
   res.redirect('/profile');
  })
  require('./add')(app,express,session,auth,client,shemaUser);
  app.use('/profile',router)
}
