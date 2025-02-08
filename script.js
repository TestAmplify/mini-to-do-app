document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
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

    // Modal elements
    const confirmModal = document.getElementById('confirmModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalYesBtn = document.getElementById('modalYesBtn');
    const modalNoBtn = document.getElementById('modalNoBtn');

    // Retrieve stored data
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // -----------------------------
    // Modal Utility Functions
    // -----------------------------
    function showConfirmModal(message, yesCallback, noCallback) {
        modalMessage.textContent = message;
        confirmModal.classList.remove('hidden');
        confirmModal.classList.add('show');

        modalYesBtn.onclick = () => {
            hideConfirmModal();
            yesCallback();
        };

        modalNoBtn.onclick = () => {
            hideConfirmModal();
            if (noCallback) noCallback();
        };
    }

    function hideConfirmModal() {
        confirmModal.classList.remove('show');
        confirmModal.classList.add('hidden');
    }

    // -----------------------------
    // Authentication Functions
    // -----------------------------
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
    loginBtn.onclick = function () {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'index.html';
        } else {
            authErrorMessage.innerText = 'Invalid username or password';
            authErrorMessage.classList.remove('hidden');
        }
    };

    // Signup Functionality
    signupBtn.onclick = function () {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (users.find(u => u.username === username)) {
            authErrorMessage.innerText = 'Username already exists';
            authErrorMessage.classList.remove('hidden');
        } else {
            const newUser = { username, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            alert('Sign up successful! You can now log in.');
        }
    };

    // Logout Functionality
    logoutBtn.addEventListener('click', function () {
        currentUser = null;
        localStorage.removeItem('currentUser');
        checkAuth();
    });

    // -----------------------------
    // Task / To-Do Functions
    // -----------------------------
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
            const completeBtn = li.querySelector('.complete-btn');
            const deleteBtn = li.querySelector('.delete-btn');

            completeBtn.addEventListener('click', () => toggleComplete(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            taskList.appendChild(li);
        });

        updateProgress(filteredTasks);
    }

    function updateProgress(filteredTasks) {
        const totalTasks = filteredTasks.length;
        const completedTasks = filteredTasks.filter(task => task.completed).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
    }

    function addTask() {
        if (!currentUser) {
            console.log('No current user, returning...');
            return;
        }

        const taskText = taskInput.value.trim();
        const selectedDate = datePicker.value;

        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }
        if (!selectedDate) {
            alert('Please select a date!');
            return;
        }

        const newTask = {
            id: Date.now(),
            username: currentUser.username,
            date: selectedDate,
            text: taskText,
            completed: false,
        };

        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        taskInput.value = '';
        renderTasks();
        renderHistory();
    }

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Deletion / Confirmation
    function deleteTask(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId && task.username === currentUser.username);
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
            renderHistory();
        }
    }

    clearAllBtn.addEventListener('click', function () {
        if (!currentUser) return;
        showConfirmModal('Are you sure you want to clear all tasks for this date?', () => {
            const selectedDate = datePicker.value;
            tasks = tasks.filter(
                task => !(task.date === selectedDate && task.username === currentUser.username)
            );
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
            renderHistory();
        });
    });

    // History
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

    // Toggle Task Completion
    function toggleComplete(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId && task.username === currentUser.username);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
            renderHistory();
        }
    }

    datePicker.addEventListener('change', renderTasks);

    // Initial check on page load
    checkAuth();
});
