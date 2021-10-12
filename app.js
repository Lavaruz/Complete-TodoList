//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const _ = require('lodash')


// MONGOOSE DEFAULT
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.h8ftc.mongodb.net/TodoList`)
const itemSchema = mongoose.Schema({
  nama : String
})
const Schedule = new mongoose.model('Schedule', itemSchema)

const defaultSchedule = new Schedule({
  nama : 'Welcome to ToDo List'
})

const List = new mongoose.model('List',{
  namaList : String,
  itemsList : []
})
// defaultSchedule.save()

// APP DEFAULT
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// HOME 
app.get("/", function(req, res) {

  Schedule.find({}, function(err, docs){
    res.render("list", {listTitle: 'Today', newListItems: docs});
  })

});

app.post("/", function(req, res){
  const item = req.body.newItem;
  const listTitle = req.body.listName

  const addItem = new Schedule({
    nama : item
  })
  if (listTitle === 'Today'){
    addItem.save()
    res.redirect('/')
  }else{
    List.findOne({namaList : listTitle}, function(err, docs){
      docs.itemsList.push(addItem)
      docs.save()
      res.redirect(`/${listTitle}`)
    })
  }
});

app.post('/delete', function(req, res){
  const cekBox = req.body.cekBox
  const listTitle = req.body.listName

  if (listTitle === 'Today'){
    Schedule.findOneAndRemove(cekBox, function(err) {
      if (!err){
        console.log('Deleted!');
      }
    })
    res.redirect('/')
  }else{
    

   List.updateMany({namaList : listTitle}, {$pull:{itemsList:{nama :cekBox}}}, function(err){
     if(!err){
       res.redirect(`/${listTitle}`)
     }
   })
  }
})


// CUSTOM LIST
app.get('/:custom', function(req, res){
  const customName = _.capitalize(req.params.custom) 
  
  List.findOne({namaList : customName}, function(err, docs){
    if (!err){
      if(!docs){
        const addList = new List({
          namaList : customName,
          itemsList : defaultSchedule
        })
        addList.save()
        res.redirect(`/${customName}`)
      }else{
        res.render('list',{listTitle:customName, newListItems : docs.itemsList})
      }
    }
  })
  
})

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
