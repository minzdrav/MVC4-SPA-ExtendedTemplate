// initialize the application
var sammy = Sammy(function() {
    // define a 'route'
    this.get('#/', function() {
    	//console.log("all lists");
    	window.todoApp.todoListViewModel.selectList(-1);
    });

    this.get('#/list/:id', function (context) {
        var id = this.params['id'];
    	//console.log(id);
        window.todoApp.todoListViewModel.selectList(id);
    });
});

// start the application
sammy.run('#/');