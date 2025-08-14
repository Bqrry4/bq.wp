#include <assert.h>
#include <stdio.h>

/* path file*/
int main(int argc, char** argv) {

    assert(argc == 2);

    FILE* file = fopen(argv[1], "r");
    assert(file != NULL);

    char line[256];
    while (fgets(line, sizeof(line), file)) {
        fputs(line, stdout);
    }

    return 0;
}
