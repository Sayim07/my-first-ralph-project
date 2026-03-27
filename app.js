// Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const taskCount = document.getElementById('task-count');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

// State
let tasks = [];
try {
    const savedTasks = localStorage.getItem('todo-tasks');
    tasks = savedTasks ? JSON.parse(savedTasks) : [];
} catch (e) {
    console.error('Error loading tasks from localStorage:', e);
    tasks = [];
}

let currentTheme = localStorage.getItem('todo-theme') || 'light-theme';

// Functions
function saveTasks() {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
}

function renderTasks() {
    todoList.innerHTML = '';
    
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="todo-content">
                <div class="checkbox" role="checkbox" aria-checked="${task.completed}" tabindex="0"></div>
                <span class="todo-text">${task.text}</span>
            </div>
            <button class="delete-btn" aria-label="Delete task">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        `;

        // Toggle event on content click
        const content = li.querySelector('.todo-content');
        content.addEventListener('click', () => toggleTask(index));
        
        // Accessibility: toggle on Enter/Space
        content.querySelector('.checkbox').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTask(index);
            }
        });

        // Delete event
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent toggling when deleting
            li.classList.add('removing');
            setTimeout(() => {
                deleteTask(index);
            }, 200); // Match CSS animation duration
        });

        todoList.appendChild(li);
    });

    updateStats();
    saveTasks();
}

function addTask(text) {
    if (text.trim() === '') return;
    
    const newTask = {
        text: text,
        completed: false
    };
    
    tasks.push(newTask);
    renderTasks();
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

function updateStats() {
    const remaining = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `${remaining} task${remaining === 1 ? '' : 's'} remaining`;
}

function applyTheme() {
    document.body.className = currentTheme;
    if (currentTheme === 'dark-theme') {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
    localStorage.setItem('todo-theme', currentTheme);
}

function toggleTheme() {
    currentTheme = currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
    applyTheme();
}

// Event Listeners
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value;
    addTask(text);
    todoInput.value = '';
    todoInput.focus();
});

themeToggle.addEventListener('click', toggleTheme);

// Initial render
applyTheme();
renderTasks();

// Sync across tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'todo-tasks') {
        try {
            tasks = JSON.parse(e.newValue) || [];
            renderTasks();
        } catch (err) {
            console.error('Error syncing tasks:', err);
        }
    }
    if (e.key === 'todo-theme') {
        currentTheme = e.newValue || 'light-theme';
        applyTheme();
    }
});
