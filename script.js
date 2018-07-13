var d;

var MAIN_CONTAINER_ELEM = "";
var GOALS_CONTAINER_ELEM = "";

function findAncestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

class TaskComponent extends HTMLElement {

    constructor (params) {
        super();
        
        this.type = params.type;
        this.id = params.id;

        this.classList.add('task-component');

        var TASK_COMPONENT_TEMPLATE_ELEM = d.querySelector('#task-component').content.cloneNode(true);

        if (params.type == 'task') {
            this.classList.add('add-padding');
            this.goalId = params.goalId;
        } else {
            TASK_COMPONENT_TEMPLATE_ELEM.getElementById('button-placeholder').appendChild(new AddButton('Add New Task', 'task'));
        }

        this.appendChild(TASK_COMPONENT_TEMPLATE_ELEM);
        this.setAttribute('data-type', params.type);
        this.setAttribute('id', params.id);
        this.setName(params.text);

        this.addEvents();
    }

    setName(text) {
        this.getElementsByClassName('task-component__name')[0].innerText = text;
        this.getElementsByClassName('task-component__name')[0].classList.add('big-font');
    }

    showDoneActions(){
        this.getElementsByClassName('icon-checkmark')[0].classList.remove('hidden');
        this.getElementsByClassName('done-actions')[0].classList.remove('hidden');
        this.getElementsByClassName('not-done-actions')[0].classList.add('hidden');
    }

    showNotDoneActions() {
        this.getElementsByClassName('icon-checkmark')[0].classList.add('hidden');
        this.getElementsByClassName('done-actions')[0].classList.add('hidden');
        this.getElementsByClassName('not-done-actions')[0].classList.remove('hidden');
    }

    onMouseOver(event) {
        if (this.type == 'task') {
            if (taskManager.isTaskDone(this.id, this.goalId)) {
                this.showDoneActions();
            } else {
                this.showNotDoneActions();
            }
        } else if (this.type == 'goal' && !taskManager.hasTasks(taskManager.getGoal(this.id))) {
            if (taskManager.isGoalDone(this.id)) {
                this.showDoneActions();
            } else {
                this.showNotDoneActions();
            }
        }
    }

    markAsDone (thisObject) {
        if (thisObject.type == 'task') {
            taskManager.markTaskCompletion(true, thisObject.id, thisObject.goalId);
            if (taskManager.isGoalDone(thisObject.goalId)) {
                let parentGoalElem = findAncestor(thisObject, 'task-component');
                parentGoalElem.getElementsByClassName('task-component__name')[0].classList.add('line-through');
                parentGoalElem.getElementsByClassName('icon-checkmark')[0].classList.remove('hidden');
            }
        } else if (thisObject.type == 'goal') {
            taskManager.markGoalCompletion(true, thisObject.id);
        }
        thisObject.getElementsByClassName('icon-checkmark')[0].classList.remove('hidden');
        thisObject.getElementsByClassName('task-component__name')[0].classList.add('line-through');
        thisObject.onMouseOut();
    }

    markAsNotDone (thisObject) {
        if (thisObject.type == 'task') {
            taskManager.markTaskCompletion(false, thisObject.id, thisObject.goalId);
            let parentGoalElem = findAncestor(thisObject, 'task-component');
            parentGoalElem.getElementsByClassName('task-component__name')[0].classList.remove('line-through');
            parentGoalElem.getElementsByClassName('icon-checkmark')[0].classList.add('hidden');
        } else if (thisObject.type == 'goal') {
            taskManager.markGoalCompletion(false, thisObject.id);
        }
        thisObject.getElementsByClassName('icon-checkmark')[0].classList.add('hidden');
        thisObject.getElementsByClassName('task-component__name')[0].classList.remove('line-through');
        thisObject.onMouseOut();
    }

    onMouseOut(event) {

        this.getElementsByClassName('done-actions')[0].classList.add('hidden');
        this.getElementsByClassName('not-done-actions')[0].classList.add('hidden');
    }

