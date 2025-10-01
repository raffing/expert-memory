// Simple password for admin access (in a real app, this should be server-side)
const ADMIN_PASSWORD = 'admin123';

// Storage key for projects
const PROJECTS_KEY = 'portfolio_projects';

// State management
let projects = [];
let isAdminLoggedIn = false;
let editingProjectId = null;

// DOM Elements
const loginModal = document.getElementById('loginModal');
const adminModal = document.getElementById('adminModal');
const loginForm = document.getElementById('loginForm');
const projectForm = document.getElementById('projectForm');
const adminBtn = document.getElementById('adminBtn');
const logoutBtn = document.getElementById('logoutBtn');
const projectsGrid = document.getElementById('projectsGrid');
const adminProjectsList = document.getElementById('adminProjectsList');
const emptyState = document.getElementById('emptyState');
const loginError = document.getElementById('loginError');
const cancelEditBtn = document.getElementById('cancelEdit');
const formTitle = document.getElementById('formTitle');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    displayProjects();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Admin button
    adminBtn.addEventListener('click', () => {
        if (isAdminLoggedIn) {
            showAdminPanel();
        } else {
            showLoginModal();
        }
    });

    // Login form
    loginForm.addEventListener('submit', handleLogin);

    // Project form
    projectForm.addEventListener('submit', handleProjectSubmit);

    // Logout button
    logoutBtn.addEventListener('click', handleLogout);

    // Cancel edit button
    cancelEditBtn.addEventListener('click', cancelEdit);

    // Modal close buttons
    document.querySelector('.close').addEventListener('click', () => {
        hideModal(loginModal);
        loginError.textContent = '';
    });

    document.querySelector('.close-admin').addEventListener('click', () => {
        hideModal(adminModal);
        resetForm();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            hideModal(loginModal);
            loginError.textContent = '';
        }
        if (e.target === adminModal) {
            hideModal(adminModal);
            resetForm();
        }
    });
}

// Load projects from localStorage
function loadProjects() {
    const stored = localStorage.getItem(PROJECTS_KEY);
    if (stored) {
        projects = JSON.parse(stored);
    } else {
        // Add some sample projects for demonstration
        projects = [
            {
                id: Date.now() + 1,
                title: 'Progetto di Esempio 1',
                description: 'Questo è un progetto di esempio per mostrare come funziona il portfolio.',
                image: 'https://via.placeholder.com/400x200/667eea/ffffff?text=Progetto+1',
                link: 'https://example.com'
            },
            {
                id: Date.now() + 2,
                title: 'Progetto di Esempio 2',
                description: 'Un altro progetto di esempio con una descrizione interessante.',
                image: 'https://via.placeholder.com/400x200/764ba2/ffffff?text=Progetto+2',
                link: 'https://example.com'
            }
        ];
        saveProjects();
    }
}

// Save projects to localStorage
function saveProjects() {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

// Display projects in public view
function displayProjects() {
    projectsGrid.innerHTML = '';
    
    if (projects.length === 0) {
        emptyState.style.display = 'block';
        projectsGrid.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        projectsGrid.style.display = 'grid';
        
        projects.forEach(project => {
            const card = createProjectCard(project);
            projectsGrid.appendChild(card);
        });
    }
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const imageUrl = project.image || 'https://via.placeholder.com/400x200/667eea/ffffff?text=No+Image';
    
    card.innerHTML = `
        ${project.image ? `<img src="${imageUrl}" alt="${project.title}" class="project-image" onerror="this.src='https://via.placeholder.com/400x200/667eea/ffffff?text=Error'">` : `<div class="project-image"></div>`}
        <div class="project-content">
            <h3 class="project-title">${escapeHtml(project.title)}</h3>
            <p class="project-description">${escapeHtml(project.description)}</p>
            ${project.link ? `<a href="${project.link}" target="_blank" class="project-link">Vedi progetto →</a>` : ''}
        </div>
    `;
    
    return card;
}

// Display projects in admin panel
function displayAdminProjects() {
    adminProjectsList.innerHTML = '';
    
    if (projects.length === 0) {
        adminProjectsList.innerHTML = '<p style="text-align: center; color: #999;">Nessun progetto disponibile.</p>';
    } else {
        projects.forEach(project => {
            const item = createAdminProjectItem(project);
            adminProjectsList.appendChild(item);
        });
    }
}

// Create admin project item
function createAdminProjectItem(project) {
    const item = document.createElement('div');
    item.className = 'admin-project-item';
    
    item.innerHTML = `
        <div class="admin-project-info">
            <h4>${escapeHtml(project.title)}</h4>
            <p>${escapeHtml(project.description.substring(0, 100))}${project.description.length > 100 ? '...' : ''}</p>
        </div>
        <div class="admin-project-actions">
            <button class="btn btn-edit" onclick="editProject(${project.id})">Modifica</button>
            <button class="btn btn-delete" onclick="deleteProject(${project.id})">Elimina</button>
        </div>
    `;
    
    return item;
}

// Show login modal
function showLoginModal() {
    loginModal.style.display = 'block';
    document.getElementById('password').value = '';
    loginError.textContent = '';
}

// Show admin panel
function showAdminPanel() {
    adminModal.style.display = 'block';
    displayAdminProjects();
    resetForm();
}

// Hide modal
function hideModal(modal) {
    modal.style.display = 'none';
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        hideModal(loginModal);
        showAdminPanel();
        adminBtn.textContent = 'Pannello Admin';
    } else {
        loginError.textContent = 'Password non corretta. Prova con "admin123"';
    }
}

// Handle logout
function handleLogout() {
    isAdminLoggedIn = false;
    hideModal(adminModal);
    adminBtn.textContent = 'Area Admin';
    resetForm();
}

// Handle project form submission
function handleProjectSubmit(e) {
    e.preventDefault();
    
    const projectData = {
        title: document.getElementById('projectTitle').value.trim(),
        description: document.getElementById('projectDescription').value.trim(),
        image: document.getElementById('projectImage').value.trim(),
        link: document.getElementById('projectLink').value.trim()
    };
    
    if (editingProjectId) {
        // Update existing project
        const index = projects.findIndex(p => p.id === editingProjectId);
        if (index !== -1) {
            projects[index] = {
                ...projects[index],
                ...projectData
            };
        }
    } else {
        // Add new project
        const newProject = {
            id: Date.now(),
            ...projectData
        };
        projects.push(newProject);
    }
    
    saveProjects();
    displayProjects();
    displayAdminProjects();
    resetForm();
}

// Edit project
function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    editingProjectId = id;
    document.getElementById('projectId').value = id;
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectDescription').value = project.description;
    document.getElementById('projectImage').value = project.image || '';
    document.getElementById('projectLink').value = project.link || '';
    
    formTitle.textContent = 'Modifica Progetto';
    cancelEditBtn.style.display = 'inline-block';
    
    // Scroll to form
    document.getElementById('projectForm').scrollIntoView({ behavior: 'smooth' });
}

// Delete project
function deleteProject(id) {
    if (confirm('Sei sicuro di voler eliminare questo progetto?')) {
        projects = projects.filter(p => p.id !== id);
        saveProjects();
        displayProjects();
        displayAdminProjects();
    }
}

// Cancel edit
function cancelEdit() {
    resetForm();
}

// Reset form
function resetForm() {
    projectForm.reset();
    editingProjectId = null;
    document.getElementById('projectId').value = '';
    formTitle.textContent = 'Aggiungi Nuovo Progetto';
    cancelEditBtn.style.display = 'none';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
