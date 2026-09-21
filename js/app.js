/**
 * TrackPulse Main Application Controller
 * Connects DynamicArray, CustomHashMap, MaxHeap data structures with UI DOM events.
 */

// Application Data Structure Instances
const transactionsArray = new DynamicArray(8, (oldCap, newCap, size) => {
  Visualizer.logArrayEvent(
    `Capacity resized from <strong>${oldCap}</strong> &rarr; <strong>${newCap}</strong> (active elements: ${size})`,
    'resize'
  );
});

const categoryHashMap = new CustomHashMap(8);
const maxHeap = new MaxHeap();

// Global Charts
let categoryChart = null;
let trendChart = null;
let monthlyBudget = 2500;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadStoredOrDemoData();
});

/**
 * Initializes DOM Event Listeners
 */
function initEventListeners() {
  // Navigation Tabs
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // DSA Inspector Subtabs
  document.querySelectorAll('.subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.inspector-subtab').forEach(st => st.classList.remove('active'));
      btn.classList.add('active');
      const targetSub = btn.getAttribute('data-inspector');
      document.getElementById(targetSub).classList.add('active');

      if (targetSub === 'heap-view') {
        setTimeout(() => Visualizer.renderHeapCanvas(maxHeap), 50);
      }
    });
  });

  // Demo Data Dropdown Toggle
  const demoBtn = document.getElementById('demo-data-btn');
  const demoMenu = document.getElementById('demo-menu');
  demoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    demoMenu.classList.toggle('show');
  });

  document.addEventListener('click', () => demoMenu.classList.remove('show'));

  demoMenu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const demoType = btn.getAttribute('data-demo');
      loadDemoPreset(demoType);
      demoMenu.classList.remove('show');
    });
  });

  // Theme Toggle
  const themeBtn = document.getElementById('theme-toggle-btn');
  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeBtn.innerHTML = newTheme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    
    // Re-render chart colors
    updateCharts();
    Visualizer.renderHeapCanvas(maxHeap);
  });

  // Add Expense Quick Button & Modal
  document.getElementById('add-expense-quick-btn').addEventListener('click', () => openExpenseModal());
  document.getElementById('close-modal-btn').addEventListener('click', closeExpenseModal);
  document.getElementById('cancel-modal-btn').addEventListener('click', closeExpenseModal);

  // Form Submit
  document.getElementById('expense-form').addEventListener('submit', handleExpenseSubmit);

  // Search & Filters
  document.getElementById('search-input').addEventListener('input', renderTable);
  document.getElementById('category-filter').addEventListener('change', renderTable);
  document.getElementById('sort-select').addEventListener('change', renderTable);
  document.getElementById('top-k-select').addEventListener('change', renderTopExpensesLeaderboard);

  // Export CSV Button
  document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);

  // Rebuild Heap Button
  document.getElementById('rebuild-heap-btn').addEventListener('click', () => {
    maxHeap.heapify(transactionsArray.toArray());
    Visualizer.renderHeapCanvas(maxHeap);
    Visualizer.renderHeapArrayStorage(maxHeap);
    showToast('Heapify triggered! Binary Max-Heap rebuilt in O(N) time.', 'info');
  });

  // Custom Category Toggle
  const catSelect = document.getElementById('expense-category');
  const customCatInput = document.getElementById('custom-category-input');
  catSelect.addEventListener('change', () => {
    if (catSelect.value === 'CUSTOM') {
      customCatInput.classList.remove('hidden');
      customCatInput.required = true;
      customCatInput.focus();
    } else {
      customCatInput.classList.add('hidden');
      customCatInput.required = false;
    }
  });

  // Edit Budget Modal Listeners
  document.getElementById('edit-budget-btn').addEventListener('click', openBudgetModal);
  document.getElementById('close-budget-modal-btn').addEventListener('click', closeBudgetModal);
  document.getElementById('cancel-budget-modal-btn').addEventListener('click', closeBudgetModal);
  document.getElementById('budget-form').addEventListener('submit', handleBudgetSubmit);

  // Clear All Data
  const clearBtn = document.getElementById('clear-all-data-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all expense records? This allows you to start fresh for personal use.')) {
        populateDataStructures([]);
        showToast('All records cleared. You can now manually enter your personal expenses.', 'info');
      }
    });
  }
}

/**
 * Switch Navigation Tab
 */
function switchTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });

  if (tabId === 'dsa-inspector') {
    setTimeout(() => Visualizer.renderHeapCanvas(maxHeap), 100);
  }
}

