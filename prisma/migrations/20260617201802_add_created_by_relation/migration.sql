-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "created_by_id" INTEGER;

-- AlterTable
ALTER TABLE "passenger" ADD COLUMN     "created_by_id" INTEGER;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "sys_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger" ADD CONSTRAINT "passenger_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "sys_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
