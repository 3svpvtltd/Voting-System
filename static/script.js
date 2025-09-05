// Application State
let projects = [];
let userVotes = new Set();
let currentPage = 'home';

// Demo data for initial state
const demoProjects = [
    {
        id: 1,
        title: "AI-Powered Code Assistant",
        description: "An intelligent coding companion that helps developers write better code with real-time suggestions and automated refactoring.",
        link: "https://github.com/demo/ai-assistant",
        author: "Sarah Chen",
        votes: 87
    },
    {
        id: 2,
        title: "EcoTrack - Carbon Footprint Monitor",
        description: "Mobile app that tracks daily activities and calculates carbon footprint with personalized recommendations for sustainable living.",
        link: "https://github.com/demo/ecotrack",
        author: "Marcus Johnson",
        votes: 72
    },
    {
        id: 3,
        title: "VirtualMeet - 3D Video Conferencing",
        description: "Next-generation video conferencing platform with 3D avatars and immersive virtual meeting rooms.",
        link: "https://github.com/demo/virtualmeet",
        author: "Elena Rodriguez",
        votes: 95
    },
    {
        id: 4,
        title: "HealthSync - Medical Data Integration",
        description: "Secure platform that consolidates medical records from multiple healthcare providers using blockchain technology.",
        link: "https://github.com/demo/healthsync",
        author: "Dr. James Wilson",
        votes: 63
    }
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadProjects();
});

function initializeApp() {
    // Load demo data
    projects = [...demoProjects];
    
    // Show home page by default
    showPage('home');
    updateStats();
}

function setupEventListeners() {
    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.dataset.page;
            showPage(page);
            updateNavigation(page);
        });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('show');
    });

    // Upload form
    const uploadForm = document.getElementById('uploadForm');
    uploadForm.addEventListener('submit', handleUploadSubmit);

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            navMenu.classList.remove('show');
        }
    });
}

function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Show selected page
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageName;

        // Load page-specific content
        if (pageName === 'home') {
            renderProjects();
        } else if (pageName === 'results') {
            renderResults();
        }
    }
}

function updateNavigation(activePage) {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === activePage) {
            btn.classList.add('active');
        }
    });

    // Close mobile menu
    document.getElementById('navMenu').classList.remove('show');
}

function loadProjects() {
    // In a real app, this would fetch from your Flask backend
    // fetch('/api/projects').then(response => response.json()).then(data => { ... })
    
    renderProjects();
    updateStats();
}

function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    const emptyState = document.getElementById('emptyState');

    if (projects.length === 0) {
        projectsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    projectsGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    projectsGrid.innerHTML = projects.map((project, index) => `
        <div class="project-card stagger-${Math.min(index + 1, 5)}">
            <div class="project-header">
                <h3 class="project-title">${escapeHtml(project.title)}</h3>
                <div class="vote-count">
                    <i class="fas fa-heart"></i>
                    <span>${project.votes}</span>
                </div>
            </div>

            <p class="project-description">${escapeHtml(project.description)}</p>

            <div class="project-meta">
                <div class="project-author">
                    <div class="author-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <span class="author-name">${escapeHtml(project.author)}</span>
                </div>
                
                ${project.link ? `
                    <a href="${escapeHtml(project.link)}" target="_blank" rel="noopener noreferrer" class="project-link">
                        <span>View</span>
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : ''}
            </div>

            <button 
                class="vote-btn ${userVotes.has(project.id) ? 'voted' : 'primary'}" 
                onclick="handleVote(${project.id})"
                ${userVotes.has(project.id) ? 'disabled' : ''}
            >
                <i class="fas fa-${userVotes.has(project.id) ? 'check' : 'thumbs-up'}"></i>
                <span>${userVotes.has(project.id) ? 'Voted' : 'Vote'}</span>
            </button>
        </div>
    `).join('');

    // Add stagger animation
    const cards = projectsGrid.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 150}ms`;
    });
}

