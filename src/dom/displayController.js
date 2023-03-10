import { parse, parseISO, isSameDay, format, getISOWeek } from 'date-fns';
import addProjectToProjectsList, {
  addTaskToInbox,
  addTodoTask,
  deleteProjectFromProjectsList,
  getInbox,
  getProjectList,
  setTodoTask,
  updateLocalStorage,
} from '../logic/logicController';
import projectImg from '../assets/project-img.svg';
import removeImg from '../assets/close-small-svgrepo-com.svg';
import settingImg from '../assets/setting-svgrepo-com.svg';
import taskImg from '../assets/task-svgrepo-com.svg';

const projectsDiv = document.querySelector('.projects-list');

const itemTitle = document.querySelector('.container #plan-item-title');

function createProjectInDom(title, projectId) {
  const projectContainer = document.createElement('div');
  projectContainer.classList.add('wrapper');
  projectContainer.dataset.projectId = projectId;

  const projectIcon = document.createElement('img');
  projectIcon.src = projectImg;
  projectIcon.classList.add('.project-icon');
  const projectTitle = document.createElement('h3');
  projectTitle.textContent = title;
  const removeIcon = document.createElement('img');
  removeIcon.src = removeImg;
  removeIcon.classList.add('close-icon');

  projectContainer.append(projectIcon, projectTitle, removeIcon);
  projectsDiv.appendChild(projectContainer);
}

function renderProjects() {
  projectsDiv.innerHTML = '';

  const projects = getProjectList();
  projects.forEach((project) => {
    createProjectInDom(project.title, project.id);
  });
}

function createModal(clss, labelText, addBtnId, cancelBtnId) {
  const modalContainer = document.createElement('div');
  modalContainer.classList.add(clss);

  const modalLabel = document.createElement('label');
  modalLabel.textContent = labelText;

  const modalInput = document.createElement('input');
  modalInput.id = 'modal-title';

  const btnContainer = document.createElement('div');
  btnContainer.classList.add('btn-container');

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add';
  addBtn.id = addBtnId;

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.id = cancelBtnId;

  btnContainer.append(addBtn, cancelBtn);
  modalContainer.append(modalLabel, modalInput, btnContainer);

  return modalContainer;
}

function createAddProjectModal() {
  return createModal('modal', 'Write Project name', 'add-btn', 'cancel-btn');
}

function createAddTaskModal() {
  const modal = createModal(
    'task-modal',
    'Enter Task name',
    'add-task-btn',
    'cancel-task-btn'
  );
  const btnContainer = modal.querySelector('.btn-container');

  const dueDateLabel = document.createElement('label');
  dueDateLabel.textContent = 'Due Date: ';

  const dueDateCalendar = document.createElement('input');
  dueDateCalendar.type = 'date';

  modal.insertBefore(dueDateLabel, btnContainer);
  modal.insertBefore(dueDateCalendar, btnContainer);

  const priorityLabel = document.createElement('label');
  priorityLabel.textContent = 'Priority: ';
  priorityLabel.htmlFor = 'priority';

  const select = document.createElement('select');
  select.id = 'priority';
  const topOption = document.createElement('option');
  topOption.value = 'top';
  topOption.textContent = 'Top';
  const mediumOption = document.createElement('option');
  mediumOption.value = 'medium';
  mediumOption.textContent = 'Medium';
  const lowOption = document.createElement('option');
  lowOption.value = 'low';
  lowOption.textContent = 'Low';
  select.append(topOption, mediumOption, lowOption);

  modal.insertBefore(priorityLabel, btnContainer);
  modal.insertBefore(select, btnContainer);

  const descLabel = document.createElement('label');
  descLabel.htmlFor = 'description';

  const descArea = document.createElement('textarea');
  descArea.id = 'description';

  modal.insertBefore(descLabel, btnContainer);
  modal.insertBefore(descArea, btnContainer);

  return modal;
}

function createUpdateTaskModal() {
  const modal = createAddTaskModal();
  modal.classList.remove('task-modal');
  modal.classList.add('update-task-modal');
  const updateBtn = modal.querySelector('#add-task-btn');
  updateBtn.textContent = 'Update';
  updateBtn.id = 'update-task-btn';
  const cancelUpdateBtn = modal.querySelector('#cancel-task-btn');
  cancelUpdateBtn.id = 'cancel-update-task-btn';

  return modal;
}

