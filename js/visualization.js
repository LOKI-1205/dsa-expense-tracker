/**
 * Visualizer Module - DSA Inspector Renderers
 * --------------------------------------------
 * Handles interactive visual rendering of Heap Tree on Canvas,
 * Hash Map bucket chains, and Dynamic Array memory layout.
 */

const Visualizer = {

  /**
   * Renders the Binary Max-Heap Tree on Canvas with parent-child links.
   */
  renderHeapCanvas(maxHeap) {
    const canvas = document.getElementById('heapCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Auto adjust canvas resolution for crisp rendering
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = Math.max(800, rect.width - 40);
    canvas.height = 400;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (maxHeap.size() === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '16px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Heap is empty. Add expenses or load demo data to view binary tree.', canvas.width / 2, canvas.height / 2);
      return;
    }

    const heap = maxHeap.heap;
    const totalNodes = heap.length;
    const nodeRadius = 24;
    
    // Calculate coordinates for binary tree levels
    const getCoordinates = (index) => {
      const level = Math.floor(Math.log2(index + 1));
      const posInLevel = index - (Math.pow(2, level) - 1);
      const totalInLevel = Math.pow(2, level);
      
      const levelHeight = 80;
      const startY = 50;
      
      const y = startY + level * levelHeight;
      const sectionWidth = canvas.width / totalInLevel;
      const x = sectionWidth * posInLevel + sectionWidth / 2;

      return { x, y };
    };

    // Step 1: Draw Connecting Edges (Lines)
    for (let i = 0; i < totalNodes; i++) {
      const leftChildIdx = 2 * i + 1;
      const rightChildIdx = 2 * i + 2;

      const parentCoord = getCoordinates(i);

      if (leftChildIdx < totalNodes) {
        const childCoord = getCoordinates(leftChildIdx);
        ctx.beginPath();
        ctx.moveTo(parentCoord.x, parentCoord.y);
        ctx.lineTo(childCoord.x, childCoord.y);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (rightChildIdx < totalNodes) {
        const childCoord = getCoordinates(rightChildIdx);
        ctx.beginPath();
        ctx.moveTo(parentCoord.x, parentCoord.y);
        ctx.lineTo(childCoord.x, childCoord.y);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Step 2: Draw Circular Nodes
    for (let i = 0; i < totalNodes; i++) {
      const { x, y } = getCoordinates(i);
      const item = heap[i];

      // Outer glowing circle
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
      
      if (i === 0) {
        // Root Node (Max Element) Highlight
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
        ctx.shadowBlur = 15;
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
      }
      ctx.fill();

      // Border line
      ctx.lineWidth = 2;
      ctx.strokeStyle = i === 0 ? '#fef08a' : '#8b5cf6';
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // Node Text (Amount & Title)
      ctx.fillStyle = i === 0 ? '#000000' : '#ffffff';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`$${Math.round(item.amount)}`, x, y - 2);

      // Label below node
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Outfit, sans-serif';
      const truncatedDesc = item.description.length > 10 ? item.description.substring(0, 8) + '..' : item.description;
      ctx.fillText(`[${i}] ${truncatedDesc}`, x, y + nodeRadius + 14);
    }
  },

  /**
   * Renders array representation of Heap array storage.
   */
  renderHeapArrayStorage(maxHeap) {
    const container = document.getElementById('heap-array-slots');
    if (!container) return;

    if (maxHeap.size() === 0) {
      container.innerHTML = '<span class="text-muted" style="font-size:0.85rem;">Array is empty</span>';
      return;
    }

    let html = '';
    maxHeap.heap.forEach((item, idx) => {
      const isRoot = idx === 0;
      html += `
        <div class="heap-slot ${isRoot ? 'root-slot' : ''}">
          <div class="slot-idx">i=${idx}</div>
          <div class="slot-val">$${parseFloat(item.amount).toFixed(0)}</div>
          <div class="slot-key">${item.description}</div>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  /**
   * Renders Hash Map Buckets and Separate Chaining Linked lists.
   */
  renderHashMapBuckets(hashMap) {
    const grid = document.getElementById('buckets-grid');
    if (!grid) return;

    // Update Pills
    document.getElementById('hashmap-size-pill').innerText = `Keys: ${hashMap.size}`;
    document.getElementById('hashmap-buckets-pill').innerText = `Buckets: ${hashMap.capacity}`;
    document.getElementById('hashmap-load-pill').innerText = `Load Factor: ${hashMap.getLoadFactor()}`;

    let html = '';
    for (let i = 0; i < hashMap.capacity; i++) {
      const bucket = hashMap.buckets[i];
      const hasChain = bucket.length > 0;

      html += `
        <div class="bucket-card ${hasChain ? 'has-data' : ''}">
          <div class="bucket-header">
            <span>Bucket [${i}]</span>
            <span>${bucket.length} item(s)</span>
          </div>
      `;

      if (!hasChain) {
        html += `<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">(empty slot)</div>`;
      } else {
        bucket.forEach(([key, val]) => {
          html += `
            <div class="chain-item">
              <div class="chain-key">${key}</div>
              <div class="chain-val">$${parseFloat(val.totalAmount).toFixed(2)} (${val.count} exp)</div>
            </div>
          `;
        });
      }

      html += `</div>`;
    }
    grid.innerHTML = html;
  },

  /**
   * Renders Dynamic Array Memory Buffer Cells.
   */
  renderDynamicArrayMemory(dynamicArray) {
    const memoryGrid = document.getElementById('array-memory-grid');
    if (!memoryGrid) return;

    // Metrics
    document.getElementById('dynamic-size-val').innerText = dynamicArray.size;
    document.getElementById('dynamic-cap-val').innerText = dynamicArray.capacity;
    const loadPercent = Math.round((dynamicArray.size / dynamicArray.capacity) * 100);
    document.getElementById('dynamic-load-val').innerText = `${loadPercent}%`;

    let html = '';
    for (let i = 0; i < dynamicArray.capacity; i++) {
      const isOccupied = i < dynamicArray.size;
      const item = isOccupied ? dynamicArray.get(i) : null;

      html += `
        <div class="mem-block ${isOccupied ? 'occupied' : 'empty'}">
          <span class="mem-idx">[${i}]</span>
          <span class="mem-val">${isOccupied ? '$' + Math.round(item.amount) : '&empty;'}</span>
        </div>
      `;
    }
    memoryGrid.innerHTML = html;
  },

  /**
   * Logs dynamic array resizing events to log console.
   */
  logArrayEvent(message, type = 'resize') {
    const logConsole = document.getElementById('array-log-console');
    if (!logConsole) return;

    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.innerHTML = `[${timestamp}] ${message}`;

    logConsole.prepend(entry);
  }
};
