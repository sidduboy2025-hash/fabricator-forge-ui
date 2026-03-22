import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { FabricatorList, Fabricator } from "@/components/fabricators/FabricatorList";
import { CreateFabricatorDialog } from "@/components/fabricators/CreateFabricatorDialog";
import { useRole } from "@/contexts/RoleContext";
import { Navigate } from "react-router-dom";

// Mock initial data
const initialFabricators: Fabricator[] = [
  {
    id: "FAB-0142",
    name: "Ashok Kumar",
    company: "Ashok Glass & Alu",
    email: "ashok@example.com",
    phone: "+91 98765 43210",
    status: "active",
    projectsCount: 12,
    joinedAt: "2026-01-15",
  },
  {
    id: "FAB-0189",
    name: "Vikram Singh",
    company: "Metro Fabricators",
    email: "vikram@example.com",
    phone: "+91 98765 43211",
    status: "active",
    projectsCount: 5,
    joinedAt: "2026-02-01",
  },
  {
    id: "FAB-0201",
    name: "Raju Bhai",
    company: "Raju Enterprises",
    email: "raju@example.com",
    phone: "+91 98765 43212",
    status: "pending",
    projectsCount: 0,
    joinedAt: "2026-03-20",
  },
];

export default function FabricatorsPage() {
  const { role } = useRole();
  const [fabricators, setFabricators] = useState<Fabricator[]>(initialFabricators);

  // If a fabricator tries to access this page directly, redirect them
  if (role === "FABRICATOR") {
    return <Navigate to="/" replace />;
  }

  const handleCreate = (newFabricator: Fabricator) => {
    setFabricators([newFabricator, ...fabricators]);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <PageHeader 
          title="Fabricators" 
          description="Manage fabricator accounts and view their activity" 
        />
        <CreateFabricatorDialog onAdd={handleCreate} />
      </div>
      
      <FabricatorList data={fabricators} />
    </div>
  );
}
