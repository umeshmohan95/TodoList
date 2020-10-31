//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-umesh:root@cluster0.kre0s.mongodb.net/<dbname>?retryWrites=true&w=majority/todolistDB",{useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model(
  "Item",
  itemsSchema
);


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

const foundResultitem1 = new Item ({
  name : "Welcome to your todolist"
});

const item2 = new Item ({
  name : "Hit the + button to add a new item."
});

const defaultItem = [foundResultitem1,item2];

// Item.insertMany(defaultItem, function(err){
//   if(err){
//     console.log(err);
//   }else{console.log("Successfully saved Default items to DB");}
// });


app.get("/", function(req, res) {

// foundResult will be contains all the items

  Item.find({},function(err,foundResult){

  if(foundResult.length===0){

    Item.insertMany(defaultItem, function(err){
      if(err){
        console.log(err);
      }else{console.log("Successfully saved Default items to DB");}
    });
    res.redirect("/");
  }else{res.render("list", {listTitle: "Today", newListItems: foundResult});}

  });

});

app.get("/:customeListName",function(req,res){

const customeListName = _.capitalize(req.params.customeListName);

List.findOne({name: customeListName}, function(err, foundList){
  if (!err){
    if(!foundList){
      //create New List
      const list =new List({
        name : customeListName,
        items: defaultItem
      });
      list.save();
      res.redirect("/" + customeListName);
    }
    else{
      //create New List
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
});

  console.log(req.params.customeListName);
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item ({
    name : itemName
  });

  if(listName ==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

// instead of saying insert many, using mongoshortcut save()
  // item.save();
  // res.redirect("/");


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res) {
      const checkedID = req.body.checkbox;
      const listName = req.body.list;

      if(listName === "Today"){
        Item.findByIdAndRemove(checkedID, function(err){
          if(err){
            console.log(err);
          }else{console.log("Successfully removed items from DB");
          res.redirect("/");
        }
        });
      } else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedID}}}, function(err, foundList){
          if(!err){
            res.redirect("/"+listName);
          }
        });
      }


  console.log(req.body.checkbox);
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started Successfully");
});
