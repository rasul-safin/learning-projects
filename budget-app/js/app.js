//BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var  calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0, 
        percentage: -1  
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // Create new ID
            
            // [1, 2, 3, 4, 5] next ID = 6
            // [1, 2 , 4, 6, 8] next ID = 9
            //ID = last ID  +1 
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type ==='inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);

            //Return new element
            return newItem
        }, 

        calculateBudget: function() {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses 
            data.budget = data.totals.inc - data.totals.exp; 

            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    }
})();

//UI CONTROLLER
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeBox: '.income__list',
        expensesBox: '.expenses__list',
        budgetLabel: '.display__value',
        incomeLabel: '.display__inc__value',
        expensesLabel: '.display__exp__value',
        percentageLabel: '.budget__expenses__percentage'
    }

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp value
                description: document.querySelector(DOMstrings.inputDescription).value, 
                value:  parseFloat(document.querySelector(DOMstrings.inputValue).value) 
            };    
        }, 

        addListItem: function(obj, type) {
            var html, newHtml, element;
            
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeBox;
                html = '<div class ="item" id="inc-%id%"><div class="item__description">%description%</div><div class="item__value">%value%</div></div>'; 
            } else if (type === 'exp') {
                element = DOMstrings.expensesBox;
                html = '<div class ="item" id="exp-%id%"><div class="item__description">%description%</div><div class="item__value">%value%</div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert HTML into the DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        }, 

        displayBudget : function(obj) {

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;

        },

        clearFields : function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields); 

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }
})();

//GlOBAL CONTROLLER
var controller = (function(bdgtCtrl, UIctrl) {
    
    var setupEventListeners = function() {
        var DOM = UIctrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }   
        });
    };
 
    var updateBudget = function() {
        
        // 1. Calculate the budget
        bdgtCtrl.calculateBudget();

        // 2. Return the budget
        var budget = bdgtCtrl.getBudget();
        
        // 3. Display the budget on the UI
        console.log(budget);
    }

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get input data
        input = UIctrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = bdgtCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UIctrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UIctrl.clearFields();
            
            // 5. Calculate and update budget 
            updateBudget();
            
        }
    };
    
    return {
        init: function() {
            console.log('Application has started');
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();

