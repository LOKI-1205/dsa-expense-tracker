/**
 * MaxHeap - Binary Max-Heap Implementation for Expense Priority Queue
 * -------------------------------------------------------------------
 * Maintains array representation of a Complete Binary Tree.
 * Property: Every parent node's expense amount is >= its children's amounts.
 * 
 * Time Complexities:
 * - Peek Max: O(1)
 * - Insert: O(log N) [Sift Up]
 * - Extract Max: O(log N) [Sift Down]
 * - Heapify: O(N) [Bottom-Up Construction]
 */
class MaxHeap {
  constructor() {
    this.heap = [];
  }

  // Index formulas
  getParentIndex(i) { return Math.floor((i - 1) / 2); }
  getLeftChildIndex(i) { return 2 * i + 1; }
  getRightChildIndex(i) { return 2 * i + 2; }

  hasParent(i) { return this.getParentIndex(i) >= 0; }
  hasLeftChild(i) { return this.getLeftChildIndex(i) < this.heap.length; }
  hasRightChild(i) { return this.getRightChildIndex(i) < this.heap.length; }

  parent(i) { return this.heap[this.getParentIndex(i)]; }
  leftChild(i) { return this.heap[this.getLeftChildIndex(i)]; }
  rightChild(i) { return this.heap[this.getRightChildIndex(i)]; }

  swap(i1, i2) {
    const temp = this.heap[i1];
    this.heap[i1] = this.heap[i2];
    this.heap[i2] = temp;
  }

  /**
   * Returns highest expense element without removing it in O(1) time.
   */
  peekMax() {
    if (this.heap.length === 0) return null;
    return this.heap[0];
  }

  /**
   * Inserts new expense node into heap in O(log N) time.
   */
  insert(expense) {
    // Clone expense object to ensure clean properties
    const node = { ...expense, amount: parseFloat(expense.amount) };
    this.heap.push(node);
    this.siftUp(this.heap.length - 1);
  }

  /**
   * Sift Up operation to restore max-heap property upwards.
   */
  siftUp(index) {
    let currentIdx = index;
    while (
      this.hasParent(currentIdx) && 
      this.parent(currentIdx).amount < this.heap[currentIdx].amount
    ) {
      const parentIdx = this.getParentIndex(currentIdx);
      this.swap(parentIdx, currentIdx);
      currentIdx = parentIdx;
    }
  }

  /**
   * Extracts and returns the maximum expense in O(log N) time.
   */
  extractMax() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop(); // Replace root with last element
    this.siftDown(0);
    return max;
  }

  /**
   * Sift Down operation to restore max-heap property downwards.
   */
  siftDown(index) {
    let currentIdx = index;

    while (this.hasLeftChild(currentIdx)) {
      let largerChildIdx = this.getLeftChildIndex(currentIdx);

      if (
        this.hasRightChild(currentIdx) &&
        this.rightChild(currentIdx).amount > this.leftChild(currentIdx).amount
      ) {
        largerChildIdx = this.getRightChildIndex(currentIdx);
      }

      if (this.heap[currentIdx].amount >= this.heap[largerChildIdx].amount) {
        break; // Max Heap property satisfied
      }

      this.swap(currentIdx, largerChildIdx);
      currentIdx = largerChildIdx;
    }
  }

  /**
   * Builds Max Heap from an arbitrary array of expenses in O(N) linear time.
   */
  heapify(expensesArray) {
    this.heap = expensesArray.map(exp => ({ ...exp, amount: parseFloat(exp.amount) }));
    // Start from last non-leaf node down to root
    const lastNonLeafIndex = Math.floor((this.heap.length - 2) / 2);
    for (let i = lastNonLeafIndex; i >= 0; i--) {
      this.siftDown(i);
    }
  }

  /**
   * Returns Top K largest expenses without mutating the original heap.
   */
  getTopK(k) {
    // Clone heap array
    const tempHeap = new MaxHeap();
    tempHeap.heap = this.heap.map(node => ({ ...node }));

    const topK = [];
    const limit = Math.min(k, tempHeap.heap.length);

    for (let i = 0; i < limit; i++) {
      const max = tempHeap.extractMax();
      if (max) topK.push(max);
    }

    return topK;
  }

  size() {
    return this.heap.length;
  }

  clear() {
    this.heap = [];
  }
}
