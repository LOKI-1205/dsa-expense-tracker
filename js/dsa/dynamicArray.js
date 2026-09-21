/**
 * DynamicArray - Custom Data Structure Implementation
 * ----------------------------------------------------
 * Simulates low-level resizable contiguous memory array.
 * Time Complexities:
 * - Access by Index: O(1)
 * - Push (Append): Amortized O(1) [O(N) on capacity expansion resize]
 * - Remove / Pop: O(1) or O(N) when shifting elements
 * - Search: O(N)
 */
class DynamicArray {
  constructor(initialCapacity = 8, onResizeCallback = null) {
    this.capacity = Math.max(4, initialCapacity);
    this.size = 0;
    this.buffer = new Array(this.capacity);
    this.onResizeCallback = onResizeCallback;
  }

  /**
   * Appends an element to the dynamic array buffer.
   * If size reaches capacity, resizes by doubling capacity (2x strategy).
   */
  push(item) {
    if (this.size >= this.capacity) {
      this._resize(this.capacity * 2);
    }
    this.buffer[this.size] = item;
    this.size++;
    return this.size;
  }

  /**
   * Retrieves element at specified index in O(1) time.
   */
  get(index) {
    if (index < 0 || index >= this.size) {
      throw new IndexOutOfBoundsException(`Index ${index} out of bounds for size ${this.size}`);
    }
    return this.buffer[index];
  }

  /**
   * Updates element at specified index.
   */
  set(index, item) {
    if (index < 0 || index >= this.size) {
      throw new Error(`Index ${index} out of bounds`);
    }
    this.buffer[index] = item;
  }

  /**
   * Removes element at specific index, shifting remaining elements left in O(N) time.
   */
  removeAt(index) {
    if (index < 0 || index >= this.size) return null;
    const removedItem = this.buffer[index];

    for (let i = index; i < this.size - 1; i++) {
      this.buffer[i] = this.buffer[i + 1];
    }

    this.size--;
    this.buffer[this.size] = undefined; // Clear reference

    // Shrink array if size drops to 1/4 of capacity to optimize memory
    if (this.size > 0 && this.size <= Math.floor(this.capacity / 4) && Math.floor(this.capacity / 2) >= 4) {
      this._resize(Math.floor(this.capacity / 2));
    }

    return removedItem;
  }

  /**
   * Internal resize routine that allocates new contiguous memory buffer and copies elements.
   */
  _resize(newCapacity) {
    const oldCapacity = this.capacity;
    this.capacity = newCapacity;
    const newBuffer = new Array(newCapacity);

    for (let i = 0; i < this.size; i++) {
      newBuffer[i] = this.buffer[i];
    }

    this.buffer = newBuffer;

    if (typeof this.onResizeCallback === 'function') {
      this.onResizeCallback(oldCapacity, newCapacity, this.size);
    }
  }

  /**
   * Returns standard JS Array clone of valid active size elements.
   */
  toArray() {
    const result = [];
    for (let i = 0; i < this.size; i++) {
      result.push(this.buffer[i]);
    }
    return result;
  }

  /**
   * Clears the array.
   */
  clear() {
    this.size = 0;
    this.capacity = 8;
    this.buffer = new Array(this.capacity);
  }

  /**
   * High-order helper: filter elements returning a new DynamicArray instance.
   */
  filter(predicate) {
    const filtered = new DynamicArray();
    for (let i = 0; i < this.size; i++) {
      if (predicate(this.buffer[i], i)) {
        filtered.push(this.buffer[i]);
      }
    }
    return filtered;
  }

  /**
   * High-order helper: sort in-place using compare function.
   */
  sort(compareFn) {
    const validArr = this.toArray();
    validArr.sort(compareFn);
    for (let i = 0; i < validArr.length; i++) {
      this.buffer[i] = validArr[i];
    }
  }
}