    addEvents(){
        this.addEventListener('mouseover', this.onMouseOver);
        this.addEventListener('mouseout', this.onMouseOut);
        let thisObject = this;
        this.getElementsByClassName('not-done')[0].addEventListener('click', 
            function(){ 
                thisObject.markAsNotDone(thisObject);
            });
        this.getElementsByClassName('done')[0].addEventListener('click', 
            function(){
                thisObject.markAsDone(thisObject);
            });
    }
}

class TaskManager {
    constructor(){
        this.goals = [];
        this.goalsIdentifier = 99999;
        this.tasksIdentifier = 0;

        this.totalTasks = 0;
        this.completedTasks = 0;
    }

    addGoal(name) {
        let newGoal = {
            'id': this.goalsIdentifier++, 
            'name': name, 
            'children': [],
            'done': false
        };
        this.goals.push(newGoal);

        GOALS_CONTAINER_ELEM.appendChild(new TaskComponent({'type': 'goal', 'text': name, 'id': newGoal.id}))
    }

    addTask(name, goalId) {
        let newTask = {
            'id': this.goalsIdentifier++, 
            'name': name, 
            'children': [],
            'done': false
        }

        for (var i = this.goals.length - 1; i >= 0; i--) {
            if (this.goals[i].id == goalId){
                this.goals[i].children.push(newTask);
                break;
            }
        }

        d.getElementById(goalId).getElementsByClassName('tasks-placeholder')[0].appendChild(new TaskComponent({'type': 'task', 'text': name, 'id': newTask.id, 'goalId': goalId}))
    }

    updateGoalCompletion(goal) {
        var i = goal.children.length - 1;
        for (; i >= 0; i--) {
            if (goal.children[i].done) {
                continue;
            } else {
                break;
            }
        }
        if (i == -1) {
            this.markGoalCompletion(true, goal.id);
        } else {
            this.markGoalCompletion(false, goal.id);
        }
    }

    markTaskCompletion(done, taskId, goalId) {
        for (var i = this.goals.length - 1; i >= 0; i--) {
            if (this.goals[i].id == goalId){
                for (var j = this.goals[i].children.length - 1; j >= 0; j--) {
                    if (this.goals[i].children[j].id == taskId){
                        this.goals[i].children[j].done = done;
                        this.updateGoalCompletion(this.goals[i]);
                        break;
                    }
                }
                break;
            }
        }
    }

    markGoalCompletion(done, goalId) {
        for (var i = this.goals.length - 1; i >= 0; i--) {
            if (this.goals[i].id == goalId){
                this.goals[i].done = done;
                break;
            }
        }
    }

    isTaskDone(taskId, goalId) {
        for (var i = this.goals.length - 1; i >= 0; i--) {
            if (this.goals[i].id == goalId){
                for (var j = this.goals[i].children.length - 1; j >= 0; j--) {
                    if (this.goals[i].children[j].id == taskId){
                        return this.goals[i].children[j].done;
                    }
                }
                break;
            }
        }
    }

    isGoalDone(goalId) {
        for (var i = this.goals.length - 1; i >= 0; i--) {
            if (this.goals[i].id == goalId){
                return this.goals[i].done;
            }
        }
    }

    hasTasks(goal) {
        if (goal.children.length == 0) {
            return false;
        }
        return true;
    }

    getGoal(goalId) {
        for (var i = this.goals.length - 1; i >= 0; i--) {
            if (this.goals[i].id == goalId){
                return this.goals[i];
            }
        }
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
        this.setAttribute('data-type', type);

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

        let addComponentElement = findAncestor(this, 'add-component');
        if (addComponentElement.getAttribute('data-type') == 'task') {
            let taskComponentElem = findAncestor(addComponentElement, 'task-component');
            let goalId = taskComponentElem.id;
            taskManager.addTask(newTaskName, goalId);
        } else {
            taskManager.addGoal(newTaskName);
        }
        
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
