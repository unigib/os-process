# Anatomy of an OS Process

**University of Gibraltar · CSS45102**

Explore how a process uses memory through two complementary approaches:

1. **Start here: [JavaScript memory playground](#approach-1-javascript-memory-playground).**
   Interactively simulate heap allocations and stack frames in a browser.
2. **Go deeper: [Cutter lab](#approach-2-cutter-lab).** Compile a native C
   program and inspect its memory and execution in a debugger.

## Approach 1: JavaScript memory playground

Open [index.html](index.html) in a browser. No installation, compiler, or server
is required. The playground runs locally and includes a complete reference C
program showing an allocation, recursive calls, and cleanup. That example is
for reading; the simulation does not execute it.

### Try it

1. Select **malloc(64)** to add a 64-byte heap block. Select it again to add
   another block.
2. Select **Call function** to push a recursive function frame onto the stack.
   Call it again to see another frame appear.
3. Select **Return** to remove the most recent frame, then **free()** to release
   the most recently allocated block. Notice that these actions affect different
   regions.
4. Select **Reset simulation** to return to an empty simulated heap and the
   `main()` frame.
5. Read the C example beneath the diagram and match its `malloc()`, recursive
   calls, and `free()` to the controls.

**What to look for:** `malloc()` allocates on the heap, not in the separate
`.data` or `.bss` regions used for static storage. Function calls typically add
stack frames, which are removed when they return.

### Simulation boundaries

The playground illustrates concepts; it does not inspect the browser's memory
or run the C program. The diagram and growth directions are simplified and not
to scale. It allows up to six heap blocks and six additional stack frames, and
`free()` removes the most recent simulated block. Real layouts, stack direction,
allocation sizes, allocator behavior, and addresses depend on the platform and
runtime.

## Approach 2: Cutter lab

For a more in-depth investigation, compile [process_anatomy.c](process_anatomy.c)
and inspect its virtual memory layout using **Cutter**. Observe how the
operating system maps code and data, and examine the stack, heap, and
instruction pointer during execution. This approach requires a C compiler and
Cutter.

---

## Part 1: Prerequisites & Setup

### 1. Install Cutter
Download and install the latest release of Cutter for your OS from [cutter.re](https://cutter.re).
* **Windows:** Extract the `.zip` archive and run `cutter.exe`.
* **macOS:** Open the `.dmg` and drag `Cutter.app` to your Applications folder. *(Note: On first launch, right-click `Cutter.app` -> **Open** to bypass Gatekeeper).*

### 2. Install a C Compiler

#### Windows (Recommended — Single Command via PowerShell)
Open **PowerShell** and run:
```powershell
winget install BrechtSanders.WinLibs.POSIX.UCRT
```
**Close and reopen PowerShell** after installation completes, then verify with `gcc --version`.

*(Alternative Windows Method: If you use MSYS2, open the **MSYS2 UCRT64** app from the Start Menu—not PowerShell—and run `pacman -S --needed base-devel mingw-w64-ucrt-x86_64-toolchain`, then add `C:\msys64\ucrt64\bin` to your Windows `PATH`.)*

#### macOS (Apple Clang)
Open **Terminal** and run:
```bash
xcode-select --install
```

---

## Part 2: Clone and Compile

Clone this repository and compile `process_anatomy.c` **without optimizations** (`-O0`) and **with debug symbols** (`-g`) so the machine code maps cleanly to the C source:

### Windows (PowerShell / CMD)
```cmd
git clone <YOUR_GITHUB_REPO_URL>
cd <REPO_FOLDER>
gcc -g -O0 -fno-omit-frame-pointer process_anatomy.c -o process_anatomy.exe
```

### macOS (Terminal — works on both Intel & Apple Silicon)
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd <REPO_FOLDER>
clang -g -O0 -fno-omit-frame-pointer process_anatomy.c -o process_anatomy
```
*(Compiling locally on macOS automatically signs the binary with `get-task-allow` so Cutter's debugger can attach to it.)*

---

## Part 3: Static Analysis (Before Running)

1. Open Cutter and load your compiled binary (`process_anatomy.exe` or `process_anatomy`).
2. Leave the analysis level at **AAA** and click **OK**.
3. Open **Windows > Info > Sections** (or **Segments**).
4. In the **Functions** panel on the left, double-click `main`.

### Questions to Answer (Static):
1. **Virtual Memory Layout:** List the starting virtual addresses and permissions (`R`, `W`, `X`) for the `.text`, `.data`, and `.bss` segments shown in Cutter. Why does `.text` have Execute (`X`) permission while `.data` does not?
2. **File Size vs. Memory Size:** Compare the **Size** (on disk) vs. **VSize** (virtual size in memory) of the `.bss` section. Explain why they differ.
3. **Strings Inspection:** Open **Windows > Info > Strings**. Which of our markers (`DATA_SEG_MARKER`, `BSS_RUNTIME_DATA`, `HEAP_BLK_ONE_MARKER`) appear in the binary on disk, and which ones are missing? Why?

---

## Part 4: Dynamic Analysis (Live Process Inspection)

1. In Cutter's Disassembly view of `main`, click on the call instruction for `push_stack_frames` and press **`F2`** to set a breakpoint (the line will highlight in red).
2. Start the debugger by clicking **Debug > Start debug** (or press **`F9`**).
3. Look at the console output window where your program printed its runtime memory addresses.

### Questions to Answer (Dynamic):
4. **ASLR (Address Space Layout Randomization):** Compare the address of `main()` printed in your terminal with the static address you saw in Part 3. Did it change? Run the debugger a second time—does the address change again?
5. **Inspecting the Heap:**
   * Copy the printed address of `heap_block_1`.
   * In Cutter, click the **Hexdump** tab (or press `G` to go to an address), paste the `heap_block_1` address, and press Enter.
   * Take a screenshot showing `"HEAP_BLK_ONE_MARKER"` and `"HEAP_BLK_TWO_MARKER"` in memory. How many bytes apart are `heap_block_1` and `heap_block_2`? Why is there extra metadata space between two 64-byte `malloc()` calls?
6. **Watching the Stack Grow:**
   * Press **`F9`** (Continue) until the program pauses inside `push_stack_frames(3)` (or step through the recursive calls using **`F7`** Step Into).
   * Look at the **Registers** panel (`RSP`/`RBP` on Windows/Intel, or `SP`/`FP` on Apple Silicon) and the **Stack** panel.
   * Record the Stack Pointer address at **Level 1**, **Level 2**, and **Level 3**. Does the stack address **increase** or **decrease** as new frames are pushed?
   * Find the ASCII string `"STCK_LVL_3"` in the Stack/Hexdump view and capture a screenshot showing the stacked frames (`STCK_LVL_1`, `STCK_LVL_2`, `STCK_LVL_3`) in memory.

---

## Submission Deliverables
Submit a single PDF or Markdown report containing:
1. Answers to **Questions 1–6**.
2. Annotated screenshots of Cutter showing:
   * The **Sections/Segments** table.
   * The **Hexdump** view of your two Heap allocations.
   * The **Stack** view showing all three recursive stack frames and current Stack Pointer register.