function resetModalInputs(modalSelector) {
  const modal = document.querySelector(modalSelector);
  const inputs = Array.from(modal.querySelectorAll('input,textarea'));
  inputs.forEach((input) => {
    // eslint-disable-next-line no-param-reassign
    input.value = '';
  });
}

function displayModal(selector, createFunction) {
  let modal = document.querySelector(selector);
  if (modal === null) {
    modal = createFunction();
    document.querySelector('body').appendChild(modal);
  }
  modal.style.display = 'flex';
}

function displayProjectModal() {
  displayModal('.modal', createAddProjectModal);
}

function displayTaskModal() {
  displayModal('.task-modal', createAddTaskModal);
}

function displayUpdateTaskModal() {
  displayModal('.update-task-modal', createUpdateTaskModal);
}

function changeDisplay(selector, display) {
  document.querySelector(selector).style.display = display;
}

function changeTaskDisplay(display, target) {
  const taskDataId = target.parentElement.parentElement.dataset.taskId;
  const taskDetailsDisplay = document.querySelector(`#detail-${taskDataId}`)
    .style.display;

  // eslint-disable-next-line no-unused-expressions
  taskDetailsDisplay === display
    ? changeDisplay(`#detail-${taskDataId}`, 'none')
    : changeDisplay(`#detail-${taskDataId}`, display);
}

function cancelAdding(selector) {
  changeDisplay(selector, 'none');
}

function addProject() {
  const projectName = document.querySelector('.modal input').value;
  if (projectName != null && projectName !== '') {
    addProjectToProjectsList(projectName);
  }
}

function deleteProject(closeIcon) {
  const { projectId } = closeIcon.parentElement.dataset;
  deleteProjectFromProjectsList(projectId);
}

/* manage active state */
function switchItemActiveState(items, target) {
  items.forEach((item) => {
    item.classList.remove('active');
  });
  target.classList.add('active');
}

function getSelectedItemName(items) {
  let selectedItemName;
  items.forEach((item) => {
    if (
      item.classList.contains('active') &&
      !item.hasAttribute('data-project-id')
    ) {
      selectedItemName = item.lastElementChild.textContent;
    } else if (
      item.classList.contains('active') &&
      item.hasAttribute('data-project-id')
    ) {
      selectedItemName = item.querySelector('h3').textContent;
    }
  });
  return selectedItemName;
}

function changeItemTitle(items, itmTitle) {
  const selectedName = getSelectedItemName(items);
  if (selectedName == null) return;
  // eslint-disable-next-line no-param-reassign
  itmTitle.textContent = selectedName;
}

function switchSidebarOptions(selector, target) {
  switchItemActiveState(
    Array.from(document.querySelectorAll(selector, target)),
    target
  );
  changeItemTitle(
    Array.from(document.querySelectorAll(selector, target)),
    itemTitle
  );
}

function resetActiveSate() {
  const sideBarOptions = Array.from(
    document.querySelectorAll('.plan-items .wrapper, [data-project-id]')
  );
  const projects = Array.from(document.querySelectorAll('[data-project-id]'));

  if (projects.length === 0) {
    const upperSideBarOptions = Array.from(
      document.querySelectorAll('.plan-items .wrapper')
    );
    switchItemActiveState(upperSideBarOptions, upperSideBarOptions[0]);
    changeItemTitle(upperSideBarOptions, itemTitle);
  } else {
    switchItemActiveState(sideBarOptions, projects[projects.length - 1]);
    changeItemTitle(projects, itemTitle);
  }
}

function addTask() {
  const taskTitle = document.querySelector('.task-modal #modal-title').value;
  const taskDate = document.querySelector('.task-modal [type="date"]').value;

  const taskPriority = document.querySelector('.task-modal #priority').value;
  const taskDesc = document.querySelector('.task-modal #description').value;

  const projectName = document.querySelector('#plan-item-title').textContent;
  const projectsList = getProjectList();

  if (taskTitle == null || taskTitle === '') return;
  if (
    projectName === 'Inbox' ||
    projectName === 'Today' ||
    projectName === 'This week'
  ) {
    const inbox = getInbox();
    addTaskToInbox(inbox, taskTitle, taskDate, taskPriority, taskDesc);
    updateLocalStorage('inbox', inbox);
    return;
  }
  projectsList.forEach((project) => {
    if (project.title === projectName) {
      addTodoTask(project, taskTitle, taskDate, taskPriority, taskDesc);
    }
  });
  updateLocalStorage('projects-list', projectsList);
}

