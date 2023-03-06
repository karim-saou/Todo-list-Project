/* eslint-disable max-classes-per-file */
const projectsList = [];
const inbox = [];
class TodosFactory {
  constructor(title, todoId) {
    this.title = title;
    this.todoId = todoId;
  }
}

class ProjectFactory {
  constructor(title, id) {
    this.title = title;
    this.id = id;
    this.tasks = [];
  }

  addTodoTask(title, todoId) {
    const todo = new TodosFactory(title, todoId);
    this.tasks.push(todo);
  }

  // addToProjectList(list) {
  //   if (!list.some((project) => project.title === this.title)) {
  //     list.push(this);
  //   }
  // }

  // deleteFromProjectList(list) {
  //   list.splice(list.indexOf(this), 1);
  // }
}

export default function addProjectToProjectsList(title) {
  const project = new ProjectFactory(title, Date.now().toString());
  console.log('project created');
  projectsList.push(project);
  console.log(projectsList);
}

export function deleteProjectFromProjectsList(projectId) {
  projectsList.forEach((project) => {
    if (project.id === projectId) {
      projectsList.splice(projectsList.indexOf(project), 1);
      console.log(projectsList);
    }
  });
}

export function getProjectList() {
  return projectsList;
}

export function getInbox() {
  return inbox;
}

export function addTaskToInbox(inboxList, taskName) {
  const task = new TodosFactory(taskName, Date.now().toString());
  inboxList.push(task);
}

export function addTodoTask(project, title) {
  project.addTodoTask(title, Date.now().toString());
}
