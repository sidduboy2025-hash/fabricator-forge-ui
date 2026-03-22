import { useNavigate } from "react-router-dom";
import { useRole, Role } from "@/contexts/RoleContext";
import { ShieldCheck, Users, Hammer } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const handleRoleSelection = (role: Role) => {
    setRole(role);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome to Fabricator Forge</h1>
          <p className="text-lg text-muted-foreground">Please select your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {/* Admin Role Card */}
          <div 
            onClick={() => handleRoleSelection('ADMIN')}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border bg-card hover:bg-accent hover:border-primary shadow-sm active:scale-95 transition-all cursor-pointer group"
          >
            <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Admin</h2>
            <p className="text-sm text-center text-muted-foreground">Manage the entire ecosystem, users, and global settings.</p>
          </div>

          {/* Distributor Role Card */}
          <div 
            onClick={() => handleRoleSelection('DISTRIBUTOR')}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border bg-card hover:bg-accent hover:border-primary shadow-sm active:scale-95 transition-all cursor-pointer group"
          >
            <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Distributor</h2>
            <p className="text-sm text-center text-muted-foreground">Manage fabricators, orders, inventory, and supply chain.</p>
          </div>

          {/* Fabricator Role Card */}
          <div 
            onClick={() => handleRoleSelection('FABRICATOR')}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border bg-card hover:bg-accent hover:border-primary shadow-sm active:scale-95 transition-all cursor-pointer group"
          >
            <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
              <Hammer className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Fabricator</h2>
            <p className="text-sm text-center text-muted-foreground">Optimize cuts, manage projects, and handle operations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
