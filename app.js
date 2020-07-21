//budget controller module(function expression) separated by iife from rest of the code
var budgetController = (function(){
// var x = 23;
// //we dont have access outside to add variable so we need to use return an object conatining console.log in a function
// var add = function(a){
//     return x+a;
//     }
//     return {
//         //returning a object that will make the functions in here access to public, due to closures even after the run of budgetController inner functions have access to it
//         publicTest : function(b){
//             //console.log(add(b));
//             return add(b);
//         }
//     }

var Expense = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1 ;
};
Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome>0){
        this.percentage = Math.round((this.value/totalIncome)*100);
    }else {
        this.percentage = -1 ;
    }
  
};
Expense.prototype.getPercentage = function(){
    return this.percentage;
};
var Income = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
};
var calculateTotal = function(type){
var sum = 0;
data.allItems[type].forEach(function(current){
    sum += current.value;
});
data.totals[type] = sum;
};
//global data model
var data = {
    allItems:{
        exp: [],
        inc: []
    },
    totals: {
        exp: 0,
        inc: 0 
    },
    budget : 0,
    percentage :-1 //doesnot exists
};
return {
    addItem : function(type,des,val){
    var newItem,ID;
    //ID = last ID +1
    if(data.allItems[type].length>0){
    ID=data.allItems[type][data.allItems[type].length - 1].id+1;//to select the last item in the array and retrieve its id
    }else {
        ID=0;
    }

    //create new item based on 'inc' or 'exp' type
    if(type==='exp'){
        newItem = new Expense(ID,des,val);
    }else {
        newItem = new Income(ID,des,val);
    }

    //Push it into our data structure
    data.allItems[type].push(newItem);

    //Return the new element
    return newItem;
    },
    deleteItem: function(type,id){
        var ids,index;
        ids =  data.allItems[type].map(function(current){
        //map will loop over and return a brand new array ids containing ids as elements
        return current.id;
       });
        index = ids.indexOf(id);   //index = -1 if element doesnot exists
        if(index !== -1){
         //slice is used to create copy but splice is used to remove elements
         data.allItems[type].splice(index,1); //starts at index and deletes no. of elements after it as provided
        }
    },
    calculateBudget: function(){
        //calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');
        //calculate the budget : income-expenses
        data.budget = data.totals.inc - data.totals.exp;
        //calculate the percentage of income that we spent
        if(data.totals.inc > 0 ){
            data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
        }else {
            data.percentage = -1;
        }
       
    },
    calculatePercentages: function(){
      data.allItems.exp.forEach(function(current){
          current.calcPercentage(data.totals.inc);
      });
    },
    getPercentages : function(){
        //allPerc is the array with all the percentages for each element getPercentage will be called
       var allPerc = data.allItems.exp.map(function(current){
         return current.getPercentage();
       }); 
       return allPerc;
    },
    getBudget : function(){
        //to return multiple values at the same time we will use object
        return  {
            budget : data.budget,
            totalInc : data.totals.inc,
            totalExp : data.totals.exp,
            percentage : data.percentage
        };
    },
    testing : function(){
        console.log(data);
    }
};
})();
//ui module
var UIController = (function(){
var DOMstrings = {
    //class names from budget.html
    inputType:'.add__type',
    inputDescription:'.add__description',
    inputValue:'.add__value',
    inputBtn:'.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel:'.budget__value',
    incomeLabel:'.budget__income--value',
    expensesLabel:'.budget__expenses--value',
    percentageLabel:'.budget__expenses--percentage',
    container : '.container',
    expensesPercLabel:'.item__percentage',
    dateLabel:'.budget__title--month'
};
var formatNumber=function(num,type){
    var numSplit,int,dec,sign;
    //abs remove sign of number it means absolute
   num = Math.abs(num);
   num = num.toFixed(2); //js converts number (primitive datatype) to object so we can use methods on it ,it will give no. upto 2 decimal points and also it will return a string
   //as num is now string we can use split method
   numSplit = num.split('.');//it returns array i.e numSplit is an array
   int = numSplit[0]; // it is still a string
   dec = numSplit[1];
   if(int.length > 3){
       int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3); // putting comma for thousand place 23,510 or 2,310
   }
   ;
   return (type === 'exp' ?  '-' :'+' )+ ' ' + int+'.'+dec;

};
var nodeListForEach = function(list,callback){
    for(var i = 0;i<list.length;i++){
        callback(list[i],i);
    }
}; 
//same ways
//   function nodeListForEach(list,callback){
//     for(var i = 0;i<list.length;i++){
//         callback(list[i],i);
//     }
//   };

//returning object to give function public access 
   return {
       getInput : function(){
           //to get all three values at once we should use an object containig these 3 as properties and return it rathen than using 3 separate variables
           return {
             type : document.querySelector(DOMstrings.inputType).value, // will be either income(+) or expense(-).
             description : document.querySelector(DOMstrings.inputDescription).value,
             value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
           };
        
       },
       addListItem : function(obj,type){
           var html,newHtml,element;
          //create html string with placeholder text
          if(type==='inc'){
         element = DOMstrings.incomeContainer;
         //copied from budget.html below this <div class="income__list">
          html = ' <div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';}
          else if(type==='exp') {
            element = DOMstrings.expensesContainer;
          html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';}
          //replace the placeholder text with some actual data
          newHtml = html.replace('%id%',obj.id);
          newHtml = newHtml.replace('%description%',obj.description);
          newHtml = newHtml.replace('%value%',formatNumber(obj.value),type);
          //insert the html into the DOM
          document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);//beforend will add our item as the last child(item) to the elemnent we selected
       },
       deleteListItem : function(selectorID){
          var el =  document.getElementById(selectorID);
          el.parentNode.removeChild(el);

       },
       clearFields : function(){
           var fields,fieldArr;
           //querySelectorAll gives list not array,so we have to convert it to array
         fields = document.querySelectorAll(DOMstrings.inputDescription+','+DOMstrings.inputValue);
         //we will use slice method of arrays to return a copy of array(in our case list ,we are tricking it) but we cannot use field.slice as field is not an array so we have to call slice from the prototype Array(function cunstructor) video no. 12
        fieldArr =  Array.prototype.slice.call(fields);//call can be used as it a function
        //callback function in foreach gets applied to each element of array
        fieldArr.forEach(function(current,index,array){
            //making inputDescription and inputValue empty
          current.value = "";
        });
        fieldArr[0].focus();//giving focus back to description

       },
       displayBudget : function(obj){
           var type ; 
           obj.budget> 0 ? type = 'inc' : type = 'exp';
         document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);//just to change the text
         document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
         document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
         
         if(obj.percentage > 0){
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+'%';
         }else {
            document.querySelector(DOMstrings.percentageLabel).textContent ='---'; 
         }
       },
       displayPercentages: function(percentages){
          var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); 
          
         
          nodeListForEach(fields, function(current, index) {
                
            if (percentages[index] > 0) {
                current.textContent = percentages[index] + '%';
            } else {
                current.textContent = '---';
            }
        });
       },
       displayMonth:function(){
           var now,year,month,months;
           now = new Date();
           //var christmas = new Date(2016, 11, 25);
           
           months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
           month = now.getMonth();
           year = now.getFullYear();
           document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        
       },
       changedType : function(){
           var fields = document.querySelectorAll(
               DOMstrings.inputType+','+
               DOMstrings.inputDescription+','+
               DOMstrings.inputValue);
           //fields is now a nodeList cannot use traditional forEach so make one like before 
           nodeListForEach(fields,function(current){
               current.classList.toggle('red-focus');
           });
          document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
       },
   
       //making DOMstrings public
       getDOMstrings : function(){
           return DOMstrings;
       }
   };
})();

