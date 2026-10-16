import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { sendWorkerDecision, sendWorkerScheduleInterview } from "@/app/services/email/sender";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const admin = await getSessionUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "ADMIN_SESSION_REQUIRED" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();
    const allowedStatuses = ["PENDING_VERIFICATION", "INTERVIEW_SCHEDULED", "APPROVED", "REJECTED", "SUSPENDED"];
    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "WORKER_STATUS_INVALID" }, { status: 400 });
    }
    const adminNotes = typeof body.adminNotes === "string" ? body.adminNotes.trim() : "";
    const meetingLink = typeof body.meetingLink === "string" ? body.meetingLink.trim() : "";
    if (body.status === "INTERVIEW_SCHEDULED" && !meetingLink) {
      return NextResponse.json({ error: "MEETING_LINK_REQUIRED" }, { status: 400 });
    }

    const worker = await prisma.worker.update({
      where: { id },
      data: {
        status: body.status,
        adminNotes: adminNotes || null,
        meetingLink: meetingLink || null,
      },
      include: { user: { select: { email: true, name: true } } },
    });

    if (worker.status === "INTERVIEW_SCHEDULED") {
      sendWorkerScheduleInterview(
        worker.user.email,
        worker.user.name,
        worker.meetingLink || "",
        new Date().toLocaleString(),
      ).catch((error) => console.error("Worker interview notification failed:", error));
    } else if (worker.status === "APPROVED" || worker.status === "REJECTED") {
      sendWorkerDecision(worker.user.email, worker.user.name, worker.status === "APPROVED", worker.adminNotes || undefined)
        .catch((error) => console.error("Worker decision notification failed:", error));
    }

    return NextResponse.json({ workerId: worker.id, status: worker.status });
  } catch (error) {
    console.error("Worker application status could not be updated:", error);
    return NextResponse.json({ error: "WORKER_STATUS_UPDATE_FAILURE" }, { status: 500 });
  }
}
