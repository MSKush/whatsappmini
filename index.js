const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const Chat=require("./models/chat.js");
const methodOverride=require("method-override");
const ExpressError=require("./ExpressError");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

main()
    .then(()=>{
        console.log("connection successful");
    })
    .catch((err)=>{
        console.log(err);
    });

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/fakedata");
};

//<----------------index route--------------------------->
app.get("/chats", async(req,res)=>{
    let chats= await Chat.find();
    // console.log(chats);
    res.render("index.ejs",{chats});
});

//<----------------new route--------------------------->
app.get("/chats/new",(req,res)=>{
    // throw new ExpressError(404,"some error");
    res.render("new.ejs");
});
//<------------------create route--------------------------->
app.post("/chats",async (req,res,next)=>{
    try{
        let {from, msg , to}=req.body;
        let newChat= new Chat({
        from:from,
        to:to,
        msg:msg,
        created_at:new Date()
    });
    await newChat.save();
        res.redirect("/chats");
    }
    catch(err){
        next(err);
    }
 
});

//<---------Show Route------------>
app.get("/chats/:id", async(req,res,next)=>{
    try{
        let {id} = req.params;
        let chat= await Chat.findById(id);
        if(!chat){
            next(new ExpressError(404,"Page not Found"));
        }
        // console.log(chat);
        res.render("edit.ejs",{chat});
    }
    catch(err){
        next(err);
    }
});

//<---------Edit Route------------>
app.get("/chats/:id/edit", async(req,res)=>{
    try {
        let {id} = req.params;
        let chat= await Chat.findById(id);
        console.log(chat);
        res.render("edit.ejs",{chat});
    } catch (error) {
        next(err);
    }
});

// <-------------Update----------->
app.put("/chats/:id", async (req,res)=>{
    try{
        let {id}=req.params;
        let {msg:newmsg}=req.body;
        console.log(newmsg);
        let updateChat= await Chat.findByIdAndUpdate(
            id,{msg:newmsg},{runValidators:true, new:true}
        );
        console.log(updateChat);
        res.redirect("/chats");
    }
    catch(err){
        next(err);
    }
});
// <------------Delete Route-------------->
app.delete("/chats/:id", async(req,res)=>{
    try {
         let {id}=req.params;
        let deleteChat=await Chat.findByIdAndDelete(id);
        console.log(deleteChat);
        res.redirect("/chats");
    } catch (error) {
        next(err);
    }
});

// let chat1=new Chat({
//     from:"neha",
//     to:"Priya",
//     msg:"send me your exam sheets",
//     created_at:new Date(),
// });
// chat1.save()
//     .then((res)=>{
//         console.log(res);
//     });
app.get("/",(req,res)=>{
    res.send("root is working");
});
app.use((err,req,res,next)=>{
    console.log(err);
    let {status=500,message="Some Error Occurred"}=err;
    res.status(status).send(message);

})
app.listen(8080,()=>{
    console.log("server is listenig on port 8080 ");
});