function deleteTask(target) {
  const task = target.parentElement.parentElement.parentElement;
  const { taskId } = task.dataset;
  const sectionTitle = document.querySelector('#plan-item-title').textContent;
  const projects = getProjectList();

  if (sectionTitle === 'Inbox') {
    const inbox = getInbox();
    inbox.forEach((todoTask) => {
      if (todoTask.todoId === taskId) {
        inbox.splice(inbox.indexOf(todoTask), 1);
      }
    });
    updateLocalStorage('inbox', inbox);
    return;
  }

  projects.forEach((project) => {
    if (project.title === sectionTitle) {
      project.tasks.forEach((todoTask) => {
        if (todoTask.todoId === taskId) {
          project.tasks.splice(project.tasks.indexOf(todoTask), 1);
        }
      });
    }
  });
  updateLocalStorage('projects-list', projects);
}

function getTaskData(listType, taskId) {
  const data = [];
  if (listType === 'project') {
    const projects = getProjectList();
    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        if (task.todoId === taskId) {
          data.push(task.title);
          data.push(task.dueDate);
          data.push(task.priority);
          data.push(task.description);
        }
      });
    });
  } else {
    const inbox = getInbox();
    inbox.forEach((task) => {
      if (task.todoId === taskId) {
        data.push(task.title);
        data.push(task.dueDate);
        data.push(task.priority);
        data.push(task.description);
      }
    });
  }

  return data;
}

function fillUpdateTaskModal(target) {
  const modal = document.querySelector('.update-task-modal');
  const taskTitle = modal.querySelector('#modal-title');
  const taskDueDate = modal.querySelector('[type="date"]');
  const taskPriority = modal.querySelector('select');
  const taskDesc = modal.querySelector('textarea');
  const targetTask = target.parentElement.parentElement.parentElement;
  const targetTaskId = targetTask.dataset.taskId;
  const sectionTitle = document.querySelector('#plan-item-title').textContent;

  if (sectionTitle === 'Inbox') {
    const [title, dueDate, priority, description] = getTaskData(
      'inbox',
      targetTaskId
    );
    taskTitle.value = title;
    taskDueDate.value = dueDate;
    taskPriority.value = priority;
    taskDesc.value = description;
  } else {
    const [title, dueDate, priority, description] = getTaskData(
      'project',
      targetTaskId
    );
    taskTitle.value = title;
    taskDueDate.value = dueDate;
    taskPriority.value = priority;
    taskDesc.value = description;
  }
}

function updateTask(target) {
  const targetTask = target.parentElement.parentElement.parentElement;
  const targetTaskId = targetTask.dataset.taskId;
  const sectionTitle = document.querySelector('#plan-item-title').textContent;
  const modal = document.querySelector('.update-task-modal');
  const taskTitle = modal.querySelector('#modal-title').value;
  const taskDueDate = modal.querySelector('[type="date"]').value;
  const taskPriority = modal.querySelector('select').value;
  const taskDesc = modal.querySelector('textarea').value;
  const projects = getProjectList();

  if (sectionTitle === 'Inbox') {
    const inbox = getInbox();
    inbox.forEach((task) => {
      if (task.todoId === targetTaskId) {
        // eslint-disable-next-line no-param-reassign
        task.setTodoTask = setTodoTask;
        task.setTodoTask(taskTitle, taskDueDate, taskPriority, taskDesc);
      }
    });
    updateLocalStorage('inbox', inbox);
    return;
  }
  projects.forEach((project) => {
    project.tasks.forEach((task) => {
      if (task.todoId === targetTaskId) {
        // eslint-disable-next-line no-param-reassign
        task.setTodoTask = setTodoTask;
        task.setTodoTask(taskTitle, taskDueDate, taskPriority, taskDesc);
      }
    });
  });
  updateLocalStorage('projects-list', projects);
}

