-- AlterTable
ALTER TABLE "columns" ALTER COLUMN "position" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "position" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "columns_boardId_position_idx" ON "columns"("boardId", "position");

-- CreateIndex
CREATE INDEX "tasks_columnId_position_idx" ON "tasks"("columnId", "position");