/**
 * Load Initial Data from LocalStorage or Load Demo Dataset
 */
function loadStoredOrDemoData() {
  const savedData = localStorage.getItem('trackpulse_expenses');
  if (savedData) {
    try {
      const expenses = JSON.parse(savedData);
      populateDataStructures(expenses);
    } catch (e) {
      loadDemoPreset('cs-student');
    }
  } else {
    loadDemoPreset('cs-student');
  }
}

/**
 * Populates all 3 Data Structures from raw expense array
 */
function populateDataStructures(expenses) {
  transactionsArray.clear();
  categoryHashMap.clear();
  maxHeap.clear();

  expenses.forEach(item => {
    const expense = {
      id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 4),
      description: item.description,
      amount: parseFloat(item.amount),
      category: item.category,
      date: item.date,
      priority: item.priority || 'Essential',
      notes: item.notes || ''
    };

    // 1. Dynamic Array Push
    transactionsArray.push(expense);

    // 2. Hash Map Category Update
    updateHashMapCategory(expense.category, expense.amount, 'add');

    // 3. Max Heap Insert
    maxHeap.insert(expense);
  });

  syncUI();
  saveToLocalStorage();
}

/**
 * Updates HashMap Key-Value Pair for Category Totals
 */
function updateHashMapCategory(category, amount, action = 'add') {
  let existing = categoryHashMap.get(category);
  if (!existing) {
    existing = { totalAmount: 0, count: 0 };
  }

  if (action === 'add') {
    existing.totalAmount += amount;
    existing.count += 1;
  } else if (action === 'remove') {
    existing.totalAmount -= amount;
    existing.count -= 1;
  }

  if (existing.count <= 0 || existing.totalAmount <= 0) {
    categoryHashMap.delete(category);
  } else {
    categoryHashMap.set(category, existing);
  }
}

/**
 * Synchronizes all UI components, KPI Cards, Tables, and Charts
 */
function syncUI() {
  updateKPICards();
  updateCategoryFilterDropdown();
  renderTable();
  renderTopExpensesLeaderboard();
  updateCharts();

  // Update Visualizers
  Visualizer.renderHashMapBuckets(categoryHashMap);
  Visualizer.renderDynamicArrayMemory(transactionsArray);
  Visualizer.renderHeapArrayStorage(maxHeap);
  Visualizer.renderHeapCanvas(maxHeap);
}

/**
 * Updates Dashboard KPI Cards
 */
function updateKPICards() {
  // Total Spending (Dynamic Array Sum)
  let total = 0;
  for (let i = 0; i < transactionsArray.size; i++) {
    total += transactionsArray.get(i).amount;
  }

  document.getElementById('total-spending').innerText = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Monthly Budget Status
  const usedPercent = Math.min(100, Math.round((total / monthlyBudget) * 100));
  document.getElementById('budget-fill-bar').style.width = `${usedPercent}%`;
  document.getElementById('budget-status-text').innerText = `${usedPercent}% of $${monthlyBudget.toLocaleString()} monthly budget used`;

  // Top Expense (Max Heap Peek Root)
  const topExpense = maxHeap.peekMax();
  if (topExpense) {
    document.getElementById('top-expense-amount').innerText = `$${topExpense.amount.toFixed(2)}`;
    document.getElementById('top-expense-title').innerHTML = `<i class="fa-solid fa-crown" style="color:var(--accent-amber)"></i> ${topExpense.description}`;
  } else {
    document.getElementById('top-expense-amount').innerText = '$0.00';
    document.getElementById('top-expense-title').innerText = 'No expenses recorded';
  }

  // Top Category (Hash Map Scan)
  let highestCat = 'None';
  let highestAmount = 0;

  categoryHashMap.entries().forEach(([cat, val]) => {
    if (val.totalAmount > highestAmount) {
      highestAmount = val.totalAmount;
      highestCat = cat;
    }
  });

  document.getElementById('top-category-name').innerText = highestCat;
  document.getElementById('top-category-amount').innerText = highestAmount > 0 
    ? `$${highestAmount.toFixed(2)} total spend` 
    : 'No categories recorded';
}

/**
 * Renders Top Expenses Leaderboard from Max Heap
 */
