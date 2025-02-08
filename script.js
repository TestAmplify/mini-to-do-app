document.addEventListener('DOMContentLoaded', function () {
    const authSection = document.getElementById('authSection');
    const todoSection = document.getElementById('todoSection');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const datePicker = document.getElementById('datePicker');
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const historyList = document.getElementById('historyList');
    const authErrorMessage = document.getElementById('authErrorMessage');
  
    let currentUser = null;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
    // Show To-Do Section if User is Logged In
    function checkAuth() {
      if (currentUser) {
        authSection.classList.add('hidden');
        todoSection.classList.remove('hidden');
        renderTasks();
        renderHistory();
      } else {
        authSection.classList.remove('hidden');
        todoSection.classList.add('hidden');
      }
    }
  
    // Login Functionality
    loginBtn.addEventListener('click', function () {
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
  
      const user = users.find(u => u.username === username && u.password === password);
  
      if (user) {
        // Clear any previous error message
        authErrorMessage.textContent = '';
        authErrorMessage.classList.add('hidden');
        currentUser = user;
        checkAuth();
      } else {
        authErrorMessage.textContent = 'Invalid username or password';
        authErrorMessage.classList.remove('hidden');
      }
    });
  
    // Signup Functionality
    signupBtn.addEventListener('click', function () {
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
  
      if (username && password) {
        const userExists = users.some(u => u.username === username);
        if (userExists) {
          authErrorMessage.textContent = 'Username already exists';
          authErrorMessage.classList.remove('hidden');
        } else {
          const newUser = { username, password };
          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
  
          authErrorMessage.textContent = 'Account created successfully! You are now logged in.';
          authErrorMessage.classList.remove('hidden');
          currentUser = newUser;
          checkAuth();
        }
      } else {
        authErrorMessage.textContent = 'Please enter a username and password';
        authErrorMessage.classList.remove('hidden');
      }
    });
  
    // Logout Functionality
    logoutBtn.addEventListener('click', function () {
      currentUser = null;
      checkAuth();
    });
  
    // Render Tasks for Selected Date
    function renderTasks() {
      if (!currentUser) return;
  
      const selectedDate = datePicker.value;
      const filteredTasks = tasks.filter(
        task => task.date === selectedDate && task.username === currentUser.username
      );
  
      taskList.innerHTML = '';
  
      filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
  
        li.innerHTML = `
          <span>${task.text}</span>
          <div class="task-buttons">
            <button class="complete-btn">${task.completed ? 'Undo' : 'Complete'}</button>
            <button class="delete-btn">Delete</button>
          </div>
        `;
  
        // Attach event listeners to the buttons
        const completeBtn = li.querySelector('.complete-btn');
        const deleteBtn = li.querySelector('.delete-btn');
  
        completeBtn.addEventListener('click', () => toggleComplete(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
  
        taskList.appendChild(li);
      });
  
      updateProgress(filteredTasks);
    }
  
    // Update Progress Bar
    function updateProgress(filteredTasks) {
      const totalTasks = filteredTasks.length;
      const completedTasks = filteredTasks.filter(task => task.completed).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;
    }
  
    // Add a New Task
    function addTask() {
      console.log('addTask function called'); // Debug
  
      if (!currentUser) {
        console.log('No current user, returning...');
        return;
      }
  
      const taskText = taskInput.value.trim();
      const selectedDate = datePicker.value;
  
      if (taskText === '') {
        alert('Please enter a task!');
        console.log('Task text is empty');
        return;
      }
      if (!selectedDate) {
        alert('Please select a date!');
        console.log('No date selected');
        return;
      }
  
      console.log('Creating new task with text:', taskText, 'and date:', selectedDate);
  
      const newTask = {
        id: Date.now(),
        username: currentUser.username,
        date: selectedDate,
        text: taskText,
        completed: false,
      };
  
      tasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      console.log('New task added to localStorage:', newTask);
  
      taskInput.value = '';
      renderTasks();
      renderHistory();
    }
  
    // Toggle Task Completion (using task ID)
    function toggleComplete(taskId) {
      const taskIndex = tasks.findIndex(
        t => t.id === taskId && t.username === currentUser.username
      );
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        renderHistory();
      }
    }
  
    // Delete a Task (using task ID)
    function deleteTask(taskId) {
      if (confirm('Are you sure you want to delete this task?')) {
        const taskIndex = tasks.findIndex(
          t => t.id === taskId && t.username === currentUser.username
        );
        if (taskIndex !== -1) {
          tasks.splice(taskIndex, 1);
          localStorage.setItem('tasks', JSON.stringify(tasks));
          renderTasks();
          renderHistory();
        }
      }
    }
  
    // Clear All Tasks for Selected Date
    clearAllBtn.addEventListener('click', function () {
      if (!currentUser) return;
      if (confirm('Are you sure you want to clear all tasks for this date?')) {
        const selectedDate = datePicker.value;
        tasks = tasks.filter(
          task => !(task.date === selectedDate && task.username === currentUser.username)
        );
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        renderHistory();
      }
    });
  
    // Render Daily History
    function renderHistory() {
      if (!currentUser) return;
      const userTasks = tasks.filter(task => task.username === currentUser.username);
      const history = {};
  
      userTasks.forEach(task => {
        if (!history[task.date]) {
          history[task.date] = { total: 0, completed: 0 };
        }
        history[task.date].total++;
        if (task.completed) {
          history[task.date].completed++;
        }
      });
  
      historyList.innerHTML = '';
      for (const date in history) {
        const li = document.createElement('li');
        li.textContent = `${date}: ${history[date].completed}/${history[date].total} tasks completed`;
        historyList.appendChild(li);
      }
    }
  
    // Add Task on Button Click
    addTaskBtn.addEventListener('click', addTask);
  
    // Add Task on Enter Key
    taskInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        addTask();
      }
    });
  
    // Render Tasks When Date Changes
    datePicker.addEventListener('change', renderTasks);
  
    // Initial Check for Authentication
    checkAuth();
  });