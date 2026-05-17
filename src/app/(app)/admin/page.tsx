import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { AdminSettingsClient } from "./AdminSettingsClient";

const prisma = new PrismaClient();

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return <div>Unauthorized</div>;

  const config = await prisma.systemConfig.findUnique({
    where: { key: 'cycle_windows' }
  });

  const windows = config ? JSON.parse(config.value) : {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E3A5F]">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">Manage system configurations and performance cycles.</p>
      </div>

      <AdminSettingsClient initialWindows={windows} />
    </div>
  );
}