function createTaskInDom(name, id, dueDate, priority, description) {
  // Handle empty date entry
  let formattedDate;
  if (dueDate !== '') {
    // to convert duDate form 'yyyy-MM-dd' format to 'MM-dd-yyyy' format
    const date = parse(dueDate, 'yyyy-MM-dd', new Date());
    formattedDate = format(date, 'MM-dd-yyyy');
  } else {
    formattedDate = 'No date';
  }

  const taskContainer = document.createElement('div');
  taskContainer.classList.add('task');
  taskContainer.dataset.taskId = id;

  const taskHeader = document.createElement('div');
  taskHeader.classList.add('task-header');

  const taskIcon = document.createElement('img');
  taskIcon.src = taskImg;

  const taskTitle = document.createElement('h3');
  taskTitle.textContent = name;

  const taskDate = document.createElement('p');
  taskDate.classList.add('task-due-date');
  taskDate.textContent = `Date: ${formattedDate}`;

  const taskPriority = document.createElement('p');
  taskPriority.classList.add('task-priority');
  taskPriority.textContent = `Priority: ${priority}`;

  const taskSettingIcon = document.createElement('img');
  taskSettingIcon.src = settingImg;
  taskSettingIcon.classList.add('setting-icon');

  taskHeader.append(
    taskIcon,
    taskTitle,
    taskDate,
    taskPriority,
    taskSettingIcon
  );

  const taskDetails = document.createElement('div');
  taskDetails.classList.add('task-details');
  taskDetails.id = `detail-${id}`;

  const descTitle = document.createElement('h4');
  descTitle.classList.add('task-description-title');
  descTitle.textContent = 'Description: ';

  const taskDesc = document.createElement('p');
  taskDesc.classList.add('task-description');
  taskDesc.textContent = description;

  const btnsContainer = document.createElement('div');
  btnsContainer.classList.add('task-btns-container');

  const editTaskBtn = document.createElement('button');
  editTaskBtn.textContent = 'Edit';
  editTaskBtn.classList.add('edit-task-btn');

  const removeTaskBtn = document.createElement('button');
  removeTaskBtn.textContent = 'Remove';
  removeTaskBtn.classList.add('remove-task-btn');

  btnsContainer.append(editTaskBtn, removeTaskBtn);

  taskDetails.append(descTitle, taskDesc, btnsContainer);

  taskContainer.append(taskHeader, taskDetails);

  return taskContainer;
}

function getAllTasks() {
  const inbox = getInbox();
  const projectTasks = [];
  const projects = getProjectList();
  projects.forEach((project) => {
    project.tasks.forEach((task) => {
      projectTasks.push(task);
    });
  });

  return [...inbox, ...projectTasks];
}

function getTodayTasks() {
  const allTasks = getAllTasks();
  const todayTasks = [];

  const todayDate = new Date();
  allTasks.forEach((task) => {
    const taskDate = parseISO(task.dueDate);
    if (isSameDay(taskDate, todayDate)) {
      todayTasks.push(task);
    }
  });

  return todayTasks;
}

function getWeekTasks() {
  const allTasks = getAllTasks();
  const weekTasks = [];

  const currentWeekNumber = getISOWeek(new Date());
  allTasks.forEach((task) => {
    const taskWeekNumber = getISOWeek(new Date(task.dueDate));
    if (currentWeekNumber === taskWeekNumber) {
      weekTasks.push(task);
    }
  });

  return weekTasks;
}

function taskBtnsHidder() {
  const btnsContainers = Array.from(
    document.querySelectorAll('.task .task-btns-container')
  );
  btnsContainers.forEach((btnContainer) => {
    // eslint-disable-next-line no-param-reassign
    btnContainer.style.display = 'none';
  });
}

function renderTasks() {
  const tasksSection = document.querySelector('.projects-tasks-section');
  const sideBarOptionTitle =
    document.querySelector('#plan-item-title').textContent;

  const projectsList = getProjectList();

  tasksSection.innerHTML = '';

  if (sideBarOptionTitle === 'Inbox') {
    const inbox = getInbox();
    inbox.forEach((task) => {
      const taskTodo = createTaskInDom(
        task.title,
        task.todoId,
        task.dueDate,
        task.priority,
        task.description
      );
      tasksSection.appendChild(taskTodo);
    });
    return;
  }
  if (sideBarOptionTitle === 'Today') {
    const todayTasks = getTodayTasks();
    todayTasks.forEach((task) => {
      const taskTodo = createTaskInDom(
        task.title,
        task.todoId,
        task.dueDate,
        task.priority,
        task.description
      );
      tasksSection.appendChild(taskTodo);
      taskBtnsHidder(); // hide edit remove btns to make today and this week display only tasks
    });
    return;
  }

  if (sideBarOptionTitle === 'This week') {
    const weekTasks = getWeekTasks();
    weekTasks.forEach((task) => {
      const taskTodo = createTaskInDom(
        task.title,
        task.todoId,
        task.dueDate,
        task.priority,
        task.description
      );
      tasksSection.appendChild(taskTodo);
      taskBtnsHidder(); // hide edit remove btns to make today and this week display only tasks
    });
    return;
  }
  projectsList.forEach((project) => {
    if (project.title === sideBarOptionTitle) {
      project.tasks.forEach((task) => {
        const taskTodo = createTaskInDom(
          task.title,
          task.todoId,
          task.dueDate,
          task.priority,
          task.description
        );
        tasksSection.appendChild(taskTodo);
      });
    }
  });
}

