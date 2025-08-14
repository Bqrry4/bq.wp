#include <assert.h>
#include <stdio.h>

/* path file content */
int main(int argc, char** argv) {

    assert(argc == 2);

    FILE* file = fopen(argv[1], "w");
    assert(file != NULL);

    char line[256];
    while (fgets(line, sizeof(line), file)) {
        fputs(line, stdout);
    }

    return 0;
}

int main() {
  FILE* file = fopen("/tmp/output.txt", "w");
  assert(file != NULL);

  int nwritten = fprintf(file, "%s", message);
  assert(nwritten == strlen(message));
  int r = fclose(file);
  assert(r == 0);
}