//app controller module to connect ui module and budget manipulation module
var controller = (function(budgetCtrl,UICtrl){
//    var z = budgetCtrl.publicTest(5);
//  return {
//      anotherPublic : function(){
//          console.log(z);
//      }
//  }

var setupEventListeners = function (){
    var DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

//making the eventlistener to global
document.addEventListener('keypress',function(event){
if(event.keyCode === 13 || event.which === 13){
    //event.which is for older browsers
   //  console.log('ENTER was pressed');
    ctrlAddItem();
}
});

document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem); // event delegation
document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType); 
};
// this updateBudget function will be called everytime we enter a new item into the user interface same as the ctrlAddItem
var updateBudget = function(){
//1.Calculate the budget
budgetCtrl.calculateBudget();
//2.return the budget
var budget = budgetCtrl.getBudget();
//3.Display the budget on the UI
UICtrl.displayBudget(budget);
};
var updatePercentages = function(){
//1. calculate percentages
budgetCtrl.calculatePercentages();
//2.read percentages from the budget controller
var percentages = budgetCtrl.getPercentages();
//3.update the ui with the new percentages
UICtrl.displayPercentages(percentages);
};

var ctrlAddItem = function(){
    var input,newItem;
//1.Get the field input data
input = UICtrl.getInput();
//console.log(input);

if(input.description!==""&& !isNaN(input.value)&& input.value>0){
    //2.Add the item to the budget controller
newItem = budgetCtrl.addItem(input.type,input.description,input.value);//addItem returns object so save it in variable

//3.Add the item to the UI
UICtrl.addListItem(newItem,input.type);
//4.Clear the fields 
UICtrl.clearFields();
//Calculate and update budget 
updateBudget();
//Claculate and update percentages
updatePercentages();
}


};
var ctrlDeleteItem = function(event){
    var itemID,splitID,type,ID;
    //DOM traversing
 //console.log(event.target); // target returns html node(current tag) in the DOM to go to parent node we type parentNode
itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

if ( itemID){
splitID = itemID.split('-'); //itemId is string so type and ID will be string as well
type = splitID[0];
ID = parseInt(splitID[1]);
//1.delete the item from the data structure
budgetCtrl.deleteItem(type,ID);
//2.delete the item from the ui
UICtrl.deleteListItem(itemID);
//3.update and show the new budget
updateBudget();
//Claculate and update percentages
updatePercentages();
}
};
//creating public init(intialization function),now we need to do it due to creation of setupEventListeners(); before that we didnot bother due to iife
//init runs eachtime our application starts just like iife
return {
    init : function(){
        //setting eerything to 0 at the very start
        UICtrl.displayMonth();
        UICtrl.displayBudget({
            budget : 0,
            totalInc : 0,
            totalExp : 0,
            percentage : -1
        });
      setupEventListeners();
    }
};
})(budgetController,UIController);

controller.init(); // to run and setup event listeners