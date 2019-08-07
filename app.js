var budgetController = (function() {
    // Do something

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(income) {
        if (income > 0) {
            this.percentage = Math.round((this.value / income) * 100);
        } else this.percentage = -1;
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });

        data.total[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        total: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };

    return {
        addItems: function(type, des, val) {
            var newItem, ID;

            // Create the next ID for new element
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new element based on exp or inc
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else newItem = new Income(ID, des, val);

            // Store the new element into the array
            data.allItems[type].push(newItem);

            // Return new element
            return newItem;
        },

        testDisplay: function() {
            console.log(data);
        },

        calculateBudget: function() {

            // Calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate the budget: income - expense
            data.budget = data.total.inc - data.total.exp;

            // Calculate the percentage of income that we spent
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            }
        },

        calcPercentages: function() {

            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.total.inc);
            });

        },

        getPercentages: function() {
            var allPerc;

            allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });

            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            }
        },

        deleteItem: function(type, ID) {
            var idArray, index;

            idArray = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = idArray.indexOf(ID);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        }
    };

})();

var UIController = (function() {
    // Do something

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(type, num) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2); // Result of the function is a string-type var
        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(type, obj.value));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        clearInputFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArray[0].focus();

        },

        displayBudget: function(obj) {
            var type;
            type = (obj.budget > 0) ? 'inc' : 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(type, obj.budget);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(type, obj.totalInc);
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(type, obj.totalExp);

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {
            var fields, nodeListForEach;

            fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; ++i) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] !== -1) {
                    current.textContent = percentages[index] + '%';
                } else current.textContent = '---';

            });

        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayMonth: function() {
            var now, month, year;
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            now = new Date();

            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month - 1] + ' ' +
                year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            }

            nodeListForEach(fields, function(current, index) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        },

        getDOMStrings: function() {
            return DOMStrings;
        }
    };

})();

var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {

        var DOM = UICtrl.getDOMStrings();

        // Event with button clicked
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        // Event with key pressed
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)

    }

    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };


    var updatePercentages = function() {
        var expensesPerc;
        // 1. Calculate the percentages for each expense
        budgetCtrl.calcPercentages();

        // 2. Get the calculated percentages
        expensesPerc = budgetCtrl.getPercentages();
        console.log(expensesPerc);

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(expensesPerc);
    }

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data

        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller

            newItem = budgetCtrl.addItems(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the input fields
            UICtrl.clearInputFields();

            // 5. Calculate and update the budget on the UI
            updateBudget();

            // 6. Calculate and update percentages on the UI
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // 1. Delete the item 
            budgetCtrl.deleteItem(type, ID);

            // 3. Update the UI itemList
            UICtrl.deleteListItem(itemID);

            // 4. Recalculate the budget and update the UI
            updateBudget();

            // 5. Calculate and update the percetages on the UI
            updatePercentages();

        }
    }

    return {
        init: function() {
            console.log('Application started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();