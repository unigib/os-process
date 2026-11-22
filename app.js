"use strict";

// These limits and sizes are teaching aids, not properties of real processes.
const MAX_BLOCKS = 6;
const MAX_CALLS = 6;
const BLOCK_BYTES = 64;

const elements = {
  malloc: document.getElementById("malloc"),
  free: document.getElementById("free"),
  call: document.getElementById("call"),
  return: document.getElementById("return"),
  reset: document.getElementById("reset"),
  heapBlocks: document.getElementById("heap-blocks"),
  stackFrames: document.getElementById("stack-frames"),
  heapCount: document.getElementById("heap-count"),
  stackCount: document.getElementById("stack-count"),
  activityTitle: document.getElementById("activity-title-text"),
  activityDetail: document.getElementById("activity-detail")
};

let blocks = [];
let calls = 0;
let nextBlockId = 1;

function memoryItem(label, detail, className) {
  const item = document.createElement("div");
  item.className = `memory-item ${className}`;
  const name = document.createElement("span");
  name.textContent = label;
  const info = document.createElement("span");
  info.className = "item-detail";
  info.textContent = detail;
  item.append(name, info);
  return item;
}

function render() {
  elements.heapBlocks.replaceChildren(...blocks.map(block =>
    memoryItem(`block ${block}`, `${BLOCK_BYTES} bytes`, "heap-item")
  ));
  const frames = [memoryItem("main()", "base frame", "stack-item")];
  for (let level = 1; level <= calls; level++) {
    frames.push(memoryItem(`push_stack_frames(${level})`, `level ${level}`, "stack-item"));
  }
  elements.stackFrames.replaceChildren(...frames);
  elements.heapCount.textContent = `${blocks.length * BLOCK_BYTES} BYTES`;
  elements.stackCount.textContent = `${calls + 1} ${calls === 0 ? "FRAME" : "FRAMES"}`;
  elements.malloc.disabled = blocks.length === MAX_BLOCKS;
  elements.free.disabled = blocks.length === 0;
  elements.call.disabled = calls === MAX_CALLS;
  elements.return.disabled = calls === 0;
}

function announce(title, detail) {
  elements.activityTitle.textContent = title;
  elements.activityDetail.textContent = detail;
}

elements.malloc.addEventListener("click", () => {
  if (blocks.length >= MAX_BLOCKS) return;
  const block = nextBlockId++;
  blocks.push(block);
  render();
  announce(`Allocated block ${block}`, `malloc(64) added 64 bytes to the simulated heap. The data and BSS segments did not change.`);
});

elements.free.addEventListener("click", () => {
  if (blocks.length === 0) return;
  const block = blocks.pop();
  render();
  announce(`Freed block ${block}`, "The most recent allocation is no longer in use. Real allocators may keep freed memory for reuse.");
});

elements.call.addEventListener("click", () => {
  if (calls >= MAX_CALLS) return;
  calls++;
  render();
  announce(`Called level ${calls}`, "A new function frame was pushed onto the stack. In this model, the stack grows toward lower addresses.");
});

elements.return.addEventListener("click", () => {
  if (calls === 0) return;
  const level = calls--;
  render();
  announce(`Returned from level ${level}`, "The most recent function frame was removed from the stack. Heap allocations are unchanged.");
});

elements.reset.addEventListener("click", () => {
  blocks = [];
  calls = 0;
  nextBlockId = 1;
  render();
  announce("Simulation reset", "The heap is empty and only the main() frame remains. Try making another move.");
});

render();
