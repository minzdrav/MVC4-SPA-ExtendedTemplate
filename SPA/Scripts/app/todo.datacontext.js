window.todoApp = window.todoApp || {};

window.todoApp.datacontext = (function (ko) {

    var init = function () {
        defineRequest('getTodoLists', todoListUrl(), 'GET');
        defineRequest('saveNewTodoItem', todoItemUrl(), 'POST');
        defineRequest('saveNewTodoList', todoListUrl(), 'POST');
        defineRequest('deleteTodoItem', todoItemUrl('{TodoItemId}'), 'DELETE');
        defineRequest('deleteTodoList', todoListUrl('{TodoListId}'), 'DELETE');
        defineRequest('saveChangedTodoItem', todoItemUrl(), 'PUT');
        defineRequest('saveChangedTodoList', todoListUrl(), 'PUT');
    };
    init();

    var datacontext = {
        getTodoLists: getTodoLists,
        createTodoItem: createTodoItem,
        createTodoList: createTodoList,
        saveNewTodoItem: saveNewTodoItem,
        saveNewTodoList: saveNewTodoList,
        saveChangedTodoItem: saveChangedTodoItem,
        saveChangedTodoList: saveChangedTodoList,
        deleteTodoItem: deleteTodoItem,
        deleteTodoList: deleteTodoList,
        restoreFromStorage: restoreFromStorage,
        saveToStorage: saveToStorage
    };

    return datacontext;

    function restoreFromStorage(todoListsObservable) {
        var data = amplify.store("spa-todo-storage");
        if (data) {
            var mappedTodoLists = $.map(data, function(list) { return new createTodoList(list); });
            todoListsObservable(mappedTodoLists);
        }
    }
    
    function saveToStorage(data) {
        amplify.store("spa-todo-storage", data);
    }

    function getTodoLists(todoListsObservable, errorObservable) {
        return $.Deferred(function(def) {
            return amplify.request({
                resourceId: "getTodoLists",
                success: getSucceeded,
                error: getFailed
            });

            function getSucceeded(data) {
                var mappedTodoLists = $.map(data, function(list) { return new createTodoList(list); });
                todoListsObservable(mappedTodoLists);
                saveToStorage(data);
                def.resolve(data);
            }

            function getFailed(response) {
                errorObservable("Error retrieving todo lists.");
                def.reject(response);
            }
        }).promise();
    }
    function createTodoItem(data) {
        return new datacontext.TodoItem(data); // TodoItem is injected by model.js
    }
    function createTodoList(data) {
        return new datacontext.TodoList(data); // TodoList is injected by model.js
    }
    function saveNewTodoItem(todoItem) {
        clearErrorMessage(todoItem);
        return $.Deferred(function(def) {
            return amplify.request({
                resourceId: "saveNewTodoItem",
                data: ko.toJSON(todoItem),
                success: function(result) {
                    todoItem.TodoItemId = result.TodoItemId;
                    def.resolve(result);
                },
                error: function (response) {
                    todoItem.ErrorMessage("Error adding a new todo item.");
                    def.reject(response);
                }
            });
        }).promise();
    }
    function saveNewTodoList(todoList) {
        clearErrorMessage(todoList);
        return $.Deferred(function(def) {
            return amplify.request({
                resourceId: "saveNewTodoList",
                data: ko.toJSON(todoList),
                success: function(result) {
                    todoList.TodoListId = result.TodoListId;
                    todoList.UserId = result.UserId;
                    def.resolve(result);
                },
                error: function (response) {
                    todoList.ErrorMessage("Error adding a new todo list.");
                    def.reject(response);
                }
            });
        }).promise();
    }
    function deleteTodoItem(todoItem) {
        return $.Deferred(function (def) {
            return amplify.request({
                resourceId: "deleteTodoItem",
                data: {
                    TodoItemId: todoItem.TodoItemId
                },
                success: function(result) {
                    def.resolve(result);
                },
                error: function (response) {
                    todoItem.ErrorMessage("Error removing todo item.");
                    def.reject(response);
                }
            });
        }).promise();
    }
    function deleteTodoList(todoList) {
        return $.Deferred(function(def) {
            return amplify.request({
                resourceId: "deleteTodoList",
                data: {
                    TodoListId: todoList.TodoListId
                },
                success: function(result) {
                    def.resolve(result);
                },
                error: function (response) {
                    todoList.ErrorMessage("Error removing todo list.");
                    def.reject(response);
                }
            });
        }).promise();
    }
    function saveChangedTodoItem(todoItem) {
        clearErrorMessage(todoItem);
        return $.Deferred(function(def) {
            return amplify.request({
                resourceId: "saveChangedTodoItem",
                data: ko.toJSON(todoItem),
                success: function(result) {
                    def.resolve(result);
                },
                error: function (response) {
                    todoItem.ErrorMessage("Error updating todo item.");
                    def.reject(response);
                }
            });
        }).promise();
    }
    function saveChangedTodoList(todoList) {
        clearErrorMessage(todoList);
        return $.Deferred(function(def) {
        return amplify.request({
            resourceId: "saveChangedTodoList",
            data: ko.toJSON(todoList),
            success: function (result) {
                def.resolve(result);
            },
            error: function (response) {
                todoList.ErrorMessage("Error updating the todo list title. Please make sure it is non-empty.");
                def.reject(response);
            }
        });
        }).promise();
    }

    // Private
    function clearErrorMessage(entity) { entity.ErrorMessage(null); }
    function defineRequest(name, url, type) { 
        amplify.request.define(name, 'ajax', {
            url: url,
            dataType: 'json',
            type: type,
            contentType: 'application/json; charset=utf-8'
        });
    }
    // routes
    function todoListUrl(id) { return "/api/todolist/" + (id || ""); }
    function todoItemUrl(id) { return "/api/todo/" + (id || ""); }

})(ko);