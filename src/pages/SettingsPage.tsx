import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <PageHeader title="Settings" description="Manage organization preferences and configuration" />

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h3 className="text-sm font-medium">Organization</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Organization Name</label>
            <Input defaultValue="Acme Fabricators" className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Default Region</label>
            <Select defaultValue="south-india">
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="south-india">South India</SelectItem>
                <SelectItem value="north-india">North India</SelectItem>
                <SelectItem value="west-india">West India</SelectItem>
                <SelectItem value="east-india">East India</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h3 className="text-sm font-medium">Notifications</h3>
        <div className="space-y-3">
          {["Low stock alerts", "Payment reminders", "Project updates", "OCR processing complete"].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <span className="text-sm">{item}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </div>

      <Button>Save Changes</Button>
    </div>
  );
}
