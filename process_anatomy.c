#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// 1. INITIALIZED DATA SEGMENT (.data)
// Stored directly inside the binary on disk and loaded into read/write memory.
unsigned int global_magic = 0xCAFEBABE;
char global_data_tag[] = "DATA_SEG_MARKER";

// 2. UNINITIALIZED DATA SEGMENT (.bss)
// Takes zero space in the file on disk; OS zeroes it out at runtime.
char global_bss_buffer[128];

void pause_for_inspection(const char *stage_name) {
    printf("\n[PAUSE] Stage: %s\n", stage_name);
    printf("        Inspect memory in Cutter now, then press ENTER in terminal to continue...");
    fflush(stdout);
    getchar();
}

// 3. STACK SEGMENT (Grows downward on x86_64 and ARM64)
void push_stack_frames(int level) {
    // Local variables live inside the current function's Stack Frame
    char stack_tag[16];
    snprintf(stack_tag, sizeof(stack_tag), "STCK_LVL_%d", level);
    unsigned int local_marker = 0x11110000 + level;

    printf("  -> Stack Frame %d | Tag Addr: %p | Marker: 0x%X\n",
           level, (void*)stack_tag, local_marker);

    if (level < 3) {
        push_stack_frames(level + 1); // Recursive call pushes a new frame
    } else {
        pause_for_inspection("Deepest Stack Frame (Level 3)");
    }
}

int main(void) {
    printf("=== OS PROCESS MEMORY ANATOMY LAB ===\n\n");

    // Populate .bss at runtime
    strcpy(global_bss_buffer, "BSS_RUNTIME_DATA");

    // 4. HEAP SEGMENT (Dynamically allocated via OS allocator)
    char *heap_block_1 = (char *)malloc(64);
    char *heap_block_2 = (char *)malloc(64);

    if (!heap_block_1 || !heap_block_2) {
        fprintf(stderr, "Heap allocation failed.\n");
        return 1;
    }

    strcpy(heap_block_1, "HEAP_BLK_ONE_MARKER");
    strcpy(heap_block_2, "HEAP_BLK_TWO_MARKER");

    // Print virtual memory map for student verification
    printf("1. CODE (.text)  main() address : %p\n", (void*)main);
    printf("2. DATA (.data)  global_magic   : %p (Value: 0x%X)\n", (void*)&global_magic, global_magic);
    printf("3. BSS  (.bss)   global_bss     : %p (Value: %s)\n", (void*)global_bss_buffer, global_bss_buffer);
    printf("4. HEAP          heap_block_1   : %p (Value: %s)\n", (void*)heap_block_1, heap_block_1);
    printf("                 heap_block_2   : %p (Value: %s)\n\n", (void*)heap_block_2, heap_block_2);

    pause_for_inspection("Heap & Globals Initialized (Before Stack Growth)");

    printf("\n5. STACK GROWTH:\n");
    push_stack_frames(1);

    // Clean up heap memory
    free(heap_block_1);
    free(heap_block_2);

    printf("\nProgram finished cleanly.\n");
    return 0;
}
