// Goal Achievement System - Main Application Logic
class GoalAchievementSystem {
    constructor() {
        this.data = {
            goals: {
                data_science: { name: "Data Science Learning", progress: 15, daily_target: 2.5, weekly_target: 15 },
                bank_exam: { name: "Bank Exam Preparation", progress: 12, daily_target: 2, weekly_target: 12 },
                youtube: { name: "YouTube Channel", progress: 8, daily_target: 1.5, weekly_target: 8 },
                health: { name: "Health & Fitness", progress: 20, daily_target: 1, weekly_target: 6 },
                confidence: { name: "Confidence Building", progress: 25, daily_target: 0.5, weekly_target: 3 },
                mma: { name: "MMA Self-Defense", progress: 10, daily_target: 0.75, weekly_target: 4 }
            },
            dailyData: this.loadDailyData(),
            currentStreak: 0,
            totalEarnings: 0
        };
        
        this.charts = {};
        this.motivationalQuotes = [
            "Success is the sum of small efforts repeated day in and day out.",
            "The future depends on what you do today.",
            "Your current situation is not your final destination.",
            "Every expert was once a beginner.",
            "Progress, not perfection.",
            "Invest in yourself. You are your own best investment.",
            "Small steps every day lead to big changes in a year.",
            "Your goals are waiting for you to catch up with them."
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateTime();
        this.updateMotivationalQuote();
        this.updateOverallProgress();
        this.initializeTabs();
        this.initializeCharts();
        this.updateDailySummary();
        this.generateMilestones();
        this.loadSavedData();
        
        // Update every minute
        setInterval(() => {
            this.updateDateTime();
        }, 60000);
        
        // Rotate quotes every 30 seconds
        setInterval(() => {
            this.updateMotivationalQuote();
        }, 30000);
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', this.toggleTheme.bind(this));

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Daily tracking form
        const dailyForm = document.getElementById('dailyTrackingForm');
        dailyForm?.addEventListener('submit', this.handleDailyTracking.bind(this));
        
        // Real-time updates on form inputs
        const inputs = dailyForm?.querySelectorAll('input');
        inputs?.forEach(input => {
            input.addEventListener('input', this.updateDailySummary.bind(this));
        });

        // Goal card clicks
        document.querySelectorAll('.goal-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.showGoalDetails(e.currentTarget.dataset.goal);
            });
        });
    }

    loadDailyData() {
        const saved = localStorage.getItem('goalSystemDailyData');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            '2024-01-15': { dsHours: 2.1, bankHours: 1.8, youtubeHours: 1.2, workoutMins: 45, goalCompletion: 67 },
            '2024-01-16': { dsHours: 1.8, bankHours: 2.2, youtubeHours: 0.8, workoutMins: 30, goalCompletion: 83 },
            '2024-01-17': { dsHours: 2.5, bankHours: 1.5, youtubeHours: 1.5, workoutMins: 60, goalCompletion: 100 }
        };
    }

    saveDailyData() {
        localStorage.setItem('goalSystemDailyData', JSON.stringify(this.data.dailyData));
    }

    loadSavedData() {
        const saved = localStorage.getItem('goalSystemMainData');
        if (saved) {
            const savedData = JSON.parse(saved);
            this.data = { ...this.data, ...savedData };
            this.updateOverallProgress();
        }
    }

    saveMainData() {
        localStorage.setItem('goalSystemMainData', JSON.stringify({
            goals: this.data.goals,
            currentStreak: this.data.currentStreak,
            totalEarnings: this.data.totalEarnings
        }));
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'Asia/Kolkata'
        };
        const dateStr = now.toLocaleDateString('en-IN', options);
        const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
        
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = `${dateStr} - ${timeStr}`;
        }
    }

    updateMotivationalQuote() {
        const quoteElement = document.getElementById('motivationalQuote');
        if (quoteElement) {
            const randomQuote = this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
            quoteElement.textContent = `"${randomQuote}"`;
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = newTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
        }
        
        localStorage.setItem('goalSystemTheme', newTheme);
        
        // Re-render charts with new theme
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
    }

    switchTab(tabId) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        
        // Add active class to selected tab and panel
        document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
        document.getElementById(tabId)?.classList.add('active');
        
        // Initialize charts if switching to progress charts tab
        if (tabId === 'progress-charts') {
            setTimeout(() => {
                this.initializeCharts();
            }, 100);
        }
    }

    initializeTabs() {
        // Set default theme from localStorage
        const savedTheme = localStorage.getItem('goalSystemTheme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-color-scheme', savedTheme);
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.textContent = savedTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
            }
        }
    }

    updateOverallProgress() {
        const goals = Object.values(this.data.goals);
        const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
        const averageProgress = Math.round(totalProgress / goals.length);
        
        // Update progress ring
        const progressRing = document.getElementById('overallProgressRing');
        const progressText = document.getElementById('overallPercentage');
        
        if (progressRing && progressText) {
            const percentage = averageProgress;
            const degrees = (percentage / 100) * 360;
            
            progressRing.style.background = `conic-gradient(var(--color-primary) ${degrees}deg, var(--color-secondary) ${degrees}deg)`;
            progressText.textContent = `${percentage}%`;
        }
        
        // Update other stats
        const daysRemaining = document.getElementById('daysRemaining');
        const goalsOnTrack = document.getElementById('goalsOnTrack');
        
        if (daysRemaining) {
            const startDate = new Date('2024-01-15');
            const endDate = new Date('2024-07-15');
            const today = new Date();
            const remaining = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
            daysRemaining.textContent = remaining;
        }
        
        if (goalsOnTrack) {
            const onTrackCount = goals.filter(goal => goal.progress >= 15).length;
            goalsOnTrack.textContent = onTrackCount;
        }
    }

    handleDailyTracking(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const today = new Date().toISOString().split('T')[0];
        
        const dailyEntry = {
            date: today,
            workHours: parseFloat(document.getElementById('workHours')?.value || 0),
            dsHours: parseFloat(document.getElementById('dsHours')?.value || 0),
            bankHours: parseFloat(document.getElementById('bankHours')?.value || 0),
            youtubeHours: parseFloat(document.getElementById('youtubeHours')?.value || 0),
            workoutMins: parseInt(document.getElementById('workoutMins')?.value || 0),
            meditationMins: parseInt(document.getElementById('meditationMins')?.value || 0),
            mmaMins: parseInt(document.getElementById('mmaMins')?.value || 0),
            cigarettes: parseInt(document.getElementById('cigarettes')?.value || 0),
            waterIntake: parseInt(document.getElementById('waterIntake')?.value || 0),
            sleepHours: parseFloat(document.getElementById('sleepHours')?.value || 0),
            energyLevel: parseInt(document.getElementById('energyLevel')?.value || 5),
            morningRoutine: document.getElementById('morningRoutine')?.checked || false,
            grooming: document.getElementById('grooming')?.checked || false,
            posture: document.getElementById('posture')?.checked || false
        };
        
        // Calculate earnings (assuming ₹75/hour for delivery)
        const earnings = dailyEntry.workHours * 75;
        dailyEntry.earnings = earnings;
        this.data.totalEarnings += earnings;
        
        // Calculate goal completion percentage
        const targetHours = {
            ds: this.data.goals.data_science.daily_target,
            bank: this.data.goals.bank_exam.daily_target,
            youtube: this.data.goals.youtube.daily_target
        };
        
        const actualHours = {
            ds: dailyEntry.dsHours,
            bank: dailyEntry.bankHours,
            youtube: dailyEntry.youtubeHours
        };
        
        let completionScore = 0;
        completionScore += Math.min(100, (actualHours.ds / targetHours.ds) * 100 * 0.3);
        completionScore += Math.min(100, (actualHours.bank / targetHours.bank) * 100 * 0.3);
        completionScore += Math.min(100, (actualHours.youtube / targetHours.youtube) * 100 * 0.2);
        completionScore += dailyEntry.workoutMins >= 30 ? 10 : (dailyEntry.workoutMins / 30) * 10;
        completionScore += dailyEntry.morningRoutine ? 5 : 0;
        completionScore += dailyEntry.grooming ? 5 : 0;
        
        dailyEntry.goalCompletion = Math.round(completionScore);
        
        // Save to daily data
        this.data.dailyData[today] = dailyEntry;
        this.saveDailyData();
        this.saveMainData();
        
        // Update UI
        this.updateDailySummary();
        this.showSuccessMessage('Daily progress saved successfully!');
        
        // Reset form
        e.target.reset();
    }

    updateDailySummary() {
        const dsHours = parseFloat(document.getElementById('dsHours')?.value || 0);
        const bankHours = parseFloat(document.getElementById('bankHours')?.value || 0);
        const youtubeHours = parseFloat(document.getElementById('youtubeHours')?.value || 0);
        const workHours = parseFloat(document.getElementById('workHours')?.value || 0);
        
        const totalStudy = dsHours + bankHours + youtubeHours;
        const earnings = workHours * 75;
        
        // Calculate completion percentage
        let completion = 0;
        completion += Math.min(100, (dsHours / 2.5) * 100 * 0.3);
        completion += Math.min(100, (bankHours / 2) * 100 * 0.3);
        completion += Math.min(100, (youtubeHours / 1.5) * 100 * 0.2);
        
        const workoutMins = parseInt(document.getElementById('workoutMins')?.value || 0);
        completion += workoutMins >= 30 ? 20 : (workoutMins / 30) * 20;
        
        document.getElementById('totalStudyHours').textContent = totalStudy.toFixed(1);
        document.getElementById('goalCompletion').textContent = Math.round(completion) + '%';
        document.getElementById('earnedToday').textContent = '₹' + Math.round(earnings);
    }

    initializeCharts() {
        this.createProgressChart();
        this.createStudyHoursChart();
        this.createHealthChart();
        this.createCompletionChart();
    }

    createProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;
        
        if (this.charts.progress) {
            this.charts.progress.destroy();
        }
        
        const data = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Data Science',
                    data: [8, 12, 15, 18],
                    borderColor: '#1FB8CD',
                    backgroundColor: '#1FB8CD20',
                    tension: 0.4
                },
                {
                    label: 'Bank Exam',
                    data: [6, 10, 12, 14],
                    borderColor: '#FFC185',
                    backgroundColor: '#FFC18520',
                    tension: 0.4
                },
                {
                    label: 'YouTube',
                    data: [4, 6, 8, 10],
                    borderColor: '#B4413C',
                    backgroundColor: '#B4413C20',
                    tension: 0.4
                },
                {
                    label: 'Fitness',
                    data: [12, 16, 20, 24],
                    borderColor: '#5D878F',
                    backgroundColor: '#5D878F20',
                    tension: 0.4
                }
            ]
        };
        
        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 30
                    }
                }
            }
        });
    }

    createStudyHoursChart() {
        const ctx = document.getElementById('studyHoursChart');
        if (!ctx) return;
        
        if (this.charts.studyHours) {
            this.charts.studyHours.destroy();
        }
        
        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Data Science',
                    data: [2.5, 2.0, 2.5, 1.8, 2.2, 3.0, 2.0],
                    backgroundColor: '#1FB8CD'
                },
                {
                    label: 'Bank Exam',
                    data: [1.8, 2.0, 1.5, 2.2, 1.8, 2.5, 1.5],
                    backgroundColor: '#FFC185'
                },
                {
                    label: 'YouTube',
                    data: [1.2, 0.8, 1.5, 1.0, 2.0, 2.0, 1.5],
                    backgroundColor: '#B4413C'
                }
            ]
        };
        
        this.charts.studyHours = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createHealthChart() {
        const ctx = document.getElementById('healthChart');
        if (!ctx) return;
        
        if (this.charts.health) {
            this.charts.health.destroy();
        }
        
        const data = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Workout Days',
                    data: [3, 4, 5, 6],
                    borderColor: '#5D878F',
                    backgroundColor: '#5D878F20',
                    yAxisID: 'y'
                },
                {
                    label: 'Cigarettes/Day',
                    data: [8, 6, 4, 2],
                    borderColor: '#DB4545',
                    backgroundColor: '#DB454520',
                    yAxisID: 'y1'
                }
            ]
        };
        
        this.charts.health = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        max: 7
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: 10,
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    createCompletionChart() {
        const ctx = document.getElementById('completionChart');
        if (!ctx) return;
        
        if (this.charts.completion) {
            this.charts.completion.destroy();
        }
        
        const data = {
            labels: ['Data Science', 'Bank Exam', 'YouTube', 'Fitness', 'Confidence', 'MMA'],
            datasets: [{
                data: [15, 12, 8, 20, 25, 10],
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
            }]
        };
        
        this.charts.completion = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    generateMilestones() {
        const container = document.getElementById('milestonesContainer');
        if (!container) return;
        
        const milestones = [
            {
                goal: 'Data Science',
                month: 'Month 1',
                title: 'Python & Statistics Fundamentals',
                progress: 60,
                status: 'In Progress',
                tasks: ['Complete Python basics', 'Statistics course', 'First data project']
            },
            {
                goal: 'Bank Exam',
                month: 'Month 1',
                title: 'Syllabus Analysis & Basics',
                progress: 50,
                status: 'In Progress',
                tasks: ['Syllabus breakdown', 'Basic math review', 'English fundamentals']
            },
            {
                goal: 'YouTube',
                month: 'Month 1',
                title: 'Channel Setup & Strategy',
                progress: 40,
                status: 'Behind',
                tasks: ['Channel creation', 'Content strategy', 'First 5 videos']
            },
            {
                goal: 'Health & Fitness',
                month: 'Month 1',
                title: 'Fitness Foundation',
                progress: 70,
                status: 'On Track',
                tasks: ['Daily workouts', 'Quit smoking', 'Nutrition basics']
            },
            {
                goal: 'Confidence',
                month: 'Month 1',
                title: 'Daily Routines & Self-Care',
                progress: 80,
                status: 'Ahead',
                tasks: ['Morning routine', 'Grooming habits', 'Posture improvement']
            },
            {
                goal: 'MMA',
                month: 'Month 1',
                title: 'Basic Striking Techniques',
                progress: 35,
                status: 'Behind',
                tasks: ['Basic punches', 'Footwork', 'Shadow boxing']
            }
        ];
        
        container.innerHTML = milestones.map(milestone => `
            <div class="card milestone-card">
                <div class="card__body">
                    <div class="milestone-header">
                        <h3>${milestone.goal}</h3>
                        <span class="milestone-month">${milestone.month}</span>
                    </div>
                    <div class="milestone-content">
                        <h4>${milestone.title}</h4>
                        <div class="milestone-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${milestone.progress}%"></div>
                            </div>
                            <span class="progress-text">${milestone.progress}%</span>
                        </div>
                        <div class="milestone-status">
                            <span class="status status--${this.getStatusClass(milestone.status)}">${milestone.status}</span>
                        </div>
                        <div class="milestone-details">
                            <h5>Key Tasks:</h5>
                            <ul>
                                ${milestone.tasks.map(task => `<li>${task}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getStatusClass(status) {
        switch (status) {
            case 'Ahead': return 'success';
            case 'On Track': return 'success';
            case 'In Progress': return 'warning';
            case 'Behind': return 'error';
            default: return 'info';
        }
    }

    showGoalDetails(goalId) {
        const goal = this.data.goals[goalId];
        if (!goal) return;
        
        alert(`Goal: ${goal.name}\nProgress: ${goal.progress}%\nDaily Target: ${goal.daily_target} hours\nWeekly Target: ${goal.weekly_target} hours`);
    }

    showSuccessMessage(message) {
        // Create and show a success notification
        const notification = document.createElement('div');
        notification.className = 'notification notification--success';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✓</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-success);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GoalAchievementSystem();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .notification-icon {
        font-weight: bold;
    }
`;
document.head.appendChild(style);