function renderTopExpensesLeaderboard() {
  const container = document.getElementById('top-expenses-list');
  const k = parseInt(document.getElementById('top-k-select').value, 10);
  
  const topKExpenses = maxHeap.getTopK(k);

  if (topKExpenses.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:1rem;">No expenses available</div>`;
    return;
  }

  let html = '';
  topKExpenses.forEach((exp, idx) => {
    html += `
      <div class="top-expense-item">
        <div class="rank-badge">#${idx + 1}</div>
        <div class="expense-info">
          <div class="expense-name">${exp.description}</div>
          <div class="expense-sub">${exp.category} &bull; ${exp.date}</div>
        </div>
        <div class="expense-val">$${exp.amount.toFixed(2)}</div>
      </div>
    `;
  });
  container.innerHTML = html;
}

/**
 * Renders Transactions Table with Search, Filter & Sort
 */
function renderTable() {
  const tbody = document.getElementById('transaction-tbody');
  const emptyState = document.getElementById('empty-state');
  
  const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
  const catFilter = document.getElementById('category-filter').value;
  const sortBy = document.getElementById('sort-select').value;

  // Filter dynamic array
  let filtered = transactionsArray.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchQuery) || (exp.notes && exp.notes.toLowerCase().includes(searchQuery));
    const matchesCategory = catFilter === 'ALL' || exp.category === catFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort filtered results
  filtered.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  const validArray = filtered.toArray();

  if (validArray.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    let html = '';
    validArray.forEach((exp, idx) => {
      html += `
        <tr>
          <td class="index-cell">[${idx}]</td>
          <td>
            <strong>${exp.description}</strong>
            ${exp.notes ? `<div style="font-size:0.75rem; color:var(--text-muted);">${exp.notes}</div>` : ''}
          </td>
          <td><span class="badge dsa-tag">${exp.category}</span></td>
          <td><strong style="color:var(--text-primary);">$${exp.amount.toFixed(2)}</strong></td>
          <td style="color:var(--text-secondary);">${exp.date}</td>
          <td><span class="priority-tag priority-${exp.priority}">${exp.priority}</span></td>
          <td>
            <div class="action-btns">
              <button class="btn-icon-small" onclick="editExpense('${exp.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
              <button class="btn-icon-small delete-btn" onclick="deleteExpense('${exp.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  document.getElementById('array-stats-summary').innerText = `Dynamic Array Size: ${transactionsArray.size} | Capacity: ${transactionsArray.capacity} | Displayed: ${validArray.length}`;
}

/**
 * Dynamic Category Filter Dropdown Population
 */
function updateCategoryFilterDropdown() {
  const select = document.getElementById('category-filter');
  const currentVal = select.value;
  const categories = categoryHashMap.keys();

  let html = '<option value="ALL">All Categories</option>';
  categories.forEach(cat => {
    html += `<option value="${cat}">${cat}</option>`;
  });
  select.innerHTML = html;
  select.value = currentVal;
}

/**
 * Renders Chart.js Analytics Charts
 */
function updateCharts() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // 1. Category Breakdown Doughnut Chart
  const ctxCat = document.getElementById('categoryChart').getContext('2d');
  const catEntries = categoryHashMap.entries();
  const labels = catEntries.map(e => e[0]);
  const dataVals = catEntries.map(e => e[1].totalAmount);

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: dataVals,
        backgroundColor: [
          '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', 
          '#f43f5e', '#06b6d4', '#ec4899', '#6366f1'
        ],
        borderWidth: 2,
        borderColor: isDark ? '#1e293b' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: textColor, font: { family: 'Outfit', size: 12 } }
        }
      }
    }
  });

  // 2. Recent Spending Trend Bar Chart
  const ctxTrend = document.getElementById('trendChart').getContext('2d');
  
  // Aggregate expenses by date
  const dateMap = {};
  for (let i = 0; i < transactionsArray.size; i++) {
    const item = transactionsArray.get(i);
    dateMap[item.date] = (dateMap[item.date] || 0) + item.amount;
  }

  const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));
  const trendVals = sortedDates.map(d => dateMap[d]);

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctxTrend, {
    type: 'bar',
    data: {
      labels: sortedDates,
      datasets: [{
        label: 'Daily Expense ($)',
        data: trendVals,
        backgroundColor: 'rgba(139, 92, 246, 0.65)',
        borderColor: '#8b5cf6',
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

/**
 * Handles Form Submission for Adding / Editing Expense
 */
function handleExpenseSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('expense-id').value;
  const description = document.getElementById('expense-desc').value.trim();
  const amount = parseFloat(document.getElementById('expense-amount').value);
  let category = document.getElementById('expense-category').value;
  
  if (category === 'CUSTOM') {
    const customVal = document.getElementById('custom-category-input').value.trim();
    if (!customVal) {
      showToast('Please type your custom category name.', 'warn');
      return;
    }
    category = '🏷️ ' + customVal;
  }

  const date = document.getElementById('expense-date').value;
  const priority = document.getElementById('expense-priority').value;
  const notes = document.getElementById('expense-notes').value.trim();

  if (!description || isNaN(amount) || amount <= 0 || !date) {
    showToast('Please fill in all required fields correctly.', 'warn');
    return;
  }

  if (id) {
    // Edit existing expense
    deleteExpense(id, false); // remove old instance first
  }

  const newExpense = {
    id: id || Date.now().toString() + Math.random().toString(36).substr(2, 4),
    description,
    amount,
    category,
    date,
    priority,
    notes
  };

  // Add to DSA Data Structures
  transactionsArray.push(newExpense);
  updateHashMapCategory(category, amount, 'add');
  maxHeap.insert(newExpense);

  Visualizer.logArrayEvent(`Pushed <strong>${description}</strong> ($${amount}) into DynamicArray`, 'push');

  syncUI();
  saveToLocalStorage();
  closeExpenseModal();
  showToast(`Expense "${description}" saved successfully!`, 'success');
}

/**
 * Budget Modal Handlers
 */
function openBudgetModal() {
  document.getElementById('budget-modal').classList.remove('hidden');
  document.getElementById('budget-amount-input').value = monthlyBudget;
}

function closeBudgetModal() {
  document.getElementById('budget-modal').classList.add('hidden');
}

function handleBudgetSubmit(e) {
  e.preventDefault();
  const val = parseFloat(document.getElementById('budget-amount-input').value);
  if (!isNaN(val) && val > 0) {
    monthlyBudget = val;
    localStorage.setItem('trackpulse_budget', val.toString());
    updateKPICards();
    closeBudgetModal();
    showToast(`Monthly budget updated to $${val.toLocaleString()}`, 'success');
  }
}

/**
 * Deletes an expense by ID
 */
function deleteExpense(id, triggerSync = true) {
  let foundIndex = -1;
  let targetExp = null;

  for (let i = 0; i < transactionsArray.size; i++) {
    if (transactionsArray.get(i).id === id) {
      foundIndex = i;
      targetExp = transactionsArray.get(i);
      break;
    }
  }

  if (foundIndex !== -1 && targetExp) {
    // 1. Remove from Dynamic Array
    transactionsArray.removeAt(foundIndex);

    // 2. Update Hash Map Category Total
    updateHashMapCategory(targetExp.category, targetExp.amount, 'remove');

    // 3. Rebuild Max Heap from Array
    maxHeap.heapify(transactionsArray.toArray());

    if (triggerSync) {
      syncUI();
      saveToLocalStorage();
      showToast(`Expense "${targetExp.description}" deleted`, 'info');
    }
  }
}

/**
 * Edits an expense by populating modal form
 */
function editExpense(id) {
  let target = null;
  for (let i = 0; i < transactionsArray.size; i++) {
    if (transactionsArray.get(i).id === id) {
      target = transactionsArray.get(i);
      break;
    }
  }

  if (target) {
    document.getElementById('expense-id').value = target.id;
    document.getElementById('expense-desc').value = target.description;
    document.getElementById('expense-amount').value = target.amount;
    document.getElementById('expense-category').value = target.category;
    document.getElementById('expense-date').value = target.date;
    document.getElementById('expense-priority').value = target.priority || 'Essential';
    document.getElementById('expense-notes').value = target.notes || '';

    document.getElementById('modal-title').innerText = 'Edit Expense';
    openExpenseModal();
  }
}

/**
 * Modal Open / Close Helpers
 */
function openExpenseModal() {
  document.getElementById('expense-modal').classList.remove('hidden');
  if (!document.getElementById('expense-id').value) {
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
  }
}

function closeExpenseModal() {
  document.getElementById('expense-modal').classList.add('hidden');
  document.getElementById('expense-form').reset();
  document.getElementById('expense-id').value = '';
  document.getElementById('custom-category-input').classList.add('hidden');
  document.getElementById('custom-category-input').required = false;
  document.getElementById('modal-title').innerText = 'Add New Expense';
}

/**
 * Load Demo Datasets
 */
function loadDemoPreset(type) {
  const today = new Date();
  const formatDate = (daysAgo) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  let demoData = [];

  if (type === 'cs-student') {
    demoData = [
      { description: 'MacBook Pro M3 (CS Lab)', amount: 1899.00, category: 'Shopping & Tech', date: formatDate(1), priority: 'Essential', notes: '#laptop #coding' },
      { description: 'University Tuition Fee', amount: 1250.00, category: 'Education & Books', date: formatDate(2), priority: 'Essential', notes: '#semester2' },
      { description: 'AWS Cloud Credits & VPS', amount: 45.00, category: 'Shopping & Tech', date: formatDate(3), priority: 'Essential', notes: '#dsa #project' },
      { description: 'Starbucks Study Espresso', amount: 8.50, category: 'Food & Dining', date: formatDate(4), priority: 'Discretionary', notes: '#latte' },
      { description: 'Data Structures Textbook', amount: 89.99, category: 'Education & Books', date: formatDate(5), priority: 'Essential', notes: '#algorithms' },
      { description: 'Dorm Room Rent', amount: 650.00, category: 'Housing & Rent', date: formatDate(7), priority: 'Essential', notes: '#monthly' },
      { description: 'Mechanical Gaming Keyboard', amount: 120.00, category: 'Shopping & Tech', date: formatDate(8), priority: 'Discretionary', notes: '#keychron' },
      { description: 'Campus Cafeteria Meal Pass', amount: 210.00, category: 'Food & Dining', date: formatDate(10), priority: 'Essential', notes: '#lunch' }
    ];
  } else if (type === 'freelancer') {
    demoData = [
      { description: 'Client Dinner & Negotiation', amount: 245.50, category: 'Food & Dining', date: formatDate(1), priority: 'Essential', notes: '#client' },
      { description: 'Ergonomic Standing Desk', amount: 599.00, category: 'Shopping & Tech', date: formatDate(3), priority: 'Investment', notes: '#office' },
      { description: 'Fiber Gigabit Internet', amount: 89.00, category: 'Utilities & Bills', date: formatDate(5), priority: 'Essential', notes: '#wifi' },
      { description: 'Figma & GitHub Enterprise', amount: 35.00, category: 'Shopping & Tech', date: formatDate(6), priority: 'Essential', notes: '#saas' },
      { description: 'Co-Working Desk Pass', amount: 300.00, category: 'Housing & Rent', date: formatDate(8), priority: 'Essential', notes: '#wfh' }
    ];
  } else if (type === 'vacation') {
    demoData = [
      { description: 'Flight Ticket (Tokyo Haneda)', amount: 1350.00, category: 'Travel & Transit', date: formatDate(2), priority: 'Essential', notes: '#japan' },
      { description: 'Shinjuku Hotel 5 Nights', amount: 920.00, category: 'Travel & Transit', date: formatDate(4), priority: 'Essential', notes: '#hotel' },
      { description: 'JR Shinkansen Bullet Train Pass', amount: 350.00, category: 'Travel & Transit', date: formatDate(6), priority: 'Essential', notes: '#transit' },
      { description: 'Akihabara Tech & Figure Shopping', amount: 480.00, category: 'Shopping & Tech', date: formatDate(7), priority: 'Discretionary', notes: '#anime' },
      { description: 'Ginza Omakase Sushi Dinner', amount: 220.00, category: 'Food & Dining', date: formatDate(9), priority: 'Discretionary', notes: '#sushi' }
    ];
  }

  populateDataStructures(demoData);
  showToast(`Loaded "${type}" demo dataset!`, 'success');
}

/**
 * Export Transactions to CSV file
 */
function exportToCSV() {
  if (transactionsArray.size === 0) {
    showToast('No transactions to export.', 'warn');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,Index,ID,Description,Amount,Category,Date,Priority,Notes\n';

  for (let i = 0; i < transactionsArray.size; i++) {
    const item = transactionsArray.get(i);
    const row = [
      i,
      item.id,
      `"${item.description.replace(/"/g, '""')}"`,
      item.amount,
      `"${item.category}"`,
      item.date,
      item.priority,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ].join(',');
    csvContent += row + '\n';
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `expense_tracker_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Exported expense records to CSV file', 'success');
}

/**
 * LocalStorage Save Helper
 */
function saveToLocalStorage() {
  const data = transactionsArray.toArray();
  localStorage.setItem('trackpulse_expenses', JSON.stringify(data));
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconMap = {
    success: 'fa-circle-check',
    warn: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  toast.innerHTML = `<i class="fa-solid ${iconMap[type]}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
