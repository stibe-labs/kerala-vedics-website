import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultant Portal – Kerala Vedics",
  description: "Kerala Vedics Ayurvedic Vaidya Portal. Register, manage your schedule, and conduct consultations.",
};

export default function ConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="consultant-portal">
      {children}
    </div>
  );
}