function updatePriorityBg() {
  const priorities = document.querySelectorAll('.task-priority');
  if (priorities == null) return;
  const prioritiesList = Array.from(priorities);
  prioritiesList.forEach((priority) => {
    const text = priority.textContent.slice(10);
    priority.classList.remove('top');
    priority.classList.remove('medium');
    priority.classList.remove('low');

    if (text === 'top') priority.classList.add('top');
    else if (text === 'medium') priority.classList.add('medium');
    else priority.classList.add('low');
  });
}

function globalEventsHandler() {
  document.addEventListener('click', (e) => {
    // Manage active states and switches of inbox, today and this week
    if (e.target.matches('.plan-items .wrapper')) {
      switchSidebarOptions('.plan-items .wrapper, [data-project-id]', e.target);
      renderTasks();
      updatePriorityBg();
    }
    if (e.target.matches('.plan-items .wrapper *')) {
      // added to make sure event will start if child element was pressed
      switchSidebarOptions(
        '.plan-items .wrapper, [data-project-id]',
        e.target.parentElement
      );
      renderTasks();
      updatePriorityBg();
    }
    // Handle add projects button events
    if (
      e.target.matches('#add-project') ||
      e.target.matches('#add-project *')
    ) {
      displayProjectModal();
      resetModalInputs('.modal');
      // renderTasks();
    }
    // Handle cancel button events in AddProject modal
    if (e.target.matches('#cancel-btn')) {
      cancelAdding('.modal');
    }
    // Handle add button events in AddProject Modal
    if (e.target.matches('#add-btn')) {
      addProject();
      changeDisplay('.modal', 'none');
      renderProjects();
      resetActiveSate();
      renderTasks();
    }
    // Handle close icon events in project's div
    if (e.target.matches('.close-icon')) {
      deleteProject(e.target);
      renderProjects();
      resetActiveSate();
      renderTasks();
      updatePriorityBg();
    }
    // Manage active states changes of projects
    if (e.target.matches('[data-project-id]')) {
      switchSidebarOptions('.plan-items .wrapper, [data-project-id]', e.target);
      renderTasks();
      updatePriorityBg();
    }
    if (e.target.matches('[data-project-id] .project-icon, h3')) {
      // added to make sure event will start if child element was pressed,
      // I avoided wild selector * to prevent conflict between switchSidebarOptions() and resetActiveState()
      switchSidebarOptions(
        '.plan-items .wrapper, [data-project-id]',
        e.target.parentElement
      );
      renderTasks();
      updatePriorityBg();
    }
    // Handle Add task button's events
    if (e.target.matches('.add-task, .add-task *')) {
      displayTaskModal();
      resetModalInputs('.task-modal');
      // updatePriorityBg();
    }
    // Handle cancel adding task event
    if (e.target.matches('#cancel-task-btn')) {
      cancelAdding('.task-modal');
    }
    // Handle add task events
    if (e.target.matches('#add-task-btn')) {
      addTask();
      renderTasks();
      changeDisplay('.task-modal', 'none');
      updatePriorityBg();
    }
    // Handle task's setting icon event
    if (e.target.matches('.setting-icon')) {
      changeTaskDisplay('flex', e.target);
    }
    // Handle task remove button
    if (e.target.matches('.remove-task-btn')) {
      deleteTask(e.target);
      renderTasks();
      updatePriorityBg();
    }
    // Handle edit task button
    if (e.target.matches('.edit-task-btn')) {
      displayUpdateTaskModal();
      fillUpdateTaskModal(e.target);

      // Handle update edit task button
      const updateBtn = document.querySelector('#update-task-btn');
      updateBtn.addEventListener('click', () => {
        updateTask(e.target);
        renderTasks();
        changeDisplay('.update-task-modal', 'none');
        updatePriorityBg();
      });
    }
    // Handle cancel edit task button
    if (e.target.matches('#cancel-update-task-btn')) {
      cancelAdding('.update-task-modal');
    }
  });
  // When page load
  renderProjects();
  renderTasks();
  updatePriorityBg();
}

export default function displayController() {
  globalEventsHandler();
}
