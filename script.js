var d;

var MAIN_CONTAINER_ELEM = "";
var GOALS_CONTAINER_ELEM = "";

class TaskComponent extends HTMLElement {

    constructor (params) {
        super();
        
        var TASK_COMPONENT_TEMPLATE_ELEM = d.querySelector('#task-component').content.cloneNode(true);
        TASK_COMPONENT_TEMPLATE_ELEM.getElementById('button-placeholder').appendChild(new AddButton('Add New Task', 'task'));
        this.classList.add('task-component');
        if (params.type == 'task') {
            this.classList.add('add-padding');
        }
        this.appendChild(TASK_COMPONENT_TEMPLATE_ELEM);

        this.setAttribute('data-type', params.type);
        this.setName(params.text);
    }

    setName(text) {
        this.getElementsByClassName('task-component__name')[0].innerText = text;
        this.getElementsByClassName('task-component__name')[0].classList.add('big-font');
    }
}

class TaskManager {
    constructor(){
        this.goals = [];
        this.goalsCount = 0;

        this.totalTasks = 0;
        this.completedTasks = 0;
    }

    addGoal(name, parentElement) {
        let newGoal = {
            'id': this.goalsCount++, 
            'name': name, 
            'children': [],
            'done': false
        };
        this.goals.push(newGoal);
        GOALS_CONTAINER_ELEM.appendChild(new TaskComponent({'type': 'goal', 'text': name, 'id': newGoal.id}))
    }

    addTask(name, goalId) {
        for (var i = this.goals.length - 1; i >= 0; i--) {
            if (this.goals[i].id == goalId){
                this.goals[i].children.push({
                    'id': this.this.goals[i].children.length,
                    'name': name,
                    'done': false
                });
                break;
            }
        }
    }

    markTaskAsDone(taskId, goalId) {
        for (var i = this.goals.length - 1; i >= 0; i--) {
            if (this.goals[i].id == goalId){
                for (var j = this.goals[i].children.length - 1; j >= 0; j--) {
                    if (this.goals[i].children[j].id == taskId){
                        this.goals[i].children[j].done = true;
                        break;
                    }
                }
                break;
            }
        }
    }

    markGoalAsDone(goalId) {
        for (var i = this.goals.length - 1; i >= 0; i--) {
            if (this.goals[i].id == goalId){
                this.goals[i].done = true;
                break;
            }
        }
    }

    hasTasks(goal) {
        if (goal.children.length == 0) {
            return false;
        }
        return true;
    }

    calculateCompletion(){
        if (this.goals.length == 0){
            return 0;
        }

        this.totalTasks = 0;
        this.completedTasks = 0;
        for (var i = this.goals.length - 1; i >= 0; i--) {
            if (this.hasTasks(this.goals[i])) {
                this.totalTasks += this.goals[i].children.length;
                for (var j = this.goals[i].length - 1; j >= 0; j--) {
                    if (this.goals[i].children[j].done) {
                        this.completedTasks ++;
                    }
                }
            } else {
                this.totalTasks ++;
                if (this.goals[i].done) {
                    this.completedTasks ++;
                }
            }
        }

        if (this.completedTasks == 0) {
            return 0;
        }

        return this.totalTasks/this.completedTasks;
    }

    getTotalTasks() {
        return this.totalTasks;
    }

    getCompletedTasks() {
        return this.completedTasks;
    }
}

class AddButton extends HTMLElement {
    
    constructor(label, type) {
        // Always call super first in constructor
        super();
        this.attachElements(label, type);
        this.addEvents();
    }

    attachElements(label, type) {
        var ADD_COMPONENT_TEMPLATE_ELEM = d.querySelector('#add-component').content.cloneNode(true);
        this.classList.add('add-component');
        if (type == 'goal') {
            this.classList.add('big-font');
        } else {
            this.classList.add('add-padding');
        }
        this.appendChild(ADD_COMPONENT_TEMPLATE_ELEM);
        var ADD_ICON_TEMPLATE_ELEM = d.querySelector('#add-icon').content.cloneNode(true);;
        this.getElementsByClassName('add-button')[0].appendChild(ADD_ICON_TEMPLATE_ELEM);
        this.getElementsByClassName('add-button__label')[0].innerText = label;
    }

    onclick() {
        let FORM_ELEM = this.parentElement.getElementsByClassName('add-form')[0];
        FORM_ELEM.classList.remove('hidden');
        this.parentElement.getElementsByClassName('new-task')[0].focus();
    }

    onsubmit(event) {
        event.preventDefault();
        let inputElement = this.parentElement.getElementsByClassName('new-task')[0];
        let newTaskName = inputElement.value;
        taskManager.addGoal(newTaskName);
        // Add GOAL COMPONENT HERE

        inputElement.value = "";
        let FORM_ELEM = this.parentElement.getElementsByClassName('add-form')[0];
        FORM_ELEM.classList.add('hidden');
    }

    addEvents(){
        this.getElementsByClassName('add-button')[0].addEventListener("click", this.onclick);
        this.getElementsByClassName('add-form')[0].addEventListener("submit", this.onsubmit);
    }
}

var defineCustomComponents = function(){
    customElements.define("add-component", AddButton);
    customElements.define("task-component", TaskComponent);
}

var appendInitialElements = function(){
    MAIN_CONTAINER_ELEM.appendChild(new AddButton("Add New Goal", "goal"));
};


var taskManager = new TaskManager();

window.onload = function() {
    d = document;
    MAIN_CONTAINER_ELEM = d.getElementsByClassName("main-container")[0];
    GOALS_CONTAINER_ELEM = d.getElementsByClassName("goals-container")[0];
    defineCustomComponents();
    appendInitialElements();

};