function renderResults() {
    const leaderboard = document.getElementById('leaderboard');
    const emptyState = document.getElementById('resultsEmptyState');

    if (projects.length === 0) {
        leaderboard.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    leaderboard.style.display = 'flex';
    emptyState.style.display = 'none';

    // Sort projects by votes
    const sortedProjects = [...projects].sort((a, b) => b.votes - a.votes);
    const maxVotes = sortedProjects[0]?.votes || 1;

    leaderboard.innerHTML = sortedProjects.map((project, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
        const progressWidth = (project.votes / maxVotes) * 100;

        return `
            <div class="leaderboard-item ${rankClass} stagger-${Math.min(index + 1, 5)}">
                <div class="leaderboard-content">
                    <div class="rank-icon ${rankClass}">
                        ${rank === 1 ? '<i class="fas fa-crown"></i>' : 
                          rank === 2 ? '<i class="fas fa-medal"></i>' : 
                          rank === 3 ? '<i class="fas fa-award"></i>' : 
                          `#${rank}`}
                    </div>

                    <div class="project-info">
                        <h3>${escapeHtml(project.title)}</h3>
                        <p>${escapeHtml(project.description)}</p>
                        <div class="project-footer">
                            <div class="project-author">
                                <div class="author-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <span class="author-name">${escapeHtml(project.author)}</span>
                            </div>
                            
                            ${project.link ? `
                                <a href="${escapeHtml(project.link)}" target="_blank" rel="noopener noreferrer" class="project-link">
                                    <span>View</span>
                                    <i class="fas fa-external-link-alt"></i>
                                </a>
                            ` : ''}
                        </div>
                    </div>

                    <div class="vote-section">
                        <div class="vote-number" data-target="${project.votes}">0</div>
                        <div class="vote-label">votes</div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${progressWidth}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Animate vote counters
    setTimeout(() => {
        animateCounters();
    }, 300);

    // Update stats
    updateResultsStats();
}

function animateCounters() {
    const counters = document.querySelectorAll('.vote-number');
    counters.forEach((counter, index) => {
        const target = parseInt(counter.dataset.target);
        let current = 0;
        const increment = Math.max(1, Math.ceil(target / 30));
        
        setTimeout(() => {
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = current;
            }, 50);
        }, index * 100);
    });
}

function updateStats() {
    const totalProjects = projects.length;
    const totalVotes = projects.reduce((sum, project) => sum + project.votes, 0);

    document.getElementById('totalProjects').textContent = `${totalProjects} Projects`;
    document.getElementById('totalVotes').textContent = `${totalVotes} Total Votes`;
}

function updateResultsStats() {
    const totalProjects = projects.length;
    const totalVotes = projects.reduce((sum, project) => sum + project.votes, 0);
    const leadingProject = projects.length > 0 ? 
        [...projects].sort((a, b) => b.votes - a.votes)[0].title : 'N/A';

    document.getElementById('statsProjects').textContent = totalProjects;
    document.getElementById('statsVotes').textContent = totalVotes;
    document.getElementById('statsLeader').textContent = leadingProject;
}

async function handleVote(projectId) {
    if (userVotes.has(projectId)) {
        showToast('Already voted!', 'error');
        return;
    }

    // Show loading state
    const voteBtn = event.target.closest('.vote-btn');
    const originalContent = voteBtn.innerHTML;
    voteBtn.classList.add('loading');
    voteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Voting...</span>';
    voteBtn.disabled = true;

    try {
        // Simulate API call to your Flask backend
        // const response = await fetch(`/vote/${projectId}`, { method: 'POST' });
        // const result = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Update local state (in real app, this would come from server response)
        projects = projects.map(project => 
            project.id === projectId 
                ? { ...project, votes: project.votes + 1 }
                : project
        );
        
        userVotes.add(projectId);
        
        // Update UI
        renderProjects();
        updateStats();
        showToast('Vote recorded!', 'success');

    } catch (error) {
        console.error('Vote failed:', error);
        showToast('Failed to vote. Please try again.', 'error');
        
        // Restore button state
        voteBtn.classList.remove('loading');
        voteBtn.innerHTML = originalContent;
        voteBtn.disabled = false;
    }
}

async function handleUploadSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const projectData = {
        title: formData.get('title'),
        description: formData.get('description'),
        link: formData.get('link'),
        author: formData.get('author')
    };

    // Validation
    if (!projectData.title || !projectData.description || !projectData.author) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Submitting...</span>';
    submitBtn.disabled = true;

    try {
        // Simulate API call to your Flask backend
        // const response = await fetch('/upload', {
        //     method: 'POST',
        //     body: formData
        // });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Add to local state (in real app, this would be handled by server)
        const newProject = {
            ...projectData,
            id: Math.max(...projects.map(p => p.id), 0) + 1,
            votes: 0
        };
        
        projects.push(newProject);
        
        // Show success modal
        showSuccessModal();
        
        // Reset form
        e.target.reset();

    } catch (error) {
        console.error('Upload failed:', error);
        showToast('Failed to submit project. Please try again.', 'error');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('show');
    
    // Auto redirect after 2 seconds
    setTimeout(() => {
        modal.classList.remove('show');
        showPage('home');
        updateNavigation('home');
        updateStats();
    }, 2000);
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${escapeHtml(message)}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// API Integration Functions (for connecting to your Flask backend)

async function fetchProjects() {
    try {
        const response = await fetch('/');
        const html = await response.text();
        // Parse projects from HTML or use JSON endpoint
        // This would need to be implemented based on your Flask routes
        return projects;
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        return [];
    }
}

async function submitProject(projectData) {
    try {
        const formData = new FormData();
        Object.keys(projectData).forEach(key => {
            formData.append(key, projectData[key]);
        });

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            return { success: true };
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Failed to submit project:', error);
        return { success: false, message: error.message };
    }
}

async function voteForProject(projectId) {
    try {
        const response = await fetch(`/vote/${projectId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Failed to vote:', error);
        return { success: false, message: 'Network error' };
    }
}

async function fetchResults() {
    try {
        const response = await fetch('/results');
        const html = await response.text();
        // Parse results from HTML or use JSON endpoint
        // This would need to be implemented based on your Flask routes
        return projects.sort((a, b) => b.votes - a.votes);
    } catch (error) {
        console.error('Failed to fetch results:', error);
        return [];
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Responsive handling
window.addEventListener('resize', debounce(() => {
    // Handle responsive layout changes if needed
    const navMenu = document.getElementById('navMenu');
    if (window.innerWidth > 768) {
        navMenu.classList.remove('show');
    }
}, 250));

// Smooth scrolling for better UX
document.documentElement.style.scrollBehavior = 'smooth';

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.project-card, .stat-card, .leaderboard-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});