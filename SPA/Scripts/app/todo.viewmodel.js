window.todoApp.todoListViewModel = (function (ko, datacontext) {
    var todoLists = ko.observableArray(),
        error = ko.observable(),
        addTodoList = function() {
            var todoList = datacontext.createTodoList();
            todoList.IsEditingListTitle(true);
            datacontext.saveNewTodoList(todoList)
                .then(addSucceeded)
                .fail(addFailed);

            function addSucceeded() {
                showTodoList(todoList);
            }

            function addFailed() {
                error("Save of new TodoList failed");
            }
        },
        showTodoList = function (todoList) {
            todoLists.unshift(todoList); // Insert new TodoList at the front
        },
        deleteTodoList = function (todoList) {
            todoLists.remove(todoList);
            datacontext.deleteTodoList(todoList)
                .fail(deleteFailed);

            function deleteFailed() {
                showTodoList(todoList); // re-show the restored list
            }
        },
        
        // Navigation
        selectedListId = ko.observable(-1),
        selectedList = ko.computed(function () {
            for (var i = 0; i < todoLists().length; i++) {
                if (todoLists()[i].TodoListId == selectedListId()) {
                    return todoLists()[i];
                }
            }
            return null;
        }),
        selectList = function (id) {
            selectedListId(id);
        },
        showAll = function () {
            sammy.setLocation("#/");
        },
        showList = function (todoList) {
            sammy.setLocation("#/list/" + todoList.TodoListId);
        };

    datacontext.getTodoLists(todoLists, error); // load TodoLists

    return {
        todoLists: todoLists,
        error: error,
        addTodoList: addTodoList,
        deleteTodoList: deleteTodoList,
        selectedListId: selectedListId,
        selectedList: selectedList,
        selectList: selectList,
        showAll: showAll,
        showList: showList
    };

})(ko, todoApp.datacontext);

// Initiate the Knockout bindings
ko.applyBindings(window.todoApp.todoListViewModel);
